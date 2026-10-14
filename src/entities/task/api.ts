import { Task } from './types';

export interface BoardSnapshot {
  initialized: boolean;
  tasks: Task[];
  sprintStepId: string | null;
  stepsDone: Record<string, boolean>;
}

function asDoneMap(value: unknown): Record<string, boolean> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  const map: Record<string, boolean> = {};
  for (const [key, flag] of Object.entries(value)) {
    if (flag) map[key] = true;
  }
  return map;
}

export async function fetchBoard(): Promise<BoardSnapshot> {
  const res = await fetch('/api/board.php');
  if (!res.ok) {
    throw new Error(`Board fetch failed: ${res.status}`);
  }
  const data = (await res.json()) as {
    initialized?: boolean;
    tasks?: Task[];
    sprintStepId?: string | null;
    stepsDone?: unknown;
  };
  return {
    initialized: Boolean(data.initialized),
    tasks: Array.isArray(data.tasks) ? data.tasks : [],
    sprintStepId: typeof data.sprintStepId === 'string' && data.sprintStepId ? data.sprintStepId : null,
    stepsDone: asDoneMap(data.stepsDone)
  };
}

export async function saveBoard(snapshot: Omit<BoardSnapshot, 'initialized'>): Promise<void> {
  const res = await fetch('/api/board.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      tasks: snapshot.tasks,
      sprintStepId: snapshot.sprintStepId,
      stepsDone: snapshot.stepsDone
    })
  });
  if (!res.ok) {
    throw new Error(`Board save failed: ${res.status}`);
  }
}
