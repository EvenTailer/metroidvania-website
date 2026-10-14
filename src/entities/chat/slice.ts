import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { readJson } from '../../shared/lib/readJson';
import { DEFAULT_TEAM_MESSAGES, TeamMessage } from './types';

export interface ChatState {
  messages: TeamMessage[];
  serverSync: boolean;
}

function loadMessages(): TeamMessage[] {
  const data = readJson<TeamMessage[]>('mv4_team_chat', DEFAULT_TEAM_MESSAGES);
  return Array.isArray(data) ? data : DEFAULT_TEAM_MESSAGES;
}

const chatSlice = createSlice({
  name: 'chat',
  initialState: { messages: loadMessages(), serverSync: true } as ChatState,
  reducers: {
    messagesReplaced(state, action: PayloadAction<TeamMessage[]>) {
      state.messages = action.payload;
    },
    messageAdded(state, action: PayloadAction<TeamMessage>) {
      state.messages.unshift(action.payload);
    },
    messageRemoved(state, action: PayloadAction<string>) {
      state.messages = state.messages.filter(message => message.id !== action.payload);
    },
    chatSyncSet(state, action: PayloadAction<boolean>) {
      state.serverSync = action.payload;
    }
  }
});

export const { messagesReplaced, messageAdded, messageRemoved, chatSyncSet } = chatSlice.actions;
export const chatReducer = chatSlice.reducer;
