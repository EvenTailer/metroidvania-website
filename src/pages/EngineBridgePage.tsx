import React, { useEffect, useMemo, useState } from 'react';
import {
  BridgeConfigFile,
  BuildFilterState,
  BuildRelease,
  EngineBridgeState,
  FolderAccess,
  generateFullConfigBundle
} from '../entities/engine-bridge';
import { PlatformerPhysicsParams, StateMachineState } from '../entities/gdscript-generator';
import { AssetItem } from '../entities/asset-pipeline';
import {
  FolderBridgeWidget,
  BuildTrackerWidget,
  BuildEditModal,
  ReleaseChecklistBanner
} from '../features/engine-bridge';
import { ConfirmModal } from '../shared/ui/ConfirmModal';

type BridgeTab = 'bridge' | 'builds';

interface EngineBridgePageProps {
  engineBridge: EngineBridgeState;
  roomMatrix: unknown;
  bestiary: unknown;
  narrative: unknown;
  physicsParams: PlatformerPhysicsParams;
  states: StateMachineState[];
  assets: AssetItem[];
  tasks: { id: string; title: string }[];
  bugs: { id: string; title: string }[];
  onAddBuild: (build: BuildRelease) => void;
  onUpdateBuild: (build: BuildRelease) => void;
  onRemoveBuild: (id: string) => void;
  onSelectBuild: (id: string | null) => void;
  onFilterChange: (patch: Partial<BuildFilterState>) => void;
  onToggleConfigFile: (id: string) => void;
  onToggleAllConfigFiles: (ids: string[]) => void;
  onDiscoverConfigFiles: (ids: string[]) => void;
  onConnectedFolderChange: (name: string | null) => void;
  onFolderAccess: (access: FolderAccess) => void;
  onToggleChecklist: (id: string) => void;
  onSyncComplete: () => void;
  onShowToast: (msg: string) => void;
}

export const EngineBridgePage: React.FC<EngineBridgePageProps> = ({
  engineBridge,
  roomMatrix,
  bestiary,
  narrative,
  physicsParams,
  states,
  assets,
  tasks,
  bugs,
  onAddBuild,
  onUpdateBuild,
  onRemoveBuild,
  onSelectBuild,
  onFilterChange,
  onToggleConfigFile,
  onToggleAllConfigFiles,
  onDiscoverConfigFiles,
  onConnectedFolderChange,
  onFolderAccess,
  onToggleChecklist,
  onSyncComplete,
  onShowToast
}) => {
  const [activeTab, setActiveTab] = useState<BridgeTab>('bridge');
  const [pendingDelete, setPendingDelete] = useState<BuildRelease | null>(null);

  // Модалка создания/редактирования сборки
  const [isBuildModalOpen, setIsBuildModalOpen] = useState(false);
  const [editingBuild, setEditingBuild] = useState<BuildRelease | null>(null);

  // Динамическая генерация актуальных файлов из текущих сторов
  const generatedFiles: BridgeConfigFile[] = useMemo(() => {
    return generateFullConfigBundle({
      roomMatrix,
      bestiary,
      narrative,
      physicsParams,
      states,
      assets
    });
  }, [roomMatrix, bestiary, narrative, physicsParams, states, assets]);

  const generatedFileIds = generatedFiles.map(file => file.id).join('\0');
  useEffect(() => {
    onDiscoverConfigFiles(generatedFileIds.split('\0').filter(Boolean));
  }, [generatedFileIds, onDiscoverConfigFiles]);

  const handleSaveBuild = (build: BuildRelease) => {
    if (editingBuild) {
      onUpdateBuild(build);
    } else {
      onAddBuild(build);
    }
    setIsBuildModalOpen(false);
    setEditingBuild(null);
    onShowToast(`Сборка ${build.version} успешно сохранена!`);
  };

  const handleDeleteBuild = (build: BuildRelease) => {
    setPendingDelete(build);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: '32px' }}>
      {/* Верхний чек-лист готовности */}
      <ReleaseChecklistBanner
        completed={engineBridge.releaseChecklist}
        onToggle={onToggleChecklist}
      />

      {/* Переключатель основных вкладок */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          background: 'rgba(11, 16, 28, 0.75)',
          padding: '8px 14px',
          borderRadius: '10px',
          border: '1px solid var(--border)'
        }}
      >
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            className={`btn ${activeTab === 'bridge' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('bridge')}
            style={{ fontSize: '12.5px', padding: '6px 14px', fontWeight: 700 }}
          >
            📁 Файловый мост Godot (res://data/)
          </button>
          <button
            type="button"
            className={`btn ${activeTab === 'builds' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('builds')}
            style={{ fontSize: '12.5px', padding: '6px 14px', fontWeight: 700 }}
          >
            🚀 Трекер билдов и релизов ({engineBridge.builds.length})
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: 'var(--text-muted)' }}>
          <span>Проект Godot:</span>
          <span
            style={{
              color: engineBridge.folderAccess === 'ready' ? 'var(--accent-emerald)' : 'var(--text-dim)',
              fontFamily: 'monospace',
              fontWeight: 700
            }}
          >
            {engineBridge.folderAccess === 'ready' && engineBridge.connectedFolderName
              ? `res://${engineBridge.connectedFolderName}`
              : engineBridge.folderAccess === 'prompt' && engineBridge.connectedFolderName
                ? `${engineBridge.connectedFolderName}: нужно разрешение`
                : 'Папка не подключена'}
          </span>
        </div>
      </div>

      {/* Содержимое активной вкладки */}
      {activeTab === 'bridge' ? (
        <FolderBridgeWidget
          files={generatedFiles}
          assets={assets}
          connectedFolderName={engineBridge.connectedFolderName}
          lastSyncAt={engineBridge.lastBridgeSyncAt}
          selectedFileIds={engineBridge.selectedConfigFileIds}
          onToggleFile={onToggleConfigFile}
          onToggleAllFiles={onToggleAllConfigFiles}
          onConnectedFolderChange={onConnectedFolderChange}
          onFolderAccess={onFolderAccess}
          onSyncComplete={onSyncComplete}
          onShowToast={onShowToast}
        />
      ) : (
        <BuildTrackerWidget
          builds={engineBridge.builds}
          tasks={tasks}
          bugs={bugs}
          filter={engineBridge.buildFilter}
          selectedBuildId={engineBridge.selectedBuildId}
          onFilterChange={onFilterChange}
          onSelectBuild={onSelectBuild}
          onCreateBuild={() => {
            setEditingBuild(null);
            setIsBuildModalOpen(true);
          }}
          onEditBuild={(build) => {
            setEditingBuild(build);
            setIsBuildModalOpen(true);
          }}
          onDeleteBuild={handleDeleteBuild}
          onShowToast={onShowToast}
        />
      )}

      {/* Модальное окно создания/редактирования сборки */}
      {isBuildModalOpen && (
        <BuildEditModal
          initialBuild={editingBuild}
          tasks={tasks}
          bugs={bugs}
          onSave={handleSaveBuild}
          onClose={() => {
            setIsBuildModalOpen(false);
            setEditingBuild(null);
          }}
        />
      )}

      <ConfirmModal
        isOpen={Boolean(pendingDelete)}
        title="Удаление сборки"
        message={pendingDelete ? `Запись ${pendingDelete.version} исчезнет из трекера.` : ''}
        confirmText="Удалить"
        danger
        onConfirm={() => {
          if (!pendingDelete) return;
          onRemoveBuild(pendingDelete.id);
          onShowToast(`Сборка ${pendingDelete.version} удалена`);
          setPendingDelete(null);
        }}
        onClose={() => setPendingDelete(null)}
      />
    </div>
  );
};
