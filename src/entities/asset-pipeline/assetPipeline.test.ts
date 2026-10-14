import { describe, expect, it } from 'vitest';
import {
  assetAdded,
  assetChecklistToggled,
  assetFilterChanged,
  assetPipelineSlice,
  assetRemoved,
  assetStageAdvanced,
  assetStageReverted,
  assetStageSet,
  assetUpdated
} from './slice';
import { normalizeAssetItem } from './normalize';
import { generateGodotAssetManifest, parseAssetsFromJson } from './export';
import { buildTargetPath, canEnterStage, pipelineReadiness } from './rules';
import { AssetItem } from './types';

const sampleAsset: AssetItem = {
  id: 'test-duck',
  title: 'Кибер-Утка Спрайт',
  type: 'character',
  stage: 'concept',
  priority: 'high',
  author: 'Cleaf',
  description: 'Тестовый персонаж',
  targetPath: 'res://assets/sprites/duck.png',
  tags: ['герой'],
  godotTips: 'Texture Filter = Nearest',
  checklist: [
    { id: 'c1', title: 'Скетч', completed: false },
    { id: 'c2', title: 'Импорт', completed: false }
  ],
  createdAt: '2026-10-06T00:00:00.000Z',
  updatedAt: '2026-10-06T00:00:00.000Z'
};

describe('assetPipeline entity', () => {
  it('добавляет и удаляет ассет в слайсе', () => {
    let state = assetPipelineSlice.reducer(undefined, { type: '@@INIT' });
    const initialLen = state.items.length;

    state = assetPipelineSlice.reducer(state, assetAdded(sampleAsset));
    expect(state.items.length).toBe(initialLen + 1);
    expect(state.items[0].id).toBe('test-duck');
    expect(state.selectedAssetId).toBe('test-duck');

    state = assetPipelineSlice.reducer(state, assetRemoved('test-duck'));
    expect(state.items.length).toBe(initialLen);
  });

  it('обновляет поля и переключает чек-лист', () => {
    let state = assetPipelineSlice.reducer(undefined, { type: '@@INIT' });
    state = assetPipelineSlice.reducer(state, assetAdded(sampleAsset));

    state = assetPipelineSlice.reducer(
      state,
      assetChecklistToggled({ assetId: 'test-duck', checkId: 'c1' })
    );
    expect(state.items[0].checklist[0].completed).toBe(true);

    const updated = { ...state.items[0], title: 'Кибер-Утка V2' };
    state = assetPipelineSlice.reducer(state, assetUpdated(updated));
    expect(state.items[0].title).toBe('Кибер-Утка V2');
  });

  it('сдвигает этап пайплайна вперед и назад по цепочке', () => {
    let state = assetPipelineSlice.reducer(undefined, { type: '@@INIT' });
    state = assetPipelineSlice.reducer(state, assetAdded(sampleAsset));

    expect(state.items[0].stage).toBe('concept');

    state = assetPipelineSlice.reducer(state, assetStageAdvanced('test-duck'));
    expect(state.items[0].stage).toBe('pixel-art');

    state = assetPipelineSlice.reducer(state, assetStageAdvanced('test-duck'));
    expect(state.items[0].stage).toBe('atlas-slice');

    state = assetPipelineSlice.reducer(state, assetStageAdvanced('test-duck'));
    expect(state.items[0].stage).toBe('godot-import');

    state = assetPipelineSlice.reducer(state, assetStageAdvanced('test-duck'));
    expect(state.items[0].stage).toBe('godot-import');

    const ready = {
      ...state.items[0],
      checklist: state.items[0].checklist.map(item => ({ ...item, completed: true }))
    };
    state = assetPipelineSlice.reducer(state, assetUpdated(ready));
    state = assetPipelineSlice.reducer(state, assetStageAdvanced('test-duck'));
    expect(state.items[0].stage).toBe('integrated');

    // Дальше не сдвигается
    state = assetPipelineSlice.reducer(state, assetStageAdvanced('test-duck'));
    expect(state.items[0].stage).toBe('integrated');

    // Возврат назад
    state = assetPipelineSlice.reducer(state, assetStageReverted('test-duck'));
    expect(state.items[0].stage).toBe('godot-import');

    state = assetPipelineSlice.reducer(state, assetStageSet({ id: 'test-duck', stage: 'concept' }));
    expect(state.items[0].stage).toBe('concept');
  });

  it('нормализует некорректные данные', () => {
    const invalid = { id: '', type: 'unknown_type', stage: 'wrong_stage' };
    const normalized = normalizeAssetItem(invalid, 0);
    expect(normalized).not.toBeNull();
    expect(normalized?.type).toBe('tileset');
    expect(normalized?.stage).toBe('concept');
    expect(normalized?.priority).toBe('normal');

    expect(normalizeAssetItem(null, 0)).toBeNull();
  });

  it('генерирует валидный GDScript манифест для Godot 4', () => {
    const code = generateGodotAssetManifest([sampleAsset]);
    expect(code).toContain('class_name AssetManifest');
    expect(code).toContain('const ASSET_REGISTRY: Dictionary = {');
    expect(code).toContain('test_duck');
    expect(code).toContain('res://assets/sprites/duck.png');
    expect(code).toContain('static func load_resource');
  });

  it('парсит JSON ассетов и валидирует массив', () => {
    const json = JSON.stringify([sampleAsset]);
    const parsed = parseAssetsFromJson(json);
    expect(parsed.length).toBe(1);
    expect(parsed[0].id).toBe('test-duck');

    expect(() => parseAssetsFromJson('{"not": "an array"}')).toThrow();
  });

  it('не пускает в игру с пустым чек-листом и считает готовность по этапу и чек-листу', () => {
    expect(canEnterStage(sampleAsset, 'integrated')).toBe(false);
    expect(buildTargetPath('tileset', 'Тест пещеры')).toBe('res://assets/tilesets/test_peschery.png');
    expect(buildTargetPath('sfx', 'Рывок')).toContain('res://audio/sfx/');
    expect(pipelineReadiness([sampleAsset])).toBe(0);
    const moved = {
      ...sampleAsset,
      stage: 'pixel-art' as const,
      checklist: sampleAsset.checklist.map((item, index) => ({ ...item, completed: index === 0 }))
    };
    const score = pipelineReadiness([moved]);
    expect(score).toBeGreaterThan(0);
    expect(score).toBeLessThan(100);
  });

  it('корректно обновляет фильтры', () => {
    let state = assetPipelineSlice.reducer(undefined, { type: '@@INIT' });
    state = assetPipelineSlice.reducer(state, assetFilterChanged({ type: 'sfx', searchQuery: 'рывок' }));
    expect(state.filter.type).toBe('sfx');
    expect(state.filter.searchQuery).toBe('рывок');
  });
});
