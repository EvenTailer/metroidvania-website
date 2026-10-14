import React, { useState } from 'react';
import { RELEASE_CHECKLIST } from '../../entities/engine-bridge';

interface ReleaseChecklistBannerProps {
  completed: Record<string, boolean>;
  onToggle: (id: string) => void;
}

export const ReleaseChecklistBanner: React.FC<ReleaseChecklistBannerProps> = ({
  completed,
  onToggle
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const total = RELEASE_CHECKLIST.length;
  const doneCount = RELEASE_CHECKLIST.filter(item => completed[item.id]).length;
  const progressPercent = Math.round((doneCount / total) * 100);

  return (
    <div
      style={{
        background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.85) 100%)',
        border: '1px solid rgba(0, 242, 254, 0.25)',
        borderRadius: '10px',
        padding: '14px 18px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '22px' }}>🎯</span>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h4 style={{ margin: 0, fontSize: '13.5px', fontWeight: 800, color: '#fff' }}>
                Чек-лист подготовки сборки к плейтесту / релизу
              </h4>
              <span
                style={{
                  fontSize: '10.5px',
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: '12px',
                  background: progressPercent === 100 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(0, 242, 254, 0.15)',
                  color: progressPercent === 100 ? 'var(--accent-emerald)' : 'var(--accent-cyan)',
                  border: `1px solid ${progressPercent === 100 ? 'var(--accent-emerald)' : 'var(--accent-cyan)'}40`
                }}
              >
                {doneCount} из {total} шагов ({progressPercent}%)
              </span>
            </div>
            <p style={{ margin: '2px 0 0', fontSize: '11px', color: 'var(--text-muted)' }}>
              Пройдите эти 5 шагов перед передачей билда игрокам, чтобы избежать вылетов и испорченных сохранений.
            </p>
          </div>
        </div>

        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => setIsExpanded(!isExpanded)}
          style={{ fontSize: '11.5px', padding: '4px 10px' }}
        >
          {isExpanded ? 'Свернуть чек-лист ▲' : 'Развернуть чек-лист ▼'}
        </button>
      </div>

      {/* Прогресс-бар */}
      <div style={{ height: '6px', width: '100%', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '3px', overflow: 'hidden' }}>
        <div
          style={{
            height: '100%',
            width: `${progressPercent}%`,
            background: progressPercent === 100
              ? 'linear-gradient(90deg, #10b981, #34d399)'
              : 'linear-gradient(90deg, var(--accent-cyan), var(--accent-purple))',
            transition: 'width 0.3s ease'
          }}
        />
      </div>

      {/* Список пунктов при раскрытии */}
      {isExpanded && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '8px', marginTop: '6px' }}>
          {RELEASE_CHECKLIST.map((item, idx) => {
            const isDone = Boolean(completed[item.id]);
            return (
              <label
                key={item.id}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '8px',
                  background: isDone ? 'rgba(16, 185, 129, 0.08)' : 'rgba(2, 6, 23, 0.4)',
                  border: `1px solid ${isDone ? 'rgba(16, 185, 129, 0.3)' : 'rgba(255, 255, 255, 0.06)'}`,
                  padding: '8px 10px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  userSelect: 'none'
                }}
              >
                <input
                  type="checkbox"
                  checked={isDone}
                  onChange={() => onToggle(item.id)}
                  style={{ marginTop: '3px' }}
                />
                <div>
                  <div style={{ fontSize: '11.5px', fontWeight: 700, color: isDone ? '#fff' : '#cbd5e1', textDecoration: isDone ? 'line-through' : 'none' }}>
                    {idx + 1}. {item.label}
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--text-dim)', marginTop: '2px' }}>
                    {item.hint}
                  </div>
                </div>
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
};
