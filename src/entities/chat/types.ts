export type TeamMessageTag = 'обсуждение' | 'баг' | 'сборка' | 'арт' | 'код';

export interface TeamMessage {
  id: string;
  author: string; // 'Юзер 1' | 'Юзер 2' | 'Юзер 3'
  text: string;
  time: string;
  tag?: TeamMessageTag;
  image?: string;
}

export const DEFAULT_TEAM_MESSAGES: TeamMessage[] = [
  {
    id: 'msg-1',
    author: 'Юзер 1',
    text: 'Настроил физику прыжка: Coyote Time 0.12с и Jump Buffer 0.10с в Godot 4.3. Тестируйте на ветке main!',
    time: 'Сегодня, 14:20',
    tag: 'код'
  },
  {
    id: 'msg-2',
    author: 'Юзер 2',
    text: 'Залил в Арт-хранилище обновленные ракурсы Кибер-Утки. Готовлю нарезку для Skeleton2D.',
    time: 'Сегодня, 15:45',
    tag: 'арт',
    image: '/assets/duck_hero.png'
  },
  {
    id: 'msg-3',
    author: 'Юзер 3',
    text: 'Собрал грейбокс тестовой комнаты. Нужно проверить высоту платформ под двойной прыжок.',
    time: 'Сегодня, 16:10',
    tag: 'обсуждение'
  }
];
