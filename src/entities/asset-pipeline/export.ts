import { AssetItem, STAGE_META, TYPE_META } from './types';
import { normalizeAssetItem } from './normalize';

export function exportAssetsToJson(items: AssetItem[]) {
  const json = JSON.stringify(items, null, 2);
  const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `asset_pipeline_${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function parseAssetsFromJson(rawText: string): AssetItem[] {
  const parsed = JSON.parse(rawText);
  if (!Array.isArray(parsed)) {
    throw new Error('Файл должен содержать массив ассетов');
  }
  const items = parsed
    .map((item, index) => normalizeAssetItem(item, index))
    .filter((item): item is AssetItem => item !== null);
  if (items.length === 0) {
    throw new Error('В файле не найдено корректных записей ассетов');
  }
  return items;
}

export function generateGodotAssetManifest(items: AssetItem[]): string {
  const timestamp = new Date().toISOString();
  const assetEntries = items.map(item => {
    const key = item.id.replace(/[^a-zA-Z0-9_]/g, '_');
    const isReady = item.stage === 'integrated' || item.stage === 'godot-import';
    return `\t"${key}": {
\t\t"id": "${item.id}",
\t\t"title": "${item.title.replace(/"/g, '\\"')}",
\t\t"type": "${item.type}",
\t\t"stage": "${item.stage}",
\t\t"path": "${item.targetPath}",
\t\t"format": "${item.format || ''}",
\t\t"dimensions": "${item.dimensions || ''}",
\t\t"is_ready": ${isReady ? 'true' : 'false'}
\t}`;
  }).join(',\n');

  return `# ==============================================================================
# AssetManifest.gd — Автоматический реестр ассетов Cyber-Duck Metroidvania
# Сгенерировано из веб-хаба: ${timestamp}
# Движок: Godot 4.3 (CharacterBody2D, TileMapLayer, AudioStreamPlayer)
# ==============================================================================
class_name AssetManifest
extends RefCounted

const ASSET_REGISTRY: Dictionary = {
${assetEntries}
}

## Возвращает путь ресурса res:// по ключу ассета
static func get_path(asset_key: String) -> String:
\tif ASSET_REGISTRY.has(asset_key):
\t\treturn ASSET_REGISTRY[asset_key].get("path", "")
\tpush_warning("[AssetManifest] Не найден ассет с ключом: " + asset_key)
\treturn ""

## Проверяет, готов ли ассет к использованию в игре
static func is_ready(asset_key: String) -> bool:
\tif ASSET_REGISTRY.has(asset_key):
\t\treturn ASSET_REGISTRY[asset_key].get("is_ready", false)
\treturn false

## Безопасно загружает ресурс в рантайме с проверкой существования файла
static func load_resource(asset_key: String) -> Resource:
\tvar res_path: String = get_path(asset_key)
\tif res_path.is_empty():
\t\treturn null
\tif not ResourceLoader.exists(res_path):
\t\tpush_error("[AssetManifest] Файл ресурса не существует: " + res_path)
\t\treturn null
\treturn load(res_path)

## Возвращает список всех зарегистрированных ассетов по типу ('tileset', 'character', 'ui', 'sfx', 'music')
static func get_by_type(asset_type: String) -> Array[Dictionary]:
\tvar result: Array[Dictionary] = []
\tfor key in ASSET_REGISTRY.keys():
\t\tvar entry: Dictionary = ASSET_REGISTRY[key]
\t\tif entry.get("type", "") == asset_type:
\t\t\tresult.append(entry)
\treturn result
`;
}

export function downloadGodotAssetManifest(items: AssetItem[]) {
  const code = generateGodotAssetManifest(items);
  const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'AssetManifest.gd';
  a.click();
  URL.revokeObjectURL(url);
}

export function formatAssetsSummaryMarkdown(items: AssetItem[]): string {
  const total = items.length;
  const integrated = items.filter(item => item.stage === 'integrated').length;
  const inGodot = items.filter(item => item.stage === 'godot-import').length;
  const inProgress = items.filter(item => item.stage !== 'integrated').length;
  const pct = total > 0 ? Math.round((integrated / total) * 100) : 0;

  let md = `# 🎮 Пайплайн ассетов Cyber-Duck Metroidvania\n\n`;
  md += `**Общий прогресс:** ${pct}% (${integrated}/${total} ассетов в игре)\n`;
  md += `- В игре: ${integrated}\n`;
  md += `- В стадии импорта в Godot: ${inGodot}\n`;
  md += `- В работе: ${inProgress}\n\n`;
  md += `## Список ассетов по этапам\n\n`;

  const grouped: Record<string, AssetItem[]> = {};
  items.forEach(item => {
    grouped[item.stage] = grouped[item.stage] || [];
    grouped[item.stage].push(item);
  });

  for (const stage of ['integrated', 'godot-import', 'atlas-slice', 'pixel-art', 'concept'] as const) {
    const list = grouped[stage] || [];
    if (list.length === 0) continue;
    const stageMeta = STAGE_META[stage];
    md += `### ${stageMeta.icon} ${stageMeta.ruTitle} (${list.length})\n`;
    list.forEach(item => {
      const typeMeta = TYPE_META[item.type];
      const checkDone = item.checklist.filter(c => c.completed).length;
      md += `- **[${typeMeta.icon} ${typeMeta.ruTitle}]** ${item.title}\n`;
      md += `  - Путь: \`${item.targetPath}\`\n`;
      md += `  - Чек-лист: ${checkDone}/${item.checklist.length} шагов\n`;
      if (item.godotTips) md += `  - Подсказка Godot: ${item.godotTips}\n`;
    });
    md += `\n`;
  }

  return md;
}
