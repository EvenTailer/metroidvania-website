import React from 'react';
import {
  AssetFilterState,
  AssetPriority,
  AssetSortBy,
  AssetStage,
  AssetType,
  PRIORITY_META,
  STAGE_META,
  STAGE_SEQUENCE,
  TYPE_META
} from '../../entities/asset-pipeline';

interface AssetFilterBarProps {
  filter: AssetFilterState;
  totalCount: number;
  integratedCount: number;
  inProgressCount: number;
  completionPercentage: number;
  typeCounts: Record<AssetType, number>;
  onFilterChange: (patch: Partial<AssetFilterState>) => void;
  onCreate: () => void;
  onOpenExport: () => void;
  onResetDefault: () => void;
  serverSync: boolean;
}

const ALL_TYPES: AssetType[] = ['tileset', 'character', 'ui', 'sfx', 'music'];

export const AssetFilterBar: React.FC<AssetFilterBarProps> = ({
  filter,
  totalCount,
  integratedCount,
  inProgressCount,
  completionPercentage,
  typeCounts,
  onFilterChange,
  onCreate,
  onOpenExport,
  onResetDefault,
  serverSync
}) => {
  return (
    <div
      style={{
        background: 'rgba(11, 16, 28, 0.85)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35)'
      }}
    >
      {/* Верхний ряд: Заголовок со сводкой и главными кнопками */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '10px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              borderRadius: '20px',
              background: 'rgba(0, 242, 254, 0.1)',
              border: '1px solid rgba(0, 242, 254, 0.25)'
            }}
          >
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Всего:</span>
            <strong style={{ fontSize: '13px', color: 'var(--accent-cyan)' }}>{totalCount}</strong>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              borderRadius: '20px',
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.25)'
            }}
          >
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>В игре:</span>
            <strong style={{ fontSize: '13px', color: 'var(--accent-emerald)' }}>{integratedCount}</strong>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              borderRadius: '20px',
              background: 'rgba(245, 158, 11, 0.1)',
              border: '1px solid rgba(245, 158, 11, 0.25)'
            }}
          >
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>В работе:</span>
            <strong style={{ fontSize: '13px', color: 'var(--accent-amber)' }}>{inProgressCount}</strong>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '4px 12px',
              borderRadius: '20px',
              background: 'linear-gradient(90deg, rgba(0, 242, 254, 0.15), rgba(168, 85, 247, 0.15))',
              border: '1px solid rgba(0, 242, 254, 0.3)'
            }}
          >
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Готовность:</span>
            <strong style={{ fontSize: '13px', color: '#fff' }}>{completionPercentage}%</strong>
            <div
              style={{
                width: '60px',
                height: '6px',
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '3px',
                overflow: 'hidden'
              }}
            >
              <div
                style={{
                  width: `${completionPercentage}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, var(--accent-cyan), var(--accent-emerald))',
                  transition: 'width 0.3s ease'
                }}
              />
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              borderRadius: '20px',
              background: serverSync ? 'rgba(16, 185, 129, 0.1)' : 'rgba(148, 163, 184, 0.12)',
              border: `1px solid ${serverSync ? 'rgba(16, 185, 129, 0.25)' : 'rgba(148, 163, 184, 0.3)'}`
            }}
          >
            <span style={{ fontSize: '11px', color: serverSync ? 'var(--accent-emerald)' : 'var(--text-muted)' }}>
              {serverSync ? 'Общий список' : 'Только этот браузер'}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn btn-primary"
            onClick={onCreate}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontWeight: 700,
              fontSize: '12.5px',
              padding: '7px 14px'
            }}
          >
            <span>+</span>
            <span>Новый ассет</span>
          </button>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={onOpenExport}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              padding: '7px 12px'
            }}
          >
            <span>💾</span>
            <span>Экспорт / Godot 4</span>
          </button>

          <button
            type="button"
            className="btn btn-ghost"
            onClick={onResetDefault}
            title="Сбросить список к демо-набору"
            style={{ fontSize: '11.5px', padding: '6px 10px', color: 'var(--text-dim)' }}
          >
            Демо
          </button>
        </div>
      </div>

      {/* Второй ряд: Фильтр по типам ассетов (чипсы с иконками) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
        <button
          type="button"
          className={`chip-btn ${filter.type === 'all' ? 'active' : ''}`}
          onClick={() => onFilterChange({ type: 'all' })}
          style={{ fontSize: '11.5px', padding: '5px 12px' }}
        >
          Все типы ({totalCount})
        </button>

        {ALL_TYPES.map(typeKey => {
          const meta = TYPE_META[typeKey];
          const count = typeCounts[typeKey] || 0;
          const isActive = filter.type === typeKey;
          return (
            <button
              key={typeKey}
              type="button"
              className={`chip-btn ${isActive ? 'active' : ''}`}
              onClick={() => onFilterChange({ type: typeKey })}
              style={{
                fontSize: '11.5px',
                padding: '5px 11px',
                borderColor: isActive ? meta.color : undefined,
                color: isActive ? meta.color : undefined
              }}
            >
              <span>{meta.icon}</span>
              <span>{meta.ruTitle}</span>
              <span
                style={{
                  fontSize: '10px',
                  opacity: 0.8,
                  background: 'rgba(255, 255, 255, 0.08)',
                  padding: '1px 5px',
                  borderRadius: '10px'
                }}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Третий ряд: Поиск, фильтр по этапу и сортировка */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          flexWrap: 'wrap',
          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
          paddingTop: '10px'
        }}
      >
        <div style={{ flex: '1 1 200px', position: 'relative' }}>
          <input
            type="text"
            className="field"
            placeholder="🔍 Поиск по названию, пути res:// или тегам..."
            value={filter.searchQuery}
            onChange={(e) => onFilterChange({ searchQuery: e.target.value })}
            style={{ width: '100%', fontSize: '12px', padding: '6px 10px' }}
          />
          {filter.searchQuery && (
            <button
              type="button"
              onClick={() => onFilterChange({ searchQuery: '' })}
              style={{
                position: 'absolute',
                right: '8px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: 'var(--text-dim)',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              ×
            </button>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>Этап:</span>
          <select
            className="field"
            value={filter.stage}
            onChange={(e) => onFilterChange({ stage: e.target.value as AssetStage | 'all' })}
            style={{ fontSize: '11.5px', padding: '5px 8px' }}
          >
            <option value="all">Все этапы</option>
            {STAGE_SEQUENCE.map(stageKey => (
              <option key={stageKey} value={stageKey}>
                {STAGE_META[stageKey].stepNumber}. {STAGE_META[stageKey].ruTitle}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>Приоритет:</span>
          <select
            className="field"
            value={filter.priority}
            onChange={(e) => onFilterChange({ priority: e.target.value as AssetPriority | 'all' })}
            style={{ fontSize: '11.5px', padding: '5px 8px' }}
          >
            <option value="all">Все</option>
            {(Object.keys(PRIORITY_META) as AssetPriority[]).map(key => (
              <option key={key} value={key}>{PRIORITY_META[key].ruTitle}</option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>Сортировка:</span>
          <select
            className="field"
            value={filter.sortBy}
            onChange={(e) => onFilterChange({ sortBy: e.target.value as AssetSortBy })}
            style={{ fontSize: '11.5px', padding: '5px 8px' }}
          >
            <option value="stage">По этапу пайплайна</option>
            <option value="priority">По приоритету</option>
            <option value="title">По названию (А-Я)</option>
            <option value="date-desc">Сначала новые</option>
          </select>
        </div>
      </div>
    </div>
  );
};
