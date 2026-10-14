import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { normalizeAuthor } from '../author';
import { readJson } from '../../shared/lib/readJson';
import { DEFAULT_NOTES, NoteItem } from './types';

export interface NotesState {
  items: NoteItem[];
}

function loadNotes(): NoteItem[] {
  const data = readJson<NoteItem[]>('mv4_notes', DEFAULT_NOTES);
  if (!Array.isArray(data)) return DEFAULT_NOTES;
  return data.map(note => ({ ...note, author: normalizeAuthor(note.author || '') }));
}

const notesSlice = createSlice({
  name: 'notes',
  initialState: { items: loadNotes() } as NotesState,
  reducers: {
    noteAdded(state, action: PayloadAction<NoteItem>) {
      state.items.unshift(action.payload);
    },
    noteRemoved(state, action: PayloadAction<string>) {
      state.items = state.items.filter(note => note.id !== action.payload);
    }
  }
});

export const { noteAdded, noteRemoved } = notesSlice.actions;
export const notesReducer = notesSlice.reducer;
