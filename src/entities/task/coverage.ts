import { RoadmapStep } from '../roadmap';
import { Task, TaskCategory } from './types';

export function normalizeTaskTitle(title: string): string {
  return title.trim().toLowerCase().replace(/^\[step-\d+\]\s*/i, '');
}

export function taskCoversSubtask(tasks: Task[], stepId: string, subtask: string): boolean {
  const needle = normalizeTaskTitle(subtask);
  if (!needle) return false;
  return tasks.some(task => {
    if (task.stepId && task.stepId !== stepId) return false;
    return normalizeTaskTitle(task.title) === needle;
  });
}

export function categoryForSubtask(step: RoadmapStep, title: string): TaskCategory {
  const words = title
    .toLowerCase()
    .split(/[^a-z0-9а-яё]+/)
    .filter(word => word.length > 4);
  let bestRole: TaskCategory | null = null;
  let bestScore = 0;
  for (const item of step.deliverables) {
    const blob = `${item.title} ${item.desc}`.toLowerCase();
    const score = words.filter(word => blob.includes(word)).length;
    if (score > bestScore) {
      bestScore = score;
      bestRole = item.role;
    }
  }
  if (bestRole && bestScore >= 2) return bestRole;

  const text = title.toLowerCase();
  if (/звук|музык|sfx|реверб|audio/.test(text)) return 'audio';
  if (/арт|спрайт|анимац|нарез|тайл|параллакс|капсул|икон/.test(text)) return 'art';
  if (/грейд|грейбокс|дизайн|уровн|плейтест|арена|копирайт|локализац|страниц/.test(text)) return 'design';
  return 'code';
}

export function stepCloseBlockReason(step: RoadmapStep, tasks: Task[]): string | null {
  const missing = step.subtasks.filter(sub => !taskCoversSubtask(tasks, step.id, sub));
  const stepTasks = tasks.filter(task => task.stepId === step.id);
  const open = stepTasks.filter(task => task.status !== 'done');
  const label = step.id.toUpperCase();
  if (missing.length > 0) {
    return `Нельзя закрыть ${label}: в канбане нет ${missing.length} подзадач.`;
  }
  if (stepTasks.length === 0) {
    return `Нельзя закрыть ${label}: у шага ещё нет задач.`;
  }
  if (open.length > 0) {
    return `Нельзя закрыть ${label}: не готово задач — ${open.length}.`;
  }
  return null;
}
