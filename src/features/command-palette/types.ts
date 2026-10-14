export type CommandCategory = 'views' | 'actions' | 'rooms' | 'enemies' | 'builds';

export interface CommandPaletteItem {
  id: string;
  category: CommandCategory;
  title: string;
  subtitle?: string;
  icon: string;
  badge?: string;
  shortcut?: string;
  keywords?: string[];
  onSelect: () => void;
}

export const COMMAND_CATEGORY_TITLES: Record<CommandCategory, { title: string; icon: string }> = {
  actions: { title: 'Быстрые действия', icon: '⚡' },
  views: { title: 'Разделы хаба', icon: '🧭' },
  rooms: { title: 'Комнаты карты мира', icon: '🗺️' },
  enemies: { title: 'Бестиарий и боссы', icon: '👾' },
  builds: { title: 'Сборки и движок', icon: '🚀' }
};
