export type AssetType = 'tileset' | 'character' | 'ui' | 'sfx' | 'music';

export type AssetStage = 'concept' | 'pixel-art' | 'atlas-slice' | 'godot-import' | 'integrated';

export type AssetPriority = 'high' | 'normal' | 'low';

export type AssetSortBy = 'stage' | 'priority' | 'title' | 'date-desc';

export interface AssetChecklistItem {
  id: string;
  title: string;
  completed: boolean;
}

export interface AssetItem {
  id: string;
  title: string;
  type: AssetType;
  stage: AssetStage;
  priority: AssetPriority;
  author: string;
  description: string;
  targetPath: string;
  dimensions?: string;
  format?: string;
  tags: string[];
  godotTips: string;
  previewUrl?: string;
  checklist: AssetChecklistItem[];
  createdAt: string;
  updatedAt: string;
}

export interface AssetFilterState {
  type: AssetType | 'all';
  stage: AssetStage | 'all';
  priority: AssetPriority | 'all';
  searchQuery: string;
  sortBy: AssetSortBy;
}

export const STAGE_SEQUENCE: AssetStage[] = [
  'concept',
  'pixel-art',
  'atlas-slice',
  'godot-import',
  'integrated'
];

export const STAGE_META: Record<
  AssetStage,
  {
    label: string;
    ruTitle: string;
    stepNumber: number;
    icon: string;
    color: string;
    hint: string;
    godotTip: string;
  }
> = {
  concept: {
    label: 'Concept',
    ruTitle: 'Концепт',
    stepNumber: 1,
    icon: '✏️',
    color: '#94a3b8',
    hint: 'Набросок, референсы, выбор палитры и габаритов',
    godotTip: 'Определитесь с размером сетки (например 16x16 или 32x32)'
  },
  'pixel-art': {
    label: 'Pixel Art / Master',
    ruTitle: 'Пиксель-арт / Звук',
    stepNumber: 2,
    icon: '🎨',
    color: '#a855f7',
    hint: 'Чистовой пиксель-арт или аудиозапись / синтез эффекта',
    godotTip: 'Никаких субпикселей и размытия. Для звука — срез тишины в начале'
  },
  'atlas-slice': {
    label: 'Atlas Slice / Loop',
    ruTitle: 'Нарезка атласа',
    stepNumber: 3,
    icon: '✂️',
    color: '#38bdf8',
    hint: 'Сборка спрайтшита с шагом сетки или зацикливание лупа без щелчка',
    godotTip: 'Одинаковый размер каждого кадра (frame width/height) в спрайтшите'
  },
  'godot-import': {
    label: 'Godot Import',
    ruTitle: 'Импорт в Godot',
    stepNumber: 4,
    icon: '⚙️',
    color: '#f59e0b',
    hint: 'Настройка Texture Filter: Nearest, Pixel Snap и Audio Bus',
    godotTip: 'Import -> Texture Filter: Nearest (чтобы не мылило!), Snap 2D: On'
  },
  integrated: {
    label: 'In Game',
    ruTitle: 'В игре',
    stepNumber: 5,
    icon: '✅',
    color: '#10b981',
    hint: 'Привязано к сцене (AnimatedSprite2D, TileMapLayer, AudioStreamPlayer)',
    godotTip: 'Ассет полностью работает в игровом процессе и проверен в сборке'
  }
};

export const TYPE_META: Record<
  AssetType,
  {
    label: string;
    ruTitle: string;
    icon: string;
    color: string;
    defaultPathPrefix: string;
    defaultFormat: string;
    guide: string;
  }
> = {
  tileset: {
    label: 'Tileset',
    ruTitle: 'Тайлсет',
    icon: '🧱',
    color: '#38bdf8',
    defaultPathPrefix: 'res://assets/tilesets/',
    defaultFormat: '.png',
    guide: 'Тайлсеты для уровней: сетка 16x16, физический слой коллизий'
  },
  character: {
    label: 'Character',
    ruTitle: 'Персонаж',
    icon: '👾',
    color: '#a855f7',
    defaultPathPrefix: 'res://assets/sprites/',
    defaultFormat: '.png',
    guide: 'Спрайты героя и мобов: кадры анимации бега, прыжка, атак'
  },
  ui: {
    label: 'UI & Icons',
    ruTitle: 'Интерфейс',
    icon: '🎛️',
    color: '#f43f5e',
    defaultPathPrefix: 'res://assets/ui/',
    defaultFormat: '.png',
    guide: 'Элементы интерфейса: полоски HP, иконки способностей, шрифты'
  },
  sfx: {
    label: 'SFX',
    ruTitle: 'Звуки (SFX)',
    icon: '🔊',
    color: '#10b981',
    defaultPathPrefix: 'res://audio/sfx/',
    defaultFormat: '.wav',
    guide: 'Короткие звуковые эффекты: прыжки, удары, шаги (WAV без сжатия)'
  },
  music: {
    label: 'Music & Ambient',
    ruTitle: 'Музыка',
    icon: '🎵',
    color: '#fbbf24',
    defaultPathPrefix: 'res://audio/music/',
    defaultFormat: '.ogg',
    guide: 'Фоновая музыка и эмбиент локаций: OGG Vorbis с точкой зацикливания'
  }
};

export const PRIORITY_META: Record<
  AssetPriority,
  {
    label: string;
    ruTitle: string;
    color: string;
    badge: string;
    order: number;
  }
> = {
  high: {
    label: 'High',
    ruTitle: 'Высокий',
    color: '#f87171',
    badge: '🔥 Срочно',
    order: 0
  },
  normal: {
    label: 'Normal',
    ruTitle: 'Обычный',
    color: '#38bdf8',
    badge: '🔹 В плане',
    order: 1
  },
  low: {
    label: 'Low',
    ruTitle: 'Низкий',
    color: '#94a3b8',
    badge: '💤 Фоновый',
    order: 2
  }
};
