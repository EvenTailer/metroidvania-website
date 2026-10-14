export type AbilityCategory = 'combat' | 'mobility' | 'exploration' | 'defense';
export type AbilityStatus = 'done' | 'in-progress' | 'planned';

export interface GameAbility {
  id: string;
  name: string;
  icon: string;
  category: AbilityCategory;
  godotInput: string;
  timing: string;
  mechanic: string;
  gatingBarrier: string;
  godotNode: string;
  status: AbilityStatus;
}

export const DEFAULT_ABILITIES: GameAbility[] = [
  {
    id: 'ab-eye',
    name: 'Нейро-глаз «Спектр»',
    icon: '👁',
    category: 'exploration',
    godotInput: 'Q (hold / toggle)',
    timing: 'Время работы 4.0с • Cooldown 2.0с',
    mechanic: 'Активирует спектральный шейдер ночного видения: подсвечивает скрытые лазеры, невидимые платформы, хрупкие стены и уязвимые узлы боссов.',
    gatingBarrier: 'Снимает синие квантовые барьеры корпоративных лабораторий',
    godotNode: 'Player/Abilities/SpectrumEye (CanvasLayer + Shader)',
    status: 'in-progress'
  },
  {
    id: 'ab-parry',
    name: 'Кибер-рука с электроприводом',
    icon: '🦾',
    category: 'combat',
    godotInput: 'J (timing parry) / K (charge punch)',
    timing: 'Окно парирования 0.15с • Hitstop 0.08с • Камера shake 0.2с',
    mechanic: 'Идеальное парирование пуль и контактных ударов в тайминг 0.15с (стиль Nine Sols). Отражает снаряды во врага. Заряженный контрудар сбивает баланс.',
    gatingBarrier: 'Силовым ударом выбивает тяжелые бронированные гермодвери',
    godotNode: 'Player/Abilities/ParryArea2D (HitstopManager)',
    status: 'in-progress'
  },
  {
    id: 'ab-dash',
    name: 'Реактивные кроссовки (Dash)',
    icon: '👟',
    category: 'mobility',
    godotInput: 'Shift (directional)',
    timing: 'Длительность 0.25с • i-frames 0.20с • Cooldown 0.6с',
    mechanic: 'Горизонтальный и диагональный реактивный рывок сквозь врагов и ловушки с полными фреймами неуязвимости. В воздухе обновляется при отскоке от стены.',
    gatingBarrier: 'Пролет сквозь фиолетовые лазерные решетки и широкие ямы с кислотой',
    godotNode: 'Player/Abilities/DashController (GhostTrail2D)',
    status: 'planned'
  },
  {
    id: 'ab-grapple',
    name: 'Трос-гарпун (Grapple Hook)',
    icon: '🪝',
    category: 'mobility',
    godotInput: 'RMB / E (aim & shoot)',
    timing: 'Дальность 380px • Скорость подтяжки 650 px/s',
    mechanic: 'Выстрел тросом из запястья кибер-руки в неоновые потолочные кольца и решетки. Раскачка на маятнике с сохранением инерции для высокого прыжка.',
    gatingBarrier: 'Преодоление бездонных вертикальных промышленных шахт и лифтовых колодцев',
    godotNode: 'Player/Abilities/GrappleHook (RayCast2D + Line2D + PinJoint2D)',
    status: 'planned'
  }
];
