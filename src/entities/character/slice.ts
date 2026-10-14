import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { readJson } from '../../shared/lib/readJson';
import { CharacterItem, DEFAULT_CHARACTERS } from './types';

export interface CharactersState {
  items: CharacterItem[];
}

function loadCharacters(): CharacterItem[] {
  const parsed = readJson<CharacterItem[] | null>('mv4_characters', null);
  if (!Array.isArray(parsed) || parsed.length === 0) return DEFAULT_CHARACTERS;
  const filtered = parsed.filter(item => item.id !== 'char-boss-1' && item.id !== 'char-npc-1');
  return filtered.length > 0 ? filtered : DEFAULT_CHARACTERS;
}

const charactersSlice = createSlice({
  name: 'characters',
  initialState: { items: loadCharacters() } as CharactersState,
  reducers: {
    characterSaved(state, action: PayloadAction<CharacterItem>) {
      const index = state.items.findIndex(item => item.id === action.payload.id);
      if (index >= 0) state.items[index] = action.payload;
      else state.items.unshift(action.payload);
    },
    characterRemoved(state, action: PayloadAction<string>) {
      state.items = state.items.filter(item => item.id !== action.payload);
    }
  }
});

export const { characterSaved, characterRemoved } = charactersSlice.actions;
export const charactersReducer = charactersSlice.reducer;
