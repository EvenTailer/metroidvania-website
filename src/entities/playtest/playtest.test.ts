import { describe, expect, it } from 'vitest';
import { formatReportAsMarkdown, parseReportsFromJson } from './export';
import { DEFAULT_REPORTS } from './defaultData';
import { normalizeReport } from './normalize';
import {
  playtestReducer,
  reportAdded,
  reportRemoved,
  reportsImported,
  reportStatusSet,
  screenshotsHydrated
} from './slice';
import { PlaytestReport } from './types';

function fresh(): PlaytestReport {
  return {
    id: 'bug-new',
    title: 'Новый баг',
    severity: 'major',
    status: 'open',
    tester: 'Тестер',
    scenePath: 'res://scenes/rooms/sector0/room_neon_alley.tscn',
    roomId: 'r-hub-alley',
    buildVersion: 'v0.2.0-demo',
    godotLog: 'ERROR: Player.jump() failed',
    steps: '1. Прыгнуть.',
    expected: 'Прыжок.',
    actual: 'Падение.',
    createdAt: '2026-10-06T00:00:00.000Z'
  };
}

describe('playtest log', () => {
  it('эталон содержит комнату, билд, лог и сцену Godot', () => {
    const blocker = DEFAULT_REPORTS.find(item => item.severity === 'blocker');
    expect(blocker?.roomId).toBe('r-sec1-boss');
    expect(blocker?.scenePath.endsWith('.tscn')).toBe(true);
    expect(blocker?.steps).toContain('1.');
    expect(blocker?.buildVersion).toBe('v0.2.0-demo');
    expect(blocker?.godotLog).toContain('ERROR');
  });

  it('отбрасывает запись без названия', () => {
    expect(normalizeReport({ severity: 'blocker' }, 0)).toBeNull();
  });

  it('нормализует новые поля buildVersion и godotLog', () => {
    const norm = normalizeReport({
      title: 'Ошибка шейдера',
      buildVersion: 'v0.3.0',
      godotLog: 'SCRIPT ERROR: line 12'
    }, 1);
    expect(norm?.buildVersion).toBe('v0.3.0');
    expect(norm?.godotLog).toBe('SCRIPT ERROR: line 12');
  });

  it('добавляет и закрывает отчёт', () => {
    const initial = playtestReducer(undefined, { type: '@@INIT' });
    const next = playtestReducer(initial, reportAdded(fresh()));
    expect(next.items[0].id).toBe('bug-new');
    expect(next.selectedReportId).toBe('bug-new');
    const fixed = playtestReducer(next, reportStatusSet({ id: 'bug-new', status: 'fixed' }));
    expect(fixed.items[0].status).toBe('fixed');
    const removed = playtestReducer(fixed, reportRemoved('bug-new'));
    expect(removed.items.some(item => item.id === 'bug-new')).toBe(false);
  });

  it('поддерживает гидрацию скриншотов из IndexedDB и импорт JSON', () => {
    const initial = playtestReducer(undefined, { type: '@@INIT' });
    const withBug = playtestReducer(initial, reportAdded(fresh()));
    const hydrated = playtestReducer(withBug, screenshotsHydrated({ 'bug-new': 'data:image/jpeg;base64,abc' }));
    expect(hydrated.items.find(i => i.id === 'bug-new')?.screenshotUrl).toBe('data:image/jpeg;base64,abc');

    const imported = playtestReducer(hydrated, reportsImported([
      { ...fresh(), id: 'bug-imported', title: 'Импортированный баг' }
    ]));
    expect(imported.items.some(i => i.id === 'bug-imported')).toBe(true);
  });

  it('форматирует Markdown и парсит JSON для экспорта/импорта', () => {
    const sample = fresh();
    const md = formatReportAsMarkdown(sample, 'Неоновый переулок');
    expect(md).toContain('### [Major] Новый баг');
    expect(md).toContain('`v0.2.0-demo`');
    expect(md).toContain('ERROR: Player.jump() failed');

    const json = JSON.stringify([sample]);
    const parsed = parseReportsFromJson(json);
    expect(parsed.length).toBe(1);
    expect(parsed[0].title).toBe('Новый баг');
  });
});
