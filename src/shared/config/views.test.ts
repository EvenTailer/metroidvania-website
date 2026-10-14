import { describe, expect, it } from 'vitest';
import { NUMBER_KEY_VIEWS, viewForNumberKey, viewFromLocation } from './views';

describe('адрес экрана', () => {
  it('читает известный хеш и отбрасывает чужой', () => {
    window.location.hash = '#/kanban';
    expect(viewFromLocation()).toBe('kanban');
    window.location.hash = '#/weekly-plan';
    expect(viewFromLocation()).toBe('weekly-plan');
    window.location.hash = '#/bestiary';
    expect(viewFromLocation()).toBe('bestiary');
    window.location.hash = '#/asset-pipeline';
    expect(viewFromLocation()).toBe('asset-pipeline');
    window.location.hash = '#/gdscript-generator';
    expect(viewFromLocation()).toBe('gdscript-generator');
    window.location.hash = '#/engine-bridge';
    expect(viewFromLocation()).toBe('engine-bridge');
    window.location.hash = '#/нет-такого';
    expect(viewFromLocation()).toBe('dashboard');
  });

  it('цифры 1–0 ведут в известные экраны', () => {
    expect(viewForNumberKey('5')).toBe('room-matrix');
    expect(viewForNumberKey('0')).toBe('engine-bridge');
    expect(viewForNumberKey('q')).toBeUndefined();
    expect(Object.values(NUMBER_KEY_VIEWS)).toHaveLength(10);
  });
});
