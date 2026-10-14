import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { readJson } from '../../shared/lib/readJson';
import { DEFAULT_ROOMS, DEFAULT_SECTORS } from './defaultData';
import { Direction, RoomLock, RoomNode, SectorInfo } from './types';

export interface RoomMatrixState {
  rooms: RoomNode[];
  sectors: SectorInfo[];
  selectedRoomId: string | null;
  activeFilterSector: string | 'all';
  simulatedAbilities: string[];
}

function getOppositeDirection(dir: Direction): Direction {
  switch (dir) {
    case 'north': return 'south';
    case 'south': return 'north';
    case 'east': return 'west';
    case 'west': return 'east';
  }
}

function loadInitialMatrix(): { rooms: RoomNode[]; sectors: SectorInfo[] } {
  const savedRooms = readJson<RoomNode[] | null>('mv4_room_matrix_rooms', null);
  const savedSectors = readJson<SectorInfo[] | null>('mv4_room_matrix_sectors', null);
  return {
    rooms: Array.isArray(savedRooms) && savedRooms.length > 0 ? savedRooms : DEFAULT_ROOMS,
    sectors: Array.isArray(savedSectors) && savedSectors.length > 0 ? savedSectors : DEFAULT_SECTORS
  };
}

const initial = loadInitialMatrix();

const initialState: RoomMatrixState = {
  rooms: initial.rooms,
  sectors: initial.sectors,
  selectedRoomId: initial.rooms[0]?.id || null,
  activeFilterSector: 'all',
  simulatedAbilities: ['ab-jump']
};

export const roomMatrixSlice = createSlice({
  name: 'roomMatrix',
  initialState,
  reducers: {
    roomSelected(state, action: PayloadAction<string | null>) {
      state.selectedRoomId = action.payload;
    },
    roomAdded(state, action: PayloadAction<RoomNode>) {
      state.rooms.push(action.payload);
      state.selectedRoomId = action.payload.id;
    },
    roomUpdated(state, action: PayloadAction<RoomNode>) {
      const idx = state.rooms.findIndex(r => r.id === action.payload.id);
      if (idx >= 0) {
        state.rooms[idx] = action.payload;
      }
    },
    roomRemoved(state, action: PayloadAction<string>) {
      const targetId = action.payload;
      state.rooms = state.rooms
        .filter(r => r.id !== targetId)
        .map(r => ({
          ...r,
          connections: r.connections.filter(c => c.targetRoomId !== targetId)
        }));
      if (state.selectedRoomId === targetId) {
        state.selectedRoomId = state.rooms[0]?.id || null;
      }
    },
    roomPositionChanged(state, action: PayloadAction<{ id: string; gridX: number; gridY: number }>) {
      const room = state.rooms.find(r => r.id === action.payload.id);
      if (room) {
        room.gridX = Math.max(1, action.payload.gridX);
        room.gridY = Math.max(1, action.payload.gridY);
      }
    },
    roomImageUpdated(state, action: PayloadAction<{ roomId: string; imageUrl: string }>) {
      const room = state.rooms.find(r => r.id === action.payload.roomId);
      if (room) {
        room.imageUrl = action.payload.imageUrl;
      }
    },
    connectionAdded(state, action: PayloadAction<{ fromRoomId: string; toRoomId: string; direction: Direction; toDirection?: Direction; lock?: RoomLock }>) {
      const { fromRoomId, toRoomId, direction, toDirection, lock } = action.payload;
      if (fromRoomId === toRoomId) return;

      const fromRoom = state.rooms.find(r => r.id === fromRoomId);
      const toRoom = state.rooms.find(r => r.id === toRoomId);
      if (!fromRoom || !toRoom) return;

      const resolvedToDir = toDirection || getOppositeDirection(direction);

      const existsInFrom = fromRoom.connections.some(c => c.targetRoomId === toRoomId);
      if (!existsInFrom) {
        fromRoom.connections.push({ targetRoomId: toRoomId, direction, lock });
      } else {
        const c = fromRoom.connections.find(conn => conn.targetRoomId === toRoomId);
        if (c) {
          c.direction = direction;
          if (lock) c.lock = lock;
        }
      }

      const existsInTo = toRoom.connections.some(c => c.targetRoomId === fromRoomId);
      if (!existsInTo) {
        toRoom.connections.push({ targetRoomId: fromRoomId, direction: resolvedToDir });
      } else {
        const c = toRoom.connections.find(conn => conn.targetRoomId === fromRoomId);
        if (c) c.direction = resolvedToDir;
      }
    },
    connectionRemoved(state, action: PayloadAction<{ fromRoomId: string; toRoomId: string }>) {
      const { fromRoomId, toRoomId } = action.payload;
      const fromRoom = state.rooms.find(r => r.id === fromRoomId);
      const toRoom = state.rooms.find(r => r.id === toRoomId);
      if (fromRoom) {
        fromRoom.connections = fromRoom.connections.filter(c => c.targetRoomId !== toRoomId);
      }
      if (toRoom) {
        toRoom.connections = toRoom.connections.filter(c => c.targetRoomId !== fromRoomId);
      }
    },
    connectionLockUpdated(state, action: PayloadAction<{ fromRoomId: string; toRoomId: string; lock?: RoomLock }>) {
      const { fromRoomId, toRoomId, lock } = action.payload;
      const fromRoom = state.rooms.find(r => r.id === fromRoomId);
      if (fromRoom) {
        const conn = fromRoom.connections.find(c => c.targetRoomId === toRoomId);
        if (conn) {
          conn.lock = lock;
        }
      }
    },
    sectorFilterChanged(state, action: PayloadAction<string | 'all'>) {
      state.activeFilterSector = action.payload;
    },
    simulatedAbilityToggled(state, action: PayloadAction<string>) {
      const abId = action.payload;
      const idx = state.simulatedAbilities.indexOf(abId);
      if (idx >= 0) {
        if (abId === 'ab-jump') return;
        state.simulatedAbilities.splice(idx, 1);
      } else {
        state.simulatedAbilities.push(abId);
      }
    },
    simulatedAbilitiesReset(state) {
      state.simulatedAbilities = ['ab-jump'];
    },
    allAbilitiesUnlocked(state, action: PayloadAction<string[]>) {
      state.simulatedAbilities = action.payload;
    },
    matrixResetToDefault(state) {
      state.rooms = DEFAULT_ROOMS;
      state.sectors = DEFAULT_SECTORS;
      state.selectedRoomId = DEFAULT_ROOMS[0]?.id || null;
      state.simulatedAbilities = ['ab-jump'];
    }
  }
});

export const {
  roomSelected,
  roomAdded,
  roomUpdated,
  roomRemoved,
  roomPositionChanged,
  roomImageUpdated,
  connectionAdded,
  connectionRemoved,
  connectionLockUpdated,
  sectorFilterChanged,
  simulatedAbilityToggled,
  simulatedAbilitiesReset,
  allAbilitiesUnlocked,
  matrixResetToDefault
} = roomMatrixSlice.actions;

export const roomMatrixReducer = roomMatrixSlice.reducer;
