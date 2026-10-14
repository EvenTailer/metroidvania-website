import React from 'react';
import { BossPhase } from '../../entities/bestiary';
import { EnemyAttackEditor } from './EnemyAttackEditor';
import { FieldHint } from './FieldHint';

interface EnemyPhaseEditorProps {
  phases: BossPhase[];
  onChange: (phases: BossPhase[]) => void;
}

export const EnemyPhaseEditor: React.FC<EnemyPhaseEditorProps> = ({ phases, onChange }) => {
  const updatePhase = (index: number, patch: Partial<BossPhase>) => {
    onChange(phases.map((phase, phaseIndex) => (
      phaseIndex === index ? { ...phase, ...patch } : phase
    )));
  };

  const addPhase = () => {
    const phaseNumber = phases.length + 1;
    onChange([
      ...phases,
      {
        phaseNumber,
        name: `Фаза ${phaseNumber}`,
        hpThresholdPercent: phaseNumber === 1 ? 100 : Math.max(20, 100 - (phaseNumber - 1) * 30),
        speedMultiplier: 1 + (phaseNumber - 1) * 0.15,
        description: '',
        newAttacks: [],
        musicTrack: ''
      }
    ]);
  };

  return (
    <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '10px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <span className="composer-label" style={{ margin: 0 }}>Фазы ({phases.length})</span>
        <button type="button" className="chip-btn" onClick={addPhase} style={{ fontSize: '11px', padding: '2px 8px' }}>
          + Фаза
        </button>
      </div>
      <FieldHint>Фаза включается, когда здоровье падает до порога. 100% — с начала боя. Новые атаки добавляются к обычным, старые не пропадают.</FieldHint>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {phases.map((phase, index) => {
          const fieldId = `phase-${phase.phaseNumber}-${index}`;
          return (
            <div key={`${phase.phaseNumber}-${index}`} style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.22)', borderRadius: '8px', padding: '8px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto', gap: '8px', alignItems: 'end' }}>
                <div>
                  <label className="composer-label" htmlFor={`${fieldId}-name`}>Название фазы</label>
                  <input
                    id={`${fieldId}-name`}
                    className="field"
                    value={phase.name}
                    onChange={event => updatePhase(index, { name: event.target.value })}
                  />
                </div>
                <button
                  type="button"
                  className="chip-btn"
                  onClick={() => onChange(phases.filter((_, phaseIndex) => phaseIndex !== index).map((item, phaseIndex) => ({
                    ...item,
                    phaseNumber: phaseIndex + 1
                  })))}
                  style={{ fontSize: '10px', color: '#f87171' }}
                >
                  Удалить
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '6px', marginTop: '6px' }}>
                <div>
                  <label className="composer-label" htmlFor={`${fieldId}-hp`}>Порог HP, %</label>
                  <input
                    id={`${fieldId}-hp`}
                    type="number"
                    min={1}
                    max={100}
                    className="field"
                    value={phase.hpThresholdPercent}
                    onChange={event => updatePhase(index, { hpThresholdPercent: Number(event.target.value) })}
                  />
                </div>
                <div>
                  <label className="composer-label" htmlFor={`${fieldId}-speed`}>Скорость, x</label>
                  <input
                    id={`${fieldId}-speed`}
                    type="number"
                    min={0.5}
                    max={4}
                    step={0.05}
                    className="field"
                    value={phase.speedMultiplier}
                    onChange={event => updatePhase(index, { speedMultiplier: Number(event.target.value) })}
                  />
                </div>
                <div>
                  <label className="composer-label" htmlFor={`${fieldId}-music`}>Трек</label>
                  <input
                    id={`${fieldId}-music`}
                    className="field"
                    value={phase.musicTrack || ''}
                    placeholder="res://audio/music/boss.ogg"
                    onChange={event => updatePhase(index, { musicTrack: event.target.value })}
                  />
                </div>
              </div>

              <label className="composer-label" htmlFor={`${fieldId}-desc`}>Что меняется в поведении</label>
              <textarea
                id={`${fieldId}-desc`}
                className="field"
                rows={2}
                value={phase.description}
                onChange={event => updatePhase(index, { description: event.target.value })}
              />

              <EnemyAttackEditor
                attacks={phase.newAttacks}
                idPrefix={`${fieldId}-atk`}
                title="Новые атаки фазы"
                onChange={newAttacks => updatePhase(index, { newAttacks })}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
