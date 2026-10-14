import { EnemyItem } from './types';

export const HIVE_WARDEN: EnemyItem = {
  id: 'enm-warden-3',
  name: 'Страж кислотного улья',
  code: 'MINI-01',
  type: 'miniboss',
  sectorId: 'sec-3',
  hp: 420,
  damage: 24,
  speed: 95,
  staggerThreshold: 4,
  parryWindow: 0.14,
  godotScene: 'res://scenes/enemies/sector3/hive_warden.tscn',
  description: 'Патрульный улья. Закрывает узкий канал и вызывает пиявок, когда здоровье падает ниже половины.',
  lore: 'Бывший техник фильтрации, вшитый в хитиновый каркас улья. Помнит маршруты коллектора лучше любой карты.',
  spawnRoomIds: ['r-sec3-acid-channel'],
  checklist: {
    sprite: true,
    skeleton2d: false,
    hitboxes: false,
    audio: false,
    tested: false
  },
  attacks: [
    {
      id: 'atk-warden-lash',
      name: 'Кислотный хлыст',
      type: 'melee',
      damage: 24,
      parryable: true,
      telegraphTime: 0.4,
      cooldown: 2.2,
      description: 'Замах хлыстом слева направо. Парирование отбрасывает стража к стене канала.'
    },
    {
      id: 'atk-warden-spit',
      name: 'Плевок кислоты',
      type: 'projectile',
      damage: 18,
      parryable: true,
      telegraphTime: 0.55,
      cooldown: 3.4,
      description: 'Дуга кислоты. Лужа остаётся на полу на 2 секунды.'
    }
  ],
  phases: [
    {
      phaseNumber: 1,
      name: 'Фаза 1: Дозор',
      hpThresholdPercent: 100,
      speedMultiplier: 1,
      description: 'Держит центр канала и чередует хлыст с плевком.',
      newAttacks: [],
      musicTrack: 'res://audio/music/hive_warden_patrol.ogg'
    },
    {
      phaseNumber: 2,
      name: 'Фаза 2: Зов улья',
      hpThresholdPercent: 50,
      speedMultiplier: 1.25,
      description: 'Отступает в кислоту и вызывает двух пиявок.',
      musicTrack: 'res://audio/music/hive_warden_call.ogg',
      newAttacks: [
        {
          id: 'atk-warden-call',
          name: 'Зов пиявок',
          type: 'area',
          damage: 12,
          parryable: false,
          telegraphTime: 0.9,
          cooldown: 8,
          description: 'Крик на 0.9 с. Из луж выходят две пиявки.'
        }
      ]
    }
  ]
};
