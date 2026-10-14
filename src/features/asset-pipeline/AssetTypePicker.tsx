import React from 'react';
import { AssetType, TYPE_META } from '../../entities/asset-pipeline';

const TYPES: AssetType[] = ['tileset', 'character', 'ui', 'sfx', 'music'];

interface AssetTypePickerProps {
  type: AssetType;
  onChange: (type: AssetType) => void;
}

export const AssetTypePicker: React.FC<AssetTypePickerProps> = ({ type, onChange }) => (
  <div>
    <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>
      Тип ассета:
    </label>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '6px' }}>
      {TYPES.map(next => {
        const meta = TYPE_META[next];
        const isCurrent = type === next;
        return (
          <button
            key={next}
            type="button"
            onClick={() => onChange(next)}
            style={{
              padding: '8px 6px',
              borderRadius: '6px',
              border: isCurrent ? `1.5px solid ${meta.color}` : '1px solid var(--border)',
              background: isCurrent ? `${meta.color}20` : 'rgba(255, 255, 255, 0.03)',
              color: isCurrent ? meta.color : '#fff',
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <span style={{ fontSize: '16px' }}>{meta.icon}</span>
            <span>{meta.ruTitle}</span>
          </button>
        );
      })}
    </div>
  </div>
);
