export type BugSeverity = 'blocker' | 'major' | 'minor' | 'polish';
export type BugStatus = 'open' | 'fixed' | 'wontfix';
export type PlaytestSortBy = 'severity' | 'date-desc' | 'date-asc' | 'status' | 'title';

export interface PlaytestReport {
  id: string;
  title: string;
  severity: BugSeverity;
  status: BugStatus;
  tester: string;
  scenePath: string;
  roomId: string | null;
  steps: string;
  expected: string;
  actual: string;
  buildVersion?: string;
  godotLog?: string;
  screenshotUrl?: string;
  createdAt: string;
}

export interface PlaytestFilterState {
  severity: BugSeverity | 'all';
  status: BugStatus | 'all';
  searchQuery: string;
  sortBy: PlaytestSortBy;
}

export const SEVERITY_META: Record<
  BugSeverity,
  {
    label: string;
    ruTitle: string;
    badge: string;
    shortBadge: string;
    hint: string;
    color: string;
    order: number;
  }
> = {
  blocker: {
    label: 'Blocker',
    ruTitle: 'Критический',
    badge: '💥 Критический',
    shortBadge: '💥 Стоп-баг',
    hint: 'Игра сломана, вылетает или дальше пройти нельзя',
    color: '#f87171',
    order: 0
  },
  major: {
    label: 'Major',
    ruTitle: 'Серьёзный',
    badge: '⚠️ Серьёзный',
    shortBadge: '⚠️ Проход сломан',
    hint: 'Способность или проход не работает, игрок застрял',
    color: '#fbbf24',
    order: 1
  },
  minor: {
    label: 'Minor',
    ruTitle: 'Мелкий',
    badge: '🐛 Мелкий баг',
    shortBadge: '🐛 Картинка/звук',
    hint: 'Визуальный дефект или мигание текстур, играть можно',
    color: '#38bdf8',
    order: 2
  },
  polish: {
    label: 'Polish',
    ruTitle: 'Шлифовка',
    badge: '✨ Шлифовка',
    shortBadge: '✨ Ощущения',
    hint: 'Неудобное управление, тайминг прыжка, баланс',
    color: '#c084fc',
    order: 3
  }
};

export const STATUS_META: Record<
  BugStatus,
  {
    label: string;
    actionLabel: string;
    badge: string;
    hint: string;
    color: string;
    order: number;
  }
> = {
  open: {
    label: 'Открыт',
    actionLabel: 'В работе',
    badge: '🔴 Надо починить',
    hint: 'Баг найден и ждёт исправления программистом',
    color: '#f87171',
    order: 0
  },
  fixed: {
    label: 'Исправлен',
    actionLabel: 'Исправлено',
    badge: '🟢 Исправлено',
    hint: 'Ошибка устранена в коде игры',
    color: '#34d399',
    order: 1
  },
  wontfix: {
    label: 'Не баг',
    actionLabel: 'Не баг',
    badge: '⚪ Так задумано',
    hint: 'Это игровая механика, а не ошибка',
    color: '#94a3b8',
    order: 2
  }
};

export const SORT_OPTIONS: { id: PlaytestSortBy; label: string }[] = [
  { id: 'severity', label: '💥 Сначала критические' },
  { id: 'date-desc', label: '🕒 Сначала новые' },
  { id: 'date-asc', label: '⏳ Сначала старые' },
  { id: 'status', label: '🔴 Сначала неисправленные' },
  { id: 'title', label: '🔤 По названию (А-Я)' }
];
