import { describe, expect, it } from 'vitest';
import { DEFAULT_ROOMS, DEFAULT_SECTORS } from './defaultData';
import { solveGatingProgression } from './gatingSolver';
import { exportToGdscript, exportToJson } from './gdscriptExporter';
import {
  allAbilitiesUnlocked,
  connectionAdded,
  connectionLockUpdated,
  connectionRemoved,
  roomAdded,
  roomImageUpdated,
  roomMatrixReducer,
  roomRemoved,
  roomSelected,
  simulatedAbilitiesReset,
  simulatedAbilityToggled
} from './slice';

describe('Room & Lock Gating Matrix Solver', () => {
  it('на старте (только базовый прыжок) блокирует закрытые зоны', () => {
    const result = solveGatingProgression(DEFAULT_ROOMS, ['ab-jump'], 'r-hub-base');
    expect(result.reachableRoomIds.has('r-hub-base')).toBe(true);
    expect(result.reachableRoomIds.has('r-hub-alley')).toBe(true);

    // Заперто за синей лазерной решеткой (нужен ab-eye)
    expect(result.reachableRoomIds.has('r-sec1-gate')).toBe(false);
    expect(result.reachableRoomIds.has('r-sec1-shrine')).toBe(false);

    // Заперто за пропастью (нужен ab-dash)
    expect(result.reachableRoomIds.has('r-sec3-shrine')).toBe(false);

    expect(result.blockedRoomCount).toBeGreaterThan(0);
    expect(result.blockingLocks.length).toBeGreaterThan(0);
  });

  it('при получении Нейро-глаза открывает лаборатории Сектора 1', () => {
    const withEye = solveGatingProgression(DEFAULT_ROOMS, ['ab-jump', 'ab-eye'], 'r-hub-base');
    expect(withEye.reachableRoomIds.has('r-sec1-gate')).toBe(true);
    expect(withEye.reachableRoomIds.has('r-sec1-shrine')).toBe(true);
    expect(withEye.reachableRoomIds.has('r-sec1-secret')).toBe(true);
    expect(withEye.reachableRoomIds.has('r-sec1-boss')).toBe(true);
  });

  it('при открытии всех способностей и ключей доступны все комнаты', () => {
    const allAbilities = ['ab-jump', 'ab-eye', 'ab-parry', 'ab-dash', 'ab-grapple', 'key-centurion'];
    const result = solveGatingProgression(DEFAULT_ROOMS, allAbilities, 'r-hub-base');
    expect(result.reachableRoomIds.size).toBe(DEFAULT_ROOMS.length);
    expect(result.blockedRoomCount).toBe(0);
  });
});

describe('GDScript & JSON World Exporter', () => {
  it('генерирует корректный синтаксис GDScript 4', () => {
    const gdCode = exportToGdscript(DEFAULT_ROOMS, DEFAULT_SECTORS);
    expect(gdCode).toContain('class_name WorldRoomDatabase');
    expect(gdCode).toContain('extends RefCounted');
    expect(gdCode).toContain('const SECTORS: Dictionary = {');
    expect(gdCode).toContain('const ROOMS: Dictionary = {');
    expect(gdCode).toContain('r-hub-base');
  });

  it('генерирует валидный JSON', () => {
    const jsonStr = exportToJson(DEFAULT_ROOMS, DEFAULT_SECTORS);
    const parsed = JSON.parse(jsonStr);
    expect(parsed.project).toBe('Cyber-Duck Metroidvania');
    expect(parsed.rooms.length).toBe(DEFAULT_ROOMS.length);
  });
});

describe('Room Matrix Redux Slice', () => {
  const initial = roomMatrixReducer(undefined, { type: '@@INIT' });

  it('позволяет выбирать комнату и переключать симулируемые способности', () => {
    const state1 = roomMatrixReducer(initial, roomSelected('r-sec1-boss'));
    expect(state1.selectedRoomId).toBe('r-sec1-boss');

    const state2 = roomMatrixReducer(state1, simulatedAbilityToggled('ab-eye'));
    expect(state2.simulatedAbilities).toContain('ab-eye');

    const state3 = roomMatrixReducer(state2, simulatedAbilitiesReset());
    expect(state3.simulatedAbilities).toEqual(['ab-jump']);
  });

  it('добавляет и удаляет комнату', () => {
    const newRoom = {
      id: 'r-test-secret',
      name: 'Тестовая скрытая шахта',
      sectorId: 'sec-0',
      gridX: 1,
      gridY: 1,
      size: '1x1' as const,
      type: 'secret' as const,
      status: 'concept' as const,
      description: 'Тест',
      godotScene: 'res://test.tscn',
      connections: [],
      loot: []
    };

    const stateWithRoom = roomMatrixReducer(initial, roomAdded(newRoom));
    expect(stateWithRoom.rooms.some(r => r.id === 'r-test-secret')).toBe(true);

    const stateRemoved = roomMatrixReducer(stateWithRoom, roomRemoved('r-test-secret'));
    expect(stateRemoved.rooms.some(r => r.id === 'r-test-secret')).toBe(false);
  });

  it('поддерживает соединение комнат и установку замков', () => {
    // Соединяем r-hub-base и r-sec1-secret
    const connectedState = roomMatrixReducer(initial, connectionAdded({
      fromRoomId: 'r-hub-base',
      toRoomId: 'r-sec1-secret',
      direction: 'north',
      lock: {
        id: 'lk-test',
        direction: 'north',
        requiredAbilityId: 'ab-eye',
        label: 'Скрытый лаз',
        type: 'ability'
      }
    }));

    const baseRoom = connectedState.rooms.find(r => r.id === 'r-hub-base');
    const secretRoom = connectedState.rooms.find(r => r.id === 'r-sec1-secret');
    expect(baseRoom?.connections.some(c => c.targetRoomId === 'r-sec1-secret')).toBe(true);
    expect(secretRoom?.connections.some(c => c.targetRoomId === 'r-hub-base')).toBe(true);

    // Поддерживает явное указание toDirection при соединении нитью
    const customDirState = roomMatrixReducer(initial, connectionAdded({
      fromRoomId: 'r-hub-base',
      toRoomId: 'r-sec1-boss',
      direction: 'east',
      toDirection: 'north'
    }));
    const customFrom = customDirState.rooms.find(r => r.id === 'r-hub-base');
    const customTo = customDirState.rooms.find(r => r.id === 'r-sec1-boss');
    expect(customFrom?.connections.find(c => c.targetRoomId === 'r-sec1-boss')?.direction).toBe('east');
    expect(customTo?.connections.find(c => c.targetRoomId === 'r-hub-base')?.direction).toBe('north');

    // Обновляем замок
    const lockUpdatedState = roomMatrixReducer(connectedState, connectionLockUpdated({
      fromRoomId: 'r-hub-base',
      toRoomId: 'r-sec1-secret',
      lock: undefined
    }));
    const baseConn = lockUpdatedState.rooms.find(r => r.id === 'r-hub-base')?.connections.find(c => c.targetRoomId === 'r-sec1-secret');
    expect(baseConn?.lock).toBeUndefined();

    // Удаляем связь
    const disconnectedState = roomMatrixReducer(lockUpdatedState, connectionRemoved({
      fromRoomId: 'r-hub-base',
      toRoomId: 'r-sec1-secret'
    }));
    expect(disconnectedState.rooms.find(r => r.id === 'r-hub-base')?.connections.some(c => c.targetRoomId === 'r-sec1-secret')).toBe(false);
  });

  it('обновляет изображение комнаты', () => {
    const withImg = roomMatrixReducer(initial, roomImageUpdated({
      roomId: 'r-hub-base',
      imageUrl: 'https://example.com/base.png'
    }));
    expect(withImg.rooms.find(r => r.id === 'r-hub-base')?.imageUrl).toBe('https://example.com/base.png');
  });
});
