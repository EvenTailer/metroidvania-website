import React, { useMemo, useState } from 'react';
import {
  AssetFilterState,
  AssetItem,
  AssetStage,
  AssetType,
  canEnterStage,
  pipelineReadiness,
  PRIORITY_META,
  STAGE_SEQUENCE
} from '../entities/asset-pipeline';
import { GalleryItem } from '../entities/gallery';
import {
  AssetCard,
  AssetEditModal,
  AssetExportModal,
  AssetFilterBar,
  AssetKanbanBoard,
  AssetPipelineStageGuide
} from '../features/asset-pipeline';
import { deleteScreenshotIdb } from '../shared/lib/indexedDbStorage';
import { ConfirmModal } from '../shared/ui/ConfirmModal';

interface AssetPipelinePageProps {
  assets: AssetItem[];
  filter: AssetFilterState;
  selectedAssetId: string | null;
  authorName: string;
  serverSync: boolean;
  onFilterChange: (patch: Partial<AssetFilterState>) => void;
  onSelectAsset: (id: string | null) => void;
  onAddAsset: (asset: AssetItem) => void;
  onUpdateAsset: (asset: AssetItem) => void;
  onRemoveAsset: (id: string) => void;
  onAdvanceStage: (id: string) => void;
  onRevertStage: (id: string) => void;
  onSetStage: (id: string, stage: AssetStage) => void;
  onToggleChecklist: (assetId: string, checkId: string) => void;
  onImportAssets: (items: AssetItem[]) => void;
  onResetDefault: () => void;
  onShowToast: (message: string) => void;
  onGalleryItem: (item: GalleryItem) => void;
}

export const AssetPipelinePage: React.FC<AssetPipelinePageProps> = ({
  assets,
  filter,
  selectedAssetId,
  authorName,
  serverSync,
  onFilterChange,
  onSelectAsset,
  onAddAsset,
  onUpdateAsset,
  onRemoveAsset,
  onAdvanceStage,
  onRevertStage,
  onSetStage,
  onToggleChecklist,
  onImportAssets,
  onResetDefault,
  onShowToast,
  onGalleryItem
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'kanban'>('grid');
  const [editingAsset, setEditingAsset] = useState<AssetItem | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<AssetItem | null>(null);
  const [pendingReset, setPendingReset] = useState(false);

  const refuseIntegrated = (asset: AssetItem | undefined, stage: AssetStage) => {
    if (!asset || canEnterStage(asset, stage)) return false;
    onShowToast('В игру можно перевести только когда чек-лист заполнен целиком');
    return true;
  };

  const requestStage = (id: string, stage: AssetStage) => {
    const asset = assets.find(item => item.id === id);
    if (refuseIntegrated(asset, stage)) return;
    onSetStage(id, stage);
  };

  const requestAdvance = (id: string) => {
    const asset = assets.find(item => item.id === id);
    if (!asset) return;
    const index = STAGE_SEQUENCE.indexOf(asset.stage);
    const next = STAGE_SEQUENCE[index + 1];
    if (next && refuseIntegrated(asset, next)) return;
    onAdvanceStage(id);
  };

  // Фильтрация
  const filtered = useMemo(() => {
    return assets.filter(item => {
      if (filter.type !== 'all' && item.type !== filter.type) return false;
      if (filter.stage !== 'all' && item.stage !== filter.stage) return false;
      if (filter.priority !== 'all' && item.priority !== filter.priority) return false;
      if (filter.searchQuery.trim()) {
        const q = filter.searchQuery.toLowerCase().trim();
        const haystack = [
          item.title,
          item.targetPath,
          item.description,
          item.author,
          item.godotTips,
          ...(item.tags || [])
        ].join(' ').toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [assets, filter]);

  // Сортировка
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      switch (filter.sortBy) {
        case 'stage': {
          const diff = STAGE_SEQUENCE.indexOf(a.stage) - STAGE_SEQUENCE.indexOf(b.stage);
          return diff !== 0 ? diff : b.updatedAt.localeCompare(a.updatedAt);
        }
        case 'priority': {
          const diff = PRIORITY_META[a.priority].order - PRIORITY_META[b.priority].order;
          return diff !== 0 ? diff : b.updatedAt.localeCompare(a.updatedAt);
        }
        case 'title':
          return a.title.localeCompare(b.title);
        case 'date-desc':
          return b.updatedAt.localeCompare(a.updatedAt);
        default:
          return 0;
      }
    });
  }, [filtered, filter.sortBy]);

  // Сводные метрики
  const totalCount = assets.length;
  const integratedCount = assets.filter(a => a.stage === 'integrated').length;
  const inProgressCount = totalCount - integratedCount;
  const completionPercentage = pipelineReadiness(assets);

  const typeCounts = useMemo(() => {
    const counts: Record<AssetType, number> = {
      tileset: 0,
      character: 0,
      ui: 0,
      sfx: 0,
      music: 0
    };
    assets.forEach(a => {
      if (counts[a.type] !== undefined) counts[a.type]++;
    });
    return counts;
  }, [assets]);

  const handleSave = (item: AssetItem) => {
    if (editingAsset) {
      onUpdateAsset(item);
      onShowToast(`Ассет «${item.title}» обновлен`);
    } else {
      onAddAsset(item);
      onShowToast(`Ассет «${item.title}» добавлен в пайплайн`);
    }
    setEditingAsset(null);
    setIsCreating(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Главный заголовок страницы */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '24px' }}>🎨</span>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#fff' }}>
              Пайплайн ассетов (Asset Pipeline Checklist)
            </h2>
          </div>
          <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>
            Трекинг графики и звука от наброска до игры: Концепт → Пиксель-арт → Нарезка атласа → Импорт в Godot → Интеграция
          </p>
        </div>

        {/* Переключатель вида: Карточки / Канбан-доска */}
        <div
          style={{
            display: 'flex',
            background: 'rgba(2, 6, 23, 0.6)',
            padding: '3px',
            borderRadius: '8px',
            border: '1px solid var(--border)'
          }}
        >
          <button
            type="button"
            onClick={() => setViewMode('grid')}
            style={{
              padding: '5px 12px',
              borderRadius: '6px',
              border: 'none',
              background: viewMode === 'grid' ? 'var(--accent-cyan)' : 'none',
              color: viewMode === 'grid' ? '#000' : 'var(--text-muted)',
              fontSize: '11.5px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}
          >
            <span>▦</span>
            <span>Сетка карточек</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('kanban')}
            style={{
              padding: '5px 12px',
              borderRadius: '6px',
              border: 'none',
              background: viewMode === 'kanban' ? 'var(--accent-cyan)' : 'none',
              color: viewMode === 'kanban' ? '#000' : 'var(--text-muted)',
              fontSize: '11.5px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}
          >
            <span>☷</span>
            <span>Доска этапов</span>
          </button>
        </div>
      </div>

      {/* Обучающая шпаргалка пайплайна */}
      <AssetPipelineStageGuide />

      {/* Панель фильтров и действий */}
      <AssetFilterBar
        filter={filter}
        totalCount={totalCount}
        integratedCount={integratedCount}
        inProgressCount={inProgressCount}
        completionPercentage={completionPercentage}
        typeCounts={typeCounts}
        onFilterChange={onFilterChange}
        onCreate={() => {
          setEditingAsset(null);
          setIsCreating(true);
        }}
        onOpenExport={() => setIsExportOpen(true)}
        onResetDefault={() => setPendingReset(true)}
        serverSync={serverSync}
      />

      {/* Содержимое: либо Grid, либо Kanban по 5 этапам */}
      {sorted.length === 0 ? (
        <div
          className="panel"
          style={{
            padding: '40px 20px',
            textAlign: 'center',
            background: 'rgba(11, 16, 28, 0.65)',
            borderRadius: '12px',
            border: '1px dashed var(--border)'
          }}
        >
          <span style={{ fontSize: '32px', display: 'block', marginBottom: '8px' }}>🔍</span>
          <p style={{ margin: '0 0 12px', fontSize: '14px', color: '#cbd5e1' }}>
            Ассетов по выбранным фильтрам не найдено.
          </p>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() =>
              onFilterChange({
                type: 'all',
                stage: 'all',
                priority: 'all',
                searchQuery: '',
                sortBy: 'stage'
              })
            }
          >
            Сбросить все фильтры
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))',
            gap: '14px',
            alignItems: 'start'
          }}
        >
          {sorted.map(item => (
            <AssetCard
              key={item.id}
              asset={item}
              isSelected={item.id === selectedAssetId}
              onSelect={() => onSelectAsset(item.id)}
              onEdit={() => setEditingAsset(item)}
              onDelete={() => setPendingDelete(item)}
              onAdvanceStage={() => requestAdvance(item.id)}
              onRevertStage={() => onRevertStage(item.id)}
              onSetStage={(stage) => requestStage(item.id, stage)}
              onToggleChecklist={(checkId) => onToggleChecklist(item.id, checkId)}
              onShowToast={onShowToast}
            />
          ))}
        </div>
      ) : (
        <AssetKanbanBoard
          assets={sorted}
          selectedAssetId={selectedAssetId}
          onSelect={onSelectAsset}
          onEdit={setEditingAsset}
          onDelete={setPendingDelete}
          onAdvanceStage={requestAdvance}
          onRevertStage={onRevertStage}
          onSetStage={requestStage}
          onToggleChecklist={onToggleChecklist}
          onShowToast={onShowToast}
        />
      )}

      {/* Модалка создания / редактирования */}
      {(isCreating || editingAsset) && (
        <AssetEditModal
          asset={editingAsset}
          authorName={authorName}
          onSave={handleSave}
          onClose={() => {
            setIsCreating(false);
            setEditingAsset(null);
          }}
          onError={onShowToast}
          onGalleryItem={onGalleryItem}
        />
      )}

      {/* Модалка экспорта / GDScript манифеста */}
      {isExportOpen && (
        <AssetExportModal
          assets={assets}
          onImportAssets={onImportAssets}
          onClose={() => setIsExportOpen(false)}
          onShowToast={onShowToast}
        />
      )}

      {/* Модалка подтверждения удаления */}
      <ConfirmModal
        isOpen={Boolean(pendingDelete)}
        title="Удаление ассета"
        message={`Удалить ассет «${pendingDelete?.title}» из пайплайна? Задачи и чек-лист будут удалены.`}
        confirmText="Удалить ассет"
        cancelText="Отмена"
        danger
        onConfirm={() => {
          if (!pendingDelete) return;
          if (pendingDelete.previewUrl?.startsWith('idb:')) {
            deleteScreenshotIdb(pendingDelete.previewUrl.slice(4)).catch(() => {});
          }
          onRemoveAsset(pendingDelete.id);
          onShowToast(`Ассет «${pendingDelete.title}» удален`);
          setPendingDelete(null);
        }}
        onClose={() => setPendingDelete(null)}
      />
      <ConfirmModal
        isOpen={pendingReset}
        title="Сброс к демо-набору"
        message="Текущий список ассетов будет заменён демо-набором на этом браузере и в общем списке."
        confirmText="Сбросить"
        cancelText="Отмена"
        danger
        onConfirm={() => {
          onResetDefault();
          onShowToast('Пайплайн ассетов сброшен к демо-набору');
          setPendingReset(false);
        }}
        onClose={() => setPendingReset(false)}
      />
    </div>
  );
};
