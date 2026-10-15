import { createListenerMiddleware } from '@reduxjs/toolkit';
import type { SessionState } from '../../entities/session';
import type { TasksState } from '../../entities/task';
import { saveBoard } from '../../entities/task';
import type { RoadmapState } from '../../entities/roadmap';
import type { NotesState } from '../../entities/note';
import type { GalleryState } from '../../entities/gallery';
import type { CharactersState } from '../../entities/character';
import type { ChatState } from '../../entities/chat';
import type { NarrativeState } from '../../entities/narrative';
import { saveRoomMatrixToServer, type RoomMatrixState } from '../../entities/room-matrix';
import { saveBestiaryToServer, type BestiaryState } from '../../entities/bestiary';
import { savePlaytestToServer, type PlaytestState } from '../../entities/playtest';
import { saveWeeklyPlanToServer, type WeeklyPlanState } from '../../entities/weekly-plan';
import { saveEngineToServer, type EngineBridgeState } from '../../entities/engine-bridge';
import { pipelineAcked, pipelineSyncSet, saveAssetPipeline, type AssetPipelineState } from '../../entities/asset-pipeline';
import type { GdscriptGeneratorState } from '../../entities/gdscript-generator';
import { saveScreenshotIdb } from '../../shared/lib/indexedDbStorage';

export interface HubShape {
  session: SessionState;
  tasks: TasksState;
  roadmap: RoadmapState;
  notes: NotesState;
  gallery: GalleryState;
  characters: CharactersState;
  chat: ChatState;
  narrative: NarrativeState;
  weeklyPlan: WeeklyPlanState;
  roomMatrix: RoomMatrixState;
  bestiary: BestiaryState;
  playtest: PlaytestState;
  assetPipeline: AssetPipelineState;
  gdscriptGenerator: GdscriptGeneratorState;
  engineBridge: EngineBridgeState;
}

function safeSetItem(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch (err) {
    console.warn(`[Storage] Превышена квота или ошибка сохранения ${key} в localStorage:`, err);
  }
}

export function createHubListener() {
  const listenerMiddleware = createListenerMiddleware();

  function shape(state: unknown): HubShape {
    return state as HubShape;
  }

  function doneMap(docs: RoadmapState['docs']): Record<string, boolean> {
    const map: Record<string, boolean> = {};
    docs.forEach(doc => {
      doc.steps.forEach(step => {
        if (step.done) map[step.id] = true;
      });
    });
    return map;
  }

  listenerMiddleware.startListening({
    predicate: (_action, current, previous) => {
      const next = shape(current);
      const prev = shape(previous);
      return next.session !== prev.session
        || next.tasks !== prev.tasks
        || next.roadmap !== prev.roadmap
        || next.notes !== prev.notes
        || next.gallery !== prev.gallery
        || next.characters !== prev.characters
        || next.chat !== prev.chat
        || next.narrative !== prev.narrative
        || next.weeklyPlan !== prev.weeklyPlan
        || next.roomMatrix !== prev.roomMatrix
        || next.bestiary !== prev.bestiary
        || next.playtest !== prev.playtest
        || next.assetPipeline !== prev.assetPipeline
        || next.gdscriptGenerator !== prev.gdscriptGenerator
        || next.engineBridge !== prev.engineBridge;
    },
    effect: (_action, api) => {
      const state = shape(api.getState());
      safeSetItem('mv4_tasks', JSON.stringify(state.tasks.items));
      if (state.tasks.sprintStepId) safeSetItem('mv4_sprint_step_id', state.tasks.sprintStepId);
      else localStorage.removeItem('mv4_sprint_step_id');
      safeSetItem('mv4_roadmap_steps_done', JSON.stringify(doneMap(state.roadmap.docs)));
      safeSetItem('mv4_roadmaps', JSON.stringify({ docs: state.roadmap.docs, activeId: state.roadmap.activeId }));
      safeSetItem('mv4_notes', JSON.stringify(state.notes.items));
      safeSetItem('mv4_gallery', JSON.stringify(state.gallery.items));
      safeSetItem('mv4_characters', JSON.stringify(state.characters.items));
      safeSetItem('mv4_team_chat', JSON.stringify(state.chat.messages));
      safeSetItem('mv4_narrative', JSON.stringify(state.narrative.chapters));
      safeSetItem('mv4_weekly_plan', JSON.stringify(state.weeklyPlan));
      safeSetItem('mv4_room_matrix_rooms', JSON.stringify(state.roomMatrix.rooms));
      safeSetItem('mv4_room_matrix_sectors', JSON.stringify(state.roomMatrix.sectors));
      safeSetItem('mv4_bestiary', JSON.stringify(state.bestiary.items));
      safeSetItem('mv4_bestiary_view', JSON.stringify({
        selectedEnemyId: state.bestiary.selectedEnemyId,
        filter: state.bestiary.filter
      }));

      // Защищаем localStorage: большие скриншоты хранятся в IndexedDB
      const playtestItemsToSave = state.playtest.items.map(item => {
        if (item.screenshotUrl && item.screenshotUrl.startsWith('data:')) {
          saveScreenshotIdb(item.id, item.screenshotUrl).catch(() => {});
          return { ...item, screenshotUrl: `idb:${item.id}` };
        }
        return item;
      });
      safeSetItem('mv4_playtest', JSON.stringify(playtestItemsToSave));

      safeSetItem('mv4_playtest_view', JSON.stringify({
        selectedReportId: state.playtest.selectedReportId,
        filter: state.playtest.filter
      }));

      safeSetItem('mv4_asset_pipeline', JSON.stringify(state.assetPipeline.items));
      safeSetItem('mv4_asset_pipeline_view', JSON.stringify({
        selectedAssetId: state.assetPipeline.selectedAssetId,
        filter: state.assetPipeline.filter
      }));

      safeSetItem('mv4_gdscript_gen', JSON.stringify({
        physicsParams: state.gdscriptGenerator.physicsParams,
        selectedPresetId: state.gdscriptGenerator.selectedPresetId,
        states: state.gdscriptGenerator.states,
        selectedStateId: state.gdscriptGenerator.selectedStateId,
        activeTab: state.gdscriptGenerator.activeTab
      }));

      safeSetItem('mv4_engine_bridge', JSON.stringify({
        builds: state.engineBridge.builds,
        selectedBuildId: state.engineBridge.selectedBuildId,
        buildFilter: state.engineBridge.buildFilter,
        connectedFolderName: state.engineBridge.connectedFolderName,
        lastBridgeSyncAt: state.engineBridge.lastBridgeSyncAt,
        selectedConfigFileIds: state.engineBridge.selectedConfigFileIds,
        knownConfigFileIds: state.engineBridge.knownConfigFileIds,
        releaseChecklist: state.engineBridge.releaseChecklist
      }));

      if (state.session.authed) {
        sessionStorage.setItem('mv_auth_ok', 'true');
        sessionStorage.setItem('mv_author_idx', String(state.session.authorIndex));
      } else {
        sessionStorage.removeItem('mv_auth_ok');
        sessionStorage.removeItem('mv_author_idx');
      }
    }
  });

  listenerMiddleware.startListening({
    predicate: (_action, current, previous) => {
      const next = shape(current);
      const prev = shape(previous);
      if (!next.session.authed || !next.tasks.ready) return false;
      return next.tasks !== prev.tasks || next.roadmap !== prev.roadmap;
    },
    effect: async (_action, api) => {
      api.cancelActiveListeners();
      await api.delay(400);
      const state = shape(api.getState());
      if (!state.session.authed || !state.tasks.ready) return;
      try {
        await saveBoard({
          tasks: state.tasks.items,
          sprintStepId: state.tasks.sprintStepId,
          stepsDone: doneMap(state.roadmap.docs)
        });
      } catch {
        /* сервер недоступен, локальная копия уже записана */
      }
    }
  });

  listenerMiddleware.startListening({
    predicate: (_action, current, previous) => {
      const next = shape(current);
      const prev = shape(previous);
      if (!next.session.authed || !next.assetPipeline.ready) return false;
      return next.assetPipeline.items !== prev.assetPipeline.items
        || (!prev.assetPipeline.ready && next.assetPipeline.ready);
    },
    effect: async (_action, api) => {
      api.cancelActiveListeners();
      await api.delay(400);
      const state = shape(api.getState());
      if (!state.session.authed || !state.assetPipeline.ready) return;
      if (!state.assetPipeline.dirty && state.assetPipeline.remoteSavedAt) return;
      try {
        const savedAt = await saveAssetPipeline(state.assetPipeline.items);
        api.dispatch(pipelineAcked(savedAt));
      } catch {
        api.dispatch(pipelineSyncSet(false));
      }
    }
  });

  // Автосохранение матрицы комнат на сервере
  listenerMiddleware.startListening({
    predicate: (_action, current, previous) => {
      const next = shape(current);
      const prev = shape(previous);
      if (!next.session.authed) return false;
      return next.roomMatrix.rooms !== prev.roomMatrix.rooms || next.roomMatrix.sectors !== prev.roomMatrix.sectors;
    },
    effect: async (_action, api) => {
      await api.delay(600);
      const state = shape(api.getState());
      if (!state.session.authed) return;
      try {
        await saveRoomMatrixToServer(state.roomMatrix.rooms, state.roomMatrix.sectors);
      } catch {
        /* оффлайн/локально */
      }
    }
  });

  // Автосохранение бестиария на сервере
  listenerMiddleware.startListening({
    predicate: (_action, current, previous) => {
      const next = shape(current);
      const prev = shape(previous);
      if (!next.session.authed) return false;
      return next.bestiary.items !== prev.bestiary.items;
    },
    effect: async (_action, api) => {
      await api.delay(600);
      const state = shape(api.getState());
      if (!state.session.authed) return;
      try {
        await saveBestiaryToServer(state.bestiary.items);
      } catch {
        /* оффлайн/локально */
      }
    }
  });

  // Автосохранение плейтестов/багов на сервере
  listenerMiddleware.startListening({
    predicate: (_action, current, previous) => {
      const next = shape(current);
      const prev = shape(previous);
      if (!next.session.authed) return false;
      return next.playtest.items !== prev.playtest.items;
    },
    effect: async (_action, api) => {
      await api.delay(600);
      const state = shape(api.getState());
      if (!state.session.authed) return;
      try {
        await savePlaytestToServer(state.playtest.items);
      } catch {
        /* оффлайн/локально */
      }
    }
  });

  // Автосохранение недельного плана на сервере
  listenerMiddleware.startListening({
    predicate: (_action, current, previous) => {
      const next = shape(current);
      const prev = shape(previous);
      if (!next.session.authed) return false;
      return next.weeklyPlan !== prev.weeklyPlan;
    },
    effect: async (_action, api) => {
      await api.delay(600);
      const state = shape(api.getState());
      if (!state.session.authed) return;
      try {
        await saveWeeklyPlanToServer(state.weeklyPlan);
      } catch {
        /* оффлайн/локально */
      }
    }
  });

  // Автосохранение моста сборок и физики на сервере
  listenerMiddleware.startListening({
    predicate: (_action, current, previous) => {
      const next = shape(current);
      const prev = shape(previous);
      if (!next.session.authed) return false;
      return next.engineBridge.builds !== prev.engineBridge.builds
        || next.engineBridge.releaseChecklist !== prev.engineBridge.releaseChecklist
        || next.gdscriptGenerator !== prev.gdscriptGenerator;
    },
    effect: async (_action, api) => {
      await api.delay(600);
      const state = shape(api.getState());
      if (!state.session.authed) return;
      try {
        await saveEngineToServer({
          builds: state.engineBridge.builds,
          releaseChecklist: state.engineBridge.releaseChecklist,
          physicsParams: state.gdscriptGenerator.physicsParams,
          states: state.gdscriptGenerator.states
        });
      } catch {
        /* оффлайн/локально */
      }
    }
  });

  return listenerMiddleware;
}
