import React, { useMemo, useState } from 'react';
import {
  BestiaryFilterState,
  DEFAULT_ENEMIES,
  EnemyItem,
  ProductionChecklist
} from '../entities/bestiary';
import { RoomNode, SectorInfo } from '../entities/room-matrix';
import {
  BestiaryExportModal,
  BestiaryFilterBar,
  EnemyCard,
  EnemyEditModal
} from '../features/bestiary';
import { ConfirmModal } from '../shared/ui/ConfirmModal';

interface BestiaryPageProps {
  enemies: EnemyItem[];
  sectors: SectorInfo[];
  rooms: RoomNode[];
  filter: BestiaryFilterState;
  selectedEnemyId: string | null;
  onFilterChange: (patch: Partial<BestiaryFilterState>) => void;
  onSelectEnemy: (id: string) => void;
  onAddEnemy: (enemy: EnemyItem) => void;
  onUpdateEnemy: (enemy: EnemyItem) => void;
  onRemoveEnemy: (id: string) => void;
  onToggleChecklist: (enemyId: string, step: keyof ProductionChecklist) => void;
  onImportEnemies: (enemies: EnemyItem[]) => void;
  onOpenRoom: (roomId: string) => void;
  onResetToDefault: () => void;
  onShowToast: (msg: string) => void;
}

export const BestiaryPage: React.FC<BestiaryPageProps> = ({
  enemies,
  sectors,
  rooms,
  filter,
  selectedEnemyId,
  onFilterChange,
  onSelectEnemy,
  onAddEnemy,
  onUpdateEnemy,
  onRemoveEnemy,
  onToggleChecklist,
  onImportEnemies,
  onOpenRoom,
  onResetToDefault,
  onShowToast
}) => {
  const [editingEnemy, setEditingEnemy] = useState<EnemyItem | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [enemyToDelete, setEnemyToDelete] = useState<EnemyItem | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [selectedEnemyForExport, setSelectedEnemyForExport] = useState<EnemyItem | null>(null);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  // Sector map for quick name lookups
  const sectorMap = useMemo(() => {
    const map = new Map<string, SectorInfo>();
    sectors.forEach(s => map.set(s.id, s));
    return map;
  }, [sectors]);

  // Counts for header stats
  const totalCount = enemies.length;
  const bossCount = useMemo(() => enemies.filter(e => e.type === 'boss' || e.type === 'miniboss').length, [enemies]);
  const readyCount = useMemo(
    () => enemies.filter(e => Object.values(e.checklist).filter(Boolean).length === 5).length,
    [enemies]
  );

  // Filtered enemies
  const filteredEnemies = useMemo(() => {
    return enemies.filter(enemy => {
      // Search
      if (filter.searchQuery.trim()) {
        const q = filter.searchQuery.toLowerCase();
        const matchName = enemy.name.toLowerCase().includes(q);
        const matchCode = enemy.code.toLowerCase().includes(q);
        const matchDesc = enemy.description.toLowerCase().includes(q);
        const matchLore = enemy.lore.toLowerCase().includes(q);
        if (!matchName && !matchCode && !matchDesc && !matchLore) return false;
      }

      if (filter.type !== 'all' && enemy.type !== filter.type) {
        return false;
      }

      if (filter.sectorId !== 'all' && enemy.sectorId !== filter.sectorId) {
        return false;
      }

      if (filter.status !== 'all') {
        const stepsDone = Object.values(enemy.checklist).filter(Boolean).length;
        if (filter.status === 'ready' && stepsDone < 5) return false;
        if (filter.status === 'in_progress' && stepsDone === 5) return false;
      }

      return true;
    });
  }, [enemies, filter]);

  const handleSaveEnemy = (saved: EnemyItem) => {
    const exists = enemies.some(e => e.id === saved.id);
    if (exists) {
      onUpdateEnemy(saved);
      onShowToast(`Враг «${saved.name}» обновлен`);
    } else {
      onAddEnemy(saved);
      onShowToast(`Враг «${saved.name}» добавлен в бестиарий`);
    }
  };

  const handleConfirmDelete = () => {
    if (!enemyToDelete) return;
    onRemoveEnemy(enemyToDelete.id);
    onShowToast(`Враг «${enemyToDelete.name}» удален`);
    setEnemyToDelete(null);
  };

  const handleConfirmReset = () => {
    onResetToDefault();
    onShowToast('Бестиарий сброшен к эталонной базе мобов Godot 4');
    setIsResetConfirmOpen(false);
  };

  const handleCopyScenePath = (path: string) => {
    navigator.clipboard.writeText(path).then(() => {
      onShowToast(`Путь сцены скопирован: ${path}`);
    });
  };

  return (
    <div className="view-content" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Header and Filter Controls */}
      <BestiaryFilterBar
        filter={filter}
        sectors={sectors}
        totalCount={totalCount}
        bossCount={bossCount}
        readyCount={readyCount}
        onFilterChange={onFilterChange}
        onOpenCreateModal={() => setIsCreateModalOpen(true)}
        onOpenExportModal={() => {
          const current = enemies.find(e => e.id === selectedEnemyId) || null;
          setSelectedEnemyForExport(current);
          setIsExportModalOpen(true);
        }}
        onResetToDefault={() => setIsResetConfirmOpen(true)}
      />

      {/* Grid of Enemy Cards */}
      {filteredEnemies.length === 0 ? (
        <div className="empty-panel" style={{ padding: '48px 24px', textAlign: 'center' }}>
          <div style={{ fontSize: '36px', marginBottom: '8px' }}>🔍</div>
          <h4 style={{ margin: '0 0 6px' }}>Противники не найдены</h4>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: '0 0 16px' }}>
            Попробуйте изменить параметры поиска, сектора или фильтры готовности.
          </p>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => onFilterChange({ searchQuery: '', type: 'all', sectorId: 'all', status: 'all' })}
          >
            Сбросить фильтры
          </button>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
            gap: '14px',
            alignItems: 'start'
          }}
        >
          {filteredEnemies.map(enemy => (
            <EnemyCard
              key={enemy.id}
              enemy={enemy}
              sector={sectorMap.get(enemy.sectorId)}
              rooms={rooms}
              isSelected={enemy.id === selectedEnemyId}
              onSelect={() => onSelectEnemy(enemy.id)}
              onEdit={() => setEditingEnemy(enemy)}
              onDelete={() => setEnemyToDelete(enemy)}
              onToggleChecklist={step => onToggleChecklist(enemy.id, step)}
              onCopyScenePath={handleCopyScenePath}
              onOpenRoom={onOpenRoom}
            />
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      {(isCreateModalOpen || editingEnemy) && (
        <EnemyEditModal
          enemy={editingEnemy}
          sectors={sectors}
          rooms={rooms}
          onSave={handleSaveEnemy}
          onClose={() => {
            setIsCreateModalOpen(false);
            setEditingEnemy(null);
          }}
        />
      )}

      {/* Export to Godot 4 Modal */}
      {isExportModalOpen && (
        <BestiaryExportModal
          enemies={enemies}
          selectedEnemy={selectedEnemyForExport}
          onClose={() => setIsExportModalOpen(false)}
          onShowToast={onShowToast}
          onImport={onImportEnemies}
        />
      )}

      {/* Confirm Delete Enemy Modal */}
      <ConfirmModal
        isOpen={Boolean(enemyToDelete)}
        title="Удаление моба / босса"
        message={`Вы уверены, что хотите удалить «${enemyToDelete?.name}» (${enemyToDelete?.code})? Это действие нельзя отменить.`}
        confirmText="Удалить противника"
        cancelText="Отмена"
        danger={true}
        onConfirm={handleConfirmDelete}
        onClose={() => setEnemyToDelete(null)}
      />

      {/* Confirm Reset to Defaults Modal */}
      <ConfirmModal
        isOpen={isResetConfirmOpen}
        title="Сброс бестиария к эталону"
        message={`Сбросить все карточки, фазы и галочки к эталонному набору (${DEFAULT_ENEMIES.length} врагов)? Текущие правки пропадут.`}
        confirmText="Сбросить бестиарий"
        cancelText="Отмена"
        danger={true}
        onConfirm={handleConfirmReset}
        onClose={() => setIsResetConfirmOpen(false)}
      />
    </div>
  );
};
