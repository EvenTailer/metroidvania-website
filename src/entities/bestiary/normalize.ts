import { AttackType, BossPhase, EnemyAttack, EnemyItem, EnemyType, ProductionChecklist } from './types';

const ENEMY_TYPES: EnemyType[] = ['minion', 'elite', 'miniboss', 'boss'];
const ATTACK_TYPES: AttackType[] = ['melee', 'projectile', 'laser', 'area', 'dash'];

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function asNumber(value: unknown, fallback: number): number {
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function asBool(value: unknown, fallback = false): boolean {
  return typeof value === 'boolean' ? value : fallback;
}

function normalizeAttack(raw: unknown, index: number): EnemyAttack | null {
  const row = asRecord(raw);
  if (!row) return null;
  const name = asString(row.name).trim();
  if (!name) return null;
  const type = ATTACK_TYPES.includes(row.type as AttackType) ? (row.type as AttackType) : 'melee';
  return {
    id: asString(row.id).trim() || `atk-${index + 1}`,
    name,
    type,
    damage: asNumber(row.damage, 10),
    parryable: asBool(row.parryable, true),
    telegraphTime: asNumber(row.telegraphTime, 0.35),
    cooldown: asNumber(row.cooldown, 2),
    description: asString(row.description).trim()
  };
}

function normalizePhase(raw: unknown, index: number): BossPhase | null {
  const row = asRecord(raw);
  if (!row) return null;
  const name = asString(row.name).trim();
  if (!name) return null;
  const music = asString(row.musicTrack).trim();
  const newAttacks = Array.isArray(row.newAttacks)
    ? row.newAttacks
        .map((attack, attackIndex) => normalizeAttack(attack, attackIndex))
        .filter((attack): attack is EnemyAttack => attack !== null)
    : [];
  return {
    phaseNumber: asNumber(row.phaseNumber, index + 1),
    name,
    hpThresholdPercent: asNumber(row.hpThresholdPercent, 100),
    speedMultiplier: asNumber(row.speedMultiplier, 1),
    description: asString(row.description).trim(),
    newAttacks,
    musicTrack: music || undefined
  };
}

function normalizeChecklist(raw: unknown): ProductionChecklist {
  const row = asRecord(raw);
  return {
    sprite: asBool(row?.sprite),
    skeleton2d: asBool(row?.skeleton2d),
    hitboxes: asBool(row?.hitboxes),
    audio: asBool(row?.audio),
    tested: asBool(row?.tested)
  };
}

export function normalizeEnemy(raw: unknown, index = 0): EnemyItem | null {
  const row = asRecord(raw);
  if (!row) return null;
  const name = asString(row.name).trim();
  if (!name) return null;
  const type = ENEMY_TYPES.includes(row.type as EnemyType) ? (row.type as EnemyType) : 'minion';
  const imageUrl = asString(row.imageUrl).trim();
  const attacks = Array.isArray(row.attacks)
    ? row.attacks
        .map((attack, attackIndex) => normalizeAttack(attack, attackIndex))
        .filter((attack): attack is EnemyAttack => attack !== null)
    : [];
  const phases = Array.isArray(row.phases)
    ? row.phases
        .map((phase, phaseIndex) => normalizePhase(phase, phaseIndex))
        .filter((phase): phase is BossPhase => phase !== null)
    : [];
  const spawnRoomIds = Array.isArray(row.spawnRoomIds)
    ? row.spawnRoomIds.filter((id): id is string => typeof id === 'string' && id.trim().length > 0)
    : [];
  const usesPhases = type === 'boss' || type === 'miniboss';

  return {
    id: asString(row.id).trim() || `enm-import-${index + 1}`,
    name,
    code: asString(row.code).trim() || `ENM-${index + 1}`,
    type,
    sectorId: asString(row.sectorId).trim() || 'sec-0',
    hp: asNumber(row.hp, 80),
    damage: asNumber(row.damage, 15),
    speed: asNumber(row.speed, 100),
    staggerThreshold: asNumber(row.staggerThreshold, 3),
    parryWindow: asNumber(row.parryWindow, 0.16),
    godotScene: asString(row.godotScene).trim() || 'res://scenes/enemies/enemy_new.tscn',
    description: asString(row.description).trim(),
    lore: asString(row.lore).trim(),
    imageUrl: imageUrl || undefined,
    spawnRoomIds,
    attacks,
    phases: usesPhases && phases.length > 0 ? phases : usesPhases ? [] : undefined,
    checklist: normalizeChecklist(row.checklist)
  };
}
