import { AssetItem, AssetStage, AssetType, STAGE_SEQUENCE, TYPE_META } from './types';

const RU: Record<string, string> = {
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z', и: 'i', й: 'y',
  к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f',
  х: 'h', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'sch', ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya'
};

export function slugAssetName(title: string): string {
  let out = '';
  for (const ch of title.trim().toLowerCase()) {
    out += RU[ch] ?? ch;
  }
  const slug = out.replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '').slice(0, 32);
  return slug || 'asset';
}

export function buildTargetPath(type: AssetType, title: string): string {
  const meta = TYPE_META[type];
  return `${meta.defaultPathPrefix}${slugAssetName(title)}${meta.defaultFormat}`;
}

export function isPlaceholderPath(path: string): boolean {
  return /\/new_asset\.[a-z0-9]+$/i.test(path.trim());
}

export function isChecklistComplete(asset: Pick<AssetItem, 'checklist'>): boolean {
  return asset.checklist.length > 0 && asset.checklist.every(item => item.completed);
}

export function canEnterStage(asset: Pick<AssetItem, 'checklist'>, stage: AssetStage): boolean {
  if (stage !== 'integrated') return true;
  return isChecklistComplete(asset);
}

export function assetReadiness(asset: AssetItem): number {
  const index = Math.max(0, STAGE_SEQUENCE.indexOf(asset.stage));
  const stageScore = index / (STAGE_SEQUENCE.length - 1);
  const done = asset.checklist.filter(item => item.completed).length;
  const checkScore = asset.checklist.length === 0 ? 0 : done / asset.checklist.length;
  return Math.round(((stageScore + checkScore) / 2) * 100);
}

export function pipelineReadiness(assets: AssetItem[]): number {
  if (assets.length === 0) return 0;
  const sum = assets.reduce((total, asset) => total + assetReadiness(asset), 0);
  return Math.round(sum / assets.length);
}
