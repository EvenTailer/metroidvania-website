import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { sessionReducer } from '../entities/session';
import { tasksReducer } from '../entities/task';
import { roadmapReducer } from '../entities/roadmap';
import { notesReducer } from '../entities/note';
import { galleryReducer } from '../entities/gallery';
import { charactersReducer } from '../entities/character';
import { chatReducer } from '../entities/chat';
import { narrativeReducer } from '../entities/narrative';
import { weeklyPlanReducer } from '../entities/weekly-plan';
import { roomMatrixReducer } from '../entities/room-matrix';
import { bestiaryReducer } from '../entities/bestiary';
import { playtestReducer } from '../entities/playtest';
import { assetPipelineSlice } from '../entities/asset-pipeline';
import { gdscriptGeneratorSlice } from '../entities/gdscript-generator';
import { engineBridgeSlice } from '../entities/engine-bridge';
import { createHubListener } from './model/listeners';
import { uiReducer } from './model/uiSlice';

export const rootReducer = combineReducers({
  session: sessionReducer,
  tasks: tasksReducer,
  roadmap: roadmapReducer,
  notes: notesReducer,
  gallery: galleryReducer,
  characters: charactersReducer,
  chat: chatReducer,
  narrative: narrativeReducer,
  weeklyPlan: weeklyPlanReducer,
  roomMatrix: roomMatrixReducer,
  bestiary: bestiaryReducer,
  playtest: playtestReducer,
  assetPipeline: assetPipelineSlice.reducer,
  gdscriptGenerator: gdscriptGeneratorSlice.reducer,
  engineBridge: engineBridgeSlice.reducer,
  ui: uiReducer
});

export function createHubStore() {
  return configureStore({
    reducer: rootReducer,
    middleware: getDefault => getDefault().prepend(createHubListener().middleware)
  });
}

export const store = createHubStore();
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
