export interface HotkeyEntry {
  keys: string[];
  description: string;
  hint?: string;
}

export interface HotkeySection {
  title: string;
  icon: string;
  items: HotkeyEntry[];
}

export const NUMBER_HOTKEY_COPY: Record<string, { description: string; hint: string }> = {
  '1': { description: 'Обзор проекта (Dashboard)', hint: 'Главный сводный экран' },
  '2': { description: 'План на неделю', hint: 'Три цели недели и таймер' },
  '3': { description: 'Роадмап (0 → Steam)', hint: '11 ключевых вех разработки' },
  '4': { description: 'Канбан-доска спринта', hint: 'Задачи, баги и таймлайн' },
  '5': { description: 'Матрица комнат & Гейтинг', hint: 'Сетка мира и замки способностей' },
  '6': { description: 'Бестиарий & Combat', hint: 'Враги, боссы и параметры баланса' },
  '7': { description: 'Журнал плейтестов (QA)', hint: 'Баги, координаты и скриншоты' },
  '8': { description: 'Пайплайн ассетов', hint: 'Спрайты, звуки и тайлсеты' },
  '9': { description: 'GDScript & Физика 2D', hint: 'State Machine и парабола прыжка' },
  '0': { description: 'Мост Godot & Релизы', hint: 'Выгрузка в res://data/ и трекер билдов' }
};

export const HOTKEY_SECTIONS: HotkeySection[] = [
  {
    title: 'Быстрый доступ и поиск',
    icon: '⚡',
    items: [
      { keys: ['Ctrl', 'K'], description: 'Открыть или закрыть командную палитру', hint: 'Поиск разделов, комнат, врагов и действий' },
      { keys: ['?', 'F1'], description: 'Показать эту шпаргалку горячих клавиш', hint: 'Пока окно открыто, остальные шорткаты не срабатывают' },
      { keys: ['G'], description: 'Открыть справочник разработчика', hint: 'На русской раскладке та же клавиша: П' },
      { keys: ['Esc'], description: 'Закрыть активное окно', hint: 'Палитра, справка, лайтбокс. В поле ввода боковое меню не закрывает' },
      { keys: ['M'], description: 'Вкл / Выкл звуковые эффекты хаба', hint: 'На русской раскладке: Ь' }
    ]
  },
  {
    title: 'Цифровая навигация по разделам',
    icon: '🧭',
    items: Object.entries(NUMBER_HOTKEY_COPY).map(([key, copy]) => ({
      keys: [key],
      description: copy.description,
      hint: copy.hint
    }))
  },
  {
    title: 'Интерактивный симулятор физики (на странице GDScript)',
    icon: '🎮',
    items: [
      { keys: ['Space'], description: 'Прыжок персонажа', hint: 'Проверка высоты, Coyote Time и Cut-off' },
      { keys: ['Shift'], description: 'Горизонтальный рывок (Dash)', hint: 'В сторону последнего хода, иначе вправо' },
      { keys: ['A', 'D'], description: 'Движение влево / вправо', hint: 'Те же действия на стрелках ← и →' }
    ]
  }
];
