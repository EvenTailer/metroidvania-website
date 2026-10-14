import { AbilityMeta, RoomNode, SectorInfo } from './types';

export const DEFAULT_SECTORS: SectorInfo[] = [
  {
    id: 'sec-0',
    name: 'Сектор 0: Трущобы и База Детектива',
    code: 'SEC-0',
    color: '#00d2ff',
    description: 'Обучающий хаб, мастерская ремонта имплантов и безопасная зона отдыха.',
    dangerLevel: 1
  },
  {
    id: 'sec-1',
    name: 'Сектор 1: Лаборатории «Нейро-Синтез»',
    code: 'SEC-1',
    color: '#a855f7',
    description: 'Чистые залы корпорации, синие лазерные решетки, скрытые голо-стены.',
    dangerLevel: 2
  },
  {
    id: 'sec-2',
    name: 'Сектор 2: Заброшенный Литейный Цех',
    code: 'SEC-2',
    color: '#f97316',
    description: 'Раскаленный металл, огнеметные турели, тяжелые гермозатворы.',
    dangerLevel: 3
  },
  {
    id: 'sec-3',
    name: 'Сектор 3: Кислотные Коллекторы',
    code: 'SEC-3',
    color: '#10b981',
    description: 'Едкие испарения, широкие пропасти с отходами, фиолетовые барьеры.',
    dangerLevel: 4
  },
  {
    id: 'sec-4',
    name: 'Сектор 4: Шпиль Корпорации «Спектр»',
    code: 'SEC-4',
    color: '#ef4444',
    description: 'Вертикальные шахты кабелей, парящие дроны, кабинет Архитектора.',
    dangerLevel: 5
  }
];

export const ABILITY_DEFINITIONS: AbilityMeta[] = [
  { id: 'ab-jump', name: 'Базовый прыжок & Coyote Time', icon: '🦿', inputKey: 'Space', sectorObtained: 'SEC-0' },
  { id: 'ab-eye', name: 'Нейро-глаз «Спектр»', icon: '👁', inputKey: 'Q', sectorObtained: 'SEC-1' },
  { id: 'ab-parry', name: 'Кибер-рука (Силовой удар)', icon: '🦾', inputKey: 'J / K', sectorObtained: 'SEC-2' },
  { id: 'ab-dash', name: 'Реактивный Dash', icon: '👟', inputKey: 'Shift', sectorObtained: 'SEC-3' },
  { id: 'ab-grapple', name: 'Трос-гарпун', icon: '🪝', inputKey: 'E', sectorObtained: 'SEC-4' },
  { id: 'key-centurion', name: 'Ключ-карта Центуриона', icon: '🔑', inputKey: 'Пассивный', sectorObtained: 'SEC-1' }
];

export const DEFAULT_ROOMS: RoomNode[] = [
  {
    id: 'r-hub-base',
    name: 'Кабинет Утки & Мастерская',
    sectorId: 'sec-0',
    gridX: 2,
    gridY: 3,
    size: '1x1',
    type: 'save_point',
    status: 'tested',
    description: 'Стартовая комната: терминал сохранения, стол детектива, верстак кибер-имплантов.',
    godotScene: 'res://scenes/rooms/sector0/room_detective_base.tscn',
    connections: [
      { targetRoomId: 'r-hub-alley', direction: 'east' }
    ],
    loot: [
      { id: 'lt-tape-0', type: 'lore_terminal', name: 'Аудиодневник: «Последний контракт»' }
    ]
  },
  {
    id: 'r-hub-alley',
    name: 'Неоновый переулок Трущоб',
    sectorId: 'sec-0',
    gridX: 3,
    gridY: 3,
    size: '2x1',
    type: 'standard',
    status: 'art_ready',
    description: 'Уличный коридор с дождём, неоновые вывески закусочных, тренировочный манекен.',
    godotScene: 'res://scenes/rooms/sector0/room_neon_alley.tscn',
    connections: [
      { targetRoomId: 'r-hub-base', direction: 'west' },
      {
        targetRoomId: 'r-sec1-gate',
        direction: 'east',
        lock: { id: 'lk-laser-blue', direction: 'east', requiredAbilityId: 'ab-eye', label: 'Синяя квантовая решетка', type: 'ability' }
      },
      { targetRoomId: 'r-sec2-gate', direction: 'south' }
    ],
    loot: [
      { id: 'lt-cell-1', type: 'energy_cell', name: 'Энергоячейка +10%' }
    ]
  },
  {
    id: 'r-sec1-gate',
    name: 'Проходная лабораторий «Спектр»',
    sectorId: 'sec-1',
    gridX: 5,
    gridY: 3,
    size: '1x1',
    type: 'standard',
    status: 'blocked_out',
    description: 'Стерильная приёмная с турелями сканирования ДНК.',
    godotScene: 'res://scenes/rooms/sector1/room_lab_checkpoint.tscn',
    connections: [
      { targetRoomId: 'r-hub-alley', direction: 'west' },
      { targetRoomId: 'r-sec1-shrine', direction: 'north' },
      { targetRoomId: 'r-sec1-boss', direction: 'east' }
    ],
    loot: []
  },
  {
    id: 'r-sec1-shrine',
    name: 'Камера нейро-имплантации',
    sectorId: 'sec-1',
    gridX: 5,
    gridY: 2,
    size: '1x1',
    type: 'ability_shrine',
    status: 'blocked_out',
    description: 'Капсула крио-синтеза. Здесь игрок устанавливает Нейро-глаз «Спектр».',
    godotScene: 'res://scenes/rooms/sector1/room_eye_shrine.tscn',
    connections: [
      { targetRoomId: 'r-sec1-gate', direction: 'south' },
      {
        targetRoomId: 'r-sec1-secret',
        direction: 'west',
        lock: { id: 'lk-holo-wall', direction: 'west', requiredAbilityId: 'ab-eye', label: 'Скрытая голографическая стена', type: 'ability' }
      }
    ],
    loot: [
      { id: 'lt-ab-eye', type: 'ability', name: 'Имплант: Нейро-глаз «Спектр»', abilityId: 'ab-eye' }
    ]
  },
  {
    id: 'r-sec1-secret',
    name: 'Тайный архив корпоративных утечек',
    sectorId: 'sec-1',
    gridX: 4,
    gridY: 2,
    size: '1x1',
    type: 'secret',
    status: 'concept',
    description: 'Засекреченный серверный узел. Содержит секретный чип расширения запаса здоровья.',
    godotScene: 'res://scenes/rooms/sector1/room_secret_archive.tscn',
    connections: [
      { targetRoomId: 'r-sec1-shrine', direction: 'east' }
    ],
    loot: [
      { id: 'lt-hp-1', type: 'hp_upgrade', name: 'Фрагмент нано-брони (+20 HP)' }
    ]
  },
  {
    id: 'r-sec1-boss',
    name: 'Арена: Полигон Центуриона MK-IV',
    sectorId: 'sec-1',
    gridX: 6,
    gridY: 3,
    size: '2x1',
    type: 'boss',
    status: 'concept',
    description: 'Круглая арена с подвесными платформами. Битва с тяжелым охранным роботом.',
    godotScene: 'res://scenes/rooms/sector1/room_centurion_boss.tscn',
    connections: [
      { targetRoomId: 'r-sec1-gate', direction: 'west' },
      {
        targetRoomId: 'r-sec4-elevator',
        direction: 'east',
        lock: { id: 'lk-centurion-key', direction: 'east', requiredAbilityId: 'key-centurion', label: 'Замок ключа Центуриона', type: 'key' }
      }
    ],
    loot: [
      { id: 'lt-key-centurion', type: 'key_item', name: 'Ключ-карта Центуриона', abilityId: 'key-centurion' }
    ]
  },
  {
    id: 'r-sec2-gate',
    name: 'Шлюз Литейного цеха',
    sectorId: 'sec-2',
    gridX: 3,
    gridY: 4,
    size: '1x1',
    type: 'standard',
    status: 'blocked_out',
    description: 'Жар от расплавленного металла, защитные стальные плиты.',
    godotScene: 'res://scenes/rooms/sector2/room_foundry_gate.tscn',
    connections: [
      { targetRoomId: 'r-hub-alley', direction: 'north' },
      {
        targetRoomId: 'r-sec2-core',
        direction: 'south',
        lock: { id: 'lk-blast-door', direction: 'south', requiredAbilityId: 'ab-parry', label: 'Тяжелая бронированная гермодверь', type: 'ability' }
      },
      { targetRoomId: 'r-sec3-acid-channel', direction: 'east' }
    ],
    loot: []
  },
  {
    id: 'r-sec2-core',
    name: 'Мастерская пневматики: Зарядник кибер-руки',
    sectorId: 'sec-2',
    gridX: 3,
    gridY: 5,
    size: '1x1',
    type: 'ability_shrine',
    status: 'concept',
    description: 'Станок калибровки привода. Наделяет кибер-руку способностью сокрушать броню и парировать.',
    godotScene: 'res://scenes/rooms/sector2/room_arm_workshop.tscn',
    connections: [
      { targetRoomId: 'r-sec2-gate', direction: 'north' }
    ],
    loot: [
      { id: 'lt-ab-parry', type: 'ability', name: 'Модификатор: Кибер-рука (Силовой удар)', abilityId: 'ab-parry' }
    ]
  },
  {
    id: 'r-sec3-acid-channel',
    name: 'Канал отходов и кислотный резервуар',
    sectorId: 'sec-3',
    gridX: 4,
    gridY: 4,
    size: '2x1',
    type: 'standard',
    status: 'concept',
    description: 'Огромный провал с зеленой токсичной жижей. Периодические выбросы пара.',
    godotScene: 'res://scenes/rooms/sector3/room_acid_reservoir.tscn',
    connections: [
      { targetRoomId: 'r-sec2-gate', direction: 'west' },
      {
        targetRoomId: 'r-sec3-shrine',
        direction: 'east',
        lock: { id: 'lk-acid-chasm', direction: 'east', requiredAbilityId: 'ab-dash', label: 'Широкая пропасть с кислотой (нужен Dash)', type: 'ability' }
      }
    ],
    loot: []
  },
  {
    id: 'r-sec3-shrine',
    name: 'Склад прототипов: Реактивные кроссовки',
    sectorId: 'sec-3',
    gridX: 6,
    gridY: 4,
    size: '1x1',
    type: 'ability_shrine',
    status: 'concept',
    description: 'Заброшенный склад экипировки наемников. На постаменте лежат турбо-бустеры.',
    godotScene: 'res://scenes/rooms/sector3/room_dash_cache.tscn',
    connections: [
      { targetRoomId: 'r-sec3-acid-channel', direction: 'west' }
    ],
    loot: [
      { id: 'lt-ab-dash', type: 'ability', name: 'Имплант: Реактивные кроссовки Dash', abilityId: 'ab-dash' }
    ]
  },
  {
    id: 'r-sec4-elevator',
    name: 'Шахта скоростного лифта Шпиля',
    sectorId: 'sec-4',
    gridX: 8,
    gridY: 3,
    size: '1x2',
    type: 'transit',
    status: 'concept',
    description: 'Вертикальная шахта высотой в 200 метров. Обрыв тросов.',
    godotScene: 'res://scenes/rooms/sector4/room_spire_lift.tscn',
    connections: [
      { targetRoomId: 'r-sec1-boss', direction: 'west' },
      {
        targetRoomId: 'r-sec4-throne',
        direction: 'north',
        lock: { id: 'lk-grapple-shaft', direction: 'north', requiredAbilityId: 'ab-grapple', label: 'Точки зацепа троса под потолком', type: 'ability' }
      }
    ],
    loot: [
      { id: 'lt-ab-grapple', type: 'ability', name: 'Имплант: Трос-гарпун', abilityId: 'ab-grapple' }
    ]
  },
  {
    id: 'r-sec4-throne',
    name: 'Верхний Шпиль: Кабинет Архитектора',
    sectorId: 'sec-4',
    gridX: 8,
    gridY: 1,
    size: '2x1',
    type: 'boss',
    status: 'concept',
    description: 'Панорамные окна на весь ночной киберпанк-мегаполис. Финальная битва игры.',
    godotScene: 'res://scenes/rooms/sector4/room_final_boss_office.tscn',
    connections: [
      { targetRoomId: 'r-sec4-elevator', direction: 'south' }
    ],
    loot: [
      { id: 'lt-final-core', type: 'key_item', name: 'Мастер-ядро «Спектр-Альфа» (Финал)' }
    ]
  }
];
