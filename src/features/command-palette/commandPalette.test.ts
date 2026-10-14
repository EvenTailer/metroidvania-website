import { describe, expect, it } from 'vitest';
import { NUMBER_KEY_VIEWS } from '../../shared/config/views';
import { buildCommandPaletteItems, filterCommandItems } from './useCommandPaletteItems';
import { RoomNode } from '../../entities/room-matrix';
import { EnemyItem } from '../../entities/bestiary';
import { BuildRelease } from '../../entities/engine-bridge';

describe('buildCommandPaletteItems function', () => {
  const dummyRooms: RoomNode[] = [
    {
      id: 'room-1',
      name: 'Неоновый Причал',
      sectorId: 'sec-0',
      gridX: 2,
      gridY: 3,
      size: '1x1',
      type: 'standard',
      status: 'tested',
      description: 'Тестовая комната',
      godotScene: 'res://rooms/dock.tscn',
      connections: [],
      loot: []
    },
    {
      id: 'room-boss',
      name: 'Арена Кибер-Титана',
      sectorId: 'sec-1',
      gridX: 5,
      gridY: 5,
      size: '2x2',
      type: 'boss',
      status: 'art_ready',
      description: 'Босс арена',
      godotScene: 'res://rooms/boss.tscn',
      connections: [],
      loot: []
    }
  ];

  const dummyEnemies: EnemyItem[] = [
    {
      id: 'enm-1',
      name: 'Кибер-Крыса',
      code: 'ENM-01',
      type: 'minion',
      sectorId: 'sec-0',
      hp: 45,
      damage: 10,
      speed: 120,
      staggerThreshold: 2,
      parryWindow: 0.18,
      godotScene: 'res://enemies/rat.tscn',
      description: 'Мутировавшая крыса',
      lore: 'Лор крысы',
      spawnRoomIds: ['room-1'],
      attacks: [],
      checklist: { sprite: true, skeleton2d: true, hitboxes: true, audio: true, tested: true }
    }
  ];

  const dummyBuilds: BuildRelease[] = [
    {
      id: 'b-1',
      version: 'v0.3.0-vertical-slice',
      title: 'Vertical Slice',
      stage: 'vertical-slice',
      status: 'stable',
      releaseDate: '2026-10-01',
      targetEngineVersion: 'Godot 4.3',
      description: 'Готовая демо зона',
      changelog: [],
      artifacts: [],
      linkedTaskIds: [],
      linkedBugIds: [],
      testedHours: 12
    }
  ];

  it('формирует полный список команд, разделов, комнат и врагов', () => {
    let selectedView = '';
    let selectedRoom = '';

    const items = buildCommandPaletteItems({
      rooms: dummyRooms,
      enemies: dummyEnemies,
      builds: dummyBuilds,
      onSelectView: (v) => { selectedView = v; },
      onSelectRoom: (r) => { selectedRoom = r; },
      onSelectEnemy: () => {},
      onSelectBuild: () => {},
      onCopyContext: () => {},
      onCycleAuthor: () => {},
      onOpenGlossary: () => {},
      onOpenHotkeys: () => {},
      onToggleSound: () => {}
    });

    expect(items.length).toBeGreaterThan(15);

    // Проверка действий
    const copyItem = items.find(i => i.id === 'action-copy-context');
    expect(copyItem).toBeDefined();
    expect(copyItem?.category).toBe('actions');

    // Проверка разделов
    const dashboardItem = items.find(i => i.id === 'view-dashboard');
    expect(dashboardItem).toBeDefined();
    dashboardItem?.onSelect();
    expect(selectedView).toBe('dashboard');

    // Проверка комнат
    const bossRoomItem = items.find(i => i.id === 'room-room-boss');
    expect(bossRoomItem).toBeDefined();
    expect(bossRoomItem?.icon).toBe('👑');
    bossRoomItem?.onSelect();
    expect(selectedRoom).toBe('room-boss');

    // Проверка врагов
    const enemyItem = items.find(i => i.id === 'enemy-enm-1');
    expect(enemyItem).toBeDefined();
    expect(enemyItem?.subtitle).toContain('HP: 45');

    // Проверка сборок
    const buildItem = items.find(i => i.id === 'build-b-1');
    expect(buildItem).toBeDefined();
    expect(buildItem?.badge).toBe('v0.3.0-vertical-slice');

    for (const [key, view] of Object.entries(NUMBER_KEY_VIEWS)) {
      expect(items.find(item => item.id === `view-${view}`)?.shortcut).toBe(key);
    }
  });

  it('фильтрует по заголовку, слову и шорткату', () => {
    const items = buildCommandPaletteItems({
      rooms: dummyRooms,
      enemies: dummyEnemies,
      builds: dummyBuilds,
      onSelectView: () => {},
      onSelectRoom: () => {},
      onSelectEnemy: () => {},
      onSelectBuild: () => {},
      onCopyContext: () => {},
      onCycleAuthor: () => {},
      onOpenGlossary: () => {},
      onOpenHotkeys: () => {},
      onToggleSound: () => {}
    });

    expect(filterCommandItems(items, 'койот').some(item => item.id === 'action-glossary')).toBe(true);
    expect(filterCommandItems(items, 'неон').some(item => item.id === 'room-room-1')).toBe(true);
    expect(filterCommandItems(items, 'нет-такого-запроса')).toEqual([]);
  });
});
