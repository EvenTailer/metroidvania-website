import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchChatFromServer, chatSyncSet, messagesReplaced } from '../../entities/chat';
import { fetchGalleryFromServer, galleryReplaced, gallerySyncSet } from '../../entities/gallery';
import { chaptersReplaced, fetchNarrativeFromServer } from '../../entities/narrative';
import { boardReadySet, fetchBoard, sprintSet, tasksReplaced } from '../../entities/task';
import { stepsDoneApplied } from '../../entities/roadmap';
import {
  assetsReplaced,
  fetchAssetPipeline,
  pipelineMarkedDirty,
  pipelineReadySet,
  pipelineSyncSet
} from '../../entities/asset-pipeline';
import { fetchRoomMatrixFromServer, matrixHydrated } from '../../entities/room-matrix';
import { fetchBestiaryFromServer, bestiaryImported } from '../../entities/bestiary';
import { fetchPlaytestFromServer, reportsImported } from '../../entities/playtest';
import { fetchWeeklyPlanFromServer, weeklyPlanReplaced } from '../../entities/weekly-plan';
import { fetchEngineFromServer, engineHydrated } from '../../entities/engine-bridge';
import { store, type AppDispatch, type RootState } from '../store';
import { toastShown } from './uiSlice';

export function useHubSync() {
  const dispatch = useDispatch<AppDispatch>();
  const authed = useSelector((state: RootState) => state.session.authed);

  useEffect(() => {
    if (!authed) {
      dispatch(boardReadySet(false));
      return;
    }
    let cancelled = false;

    fetchBoard()
      .then(board => {
        if (cancelled) return;
        if (board.initialized) {
          dispatch(tasksReplaced(board.tasks));
          dispatch(sprintSet(board.sprintStepId));
          dispatch(stepsDoneApplied(board.stepsDone));
        }
        dispatch(boardReadySet(true));
      })
      .catch(() => {
        if (!cancelled) dispatch(boardReadySet(true));
      });

    fetchGalleryFromServer()
      .then(items => {
        if (cancelled) return;
        dispatch(gallerySyncSet(true));
        if (items.length > 0) dispatch(galleryReplaced(items));
      })
      .catch(() => {
        if (!cancelled) dispatch(gallerySyncSet(false));
      });

    fetchChatFromServer()
      .then(messages => {
        if (cancelled) return;
        dispatch(chatSyncSet(true));
        if (messages.length > 0) dispatch(messagesReplaced(messages));
      })
      .catch(() => {
        if (!cancelled) dispatch(chatSyncSet(false));
      });

    const pullAssets = () => {
      fetchAssetPipeline()
        .then(remote => {
          if (cancelled) return;
          const local = store.getState().assetPipeline;
          if (local.dirty) {
            dispatch(pipelineReadySet(true));
            return;
          }
          if (remote.initialized && remote.savedAt !== local.remoteSavedAt) {
            dispatch(assetsReplaced({ items: remote.items, savedAt: remote.savedAt }));
          } else if (!remote.initialized) {
            dispatch(pipelineMarkedDirty());
          }
          dispatch(pipelineSyncSet(true));
          dispatch(pipelineReadySet(true));
        })
        .catch(() => {
          if (cancelled) return;
          dispatch(pipelineSyncSet(false));
          dispatch(pipelineReadySet(true));
        });
    };

    pullAssets();

    fetchNarrativeFromServer()
      .then(chapters => {
        if (cancelled || chapters.length === 0) return;
        dispatch(chaptersReplaced(chapters));
      })
      .catch(() => {});

    fetchRoomMatrixFromServer()
      .then(matrix => {
        if (cancelled || !matrix.initialized) return;
        dispatch(matrixHydrated({ rooms: matrix.rooms, sectors: matrix.sectors }));
      })
      .catch(() => {});

    fetchBestiaryFromServer()
      .then(b => {
        if (cancelled || !b.initialized || b.items.length === 0) return;
        dispatch(bestiaryImported(b.items));
      })
      .catch(() => {});

    fetchPlaytestFromServer()
      .then(p => {
        if (cancelled || !p.initialized || p.items.length === 0) return;
        dispatch(reportsImported(p.items));
      })
      .catch(() => {});

    fetchWeeklyPlanFromServer()
      .then(w => {
        if (cancelled || !w.initialized || !w.plan) return;
        dispatch(weeklyPlanReplaced(w.plan));
      })
      .catch(() => {});

    fetchEngineFromServer()
      .then(e => {
        if (cancelled || !e.initialized) return;
        dispatch(engineHydrated({ builds: e.builds, releaseChecklist: e.releaseChecklist }));
      })
      .catch(() => {});

    const assetInterval = window.setInterval(pullAssets, 8000);

    const interval = window.setInterval(() => {
      fetchChatFromServer()
        .then(messages => {
          if (messages.length > 0) {
            dispatch(messagesReplaced(messages));
            dispatch(chatSyncSet(true));
          }
        })
        .catch(() => dispatch(chatSyncSet(false)));
    }, 4000);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
      window.clearInterval(assetInterval);
    };
  }, [authed, dispatch]);

  return {
    refreshChat() {
      fetchChatFromServer()
        .then(messages => {
          if (messages.length > 0) {
            dispatch(messagesReplaced(messages));
            dispatch(chatSyncSet(true));
          }
          dispatch(toastShown('Чат обновлен с сервера'));
        })
        .catch(() => dispatch(chatSyncSet(false)));
    }
  };
}
