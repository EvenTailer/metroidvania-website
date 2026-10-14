export type RoomType =
  | 'standard'
  | 'boss'
  | 'save_point'
  | 'ability_shrine'
  | 'transit'
  | 'secret';

export type RoomStatus = 'concept' | 'blocked_out' | 'art_ready' | 'tested';

export type RoomSize = '1x1' | '2x1' | '1x2' | '2x2' | '3x1' | '3x2';

export function getRoomDimensions(size: RoomSize): { cols: number; rows: number; width: number; height: number } {
  switch (size) {
    case '2x1': return { cols: 2, rows: 1, width: 320, height: 125 };
    case '1x2': return { cols: 1, rows: 2, width: 150, height: 270 };
    case '2x2': return { cols: 2, rows: 2, width: 320, height: 270 };
    case '3x1': return { cols: 3, rows: 1, width: 490, height: 125 };
    case '3x2': return { cols: 3, rows: 2, width: 490, height: 270 };
    case '1x1':
    default:
      return { cols: 1, rows: 1, width: 150, height: 125 };
  }
}

export type Direction = 'north' | 'south' | 'east' | 'west';

export interface RoomLock {
  id: string;
  direction: Direction;
  requiredAbilityId: string;
  label: string;
  type: 'ability' | 'key' | 'switch';
}

export interface RoomLoot {
  id: string;
  type: 'ability' | 'hp_upgrade' | 'energy_cell' | 'lore_terminal' | 'key_item';
  name: string;
  abilityId?: string;
  description?: string;
}

export interface RoomConnection {
  targetRoomId: string;
  direction: Direction;
  lock?: RoomLock;
}

export interface RoomNode {
  id: string;
  name: string;
  sectorId: string;
  gridX: number;
  gridY: number;
  size: RoomSize;
  type: RoomType;
  status: RoomStatus;
  description: string;
  godotScene: string;
  connections: RoomConnection[];
  loot: RoomLoot[];
  imageUrl?: string;
}

export interface SectorInfo {
  id: string;
  name: string;
  code: string;
  color: string;
  description: string;
  dangerLevel: 1 | 2 | 3 | 4 | 5;
}

export interface AbilityMeta {
  id: string;
  name: string;
  icon: string;
  inputKey: string;
  sectorObtained: string;
}

export interface GatingSimulationResult {
  reachableRoomIds: Set<string>;
  unlockedLoot: RoomLoot[];
  blockedRoomCount: number;
  blockingLocks: { lock: RoomLock; fromRoomId: string; toRoomId: string }[];
}
