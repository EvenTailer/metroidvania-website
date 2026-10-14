import React from 'react';
import { BossPhase } from '../../entities/bestiary';

interface BossPhaseTimelineProps {
  phases: BossPhase[];
  maxHp: number;
}

export const BossPhaseTimeline: React.FC<BossPhaseTimelineProps> = ({ phases, maxHp }) => {
  if (!phases || phases.length === 0) return null;

  return (
    <div style={{ marginTop: '10px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
        <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--accent-pink)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Фазы ({phases.length})
        </span>
        <span style={{ fontSize: '10.5px', color: 'var(--text-muted)' }} title="Фаза уже идёт, если здоровье не выше этого порога">
          Фаза идёт, пока HP не выше порога
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {phases.map((phase, idx) => {
          const hpValue = Math.round((phase.hpThresholdPercent / 100) * maxHp);
          const isFinal = idx === phases.length - 1 && phases.length > 1;

          return (
            <div
              key={phase.phaseNumber}
              style={{
                background: isFinal ? 'rgba(239, 68, 68, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                border: isFinal ? '1px solid rgba(239, 68, 68, 0.35)' : '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '6px',
                padding: '6px 10px',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: 900,
                      padding: '1px 5px',
                      borderRadius: '4px',
                      background: isFinal ? '#ef4444' : 'var(--accent-purple)',
                      color: '#fff'
                    }}
                  >
                    Фаза {phase.phaseNumber}
                  </span>
                  <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#fff' }}>
                    {phase.name}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                    Скорость: <strong style={{ color: '#fff' }}>{phase.speedMultiplier}x</strong>
                  </span>
                  <span
                    style={{
                      fontSize: '10.5px',
                      fontWeight: 800,
                      color: isFinal ? '#f87171' : 'var(--accent-amber)'
                    }}
                  >
                    ≤ {phase.hpThresholdPercent}% HP ({hpValue} HP)
                  </span>
                </div>
              </div>

              <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', lineHeight: 1.35 }}>
                {phase.description}
              </div>
              {phase.musicTrack && (
                <div style={{ fontSize: '10px', color: '#f9a8d4' }}>
                  Трек: {phase.musicTrack}
                </div>
              )}

              {phase.newAttacks && phase.newAttacks.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '2px' }}>
                  {phase.newAttacks.map(atk => (
                    <span
                      key={atk.id}
                      style={{
                        fontSize: '9.5px',
                        padding: '1px 5px',
                        borderRadius: '3px',
                        background: 'rgba(236, 72, 153, 0.15)',
                        border: '1px solid rgba(236, 72, 153, 0.3)',
                        color: '#f472b6'
                      }}
                      title={`${atk.description} (Урон: ${atk.damage})`}
                    >
                      ⚡ {atk.name} (Урон: {atk.damage})
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
