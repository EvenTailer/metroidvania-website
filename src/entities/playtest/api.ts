import type { PlaytestReport } from './types';

export interface PlaytestSnapshot {
  initialized: boolean;
  items: PlaytestReport[];
}

export async function fetchPlaytestFromServer(): Promise<PlaytestSnapshot> {
  const res = await fetch('/api/playtest.php');
  if (!res.ok) throw new Error(`Playtest fetch failed: ${res.status}`);
  const data = await res.json();
  return {
    initialized: Boolean(data.initialized),
    items: Array.isArray(data.items) ? data.items : []
  };
}

export async function savePlaytestToServer(items: PlaytestReport[]): Promise<void> {
  const res = await fetch('/api/playtest.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items })
  });
  if (!res.ok) throw new Error(`Playtest save failed: ${res.status}`);
}
