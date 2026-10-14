import { describe, expect, it } from 'vitest';
import { crc32, createZipArchive } from '../../shared/lib/simpleZip';
import { buildConfigBundle, generateFullConfigBundle } from './bundlePacker';
import { DEFAULT_BUILDS, withoutFactorySeeds } from './defaultData';
import {
  allConfigFilesToggled,
  buildAdded,
  buildFilterChanged,
  buildRemoved,
  buildUpdated,
  configFileToggled,
  connectedFolderNameSet,
  engineBridgeSlice,
  lastBridgeSyncAtSet,
  resetBuildsToDefault
} from './slice';
import { BuildRelease } from './types';

describe('engineBridge entity & simpleZip', () => {
  it('вычисляет корректный CRC32 и создает валидный ZIP-архив', () => {
    const text = 'Hello Godot 4.3!';
    const buf = new TextEncoder().encode(text);
    const crc = crc32(buf);
    expect(crc).toBeGreaterThan(0);

    const zipBlob = createZipArchive([
      { name: 'data/world_matrix.json', content: '{"rooms": []}' },
      { name: 'scripts/Player.gd', content: 'extends CharacterBody2D' }
    ]);

    expect(zipBlob.type).toBe('application/zip');
    expect(zipBlob.size).toBeGreaterThan(100);
  });

  it('собирает бандл конфигов игры со всеми секциями', () => {
    const bundle = buildConfigBundle({
      roomsJson: '{"rooms":[1,2,3]}',
      bestiaryJson: '{"enemies":[]}',
      narrativeJson: '{"chapters":[]}',
      playerControllerGd: 'class_name PlayerController',
      assetManifestGd: 'class_name AssetManifest',
      playerPhysicsTres: '[gd_resource]'
    });

    expect(bundle.length).toBe(6);
    expect(bundle.map(b => b.filename)).toContain('world_matrix.json');
    expect(bundle.map(b => b.filename)).toContain('PlayerController.gd');
    expect(bundle.find(b => b.id === 'world_matrix')?.targetResPath).toBe('res://data/world_matrix.json');
    expect(bundle.every(b => b.fileSizeBytes > 0)).toBe(true);
  });

  it('динамически генерирует бандл со значениями по умолчанию', () => {
    const bundle = generateFullConfigBundle();
    expect(bundle.length).toBeGreaterThan(6);
    const controller = bundle.find(b => b.id === 'player_controller');
    expect(controller?.content).toContain('class_name PlayerController');
    const assetManifest = bundle.find(b => b.id === 'asset_manifest');
    expect(assetManifest?.content).toContain('class_name AssetManifest');
    expect(bundle.some(file => file.filename === 'PlayerPhysicsData.gd')).toBe(true);
    expect(bundle.some(file => file.filename === 'StateMachine.gd')).toBe(true);
  });

  it('выгружает комнаты и врагов без состояния экрана', () => {
    const bundle = generateFullConfigBundle({
      roomMatrix: { rooms: [{ id: 'r1' }], sectors: [], selectedRoomId: 'secret-ui', activeFilterSector: 'all' },
      bestiary: { items: [{ id: 'e1', name: 'Страж' }], selectedEnemyId: 'secret-ui', filter: { type: 'all' } },
      narrative: [{ id: 'ch1', title: 'Пролог' }]
    });
    const world = bundle.find(file => file.id === 'world_matrix')?.content || '';
    const enemies = bundle.find(file => file.id === 'enemies')?.content || '';
    const dialogues = bundle.find(file => file.id === 'dialogues')?.content || '';
    expect(world).toContain('r1');
    expect(world).not.toContain('secret-ui');
    expect(world).not.toContain('activeFilterSector');
    expect(enemies).toContain('Страж');
    expect(enemies).not.toContain('selectedEnemyId');
    expect(dialogues).toContain('Пролог');
  });

  it('убирает заводские сборки и оставляет одну текущую', () => {
    const cleaned = withoutFactorySeeds(DEFAULT_BUILDS);
    expect(cleaned).toEqual([]);

    let state = engineBridgeSlice.reducer(undefined, { type: '@@INIT' });
    expect(state.builds).toEqual([]);
    const first: BuildRelease = {
      id: 'own-1',
      version: 'v0.1.0',
      title: 'Своя сборка',
      stage: 'alpha',
      status: 'testing',
      releaseDate: '2026-10-07',
      targetEngineVersion: 'Godot 4.3',
      description: '',
      changelog: [],
      artifacts: [],
      linkedTaskIds: [],
      linkedBugIds: [],
      testedHours: 1,
      isLatestRelease: true
    };
    const second = { ...first, id: 'own-2', version: 'v0.2.0', isLatestRelease: true };
    state = engineBridgeSlice.reducer(state, buildAdded(first));
    state = engineBridgeSlice.reducer(state, buildAdded(second));
    expect(state.builds.filter(build => build.isLatestRelease).map(build => build.id)).toEqual(['own-2']);
  });

  it('управляет релизами и билдами в Redux slice', () => {
    let state = engineBridgeSlice.reducer(undefined, { type: '@@INIT' });
    expect(state.builds).toEqual([]);

    const newBuild: BuildRelease = {
      id: 'build-v0-4-0',
      version: 'v0.4.0-steam-next',
      title: 'Steam Next Fest Gold Master',
      stage: 'release-candidate',
      status: 'stable',
      releaseDate: '2026-10-10',
      targetEngineVersion: 'Godot 4.3',
      description: 'Финальная полировка демо',
      changelog: [{ id: '1', type: 'feat', text: 'Полная поддержка локализации' }],
      artifacts: [{ id: 'a1', platform: 'steam', title: 'Steam', url: 'https://steam.com' }],
      linkedTaskIds: ['task-1'],
      linkedBugIds: [],
      testedHours: 5
    };

    state = engineBridgeSlice.reducer(state, buildAdded(newBuild));
    expect(state.builds[0].id).toBe('build-v0-4-0');
    expect(state.selectedBuildId).toBe('build-v0-4-0');

    // Обновление
    const updated = { ...newBuild, title: 'Обновленный Gold Master' };
    state = engineBridgeSlice.reducer(state, buildUpdated(updated));
    expect(state.builds[0].title).toBe('Обновленный Gold Master');

    // Удаление
    state = engineBridgeSlice.reducer(state, buildRemoved('build-v0-4-0'));
    expect(state.builds.some(b => b.id === 'build-v0-4-0')).toBe(false);

    // Фильтр
    state = engineBridgeSlice.reducer(state, buildFilterChanged({ stage: 'demo-steam' }));
    expect(state.buildFilter.stage).toBe('demo-steam');

    // Переключение файлов синхронизации
    state = engineBridgeSlice.reducer(state, configFileToggled('world_matrix'));
    expect(state.selectedConfigFileIds).not.toContain('world_matrix');
    state = engineBridgeSlice.reducer(state, configFileToggled('world_matrix'));
    expect(state.selectedConfigFileIds).toContain('world_matrix');

    state = engineBridgeSlice.reducer(state, allConfigFilesToggled([]));
    expect(state.selectedConfigFileIds.length).toBe(0);

    // Папка и дата
    state = engineBridgeSlice.reducer(state, connectedFolderNameSet('C:/Godot/CyberDuck'));
    expect(state.connectedFolderName).toBe('C:/Godot/CyberDuck');

    state = engineBridgeSlice.reducer(state, lastBridgeSyncAtSet('2026-10-07T10:00:00.000Z'));
    expect(state.lastBridgeSyncAt).toBe('2026-10-07T10:00:00.000Z');

    // Сброс
    state = engineBridgeSlice.reducer(state, resetBuildsToDefault());
    expect(state.builds).toEqual([]);
  });
});
