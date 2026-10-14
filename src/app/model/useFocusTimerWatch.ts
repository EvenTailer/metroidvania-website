import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { timerRemainingMs } from '../../entities/weekly-plan';
import type { AppDispatch, RootState } from '../store';
import { completeFocusSession } from './weeklyCommands';

function playFocusBeep() {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  } catch {
    /* ignore audio error */
  }
}

export function useFocusTimerWatch() {
  const dispatch = useDispatch<AppDispatch>();
  const running = useSelector((state: RootState) => state.weeklyPlan.timer.running);
  const runStartedAt = useSelector((state: RootState) => state.weeklyPlan.timer.runStartedAt);
  const elapsedMs = useSelector((state: RootState) => state.weeklyPlan.timer.elapsedMs);
  const targetMinutes = useSelector((state: RootState) => state.weeklyPlan.timer.targetMinutes);

  useEffect(() => {
    if (!running || runStartedAt == null) return;
    const remain = timerRemainingMs({ targetMinutes, running, runStartedAt, elapsedMs, selectedTaskKey: '' }, Date.now());
    const id = window.setTimeout(() => {
      playFocusBeep();
      dispatch(completeFocusSession());
    }, Math.max(0, remain));
    return () => window.clearTimeout(id);
  }, [dispatch, running, runStartedAt, elapsedMs, targetMinutes]);
}
