import React, { useState } from 'react';
import { ABILITY_DEFINITIONS, RoomLock, RoomNode } from '../../entities/room-matrix';
import { ConfirmModal } from '../../shared/ui/ConfirmModal';

interface ConnectionEditModalProps {
  fromRoom: RoomNode;
  toRoom: RoomNode;
  initialLock?: RoomLock;
  onSave: (lock?: RoomLock) => void;
  onDelete: () => void;
  onClose: () => void;
}

export const ConnectionEditModal: React.FC<ConnectionEditModalProps> = ({
  fromRoom,
  toRoom,
  initialLock,
  onSave,
  onDelete,
  onClose
}) => {
  const [hasLock, setHasLock] = useState(Boolean(initialLock));
  const [abilityId, setAbilityId] = useState(initialLock?.requiredAbilityId || 'ab-eye');
  const [label, setLabel] = useState(initialLock?.label || 'Препятствие способности');
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasLock) {
      onSave(undefined);
    } else {
      const lock: RoomLock = {
        id: initialLock?.id || `lk-${Date.now()}`,
        direction: initialLock?.direction || 'east',
        requiredAbilityId: abilityId,
        label: label.trim() || 'Замок способности',
        type: 'ability'
      };
      onSave(lock);
    }
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div
        className="modal"
        onClick={e => e.stopPropagation()}
        style={{ maxWidth: '480px', width: '92%' }}
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '18px' }}>🔗</span>
            <div>
              <h3 className="modal-title">Настройка перехода между комнатами</h3>
              <p style={{ margin: 0, fontSize: '11.5px', color: 'var(--text-muted)' }}>
                {fromRoom.name} ⇄ {toRoom.name}
              </p>
            </div>
          </div>
          <button type="button" className="modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '12.5px', fontWeight: 600, color: '#fff' }}>
              <input
                type="checkbox"
                checked={hasLock}
                onChange={e => setHasLock(e.target.checked)}
              />
              Установить замок способности (Gating Lock)
            </label>
            <p style={{ margin: '4px 0 0 24px', fontSize: '11px', color: 'var(--text-muted)' }}>
              Если включено, игрок не сможет пройти этот коридор, пока не получит нужный имплант.
            </p>
          </div>

          {hasLock && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <label className="composer-label">Требуемая способность / Имплант</label>
                <select
                  className="field"
                  value={abilityId}
                  onChange={e => setAbilityId(e.target.value)}
                >
                  {ABILITY_DEFINITIONS.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.icon} {a.name} ({a.inputKey})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="composer-label">Название замка / Препятствия</label>
                <input
                  type="text"
                  className="field"
                  value={label}
                  onChange={e => setLabel(e.target.value)}
                  placeholder="Например: Синяя квантовая решетка, Кислотная яма, Бронезатвор"
                  required
                />
              </div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)' }}
              onClick={() => setIsDeleteConfirmOpen(true)}
            >
              🗑️ Удалить связь
            </button>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="button" className="btn btn-secondary" onClick={onClose}>Отмена</button>
              <button type="submit" className="btn btn-primary">Применить</button>
            </div>
          </div>
        </form>
      </div>

      <ConfirmModal
        isOpen={isDeleteConfirmOpen}
        title="Удаление перехода"
        message={`Удалить переход между комнатами «${fromRoom.name}» и «${toRoom.name}»?`}
        confirmText="Удалить переход"
        cancelText="Отмена"
        danger={true}
        onConfirm={() => {
          onDelete();
          onClose();
        }}
        onClose={() => setIsDeleteConfirmOpen(false)}
      />
    </div>
  );
};
