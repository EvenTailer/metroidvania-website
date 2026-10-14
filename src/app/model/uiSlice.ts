import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { isSoundMuted, setSoundMuted } from '../../shared/lib/cyberSound';

export interface UiState {
  toast: string | null;
  sidebarOpen: boolean;
  lightboxUrl: string | null;
  commandPaletteOpen: boolean;
  hotkeysModalOpen: boolean;
  glossaryModalOpen: boolean;
  soundMuted: boolean;
}

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    toast: null,
    sidebarOpen: false,
    lightboxUrl: null,
    commandPaletteOpen: false,
    hotkeysModalOpen: false,
    glossaryModalOpen: false,
    soundMuted: isSoundMuted()
  } as UiState,
  reducers: {
    toastSet(state, action: PayloadAction<string | null>) {
      state.toast = action.payload;
    },
    sidebarSet(state, action: PayloadAction<boolean>) {
      state.sidebarOpen = action.payload;
    },
    sidebarToggled(state) {
      state.sidebarOpen = !state.sidebarOpen;
    },
    lightboxSet(state, action: PayloadAction<string | null>) {
      state.lightboxUrl = action.payload;
    },
    commandPaletteSet(state, action: PayloadAction<boolean>) {
      state.commandPaletteOpen = action.payload;
    },
    hotkeysModalSet(state, action: PayloadAction<boolean>) {
      state.hotkeysModalOpen = action.payload;
    },
    glossaryModalSet(state, action: PayloadAction<boolean>) {
      state.glossaryModalOpen = action.payload;
    },
    soundMutedSet(state, action: PayloadAction<boolean>) {
      state.soundMuted = action.payload;
      setSoundMuted(action.payload);
    },
    soundMutedToggled(state) {
      const next = !state.soundMuted;
      state.soundMuted = next;
      setSoundMuted(next);
    }
  }
});

export const {
  toastSet,
  sidebarSet,
  sidebarToggled,
  lightboxSet,
  commandPaletteSet,
  hotkeysModalSet,
  glossaryModalSet,
  soundMutedSet,
  soundMutedToggled
} = uiSlice.actions;
export const uiReducer = uiSlice.reducer;

export const toastShown = createAsyncThunk('ui/toastShown', async (message: string, { dispatch }) => {
  dispatch(toastSet(message));
  await new Promise(resolve => window.setTimeout(resolve, 3000));
  dispatch(toastSet(null));
});
