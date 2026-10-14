import React, { useCallback, useEffect, useRef, useSyncExternalStore } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AUTHORS } from '../entities/author';
import { generateFullContext } from '../pages/AiExportPage';
import { ViewType, viewFromLocation, writeViewHash } from '../shared/config/views';
import { AuthModal } from '../widgets/AuthModal';
import { Sidebar } from '../widgets/Sidebar';
import { Topbar } from '../widgets/Topbar';
import { MobileBottomNav } from '../widgets/MobileBottomNav';
import { useHubSync } from './model/useHubSync';
import {
  commandPaletteSet,
  glossaryModalSet,
  hotkeysModalSet,
  lightboxSet,
  sidebarSet,
  sidebarToggled,
  soundMutedToggled,
  toastShown
} from './model/uiSlice';
import { authorCycled, sessionLoggedIn, sessionLoggedOut } from '../entities/session';
import { roomSelected } from '../entities/room-matrix';
import { selectedEnemySet } from '../entities/bestiary';
import { selectedBuildSet } from '../entities/engine-bridge';
import { screenshotsHydrated } from '../entities/playtest';
import { getAllScreenshotsIdb } from '../shared/lib/indexedDbStorage';
import { useOnlineStatus } from '../shared/lib/networkStatus';
import { usePwaUpdate, useServiceWorkerControlled } from '../shared/lib/pwa';
import { PwaUpdateBanner } from '../shared/ui/PwaUpdateBanner';
import { CommandPaletteModal, useCommandPaletteItems } from '../features/command-palette';
import { HotkeysHelpModal, useGlobalHotkeys } from '../features/system-hotkeys';
import { GlossaryModal } from '../features/glossary-guide';
import { AppViewRouter } from './AppViewRouter';
import { useFocusTimerWatch } from './model/useFocusTimerWatch';
import type { AppDispatch, RootState } from './store';

function subscribeRoute(onStoreChange: () => void) {
  window.addEventListener('hashchange', onStoreChange);
  window.addEventListener('popstate', onStoreChange);
  return () => {
    window.removeEventListener('hashchange', onStoreChange);
    window.removeEventListener('popstate', onStoreChange);
  };
}

export const App: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  useFocusTimerWatch();
  const isOnline = useOnlineStatus();
  const cacheReady = useServiceWorkerControlled();
  const { updateReady, applyUpdate } = usePwaUpdate();

  // Redux-селекторы состояния
  const authed = useSelector((state: RootState) => state.session.authed);
  const authorIndex = useSelector((state: RootState) => state.session.authorIndex);
  const tasks = useSelector((state: RootState) => state.tasks.items);
  const sprintStepId = useSelector((state: RootState) => state.tasks.sprintStepId);
  const docs = useSelector((state: RootState) => state.roadmap.docs);
  const activeRoadmapId = useSelector((state: RootState) => state.roadmap.activeId);
  const notes = useSelector((state: RootState) => state.notes.items);
  const gallery = useSelector((state: RootState) => state.gallery.items);
  const galleryServerSync = useSelector((state: RootState) => state.gallery.serverSync);
  const galleryUploading = useSelector((state: RootState) => state.gallery.uploading);
  const characters = useSelector((state: RootState) => state.characters.items);
  const messages = useSelector((state: RootState) => state.chat.messages);
  const chatServerSync = useSelector((state: RootState) => state.chat.serverSync);
  const chapters = useSelector((state: RootState) => state.narrative.chapters);
  const weeklyPlan = useSelector((state: RootState) => state.weeklyPlan);
  const roomMatrix = useSelector((state: RootState) => state.roomMatrix);
  const bestiary = useSelector((state: RootState) => state.bestiary);
  const playtest = useSelector((state: RootState) => state.playtest);
  const assetPipeline = useSelector((state: RootState) => state.assetPipeline);
  const gdscriptGenerator = useSelector((state: RootState) => state.gdscriptGenerator);
  const engineBridge = useSelector((state: RootState) => state.engineBridge);

  // UI-селекторы
  const sidebarOpen = useSelector((state: RootState) => state.ui.sidebarOpen);
  const toast = useSelector((state: RootState) => state.ui.toast);
  const lightboxUrl = useSelector((state: RootState) => state.ui.lightboxUrl);
  const commandPaletteOpen = useSelector((state: RootState) => state.ui.commandPaletteOpen);
  const hotkeysModalOpen = useSelector((state: RootState) => state.ui.hotkeysModalOpen);
  const glossaryModalOpen = useSelector((state: RootState) => state.ui.glossaryModalOpen);
  const soundMuted = useSelector((state: RootState) => state.ui.soundMuted);

  const currentView = useSyncExternalStore(subscribeRoute, viewFromLocation, () => 'dashboard' as ViewType);
  const seenRoute = useRef(currentView);
  const { refreshChat } = useHubSync();

  useEffect(() => {
    writeViewHash(viewFromLocation(), 'replace');
  }, []);

  useEffect(() => {
    if (seenRoute.current === currentView) return;
    seenRoute.current = currentView;
    dispatch(sidebarSet(false));
  }, [currentView, dispatch]);

  useEffect(() => {
    getAllScreenshotsIdb().then(shots => {
      if (shots && Object.keys(shots).length > 0) {
        dispatch(screenshotsHydrated(shots));
      }
    }).catch(() => {});
  }, [dispatch]);

  const activeDoc = docs.find(doc => doc.id === activeRoadmapId) || docs[0];
  const steps = activeDoc?.steps ?? [];
  const allSteps = docs.flatMap(doc => doc.steps);
  const currentAuthor = AUTHORS[authorIndex] || AUTHORS[0];
  const currentSprintStep = sprintStepId ? (allSteps.find(step => step.id === sprintStepId) || null) : null;
  const taskCount = tasks.filter(task => task.status === 'in-progress' || task.status === 'backlog').length;

  const showToast = useCallback((message: string) => { dispatch(toastShown(message)); }, [dispatch]);

  const selectView = useCallback((view: ViewType) => {
    dispatch(sidebarSet(false));
    writeViewHash(view, 'push');
  }, [dispatch]);

  const copyContextToClipboard = useCallback(() => {
    const text = generateFullContext(tasks, allSteps, sprintStepId, notes);
    navigator.clipboard.writeText(text).then(() => {
      dispatch(toastShown('Слепок проекта скопирован! Вставьте в Cursor или Grok'));
    });
  }, [tasks, allSteps, sprintStepId, notes, dispatch]);

  const cycleAuthorRole = useCallback(() => {
    dispatch(authorCycled());
    const next = AUTHORS[(authorIndex + 1) % AUTHORS.length];
    dispatch(toastShown(`Текущий автор: ${next.name}`));
  }, [authorIndex, dispatch]);

  const toggleSound = useCallback(() => {
    dispatch(soundMutedToggled());
    dispatch(toastShown(soundMuted ? 'Звук включен 🔊' : 'Звук выключен 🔇'));
  }, [dispatch, soundMuted]);

  const closeModals = useCallback(() => {
    dispatch(commandPaletteSet(false));
    dispatch(hotkeysModalSet(false));
    dispatch(glossaryModalSet(false));
    dispatch(lightboxSet(null));
  }, [dispatch]);

  const closeSidebar = useCallback(() => {
    dispatch(sidebarSet(false));
  }, [dispatch]);

  const openRoom = useCallback((roomId: string) => {
    dispatch(roomSelected(roomId));
    selectView('room-matrix');
  }, [dispatch, selectView]);

  const openEnemy = useCallback((enemyId: string) => {
    dispatch(selectedEnemySet(enemyId));
    selectView('bestiary');
  }, [dispatch, selectView]);

  const openBuild = useCallback((buildId: string) => {
    dispatch(selectedBuildSet(buildId));
    selectView('engine-bridge');
  }, [dispatch, selectView]);

  const openGlossary = useCallback(() => dispatch(glossaryModalSet(true)), [dispatch]);
  const openHotkeys = useCallback(() => dispatch(hotkeysModalSet(true)), [dispatch]);

  const blockAppShortcuts = commandPaletteOpen || hotkeysModalOpen || glossaryModalOpen || Boolean(lightboxUrl);

  useGlobalHotkeys({
    blockAppShortcuts,
    onToggleCommandPalette: () => dispatch(commandPaletteSet(!commandPaletteOpen)),
    onOpenHotkeysModal: openHotkeys,
    onOpenGlossaryModal: openGlossary,
    onToggleSoundMute: toggleSound,
    onCloseModals: closeModals,
    onCloseSidebar: closeSidebar,
    onSelectView: selectView
  });

  // Элементы командной палитры поиска
  const commandItems = useCommandPaletteItems({
    rooms: roomMatrix.rooms,
    enemies: bestiary.items,
    builds: engineBridge.builds,
    onSelectView: selectView,
    onSelectRoom: openRoom,
    onSelectEnemy: openEnemy,
    onSelectBuild: openBuild,
    onCopyContext: copyContextToClipboard,
    onCycleAuthor: cycleAuthorRole,
    onOpenGlossary: openGlossary,
    onOpenHotkeys: openHotkeys,
    onToggleSound: toggleSound
  });

  if (!authed) {
    return (
      <>
        <div className="bg-layer" />
        <div className="grid-overlay" />
        <AuthModal onLogin={(index) => {
          dispatch(sessionLoggedIn(index));
          dispatch(toastShown(`Добро пожаловать, ${AUTHORS[index].name}!`));
        }} />
        {updateReady && <PwaUpdateBanner onApply={applyUpdate} />}
      </>
    );
  }

  return (
    <>
      <div className="bg-layer" />
      <div className="grid-overlay" />

      <div className="app-layout">
        {sidebarOpen && (
          <button
            type="button"
            className="sidebar-backdrop"
            aria-label="Закрыть меню"
            onClick={() => dispatch(sidebarSet(false))}
          />
        )}
        <Sidebar
          currentView={currentView}
          onSelectView={selectView}
          isOpen={sidebarOpen}
          onLogout={() => dispatch(sessionLoggedOut())}
          taskCount={taskCount}
        />

        <main className="app-main">
          <Topbar
            currentView={currentView}
            currentAuthor={currentAuthor}
            onCycleAuthor={cycleAuthorRole}
            onToggleSidebar={() => dispatch(sidebarToggled())}
            onCopyContext={copyContextToClipboard}
            onOpenCommandPalette={() => dispatch(commandPaletteSet(true))}
            onOpenHotkeysModal={() => dispatch(hotkeysModalSet(true))}
            onOpenGlossaryModal={() => dispatch(glossaryModalSet(true))}
            isSoundMuted={soundMuted}
            onToggleSoundMute={toggleSound}
            isOnline={isOnline}
            cacheReady={cacheReady}
          />

          <AppViewRouter
            currentView={currentView}
            currentAuthor={currentAuthor}
            tasks={tasks}
            characters={characters}
            docs={docs}
            activeDoc={activeDoc}
            steps={steps}
            allSteps={allSteps}
            sprintStepId={sprintStepId}
            currentSprintStep={currentSprintStep}
            weeklyPlan={weeklyPlan}
            messages={messages}
            chatServerSync={chatServerSync}
            refreshChat={refreshChat}
            roomMatrix={roomMatrix}
            bestiary={bestiary}
            playtest={playtest}
            assetPipeline={assetPipeline}
            gdscriptGenerator={gdscriptGenerator}
            engineBridge={engineBridge}
            gallery={gallery}
            galleryServerSync={galleryServerSync}
            galleryUploading={galleryUploading}
            notes={notes}
            chapters={chapters}
            selectView={selectView}
            showToast={showToast}
          />
        </main>
      </div>

      <MobileBottomNav currentView={currentView} onSelectView={selectView} onOpenSidebar={() => dispatch(sidebarSet(true))} />

      {/* Командная палитра быстрого поиска Ctrl+K */}
      <CommandPaletteModal
        isOpen={commandPaletteOpen}
        items={commandItems}
        onClose={() => dispatch(commandPaletteSet(false))}
      />

      {/* Шпаргалка горячих клавиш ? */}
      <HotkeysHelpModal
        isOpen={hotkeysModalOpen}
        onClose={() => dispatch(hotkeysModalSet(false))}
      />

      {/* Справочник терминов Godot и Метроидвании */}
      <GlossaryModal
        isOpen={glossaryModalOpen}
        onClose={() => dispatch(glossaryModalSet(false))}
      />

      {updateReady && <PwaUpdateBanner onApply={applyUpdate} />}

      {lightboxUrl && (
        <div className="lightbox-backdrop" data-hub-dialog="open" onClick={() => dispatch(lightboxSet(null))}>
          <div className="lightbox-frame" onClick={(event) => event.stopPropagation()}>
            <img src={lightboxUrl} alt="Просмотр" />
            <a className="btn btn-primary" href={lightboxUrl} download={lightboxUrl.split('/').pop() || 'image'}>Скачать</a>
          </div>
        </div>
      )}

      {toast && <div className="toast-box">{toast}</div>}
    </>
  );
};
