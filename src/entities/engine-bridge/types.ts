export type BridgeFileCategory = 'levels' | 'combat' | 'narrative' | 'code' | 'assets';

export interface BridgeConfigFile {
  id: string;
  filename: string;
  targetResPath: string;
  category: BridgeFileCategory;
  title: string;
  description: string;
  icon: string;
  sourceLabel: string;
  selected: boolean;
  content: string;
  binary?: Uint8Array;
  fileSizeBytes: number;
}

export type FolderAccess = 'none' | 'prompt' | 'ready';

export interface ReleaseChecklistItem {
  id: string;
  label: string;
  hint: string;
  category: 'engine' | 'qa' | 'build';
}

export const RELEASE_CHECKLIST: ReleaseChecklistItem[] = [
  {
    id: 'sync-configs',
    label: 'Синхронизировать конфиги в res://data/',
    hint: 'Выгрузите через файловый мост world_matrix.json, player_physics.tres и enemies.json',
    category: 'engine'
  },
  {
    id: 'stop-bugs',
    label: 'Проверить отсутствие стоп-багов',
    hint: 'Нет критических вылетов при переходе между локациями и смерти героя',
    category: 'qa'
  },
  {
    id: 'core-feel',
    label: 'Тест кор-геймплея на геймпаде и клавиатуре',
    hint: 'Прыжок, Coyote Time, парирование и диалоговые окна',
    category: 'qa'
  },
  {
    id: 'godot-export',
    label: 'Экспорт сборки в Godot (Project -> Export)',
    hint: 'Исполняемый файл в Release-режиме',
    category: 'build'
  },
  {
    id: 'changelog',
    label: 'Зафиксировать чейнджлог и отдать билд тестерам',
    hint: 'Карточка в трекере билдов и ссылка для команды',
    category: 'build'
  }
];

export type BuildStage = 'alpha' | 'vertical-slice' | 'demo-steam' | 'release-candidate' | 'release';

export type BuildStatus = 'stable' | 'testing' | 'critical-bugs' | 'deprecated';

export type ArtifactPlatform = 'windows' | 'linux' | 'steam' | 'itch' | 'drive';

export interface BuildArtifact {
  id: string;
  platform: ArtifactPlatform;
  title: string;
  url: string;
  sizeMb?: number;
}

export interface ChangelogEntry {
  id: string;
  type: 'feat' | 'fix' | 'balance' | 'perf';
  text: string;
  linkedTaskId?: string;
}

export interface BuildRelease {
  id: string;
  version: string;
  title: string;
  stage: BuildStage;
  status: BuildStatus;
  releaseDate: string;
  targetEngineVersion: string;
  description: string;
  changelog: ChangelogEntry[];
  artifacts: BuildArtifact[];
  linkedTaskIds: string[];
  linkedBugIds: string[];
  testedHours: number;
  isLatestRelease?: boolean;
}

export interface BuildFilterState {
  stage: BuildStage | 'all';
  status: BuildStatus | 'all';
  searchQuery: string;
}

export const STAGE_META: Record<
  BuildStage,
  {
    label: string;
    ruTitle: string;
    icon: string;
    color: string;
    hint: string;
  }
> = {
  alpha: {
    label: 'Alpha',
    ruTitle: 'Альфа-прототип',
    icon: '🧪',
    color: '#94a3b8',
    hint: 'Ранний геймплейный прототип, проверка базового движения и боевой системы'
  },
  'vertical-slice': {
    label: 'Vertical Slice',
    ruTitle: 'Vertical Slice',
    icon: '💎',
    color: '#a855f7',
    hint: 'Готовая законченная часть игры (1-2 сектора) со всеми полировками и боссом'
  },
  'demo-steam': {
    label: 'Steam Demo',
    ruTitle: 'Демо-версия Steam',
    icon: '🎮',
    color: '#00f2fe',
    hint: 'Публичная демо-версия для фестиваля Steam Next Fest и игроков'
  },
  'release-candidate': {
    label: 'Release Candidate',
    ruTitle: 'Кандидат в релиз (RC)',
    icon: '🏁',
    color: '#fbbf24',
    hint: 'Полная версия игры, проходит финальное QA и исправление стоп-багов'
  },
  release: {
    label: 'Full Release',
    ruTitle: 'Финальный релиз 1.0',
    icon: '🏆',
    color: '#10b981',
    hint: 'Золотой мастер билда, опубликованный в магазинах'
  }
};

export const STATUS_META: Record<
  BuildStatus,
  {
    label: string;
    ruTitle: string;
    badge: string;
    color: string;
    order: number;
  }
> = {
  stable: {
    label: 'Stable',
    ruTitle: 'Стабильная сборка',
    badge: '✅ Стабильный',
    color: '#10b981',
    order: 0
  },
  testing: {
    label: 'In Testing',
    ruTitle: 'Идёт плейтест',
    badge: '🔍 На тестах',
    color: '#38bdf8',
    order: 1
  },
  'critical-bugs': {
    label: 'Critical Bugs',
    ruTitle: 'Критические баги',
    badge: '💥 Блокеры',
    color: '#f87171',
    order: 2
  },
  deprecated: {
    label: 'Deprecated',
    ruTitle: 'Устаревший билд',
    badge: '💤 Устарел',
    color: '#64748b',
    order: 3
  }
};

export const CATEGORY_META: Record<
  BridgeFileCategory,
  {
    ruTitle: string;
    icon: string;
    color: string;
  }
> = {
  levels: { ruTitle: 'Уровни & Мир', icon: '🗺️', color: '#00f2fe' },
  combat: { ruTitle: 'Боевка & Враги', icon: '👾', color: '#f43f5e' },
  narrative: { ruTitle: 'Сюжет & Диалоги', icon: '📜', color: '#a855f7' },
  code: { ruTitle: 'Скрипты движка', icon: '⚙️', color: '#fbbf24' },
  assets: { ruTitle: 'Реестры ресурсов', icon: '📦', color: '#10b981' }
};
