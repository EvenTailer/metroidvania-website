import { normalizeEnemy } from './normalize';
import { EnemyItem } from './types';

export function parseBestiaryImport(text: string): { enemies: EnemyItem[] } | { error: string } {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    return { error: 'Файл не является JSON.' };
  }

  const record = data && typeof data === 'object' && !Array.isArray(data)
    ? (data as { enemies?: unknown })
    : null;
  const list = Array.isArray(data) ? data : record?.enemies;
  if (!Array.isArray(list)) {
    return { error: 'В снимке нет массива enemies.' };
  }

  const parsed = list
    .map((item, index) => normalizeEnemy(item, index))
    .filter((enemy): enemy is EnemyItem => enemy !== null);
  if (parsed.length === 0) {
    return { error: 'Не удалось прочитать ни одного врага.' };
  }

  const used = new Set<string>();
  const enemies = parsed.map(enemy => {
    let id = enemy.id;
    while (used.has(id)) id = `${id}-2`;
    used.add(id);
    return id === enemy.id ? enemy : { ...enemy, id };
  });
  return { enemies };
}
