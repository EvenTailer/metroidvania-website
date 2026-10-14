export type { NarrativeBlock, NarrativeBlockType, NarrativeChapter, NarrativeChoiceOption } from './types';
export { DEFAULT_NARRATIVE_CHAPTERS } from './types';
export { fetchNarrativeFromServer, saveNarrativeToServer } from './api';
export { chaptersReplaced, narrativeReducer } from './slice';
export type { NarrativeState } from './slice';
