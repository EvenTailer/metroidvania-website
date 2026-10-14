import { describe, expect, it } from 'vitest';
import { simulatorCommand, syncWalk } from './simulatorInput';

describe('ввод симулятора прыжка', () => {
  it('читает A/D, стрелки, пробел и Shift', () => {
    expect(simulatorCommand('KeyA', 'down')).toBe('left-down');
    expect(simulatorCommand('ArrowLeft', 'up')).toBe('left-up');
    expect(simulatorCommand('KeyD', 'down')).toBe('right-down');
    expect(simulatorCommand('ArrowRight', 'up')).toBe('right-up');
    expect(simulatorCommand('Space', 'down')).toBe('jump');
    expect(simulatorCommand('Space', 'up')).toBe('release-jump');
    expect(simulatorCommand('ShiftLeft', 'down')).toBe('dash');
    expect(simulatorCommand('KeyW', 'down')).toBeNull();
  });

  it('смотрит в сторону последнего хода', () => {
    const state = { leftHeld: true, rightHeld: false, walkDir: 0, facing: 1 };
    syncWalk(state);
    expect(state.walkDir).toBe(-1);
    expect(state.facing).toBe(-1);
    state.rightHeld = true;
    syncWalk(state);
    expect(state.walkDir).toBe(1);
    expect(state.facing).toBe(1);
  });
});
