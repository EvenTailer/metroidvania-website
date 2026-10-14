import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { readJson } from '../../shared/lib/readJson';
import { timerElapsedMs } from './focusTimer';
import { defaultWeekTitle, isIsoDate, mondayOf, mondayOfIso, addDays } from './weekDates';
import {
  DEFAULT_FOCUS_TIMER,
  DEFAULT_WEEKLY_PLAN,
  PlanItemPatch,
  PlannedItem,
  WeekdayKey,
  WeeklyBigGoal,
  WeeklyPlanState,
  WeeklyRetro,
  WeeklyWeekSnapshot,
  blankBigThree,
  emptyDays,
  emptyRetro
} from './types';

function copyGoals(goals: WeeklyBigGoal[]): WeeklyWeekSnapshot['bigThree'] {
  const [a, b, c] = goals;
  return [
    { ...(a || blankBigThree()[0]) },
    { ...(b || blankBigThree()[1]) },
    { ...(c || blankBigThree()[2]) }
  ];
}

function copyDays(days: Partial<Record<WeekdayKey, PlannedItem[]>> | undefined): WeeklyWeekSnapshot['days'] {
  const next = emptyDays();
  (Object.keys(next) as WeekdayKey[]).forEach(key => {
    next[key] = Array.isArray(days?.[key]) ? days![key]!.map(item => ({ ...item })) : [];
  });
  return next;
}

function snapshotOf(source: {
  weekTitle?: string;
  bigThree?: WeeklyBigGoal[];
  days?: Partial<Record<WeekdayKey, PlannedItem[]>>;
  retro?: Partial<WeeklyRetro>;
}, titleFallback: string): WeeklyWeekSnapshot {
  return {
    weekTitle: source.weekTitle?.trim() || titleFallback,
    bigThree: Array.isArray(source.bigThree) && source.bigThree.length === 3
      ? copyGoals(source.bigThree)
      : blankBigThree(),
    days: copyDays(source.days),
    retro: { ...emptyRetro(), ...(source.retro || {}) }
  };
}

function freshWeek(weekStart: string, goals?: WeeklyBigGoal[]): WeeklyWeekSnapshot {
  return {
    weekTitle: defaultWeekTitle(weekStart),
    bigThree: goals ? copyGoals(goals) : blankBigThree(),
    days: emptyDays(),
    retro: emptyRetro()
  };
}

function weekHasContent(snap: WeeklyWeekSnapshot, weekStart: string): boolean {
  const tasks = Object.values(snap.days).some(list => list.length > 0);
  const goals = snap.bigThree.some(goal => goal.done || goal.text.trim().length > 0);
  const notes = [snap.retro.wentWell, snap.retro.blockers, snap.retro.learnings];
  const retro = snap.retro.rating > 0 || notes.some(text => text.trim().length > 0);
  return tasks || goals || retro || snap.weekTitle.trim() !== defaultWeekTitle(weekStart);
}

function sweepArchive(archive: Record<string, WeeklyWeekSnapshot>) {
  Object.keys(archive).forEach(key => {
    if (!weekHasContent(archive[key], key)) delete archive[key];
  });
}

function pauseTimer(state: WeeklyPlanState, now: number) {
  if (state.timer.running && state.timer.runStartedAt != null) {
    state.timer.elapsedMs += Math.max(0, now - state.timer.runStartedAt);
  }
  state.timer.running = false;
  state.timer.runStartedAt = null;
  state.timer.selectedTaskKey = '';
}

export function migrateWeeklyPlan(raw: unknown): WeeklyPlanState {
  if (!raw || typeof raw !== 'object') return { ...DEFAULT_WEEKLY_PLAN, days: emptyDays(), timer: { ...DEFAULT_FOCUS_TIMER } };
  const data = raw as Partial<WeeklyPlanState>;
  if (!data.days || !Array.isArray(data.bigThree)) {
    return { ...DEFAULT_WEEKLY_PLAN, days: emptyDays(), timer: { ...DEFAULT_FOCUS_TIMER } };
  }
  const weekStart = isIsoDate(data.weekStart) ? mondayOfIso(data.weekStart) : mondayOf(new Date());
  const active = snapshotOf(data, data.weekTitle || DEFAULT_WEEKLY_PLAN.weekTitle);
  const archive: Record<string, WeeklyWeekSnapshot> = {};
  if (data.archive && typeof data.archive === 'object') {
    Object.entries(data.archive).forEach(([key, value]) => {
      if (!isIsoDate(key) || !value) return;
      const monday = mondayOfIso(key);
      if (monday === weekStart) return;
      archive[monday] = snapshotOf(value, defaultWeekTitle(monday));
    });
    sweepArchive(archive);
  }
  const timerRaw = data.timer;
  const timer = {
    ...DEFAULT_FOCUS_TIMER,
    ...(timerRaw || {}),
    running: Boolean(timerRaw?.running && typeof timerRaw.runStartedAt === 'number'),
    runStartedAt: typeof timerRaw?.runStartedAt === 'number' ? timerRaw.runStartedAt : null,
    elapsedMs: typeof timerRaw?.elapsedMs === 'number' ? timerRaw.elapsedMs : 0,
    targetMinutes: typeof timerRaw?.targetMinutes === 'number' ? timerRaw.targetMinutes : 25,
    selectedTaskKey: typeof timerRaw?.selectedTaskKey === 'string' ? timerRaw.selectedTaskKey : ''
  };
  return {
    weekStart,
    weekTitle: active.weekTitle,
    bigThree: active.bigThree,
    days: active.days,
    retro: active.retro,
    archive,
    timer
  };
}

function loadWeeklyPlan(): WeeklyPlanState {
  return migrateWeeklyPlan(readJson<unknown>('mv4_weekly_plan', DEFAULT_WEEKLY_PLAN));
}

function rememberActive(state: WeeklyPlanState) {
  const snap = snapshotOf(state, state.weekTitle);
  if (!weekHasContent(snap, state.weekStart)) {
    delete state.archive[state.weekStart];
    return;
  }
  state.archive[state.weekStart] = snap;
}

function adopt(state: WeeklyPlanState, weekStart: string, snap: WeeklyWeekSnapshot) {
  state.weekStart = weekStart;
  state.weekTitle = snap.weekTitle;
  state.bigThree = snap.bigThree;
  state.days = snap.days;
  state.retro = snap.retro;
  delete state.archive[weekStart];
}

const weeklyPlanSlice = createSlice({
  name: 'weeklyPlan',
  initialState: loadWeeklyPlan(),
  reducers: {
    planItemAdded(state, action: PayloadAction<{ day: WeekdayKey; item: PlannedItem }>) {
      const { day, item } = action.payload;
      if (!state.days[day]) state.days[day] = [];
      state.days[day].push(item);
    },
    planItemToggled(state, action: PayloadAction<{ day: WeekdayKey; itemId: string }>) {
      const target = state.days[action.payload.day]?.find(it => it.id === action.payload.itemId);
      if (target) target.done = !target.done;
    },
    planItemRemoved(state, action: PayloadAction<{ day: WeekdayKey; itemId: string }>) {
      const { day, itemId } = action.payload;
      if (state.days[day]) state.days[day] = state.days[day].filter(it => it.id !== itemId);
    },
    planItemUpdated(state, action: PayloadAction<{ day: WeekdayKey; itemId: string; patch: PlanItemPatch }>) {
      const item = state.days[action.payload.day]?.find(it => it.id === action.payload.itemId);
      if (!item) return;
      const patch = action.payload.patch;
      if (patch.title !== undefined) {
        const clean = patch.title.trim();
        if (clean) item.title = clean;
      }
      if (patch.category) item.category = patch.category;
      if (patch.estimatedMinutes !== undefined) {
        if (patch.estimatedMinutes && patch.estimatedMinutes > 0) item.estimatedMinutes = patch.estimatedMinutes;
        else delete item.estimatedMinutes;
      }
      if (patch.goalIndex !== undefined) {
        if (patch.goalIndex === null) delete item.goalIndex;
        else item.goalIndex = patch.goalIndex;
      }
    },
    planItemMoved(state, action: PayloadAction<{ fromDay: WeekdayKey; toDay: WeekdayKey; itemId: string }>) {
      const { fromDay, toDay, itemId } = action.payload;
      if (!state.days[fromDay] || !state.days[toDay]) return;
      const itemIndex = state.days[fromDay].findIndex(it => it.id === itemId);
      if (itemIndex < 0) return;
      const [item] = state.days[fromDay].splice(itemIndex, 1);
      state.days[toDay].push(item);
    },
    planItemTimeLogged(state, action: PayloadAction<{ day: WeekdayKey; itemId: string; minutes: number }>) {
      const item = state.days[action.payload.day]?.find(it => it.id === action.payload.itemId);
      if (item && action.payload.minutes > 0) {
        item.spentMinutes = (item.spentMinutes || 0) + action.payload.minutes;
      }
    },
    bigGoalUpdated(state, action: PayloadAction<{ index: number; text: string }>) {
      if (state.bigThree[action.payload.index]) state.bigThree[action.payload.index].text = action.payload.text;
    },
    bigGoalToggled(state, action: PayloadAction<{ index: number }>) {
      const goal = state.bigThree[action.payload.index];
      if (goal) goal.done = !goal.done;
    },
    retroUpdated(state, action: PayloadAction<Partial<WeeklyRetro>>) {
      state.retro = { ...state.retro, ...action.payload };
    },
    weekTitleUpdated(state, action: PayloadAction<string>) {
      state.weekTitle = action.payload;
    },
    weekActivated(state, action: PayloadAction<{ weekStart: string; now: number }>) {
      const target = mondayOfIso(action.payload.weekStart);
      if (target === state.weekStart) return;
      pauseTimer(state, action.payload.now);
      sweepArchive(state.archive);
      rememberActive(state);
      const stored = state.archive[target];
      adopt(state, target, stored ? snapshotOf(stored, defaultWeekTitle(target)) : freshWeek(target));
    },
    weekReset(state, action: PayloadAction<{ keepGoals?: boolean; now: number } | undefined>) {
      const keep = action.payload?.keepGoals ?? false;
      const now = action.payload?.now ?? Date.now();
      const goals = keep ? copyGoals(state.bigThree) : undefined;
      const next = addDays(state.weekStart, 7);
      pauseTimer(state, now);
      sweepArchive(state.archive);
      rememberActive(state);
      const stored = state.archive[next];
      if (stored) adopt(state, next, snapshotOf(stored, defaultWeekTitle(next)));
      else adopt(state, next, freshWeek(next, goals));
    },
    focusTimerPreset(state, action: PayloadAction<number>) {
      const minutes = action.payload;
      if (!Number.isFinite(minutes) || minutes <= 0) return;
      state.timer.running = false;
      state.timer.runStartedAt = null;
      state.timer.elapsedMs = 0;
      state.timer.targetMinutes = minutes;
    },
    focusTimerToggled(state, action: PayloadAction<number>) {
      const now = action.payload;
      if (state.timer.running && state.timer.runStartedAt != null) {
        state.timer.elapsedMs += Math.max(0, now - state.timer.runStartedAt);
        state.timer.running = false;
        state.timer.runStartedAt = null;
        return;
      }
      const targetMs = state.timer.targetMinutes * 60_000;
      if (state.timer.elapsedMs >= targetMs) state.timer.elapsedMs = 0;
      state.timer.running = true;
      state.timer.runStartedAt = now;
    },
    focusTimerReset(state) {
      state.timer.running = false;
      state.timer.runStartedAt = null;
      state.timer.elapsedMs = 0;
    },
    focusTimerExtended(state) {
      state.timer.targetMinutes += 5;
    },
    focusTimerShortened(state, action: PayloadAction<number>) {
      const elapsed = timerElapsedMs(state.timer, action.payload);
      const minMinutes = Math.max(5, Math.ceil(elapsed / 60_000));
      state.timer.targetMinutes = Math.max(minMinutes, state.timer.targetMinutes - 5);
    },
    focusTimerTaskSelected(state, action: PayloadAction<string>) {
      state.timer.selectedTaskKey = action.payload;
    },
    focusTimerCompleted(state) {
      if (!state.timer.running) return;
      state.timer.elapsedMs = state.timer.targetMinutes * 60_000;
      state.timer.running = false;
      state.timer.runStartedAt = null;
    },
    weeklyPlanReplaced(_state, action: PayloadAction<WeeklyPlanState>) {
      return action.payload;
    }
  }
});

export const {
  planItemAdded,
  planItemToggled,
  planItemRemoved,
  planItemUpdated,
  planItemMoved,
  planItemTimeLogged,
  bigGoalUpdated,
  bigGoalToggled,
  retroUpdated,
  weekTitleUpdated,
  weekActivated,
  weekReset,
  focusTimerPreset,
  focusTimerToggled,
  focusTimerReset,
  focusTimerExtended,
  focusTimerShortened,
  focusTimerTaskSelected,
  focusTimerCompleted,
  weeklyPlanReplaced
} = weeklyPlanSlice.actions;

export const weeklyPlanReducer = weeklyPlanSlice.reducer;
