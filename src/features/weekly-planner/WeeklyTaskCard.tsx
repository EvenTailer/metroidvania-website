import React, { useState } from 'react';
import type { GoalIndex, PlanItemPatch, PlannedItem, WeeklyBigGoal, WeekdayKey } from '../../entities/weekly-plan';
import { WEEKDAYS_META } from '../../entities/weekly-plan';
import type { TaskCategory } from '../../entities/task';
import { CATEGORY_MAP, PLAN_CATEGORIES } from './categoryMap';

interface WeeklyTaskCardProps {
  item: PlannedItem;
  dayKey: WeekdayKey;
  goals: WeeklyBigGoal[];
  onToggle: () => void;
  onRemove: () => void;
  onUpdate: (patch: PlanItemPatch) => void;
  onMove: (toDay: WeekdayKey) => void;
  prevDay: WeekdayKey | null;
  nextDay: WeekdayKey | null;
}

export const WeeklyTaskCard: React.FC<WeeklyTaskCardProps> = ({
  item,
  dayKey,
  goals,
  onToggle,
  onRemove,
  onUpdate,
  onMove,
  prevDay,
  nextDay
}) => {
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [title, setTitle] = useState(item.title);
  const [category, setCategory] = useState<TaskCategory>(item.category);
  const [estimate, setEstimate] = useState(item.estimatedMinutes ? String(item.estimatedMinutes) : '');
  const [goalIndex, setGoalIndex] = useState<string>(item.goalIndex === undefined ? '' : String(item.goalIndex));
  const catStyle = CATEGORY_MAP[item.category] || CATEGORY_MAP.code;
  const over = Boolean(item.estimatedMinutes && (item.spentMinutes || 0) > item.estimatedMinutes);

  const startEdit = () => {
    setTitle(item.title);
    setCategory(item.category);
    setEstimate(item.estimatedMinutes ? String(item.estimatedMinutes) : '');
    setGoalIndex(item.goalIndex === undefined ? '' : String(item.goalIndex));
    setEditing(true);
    setConfirmDelete(false);
  };

  const save = () => {
    const minutes = Number(estimate);
    onUpdate({
      title,
      category,
      estimatedMinutes: Number.isFinite(minutes) && minutes > 0 ? minutes : null,
      goalIndex: goalIndex === '' ? null : Number(goalIndex) as GoalIndex
    });
    setEditing(false);
  };

  return (
    <div
      className={`weekly-task-card ${item.done ? 'is-done' : ''}`}
      draggable={!editing}
      onDragStart={event => {
        event.dataTransfer.setData('text/plain', JSON.stringify({ type: 'day-item', id: item.id, fromDay: dayKey }));
      }}
    >
      {editing ? (
        <div className="weekly-add-form-card">
          <input className="field weekly-task-input" value={title} autoFocus onChange={event => setTitle(event.target.value)} onKeyDown={event => { if (event.key === 'Enter') save(); if (event.key === 'Escape') setEditing(false); }} />
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
                  <option key={goal.id} value={index}>Цель {index + 1}{goal.text ? `: ${goal.text.slice(0, 32)}` : ''}</option>
                ))}
              </select>
            </label>
          </div>
          <div className="weekly-add-actions">
            <button type="button" className="btn btn-primary btn-sm" onClick={save}>Сохранить</button>
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => setEditing(false)}>Отмена</button>
          </div>
        </div>
      ) : (
        <>
          <div className="weekly-task-card-main">
            <button type="button" className={`weekly-item-check ${item.done ? 'checked' : ''}`} aria-label={item.done ? 'Снять отметку выполнения' : 'Отметить задачу выполненной'} onClick={onToggle}>
              {item.done ? '✓' : ''}
            </button>
            <div className="weekly-task-info">
              <div className="weekly-task-meta-row">
                <span className="weekly-card-tag" style={{ color: catStyle.color, backgroundColor: catStyle.bg }}>{catStyle.icon} {catStyle.label}</span>
                {item.goalIndex !== undefined && <span className="weekly-goal-chip">Цель {item.goalIndex + 1}</span>}
                {(item.spentMinutes || item.estimatedMinutes) && (
                  <span className={`weekly-card-time ${over ? 'is-over' : ''}`} title="Факт / план">
                    {item.spentMinutes || 0}м{item.estimatedMinutes ? ` / ${item.estimatedMinutes}м` : ''}
                  </span>
                )}
              </div>
              <button type="button" className="weekly-card-title weekly-card-title-btn" onClick={startEdit}>{item.title}</button>
            </div>
            {confirmDelete ? (
              <button type="button" className="weekly-item-delete is-confirm" aria-label="Подтвердить удаление" onClick={onRemove}>Удалить</button>
            ) : (
              <button type="button" className="weekly-item-delete" aria-label="Удалить из плана" title="Удалить задачу из плана" onClick={() => setConfirmDelete(true)}>×</button>
            )}
          </div>
          <div className="weekly-card-footer-controls">
            {prevDay && (
              <button type="button" className="weekly-nav-arrow" title={`Перенести на ${WEEKDAYS_META.find(meta => meta.key === prevDay)?.accusative}`} onClick={() => onMove(prevDay)}>
                ← {WEEKDAYS_META.find(meta => meta.key === prevDay)?.shortLabel}
              </button>
            )}
            <div className="weekly-footer-spacer" />
            <button type="button" className="weekly-nav-arrow" onClick={startEdit}>Править</button>
            {nextDay && (
              <button type="button" className="weekly-nav-arrow" title={`Перенести на ${WEEKDAYS_META.find(meta => meta.key === nextDay)?.accusative}`} onClick={() => onMove(nextDay)}>
                {WEEKDAYS_META.find(meta => meta.key === nextDay)?.shortLabel} →
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
};
