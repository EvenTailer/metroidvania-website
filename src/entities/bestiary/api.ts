import type { EnemyItem } from './types';

export interface BestiarySnapshot {
  initialized: boolean;
  items: EnemyItem[];
}

export async function fetchBestiaryFromServer(): Promise<BestiarySnapshot> {
  const res = await fetch('/api/bestiary.php');
  if (!res.ok) throw new Error(`Bestiary fetch failed: ${res.status}`);
  const data = await res.json();
  return {
    initialized: Boolean(data.initialized),
    items: Array.isArray(data.items) ? data.items : []
  };
}

export async function saveBestiaryToServer(items: EnemyItem[]): Promise<void> {
  const res = await fetch('/api/bestiary.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items })
  });
  if (!res.ok) throw new Error(`Bestiary save failed: ${res.status}`);
}
