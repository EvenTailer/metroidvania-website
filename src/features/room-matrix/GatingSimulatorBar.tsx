import React from 'react';
import { ABILITY_DEFINITIONS } from '../../entities/room-matrix';

interface GatingSimulatorBarProps {
  activeAbilities: string[];
  totalRooms: number;
  reachableCount: number;
  onToggleAbility: (id: string) => void;
  onResetToStart: () => void;
  onUnlockAll: () => void;
  zoom: number;
  onChangeZoom: (delta: number) => void;
}

export const GatingSimulatorBar: React.FC<GatingSimulatorBarProps> = ({
  activeAbilities,
  totalRooms,
  reachableCount,
  onToggleAbility,
  onResetToStart,
  onUnlockAll,
  zoom,
  onChangeZoom
}) => {
  const percent = totalRooms > 0 ? Math.round((reachableCount / totalRooms) * 100) : 0;
  const allIds = ABILITY_DEFINITIONS.map(a => a.id);
  const isAllUnlocked = allIds.every(id => activeAbilities.includes(id));

  return (
    <div className="panel" style={{ padding: '14px 18px', marginBottom: '16px', background: 'rgba(15, 23, 42, 0.75)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '18px' }}>🕹️</span>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Симулятор способностей и гейтинга
              </span>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: '12px',
                  background: percent === 100 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(0, 210, 255, 0.15)',
                  color: percent === 100 ? 'var(--accent-emerald)' : 'var(--accent-cyan)',
                  border: `1px solid ${percent === 100 ? 'rgba(16, 185, 129, 0.4)' : 'rgba(0, 210, 255, 0.3)'}`
                }}
              >
                Открыто {reachableCount} / {totalRooms} комнат ({percent}%)
              </span>
            </div>
            <p style={{ margin: '2px 0 0', fontSize: '11.5px', color: 'var(--text-muted)' }}>
              Включайте импланты, чтобы проверить, куда сможет дойти Кибер-Утка и какие замки блокируют бэктрекинг.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            className="chip-btn"
            style={{ fontSize: '11px', padding: '4px 10px' }}
            onClick={onResetToStart}
          >
            🔄 Сброс (Старт)
          </button>
          <button
            type="button"
            className={`chip-btn ${isAllUnlocked ? 'active' : ''}`}
            style={{ fontSize: '11px', padding: '4px 10px' }}
            onClick={onUnlockAll}
          >
            ⚡ Открыть все
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginLeft: '6px', background: 'rgba(0,0,0,0.3)', padding: '2px 6px', borderRadius: '6px' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Масштаб:</span>
            <button
              type="button"
              className="chip-btn"
              style={{ padding: '2px 6px', fontSize: '11px' }}
              onClick={() => onChangeZoom(-0.1)}
              disabled={zoom <= 0.7}
            >
              −
            </button>
            <span style={{ fontSize: '11px', fontWeight: 700, minWidth: '32px', textAlign: 'center', color: '#fff' }}>
              {Math.round(zoom * 100)}%
            </span>
            <button
              type="button"
              className="chip-btn"
              style={{ padding: '2px 6px', fontSize: '11px' }}
              onClick={() => onChangeZoom(0.1)}
              disabled={zoom >= 1.4}
            >
              +
            </button>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {ABILITY_DEFINITIONS.map(ab => {
          const isActive = activeAbilities.includes(ab.id);
          const isBase = ab.id === 'ab-jump';
          return (
            <button
              key={ab.id}
              type="button"
              className={`chip-btn ${isActive ? 'active' : ''}`}
              onClick={() => onToggleAbility(ab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '11.5px',
                padding: '6px 12px',
                borderRadius: '8px',
                border: isActive ? '1px solid rgba(0, 210, 255, 0.5)' : '1px solid rgba(255, 255, 255, 0.1)',
                background: isActive ? 'rgba(0, 210, 255, 0.12)' : 'rgba(30, 41, 59, 0.5)',
                color: isActive ? '#fff' : 'var(--text-muted)',
                cursor: isBase ? 'default' : 'pointer'
              }}
              title={isBase ? 'Базовый навык доступен всегда' : `Переключить наличие ${ab.name}`}
            >
              <span style={{ fontSize: '14px' }}>{ab.icon}</span>
              <span style={{ fontWeight: isActive ? 700 : 500 }}>{ab.name}</span>
              <span
                style={{
                  fontSize: '9.5px',
                  opacity: 0.7,
                  background: 'rgba(0,0,0,0.3)',
                  padding: '1px 5px',
                  borderRadius: '4px'
                }}
              >
                {ab.inputKey}
              </span>
              <span style={{ marginLeft: '2px', fontSize: '12px' }}>
                {isActive ? '✓' : '✗'}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
