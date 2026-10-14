import { AssetChecklistItem, AssetItem, AssetPriority, AssetStage, AssetType } from './types';

const VALID_TYPES = new Set<AssetType>(['tileset', 'character', 'ui', 'sfx', 'music']);
const VALID_STAGES = new Set<AssetStage>(['concept', 'pixel-art', 'atlas-slice', 'godot-import', 'integrated']);
const VALID_PRIORITIES = new Set<AssetPriority>(['high', 'normal', 'low']);

export function normalizeChecklistItem(raw: unknown, index: number): AssetChecklistItem {
  if (typeof raw !== 'object' || raw === null) {
    return {
      id: `check-${index + 1}`,
      title: 'Шаг чек-листа',
      completed: false
    };
  }
  const item = raw as Partial<AssetChecklistItem>;
  return {
    id: typeof item.id === 'string' && item.id.trim() ? item.id.trim() : `check-${index + 1}`,
    title: typeof item.title === 'string' && item.title.trim() ? item.title.trim() : `Шаг ${index + 1}`,
    completed: Boolean(item.completed)
  };
}

export function normalizeAssetItem(raw: unknown, index: number): AssetItem | null {
  if (typeof raw !== 'object' || raw === null) return null;
  const item = raw as Partial<AssetItem>;

  const id = typeof item.id === 'string' && item.id.trim() ? item.id.trim() : `asset-${index + 1}`;
  const title = typeof item.title === 'string' && item.title.trim() ? item.title.trim() : `Ассет #${index + 1}`;
  const type = item.type && VALID_TYPES.has(item.type) ? item.type : 'tileset';
  const stage = item.stage && VALID_STAGES.has(item.stage) ? item.stage : 'concept';
  const priority = item.priority && VALID_PRIORITIES.has(item.priority) ? item.priority : 'normal';
  const author = typeof item.author === 'string' && item.author.trim() ? item.author.trim() : 'Cleaf';
  const description = typeof item.description === 'string' ? item.description : '';
  const targetPath = typeof item.targetPath === 'string' && item.targetPath.trim()
    ? item.targetPath.trim()
    : 'res://assets/';
  const dimensions = typeof item.dimensions === 'string' ? item.dimensions : undefined;
  const format = typeof item.format === 'string' ? item.format : undefined;
  const tags = Array.isArray(item.tags)
    ? item.tags.map(t => String(t).trim()).filter(Boolean)
    : [];
  const godotTips = typeof item.godotTips === 'string' ? item.godotTips : '';
  const rawPreview = typeof item.previewUrl === 'string' ? item.previewUrl.trim() : '';
  const previewUrl = rawPreview && !rawPreview.startsWith('data:') ? rawPreview : undefined;
  const checklist = Array.isArray(item.checklist)
    ? item.checklist.map((c, i) => normalizeChecklistItem(c, i))
    : [];
  const createdAt = typeof item.createdAt === 'string' ? item.createdAt : new Date().toISOString();
  const updatedAt = typeof item.updatedAt === 'string' ? item.updatedAt : createdAt;

  return {
    id,
    title,
    type,
    stage,
    priority,
    author,
    description,
    targetPath,
    dimensions,
    format,
    tags,
    godotTips,
    previewUrl,
    checklist,
    createdAt,
    updatedAt
  };
}
