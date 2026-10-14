import { ThunkAction, ThunkDispatch, UnknownAction } from '@reduxjs/toolkit';
import {
  GoalIndex,
  PlanItemPatch,
  PlannedItem,
  WEEKDAYS_META,
  WeekdayKey,
  WeeklyRetro,
  bigGoalToggled,
  bigGoalUpdated,
  focusTimerCompleted,
  focusTimerExtended,
  focusTimerShortened,
  focusTimerPreset,
  focusTimerReset,
  focusTimerTaskSelected,
  focusTimerToggled,
  planItemAdded,
  planItemMoved,
  planItemRemoved,
  planItemTimeLogged,
  planItemToggled,
  planItemUpdated,
  retroUpdated,
  weekActivated,
  weekReset,
  weekTitleUpdated
} from '../../entities/weekly-plan';
import { elapsedMinutesToLog } from '../../entities/weekly-plan/focusTimer';
import { Task, TaskCategory, taskStatusSet } from '../../entities/task';
import type { RootState } from '../store';
import { toastShown } from './uiSlice';

type HubDispatch = ThunkDispatch<RootState, undefined, UnknownAction>;
type HubThunk = ThunkAction<void, RootState, undefined, UnknownAction>;

function dayAccusative(day: WeekdayKey): string {
  return WEEKDAYS_META.find(meta => meta.key === day)?.accusative || day;
}

function splitTaskKey(key: string): { day: WeekdayKey; itemId: string } | null {
  const [day, itemId] = key.split(':');
  if (!itemId || !WEEKDAYS_META.some(meta => meta.key === day)) return null;
  return { day: day as WeekdayKey, itemId };
}

export const addWeeklyPlanItem = (
  day: WeekdayKey,
  title: string,
  category: TaskCategory,
  taskId?: string,
  estimatedMinutes?: number,
  goalIndex?: GoalIndex
): HubThunk => (dispatch) => {
  const clean = title.trim();
  if (!clean) return;
  const item: PlannedItem = {
    id: 'wp-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
    title: clean,
    category,
    done: false,
    ...(taskId ? { taskId } : {}),
    ...(estimatedMinutes && estimatedMinutes > 0 ? { estimatedMinutes } : {}),
    ...(goalIndex !== undefined ? { goalIndex } : {})
  };
  dispatch(planItemAdded({ day, item }));
  dispatch(toastShown('Задача добавлена в план дня'));
};

export const scheduleTaskToDay = (task: Task, day: WeekdayKey): HubThunk => (dispatch, getState) => {
  const state = getState();
  const alreadyInDay = Object.values(state.weeklyPlan.days).some(list =>
    list.some(it => it.taskId === task.id)
  );
  if (alreadyInDay) {
    dispatch(toastShown('Эта задача уже есть в плане недели'));
    return;
  }
  const item: PlannedItem = {
    id: 'wp-' + Date.now(),
    taskId: task.id,
    title: task.title,
    category: task.category,
    done: task.status === 'done'
  };
  dispatch(planItemAdded({ day, item }));
  if (task.status === 'backlog') {
    dispatch(taskStatusSet({ id: task.id, status: 'in-progress' }));
  }
  dispatch(toastShown(`Задача запланирована на ${dayAccusative(day)}`));
};

export const toggleWeeklyPlanItem = (day: WeekdayKey, itemId: string): HubThunk => (dispatch, getState) => {
  const state = getState();
  const item = state.weeklyPlan.days[day]?.find(it => it.id === itemId);
  if (!item) return;
  const willBeDone = !item.done;
  dispatch(planItemToggled({ day, itemId }));
  if (item.taskId) {
    const linked = state.tasks.items.find(t => t.id === item.taskId);
    if (linked) {
      dispatch(taskStatusSet({ id: linked.id, status: willBeDone ? 'done' : 'in-progress' }));
    }
  }
  dispatch(toastShown(willBeDone ? 'Задача дня выполнена' : 'Задача возвращена в работу'));
};

export const removeWeeklyPlanItem = (day: WeekdayKey, itemId: string): HubThunk => (dispatch) => {
  dispatch(planItemRemoved({ day, itemId }));
  dispatch(toastShown('Задача убрана из плана'));
};

export const updateWeeklyPlanItem = (day: WeekdayKey, itemId: string, patch: PlanItemPatch): HubThunk => (dispatch) => {
  dispatch(planItemUpdated({ day, itemId, patch }));
};

export const moveWeeklyPlanItem = (fromDay: WeekdayKey, toDay: WeekdayKey, itemId: string): HubThunk => (dispatch) => {
  dispatch(planItemMoved({ fromDay, toDay, itemId }));
  dispatch(toastShown('Задача перенесена'));
};

export const logWeeklyPlanItemTime = (day: WeekdayKey, itemId: string, minutes: number): HubThunk => (dispatch, getState) => {
  const item = getState().weeklyPlan.days[day]?.find(it => it.id === itemId);
  if (!item || minutes <= 0) {
    dispatch(toastShown('Не удалось записать время'));
    return;
  }
  dispatch(planItemTimeLogged({ day, itemId, minutes }));
  dispatch(toastShown(`Учтено +${minutes} мин`));
};

export const updateWeeklyBigGoal = (index: number, text: string): HubThunk => (dispatch) => {
  dispatch(bigGoalUpdated({ index, text }));
};

export const toggleWeeklyBigGoal = (index: number): HubThunk => (dispatch) => {
  dispatch(bigGoalToggled({ index }));
};

export const updateWeeklyRetro = (patch: Partial<WeeklyRetro>): HubThunk => (dispatch) => {
  dispatch(retroUpdated(patch));
  dispatch(toastShown('Ретроспектива сохранена'));
};

export const updateWeeklyTitle = (title: string): HubThunk => (dispatch) => {
  dispatch(weekTitleUpdated(title));
};

export const resetWeeklyPlan = (keepGoals = false): HubThunk => (dispatch) => {
  dispatch(weekReset({ keepGoals, now: Date.now() }));
  dispatch(toastShown(keepGoals
    ? 'Неделя сохранена. Следующая открыта, цели перенесены'
    : 'Неделя сохранена в календаре. Открыта следующая'));
};

export const selectWeeklyWeek = (weekStart: string): HubThunk => (dispatch) => {
  dispatch(weekActivated({ weekStart, now: Date.now() }));
};

export const setFocusPreset = (minutes: number): HubThunk => (dispatch) => {
  dispatch(focusTimerPreset(minutes));
};

export const toggleFocusTimer = (): HubThunk => (dispatch) => {
  dispatch(focusTimerToggled(Date.now()));
};

export const resetFocusTimer = (): HubThunk => (dispatch) => {
  dispatch(focusTimerReset());
};

export const extendFocusTimer = (): HubThunk => (dispatch) => {
  dispatch(focusTimerExtended());
  dispatch(toastShown('+5 минут к сессии'));
};

export const shortenFocusTimer = (): HubThunk => (dispatch, getState) => {
  const before = getState().weeklyPlan.timer.targetMinutes;
  dispatch(focusTimerShortened(Date.now()));
  if (getState().weeklyPlan.timer.targetMinutes < before) {
    dispatch(toastShown('-5 минут от сессии'));
  }
};

export const selectFocusTask = (taskKey: string): HubThunk => (dispatch) => {
  dispatch(focusTimerTaskSelected(taskKey));
};

function logMinutes(
  dispatch: HubDispatch,
  getState: () => RootState,
  day: WeekdayKey,
  itemId: string,
  minutes: number
): boolean {
  const item = getState().weeklyPlan.days[day]?.find(it => it.id === itemId);
  if (!item || minutes <= 0) {
    dispatch(toastShown('Не удалось записать время'));
    return false;
  }
  dispatch(planItemTimeLogged({ day, itemId, minutes }));
  dispatch(toastShown(`Учтено +${minutes} мин`));
  return true;
}

export const logFocusElapsed = (): HubThunk => (dispatch, getState) => {
  const timer = getState().weeklyPlan.timer;
  const minutes = elapsedMinutesToLog(timer, Date.now());
  if (!timer.selectedTaskKey) {
    dispatch(toastShown('Сначала выберите задачу'));
    return;
  }
  if (minutes <= 0) {
    dispatch(toastShown('Сначала запустите таймер'));
    return;
  }
  const target = splitTaskKey(timer.selectedTaskKey);
  if (!target) return;
  if (logMinutes(dispatch, getState, target.day, target.itemId, minutes)) {
    dispatch(focusTimerReset());
  }
};

export const completeFocusSession = (): HubThunk => (dispatch, getState) => {
  const timer = getState().weeklyPlan.timer;
  if (!timer.running) return;
  const key = timer.selectedTaskKey;
  const minutes = timer.targetMinutes;
  dispatch(focusTimerCompleted());
  const target = splitTaskKey(key);
  if (!target) {
    dispatch(toastShown('Сессия закончилась. Выберите задачу и запишите время'));
    return;
  }
  if (logMinutes(dispatch, getState, target.day, target.itemId, minutes)) {
    dispatch(focusTimerReset());
  }
};
