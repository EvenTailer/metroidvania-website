import React from 'react';
import { AttackType, EnemyAttack } from '../../entities/bestiary';
import { FieldHint } from './FieldHint';

interface EnemyAttackEditorProps {
  attacks: EnemyAttack[];
  idPrefix: string;
  title: string;
  onChange: (attacks: EnemyAttack[]) => void;
}

const ATTACK_TYPES: { id: AttackType; label: string }[] = [
  { id: 'melee', label: 'Ближний' },
  { id: 'projectile', label: 'Снаряд' },
  { id: 'laser', label: 'Лазер' },
  { id: 'area', label: 'По площади' },
  { id: 'dash', label: 'Рывок' }
];

export const EnemyAttackEditor: React.FC<EnemyAttackEditorProps> = ({
  attacks,
  idPrefix,
  title,
  onChange
}) => {
  const updateAttack = (index: number, patch: Partial<EnemyAttack>) => {
    onChange(attacks.map((attack, attackIndex) => (
      attackIndex === index ? { ...attack, ...patch } : attack
    )));
  };

  const addAttack = () => {
    onChange([
      ...attacks,
      {
        id: `atk-${Date.now()}`,
        name: 'Новый удар',
        type: 'melee',
        damage: 15,
        parryable: true,
        telegraphTime: 0.35,
        cooldown: 2,
        description: ''
      }
    ]);
  };

  return (
    <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '10px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <span className="composer-label" style={{ margin: 0 }}>{title} ({attacks.length})</span>
        <button type="button" className="chip-btn" onClick={addAttack} style={{ fontSize: '11px', padding: '2px 8px' }}>
          + Атака
        </button>
      </div>
      <FieldHint>Замах — пауза до удара, чтобы игрок успел среагировать. Кулдаун — сколько секунд атака не повторяется. Пустое название при сохранении отбрасывается.</FieldHint>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {attacks.map((attack, index) => {
          const fieldId = `${idPrefix}-${attack.id}`;
          return (
            <div key={attack.id} style={{ background: 'rgba(0,0,0,0.28)', borderRadius: '8px', padding: '8px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr) 72px auto', gap: '6px', alignItems: 'end' }}>
                <div>
                  <label className="composer-label" htmlFor={`${fieldId}-name`}>Название</label>
                  <input
                    id={`${fieldId}-name`}
                    className="field"
                    value={attack.name}
                    onChange={event => updateAttack(index, { name: event.target.value })}
                  />
                </div>
                <div>
                  <label className="composer-label" htmlFor={`${fieldId}-type`}>Тип</label>
                  <select
                    id={`${fieldId}-type`}
                    className="field"
                    value={attack.type}
                    onChange={event => updateAttack(index, { type: event.target.value as AttackType })}
                  >
                    {ATTACK_TYPES.map(option => (
                      <option key={option.id} value={option.id}>{option.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="composer-label" htmlFor={`${fieldId}-damage`}>Урон</label>
                  <input
                    id={`${fieldId}-damage`}
                    type="number"
                    min={1}
                    className="field"
                    value={attack.damage}
                    onChange={event => updateAttack(index, { damage: Number(event.target.value) })}
                  />
                </div>
                <button
                  type="button"
                  className="chip-btn"
                  onClick={() => onChange(attacks.filter((_, attackIndex) => attackIndex !== index))}
                  style={{ fontSize: '10px', color: '#f87171', marginBottom: '2px' }}
                >
                  Удалить
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '90px 90px 1fr', gap: '6px', marginTop: '6px', alignItems: 'end' }}>
                <div>
                  <label className="composer-label" htmlFor={`${fieldId}-telegraph`}>Замах, с</label>
                  <input
                    id={`${fieldId}-telegraph`}
                    type="number"
                    min={0.05}
                    step={0.05}
                    className="field"
                    value={attack.telegraphTime}
                    onChange={event => updateAttack(index, { telegraphTime: Number(event.target.value) })}
                  />
                </div>
                <div>
                  <label className="composer-label" htmlFor={`${fieldId}-cooldown`}>Кулдаун, с</label>
                  <input
                    id={`${fieldId}-cooldown`}
                    type="number"
                    min={0.1}
                    step={0.1}
                    className="field"
                    value={attack.cooldown}
                    onChange={event => updateAttack(index, { cooldown: Number(event.target.value) })}
                  />
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#e2e8f0', paddingBottom: '8px' }}>
                  <input
                    type="checkbox"
                    checked={attack.parryable}
                    onChange={event => updateAttack(index, { parryable: event.target.checked })}
                  />
                  Можно парировать кибер-рукой
                </label>
              </div>

              <label className="composer-label" htmlFor={`${fieldId}-desc`}>Как читается удар</label>
              <input
                id={`${fieldId}-desc`}
                className="field"
                value={attack.description}
                placeholder="Замах, уязвимое окно, что происходит после парирования"
                onChange={event => updateAttack(index, { description: event.target.value })}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
