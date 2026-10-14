import React, { useState } from 'react';
import { StateMachineState } from '../../entities/gdscript-generator';

interface StateMachineDesignerProps {
  states: StateMachineState[];
  selectedStateId: string | null;
  onSelectState: (id: string) => void;
  onToggleState: (id: string) => void;
  onUpdateState: (state: StateMachineState) => void;
  onAddState: (state: StateMachineState) => void;
  onRemoveState: (id: string) => void;
  onToggleTransition: (fromId: string, toId: string) => void;
}

export const StateMachineDesigner: React.FC<StateMachineDesignerProps> = ({
  states,
  selectedStateId,
  onSelectState,
  onToggleState,
  onUpdateState,
  onAddState,
  onRemoveState,
  onToggleTransition
}) => {
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newName, setNewName] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [newAnim, setNewAnim] = useState('');
  const [newIcon, setNewIcon] = useState('⭐');

  const selectedState = states.find(s => s.id === selectedStateId) || states[0];
  const enabledStates = states.filter(s => s.enabled);

  const handleCreateCustomState = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    const cleanId = newName.toLowerCase().replace(/[^a-z0-9_]/g, '_');
    const newState: StateMachineState = {
      id: cleanId,
      name: newName.trim(),
      label: newLabel.trim() || newName.trim(),
      description: 'Пользовательское состояние персонажа',
      animationName: newAnim.trim() || cleanId,
      icon: newIcon || '⭐',
      color: '#00f2fe',
      enabled: true,
      canTransitionTo: ['idle', 'fall']
    };
    onAddState(newState);
    setIsAddingNew(false);
    setNewName('');
    setNewLabel('');
    setNewAnim('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Шапка конструктора */}
      <div
        style={{
          background: 'rgba(11, 16, 28, 0.85)',
          border: '1px solid var(--border)',
          borderRadius: '10px',
          padding: '14px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '10px'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '18px' }}>🤖</span>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#fff' }}>
              Конструктор конечных автоматов (State Machine)
            </h3>
            <span
              style={{
                fontSize: '10.5px',
                padding: '2px 8px',
                borderRadius: '12px',
                background: 'rgba(0, 242, 254, 0.15)',
                color: 'var(--accent-cyan)'
              }}
            >
              {enabledStates.length} активных состояний
            </span>
          </div>
          <p style={{ margin: '4px 0 0', fontSize: '11.5px', color: 'var(--text-muted)' }}>
            Управляйте состояниями движения героя: Idle, Run, Jump, Fall, Dash, Parry, Hurt, Dead и связями между ними
          </p>
        </div>

        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setIsAddingNew(true)}
          style={{ fontSize: '12px', padding: '6px 12px', fontWeight: 700 }}
        >
          + Новое состояние
        </button>
      </div>

      {/* Форма добавления кастомного стейта */}
      {isAddingNew && (
        <form
          onSubmit={handleCreateCustomState}
          style={{
            background: 'rgba(15, 23, 42, 0.95)',
            border: '1px solid var(--accent-cyan)',
            borderRadius: '10px',
            padding: '14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <strong style={{ fontSize: '13px', color: '#fff' }}>
              Добавить новое состояние (например: WallSlide, WallJump, Crouch)
            </strong>
            <button
              type="button"
              onClick={() => setIsAddingNew(false)}
              style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}
            >
              ✕
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px' }}>
            <div>
              <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Имя класса (GDScript):</label>
              <input
                type="text"
                className="field"
                placeholder="WallSlide"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                required
                style={{ width: '100%', fontSize: '12px' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Название (рус):</label>
              <input
                type="text"
                className="field"
                placeholder="Скольжение по стене"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                style={{ width: '100%', fontSize: '12px' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Анимация в SpriteFrames:</label>
              <input
                type="text"
                className="field"
                placeholder="wall_slide"
                value={newAnim}
                onChange={(e) => setNewAnim(e.target.value)}
                style={{ width: '100%', fontSize: '12px' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Иконка:</label>
              <input
                type="text"
                className="field"
                value={newIcon}
                onChange={(e) => setNewIcon(e.target.value)}
                style={{ width: '100%', fontSize: '12px' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '6px' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsAddingNew(false)}
              style={{ fontSize: '11.5px' }}
            >
              Отмена
            </button>
            <button type="submit" className="btn btn-primary" style={{ fontSize: '11.5px', fontWeight: 700 }}>
              Добавить в автомат
            </button>
          </div>
        </form>
      )}

      {/* Двухколоночный макет: Список состояний слева + Редактор связей справа */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '14px',
          alignItems: 'start'
        }}
      >
        {/* Колонка 1: Список состояний с тумблерами включения */}
        <div
          style={{
            background: 'rgba(11, 16, 28, 0.85)',
            border: '1px solid var(--border)',
            borderRadius: '10px',
            padding: '12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}
        >
          <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' }}>
            Состояния персонажа:
          </div>

          {states.map(st => {
            const isSelected = selectedState?.id === st.id;
            return (
              <div
                key={st.id}
                onClick={() => onSelectState(st.id)}
                style={{
                  background: isSelected
                    ? `${st.color}15`
                    : 'rgba(255, 255, 255, 0.02)',
                  border: isSelected
                    ? `1.5px solid ${st.color}`
                    : '1px solid rgba(255, 255, 255, 0.06)',
                  borderRadius: '8px',
                  padding: '9px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '8px',
                  cursor: 'pointer',
                  opacity: st.enabled ? 1 : 0.45,
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '18px' }}>{st.icon}</span>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <strong style={{ fontSize: '13px', color: '#fff' }}>{st.name}</strong>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>({st.label})</span>
                    </div>
                    <span style={{ fontSize: '10px', color: 'var(--text-dim)' }}>
                      Анимация: <code>{st.animationName}</code> • {st.canTransitionTo.length} переходов
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }} onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    onClick={() => onToggleState(st.id)}
                    className="btn btn-ghost"
                    style={{
                      fontSize: '11px',
                      padding: '3px 8px',
                      color: st.enabled ? 'var(--accent-emerald)' : 'var(--text-dim)'
                    }}
                    title={st.enabled ? 'Отключить состояние' : 'Включить состояние'}
                  >
                    {st.enabled ? 'ВКЛ' : 'ВЫКЛ'}
                  </button>

                  {!['idle', 'run', 'jump', 'fall'].includes(st.id) && (
                    <button
                      type="button"
                      onClick={() => onRemoveState(st.id)}
                      className="icon-btn"
                      style={{ fontSize: '12px', color: 'var(--accent-rose)' }}
                      title="Удалить состояние"
                    >
                      🗑️
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Колонка 2: Настройка выбранного состояния и разрешенные переходы */}
        {selectedState && (
          <div
            style={{
              background: 'rgba(15, 22, 38, 0.95)',
              border: `1px solid ${selectedState.color}40`,
              boxShadow: `0 0 20px ${selectedState.color}15`,
              borderRadius: '10px',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '24px' }}>{selectedState.icon}</span>
                <div>
                  <h4 style={{ margin: 0, fontSize: '15px', color: selectedState.color }}>
                    Настройка: State.{selectedState.name.toUpperCase()}
                  </h4>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    {selectedState.description}
                  </span>
                </div>
              </div>
            </div>

            {/* Имя анимации */}
            <div>
              <label style={{ fontSize: '11.5px', color: '#cbd5e1', display: 'block', marginBottom: '4px' }}>
                Клип анимации AnimatedSprite2D:
              </label>
              <input
                type="text"
                className="field"
                value={selectedState.animationName}
                onChange={(e) =>
                  onUpdateState({ ...selectedState, animationName: e.target.value })
                }
                style={{ width: '100%', fontSize: '12px' }}
              />
            </div>

            {/* Разрешенные переходы */}
            <div style={{ background: 'rgba(2, 6, 23, 0.5)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <strong style={{ fontSize: '12px', color: '#fff' }}>
                  Куда можно перейти из состояния «{selectedState.name}»:
                </strong>
                <span style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>
                  (галочки переходов)
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px' }}>
                {states
                  .filter(s => s.id !== selectedState.id && s.enabled)
                  .map(targetState => {
                    const canGo = selectedState.canTransitionTo.includes(targetState.id);
                    return (
                      <label
                        key={targetState.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          background: canGo ? 'rgba(0, 242, 254, 0.1)' : 'rgba(255, 255, 255, 0.02)',
                          border: canGo ? '1px solid var(--accent-cyan)' : '1px solid rgba(255, 255, 255, 0.06)',
                          borderRadius: '6px',
                          padding: '6px 8px',
                          cursor: 'pointer',
                          fontSize: '11.5px',
                          color: canGo ? '#fff' : 'var(--text-dim)',
                          userSelect: 'none'
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={canGo}
                          onChange={() => onToggleTransition(selectedState.id, targetState.id)}
                          style={{ accentColor: 'var(--accent-cyan)' }}
                        />
                        <span>{targetState.icon} {targetState.name}</span>
                      </label>
                    );
                  })}
              </div>
            </div>

            {/* Визуальная цепочка переходов */}
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Связи: <strong style={{ color: selectedState.color }}>{selectedState.name}</strong> ➔{' '}
              {selectedState.canTransitionTo.length > 0 ? (
                selectedState.canTransitionTo.map(id => {
                  const target = states.find(s => s.id === id);
                  return (
                    <span
                      key={id}
                      style={{
                        display: 'inline-block',
                        background: 'rgba(255, 255, 255, 0.06)',
                        padding: '1px 6px',
                        borderRadius: '4px',
                        margin: '0 3px',
                        color: target?.color || '#fff'
                      }}
                    >
                      {target?.icon} {target?.name || id}
                    </span>
                  );
                })
              ) : (
                <span style={{ color: 'var(--accent-rose)' }}>нет выходов (тупиковое состояние)</span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
