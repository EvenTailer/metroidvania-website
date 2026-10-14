import React from 'react';
import { AssetChecklistItem } from '../../entities/asset-pipeline';

interface AssetChecklistEditorProps {
  checklist: AssetChecklistItem[];
  newCheckText: string;
  onNewCheckText: (value: string) => void;
  onApplyDefault: () => void;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
  onAdd: () => void;
}

export const AssetChecklistEditor: React.FC<AssetChecklistEditorProps> = ({
  checklist,
  newCheckText,
  onNewCheckText,
  onApplyDefault,
  onToggle,
  onRemove,
  onAdd
}) => (
  <div style={{ background: 'rgba(2, 6, 23, 0.4)', borderRadius: '8px', padding: '12px', border: '1px solid var(--border)' }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
      <span style={{ fontSize: '12px', fontWeight: 700, color: '#fff' }}>
        Чек-лист задач ассета ({checklist.filter(item => item.completed).length}/{checklist.length})
      </span>
      <button
        type="button"
        className="btn btn-ghost"
        onClick={onApplyDefault}
        style={{ fontSize: '10.5px', padding: '2px 8px', color: 'var(--accent-cyan)' }}
      >
        Сбросить к стандарту типа
      </button>
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '8px' }}>
      {checklist.map(item => (
        <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', color: item.completed ? 'var(--text-muted)' : '#fff', cursor: 'pointer', flex: 1 }}>
            <input
              type="checkbox"
              checked={item.completed}
              onChange={() => onToggle(item.id)}
              style={{ accentColor: 'var(--accent-cyan)' }}
            />
            <span style={{ textDecoration: item.completed ? 'line-through' : 'none' }}>{item.title}</span>
          </label>
          <button
            type="button"
            onClick={() => onRemove(item.id)}
            style={{ background: 'none', border: 'none', color: 'var(--accent-rose)', cursor: 'pointer', fontSize: '12px', padding: '0 4px' }}
          >
            ✕
          </button>
        </div>
      ))}
    </div>
    <div style={{ display: 'flex', gap: '6px' }}>
      <input
        type="text"
        className="field"
        placeholder="Добавить свой пункт чек-листа..."
        value={newCheckText}
        onChange={(event) => onNewCheckText(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault();
            onAdd();
          }
        }}
        style={{ flex: 1, fontSize: '11.5px', padding: '5px 8px' }}
      />
      <button type="button" className="btn btn-secondary" onClick={onAdd} style={{ fontSize: '11.5px', padding: '5px 10px' }}>
        Добавить
      </button>
    </div>
  </div>
);
