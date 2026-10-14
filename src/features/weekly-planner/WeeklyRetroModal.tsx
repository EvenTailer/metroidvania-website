import React, { useState } from 'react';
import type { WeeklyRetro } from '../../entities/weekly-plan';

interface WeeklyRetroModalProps {
  isOpen: boolean;
  retro: WeeklyRetro;
  totalPlanned: number;
  totalDone: number;
  totalMinutesSpent: number;
  onClose: () => void;
  onSaveRetro: (patch: Partial<WeeklyRetro>) => void;
  onResetWeek: (keepGoals: boolean) => void;
}

export const WeeklyRetroModal: React.FC<WeeklyRetroModalProps> = ({
  isOpen,
  retro,
  totalPlanned,
  totalDone,
  totalMinutesSpent,
  onClose,
  onSaveRetro,
  onResetWeek
}) => {
  const [wentWell, setWentWell] = useState(retro.wentWell);
  const [blockers, setBlockers] = useState(retro.blockers);
  const [learnings, setLearnings] = useState(retro.learnings);
  const [rating, setRating] = useState(retro.rating);
  const [confirmReset, setConfirmReset] = useState(false);
  const [keepGoals, setKeepGoals] = useState(false);

  if (!isOpen) return null;

  const pct = totalPlanned > 0 ? Math.round((totalDone / totalPlanned) * 100) : 0;
  const hours = (totalMinutesSpent / 60).toFixed(1);

  const handleSave = () => {
    onSaveRetro({
      wentWell,
      blockers,
      learnings,
      rating,
      submittedAt: new Date().toISOString()
    });
    onClose();
  };

  const handleExecuteReset = () => {
    onResetWeek(keepGoals);
    setConfirmReset(false);
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box" style={{ maxWidth: '640px' }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3 style={{ margin: 0, fontSize: '18px', color: '#fff' }}>🎯 Еженедельная ретроспектива</h3>
            <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>
              Подведение итогов недели разработки и подготовка к следующему спринту
            </p>
          </div>
          <button type="button" className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Stats Summary */}
          <div className="weekly-retro-stats-grid">
            <div className="weekly-retro-stat-box">
              <span className="stat-label">Запланировано</span>
              <span className="stat-num">{totalPlanned}</span>
            </div>
            <div className="weekly-retro-stat-box">
              <span className="stat-label">Выполнено</span>
              <span className="stat-num" style={{ color: 'var(--accent-emerald)' }}>{totalDone}</span>
            </div>
            <div className="weekly-retro-stat-box">
              <span className="stat-label">Успешность</span>
              <span className="stat-num" style={{ color: 'var(--accent-cyan)' }}>{pct}%</span>
            </div>
            <div className="weekly-retro-stat-box">
              <span className="stat-label">Время в фокусе</span>
              <span className="stat-num" style={{ color: 'var(--accent-purple)' }}>{hours} ч</span>
            </div>
          </div>

          {/* Star rating */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>
              Оценка продуктивности недели:
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  type="button"
                  aria-label={`Оценка ${star} из 5`}
                  aria-pressed={star === rating}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '24px',
                    cursor: 'pointer',
                    filter: star <= rating ? 'none' : 'grayscale(1) opacity(0.35)',
                    transition: 'transform 0.15s ease'
                  }}
                  onClick={() => setRating(star)}
                >
                  ⭐
                </button>
              ))}
              <span style={{ fontSize: '13px', color: 'var(--text-muted)', alignSelf: 'center', marginLeft: '8px' }}>
                {rating === 5 ? 'Легендарная неделя!' : rating >= 4 ? 'Отличный прогресс' : rating >= 3 ? 'Нормальный темп' : rating > 0 ? 'Были трудности' : 'Без оценки'}
              </span>
            </div>
          </div>

          {/* Form fields */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
              ✨ Что получилось отлично (механики, спрайты, код):
            </label>
            <textarea
              className="modal-textarea"
              rows={3}
              placeholder="Например: Сделал стабильный Jump Cutoff и Coyote Time, отрисовал 8 кадров бега..."
              value={wentWell}
              onChange={e => setWentWell(e.target.value)}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
              🚧 Что затормозило или отвлекло (баги, выгорание, переделки):
            </label>
            <textarea
              className="modal-textarea"
              rows={3}
              placeholder="Например: Долго возился с коллизиями CharacterBody2D на наклонных поверхностях..."
              value={blockers}
              onChange={e => setBlockers(e.target.value)}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
              💡 Выводы и фокус на следующую неделю:
            </label>
            <textarea
              className="modal-textarea"
              rows={2}
              placeholder="Например: Разбить анимации атак на микро-задачи, не сидеть над шейдером дольше 1 часа..."
              value={learnings}
              onChange={e => setLearnings(e.target.value)}
            />
          </div>

          {confirmReset ? (
            <div className="panel" style={{ background: 'rgba(244, 63, 94, 0.1)', borderColor: 'var(--accent-rose)', padding: '12px' }}>
              <p style={{ margin: '0 0 10px', fontSize: '13px', color: 'var(--text-main)' }}>
                ⚠️ Очистить все задачи по дням и начать новую неделю?
              </p>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '10px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={keepGoals}
                  onChange={e => setKeepGoals(e.target.checked)}
                />
                Оставить текущие 3 главные цели недели
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button type="button" className="btn" style={{ background: 'var(--accent-rose)', color: '#fff' }} onClick={handleExecuteReset}>
                  Да, начать новую неделю
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => setConfirmReset(false)}>
                  Отмена
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ fontSize: '12px', color: 'var(--accent-rose)' }}
                onClick={() => setConfirmReset(true)}
              >
                🔄 Закрыть неделю и начать новую
              </button>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button type="button" className="btn btn-secondary" onClick={onClose}>
                  Отмена
                </button>
                <button type="button" className="btn btn-primary" onClick={handleSave}>
                  Сохранить ретроспективу
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
