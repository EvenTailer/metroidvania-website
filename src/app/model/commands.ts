import { ThunkAction, UnknownAction } from '@reduxjs/toolkit';
import { AUTHORS } from '../../entities/author';
import { TeamMessage, chatSyncSet, deleteChatMessageFromServer, messageAdded, messageRemoved, sendChatMessageToServer } from '../../entities/chat';
import { CharacterItem, characterRemoved, characterSaved } from '../../entities/character';
import { uploadImageToServer, gallerySyncSet, galleryUploadingSet, galleryUpserted } from '../../entities/gallery';
import { NoteItem, noteAdded, noteRemoved } from '../../entities/note';
import { NarrativeChapter, chaptersReplaced, saveNarrativeToServer } from '../../entities/narrative';
import { roadmapAdded, roadmapRemoved, roadmapRenamed, stepAdded, stepDoneToggled, stepRemoved, stepUpdated } from '../../entities/roadmap';
import type { RoadmapStep } from '../../entities/roadmap';
import { categoryForSubtask, stepCloseBlockReason, taskCoversSubtask } from '../../entities/task';
import { Task, TaskCategory, TaskComment, TaskFile, TaskStatus, sprintSet, taskAdded, taskFileSet, taskImageSet, taskRemoved, taskStatusSet, taskUpdated, commentAdded, commentUpdated, commentRemoved, tasksPrepended } from '../../entities/task';
import { writeViewHash } from '../../shared/config/views';
import type { RootState } from '../store';
import { sidebarSet, toastShown } from './uiSlice';

type HubThunk<R = void> = ThunkAction<R, RootState, undefined, UnknownAction>;

function authorName(state: RootState): string {
  return AUTHORS[state.session.authorIndex]?.name || AUTHORS[0].name;
}

function findRoadmapStep(state: RootState, stepId: string): RoadmapStep | undefined {
  for (const doc of state.roadmap.docs) {
    const step = doc.steps.find(item => item.id === stepId);
    if (step) return step;
  }
  return undefined;
}

export const createTask = (
  title: string,
  category: TaskCategory,
  stepId?: string,
  details?: { description?: string; status?: TaskStatus }
): HubThunk<string | undefined> => (dispatch, getState) => {
  const clean = title.trim();
  if (!clean) return;
  const state = getState();
  const bound = stepId !== undefined ? stepId : state.tasks.sprintStepId || undefined;
  const id = 't-' + Date.now();
  const description = details?.description?.trim() || '';
  dispatch(taskAdded({
    id,
    title: clean,
    description,
    category,
    status: details?.status || 'backlog',
    author: authorName(state),
    stepId: bound || undefined
  }));
  dispatch(toastShown('Задача добавлена'));
  return id;
};

export const pushSingleTaskToKanban = (title: string, category: TaskCategory, stepId: string): HubThunk => (dispatch, getState) => {
  const clean = title.trim();
  if (taskCoversSubtask(getState().tasks.items, stepId, clean)) {
    dispatch(toastShown('Такая задача уже есть в канбане'));
    return;
  }
  dispatch(createTask(clean, category, stepId));
};

export const pushSubtasksToKanban = (stepId: string, stay = false): HubThunk => (dispatch, getState) => {
  const state = getState();
  const step = findRoadmapStep(state, stepId);
  if (!step) return;
  const fresh = step.subtasks.filter(sub => !taskCoversSubtask(state.tasks.items, step.id, sub));
  dispatch(sprintSet(stepId));
  if (fresh.length === 0) {
    dispatch(toastShown(`Подзадачи ${step.id.toUpperCase()} уже в канбане`));
    return;
  }
  const newTasks: Task[] = fresh.map((sub, index) => ({
    id: 't-' + Date.now() + '-' + index,
    title: sub,
    category: categoryForSubtask(step, sub),
    status: 'backlog' as TaskStatus,
    author: authorName(state),
    stepId: step.id
  }));
  dispatch(tasksPrepended(newTasks));
  if (!stay) {
    dispatch(sidebarSet(false));
    writeViewHash('kanban', 'push');
  }
  dispatch(toastShown(`В канбан добавлено ${fresh.length} из шага ${step.id.toUpperCase()}`));
};

export const removeTask = (id: string): HubThunk => (dispatch) => {
  dispatch(taskRemoved(id));
  dispatch(toastShown('Задача удалена'));
};

export const updateTaskStatus = (id: string, status: TaskStatus): HubThunk => (dispatch) => {
  dispatch(taskStatusSet({ id, status }));
};

export const saveTask = (
  id: string,
  patch: { title: string; description: string; category: TaskCategory; status: TaskStatus; stepId?: string }
): HubThunk => (dispatch) => {
  const title = patch.title.trim();
  if (!title) {
    dispatch(toastShown('Введите название задачи'));
    return;
  }
  dispatch(taskUpdated({
    id,
    patch: {
      title,
      description: patch.description.trim(),
      category: patch.category,
      status: patch.status,
      stepId: patch.stepId || ''
    }
  }));
  dispatch(toastShown('Задача сохранена'));
};

export const clearTaskImage = (id: string): HubThunk => (dispatch) => {
  dispatch(taskImageSet({ id, image: '' }));
  dispatch(toastShown('Фото убрано'));
};

async function uploadedAttachment(file: File): Promise<{ image?: string; file?: TaskFile }> {
  const item = await uploadImageToServer(file, file.name);
  if (file.type.startsWith('image/')) return { image: item.url };
  return { file: { url: item.url, name: file.name } };
}

export const addTaskComment = (taskId: string, text: string, file?: File): HubThunk => async (dispatch, getState) => {
  const clean = text.trim();
  if (!clean && !file) return;
  let image = '';
  let attached: TaskFile | undefined;
  if (file) {
    try {
      const uploaded = await uploadedAttachment(file);
      image = uploaded.image || '';
      attached = uploaded.file;
    } catch {
      dispatch(toastShown('Не удалось загрузить файл'));
      return;
    }
  }
  const comment: TaskComment = {
    id: 'c-' + Date.now(),
    author: authorName(getState()),
    text: clean,
    createdAt: new Date().toISOString(),
    ...(image ? { image } : {}),
    ...(attached ? { file: attached } : {})
  };
  dispatch(commentAdded({ taskId, comment }));
};

export const updateTaskComment = (taskId: string, commentId: string, text: string, file?: File): HubThunk => async (dispatch, getState) => {
  const current = getState().tasks.items.find(item => item.id === taskId)?.comments?.find(item => item.id === commentId);
  if (!current) return;
  const clean = text.trim();
  let image = '';
  let attached: TaskFile | undefined;
  if (file) {
    try {
      const uploaded = await uploadedAttachment(file);
      image = uploaded.image || '';
      attached = uploaded.file;
    } catch {
      dispatch(toastShown('Не удалось загрузить файл'));
      return;
    }
  }
  if (!clean && !image && !attached && !current.image && !current.file) return;
  dispatch(commentUpdated({
    taskId,
    commentId,
    text: clean,
    ...(image ? { image } : {}),
    ...(attached ? { file: attached } : {})
  }));
};

export const removeTaskComment = (taskId: string, commentId: string): HubThunk => (dispatch) => {
  dispatch(commentRemoved({ taskId, commentId }));
};

export const attachTaskImage = (id: string, file: File): HubThunk => async (dispatch) => {
  try {
    const uploaded = await uploadedAttachment(file);
    if (uploaded.image) {
      dispatch(taskImageSet({ id, image: uploaded.image }));
      dispatch(toastShown('Картинка на сервере и прикреплена к задаче'));
    } else if (uploaded.file) {
      dispatch(taskFileSet({ id, file: uploaded.file }));
      dispatch(toastShown('Файл прикреплён к задаче'));
    }
  } catch {
    dispatch(toastShown('Не удалось загрузить файл на сервер'));
  }
};

export const setSprintStep = (stepId: string | null): HubThunk => (dispatch) => {
  dispatch(sprintSet(stepId));
  dispatch(toastShown(stepId ? `Шаг ${stepId.toUpperCase()} взят в фокус спринта!` : 'Спринт сброшен. Фокус не выбран.'));
};

export const toggleStepDone = (stepId: string): HubThunk => (dispatch, getState) => {
  const state = getState();
  const step = findRoadmapStep(state, stepId);
  if (!step) return;
  if (!step.done) {
    const reason = stepCloseBlockReason(step, state.tasks.items);
    if (reason) {
      dispatch(toastShown(reason));
      return;
    }
  }
  dispatch(stepDoneToggled(stepId));
  dispatch(toastShown(step.done ? `Шаг ${step.id.toUpperCase()} возвращен в работу` : `Шаг ${step.id.toUpperCase()} отмечен выполненным`));
};

export const createRoadmap = (title: string): HubThunk => (dispatch) => {
  const clean = title.trim();
  if (!clean) return;
  dispatch(roadmapAdded({ id: 'rm-' + Date.now(), title: clean }));
  dispatch(toastShown(`Роадмап «${clean}» создан`));
};

export const renameRoadmap = (id: string, title: string): HubThunk => (dispatch) => {
  dispatch(roadmapRenamed({ id, title }));
};

export const removeRoadmap = (id: string): HubThunk => (dispatch, getState) => {
  const state = getState();
  const doc = state.roadmap.docs.find(item => item.id === id);
  if (!doc || state.roadmap.docs.length < 2) return;
  if (state.tasks.sprintStepId && doc.steps.some(step => step.id === state.tasks.sprintStepId)) {
    dispatch(sprintSet(null));
  }
  dispatch(roadmapRemoved(id));
  dispatch(toastShown(`Роадмап «${doc.title}» удалён`));
};

export const addRoadmapStep = (roadmapId: string): HubThunk => (dispatch) => {
  const step: RoadmapStep = {
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
  dispatch(stepAdded({ roadmapId, step }));
};

export const saveRoadmapStep = (id: string, patch: Partial<RoadmapStep>): HubThunk => (dispatch) => {
  dispatch(stepUpdated({ id, patch }));
  dispatch(toastShown('Шаг сохранён'));
};

export const removeRoadmapStep = (id: string): HubThunk => (dispatch, getState) => {
  if (getState().tasks.sprintStepId === id) dispatch(sprintSet(null));
  dispatch(stepRemoved(id));
  dispatch(toastShown('Шаг удалён'));
};

export const addNote = (tag: string, text: string): HubThunk => (dispatch, getState) => {
  const note: NoteItem = {
    id: 'n-' + Date.now(),
    tag,
    text,
    author: authorName(getState()),
    date: 'Сегодня, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };
  dispatch(noteAdded(note));
};

export const removeNote = (id: string): HubThunk => (dispatch) => {
  dispatch(noteRemoved(id));
  dispatch(toastShown('Мысль удалена'));
};

export const saveCharacter = (character: CharacterItem): HubThunk => (dispatch) => {
  dispatch(characterSaved(character));
};

export const removeCharacter = (id: string): HubThunk => (dispatch) => {
  dispatch(characterRemoved(id));
  dispatch(toastShown('Персонаж удален'));
};

export const uploadGalleryItem = (file: File, uploadTitle: string): HubThunk<Promise<void>> => async (dispatch) => {
  dispatch(galleryUploadingSet(true));
  try {
    const item = await uploadImageToServer(file, uploadTitle);
    dispatch(galleryUpserted(item));
    dispatch(gallerySyncSet(true));
    dispatch(toastShown('Картинка загружена на сервер'));
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Ошибка загрузки';
    dispatch(toastShown(message));
    throw err;
  } finally {
    dispatch(galleryUploadingSet(false));
  }
};

export const sendTeamMessage = (message: TeamMessage): HubThunk => (dispatch) => {
  dispatch(messageAdded(message));
  sendChatMessageToServer(message)
    .then(() => dispatch(chatSyncSet(true)))
    .catch(() => dispatch(chatSyncSet(false)));
  dispatch(toastShown('Сообщение отправлено!'));
};

export const removeTeamMessage = (id: string): HubThunk => (dispatch) => {
  dispatch(messageRemoved(id));
  deleteChatMessageFromServer(id)
    .then(() => dispatch(chatSyncSet(true)))
    .catch(() => dispatch(chatSyncSet(false)));
  dispatch(toastShown('Сообщение удалено'));
};

export const saveNarrativeChapters = (chapters: NarrativeChapter[]): HubThunk => (dispatch) => {
  dispatch(chaptersReplaced(chapters));
  saveNarrativeToServer(chapters).catch(() => {});
};

export {
  addWeeklyPlanItem,
  scheduleTaskToDay,
  toggleWeeklyPlanItem,
  removeWeeklyPlanItem,
  moveWeeklyPlanItem,
  logWeeklyPlanItemTime,
  updateWeeklyPlanItem,
  updateWeeklyBigGoal,
  toggleWeeklyBigGoal,
  updateWeeklyRetro,
  updateWeeklyTitle,
  resetWeeklyPlan,
  selectWeeklyWeek,
  logFocusElapsed,
  completeFocusSession,
  setFocusPreset,
  toggleFocusTimer,
  resetFocusTimer,
  extendFocusTimer,
  shortenFocusTimer,
  selectFocusTask
} from './weeklyCommands';
