import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { readJson } from '../../shared/lib/readJson';
import { DEFAULT_ENEMIES } from './defaultData';
import { normalizeEnemy } from './normalize';
import { BestiaryFilterState, EnemyItem, EnemyType, ProductionChecklist } from './types';

export interface BestiaryState {
  items: EnemyItem[];
  selectedEnemyId: string | null;
  filter: BestiaryFilterState;
}

const ENEMY_TYPES = new Set<EnemyType | 'all'>(['all', 'minion', 'elite', 'miniboss', 'boss']);
const STATUS_VALUES = new Set<BestiaryFilterState['status']>(['all', 'ready', 'in_progress']);

function loadInitialEnemies(): EnemyItem[] {
  const saved = readJson<unknown[] | null>('mv4_bestiary', null);
  if (!Array.isArray(saved) || saved.length === 0) return DEFAULT_ENEMIES;
  const normalized = saved
    .map((item, index) => {
      const enemy = normalizeEnemy(item, index);
      if (!enemy) return null;
      const rawRooms = item && typeof item === 'object' ? (item as { spawnRoomIds?: unknown }).spawnRoomIds : undefined;
      if (Array.isArray(rawRooms)) return enemy;
      const factory = DEFAULT_ENEMIES.find(entry => entry.id === enemy.id);
      return factory ? { ...enemy, spawnRoomIds: factory.spawnRoomIds } : enemy;
    })
    .filter((enemy): enemy is EnemyItem => enemy !== null);
  return normalized.length > 0 ? normalized : DEFAULT_ENEMIES;
}

function loadView(items: EnemyItem[]): Pick<BestiaryState, 'selectedEnemyId' | 'filter'> {
  const saved = readJson<Partial<BestiaryState> | null>('mv4_bestiary_view', null);
  const rawFilter = saved?.filter;
  const filter: BestiaryFilterState = {
    type: rawFilter && ENEMY_TYPES.has(rawFilter.type) ? rawFilter.type : 'all',
    sectorId: typeof rawFilter?.sectorId === 'string' ? rawFilter.sectorId : 'all',
    searchQuery: typeof rawFilter?.searchQuery === 'string' ? rawFilter.searchQuery : '',
    status: rawFilter && STATUS_VALUES.has(rawFilter.status) ? rawFilter.status : 'all'
  };
  const savedId = typeof saved?.selectedEnemyId === 'string' ? saved.selectedEnemyId : null;
  const selectedEnemyId = savedId && items.some(enemy => enemy.id === savedId)
    ? savedId
    : items.find(enemy => enemy.id === 'boss-centurion-1')?.id || items[0]?.id || null;
  return { selectedEnemyId, filter };
}

const loadedItems = loadInitialEnemies();

const initialState: BestiaryState = {
  items: loadedItems,
  ...loadView(loadedItems)
};

export const bestiarySlice = createSlice({
  name: 'bestiary',
  initialState,
  reducers: {
    enemyAdded(state, action: PayloadAction<EnemyItem>) {
      state.items.unshift(action.payload);
      state.selectedEnemyId = action.payload.id;
    },
    enemyUpdated(state, action: PayloadAction<EnemyItem>) {
      const idx = state.items.findIndex(e => e.id === action.payload.id);
      if (idx >= 0) {
        state.items[idx] = action.payload;
      }
    },
    enemyRemoved(state, action: PayloadAction<string>) {
      state.items = state.items.filter(e => e.id !== action.payload);
      if (state.selectedEnemyId === action.payload) {
        state.selectedEnemyId = state.items[0]?.id || null;
      }
    },
    enemyChecklistToggled(
      state,
      action: PayloadAction<{ enemyId: string; step: keyof ProductionChecklist }>
    ) {
      const enemy = state.items.find(e => e.id === action.payload.enemyId);
      if (enemy) {
        enemy.checklist[action.payload.step] = !enemy.checklist[action.payload.step];
      }
    },
    selectedEnemySet(state, action: PayloadAction<string | null>) {
      state.selectedEnemyId = action.payload;
    },
    bestiaryFilterChanged(state, action: PayloadAction<Partial<BestiaryFilterState>>) {
      state.filter = { ...state.filter, ...action.payload };
    },
    bestiaryImported(state, action: PayloadAction<EnemyItem[]>) {
      state.items = action.payload;
      state.selectedEnemyId = action.payload[0]?.id || null;
    },
    bestiaryResetToDefault(state) {
      state.items = DEFAULT_ENEMIES;
      state.selectedEnemyId = DEFAULT_ENEMIES[2]?.id || null;
      state.filter = {
        type: 'all',
        sectorId: 'all',
        searchQuery: '',
        status: 'all'
      };
    }
  }
});

export const {
  enemyAdded,
  enemyUpdated,
  enemyRemoved,
  enemyChecklistToggled,
  selectedEnemySet,
  bestiaryFilterChanged,
  bestiaryImported,
  bestiaryResetToDefault
} = bestiarySlice.actions;

export const bestiaryReducer = bestiarySlice.reducer;
