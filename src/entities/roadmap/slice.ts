import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { readJson } from '../../shared/lib/readJson';
import { ROADMAP, RoadmapStep } from './types';

export interface RoadmapDoc {
  id: string;
  title: string;
  steps: RoadmapStep[];
}

export interface RoadmapState {
  docs: RoadmapDoc[];
  activeId: string;
}

export const MAIN_ROADMAP_ID = 'main';

export function blankStep(): RoadmapStep {
  return {
    id: 'step-' + Date.now(),
    phase: 'Новый шаг',
    title: 'Без названия',
    desc: '',
    tech: '',
    done: false,
    goal: '',
    duration: '',
    godotNodes: [],
    deliverables: [],
    pitfalls: [],
    testCriteria: [],
    subtasks: []
  };
}

function withDoneFlags(steps: RoadmapStep[], doneMap: Record<string, boolean>): RoadmapStep[] {
  return steps.map(step => ({ ...step, done: Boolean(doneMap[step.id]) }));
}

function loadRoadmaps(): RoadmapState {
  const saved = readJson<RoadmapState | null>('mv4_roadmaps', null);
  if (saved && Array.isArray(saved.docs) && saved.docs.length > 0) {
    const activeId = saved.docs.some(doc => doc.id === saved.activeId) ? saved.activeId : saved.docs[0].id;
    return {
      activeId,
      docs: saved.docs.map(doc => ({
        id: String(doc.id),
        title: String(doc.title || 'Роадмап'),
        steps: Array.isArray(doc.steps) ? doc.steps : []
      }))
    };
  }
  const doneMap = readJson<Record<string, boolean>>('mv4_roadmap_steps_done', {});
  return {
    activeId: MAIN_ROADMAP_ID,
    docs: [{ id: MAIN_ROADMAP_ID, title: 'Игра: 0 → Steam', steps: withDoneFlags(ROADMAP, doneMap) }]
  };
}

function findStep(state: RoadmapState, stepId: string): RoadmapStep | undefined {
  for (const doc of state.docs) {
    const step = doc.steps.find(item => item.id === stepId);
    if (step) return step;
  }
  return undefined;
}

const roadmapSlice = createSlice({
  name: 'roadmap',
  initialState: loadRoadmaps(),
  reducers: {
    stepsDoneApplied(state, action: PayloadAction<Record<string, boolean>>) {
      state.docs.forEach(doc => {
        doc.steps.forEach(step => {
          if (action.payload[step.id]) step.done = true;
          else if (/^step-\d+$/.test(step.id)) step.done = false;
        });
      });
    },
    stepDoneToggled(state, action: PayloadAction<string>) {
      const step = findStep(state, action.payload);
      if (step) step.done = !step.done;
    },
    roadmapSelected(state, action: PayloadAction<string>) {
      if (state.docs.some(doc => doc.id === action.payload)) state.activeId = action.payload;
    },
    roadmapAdded(state, action: PayloadAction<{ id: string; title: string }>) {
      state.docs.push({ id: action.payload.id, title: action.payload.title.trim() || 'Новый роадмап', steps: [] });
      state.activeId = action.payload.id;
    },
    roadmapRenamed(state, action: PayloadAction<{ id: string; title: string }>) {
      const doc = state.docs.find(item => item.id === action.payload.id);
      const title = action.payload.title.trim();
      if (doc && title) doc.title = title;
    },
    roadmapRemoved(state, action: PayloadAction<string>) {
      if (state.docs.length < 2) return;
      state.docs = state.docs.filter(doc => doc.id !== action.payload);
      if (!state.docs.some(doc => doc.id === state.activeId)) state.activeId = state.docs[0].id;
    },
    stepAdded(state, action: PayloadAction<{ roadmapId: string; step: RoadmapStep }>) {
      const doc = state.docs.find(item => item.id === action.payload.roadmapId);
      if (doc) doc.steps.push(action.payload.step);
    },
    stepUpdated(state, action: PayloadAction<{ id: string; patch: Partial<RoadmapStep> }>) {
      const step = findStep(state, action.payload.id);
      if (!step) return;
      const { id: _id, ...patch } = action.payload.patch;
      Object.assign(step, patch);
    },
    stepRemoved(state, action: PayloadAction<string>) {
      state.docs.forEach(doc => {
        doc.steps = doc.steps.filter(step => step.id !== action.payload);
      });
    }
  }
});

export const {
  stepsDoneApplied,
  stepDoneToggled,
  roadmapSelected,
  roadmapAdded,
  roadmapRenamed,
  roadmapRemoved,
  stepAdded,
  stepUpdated,
  stepRemoved
} = roadmapSlice.actions;

export const roadmapReducer = roadmapSlice.reducer;

