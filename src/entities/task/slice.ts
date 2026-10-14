import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { normalizeAuthor } from '../author';
import { readJson } from '../../shared/lib/readJson';
import { Task, TaskComment, TaskFile, TaskStatus } from './types';

const DEFAULT_TASKS: Task[] = [
  { id: 't-1', title: 'Настройка таймера Coyote Time (0.12с) в Godot 4', category: 'code', status: 'done', author: 'Юзер 1', stepId: 'step-1' },
  { id: 't-2', title: 'Jump Buffer (0.10с) для отзывчивого прыжка', category: 'code', status: 'in-progress', author: 'Юзер 1', stepId: 'step-1' },
  { id: 't-3', title: 'Нарезка спрайтов утки на части для Skeleton2D', category: 'art', status: 'in-progress', author: 'Юзер 2', stepId: 'step-2' },
  { id: 't-4', title: 'Грейбокс тестовой комнаты с платформами', category: 'design', status: 'backlog', author: 'Юзер 3', stepId: 'step-1' }
];

export interface TasksState {
  items: Task[];
  sprintStepId: string | null;
  ready: boolean;
}

function loadTasks(): Task[] {
  const data = readJson<Task[]>('mv4_tasks', DEFAULT_TASKS);
  if (!Array.isArray(data)) return DEFAULT_TASKS;
  return data.map(task => ({ ...task, author: normalizeAuthor(task.author || '') }));
}

function loadSprint(): string | null {
  const saved = localStorage.getItem('mv4_sprint_step_id');
  return saved && saved !== 'none' ? saved : null;
}

const initialState: TasksState = {
  items: loadTasks(),
  sprintStepId: loadSprint(),
  ready: false
};

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    tasksReplaced(state, action: PayloadAction<Task[]>) {
      state.items = action.payload;
    },
    sprintSet(state, action: PayloadAction<string | null>) {
      state.sprintStepId = action.payload;
    },
    boardReadySet(state, action: PayloadAction<boolean>) {
      state.ready = action.payload;
    },
    taskAdded(state, action: PayloadAction<Task>) {
      state.items.unshift(action.payload);
    },
    tasksPrepended(state, action: PayloadAction<Task[]>) {
      state.items.unshift(...action.payload);
    },
    taskRemoved(state, action: PayloadAction<string>) {
      state.items = state.items.filter(task => task.id !== action.payload);
    },
    taskStatusSet(state, action: PayloadAction<{ id: string; status: TaskStatus }>) {
      const task = state.items.find(item => item.id === action.payload.id);
      if (task) task.status = action.payload.status;
    },
    taskUpdated(state, action: PayloadAction<{ id: string; patch: Partial<Pick<Task, 'title' | 'description' | 'category' | 'status' | 'stepId'>> }>) {
      const task = state.items.find(item => item.id === action.payload.id);
      if (!task) return;
      const patch = action.payload.patch;
      if (patch.title !== undefined) task.title = patch.title;
      if (patch.description !== undefined) task.description = patch.description;
      if (patch.category) task.category = patch.category;
      if (patch.status) task.status = patch.status;
      if ('stepId' in patch) {
        if (patch.stepId) task.stepId = patch.stepId;
        else delete task.stepId;
      }
    },
    taskImageSet(state, action: PayloadAction<{ id: string; image: string }>) {
      const task = state.items.find(item => item.id === action.payload.id);
      if (!task) return;
      if (action.payload.image) {
        task.image = action.payload.image;
        delete task.file;
      } else delete task.image;
    },
    taskFileSet(state, action: PayloadAction<{ id: string; file: TaskFile }>) {
      const task = state.items.find(item => item.id === action.payload.id);
      if (!task) return;
      task.file = action.payload.file;
      delete task.image;
    },
    commentAdded(state, action: PayloadAction<{ taskId: string; comment: TaskComment }>) {
      const task = state.items.find(item => item.id === action.payload.taskId);
      if (!task) return;
      task.comments = [...(task.comments || []), action.payload.comment];
    },
    commentUpdated(state, action: PayloadAction<{ taskId: string; commentId: string; text: string; image?: string; file?: TaskFile }>) {
      const task = state.items.find(item => item.id === action.payload.taskId);
      const comment = task?.comments?.find(item => item.id === action.payload.commentId);
      if (!comment) return;
      comment.text = action.payload.text;
      if (action.payload.image) {
        comment.image = action.payload.image;
        delete comment.file;
      } else if (action.payload.file) {
        comment.file = action.payload.file;
        delete comment.image;
      }
    },
    commentRemoved(state, action: PayloadAction<{ taskId: string; commentId: string }>) {
      const task = state.items.find(item => item.id === action.payload.taskId);
      if (!task?.comments) return;
      task.comments = task.comments.filter(comment => comment.id !== action.payload.commentId);
    }
  }
});

export const {
  tasksReplaced,
  sprintSet,
  boardReadySet,
  taskAdded,
  tasksPrepended,
  taskRemoved,
  taskStatusSet,
  taskUpdated,
  taskImageSet,
  taskFileSet,
  commentAdded,
  commentUpdated,
  commentRemoved
} = tasksSlice.actions;

export const tasksReducer = tasksSlice.reducer;
