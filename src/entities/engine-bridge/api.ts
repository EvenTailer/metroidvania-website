import type { BuildRelease } from './types';

export interface EngineSnapshot {
  initialized: boolean;
  builds: BuildRelease[];
  releaseChecklist: Record<string, boolean>;
  physicsParams: unknown;
  states: unknown[];
}

export async function fetchEngineFromServer(): Promise<EngineSnapshot> {
  const res = await fetch('/api/engine.php');
  if (!res.ok) throw new Error(`Engine fetch failed: ${res.status}`);
  const data = await res.json();
  return {
    initialized: Boolean(data.initialized),
    builds: Array.isArray(data.builds) ? data.builds : [],
    releaseChecklist: data.releaseChecklist && typeof data.releaseChecklist === 'object' ? data.releaseChecklist : {},
    physicsParams: data.physicsParams || null,
    states: Array.isArray(data.states) ? data.states : []
  };
}

export async function saveEngineToServer(payload: {
  builds: BuildRelease[];
  releaseChecklist: Record<string, boolean>;
  physicsParams?: unknown;
  states?: unknown[];
}): Promise<void> {
  const res = await fetch('/api/engine.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error(`Engine save failed: ${res.status}`);
}
