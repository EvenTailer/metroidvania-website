import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { readJson } from '../../shared/lib/readJson';
import { DEFAULT_NARRATIVE_CHAPTERS, NarrativeChapter } from './types';

export interface NarrativeState {
  chapters: NarrativeChapter[];
}

function loadChapters(): NarrativeChapter[] {
  const data = readJson<NarrativeChapter[]>('mv4_narrative', DEFAULT_NARRATIVE_CHAPTERS);
  return Array.isArray(data) ? data : DEFAULT_NARRATIVE_CHAPTERS;
}

const narrativeSlice = createSlice({
  name: 'narrative',
  initialState: { chapters: loadChapters() } as NarrativeState,
  reducers: {
    chaptersReplaced(state, action: PayloadAction<NarrativeChapter[]>) {
      state.chapters = action.payload;
    }
  }
});

export const { chaptersReplaced } = narrativeSlice.actions;
export const narrativeReducer = narrativeSlice.reducer;
