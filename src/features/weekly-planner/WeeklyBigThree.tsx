import React, { useState } from 'react';
import type { WeeklyBigGoal } from '../../entities/weekly-plan';

interface WeeklyBigThreeProps {
  goals: [WeeklyBigGoal, WeeklyBigGoal, WeeklyBigGoal];
  linkedCounts?: { total: number; done: number }[];
  onToggleGoal: (index: number) => void;
  onUpdateGoal: (index: number, text: string) => void;
}

export const WeeklyBigThree: React.FC<WeeklyBigThreeProps> = ({
  goals,
  linkedCounts,
  onToggleGoal,
  onUpdateGoal
}) => {
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [draftText, setDraftText] = useState('');

  const completedCount = goals.filter(g => g.done).length;
  const progressPercent = Math.round((completedCount / goals.length) * 100);

  const startEdit = (idx: number, currentText: string) => {
    setEditingIdx(idx);
    setDraftText(currentText);
  };

  const saveEdit = (idx: number) => {
    const clean = draftText.trim();
    if (clean) {
      onUpdateGoal(idx, clean);
    }
    setEditingIdx(null);
  };

  return (
    <section className="panel weekly-big-three-card" aria-label="Главные 3 цели недели">
      <div className="weekly-card-header">
        <div className="weekly-card-header-left">
          <div className="weekly-crown-icon" aria-hidden="true">👑</div>
          <div>
            <div className="weekly-badge-tag">Фокус недели</div>
            <h3 className="weekly-planner-card-title">Три главные цели</h3>
            <p className="weekly-card-subtitle">
              Закройте эти 3 результата, чтобы считать спринт успешным
            </p>
          </div>
        </div>

        <div className="weekly-card-header-right">
          <div className="weekly-status-pill">
            <span className="weekly-status-val">{completedCount}/3</span>
            <span className="weekly-status-label">готово</span>
          </div>
          <div className="weekly-mini-progress" role="progressbar" aria-valuenow={progressPercent} aria-valuemin={0} aria-valuemax={100}>
            <div className="weekly-mini-progress-fill" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>
      </div>

      <div className="weekly-big-three-grid">
        {goals.map((goal, idx) => (
          <div
            key={goal.id}
            className={`weekly-goal-box ${goal.done ? 'is-done' : ''}`}
          >
            <div className="weekly-goal-prefix">
              <span className="weekly-goal-num">0{idx + 1}</span>
            </div>

            <button
              type="button"
              className={`weekly-goal-check ${goal.done ? 'checked' : ''}`}
              aria-label={goal.done ? `Цель #${idx + 1} выполнена. Нажмите для отмены` : `Отметить цель #${idx + 1} выполненной`}
              onClick={() => onToggleGoal(idx)}
            >
              {goal.done ? '✓' : ''}
            </button>

            <div className="weekly-goal-content">
              {editingIdx === idx ? (
                <div className="weekly-goal-edit-row">
                  <input
                    type="text"
                    className="modal-input weekly-goal-input"
                    value={draftText}
                    autoFocus
                    placeholder="Сформулируйте ключевую цель недели..."
                    onChange={(e) => setDraftText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') saveEdit(idx);
                      if (e.key === 'Escape') setEditingIdx(null);
                    }}
                  />
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => saveEdit(idx)}
                  >
                    Сохранить
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => setEditingIdx(null)}
                  >
                    Отмена
                  </button>
                </div>
              ) : (
                <div
                  className="weekly-goal-text-wrap"
                  onClick={() => startEdit(idx, goal.text)}
                  title="Нажмите для редактирования цели"
                >
                  <span className={`weekly-goal-text ${goal.text ? '' : 'is-empty'}`}>{goal.text || 'Сформулируйте цель'}</span>
                  {linkedCounts?.[idx]?.total ? (
                    <span className="weekly-goal-linked">{linkedCounts[idx].done}/{linkedCounts[idx].total} задач</span>
                  ) : null}
                  <button
                    type="button"
                    className="weekly-goal-edit-icon"
                    aria-label="Редактировать цель"
                    onClick={(e) => {
                      e.stopPropagation();
                      startEdit(idx, goal.text);
                    }}
                  >
                    ✎
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
