import React, { useState } from 'react';
import type { GoalIndex, PlanItemPatch, PlannedItem, WeeklyBigGoal, WeekdayKey, WeekdayMeta } from '../../entities/weekly-plan';
import { DAY_ORDER, dateForWeekday, parseIsoDate } from '../../entities/weekly-plan';
import type { Task, TaskCategory } from '../../entities/task';
import { CATEGORY_MAP, PLAN_CATEGORIES } from './categoryMap';
import { WeeklyTaskCard } from './WeeklyTaskCard';

interface WeeklyDayColumnProps {
  meta: WeekdayMeta;
  weekStart: string;
  items: PlannedItem[];
  isToday: boolean;
  goals: WeeklyBigGoal[];
  tasks: Task[];
  onAdd: (title: string, category: TaskCategory, estimatedMinutes?: number, goalIndex?: GoalIndex) => void;
  onToggle: (itemId: string) => void;
  onRemove: (itemId: string) => void;
  onUpdate: (itemId: string, patch: PlanItemPatch) => void;
  onMove: (fromDay: WeekdayKey, toDay: WeekdayKey, itemId: string) => void;
  onScheduleTask: (task: Task) => void;
  onShowToast: (message: string) => void;
}

function adjacent(current: WeekdayKey, dir: 'prev' | 'next'): WeekdayKey | null {
  const idx = DAY_ORDER.indexOf(current);
  if (dir === 'prev' && idx > 0) return DAY_ORDER[idx - 1];
  if (dir === 'next' && idx < DAY_ORDER.length - 1) return DAY_ORDER[idx + 1];
  return null;
}

export const WeeklyDayColumn: React.FC<WeeklyDayColumnProps> = ({
  meta,
  weekStart,
  items,
  isToday,
  goals,
  tasks,
  onAdd,
  onToggle,
  onRemove,
  onUpdate,
  onMove,
  onScheduleTask,
  onShowToast
}) => {
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<TaskCategory>('code');
  const [estimate, setEstimate] = useState('');
  const [goalIndex, setGoalIndex] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const dayNumber = parseIsoDate(dateForWeekday(weekStart, meta.key)).getDate();
  const doneCount = items.filter(item => item.done).length;
  const overloaded = items.length > 4;

  const submit = () => {
    const clean = title.trim();
    if (!clean) {
      onShowToast('Введите название задачи');
      return;
    }
    const minutes = Number(estimate);
    onAdd(
      clean,
      category,
      Number.isFinite(minutes) && minutes > 0 ? minutes : undefined,
      goalIndex === '' ? undefined : Number(goalIndex) as GoalIndex
    );
    setTitle('');
    setEstimate('');
    setGoalIndex('');
    setAdding(false);
  };

  return (
    <section
      className={`weekly-day-col ${meta.isWeekend ? 'is-weekend' : ''} ${isToday ? 'is-current-today' : ''} ${dragOver ? 'is-drag-over' : ''}`}
      aria-label={`Задачи на ${meta.accusative}`}
      onDragOver={event => { event.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={event => {
        event.preventDefault();
        setDragOver(false);
        const raw = event.dataTransfer.getData('text/plain');
        if (!raw) return;
        try {
          const parsed = JSON.parse(raw) as { type?: string; id?: string; fromDay?: WeekdayKey };
          if (parsed.type === 'kanban-task' && parsed.id) {
            const task = tasks.find(item => item.id === parsed.id);
            if (task) onScheduleTask(task);
          } else if (parsed.type === 'day-item' && parsed.fromDay && parsed.fromDay !== meta.key && parsed.id) {
            onMove(parsed.fromDay, meta.key, parsed.id);
          }
        } catch {
          /* ignore malformed drag payload */
        }
      }}
    >
      <div className="weekly-day-header">
        <div className="weekly-day-title-box">
          <span className={`weekly-day-badge ${isToday ? 'is-today' : ''}`}>{meta.shortLabel} {dayNumber}</span>
          <span className="weekly-day-title">{meta.fullLabel}</span>
        </div>
        <div className="weekly-day-stats">
          {isToday && <span className="weekly-today-badge">Сегодня</span>}
          <span className="weekly-day-count-badge">{doneCount} / {items.length}</span>
          <button type="button" className="weekly-day-add-icon-btn" aria-label={adding ? `Закрыть форму на ${meta.accusative}` : `Добавить задачу на ${meta.accusative}`} onClick={() => setAdding(value => !value)}>
            {adding ? '×' : '+'}
          </button>
        </div>
      </div>

      {overloaded && <div className="weekly-wip-warning">Много задач: {items.length}. Легко распылиться.</div>}

      {adding && (
        <div className="weekly-add-form-card">
          <input type="text" className="field weekly-task-input" placeholder="Что нужно сделать?" value={title} autoFocus onChange={event => setTitle(event.target.value)} onKeyDown={event => { if (event.key === 'Enter') submit(); if (event.key === 'Escape') setAdding(false); }} />
          <div className="weekly-add-cat-row" role="group" aria-label="Категория задачи">
            {PLAN_CATEGORIES.map(cat => {
              const info = CATEGORY_MAP[cat];
              const active = category === cat;
              return (
                <button key={cat} type="button" className={`weekly-cat-btn ${active ? 'active' : ''}`} style={{ borderColor: active ? info.color : 'transparent', backgroundColor: active ? info.bg : 'rgba(255, 255, 255, 0.04)', color: active ? info.color : 'var(--text-muted)' }} onClick={() => setCategory(cat)}>
                  <span>{info.icon}</span><span>{info.label}</span>
                </button>
              );
            })}
          </div>
          <div className="weekly-edit-extra">
            <label className="weekly-mini-field">
              <span>План, мин</span>
              <input type="number" min={5} max={480} step={5} className="field" value={estimate} placeholder="—" onChange={event => setEstimate(event.target.value)} />
            </label>
            <label className="weekly-mini-field">
              <span>Цель недели</span>
              <select className="modal-select" value={goalIndex} onChange={event => setGoalIndex(event.target.value)}>
                <option value="">Без цели</option>
                {goals.map((goal, index) => (
                  <option key={goal.id} value={index}>Цель {index + 1}{goal.text ? `: ${goal.text.slice(0, 28)}` : ''}</option>
                ))}
              </select>
            </label>
          </div>
          <div className="weekly-add-actions">
            <button type="button" className="btn btn-primary btn-sm" onClick={submit}>Добавить</button>
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => setAdding(false)}>Отмена</button>
          </div>
        </div>
      )}

      <div className="weekly-day-items">
        {items.length === 0 && !adding ? (
          <button type="button" className="weekly-day-empty-btn" onClick={() => setAdding(true)}>
            <span className="empty-icon">☕</span>
            <span className="empty-text">День свободен</span>
            <span className="empty-action">Добавить задачу</span>
          </button>
        ) : items.map(item => (
          <WeeklyTaskCard
            key={item.id}
            item={item}
            dayKey={meta.key}
            goals={goals}
            prevDay={adjacent(meta.key, 'prev')}
            nextDay={adjacent(meta.key, 'next')}
            onToggle={() => onToggle(item.id)}
            onRemove={() => onRemove(item.id)}
            onUpdate={patch => onUpdate(item.id, patch)}
            onMove={toDay => onMove(meta.key, toDay, item.id)}
          />
        ))}
      </div>

      {!adding && items.length > 0 && (
        <button type="button" className="weekly-add-trigger-btn" onClick={() => setAdding(true)}>Добавить задачу</button>
      )}
    </section>
  );
};
