import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { readJson } from '../../shared/lib/readJson';
import { withoutFactorySeeds } from './defaultData';
import { BuildFilterState, BuildRelease, FolderAccess } from './types';

export interface EngineBridgeState {
  builds: BuildRelease[];
  selectedBuildId: string | null;
  buildFilter: BuildFilterState;
  connectedFolderName: string | null;
  folderAccess: FolderAccess;
  lastBridgeSyncAt: string | null;
  selectedConfigFileIds: string[];
  knownConfigFileIds: string[];
  releaseChecklist: Record<string, boolean>;
}

const DEFAULT_SELECTED_FILES = [
  'world_matrix',
  'enemies',
  'dialogues',
  'player_controller',
  'asset_manifest',
  'player_physics'
];

function stringList(value: unknown, fallback: string[]): string[] {
  if (!Array.isArray(value)) return [...fallback];
  return value.filter((item): item is string => typeof item === 'string');
}

function loadState(): EngineBridgeState {
  const saved = readJson<Partial<EngineBridgeState> | null>('mv4_engine_bridge', null);

  const builds = Array.isArray(saved?.builds) ? withoutFactorySeeds(saved.builds) : [];

  const selectedBuildId = typeof saved?.selectedBuildId === 'string' && builds.some(build => build.id === saved.selectedBuildId)
    ? saved.selectedBuildId
    : builds[0]?.id || null;

  const buildFilter: BuildFilterState = {
    stage: saved?.buildFilter?.stage || 'all',
    status: saved?.buildFilter?.status || 'all',
    searchQuery: saved?.buildFilter?.searchQuery || ''
  };

  const connectedFolderName = typeof saved?.connectedFolderName === 'string'
    ? saved.connectedFolderName
    : null;

  const lastBridgeSyncAt = typeof saved?.lastBridgeSyncAt === 'string'
    ? saved.lastBridgeSyncAt
    : null;

  const selectedConfigFileIds = stringList(saved?.selectedConfigFileIds, DEFAULT_SELECTED_FILES);
  const knownConfigFileIds = stringList(saved?.knownConfigFileIds, [...new Set([...DEFAULT_SELECTED_FILES, ...selectedConfigFileIds])]);
  const releaseChecklist = saved?.releaseChecklist && typeof saved.releaseChecklist === 'object'
    ? saved.releaseChecklist
    : {};

  return {
    builds,
    selectedBuildId,
    buildFilter,
    connectedFolderName,
    folderAccess: 'none',
    lastBridgeSyncAt,
    selectedConfigFileIds,
    knownConfigFileIds,
    releaseChecklist
  };
}

function keepSingleLatest(builds: BuildRelease[], latestId: string) {
  builds.forEach(build => {
    build.isLatestRelease = build.id === latestId;
  });
}

const initialState: EngineBridgeState = loadState();

export const engineBridgeSlice = createSlice({
  name: 'engineBridge',
  initialState,
  reducers: {
    buildAdded(state, action: PayloadAction<BuildRelease>) {
      state.builds.unshift(action.payload);
      state.selectedBuildId = action.payload.id;
      if (action.payload.isLatestRelease) keepSingleLatest(state.builds, action.payload.id);
    },
    buildUpdated(state, action: PayloadAction<BuildRelease>) {
      const idx = state.builds.findIndex(b => b.id === action.payload.id);
      if (idx >= 0) {
        state.builds[idx] = action.payload;
        if (action.payload.isLatestRelease) keepSingleLatest(state.builds, action.payload.id);
      }
    },
    buildRemoved(state, action: PayloadAction<string>) {
      state.builds = state.builds.filter(b => b.id !== action.payload);
      if (state.selectedBuildId === action.payload) {
        state.selectedBuildId = state.builds[0]?.id || null;
      }
    },
    selectedBuildSet(state, action: PayloadAction<string | null>) {
      state.selectedBuildId = action.payload;
    },
    buildFilterChanged(state, action: PayloadAction<Partial<BuildFilterState>>) {
      state.buildFilter = { ...state.buildFilter, ...action.payload };
    },
    connectedFolderNameSet(state, action: PayloadAction<string | null>) {
      state.connectedFolderName = action.payload;
      if (!action.payload) state.folderAccess = 'none';
    },
    folderAccessSet(state, action: PayloadAction<FolderAccess>) {
      state.folderAccess = action.payload;
    },
    lastBridgeSyncAtSet(state, action: PayloadAction<string>) {
      state.lastBridgeSyncAt = action.payload;
    },
    configFileToggled(state, action: PayloadAction<string>) {
      if (state.selectedConfigFileIds.includes(action.payload)) {
        state.selectedConfigFileIds = state.selectedConfigFileIds.filter(id => id !== action.payload);
      } else {
        state.selectedConfigFileIds.push(action.payload);
      }
    },
    allConfigFilesToggled(state, action: PayloadAction<string[]>) {
      state.selectedConfigFileIds = action.payload;
      action.payload.forEach(id => {
        if (!state.knownConfigFileIds.includes(id)) state.knownConfigFileIds.push(id);
      });
    },
    configFilesDiscovered(state, action: PayloadAction<string[]>) {
      action.payload.forEach(id => {
        if (state.knownConfigFileIds.includes(id)) return;
        state.knownConfigFileIds.push(id);
        if (!state.selectedConfigFileIds.includes(id)) state.selectedConfigFileIds.push(id);
      });
    },
    checklistItemToggled(state, action: PayloadAction<string>) {
      state.releaseChecklist[action.payload] = !state.releaseChecklist[action.payload];
    },
    checklistItemSet(state, action: PayloadAction<{ id: string; done: boolean }>) {
      state.releaseChecklist[action.payload.id] = action.payload.done;
    },
    resetBuildsToDefault(state) {
      state.builds = [];
      state.selectedBuildId = null;
      state.buildFilter = { stage: 'all', status: 'all', searchQuery: '' };
    }
  }
});

export const {
  buildAdded,
  buildUpdated,
  buildRemoved,
  selectedBuildSet,
  buildFilterChanged,
  connectedFolderNameSet,
  folderAccessSet,
  lastBridgeSyncAtSet,
  configFileToggled,
  allConfigFilesToggled,
  configFilesDiscovered,
  checklistItemToggled,
  checklistItemSet,
  resetBuildsToDefault
} = engineBridgeSlice.actions;
