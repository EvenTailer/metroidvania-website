import type { FocusTimerState } from './types';

export function timerElapsedMs(timer: FocusTimerState, now: number): number {
  const extra = timer.running && timer.runStartedAt != null
    ? Math.max(0, now - timer.runStartedAt)
    : 0;
  return timer.elapsedMs + extra;
}

export function timerRemainingMs(timer: FocusTimerState, now: number): number {
  return Math.max(0, timer.targetMinutes * 60_000 - timerElapsedMs(timer, now));
}

export function elapsedMinutesToLog(timer: FocusTimerState, now: number): number {
  const elapsed = timerElapsedMs(timer, now);
  if (elapsed < 1000) return 0;
  return Math.max(1, Math.round(elapsed / 60_000));
}
