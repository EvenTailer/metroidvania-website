import { AssetItem } from './types';

export const DEFAULT_ASSETS: AssetItem[] = [
  {
    id: 'asset-duck-locomotion',
    title: 'Спрайтшит Кибер-Утки: Бег и Прыжок',
    type: 'character',
    stage: 'godot-import',
    priority: 'high',
    author: 'Cleaf',
    description: 'Основной набор спрайтов движения главного героя. Содержит кадры idle (4 кадра), run (8 кадров) и jump/fall (3 кадра).',
    targetPath: 'res://assets/sprites/hero/cyber_duck_locomotion.png',
    dimensions: '32x32 px (Спрайтшит 256x96 px)',
    format: '.png',
    tags: ['герой', 'анимации', 'движение', 'игрок'],
    godotTips: 'AnimatedSprite2D. Настройки импорта: Texture Filter = Nearest, Pixel Snap = On. В SpriteFrames создать клипы: idle (6 FPS), run (12 FPS), jump (10 FPS).',
    checklist: [
      { id: 'c1', title: 'Концепт силуэта и клюва в профиль', completed: true },
      { id: 'c2', title: 'Отрисовка 32x32 в 16-цветной неоновой палитре', completed: true },
      { id: 'c3', title: 'Нарезка в атлас с единым центрированием pivot', completed: true },
      { id: 'c4', title: 'Импорт в Godot: Texture Filter = Nearest', completed: true },
      { id: 'c5', title: 'Привязка к ноде CharacterBody2D и скрипту', completed: false }
    ],
    createdAt: '2026-10-05T10:00:00.000Z',
    updatedAt: '2026-10-06T09:30:00.000Z'
  },
  {
    id: 'asset-neon-caverns-tileset',
    title: 'Тайлсет Неоновых Пещер (Сектор Альфа)',
    type: 'tileset',
    stage: 'integrated',
    priority: 'high',
    author: 'Cleaf',
    description: 'Базовый набор плиток для первой зоны игры: блоки пола, наклонные поверхности, шипы и неоновые трубы.',
    targetPath: 'res://assets/tilesets/neon_caverns_16x16.png',
    dimensions: '16x16 px (Атлас 256x256 px)',
    format: '.png',
    tags: ['тайлсет', 'сектор-альфа', 'коллизии', 'окружение'],
    godotTips: 'TileMapLayer в Godot 4.3. Настроить Physics Layer 0 для твердых стен и One-way Platforms для полупрозрачных платформ.',
    checklist: [
      { id: 'c1', title: 'Дизайн модульной сетки 16x16', completed: true },
      { id: 'c2', title: 'Пиксель-арт автотайлов (3x3 minimal terrain)', completed: true },
      { id: 'c3', title: 'Нарезка в тайлсет с отступами без артефактов', completed: true },
      { id: 'c4', title: 'Импорт в Godot: выставить Margin = 0, Tile Size = 16x16', completed: true },
      { id: 'c5', title: 'Расстановка коллизий и интеграция на тестовом уровне', completed: true }
    ],
    createdAt: '2026-10-04T12:00:00.000Z',
    updatedAt: '2026-10-06T11:00:00.000Z'
  },
  {
    id: 'asset-dash-booster-sfx',
    title: 'Звуковой эффект рывка (Dash SFX)',
    type: 'sfx',
    stage: 'atlas-slice',
    priority: 'high',
    author: 'Ilya',
    description: 'Звук включения реактивного ускорителя утки. Должен звучать сочно, с легким синтетическим свистом и басовым панчем.',
    targetPath: 'res://audio/sfx/hero_dash_boost.wav',
    dimensions: '0.45 сек',
    format: '.wav (16-bit 44.1kHz)',
    tags: ['звук', 'рывок', 'способность', 'фидбек'],
    godotTips: 'WAV без потерь для мгновенного отклика при нажатии кнопки. Назначить на шину Audio Bus «SFX».',
    checklist: [
      { id: 'c1', title: 'Референсы звука: Cyberpunk / Metroid Dread', completed: true },
      { id: 'c2', title: 'Синтез в DAW (шум + фильтр + саб-кик)', completed: true },
      { id: 'c3', title: 'Срез тишины в начале (zero attack lag)', completed: true },
      { id: 'c4', title: 'Импорт в Godot и настройка громкости -3dB', completed: false },
      { id: 'c5', title: 'Вызов из state machine при переходе в DashState', completed: false }
    ],
    createdAt: '2026-10-05T14:30:00.000Z',
    updatedAt: '2026-10-06T12:15:00.000Z'
  },
  {
    id: 'asset-hive-warden-boss',
    title: 'Босс Страж Улья (Hive Warden): Спрайты',
    type: 'character',
    stage: 'pixel-art',
    priority: 'normal',
    author: 'Cleaf',
    description: 'Массивный механический босс сектора Бета. Анимации: парение, выстрел лазером из брюшка, получение урона.',
    targetPath: 'res://assets/sprites/bosses/hive_warden_boss.png',
    dimensions: '64x64 px (Атлас 512x256 px)',
    format: '.png',
    tags: ['босс', 'сектор-бета', 'мех', 'враг'],
    godotTips: 'Использовать AnimationPlayer с треками спрайта и Area2D хитбоксов для идеальной синхронизации лазерных залпов.',
    checklist: [
      { id: 'c1', title: 'Концепт-арт: угрожающий кибер-шершень', completed: true },
      { id: 'c2', title: 'Отрисовка фаз полета и дула лазера', completed: true },
      { id: 'c3', title: 'Сборка атласа фаз боя', completed: false },
      { id: 'c4', title: 'Импорт в Godot: Nearest filter', completed: false },
      { id: 'c5', title: 'Связка с BossPhaseController.gd', completed: false }
    ],
    createdAt: '2026-10-06T08:00:00.000Z',
    updatedAt: '2026-10-06T13:40:00.000Z'
  },
  {
    id: 'asset-hud-bars-ui',
    title: 'HUD: Бары Здоровья и Нано-Энергии',
    type: 'ui',
    stage: 'godot-import',
    priority: 'normal',
    author: 'Ilya',
    description: 'Кибернетические индикаторы здоровья (зеленый/красный) и энергии для способностей (неоновый циан).',
    targetPath: 'res://assets/ui/hud_health_energy_bars.png',
    dimensions: '128x32 px (9-patch margins 4,4,4,4)',
    format: '.png',
    tags: ['интерфейс', 'хп', 'энергия', 'hud'],
    godotTips: 'TextureProgressBar. Задать NinePatchMargins чтобы рамка не искажалась при изменении длины полоски.',
    checklist: [
      { id: 'c1', title: 'Эскиз интерфейса в углу экрана', completed: true },
      { id: 'c2', title: 'Отрисовка фона бара, рамки и градиента заполнения', completed: true },
      { id: 'c3', title: 'Нарезка на подложку и текстуру прогресса', completed: true },
      { id: 'c4', title: 'Настройка TextureProgressBar и NinePatchRect', completed: true },
      { id: 'c5', title: 'Подписка на сигнал health_changed в Player.gd', completed: false }
    ],
    createdAt: '2026-10-05T16:00:00.000Z',
    updatedAt: '2026-10-06T10:20:00.000Z'
  },
  {
    id: 'asset-ambient-sector-alpha',
    title: 'Музыкальная тема Сектора Альфа (OST)',
    type: 'music',
    stage: 'concept',
    priority: 'low',
    author: 'Ilya',
    description: 'Мрачный синтвейв-эмбиент с эхом капель и гулом старых серверов. Темп 90 BPM, плавная фоновая динамика.',
    targetPath: 'res://audio/music/sector_alpha_ambient.ogg',
    dimensions: '2 мин 15 сек (Loop)',
    format: '.ogg (Ogg Vorbis 160kbps)',
    tags: ['музыка', 'эмбиент', 'сектор-альфа', 'ost'],
    godotTips: 'Импортировать как OGG Vorbis. Обязательно выставить Loop = On. В Godot 4.3 можно задать точный Loop Offset в секундах.',
    checklist: [
      { id: 'c1', title: 'Мудборд и гармоническая последовательность', completed: true },
      { id: 'c2', title: 'Аранжировка синтов и басовой пульсации', completed: false },
      { id: 'c3', title: 'Бесшовный рендеринг петли (seamless loop point)', completed: false },
      { id: 'c4', title: 'Экспорт в Ogg Vorbis и импорт в Godot', completed: false },
      { id: 'c5', title: 'Интеграция с локацией через Area2D MusicTrigger', completed: false }
    ],
    createdAt: '2026-10-06T11:00:00.000Z',
    updatedAt: '2026-10-06T11:00:00.000Z'
  }
];
