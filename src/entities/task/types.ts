export type TaskCategory = 'code' | 'art' | 'design' | 'audio';
export type TaskStatus = 'backlog' | 'in-progress' | 'test' | 'done';

export interface TaskFile {
  url: string;
  name: string;
}

export interface TaskComment {
  id: string;
  author: string;
  text: string;
  createdAt: string;
  image?: string;
  file?: TaskFile;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  category: TaskCategory;
  status: TaskStatus;
  author: string;
  stepId?: string;
  image?: string;
  file?: TaskFile;
  comments?: TaskComment[];
}
