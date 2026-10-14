import { PlaytestReport } from './types';

export const DEFAULT_REPORTS: PlaytestReport[] = [
  {
    id: 'bug-centurion-lock',
    title: 'После босса дверь арены не открывается',
    severity: 'blocker',
    status: 'open',
    tester: 'Тестер',
    scenePath: 'res://scenes/rooms/sector1/room_centurion_boss.tscn',
    roomId: 'r-sec1-boss',
    buildVersion: 'v0.2.0-demo',
    steps: '1. Дойти до арены центуриона.\n2. Победить босса.\n3. Подойти к восточной двери.',
    expected: 'Дверь открывается и пускает в следующую комнату.',
    actual: 'Дверь остаётся закрытой. Сохраниться нельзя, загрузка возвращает в тот же софтлок.',
    godotLog: "ERROR: Door._on_boss_defeated(): Signal 'arena_cleared' received, but node 'EastDoor/CollisionShape2D' was freed earlier.\n   at: Door._on_boss_defeated (res://scripts/objects/door.gd:38)",
    createdAt: '2026-10-01T12:00:00.000Z'
  },
  {
    id: 'bug-dash-gate',
    title: 'Рывок не снимает замок алтаря',
    severity: 'major',
    status: 'open',
    tester: 'Тестер',
    scenePath: 'res://scenes/rooms/sector3/room_dash_cache.tscn',
    roomId: 'r-sec3-shrine',
    buildVersion: 'v0.2.0-demo',
    steps: '1. Получить рывок.\n2. Вернуться к алтарю кислотных коллекторов.\n3. Ударить замок рывком.',
    expected: 'Проход открывается, как у других способностей.',
    actual: 'Замок мигает, но стена остаётся. Повторный рывок ничего не меняет.',
    createdAt: '2026-10-02T12:00:00.000Z'
  },
  {
    id: 'bug-alley-jump',
    title: 'Прыжок в переулке срывается у края',
    severity: 'polish',
    status: 'open',
    tester: 'Тестер',
    scenePath: 'res://scenes/rooms/sector0/room_neon_alley.tscn',
    roomId: 'r-hub-alley',
    buildVersion: 'v0.1.9-proto',
    steps: '1. Разогнаться вправо по неоновому переулку.\n2. Прыгнуть в последний кадр, стоя на краю платформы.',
    expected: 'Короткое окно coyote time ещё даёт прыжок.',
    actual: 'Утка падает, хотя спрайт ещё визуально на платформе.',
    createdAt: '2026-10-03T12:00:00.000Z'
  },
  {
    id: 'bug-acid-tiles',
    title: 'Тайлы кислоты мигают на стыке экрана',
    severity: 'minor',
    status: 'fixed',
    tester: 'Тестер',
    scenePath: 'res://scenes/rooms/sector3/room_acid_reservoir.tscn',
    roomId: 'r-sec3-acid-channel',
    buildVersion: 'v0.1.8-proto',
    steps: '1. Зайти в кислотный резервуар.\n2. Дойти до правого края камеры.',
    expected: 'Поверхность кислоты цельная.',
    actual: 'На стыке тайлов на один кадр вспыхивает чёрная полоса.',
    createdAt: '2026-09-28T12:00:00.000Z'
  }
];
