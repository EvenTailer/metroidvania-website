import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { readJson } from '../../shared/lib/readJson';
import { DEFAULT_ASSETS } from './defaultData';
import { normalizeAssetItem } from './normalize';
import { canEnterStage } from './rules';
import {
  AssetFilterState,
  AssetItem,
  AssetPriority,
  AssetSortBy,
  AssetStage,
  AssetType,
  STAGE_SEQUENCE
} from './types';

export interface AssetPipelineState {
  items: AssetItem[];
  selectedAssetId: string | null;
  filter: AssetFilterState;
  ready: boolean;
  serverSync: boolean;
  dirty: boolean;
  remoteSavedAt: string | null;
}

const VALID_TYPES = new Set<AssetType | 'all'>(['all', 'tileset', 'character', 'ui', 'sfx', 'music']);
const VALID_STAGES = new Set<AssetStage | 'all'>([
  'all',
  'concept',
  'pixel-art',
  'atlas-slice',
  'godot-import',
  'integrated'
]);
const VALID_PRIORITIES = new Set<AssetPriority | 'all'>(['all', 'high', 'normal', 'low']);
const SORT_MODES = new Set<AssetSortBy>(['stage', 'priority', 'title', 'date-desc']);

function loadItems(): AssetItem[] {
  const saved = readJson<unknown[] | null>('mv4_asset_pipeline', null);
  if (!Array.isArray(saved)) return DEFAULT_ASSETS;
  const items = saved
    .map((item, index) => normalizeAssetItem(item, index))
    .filter((item): item is AssetItem => item !== null);
  const seen = new Set<string>();
  return items.map(item => {
    if (!seen.has(item.id)) {
      seen.add(item.id);
      return item;
    }
    let next = `${item.id}-2`;
    let n = 3;
    while (seen.has(next)) next = `${item.id}-${n++}`;
    seen.add(next);
    return { ...item, id: next };
  });
}

function loadView(items: AssetItem[]): Pick<AssetPipelineState, 'selectedAssetId' | 'filter'> {
  const saved = readJson<Partial<AssetPipelineState> | null>('mv4_asset_pipeline_view', null);
  const raw = saved?.filter;
  const filter: AssetFilterState = {
    type: raw && VALID_TYPES.has(raw.type) ? raw.type : 'all',
    stage: raw && VALID_STAGES.has(raw.stage) ? raw.stage : 'all',
    priority: raw && VALID_PRIORITIES.has(raw.priority) ? raw.priority : 'all',
    searchQuery: typeof raw?.searchQuery === 'string' ? raw.searchQuery : '',
    sortBy: raw && SORT_MODES.has(raw.sortBy) ? raw.sortBy : 'stage'
  };
  const savedId = typeof saved?.selectedAssetId === 'string' ? saved.selectedAssetId : null;
  const selectedAssetId = savedId && items.some(item => item.id === savedId)
    ? savedId
    : items[0]?.id || null;
  return { selectedAssetId, filter };
}

const loadedItems = loadItems();

function commitStage(item: AssetItem, stage: AssetStage): boolean {
  if (!canEnterStage(item, stage) || item.stage === stage) return false;
  item.stage = stage;
  item.updatedAt = new Date().toISOString();
  return true;
}

const initialState: AssetPipelineState = {
  items: loadedItems,
  ...loadView(loadedItems),
  ready: false,
  serverSync: false,
  dirty: false,
  remoteSavedAt: null
};

export const assetPipelineSlice = createSlice({
  name: 'assetPipeline',
  initialState,
  reducers: {
    assetAdded(state, action: PayloadAction<AssetItem>) {
      state.items.unshift(action.payload);
      state.selectedAssetId = action.payload.id;
      state.dirty = true;
    },
    assetUpdated(state, action: PayloadAction<AssetItem>) {
      const index = state.items.findIndex(item => item.id === action.payload.id);
      if (index >= 0) {
        state.items[index] = action.payload;
        state.dirty = true;
      }
    },
    assetRemoved(state, action: PayloadAction<string>) {
      state.items = state.items.filter(item => item.id !== action.payload);
      if (state.selectedAssetId === action.payload) {
        state.selectedAssetId = state.items[0]?.id || null;
      }
      state.dirty = true;
    },
    assetStageAdvanced(state, action: PayloadAction<string>) {
      const item = state.items.find(i => i.id === action.payload);
      if (!item) return;
      const curIdx = STAGE_SEQUENCE.indexOf(item.stage);
      const next = curIdx >= 0 ? STAGE_SEQUENCE[curIdx + 1] : undefined;
      if (next && commitStage(item, next)) state.dirty = true;
    },
    assetStageReverted(state, action: PayloadAction<string>) {
      const item = state.items.find(i => i.id === action.payload);
      if (!item) return;
      const curIdx = STAGE_SEQUENCE.indexOf(item.stage);
      const prev = curIdx > 0 ? STAGE_SEQUENCE[curIdx - 1] : undefined;
      if (prev && commitStage(item, prev)) state.dirty = true;
    },
    assetStageSet(state, action: PayloadAction<{ id: string; stage: AssetStage }>) {
      const item = state.items.find(i => i.id === action.payload.id);
      if (item && commitStage(item, action.payload.stage)) state.dirty = true;
    },
    assetChecklistToggled(
      state,
      action: PayloadAction<{ assetId: string; checkId: string }>
    ) {
      const item = state.items.find(i => i.id === action.payload.assetId);
      if (!item) return;
      const checkItem = item.checklist.find(c => c.id === action.payload.checkId);
      if (checkItem) {
        checkItem.completed = !checkItem.completed;
        item.updatedAt = new Date().toISOString();
        state.dirty = true;
      }
    },
    assetFilterChanged(state, action: PayloadAction<Partial<AssetFilterState>>) {
      state.filter = { ...state.filter, ...action.payload };
    },
    assetSelected(state, action: PayloadAction<string | null>) {
      state.selectedAssetId = action.payload;
    },
    assetsImported(state, action: PayloadAction<AssetItem[]>) {
      state.items = action.payload;
      state.selectedAssetId = action.payload[0]?.id || null;
      state.dirty = true;
    },
    assetsReplaced(state, action: PayloadAction<{ items: AssetItem[]; savedAt: string | null }>) {
      state.items = action.payload.items;
      state.remoteSavedAt = action.payload.savedAt;
      state.dirty = false;
      state.serverSync = true;
      if (!state.items.some(item => item.id === state.selectedAssetId)) {
        state.selectedAssetId = state.items[0]?.id || null;
      }
    },
    pipelineReadySet(state, action: PayloadAction<boolean>) {
      state.ready = action.payload;
    },
    pipelineSyncSet(state, action: PayloadAction<boolean>) {
      state.serverSync = action.payload;
    },
    pipelineMarkedDirty(state) {
      state.dirty = true;
    },
    pipelineAcked(state, action: PayloadAction<string>) {
      state.dirty = false;
      state.serverSync = true;
      state.remoteSavedAt = action.payload;
    },
    assetsResetToDefault(state) {
      state.items = DEFAULT_ASSETS;
      state.selectedAssetId = DEFAULT_ASSETS[0]?.id || null;
      state.dirty = true;
      state.filter = {
        type: 'all',
        stage: 'all',
        priority: 'all',
        searchQuery: '',
        sortBy: 'stage'
      };
    }
  }
});

export const {
  assetAdded,
  assetUpdated,
  assetRemoved,
  assetStageAdvanced,
  assetStageReverted,
  assetStageSet,
  assetChecklistToggled,
  assetFilterChanged,
  assetSelected,
  assetsImported,
  assetsReplaced,
  pipelineReadySet,
  pipelineSyncSet,
  pipelineMarkedDirty,
  pipelineAcked,
  assetsResetToDefault
} = assetPipelineSlice.actions;
