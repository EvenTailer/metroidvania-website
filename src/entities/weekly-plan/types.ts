import type { TaskCategory } from '../task';
import { mondayOf } from './weekDates';

export type WeekdayKey = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';
export type GoalIndex = 0 | 1 | 2;

export interface WeekdayMeta {
  key: WeekdayKey;
  shortLabel: string;
  fullLabel: string;
  accusative: string;
  isWeekend: boolean;
}

export const WEEKDAYS_META: WeekdayMeta[] = [
  { key: 'mon', shortLabel: 'Пн', fullLabel: 'Понедельник', accusative: 'понедельник', isWeekend: false },
  { key: 'tue', shortLabel: 'Вт', fullLabel: 'Вторник', accusative: 'вторник', isWeekend: false },
  { key: 'wed', shortLabel: 'Ср', fullLabel: 'Среда', accusative: 'среду', isWeekend: false },
  { key: 'thu', shortLabel: 'Чт', fullLabel: 'Четверг', accusative: 'четверг', isWeekend: false },
  { key: 'fri', shortLabel: 'Пт', fullLabel: 'Пятница', accusative: 'пятницу', isWeekend: false },
  { key: 'sat', shortLabel: 'Сб', fullLabel: 'Суббота', accusative: 'субботу', isWeekend: true },
  { key: 'sun', shortLabel: 'Вс', fullLabel: 'Воскресенье', accusative: 'воскресенье', isWeekend: true }
];

export interface PlannedItem {
  id: string;
  taskId?: string;
  title: string;
  category: TaskCategory;
  done: boolean;
  estimatedMinutes?: number;
  spentMinutes?: number;
  goalIndex?: GoalIndex;
}

export interface PlanItemPatch {
  title?: string;
  category?: TaskCategory;
  estimatedMinutes?: number | null;
  goalIndex?: GoalIndex | null;
}

export interface WeeklyBigGoal {
  id: string;
  text: string;
  done: boolean;
}

export interface WeeklyRetro {
  wentWell: string;
  blockers: string;
  learnings: string;
  rating: number;
  submittedAt?: string;
}

export interface WeeklyWeekSnapshot {
  weekTitle: string;
  bigThree: [WeeklyBigGoal, WeeklyBigGoal, WeeklyBigGoal];
  days: Record<WeekdayKey, PlannedItem[]>;
  retro: WeeklyRetro;
}

export interface FocusTimerState {
  targetMinutes: number;
  running: boolean;
  runStartedAt: number | null;
  elapsedMs: number;
  selectedTaskKey: string;
}

export const DEFAULT_FOCUS_TIMER: FocusTimerState = {
  targetMinutes: 25,
  running: false,
  runStartedAt: null,
  elapsedMs: 0,
  selectedTaskKey: ''
};

export function emptyDays(): Record<WeekdayKey, PlannedItem[]> {
  return { mon: [], tue: [], wed: [], thu: [], fri: [], sat: [], sun: [] };
}

export function blankBigThree(): [WeeklyBigGoal, WeeklyBigGoal, WeeklyBigGoal] {
  return [
    { id: 'bg-1', text: '', done: false },
    { id: 'bg-2', text: '', done: false },
    { id: 'bg-3', text: '', done: false }
  ];
}

export function emptyRetro(): WeeklyRetro {
  return { wentWell: '', blockers: '', learnings: '', rating: 0 };
}

export interface WeeklyPlanState {
  weekStart: string;
  weekTitle: string;
  bigThree: [WeeklyBigGoal, WeeklyBigGoal, WeeklyBigGoal];
  days: Record<WeekdayKey, PlannedItem[]>;
  retro: WeeklyRetro;
  archive: Record<string, WeeklyWeekSnapshot>;
  timer: FocusTimerState;
}

export const DEFAULT_WEEKLY_PLAN: WeeklyPlanState = {
  weekStart: mondayOf(new Date()),
  weekTitle: 'Недельный спринт разработки',
  bigThree: [
    { id: 'bg-1', text: 'Завершить базовую физику прыжка и Coyote Time в Godot 4', done: false },
    { id: 'bg-2', text: 'Отрисовать спрайты бега и парирования героя', done: false },
    { id: 'bg-3', text: 'Собрать черновой геймплейный прототип Сектора 0', done: false }
  ],
  days: emptyDays(),
  retro: emptyRetro(),
  archive: {},
  timer: { ...DEFAULT_FOCUS_TIMER }
};
