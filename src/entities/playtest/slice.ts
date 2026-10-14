import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { readJson } from '../../shared/lib/readJson';
import { DEFAULT_REPORTS } from './defaultData';
import { normalizeReport } from './normalize';
import { BugSeverity, BugStatus, PlaytestFilterState, PlaytestReport, PlaytestSortBy } from './types';

export interface PlaytestState {
  items: PlaytestReport[];
  selectedReportId: string | null;
  filter: PlaytestFilterState;
}

const SEVERITIES = new Set<BugSeverity | 'all'>(['all', 'blocker', 'major', 'minor', 'polish']);
const STATUSES = new Set<BugStatus | 'all'>(['all', 'open', 'fixed', 'wontfix']);
const SORT_MODES = new Set<PlaytestSortBy>(['severity', 'date-desc', 'date-asc', 'status', 'title']);

function loadItems(): PlaytestReport[] {
  const saved = readJson<unknown[] | null>('mv4_playtest', null);
  if (!Array.isArray(saved)) return DEFAULT_REPORTS;
  const items = saved
    .map((item, index) => normalizeReport(item, index))
    .filter((item): item is PlaytestReport => item !== null);
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

function loadView(items: PlaytestReport[]): Pick<PlaytestState, 'selectedReportId' | 'filter'> {
  const saved = readJson<Partial<PlaytestState> | null>('mv4_playtest_view', null);
  const raw = saved?.filter;
  const filter: PlaytestFilterState = {
    severity: raw && SEVERITIES.has(raw.severity) ? raw.severity : 'all',
    status: raw && STATUSES.has(raw.status) ? raw.status : 'all',
    searchQuery: typeof raw?.searchQuery === 'string' ? raw.searchQuery : '',
    sortBy: raw && SORT_MODES.has(raw.sortBy) ? raw.sortBy : 'severity'
  };
  const savedId = typeof saved?.selectedReportId === 'string' ? saved.selectedReportId : null;
  const selectedReportId = savedId && items.some(item => item.id === savedId)
    ? savedId
    : items[0]?.id || null;
  return { selectedReportId, filter };
}

const loadedItems = loadItems();

const initialState: PlaytestState = {
  items: loadedItems,
  ...loadView(loadedItems)
};

export const playtestSlice = createSlice({
  name: 'playtest',
  initialState,
  reducers: {
    reportAdded(state, action: PayloadAction<PlaytestReport>) {
      state.items.unshift(action.payload);
      state.selectedReportId = action.payload.id;
    },
    reportUpdated(state, action: PayloadAction<PlaytestReport>) {
      const index = state.items.findIndex(item => item.id === action.payload.id);
      if (index >= 0) state.items[index] = action.payload;
    },
    reportRemoved(state, action: PayloadAction<string>) {
      state.items = state.items.filter(item => item.id !== action.payload);
      if (state.selectedReportId === action.payload) {
        state.selectedReportId = state.items[0]?.id || null;
      }
    },
    reportStatusSet(state, action: PayloadAction<{ id: string; status: BugStatus }>) {
      const report = state.items.find(item => item.id === action.payload.id);
      if (report) report.status = action.payload.status;
    },
    selectedReportSet(state, action: PayloadAction<string | null>) {
      state.selectedReportId = action.payload;
    },
    playtestFilterChanged(state, action: PayloadAction<Partial<PlaytestFilterState>>) {
      state.filter = { ...state.filter, ...action.payload };
    },
    screenshotsHydrated(state, action: PayloadAction<Record<string, string>>) {
      const map = action.payload;
      state.items.forEach(item => {
        if (map[item.id]) {
          item.screenshotUrl = map[item.id];
        }
      });
    },
    reportsImported(state, action: PayloadAction<PlaytestReport[]>) {
      const newItems = action.payload;
      const existingIds = new Set(state.items.map(i => i.id));
      newItems.forEach(item => {
        if (!existingIds.has(item.id)) {
          state.items.push(item);
          existingIds.add(item.id);
        } else {
          const idx = state.items.findIndex(i => i.id === item.id);
          if (idx >= 0) state.items[idx] = item;
        }
      });
    },
    playtestResetToDefault(state) {
      state.items = DEFAULT_REPORTS;
      state.selectedReportId = DEFAULT_REPORTS[0].id;
    }
  }
});

export const {
  reportAdded,
  reportUpdated,
  reportRemoved,
  reportStatusSet,
  selectedReportSet,
  playtestFilterChanged,
  screenshotsHydrated,
  reportsImported,
  playtestResetToDefault
} = playtestSlice.actions;

export const playtestReducer = playtestSlice.reducer;
