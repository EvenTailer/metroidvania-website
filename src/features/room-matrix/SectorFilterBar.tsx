import React from 'react';
import { SectorInfo } from '../../entities/room-matrix';

interface SectorFilterBarProps {
  sectors: SectorInfo[];
  activeSectorId: string | 'all';
  onSelectSector: (id: string | 'all') => void;
  onOpenCreateModal: () => void;
  onOpenStatsModal: () => void;
  onOpenExportModal: () => void;
  onResetToDefault: () => void;
}

export const SectorFilterBar: React.FC<SectorFilterBarProps> = ({
  sectors,
  activeSectorId,
  onSelectSector,
  onOpenCreateModal,
  onOpenStatsModal,
  onOpenExportModal,
  onResetToDefault
}) => {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px',
        marginBottom: '16px'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
        <button
          type="button"
          className={`chip-btn ${activeSectorId === 'all' ? 'active' : ''}`}
          onClick={() => onSelectSector('all')}
          style={{ fontSize: '11.5px', padding: '5px 12px' }}
        >
          Все сектора
        </button>
        {sectors.map(sec => {
          const isActive = activeSectorId === sec.id;
          return (
            <button
              key={sec.id}
              type="button"
              className={`chip-btn ${isActive ? 'active' : ''}`}
              onClick={() => onSelectSector(sec.id)}
              style={{
                fontSize: '11.5px',
                padding: '5px 12px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                borderLeft: `3px solid ${sec.color}`
              }}
            >
              <span>{sec.code}</span>
            </button>
          );
        })}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={onOpenStatsModal}
          style={{ fontSize: '11.5px', padding: '6px 12px' }}
        >
          📊 Метрики
        </button>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={onOpenExportModal}
          style={{ fontSize: '11.5px', padding: '6px 12px' }}
        >
          💾 Экспорт в Godot 4
        </button>
        <button
          type="button"
          className="btn btn-primary"
          onClick={onOpenCreateModal}
          style={{ fontSize: '11.5px', padding: '6px 14px' }}
        >
          + Новая комната
        </button>
        <button
          type="button"
          className="chip-btn"
          onClick={onResetToDefault}
          style={{ fontSize: '11px', padding: '6px 10px', opacity: 0.6 }}
          title="Сбросить карту на дефолтную схему игры"
        >
          ⚠️ Сброс
        </button>
      </div>
    </div>
  );
};
