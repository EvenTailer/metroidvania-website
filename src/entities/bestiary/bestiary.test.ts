import { describe, expect, it } from 'vitest';
import { DEFAULT_ENEMIES } from './defaultData';
import {
  exportBestiaryToJson,
  exportEnemyDatabaseGdscript,
  exportEnemyToTres
} from './gdscriptExporter';
import { parseBestiaryImport } from './importBestiary';
import {
  bestiaryFilterChanged,
  bestiaryImported,
  bestiaryReducer,
  bestiaryResetToDefault,
  enemyAdded,
  enemyChecklistToggled,
  enemyRemoved,
  enemyUpdated,
  selectedEnemySet
} from './slice';
import { EnemyItem } from './types';

describe('Bestiary Combat Exporters', () => {
  it('генерирует валидный файл Godot 4 .tres для врага', () => {
    const boss = DEFAULT_ENEMIES.find(e => e.type === 'boss')!;
    const tres = exportEnemyToTres(boss);
    expect(tres).toContain('[gd_resource type="Resource" script_class="EnemyData"');
    expect(tres).toContain(`id = "${boss.id}"`);
    expect(tres).toContain(`max_hp = ${boss.hp}`);
    expect(tres).toContain('script = ExtResource("1_enemy_script")');
    expect(tres).toContain('lore =');
    expect(tres).toContain('spawn_rooms =');
    expect(tres).toContain('new_attacks');
  });

  it('генерирует базу данных GDScript с методами поиска', () => {
    const gdCode = exportEnemyDatabaseGdscript(DEFAULT_ENEMIES);
    expect(gdCode).toContain('class_name EnemyDatabase');
    expect(gdCode).toContain('extends RefCounted');
    expect(gdCode).toContain('static func get_enemy(id: String) -> Dictionary:');
    expect(gdCode).toContain('static func get_bosses() -> Array:');
    expect(gdCode).toContain('boss-centurion-1');
    expect(gdCode).toContain('"spawn_rooms"');
    expect(gdCode).toContain('"description"');
    expect(gdCode).toContain('new_attacks');
  });

  it('экспортирует бестиарий в валидный JSON', () => {
    const jsonStr = exportBestiaryToJson(DEFAULT_ENEMIES);
    const parsed = JSON.parse(jsonStr);
    expect(parsed.project).toBe('Cyber-Duck Metroidvania');
    expect(parsed.totalEnemies).toBe(DEFAULT_ENEMIES.length);
  });
});

describe('Bestiary Redux Slice', () => {
  const initial = bestiaryReducer(undefined, { type: '@@INIT' });

  it('поддерживает добавление и удаление моба', () => {
    const newEnemy: EnemyItem = {
      id: 'enm-test',
      name: 'Тестовый дрон',
      code: 'TEST-01',
      type: 'minion',
      sectorId: 'sec-0',
      hp: 50,
      damage: 10,
      speed: 100,
      staggerThreshold: 2,
      parryWindow: 0.15,
      godotScene: 'res://test.tscn',
      description: 'Тест',
      lore: 'Тест',
      checklist: {
        sprite: false,
        skeleton2d: false,
        hitboxes: false,
        audio: false,
        tested: false
      },
      spawnRoomIds: [],
      attacks: []
    };

    const stateWithNew = bestiaryReducer(initial, enemyAdded(newEnemy));
    expect(stateWithNew.items.some(e => e.id === 'enm-test')).toBe(true);
    expect(stateWithNew.selectedEnemyId).toBe('enm-test');

    const stateRemoved = bestiaryReducer(stateWithNew, enemyRemoved('enm-test'));
    expect(stateRemoved.items.some(e => e.id === 'enm-test')).toBe(false);
  });

  it('переключает чеклист продакшена моба', () => {
    const target = initial.items[0];
    const prevVal = target.checklist.sprite;
    const toggledState = bestiaryReducer(
      initial,
      enemyChecklistToggled({ enemyId: target.id, step: 'sprite' })
    );
    const updated = toggledState.items.find(e => e.id === target.id);
    expect(updated?.checklist.sprite).toBe(!prevVal);
  });

  it('обновляет фильтры и выбранного моба', () => {
    const state1 = bestiaryReducer(initial, selectedEnemySet('boss-crusher-2'));
    expect(state1.selectedEnemyId).toBe('boss-crusher-2');

    const state2 = bestiaryReducer(state1, bestiaryFilterChanged({ type: 'boss', sectorId: 'sec-1' }));
    expect(state2.filter.type).toBe('boss');
    expect(state2.filter.sectorId).toBe('sec-1');

    const stateReset = bestiaryReducer(state2, bestiaryResetToDefault());
    expect(stateReset.filter.type).toBe('all');
  });

  it('заменяет каталог импортом', () => {
    const imported = bestiaryReducer(initial, bestiaryImported([newEnemy()]));
    expect(imported.items).toHaveLength(1);
    expect(imported.selectedEnemyId).toBe('enm-test');
  });
});

function newEnemy(): EnemyItem {
  return {
    id: 'enm-test',
    name: 'Тестовый дрон',
    code: 'TEST-01',
    type: 'minion',
    sectorId: 'sec-0',
    hp: 50,
    damage: 10,
    speed: 100,
    staggerThreshold: 2,
    parryWindow: 0.15,
    godotScene: 'res://test.tscn',
    description: 'Тест',
    lore: 'Тест',
    spawnRoomIds: ['r-hub-alley'],
    checklist: {
      sprite: false,
      skeleton2d: false,
      hitboxes: false,
      audio: false,
      tested: false
    },
    attacks: []
  };
}

describe('Bestiary import', () => {
  it('читает JSON-снимок и сохраняет комнаты спавна', () => {
    const raw = exportBestiaryToJson([newEnemy()]);
    const result = parseBestiaryImport(raw);
    if ('error' in result) throw new Error(result.error);
    expect(result.enemies[0].spawnRoomIds).toEqual(['r-hub-alley']);
    expect(result.enemies[0].lore).toBe('Тест');
  });

  it('отклоняет текст без массива врагов', () => {
    const result = parseBestiaryImport('{"project":"x"}');
    expect('error' in result).toBe(true);
  });
});
