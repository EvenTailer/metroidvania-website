import { describe, expect, it } from 'vitest';
import { stepCloseBlockReason, taskCoversSubtask } from './coverage';
import type { RoadmapStep } from '../roadmap';
import type { Task } from './types';

const step = {
  id: 'step-1',
  subtasks: ['прыжок', 'буфер'],
  deliverables: [],
  phase: '',
  title: '',
  desc: '',
  tech: '',
  done: false,
  goal: '',
  duration: '',
  godotNodes: [],
  pitfalls: [],
  testCriteria: []
} as RoadmapStep;

describe('покрытие шага задачами', () => {
  it('считает задачу покрытием только своего шага', () => {
    const tasks: Task[] = [
      { id: '1', title: 'прыжок', category: 'code', status: 'done', author: 'Юзер 1', stepId: 'step-9' }
    ];
    expect(taskCoversSubtask(tasks, 'step-1', 'прыжок')).toBe(false);
  });

  it('не даёт закрыть шаг, пока подзадач нет в канбане', () => {
    expect(stepCloseBlockReason(step, [])).toMatch(/нет 2 подзадач/);
  });
});
