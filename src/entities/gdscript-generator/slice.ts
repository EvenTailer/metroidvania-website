import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { readJson } from '../../shared/lib/readJson';
import { DEFAULT_PHYSICS_PARAMS, DEFAULT_STATE_MACHINE_STATES, PHYSICS_PRESETS } from './defaultData';
import { PlatformerPhysicsParams, StateMachineState } from './types';

export interface GdscriptGeneratorState {
  physicsParams: PlatformerPhysicsParams;
  selectedPresetId: string;
  states: StateMachineState[];
  selectedStateId: string | null;
  activeTab: 'physics' | 'states' | 'code';
}

function loadState(): GdscriptGeneratorState {
  const saved = readJson<Partial<GdscriptGeneratorState> | null>('mv4_gdscript_gen', null);
  const physicsParams = saved?.physicsParams && typeof saved.physicsParams.jumpHeight === 'number'
    ? { ...DEFAULT_PHYSICS_PARAMS, ...saved.physicsParams }
    : DEFAULT_PHYSICS_PARAMS;

  const selectedPresetId = typeof saved?.selectedPresetId === 'string'
    ? saved.selectedPresetId
    : 'cyber-duck';

  const states = Array.isArray(saved?.states) && saved.states.length > 0
    ? saved.states
    : DEFAULT_STATE_MACHINE_STATES;

  const selectedStateId = typeof saved?.selectedStateId === 'string'
    ? saved.selectedStateId
    : states[0]?.id || 'idle';

  const activeTab = saved?.activeTab === 'states' || saved?.activeTab === 'code'
    ? saved.activeTab
    : 'physics';

  return {
    physicsParams,
    selectedPresetId,
    states,
    selectedStateId,
    activeTab
  };
}

const initialState: GdscriptGeneratorState = loadState();

export const gdscriptGeneratorSlice = createSlice({
  name: 'gdscriptGenerator',
  initialState,
  reducers: {
    physicsParamUpdated<K extends keyof PlatformerPhysicsParams>(
      state: GdscriptGeneratorState,
      action: PayloadAction<{ key: K; value: PlatformerPhysicsParams[K] }>
    ) {
      state.physicsParams[action.payload.key] = action.payload.value;
      state.selectedPresetId = 'custom';
    },
    physicsParamsSet(
      state: GdscriptGeneratorState,
      action: PayloadAction<PlatformerPhysicsParams>
    ) {
      state.physicsParams = action.payload;
    },
    presetSelected(state: GdscriptGeneratorState, action: PayloadAction<string>) {
      const preset = PHYSICS_PRESETS.find(p => p.id === action.payload);
      if (preset) {
        state.selectedPresetId = preset.id;
        state.physicsParams = { ...preset.params };
      }
    },
    stateToggled(state: GdscriptGeneratorState, action: PayloadAction<string>) {
      const st = state.states.find(s => s.id === action.payload);
      if (st) {
        st.enabled = !st.enabled;
      }
    },
    stateUpdated(state: GdscriptGeneratorState, action: PayloadAction<StateMachineState>) {
      const idx = state.states.findIndex(s => s.id === action.payload.id);
      if (idx >= 0) {
        state.states[idx] = action.payload;
      }
    },
    stateAdded(state: GdscriptGeneratorState, action: PayloadAction<StateMachineState>) {
      state.states.push(action.payload);
      state.selectedStateId = action.payload.id;
    },
    stateRemoved(state: GdscriptGeneratorState, action: PayloadAction<string>) {
      state.states = state.states.filter(s => s.id !== action.payload);
      // удаляем этот id из списков переходов остальных состояний
      state.states.forEach(s => {
        s.canTransitionTo = s.canTransitionTo.filter(id => id !== action.payload);
      });
      if (state.selectedStateId === action.payload) {
        state.selectedStateId = state.states[0]?.id || null;
      }
    },
    transitionToggled(
      state: GdscriptGeneratorState,
      action: PayloadAction<{ fromId: string; toId: string }>
    ) {
      const st = state.states.find(s => s.id === action.payload.fromId);
      if (!st) return;
      if (st.canTransitionTo.includes(action.payload.toId)) {
        st.canTransitionTo = st.canTransitionTo.filter(id => id !== action.payload.toId);
      } else {
        st.canTransitionTo.push(action.payload.toId);
      }
    },
    activeTabSet(
      state: GdscriptGeneratorState,
      action: PayloadAction<'physics' | 'states' | 'code'>
    ) {
      state.activeTab = action.payload;
    },
    selectedStateSet(state: GdscriptGeneratorState, action: PayloadAction<string | null>) {
      state.selectedStateId = action.payload;
    },
    resetToDefaults(state: GdscriptGeneratorState) {
      state.physicsParams = { ...DEFAULT_PHYSICS_PARAMS };
      state.selectedPresetId = 'cyber-duck';
      state.states = DEFAULT_STATE_MACHINE_STATES.map(item => ({
        ...item,
        canTransitionTo: [...item.canTransitionTo]
      }));
      state.selectedStateId = 'idle';
      state.activeTab = 'physics';
    }
  }
});

export const {
  physicsParamUpdated,
  physicsParamsSet,
  presetSelected,
  stateToggled,
  stateUpdated,
  stateAdded,
  stateRemoved,
  transitionToggled,
  activeTabSet,
  selectedStateSet,
  resetToDefaults
} = gdscriptGeneratorSlice.actions;
