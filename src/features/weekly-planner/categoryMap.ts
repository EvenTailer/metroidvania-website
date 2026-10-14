import type { TaskCategory } from '../../entities/task';

export const PLAN_CATEGORIES: TaskCategory[] = ['code', 'art', 'design', 'audio'];

export const CATEGORY_MAP: Record<TaskCategory, { label: string; icon: string; color: string; bg: string }> = {
  code: { label: 'Код', icon: '⚡', color: 'var(--accent-cyan)', bg: 'rgba(0, 242, 254, 0.12)' },
  art: { label: 'Арт', icon: '🎨', color: 'var(--accent-purple)', bg: 'rgba(168, 85, 247, 0.12)' },
  design: { label: 'Дизайн', icon: '🗺', color: 'var(--accent-emerald)', bg: 'rgba(16, 185, 129, 0.12)' },
  audio: { label: 'Звук', icon: '🎵', color: 'var(--accent-amber)', bg: 'rgba(245, 158, 11, 0.12)' }
};
