export type SimulatorCommand =
  | 'jump'
  | 'release-jump'
  | 'dash'
  | 'left-down'
  | 'left-up'
  | 'right-down'
  | 'right-up';

export function simulatorCommand(code: string, phase: 'down' | 'up'): SimulatorCommand | null {
  if (phase === 'down') {
    if (code === 'Space') return 'jump';
    if (code === 'ShiftLeft' || code === 'ShiftRight') return 'dash';
    if (code === 'KeyA' || code === 'ArrowLeft') return 'left-down';
    if (code === 'KeyD' || code === 'ArrowRight') return 'right-down';
    return null;
  }
  if (code === 'Space') return 'release-jump';
  if (code === 'KeyA' || code === 'ArrowLeft') return 'left-up';
  if (code === 'KeyD' || code === 'ArrowRight') return 'right-up';
  return null;
}

export function syncWalk(state: { leftHeld: boolean; rightHeld: boolean; walkDir: number; facing: number }) {
  state.walkDir = state.rightHeld ? 1 : state.leftHeld ? -1 : 0;
  if (state.walkDir !== 0) state.facing = state.walkDir;
}
