export type EnemyType = 'minion' | 'elite' | 'miniboss' | 'boss';

export type AttackType = 'melee' | 'projectile' | 'laser' | 'area' | 'dash';

export interface EnemyAttack {
  id: string;
  name: string;
  type: AttackType;
  damage: number;
  parryable: boolean;
  telegraphTime: number; // seconds (замах / телеграфирование)
  cooldown: number; // seconds
  description: string;
}

export interface BossPhase {
  phaseNumber: number;
  name: string;
  hpThresholdPercent: number; // срабатывает при <= % HP (например 100%, 65%, 30%)
  speedMultiplier: number;
  description: string;
  newAttacks: EnemyAttack[];
  musicTrack?: string;
}

export interface ProductionChecklist {
  sprite: boolean; // Концепт & пиксель-арт спрайтов
  skeleton2d: boolean; // Костная анимация Skeleton2D / SpriteFrames
  hitboxes: boolean; // Настройка Collision layers, Hitbox и Hurtbox
  audio: boolean; // SFX замаха, удара, шагов и стона урона
  tested: boolean; // Тестирование на баланс-арене Godot
}

export interface EnemyItem {
  id: string;
  name: string;
  code: string; // e.g. "ENM-01", "BOSS-01"
  type: EnemyType;
  sectorId: string; // 'sec-0' | 'sec-1' | 'sec-2' | 'sec-3' | 'sec-4'
  hp: number;
  damage: number;
  speed: number; // px / sec
  staggerThreshold: number; // количество успешных ударов / парирований до ошеломления
  parryWindow: number; // окно парирования кибер-рукой (сек, обычно 0.12 - 0.20)
  godotScene: string; // e.g. "res://scenes/enemies/sector1/centurion.tscn"
  description: string;
  lore: string;
  imageUrl?: string;
  spawnRoomIds: string[];
  attacks: EnemyAttack[];
  phases?: BossPhase[];
  checklist: ProductionChecklist;
}

export interface BestiaryFilterState {
  type: EnemyType | 'all';
  sectorId: string | 'all';
  searchQuery: string;
  status: 'all' | 'ready' | 'in_progress';
}
