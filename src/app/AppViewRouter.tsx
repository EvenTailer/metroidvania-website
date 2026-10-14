import React from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from './store';
import { ViewType, writeViewHash } from '../shared/config/views';
import { Author } from '../entities/author';
import { Task } from '../entities/task';
import { CharacterItem } from '../entities/character';
import { RoadmapDoc, RoadmapStep, roadmapSelected } from '../entities/roadmap';
import { WeeklyPlanState } from '../entities/weekly-plan';
import { TeamMessage } from '../entities/chat';
import {
  Direction,
  RoomLock,
  RoomMatrixState,
  RoomNode,
  roomSelected,
  roomAdded,
  roomUpdated,
  roomRemoved,
  roomPositionChanged,
  roomImageUpdated,
  connectionAdded,
  connectionRemoved,
  connectionLockUpdated,
  simulatedAbilityToggled,
  simulatedAbilitiesReset,
  allAbilitiesUnlocked,
  sectorFilterChanged,
  matrixResetToDefault,
  ABILITY_DEFINITIONS
} from '../entities/room-matrix';
import {
  BestiaryState,
  ProductionChecklist,
  selectedEnemySet,
  enemyAdded,
  enemyUpdated,
  enemyRemoved,
  bestiaryFilterChanged,
  enemyChecklistToggled,
  bestiaryImported,
  bestiaryResetToDefault
} from '../entities/bestiary';
import {
  PlaytestState,
  playtestFilterChanged,
  selectedReportSet,
  reportAdded,
  reportUpdated,
  reportRemoved,
  reportStatusSet,
  reportsImported
} from '../entities/playtest';
import {
  AssetPipelineState,
  assetFilterChanged,
  assetSelected,
  assetAdded,
  assetUpdated,
  assetRemoved,
  assetStageAdvanced,
  assetStageReverted,
  assetStageSet,
  assetChecklistToggled,
  assetsImported,
  assetsResetToDefault
} from '../entities/asset-pipeline';
import {
  GdscriptGeneratorState,
  activeTabSet,
  physicsParamUpdated,
  presetSelected,
  selectedStateSet,
  stateToggled,
  stateUpdated,
  stateAdded,
  stateRemoved,
  transitionToggled,
  resetToDefaults as gdscriptResetDefaults
} from '../entities/gdscript-generator';
import {
  EngineBridgeState,
  buildAdded,
  buildUpdated,
  buildRemoved,
  selectedBuildSet,
  buildFilterChanged,
  configFileToggled,
  allConfigFilesToggled,
  configFilesDiscovered,
  connectedFolderNameSet,
  folderAccessSet,
  checklistItemToggled,
  lastBridgeSyncAtSet
} from '../entities/engine-bridge';
import { GalleryItem, galleryUpserted } from '../entities/gallery';
import { NoteItem } from '../entities/note';
import { NarrativeChapter } from '../entities/narrative';
import { lightboxSet } from './model/uiSlice';
import {
  addNote, addRoadmapStep, addWeeklyPlanItem, attachTaskImage, addTaskComment,
  updateTaskComment, removeTaskComment, createRoadmap, createTask,
  moveWeeklyPlanItem, pushSingleTaskToKanban, pushSubtasksToKanban, removeCharacter,
  removeNote, removeRoadmap, removeRoadmapStep, removeTask, removeTeamMessage,
  removeWeeklyPlanItem, renameRoadmap, resetWeeklyPlan, saveCharacter, saveNarrativeChapters,
  saveRoadmapStep, scheduleTaskToDay, selectWeeklyWeek, selectFocusTask, sendTeamMessage, setSprintStep, setFocusPreset, toggleStepDone,
  toggleFocusTimer, resetFocusTimer, extendFocusTimer, shortenFocusTimer, logFocusElapsed,
  toggleWeeklyBigGoal, toggleWeeklyPlanItem, updateTaskStatus, updateWeeklyBigGoal,
  updateWeeklyPlanItem, updateWeeklyRetro, updateWeeklyTitle, uploadGalleryItem
} from './model/commands';

import { DashboardPage } from '../pages/DashboardPage';
import { WeeklyPlanPage } from '../pages/WeeklyPlanPage';
import { RoadmapPage } from '../pages/RoadmapPage';
import { KanbanPage } from '../pages/KanbanPage';
import { TeamChatPage } from '../pages/TeamChatPage';
import { HeroPage } from '../pages/HeroPage';
import { RoomMatrixPage } from '../pages/RoomMatrixPage';
import { BestiaryPage } from '../pages/BestiaryPage';
import { PlaytestPage } from '../pages/PlaytestPage';
import { AssetPipelinePage } from '../pages/AssetPipelinePage';
import { GdscriptGeneratorPage } from '../pages/GdscriptGeneratorPage';
import { EngineBridgePage } from '../pages/EngineBridgePage';
import { GalleryPage } from '../pages/GalleryPage';
import { NotesPage } from '../pages/NotesPage';
import { AiChatPage } from '../pages/AiChatPage';
import { AiExportPage } from '../pages/AiExportPage';
import { FsdSpecPage } from '../pages/FsdSpecPage';

interface AppViewRouterProps {
  currentView: ViewType;
  currentAuthor: Author;
  tasks: Task[];
  characters: CharacterItem[];
  docs: RoadmapDoc[];
  activeDoc: RoadmapDoc | undefined;
  steps: RoadmapStep[];
  allSteps: RoadmapStep[];
  sprintStepId: string | null;
  currentSprintStep: RoadmapStep | null;
  weeklyPlan: WeeklyPlanState;
  messages: TeamMessage[];
  chatServerSync: boolean;
  refreshChat: () => void;
  roomMatrix: RoomMatrixState;
  bestiary: BestiaryState;
  playtest: PlaytestState;
  assetPipeline: AssetPipelineState;
  gdscriptGenerator: GdscriptGeneratorState;
  engineBridge: EngineBridgeState;
  gallery: GalleryItem[];
  galleryServerSync: boolean;
  galleryUploading: boolean;
  notes: NoteItem[];
  chapters: NarrativeChapter[];
  selectView: (view: ViewType) => void;
  showToast: (msg: string) => void;
}

export const AppViewRouter: React.FC<AppViewRouterProps> = ({
  currentView,
  currentAuthor,
  tasks,
  characters,
  docs,
  activeDoc,
  steps,
  allSteps,
  sprintStepId,
  currentSprintStep,
  weeklyPlan,
  messages,
  chatServerSync,
  refreshChat,
  roomMatrix,
  bestiary,
  playtest,
  assetPipeline,
  gdscriptGenerator,
  engineBridge,
  gallery,
  galleryServerSync,
  galleryUploading,
  notes,
  chapters,
  selectView,
  showToast
}) => {
  const dispatch = useDispatch<AppDispatch>();

  return (
    <div className="view-router">
      {currentView === 'dashboard' && (
        <DashboardPage
          currentSprintStep={currentSprintStep}
          tasks={tasks}
          characters={characters}
          onOpenKanban={() => selectView('kanban')}
          onOpenRoadmap={() => selectView('roadmap')}
          onOpenWeeklyPlan={() => selectView('weekly-plan')}
          onSetSprintStep={(stepId) => dispatch(setSprintStep(stepId))}
          onOpenLightbox={(url) => dispatch(lightboxSet(url))}
          onAddNote={(tag, text) => dispatch(addNote(tag, text))}
          onSaveCharacter={(character) => dispatch(saveCharacter(character))}
          onDeleteCharacter={(id) => dispatch(removeCharacter(id))}
          onCreateTask={(title, category) => dispatch(createTask(title, category))}
          onUpdateTaskStatus={(id, status) => dispatch(updateTaskStatus(id, status))}
          onPushMissing={(stepId) => dispatch(pushSubtasksToKanban(stepId, true))}
          onShowToast={showToast}
        />
      )}
      {currentView === 'weekly-plan' && (
        <WeeklyPlanPage
          weeklyPlan={weeklyPlan}
          tasks={tasks}
          onAddPlanItem={(day, title, category, taskId, estimatedMinutes, goalIndex) =>
            dispatch(addWeeklyPlanItem(day, title, category, taskId, estimatedMinutes, goalIndex))
          }
          onTogglePlanItem={(day, itemId) => dispatch(toggleWeeklyPlanItem(day, itemId))}
          onRemovePlanItem={(day, itemId) => dispatch(removeWeeklyPlanItem(day, itemId))}
          onUpdatePlanItem={(day, itemId, patch) => dispatch(updateWeeklyPlanItem(day, itemId, patch))}
          onMovePlanItem={(fromDay, toDay, itemId) => dispatch(moveWeeklyPlanItem(fromDay, toDay, itemId))}
          onUpdateBigGoal={(index, text) => dispatch(updateWeeklyBigGoal(index, text))}
          onToggleBigGoal={(index) => dispatch(toggleWeeklyBigGoal(index))}
          onSaveRetro={(patch) => dispatch(updateWeeklyRetro(patch))}
          onUpdateTitle={(title) => dispatch(updateWeeklyTitle(title))}
          onResetWeek={(keepGoals) => dispatch(resetWeeklyPlan(keepGoals))}
          onSelectWeek={(weekStart) => dispatch(selectWeeklyWeek(weekStart))}
          onScheduleTask={(task, day) => dispatch(scheduleTaskToDay(task, day))}
          onTimerPreset={(minutes) => dispatch(setFocusPreset(minutes))}
          onTimerToggle={() => dispatch(toggleFocusTimer())}
          onTimerReset={() => dispatch(resetFocusTimer())}
          onTimerAddFive={() => dispatch(extendFocusTimer())}
          onTimerSubtractFive={() => dispatch(shortenFocusTimer())}
          onTimerSelectTask={(taskKey) => dispatch(selectFocusTask(taskKey))}
          onLogElapsed={() => dispatch(logFocusElapsed())}
          onOpenKanban={() => selectView('kanban')}
          onShowToast={showToast}
        />
      )}
      {currentView === 'roadmap' && (
        <RoadmapPage
          title={activeDoc?.title || 'Роадмап'}
          docs={docs.map(doc => ({ id: doc.id, title: doc.title }))}
          activeId={activeDoc?.id || ''}
          steps={steps}
          currentSprintStepId={sprintStepId}
          onSelectRoadmap={(id) => dispatch(roadmapSelected(id))}
          onCreateRoadmap={(title) => dispatch(createRoadmap(title))}
          onRenameRoadmap={(id, title) => dispatch(renameRoadmap(id, title))}
          onDeleteRoadmap={(id) => dispatch(removeRoadmap(id))}
          onAddStep={() => activeDoc && dispatch(addRoadmapStep(activeDoc.id))}
          onSaveStep={(id, patch) => dispatch(saveRoadmapStep(id, patch))}
          onDeleteStep={(id) => dispatch(removeRoadmapStep(id))}
          onSetSprintStep={(stepId) => dispatch(setSprintStep(stepId))}
          onPushSubtasksToKanban={(stepId) => dispatch(pushSubtasksToKanban(stepId))}
          onToggleStepDone={(stepId) => dispatch(toggleStepDone(stepId))}
          onPushSingleTaskToKanban={(title, category, stepId) => dispatch(pushSingleTaskToKanban(title, category, stepId))}
        />
      )}
      {currentView === 'kanban' && (
        <KanbanPage
          tasks={tasks}
          steps={allSteps.map(step => ({ id: step.id, title: step.title }))}
          currentSprintStep={currentSprintStep}
          onOpenWeeklyPlan={() => selectView('weekly-plan')}
          onCreateTask={(draft) => {
            const id = dispatch(createTask(draft.title, draft.category, undefined, {
              description: draft.description,
              status: draft.status
            }));
            if (draft.file && id) void dispatch(attachTaskImage(id, draft.file));
          }}
          onAddComment={(id, text, file) => { void dispatch(addTaskComment(id, text, file)); }}
          onUpdateComment={(id, commentId, text, file) => { void dispatch(updateTaskComment(id, commentId, text, file)); }}
          onRemoveComment={(id, commentId) => dispatch(removeTaskComment(id, commentId))}
          onDeleteTask={(id) => dispatch(removeTask(id))}
          onUpdateTaskStatus={(id, status) => dispatch(updateTaskStatus(id, status))}
          onAttachImage={(id, file) => { void dispatch(attachTaskImage(id, file)); }}
          onOpenLightbox={(url) => dispatch(lightboxSet(url))}
          onShowToast={showToast}
        />
      )}
      {currentView === 'team-chat' && (
        <TeamChatPage
          currentAuthor={currentAuthor}
          messages={messages}
          onSendMessage={(message) => dispatch(sendTeamMessage(message))}
          onDeleteMessage={(id) => dispatch(removeTeamMessage(id))}
          onCreateTask={(title, category) => dispatch(createTask(title, category))}
          onOpenLightbox={(url) => dispatch(lightboxSet(url))}
          onShowToast={showToast}
          onRefreshFromServer={refreshChat}
          serverSynced={chatServerSync}
        />
      )}
      {currentView === 'hero' && (
        <HeroPage
          characters={characters}
          onSaveCharacter={(character) => dispatch(saveCharacter(character))}
          onDeleteCharacter={(id) => dispatch(removeCharacter(id))}
          onOpenLightbox={(url) => dispatch(lightboxSet(url))}
          onShowToast={showToast}
        />
      )}
      {currentView === 'room-matrix' && (
        <RoomMatrixPage
          roomMatrix={roomMatrix}
          enemies={bestiary.items}
          bugs={playtest.items}
          onOpenEnemy={(enemyId) => {
            dispatch(selectedEnemySet(enemyId));
            writeViewHash('bestiary', 'push');
          }}
          onOpenBug={(reportId) => {
            dispatch(selectedReportSet(reportId));
            writeViewHash('playtest', 'push');
          }}
          onSelectRoom={(id) => dispatch(roomSelected(id))}
          onAddRoom={(room) => dispatch(roomAdded(room))}
          onUpdateRoom={(room) => dispatch(roomUpdated(room))}
          onRemoveRoom={(id) => dispatch(roomRemoved(id))}
          onSetRoomPosition={(id, gx, gy) => dispatch(roomPositionChanged({ id, gridX: gx, gridY: gy }))}
          onUpdateRoomImage={(id, url) => dispatch(roomImageUpdated({ roomId: id, imageUrl: url }))}
          onConnectRooms={(fromId, toId, dir, toDir, lock) =>
            dispatch(connectionAdded({ fromRoomId: fromId, toRoomId: toId, direction: dir, toDirection: toDir, lock }))
          }
          onDisconnectRooms={(fromId, toId) =>
            dispatch(connectionRemoved({ fromRoomId: fromId, toRoomId: toId }))
          }
          onUpdateConnectionLock={(fromId: string, toId: string, lock?: RoomLock) =>
            dispatch(connectionLockUpdated({ fromRoomId: fromId, toRoomId: toId, lock }))
          }
          onFilterSector={(sec: string | 'all') => dispatch(sectorFilterChanged(sec))}
          onToggleSimulatedAbility={(ab) => dispatch(simulatedAbilityToggled(ab))}
          onResetSimulatedAbilities={() => dispatch(simulatedAbilitiesReset())}
          onUnlockAllAbilities={() => dispatch(allAbilitiesUnlocked(ABILITY_DEFINITIONS.map(a => a.id)))}
          onResetMatrixToDefault={() => dispatch(matrixResetToDefault())}
          onOpenLightbox={(url) => dispatch(lightboxSet(url))}
          onShowToast={showToast}
        />
      )}
      {currentView === 'bestiary' && (
        <BestiaryPage
          enemies={bestiary.items}
          sectors={roomMatrix.sectors}
          rooms={roomMatrix.rooms}
          filter={bestiary.filter}
          selectedEnemyId={bestiary.selectedEnemyId}
          onFilterChange={(patch) => dispatch(bestiaryFilterChanged(patch))}
          onSelectEnemy={(id) => dispatch(selectedEnemySet(id))}
          onAddEnemy={(enemy) => dispatch(enemyAdded(enemy))}
          onUpdateEnemy={(enemy) => dispatch(enemyUpdated(enemy))}
          onRemoveEnemy={(id) => dispatch(enemyRemoved(id))}
          onToggleChecklist={(enemyId, step: keyof ProductionChecklist) =>
            dispatch(enemyChecklistToggled({ enemyId, step }))
          }
          onImportEnemies={(items) => dispatch(bestiaryImported(items))}
          onResetToDefault={() => dispatch(bestiaryResetToDefault())}
          onOpenRoom={(roomId) => {
            dispatch(roomSelected(roomId));
            writeViewHash('room-matrix', 'push');
          }}
          onShowToast={showToast}
        />
      )}
      {currentView === 'playtest' && (
        <PlaytestPage
          reports={playtest.items}
          rooms={roomMatrix.rooms}
          filter={playtest.filter}
          selectedReportId={playtest.selectedReportId}
          onFilterChange={(patch) => dispatch(playtestFilterChanged(patch))}
          onSelectReport={(id) => dispatch(selectedReportSet(id))}
          onAddReport={(report) => dispatch(reportAdded(report))}
          onUpdateReport={(report) => dispatch(reportUpdated(report))}
          onRemoveReport={(id) => dispatch(reportRemoved(id))}
          onStatusChange={(id, status) => dispatch(reportStatusSet({ id, status }))}
          onImportReports={(imported) => dispatch(reportsImported(imported))}
          onOpenRoom={(roomId) => {
            dispatch(roomSelected(roomId));
            writeViewHash('room-matrix', 'push');
          }}
          onOpenScreenshot={(url) => dispatch(lightboxSet(url))}
          onShowToast={showToast}
        />
      )}
      {currentView === 'asset-pipeline' && (
        <AssetPipelinePage
          assets={assetPipeline.items}
          filter={assetPipeline.filter}
          selectedAssetId={assetPipeline.selectedAssetId}
          authorName={currentAuthor.name}
          serverSync={assetPipeline.serverSync}
          onFilterChange={(patch) => dispatch(assetFilterChanged(patch))}
          onSelectAsset={(id) => dispatch(assetSelected(id))}
          onAddAsset={(asset) => dispatch(assetAdded(asset))}
          onUpdateAsset={(asset) => dispatch(assetUpdated(asset))}
          onRemoveAsset={(id) => dispatch(assetRemoved(id))}
          onAdvanceStage={(id) => dispatch(assetStageAdvanced(id))}
          onRevertStage={(id) => dispatch(assetStageReverted(id))}
          onSetStage={(id, stage) => dispatch(assetStageSet({ id, stage }))}
          onToggleChecklist={(assetId, checkId) =>
            dispatch(assetChecklistToggled({ assetId, checkId }))
          }
          onImportAssets={(items) => dispatch(assetsImported(items))}
          onResetDefault={() => dispatch(assetsResetToDefault())}
          onShowToast={showToast}
          onGalleryItem={(item) => dispatch(galleryUpserted(item))}
        />
      )}
      {currentView === 'gdscript-generator' && (
        <GdscriptGeneratorPage
          physicsParams={gdscriptGenerator.physicsParams}
          selectedPresetId={gdscriptGenerator.selectedPresetId}
          states={gdscriptGenerator.states}
          selectedStateId={gdscriptGenerator.selectedStateId}
          activeTab={gdscriptGenerator.activeTab}
          onTabChange={(tab) => dispatch(activeTabSet(tab))}
          onParamChange={(key, value) => dispatch(physicsParamUpdated({ key, value }))}
          onSelectPreset={(id) => dispatch(presetSelected(id))}
          onSelectState={(id) => dispatch(selectedStateSet(id))}
          onToggleState={(id) => dispatch(stateToggled(id))}
          onUpdateState={(st) => dispatch(stateUpdated(st))}
          onAddState={(st) => dispatch(stateAdded(st))}
          onRemoveState={(id) => dispatch(stateRemoved(id))}
          onToggleTransition={(fromId, toId) => dispatch(transitionToggled({ fromId, toId }))}
          onResetDefaults={() => dispatch(gdscriptResetDefaults())}
          onShowToast={showToast}
        />
      )}
      {currentView === 'engine-bridge' && (
        <EngineBridgePage
          engineBridge={engineBridge}
          roomMatrix={roomMatrix}
          bestiary={bestiary}
          narrative={chapters}
          physicsParams={gdscriptGenerator.physicsParams}
          states={gdscriptGenerator.states}
          assets={assetPipeline.items}
          tasks={tasks.map(t => ({ id: t.id, title: t.title }))}
          bugs={playtest.items.map(b => ({ id: b.id, title: b.title }))}
          onAddBuild={(b) => dispatch(buildAdded(b))}
          onUpdateBuild={(b) => dispatch(buildUpdated(b))}
          onRemoveBuild={(id) => dispatch(buildRemoved(id))}
          onSelectBuild={(id) => dispatch(selectedBuildSet(id))}
          onFilterChange={(p) => dispatch(buildFilterChanged(p))}
          onToggleConfigFile={(id) => dispatch(configFileToggled(id))}
          onToggleAllConfigFiles={(ids) => dispatch(allConfigFilesToggled(ids))}
          onDiscoverConfigFiles={(ids) => dispatch(configFilesDiscovered(ids))}
          onConnectedFolderChange={(name) => dispatch(connectedFolderNameSet(name))}
          onFolderAccess={(access) => dispatch(folderAccessSet(access))}
          onToggleChecklist={(id) => dispatch(checklistItemToggled(id))}
          onSyncComplete={() => dispatch(lastBridgeSyncAtSet(new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })))}
          onShowToast={showToast}
        />
      )}
      {currentView === 'gallery' && (
        <GalleryPage
          items={gallery}
          serverSync={galleryServerSync}
          uploading={galleryUploading}
          onRequestUpload={(file, title) => dispatch(uploadGalleryItem(file, title))}
          onOpenLightbox={(url) => dispatch(lightboxSet(url))}
        />
      )}
      {currentView === 'notes' && (
        <NotesPage
          notes={notes}
          onAddNote={(tag, text) => dispatch(addNote(tag, text))}
          onDeleteNote={(id) => dispatch(removeNote(id))}
          onCreateTask={(title, category) => dispatch(createTask(title, category))}
          chapters={chapters}
          onSaveChapters={(next) => dispatch(saveNarrativeChapters(next))}
          onShowToast={showToast}
        />
      )}
      {currentView === 'ai-chat' && <AiChatPage onShowToast={showToast} />}
      {currentView === 'ai-export' && (
        <AiExportPage tasks={tasks} roadmap={allSteps} currentSprintStepId={sprintStepId} notes={notes} onShowToast={showToast} />
      )}
      {currentView === 'fsd-spec' && <FsdSpecPage />}
    </div>
  );
};
