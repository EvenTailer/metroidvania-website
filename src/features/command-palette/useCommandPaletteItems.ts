import { useMemo } from 'react';
import { numberKeyForView, ViewType } from '../../shared/config/views';
import { CommandPaletteItem } from './types';
import { RoomNode } from '../../entities/room-matrix';
import { EnemyItem } from '../../entities/bestiary';
import { BuildRelease } from '../../entities/engine-bridge';

interface BuildCommandItemsParams {
  rooms: RoomNode[];
  enemies: EnemyItem[];
  builds: BuildRelease[];
  onSelectView: (view: ViewType) => void;
  onSelectRoom: (roomId: string) => void;
  onSelectEnemy: (enemyId: string) => void;
  onSelectBuild: (buildId: string) => void;
  onCopyContext: () => void;
  onCycleAuthor: () => void;
  onOpenGlossary: () => void;
  onOpenHotkeys: () => void;
  onToggleSound: () => void;
  onOpenBackup?: () => void;
}

export function buildCommandPaletteItems({
  rooms,
  enemies,
  builds,
  onSelectView,
  onSelectRoom,
  onSelectEnemy,
  onSelectBuild,
  onCopyContext,
  onCycleAuthor,
  onOpenGlossary,
  onOpenHotkeys,
  onToggleSound,
  onOpenBackup
}: BuildCommandItemsParams): CommandPaletteItem[] {
  const items: CommandPaletteItem[] = [];

  // 1. Быстрые действия
  items.push(
    {
      id: 'action-copy-context',
      category: 'actions',
      title: 'Скопировать контекст для ИИ-агента',
      subtitle: 'Копирует актуальный статус всех задач, роадмапа и комнат в буфер обмена',
      icon: '📋',
      badge: 'AI',
      keywords: ['ai', 'контекст', 'агент', 'промпт', 'скопировать'],
      onSelect: onCopyContext
    },
    {
      id: 'action-glossary',
      category: 'actions',
      title: 'Открыть справочник разработчика',
      subtitle: 'Понятные даже школьнику термины Godot 4, Coyote Time и гейтинга',
      icon: '📖',
      shortcut: 'G',
      badge: 'Справка',
      keywords: ['глоссарий', 'словарь', 'термины', 'койот', 'буфер', 'godot'],
      onSelect: onOpenGlossary
    },
    ...(onOpenBackup ? [{
      id: 'action-backup',
      category: 'actions' as const,
      title: 'Резервная копия и серверные данные',
      subtitle: 'Скачать полный бэкап проекта (.json) или восстановить файлы',
      icon: '📦',
      badge: 'Бэкап',
      keywords: ['бэкап', 'резервная копия', 'экспорт', 'импорт', 'сервер', 'сохранить'],
      onSelect: onOpenBackup
    }] : []),
    {
      id: 'action-hotkeys',
      category: 'actions',
      title: 'Шпаргалка горячих клавиш',
      subtitle: 'Все комбинации клавиш для быстрого управления хабом',
      icon: '⌨️',
      shortcut: '?',
      badge: 'Клавиши',
      keywords: ['шорткаты', 'горячие клавиши', 'кнопки', 'hotkeys'],
      onSelect: onOpenHotkeys
    },
    {
      id: 'action-cycle-author',
      category: 'actions',
      title: 'Сменить автора / роль в команде',
      subtitle: 'Переключение между Юзер 1, Юзер 2 и Юзер 3',
      icon: '👤',
      badge: 'Команда',
      keywords: ['автор', 'пользователь', 'роль', 'профиль'],
      onSelect: onCycleAuthor
    },
    {
      id: 'action-toggle-sound',
      category: 'actions',
      title: 'Вкл / Выкл звуковые эффекты хаба',
      subtitle: 'Мягкие футуристические клики и подтверждения',
      icon: '🔊',
      shortcut: 'M',
      badge: 'Аудио',
      keywords: ['звук', 'аудио', 'mute', 'саунд', 'клик'],
      onSelect: onToggleSound
    }
  );

  // 2. Разделы хаба
  const VIEWS_CONFIG: Array<{ view: ViewType; title: string; subtitle: string; icon: string }> = [
    { view: 'dashboard', title: 'Обзор проекта (Dashboard)', subtitle: 'Главная панель метрик и статусов', icon: '📊' },
    { view: 'weekly-plan', title: 'План на неделю', subtitle: 'Тактическое планирование, три цели и таймер', icon: '🎯' },
    { view: 'roadmap', title: 'Роадмап (0 → Steam)', subtitle: '11 вех от нуля до выпуска в магазин', icon: '🛣️' },
    { view: 'kanban', title: 'Канбан-доска', subtitle: 'Задачи спринта, бэклог и статус исполнения', icon: '📋' },
    { view: 'room-matrix', title: 'Матрица комнат & Гейтинг', subtitle: 'Сетка мира 2D, двери и способности', icon: '🗺️' },
    { view: 'bestiary', title: 'Бестиарий & Combat Design', subtitle: 'Каталог врагов, боссы и параметры HP/атак', icon: '👾' },
    { view: 'playtest', title: 'Журнал плейтестов (QA)', subtitle: 'Баги, застревания, скриншоты и стопперы', icon: '🐞' },
    { view: 'asset-pipeline', title: 'Пайплайн ассетов', subtitle: 'Спрайты, аудио и чек-лист для Godot 4', icon: '🎨' },
    { view: 'gdscript-generator', title: 'GDScript & Калькулятор физики', subtitle: 'State Machine и симулятор параболы прыжка', icon: '⚙️' },
    { view: 'engine-bridge', title: 'Мост Godot & Трекер релизов', subtitle: 'Выгрузка в res://data/ и история версий', icon: '🚀' },
    { view: 'team-chat', title: 'Командный чат', subtitle: 'Связь разработчиков и обмен задачами', icon: '💬' },
    { view: 'hero', title: 'Герой и способности', subtitle: 'Импланты, кибер-катана и лор Утки', icon: '🦆' },
    { view: 'gallery', title: 'Арт-хранилище', subtitle: 'Концепты, референсы и спрайт-листы', icon: '🖼️' },
    { view: 'notes', title: 'Мысли & Сценарий GDD', subtitle: 'Диалоги, сюжетные главы и заметки', icon: '📝' },
    { view: 'ai-chat', title: 'Встроенный ИИ-Чат', subtitle: 'Геймдизайн ассистент DeepSeek / Groq', icon: '🤖' },
    { view: 'ai-export', title: 'AI Context Export', subtitle: 'Генератор единого контекста для Cursor', icon: '📤' },
    { view: 'fsd-spec', title: 'React FSD Спецификация', subtitle: 'Архитектура слоев веб-хаба', icon: '📐' }
  ];

  VIEWS_CONFIG.forEach(vc => {
    items.push({
      id: `view-${vc.view}`,
      category: 'views',
      title: vc.title,
      subtitle: vc.subtitle,
      icon: vc.icon,
      shortcut: numberKeyForView(vc.view),
      keywords: [vc.view, vc.title, vc.subtitle],
      onSelect: () => onSelectView(vc.view)
    });
  });

  // 3. Комнаты карты мира
  rooms.forEach(room => {
    const isBoss = room.type === 'boss';
    items.push({
      id: `room-${room.id}`,
      category: 'rooms',
      title: `Комната [${room.gridX},${room.gridY}]: ${room.name}`,
      subtitle: `Сектор: ${room.sectorId} • ${isBoss ? '👑 Босс-арена' : 'Стандартная комната'}`,
      icon: isBoss ? '👑' : '🚪',
      badge: room.sectorId,
      keywords: ['комната', 'room', room.name, room.sectorId],
      onSelect: () => onSelectRoom(room.id)
    });
  });

  // 4. Враги и боссы
  enemies.forEach(enemy => {
    const isBoss = enemy.type === 'boss' || enemy.type === 'miniboss';
    items.push({
      id: `enemy-${enemy.id}`,
      category: 'enemies',
      title: `${enemy.name} (${isBoss ? 'БОСС' : enemy.type})`,
      subtitle: `HP: ${enemy.hp} • Урон: ${enemy.damage} • Сектор: ${enemy.sectorId}`,
      icon: isBoss ? '💀' : '👾',
      badge: enemy.sectorId,
      keywords: ['враг', 'босс', 'enemy', enemy.name, enemy.type],
      onSelect: () => onSelectEnemy(enemy.id)
    });
  });

  // 5. Сборки и релизы
  builds.forEach(build => {
    items.push({
      id: `build-${build.id}`,
      category: 'builds',
      title: `Билд ${build.version}: ${build.title}`,
      subtitle: `Этап: ${build.stage} • Статус: ${build.status} • Godot: ${build.targetEngineVersion}`,
      icon: '📦',
      badge: build.version,
      keywords: ['билд', 'сборка', 'релиз', build.version, build.title],
      onSelect: () => onSelectBuild(build.id)
    });
  });

  return items;
}

export function filterCommandItems(items: CommandPaletteItem[], query: string): CommandPaletteItem[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return items;
  return items.filter(item => {
    const matchTitle = item.title.toLowerCase().includes(normalized);
    const matchSubtitle = item.subtitle?.toLowerCase().includes(normalized);
    const matchKeywords = item.keywords?.some(keyword => keyword.toLowerCase().includes(normalized));
    const matchShortcut = item.shortcut?.toLowerCase().includes(normalized);
    return matchTitle || matchSubtitle || matchKeywords || matchShortcut;
  });
}

export function useCommandPaletteItems(params: BuildCommandItemsParams): CommandPaletteItem[] {
  return useMemo(
    () => buildCommandPaletteItems(params),
    [
      params.rooms,
      params.enemies,
      params.builds,
      params.onSelectView,
      params.onSelectRoom,
      params.onSelectEnemy,
      params.onSelectBuild,
      params.onCopyContext,
      params.onCycleAuthor,
      params.onOpenGlossary,
      params.onOpenHotkeys,
      params.onToggleSound
    ]
  );
}
