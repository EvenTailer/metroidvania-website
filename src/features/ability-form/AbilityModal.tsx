import React, { useState } from 'react';
import { GameAbility, AbilityCategory, AbilityStatus } from '../../entities/ability';
import { ConfirmModal } from '../../shared/ui/ConfirmModal';

interface AbilityModalProps {
  ability?: GameAbility | null;
  onSave: (ab: GameAbility) => void;
  onDelete?: (id: string) => void;
  onClose: () => void;
  onShowToast: (msg: string) => void;
}

const CATEGORIES: { id: AbilityCategory; label: string }[] = [
  { id: 'combat', label: '⚔️ Бой' },
  { id: 'mobility', label: '👟 Мобильность' },
  { id: 'exploration', label: '👁 Эксплорейшн' },
  { id: 'defense', label: '🛡️ Защита' }
];

const STATUSES: { id: AbilityStatus; label: string; color: string }[] = [
  { id: 'done', label: 'Готово ✓', color: 'var(--accent-emerald)' },
  { id: 'in-progress', label: 'В разработке', color: 'var(--accent-amber)' },
  { id: 'planned', label: 'В планах', color: 'var(--text-muted)' }
];

export const AbilityModal: React.FC<AbilityModalProps> = ({
  ability,
  onSave,
  onDelete,
  onClose,
  onShowToast
}) => {
  const isEditing = Boolean(ability);
  const [name, setName] = useState(ability?.name || '');
  const [icon, setIcon] = useState(ability?.icon || '⚡');
  const [category, setCategory] = useState<AbilityCategory>(ability?.category || 'combat');
  const [godotInput, setGodotInput] = useState(ability?.godotInput || 'J');
  const [timing, setTiming] = useState(ability?.timing || 'Окно 0.15с • Hitstop 0.08с');
  const [mechanic, setMechanic] = useState(ability?.mechanic || '');
  const [gatingBarrier, setGatingBarrier] = useState(ability?.gatingBarrier || '');
  const [godotNode, setGodotNode] = useState(ability?.godotNode || 'Player/Abilities/...');
  const [status, setStatus] = useState<AbilityStatus>(ability?.status || 'in-progress');
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  const handleSave = () => {
    const cleanName = name.trim();
    if (!cleanName) {
      onShowToast('Введите название способности');
      return;
    }

    const item: GameAbility = {
      id: ability?.id || 'ab-' + Date.now(),
      name: cleanName,
      icon: icon.trim() || '⚡',
      category,
      godotInput: godotInput.trim() || '—',
      timing: timing.trim() || '—',
      mechanic: mechanic.trim() || 'Описание механики',
      gatingBarrier: gatingBarrier.trim() || 'Доступ к новым зонам',
      godotNode: godotNode.trim() || 'Player/Abilities/Custom',
      status
    };

    onSave(item);
    onShowToast(isEditing ? 'Способность обновлена' : 'Способность создана!');
    onClose();
  };

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div
        className="sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ability-modal-title"
        style={{ maxWidth: '540px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sheet-handle" aria-hidden="true" />
        <h3 id="ability-modal-title" className="composer-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>{icon}</span> {isEditing ? 'Редактировать способность' : 'Новая способность (Ability Gating)'}
        </h3>

        {/* Category & Status */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
          <div>
            <label className="field-label">Категория</label>
            <div className="note-tag-row">
              {CATEGORIES.map(c => (
                <button
                  key={c.id}
                  type="button"
                  className={`chip-btn ${category === c.id ? 'active' : ''}`}
                  onClick={() => setCategory(c.id)}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="field-label">Статус в Godot</label>
            <div className="note-tag-row">
              {STATUSES.map(s => (
                <button
                  key={s.id}
                  type="button"
                  className={`chip-btn ${status === s.id ? 'active' : ''}`}
                  onClick={() => setStatus(s.id)}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Name and Icon */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
          <div style={{ width: '80px' }}>
            <label className="field-label">Иконка</label>
            <input
              className="field"
              value={icon}
              style={{ textAlign: 'center', fontSize: '18px' }}
              onChange={(e) => setIcon(e.target.value)}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label className="field-label" htmlFor="ab-name">Название способности</label>
            <input
              id="ab-name"
              className="field"
              value={name}
              placeholder="Например: Парирование кибер-рукой, Спектр-глаз"
              onChange={(e) => setName(e.target.value)}
            />
          </div>
        </div>

        {/* Godot Input & Timings */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
          <div>
            <label className="field-label" htmlFor="ab-input">Клавиша в InputMap</label>
            <input
              id="ab-input"
              className="field"
              value={godotInput}
              placeholder="Например: Q, Shift, J, Space"
              onChange={(e) => setGodotInput(e.target.value)}
            />
          </div>
          <div>
            <label className="field-label" htmlFor="ab-timing">Тайминги / Game Feel</label>
            <input
              id="ab-timing"
              className="field"
              value={timing}
              placeholder="Окно 0.15с • Hitstop 0.08с"
              onChange={(e) => setTiming(e.target.value)}
            />
          </div>
        </div>

        {/* Mechanic description */}
        <div style={{ marginBottom: '12px' }}>
          <label className="field-label" htmlFor="ab-mechanic">Механика поведения в игре</label>
          <textarea
            id="ab-mechanic"
            className="field"
            rows={2}
            value={mechanic}
            placeholder="Что именно происходит при нажатии, взаимодействие со снарядами, физика..."
            onChange={(e) => setMechanic(e.target.value)}
          />
        </div>

        {/* Ability Gating Barrier */}
        <div style={{ marginBottom: '12px' }}>
          <label className="field-label" htmlFor="ab-gate" style={{ color: 'var(--accent-cyan)' }}>
            🔑 Гейтинг: какой барьер / дверь / зону открывает
          </label>
          <input
            id="ab-gate"
            className="field"
            value={gatingBarrier}
            placeholder="Например: Выбивает силовые гермодвери Литейного цеха"
            onChange={(e) => setGatingBarrier(e.target.value)}
          />
        </div>

        {/* Godot Node Path */}
        <div style={{ marginBottom: '16px' }}>
          <label className="field-label" htmlFor="ab-node">Узел / Сцена в Godot 4</label>
          <input
            id="ab-node"
            className="field"
            value={godotNode}
            placeholder="Player/Abilities/ParryArea2D"
            onChange={(e) => setGodotNode(e.target.value)}
          />
        </div>

        {/* Actions */}
        <div className="note-actions" style={{ gap: '10px' }}>
          {isEditing && ability && onDelete && (
            <button
              type="button"
              className="btn btn-secondary"
              style={{ color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.4)' }}
              onClick={() => setIsDeleteConfirmOpen(true)}
            >
              Удалить
            </button>
          )}
          <button type="button" className="btn btn-secondary" onClick={onClose} style={{ flex: 1 }}>
            Отмена
          </button>
          <button type="button" className="btn btn-primary" onClick={handleSave} style={{ flex: 1.4 }}>
            {isEditing ? 'Сохранить' : 'Создать'}
          </button>
        </div>
      </div>

      {isEditing && ability && onDelete && (
        <ConfirmModal
          isOpen={isDeleteConfirmOpen}
          title="Удаление способности"
          message={`Вы уверены, что хотите удалить способность «${name}»? Это действие нельзя будет отменить.`}
          confirmText="Удалить"
          cancelText="Отмена"
          danger={true}
          onConfirm={() => {
            onDelete(ability.id);
            onClose();
          }}
          onClose={() => setIsDeleteConfirmOpen(false)}
        />
      )}
    </div>
  );
};
