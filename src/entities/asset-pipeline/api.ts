import { normalizeAssetItem } from './normalize';
import { AssetItem } from './types';

export interface AssetPipelineSnapshot {
  initialized: boolean;
  savedAt: string | null;
  items: AssetItem[];
}

export interface GodotPathProbe {
  configured: boolean;
  exists: boolean | null;
}

function normalizeList(raw: unknown): AssetItem[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item, index) => normalizeAssetItem(item, index))
    .filter((item): item is AssetItem => item !== null);
}

export async function fetchAssetPipeline(): Promise<AssetPipelineSnapshot> {
  const res = await fetch('/api/assets.php');
  if (!res.ok) throw new Error(`Asset pipeline fetch failed: ${res.status}`);
  const data = (await res.json()) as {
    initialized?: boolean;
    savedAt?: unknown;
    items?: unknown;
  };
  return {
    initialized: Boolean(data.initialized),
    savedAt: typeof data.savedAt === 'string' ? data.savedAt : null,
    items: normalizeList(data.items)
  };
}

export async function saveAssetPipeline(items: AssetItem[]): Promise<string> {
  const res = await fetch('/api/assets.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items })
  });
  if (!res.ok) throw new Error(`Asset pipeline save failed: ${res.status}`);
  const data = (await res.json()) as { savedAt?: unknown };
  return typeof data.savedAt === 'string' ? data.savedAt : new Date().toISOString();
}

export async function probeGodotPath(resPath: string): Promise<GodotPathProbe> {
  const res = await fetch(`/api/assets.php?probe=${encodeURIComponent(resPath)}`);
  if (!res.ok) throw new Error(`Path probe failed: ${res.status}`);
  const data = (await res.json()) as { configured?: boolean; exists?: boolean | null };
  return {
    configured: Boolean(data.configured),
    exists: typeof data.exists === 'boolean' ? data.exists : null
  };
}
