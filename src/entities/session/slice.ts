import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AUTHORS } from '../author';

export interface SessionState {
  authed: boolean;
  authorIndex: number;
}

function loadSession(): SessionState {
  const saved = sessionStorage.getItem('mv_author_idx');
  return {
    authed: sessionStorage.getItem('mv_auth_ok') === 'true',
    authorIndex: saved !== null ? parseInt(saved, 10) || 0 : 0
  };
}

const sessionSlice = createSlice({
  name: 'session',
  initialState: loadSession(),
  reducers: {
    sessionLoggedIn(state, action: PayloadAction<number>) {
      state.authorIndex = action.payload;
      state.authed = true;
    },
    sessionLoggedOut(state) {
      state.authed = false;
    },
    authorCycled(state) {
      state.authorIndex = (state.authorIndex + 1) % AUTHORS.length;
    }
  }
});

export const { sessionLoggedIn, sessionLoggedOut, authorCycled } = sessionSlice.actions;
export const sessionReducer = sessionSlice.reducer;
