import { describe, expect, it } from 'vitest';
import { createHubStore } from '../store';
import { updateTaskStatus } from './commands';

describe('задачи в работе', () => {
  it('берёт четвёртую задачу в работу', () => {
    const hub = createHubStore();
    const ids = hub.getState().tasks.items.filter(task => task.status !== 'in-progress').map(task => task.id);
    hub.dispatch(updateTaskStatus(ids[0], 'in-progress'));
    const before = hub.getState().tasks.items.filter(task => task.status === 'in-progress').length;
    const idle = hub.getState().tasks.items.find(task => task.status !== 'in-progress');
    hub.dispatch(updateTaskStatus(idle!.id, 'in-progress'));
    const after = hub.getState().tasks.items.filter(task => task.status === 'in-progress').length;
    expect(before).toBe(3);
    expect(after).toBe(4);
  });
});
