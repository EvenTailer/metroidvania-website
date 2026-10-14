import { HIVE_WARDEN } from './hiveWarden';
import { EnemyItem } from './types';

export const DEFAULT_ENEMIES: EnemyItem[] = [
  {
    id: 'enm-rat-0',
    name: 'Кибер-Крыса Трущоб',
    code: 'ENM-001',
    type: 'minion',
    sectorId: 'sec-0',
    hp: 45,
    damage: 12,
    speed: 130,
    staggerThreshold: 2,
    parryWindow: 0.18,
    godotScene: 'res://scenes/enemies/sector0/cyber_rat.tscn',
    spawnRoomIds: ['r-hub-alley'],
    description: 'Быстрый мутировавший грызун со стальными челюстями. Нападает стаями по 2-3 особи.',
    lore: 'Остатки ранних био-экспериментов «Спектра», выброшенные в дренажные коллекторы.',
    checklist: {
      sprite: true,
      skeleton2d: true,
      hitboxes: true,
      audio: true,
      tested: true
    },
    attacks: [
      {
        id: 'atk-rat-bite',
        name: 'Прыжок и укус',
        type: 'melee',
        damage: 12,
        parryable: true,
        telegraphTime: 0.25,
        cooldown: 1.5,
        description: 'Приседает на лапы на 0.25с и совершает резкий выпад.'
      }
    ]
  },
  {
    id: 'enm-drone-0',
    name: 'Охранный Дрон-Сканер',
    code: 'ENM-002',
    type: 'minion',
    sectorId: 'sec-0',
    hp: 60,
    damage: 15,
    speed: 90,
    staggerThreshold: 2,
    parryWindow: 0.15,
    godotScene: 'res://scenes/enemies/sector0/patrol_drone.tscn',
    spawnRoomIds: ['r-hub-base'],
    description: 'Парящий дрон с синим прожектором. При обнаружении утки зависает и стреляет плазмой.',
    lore: 'Стандартный патрульный модуль корпоративной охраны третьего эшелона.',
    checklist: {
      sprite: true,
      skeleton2d: true,
      hitboxes: true,
      audio: false,
      tested: true
    },
    attacks: [
      {
        id: 'atk-drone-shot',
        name: 'Плазменный заряд',
        type: 'projectile',
        damage: 15,
        parryable: true,
        telegraphTime: 0.45,
        cooldown: 2.2,
        description: 'Прицеливание красным лазерным лучом 0.45с, затем выстрел снарядом.'
      }
    ]
  },
  {
    id: 'boss-centurion-1',
    name: 'Корпоративный Центурион MK-IV',
    code: 'BOSS-01',
    type: 'boss',
    sectorId: 'sec-1',
    hp: 850,
    damage: 35,
    speed: 150,
    staggerThreshold: 5,
    parryWindow: 0.16,
    godotScene: 'res://scenes/enemies/sector1/boss_centurion_mk4.tscn',
    spawnRoomIds: ['r-sec1-boss'],
    description: 'Тяжелый кибер-экзоскелет начальника службы безопасности Лабораторий. Оснащен щитом и тесла-мечом.',
    lore: 'Элитный киборг, добровольно отдавший 70% нервной системы под управление боевым алгоритмам «Нейро-Синтеза».',
    checklist: {
      sprite: true,
      skeleton2d: true,
      hitboxes: true,
      audio: false,
      tested: false
    },
    attacks: [
      {
        id: 'atk-cent-slash',
        name: 'Рассекающий тесла-взмах',
        type: 'melee',
        damage: 30,
        parryable: true,
        telegraphTime: 0.35,
        cooldown: 1.8,
        description: 'Горизонтальный взмах меча. При парировании кибер-рукой Центурион теряет баланс на 1.2с.'
      },
      {
        id: 'atk-cent-thrust',
        name: 'Силовой пронзающий выпад',
        type: 'dash',
        damage: 42,
        parryable: false,
        telegraphTime: 0.55,
        cooldown: 3.5,
        description: 'Непарируемый рывок через пол-арены. Требуется уворот через Dash или прыжок.'
      }
    ],
    phases: [
      {
        phaseNumber: 1,
        name: 'Фаза 1: Оборонительный строй',
        hpThresholdPercent: 100,
        speedMultiplier: 1.0,
        description: 'Блокирует прямые лобовые атаки щитом. Уязвим со спины или после парирования взмаха.',
        newAttacks: []
      },
      {
        phaseNumber: 2,
        name: 'Фаза 2: Квантовая перегрузка',
        hpThresholdPercent: 65,
        speedMultiplier: 1.25,
        description: 'Сбрасывает поврежденный щит, меч заряжается синим лазером. Начинает вызывать турели сканирования.',
        newAttacks: [
          {
            id: 'atk-cent-laser-sweep',
            name: 'Квантовый лазерный веер',
            type: 'laser',
            damage: 38,
            parryable: false,
            telegraphTime: 0.6,
            cooldown: 4.0,
            description: 'Потолочный скан-луч, требующий точного прыжка с Coyote Time.'
          }
        ]
      },
      {
        phaseNumber: 3,
        name: 'Фаза 3: Отказ систем (Berserk)',
        hpThresholdPercent: 30,
        speedMultiplier: 1.45,
        description: 'Непрерывные комбо-удары, искры и электрические всплески по полу арены.',
        newAttacks: [
          {
            id: 'atk-cent-emp-slam',
            name: 'EMP-Удар в землю',
            type: 'area',
            damage: 45,
            parryable: true,
            telegraphTime: 0.7,
            cooldown: 5.0,
            description: 'Прыжок в воздух и сокрушительный удар оземь, порождающий волну тока.'
          }
        ]
      }
    ]
  },
  {
    id: 'enm-trooper-1',
    name: 'Штурмовик «Нейро-Синтеза»',
    code: 'ENM-003',
    type: 'elite',
    sectorId: 'sec-1',
    hp: 120,
    damage: 22,
    speed: 110,
    staggerThreshold: 3,
    parryWindow: 0.16,
    godotScene: 'res://scenes/enemies/sector1/neuro_trooper.tscn',
    spawnRoomIds: ['r-sec1-gate'],
    description: 'Боец в шлеме с дополненной реальностью. Чередует очереди из винтовки и парируемый удар прикладом.',
    lore: 'Наемники частной военной компании, охраняющие документацию генетических чипов.',
    checklist: {
      sprite: true,
      skeleton2d: false,
      hitboxes: false,
      audio: false,
      tested: false
    },
    attacks: [
      {
        id: 'atk-tr-burst',
        name: 'Очередь из 3 пуль',
        type: 'projectile',
        damage: 18,
        parryable: true,
        telegraphTime: 0.4,
        cooldown: 2.5,
        description: 'Серия из трех снарядов, каждую пулю можно отбить кибер-рукой обратно во врага.'
      },
      {
        id: 'atk-tr-bash',
        name: 'Удар прикладом при сближении',
        type: 'melee',
        damage: 24,
        parryable: true,
        telegraphTime: 0.25,
        cooldown: 1.8,
        description: 'Быстрый тычок при попытке подойти вплотную.'
      }
    ]
  },
  {
    id: 'boss-crusher-2',
    name: 'Плавильный Дробитель',
    code: 'BOSS-02',
    type: 'boss',
    sectorId: 'sec-2',
    hp: 1200,
    damage: 48,
    speed: 85,
    staggerThreshold: 6,
    parryWindow: 0.2,
    godotScene: 'res://scenes/enemies/sector2/boss_foundry_crusher.tscn',
    spawnRoomIds: ['r-sec2-core'],
    description: 'Гигантский промышленный робот-молот, переоборудованный для ликвидации нарушителей Литейного цеха.',
    lore: 'Автономный ковочный гигант, управляемый свихнувшимся управляющим чипом производства.',
    checklist: {
      sprite: true,
      skeleton2d: true,
      hitboxes: false,
      audio: false,
      tested: false
    },
    attacks: [
      {
        id: 'atk-crush-hammer',
        name: 'Удар пневмо-молота',
        type: 'melee',
        damage: 45,
        parryable: true,
        telegraphTime: 0.5,
        cooldown: 2.8,
        description: 'Тяжелый удар по наковальне. Удар парируется в точке контакта, оглушая гиганта на 1.8с.'
      },
      {
        id: 'atk-crush-lava',
        name: 'Волна раскаленного шлака',
        type: 'area',
        damage: 40,
        parryable: false,
        telegraphTime: 0.7,
        cooldown: 4.5,
        description: 'Волна жидкого металла, катящаяся по полу арены. Требуется Dash в воздухе.'
      }
    ],
    phases: [
      {
        phaseNumber: 1,
        name: 'Фаза 1: Ковочный цикл',
        hpThresholdPercent: 100,
        speedMultiplier: 1.0,
        description: 'Медленные сокрушительные атаки молотом и выпуск пара из клапанов.',
        newAttacks: []
      },
      {
        phaseNumber: 2,
        name: 'Фаза 2: Раскаленное сопло',
        hpThresholdPercent: 55,
        speedMultiplier: 1.3,
        description: 'Корпус нагревается докрасна. Включаются огнеметные турели по краям арены.',
        newAttacks: [
          {
            id: 'atk-crush-flamethrower',
            name: 'Круговой огнемет',
            type: 'laser',
            damage: 50,
            parryable: false,
            telegraphTime: 0.8,
            cooldown: 5.5,
            description: 'Струя огня на 360 градусов. Уворот под брюхом робота.'
          }
        ]
      }
    ]
  },
  {
    id: 'enm-automaton-2',
    name: 'Огнеметный Автоматон',
    code: 'ENM-004',
    type: 'elite',
    sectorId: 'sec-2',
    hp: 160,
    damage: 28,
    speed: 70,
    staggerThreshold: 4,
    parryWindow: 0.18,
    godotScene: 'res://scenes/enemies/sector2/automaton_pyro.tscn',
    spawnRoomIds: ['r-sec2-gate'],
    description: 'Бронированный робот-сварщик с баллонами горючего за спиной. Уязвим к ударам сзади.',
    lore: 'Списанные заводские машины, оснащенные военными огнеметными соплами.',
    checklist: {
      sprite: true,
      skeleton2d: false,
      hitboxes: false,
      audio: false,
      tested: false
    },
    attacks: [
      {
        id: 'atk-auto-flame',
        name: 'Огнеметный залп',
        type: 'projectile',
        damage: 26,
        parryable: true,
        telegraphTime: 0.45,
        cooldown: 3.0,
        description: 'Выброс огненного шара. Парирование кибер-рукой взрывает шар в лицо автоматону.'
      }
    ]
  },
  HIVE_WARDEN,
  {
    id: 'boss-leech-3',
    name: 'Кибер-Пиявка Улья',
    code: 'BOSS-03',
    type: 'boss',
    sectorId: 'sec-3',
    hp: 1450,
    damage: 50,
    speed: 160,
    staggerThreshold: 6,
    parryWindow: 0.14,
    godotScene: 'res://scenes/enemies/sector3/boss_hive_leech.tscn',
    spawnRoomIds: ['r-sec3-acid-channel'],
    description: 'Огромный биомеханический червь-паразит, живущий в кислотных резервуарах Сектора 3.',
    lore: 'Органическая система фильтрации токсинов, мутировавшая под воздействием нано-отходов.',
    checklist: {
      sprite: false,
      skeleton2d: false,
      hitboxes: false,
      audio: false,
      tested: false
    },
    attacks: [
      {
        id: 'atk-leech-dive',
        name: 'Кислотное пике из потолка',
        type: 'dash',
        damage: 48,
        parryable: true,
        telegraphTime: 0.4,
        cooldown: 2.8,
        description: 'Падает на игрока с потолочной трубы. Идеальное парирование оглушает червя на платформе.'
      },
      {
        id: 'atk-leech-spit',
        name: 'Залп едкой слизи',
        type: 'area',
        damage: 35,
        parryable: false,
        telegraphTime: 0.6,
        cooldown: 4.0,
        description: 'Оставляет на полу лужи кислоты, разъедающие броню при наступлении.'
      }
    ],
    phases: [
      {
        phaseNumber: 1,
        name: 'Фаза 1: Охота из глубин',
        hpThresholdPercent: 100,
        speedMultiplier: 1.0,
        description: 'Ныряет в кислоту и атакует вертикальными выпадами.',
        newAttacks: []
      },
      {
        phaseNumber: 2,
        name: 'Фаза 2: Разделение сегментов',
        hpThresholdPercent: 50,
        speedMultiplier: 1.35,
        description: 'От хвоста отделяются 2 малые кибер-пиявки, нападающие одновременно с боссом.',
        newAttacks: []
      }
    ]
  },
  {
    id: 'boss-architect-4',
    name: 'Архитектор «Спектра» (Финал)',
    code: 'BOSS-FINAL',
    type: 'boss',
    sectorId: 'sec-4',
    hp: 2100,
    damage: 60,
    speed: 180,
    staggerThreshold: 8,
    parryWindow: 0.13,
    godotScene: 'res://scenes/enemies/sector4/boss_architect_final.tscn',
    spawnRoomIds: ['r-sec4-throne'],
    description: 'Глава корпорации в кибернетическом боевом троне, управляющий квантовым суперкомпьютером города.',
    lore: 'Создатель Агента-09 (Кибер-Утки). Считает биологическую жизнь ошибкой компиляции.',
    checklist: {
      sprite: false,
      skeleton2d: false,
      hitboxes: false,
      audio: false,
      tested: false
    },
    attacks: [
      {
        id: 'atk-arch-teleport',
        name: 'Квантовая телепортация со слешем',
        type: 'dash',
        damage: 55,
        parryable: true,
        telegraphTime: 0.3,
        cooldown: 2.2,
        description: 'Исчезает во вспышке и наносит удар со спины. Окно парирования 0.13с.'
      },
      {
        id: 'atk-arch-grid',
        name: 'Смертоносная лазерная решетка',
        type: 'laser',
        damage: 70,
        parryable: false,
        telegraphTime: 0.8,
        cooldown: 6.0,
        description: 'Вся арена покрывается перемещающимися лазерными лучами. Требуется трос-гарпун.'
      }
    ],
    phases: [
      {
        phaseNumber: 1,
        name: 'Фаза 1: Трон Архитектора',
        hpThresholdPercent: 100,
        speedMultiplier: 1.0,
        description: 'Парит над ареной, призывает рой боевых дронов и запускает ракетные залпы.',
        newAttacks: []
      },
      {
        phaseNumber: 2,
        name: 'Фаза 2: Квантовое расщепление',
        hpThresholdPercent: 65,
        speedMultiplier: 1.3,
        description: 'Трон разрушается. Архитектор спускается на арену, создавая две голографические копии-призрака.',
        newAttacks: []
      },
      {
        phaseNumber: 3,
        name: 'Фаза 3: Сингулярность Ядра',
        hpThresholdPercent: 25,
        speedMultiplier: 1.6,
        description: 'Гравитационная воронка в центре арены притягивает Утку. Все атаки получают максимальную скорость.',
        newAttacks: []
      }
    ]
  }
];
