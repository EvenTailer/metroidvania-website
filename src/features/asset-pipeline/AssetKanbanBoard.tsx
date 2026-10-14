import React, { useState } from 'react';
import {
  AssetItem,
  AssetStage,
  STAGE_META,
  STAGE_SEQUENCE
} from '../../entities/asset-pipeline';
import { AssetCard } from './AssetCard';

interface AssetKanbanBoardProps {
  assets: AssetItem[];
  selectedAssetId: string | null;
  onSelect: (id: string) => void;
  onEdit: (asset: AssetItem) => void;
  onDelete: (asset: AssetItem) => void;
  onAdvanceStage: (id: string) => void;
  onRevertStage: (id: string) => void;
  onSetStage: (id: string, stage: AssetStage) => void;
  onToggleChecklist: (assetId: string, checkId: string) => void;
  onShowToast: (message: string) => void;
}

export const AssetKanbanBoard: React.FC<AssetKanbanBoardProps> = ({
  assets,
  selectedAssetId,
  onSelect,
  onEdit,
  onDelete,
  onAdvanceStage,
  onRevertStage,
  onSetStage,
  onToggleChecklist,
  onShowToast
}) => {
  const [dropStage, setDropStage] = useState<AssetStage | null>(null);

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: '12px',
        alignItems: 'start'
      }}
    >
      {STAGE_SEQUENCE.map(stageKey => {
        const meta = STAGE_META[stageKey];
        const columnAssets = assets.filter(asset => asset.stage === stageKey);
        const active = dropStage === stageKey;
        return (
          <div
            key={stageKey}
            onDragOver={(event) => {
              event.preventDefault();
              setDropStage(stageKey);
            }}
            onDragLeave={() => setDropStage(current => (current === stageKey ? null : current))}
            onDrop={(event) => {
              event.preventDefault();
              setDropStage(null);
              const id = event.dataTransfer.getData('text/plain');
              if (id) onSetStage(id, stageKey);
            }}
            style={{
              background: active ? `${meta.color}12` : 'rgba(11, 16, 28, 0.75)',
              border: `1px solid ${active ? meta.color : `${meta.color}35`}`,
              borderRadius: '10px',
              padding: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              minHeight: '300px'
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                paddingBottom: '8px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>{meta.icon}</span>
                <span style={{ fontSize: '13px', fontWeight: 800, color: meta.color }}>{meta.ruTitle}</span>
              </div>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  background: `${meta.color}20`,
                  color: meta.color,
                  padding: '2px 7px',
                  borderRadius: '10px'
                }}
              >
                {columnAssets.length}
              </span>
            </div>
            {columnAssets.length === 0 ? (
              <div
                style={{
                  textAlign: 'center',
                  padding: '20px 10px',
                  color: 'var(--text-dim)',
                  fontSize: '11.5px',
                  border: '1px dashed rgba(255, 255, 255, 0.05)',
                  borderRadius: '6px'
                }}
              >
                Перетащите ассет сюда
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {columnAssets.map(item => (
                  <AssetCard
                    key={item.id}
                    asset={item}
                    isSelected={item.id === selectedAssetId}
                    onSelect={() => onSelect(item.id)}
                    onEdit={() => onEdit(item)}
                    onDelete={() => onDelete(item)}
                    onAdvanceStage={() => onAdvanceStage(item.id)}
                    onRevertStage={() => onRevertStage(item.id)}
                    onSetStage={(stage) => onSetStage(item.id, stage)}
                    onToggleChecklist={(checkId) => onToggleChecklist(item.id, checkId)}
                    onShowToast={onShowToast}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
