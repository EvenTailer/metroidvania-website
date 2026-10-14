import React, { useState } from 'react';
import {
  AssetItem,
  AssetStage,
  probeGodotPath,
  PRIORITY_META,
  STAGE_META,
  STAGE_SEQUENCE,
  TYPE_META
} from '../../entities/asset-pipeline';
import { AssetMediaPreview } from './AssetMediaPreview';

interface AssetCardProps {
  asset: AssetItem;
  isSelected: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onAdvanceStage: () => void;
  onRevertStage: () => void;
  onSetStage: (stage: AssetStage) => void;
  onToggleChecklist: (checkId: string) => void;
  onShowToast: (msg: string) => void;
}

export const AssetCard: React.FC<AssetCardProps> = ({
  asset,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
  onAdvanceStage,
  onRevertStage,
  onSetStage,
  onToggleChecklist,
  onShowToast
}) => {
  const [showFullChecklist, setShowFullChecklist] = useState(false);
  const typeMeta = TYPE_META[asset.type];
  const stageMeta = STAGE_META[asset.stage];
  const priorityMeta = PRIORITY_META[asset.priority];

  const currentStageIndex = STAGE_SEQUENCE.indexOf(asset.stage);
  const isFirstStage = currentStageIndex <= 0;
  const isLastStage = currentStageIndex >= STAGE_SEQUENCE.length - 1;

  const completedChecks = asset.checklist.filter(c => c.completed).length;
  const totalChecks = asset.checklist.length;
  const checkPercent = totalChecks > 0 ? Math.round((completedChecks / totalChecks) * 100) : 0;

  const copyPath = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(asset.targetPath).then(() => {
      onShowToast(`Путь ${asset.targetPath} скопирован в буфер!`);
    });
  };

  return (
    <div
      draggable
      onDragStart={(event) => {
        event.dataTransfer.setData('text/plain', asset.id);
        event.dataTransfer.effectAllowed = 'move';
      }}
      onClick={onSelect}
      style={{
        background: 'rgba(15, 22, 38, 0.9)',
        border: isSelected
          ? '1px solid var(--accent-cyan)'
          : '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: isSelected
          ? '0 0 16px rgba(0, 242, 254, 0.25), 0 8px 24px rgba(0, 0, 0, 0.4)'
          : '0 4px 16px rgba(0, 0, 0, 0.25)',
        borderRadius: '10px',
        padding: '14px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        transition: 'all 0.2s ease',
        cursor: 'pointer',
        position: 'relative'
      }}
    >
      {/* Верхняя строка: тип, приоритет, автор */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '2px 8px',
              borderRadius: '6px',
              background: `${typeMeta.color}18`,
              color: typeMeta.color,
              border: `1px solid ${typeMeta.color}40`
            }}
          >
            <span>{typeMeta.icon}</span>
            <span>{typeMeta.ruTitle}</span>
          </span>

          <span
            style={{
              fontSize: '10px',
              fontWeight: 700,
              padding: '2px 6px',
              borderRadius: '4px',
              background: `${priorityMeta.color}15`,
              color: priorityMeta.color
            }}
          >
            {priorityMeta.badge}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '10.5px', color: 'var(--text-dim)' }}>{asset.author}</span>
          <button
            type="button"
            className="icon-btn"
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            title="Редактировать ассет"
            style={{ padding: '3px 6px', fontSize: '12px' }}
          >
            ✏️
          </button>
          <button
            type="button"
            className="icon-btn"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            title="Удалить ассет"
            style={{ padding: '3px 6px', fontSize: '12px', color: 'var(--accent-rose)' }}
          >
            🗑️
          </button>
        </div>
      </div>

      <AssetMediaPreview previewUrl={asset.previewUrl} />

      {/* Название и описание */}
      <div>
        <h4 style={{ margin: '0 0 4px', fontSize: '14px', fontWeight: 700, color: '#fff', lineHeight: 1.35 }}>
          {asset.title}
        </h4>
        {asset.description && (
          <p
            style={{
              margin: 0,
              fontSize: '11.5px',
              color: 'var(--text-muted)',
              lineHeight: 1.4,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}
          >
            {asset.description}
          </p>
        )}
      </div>

      {/* Путь res:// с кнопкой копирования */}
      <div
        onClick={copyPath}
        title="Кликните, чтобы скопировать путь в Godot"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(2, 6, 23, 0.7)',
          border: '1px dashed rgba(255, 255, 255, 0.12)',
          borderRadius: '6px',
          padding: '5px 8px',
          fontSize: '11px',
          fontFamily: 'monospace',
          color: 'var(--accent-cyan)',
          cursor: 'copy'
        }}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {asset.targetPath}
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', marginLeft: '6px' }}>
          <button
            type="button"
            title="Проверить, что файл есть в проекте Godot"
            onClick={(event) => {
              event.stopPropagation();
              probeGodotPath(asset.targetPath)
                .then(result => {
                  if (!result.configured) {
                    onShowToast('Корень Godot не задан. Положите путь к проекту в public/data/godot-project.path');
                    return;
                  }
                  onShowToast(result.exists
                    ? `Файл найден: ${asset.targetPath}`
                    : `Файла нет в проекте: ${asset.targetPath}`);
                })
                .catch(() => onShowToast('Не удалось проверить путь в проекте Godot'));
            }}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              fontSize: '10px',
              padding: 0
            }}
          >
            проверить
          </button>
          <span style={{ fontSize: '10px', opacity: 0.7 }}>📋</span>
        </span>
      </div>

      {(asset.dimensions || asset.format) && (
        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '-6px' }}>
          {[asset.dimensions, asset.format].filter(Boolean).join(' · ')}
        </div>
      )}

      {/* Интерактивная дорожка пайплайна (5 шагов) */}
      <div
        style={{
          background: 'rgba(2, 6, 23, 0.5)',
          borderRadius: '8px',
          padding: '8px 10px',
          border: '1px solid rgba(255, 255, 255, 0.05)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            Этап: <strong style={{ color: stageMeta.color }}>{stageMeta.icon} {stageMeta.ruTitle}</strong>
          </span>
          <span style={{ fontSize: '10px', color: 'var(--text-dim)' }}>
            Шаг {stageMeta.stepNumber} из 5
          </span>
        </div>

        {/* Степпер кружочков */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', position: 'relative' }}>
          {STAGE_SEQUENCE.map((stageKey, idx) => {
            const isDone = idx < currentStageIndex;
            const isCurrent = idx === currentStageIndex;
            const stepMeta = STAGE_META[stageKey];

            return (
              <React.Fragment key={stageKey}>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSetStage(stageKey);
                  }}
                  title={`Перейти на шаг: ${stepMeta.stepNumber}. ${stepMeta.ruTitle}`}
                  style={{
                    flex: '1',
                    height: '24px',
                    borderRadius: '4px',
                    border: isCurrent
                      ? `1.5px solid ${stepMeta.color}`
                      : isDone
                      ? '1px solid rgba(16, 185, 129, 0.4)'
                      : '1px solid rgba(255, 255, 255, 0.08)',
                    background: isCurrent
                      ? `${stepMeta.color}30`
                      : isDone
                      ? 'rgba(16, 185, 129, 0.15)'
                      : 'rgba(255, 255, 255, 0.03)',
                    color: isCurrent ? stepMeta.color : isDone ? '#10b981' : 'var(--text-dim)',
                    cursor: 'pointer',
                    fontSize: '11px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {isDone ? '✓' : stepMeta.icon}
                </button>
                {idx < STAGE_SEQUENCE.length - 1 && (
                  <div
                    style={{
                      width: '6px',
                      height: '2px',
                      background: idx < currentStageIndex ? 'var(--accent-emerald)' : 'rgba(255, 255, 255, 0.1)'
                    }}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Быстрые кнопки сдвига этапа */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <button
          type="button"
          className="btn btn-secondary"
          disabled={isFirstStage}
          onClick={(e) => {
            e.stopPropagation();
            onRevertStage();
          }}
          style={{ flex: '1', fontSize: '11px', padding: '5px 8px', minHeight: '30px' }}
        >
          ⬅ Назад
        </button>

        <button
          type="button"
          className={isLastStage ? 'btn btn-emerald' : 'btn btn-cyan'}
          disabled={isLastStage}
          onClick={(e) => {
            e.stopPropagation();
            onAdvanceStage();
          }}
          style={{ flex: '2', fontSize: '11px', padding: '5px 8px', minHeight: '30px', fontWeight: 700 }}
        >
          {isLastStage ? '✅ Готово в игре' : 'След. шаг ➔'}
        </button>
      </div>

      {/* Чек-лист микро-задач ассета */}
      {totalChecks > 0 && (
        <div
          style={{
            background: 'rgba(2, 6, 23, 0.4)',
            borderRadius: '6px',
            padding: '8px',
            border: '1px solid rgba(255, 255, 255, 0.05)'
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              userSelect: 'none'
            }}
            onClick={(e) => {
              e.stopPropagation();
              setShowFullChecklist(!showFullChecklist);
            }}
          >
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Чек-лист готовности:
            </span>
            <span
              style={{
                fontSize: '10.5px',
                fontWeight: 700,
                color: checkPercent === 100 ? 'var(--accent-emerald)' : 'var(--accent-cyan)'
              }}
            >
              {completedChecks}/{totalChecks} ({checkPercent}%)
              <span style={{ marginLeft: '4px', fontSize: '9px' }}>
                {showFullChecklist ? '▲' : '▼'}
              </span>
            </span>
          </div>

          {/* Превью полоски прогресса чек-листа */}
          <div
            style={{
              width: '100%',
              height: '4px',
              background: 'rgba(255, 255, 255, 0.08)',
              borderRadius: '2px',
              marginTop: '5px',
              overflow: 'hidden'
            }}
          >
            <div
              style={{
                width: `${checkPercent}%`,
                height: '100%',
                background: checkPercent === 100 ? 'var(--accent-emerald)' : 'var(--accent-cyan)',
                transition: 'width 0.25s ease'
              }}
            />
          </div>

          {showFullChecklist && (
            <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
              {asset.checklist.map((check) => (
                <label
                  key={check.id}
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '11px',
                    color: check.completed ? 'var(--text-muted)' : '#fff',
                    textDecoration: check.completed ? 'line-through' : 'none',
                    cursor: 'pointer'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={check.completed}
                    onChange={() => onToggleChecklist(check.id)}
                    style={{ accentColor: 'var(--accent-cyan)', cursor: 'pointer' }}
                  />
                  <span>{check.title}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Подсказка для Godot 4 */}
      {asset.godotTips && (
        <div
          style={{
            fontSize: '10.5px',
            color: '#93c5fd',
            background: 'rgba(30, 58, 138, 0.25)',
            borderLeft: '2px solid var(--accent-cyan)',
            padding: '5px 8px',
            borderRadius: '0 4px 4px 0',
            lineHeight: 1.35
          }}
        >
          <strong>Godot:</strong> {asset.godotTips}
        </div>
      )}

      {/* Теги */}
      {asset.tags && asset.tags.length > 0 && (
        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
          {asset.tags.map(tag => (
            <span
              key={tag}
              style={{
                fontSize: '10px',
                padding: '1px 6px',
                borderRadius: '4px',
                background: 'rgba(255, 255, 255, 0.05)',
                color: 'var(--text-muted)'
              }}
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
