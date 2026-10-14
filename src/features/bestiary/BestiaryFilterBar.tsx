import React from 'react';
import { BestiaryFilterState, EnemyType } from '../../entities/bestiary';
import { SectorInfo } from '../../entities/room-matrix';

interface BestiaryFilterBarProps {
  filter: BestiaryFilterState;
  sectors: SectorInfo[];
  totalCount: number;
  bossCount: number;
  readyCount: number;
  onFilterChange: (patch: Partial<BestiaryFilterState>) => void;
  onOpenCreateModal: () => void;
  onOpenExportModal: () => void;
  onResetToDefault: () => void;
}

const TYPE_TABS: { id: EnemyType | 'all'; label: string }[] = [
  { id: 'all', label: 'Все противники' },
  { id: 'boss', label: '👑 Боссы' },
  { id: 'miniboss', label: '⚡ Мини-боссы' },
  { id: 'elite', label: '🛡️ Элита' },
  { id: 'minion', label: '👾 Рядовые' }
];

export const BestiaryFilterBar: React.FC<BestiaryFilterBarProps> = ({
  filter,
  sectors,
  totalCount,
  bossCount,
  readyCount,
  onFilterChange,
  onOpenCreateModal,
  onOpenExportModal,
  onResetToDefault
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
      {/* Top Banner Stats and Main Actions */}
      <div
        className="panel"
        style={{
          padding: '12px 18px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          background: 'rgba(15, 23, 42, 0.75)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '20px' }}>👾</span>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '14px', fontWeight: 800, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Бестиарий & Combat Design
              </span>
              <span
                title="Сколько врагов в каталоге и сколько из них боссы или мини-боссы"
                style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: '12px',
                  background: 'rgba(0, 210, 255, 0.15)',
                  color: 'var(--accent-cyan)',
                  border: '1px solid rgba(0, 210, 255, 0.3)'
                }}
              >
                Всего: {totalCount} | Боссы и мини: {bossCount}
              </span>
              <span
                title="Готов = пять галочек на карточке: спрайт, скелет, хитбоксы, звук, тест в бою"
                style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: '12px',
                  background: 'rgba(16, 185, 129, 0.15)',
                  color: 'var(--accent-emerald)',
                  border: '1px solid rgba(16, 185, 129, 0.3)'
                }}
              >
                Готовы 5/5: {readyCount} / {totalCount}
              </span>
            </div>
            <p style={{ margin: '2px 0 0', fontSize: '11.5px', color: 'var(--text-muted)', maxWidth: '640px', lineHeight: 1.4 }}>
              «Править» открывает досье. Клик по карточке выбирает врага для файла .tres — у выбранного цветная рамка. Чип под «Где появляется» открывает комнату на карте. Голубая полоса у удара — его можно парировать, красная — нет. Пять галочек — что уже сделано в Godot.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onOpenExportModal}
            title="Скачать базу для Godot или загрузить JSON-копию каталога"
            style={{ fontSize: '11.5px', padding: '6px 12px' }}
          >
            Экспорт / импорт
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={onOpenCreateModal}
            style={{ fontSize: '11.5px', padding: '6px 14px' }}
          >
            + Новый враг / босс
          </button>
          <button
            type="button"
            className="chip-btn"
            onClick={onResetToDefault}
            style={{ fontSize: '11px', padding: '6px 10px', opacity: 0.6 }}
            title="Сбросить бестиарий к стандартному набору игры"
          >
            ⚠️ Сброс
          </button>
        </div>
      </div>

      {/* Filter Filters Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        {/* Type Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
          {TYPE_TABS.map(tab => {
            const isActive = filter.type === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                className={`chip-btn ${isActive ? 'active' : ''}`}
                onClick={() => onFilterChange({ type: tab.id })}
                style={{ fontSize: '11.5px', padding: '5px 12px' }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Sector and Status selectors & Search input */}
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          <select
            className="field"
            value={filter.sectorId}
            onChange={e => onFilterChange({ sectorId: e.target.value })}
            style={{ padding: '4px 10px', fontSize: '11.5px', width: 'auto' }}
          >
            <option value="all">Все сектора</option>
            {sectors.map(sec => (
              <option key={sec.id} value={sec.id}>
                {sec.code}: {sec.name}
              </option>
            ))}
          </select>

          <select
            className="field"
            value={filter.status}
            onChange={e => onFilterChange({ status: e.target.value as BestiaryFilterState['status'] })}
            style={{ padding: '4px 10px', fontSize: '11.5px', width: 'auto' }}
          >
            <option value="all">Любой статус</option>
            <option value="ready">✓ Все 5 галочек</option>
            <option value="in_progress">⚙️ Галочки не все</option>
          </select>

          <input
            type="text"
            className="field"
            placeholder="Имя, код, поведение или лор"
            value={filter.searchQuery}
            onChange={e => onFilterChange({ searchQuery: e.target.value })}
            style={{ padding: '5px 10px', fontSize: '11.5px', width: '190px' }}
          />
        </div>
      </div>
    </div>
  );
};
