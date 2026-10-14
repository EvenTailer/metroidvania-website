export interface CharacterItem {
  id: string;
  name: string;
  role: string;
  tag: string;
  imageUrl: string;
  lore: string;
  skills: string[];
}

export const DEFAULT_CHARACTERS: CharacterItem[] = [
  {
    id: 'char-hero',
    name: 'Агент-09: Кибер-Утка (Детектив-Наемник)',
    role: 'Главный герой',
    tag: 'Игрок / Протагонист',
    imageUrl: '/assets/duck_hero.png',
    lore: 'Побитый жизнью сыщик в карго-штанах, старых кроссовках и грязной майке с армейским жетоном. Правая рука заменена на промышленный манипулятор для парирования и ударов, правый глаз — сенсорный нейро-имплант «Спектр».',
    skills: ['🦾 Парирование пуль', '👁 Спектральный глаз', '👟 Рывок сквозь лазеры', '🪝 Трос-гарпун']
  }
];
