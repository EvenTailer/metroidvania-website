import React, { useState } from 'react';
import { AssetItem } from '../../entities/asset-pipeline';
import {
  assetExportNote,
  BridgeConfigFile,
  CATEGORY_META,
  downloadConfigBundleZip,
  downloadConfigFile,
  FolderAccess,
  resolveAssetFiles,
  writeFilesToGodotDirectory
} from '../../entities/engine-bridge';
import { useGodotDirectory } from './useGodotDirectory';

interface FolderBridgeWidgetProps {
  files: BridgeConfigFile[];
  assets: AssetItem[];
  connectedFolderName: string | null;
  lastSyncAt: string | null;
  selectedFileIds: string[];
  onToggleFile: (id: string) => void;
  onToggleAllFiles: (ids: string[]) => void;
  onConnectedFolderChange: (name: string | null) => void;
  onFolderAccess: (access: FolderAccess) => void;
  onSyncComplete: () => void;
  onShowToast: (msg: string) => void;
}

function formatSyncAt(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('ru-RU');
}

export const FolderBridgeWidget: React.FC<FolderBridgeWidgetProps> = ({
  files,
  assets,
  connectedFolderName,
  lastSyncAt,
  selectedFileIds,
  onToggleFile,
  onToggleAllFiles,
  onConnectedFolderChange,
  onFolderAccess,
  onSyncComplete,
  onShowToast
}) => {
  const [previewFile, setPreviewFile] = useState<BridgeConfigFile | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const { dirHandle, pendingHandle, isFsaSupported, pickDirectory, allowDirectory } = useGodotDirectory(
    onConnectedFolderChange,
    onFolderAccess,
    onShowToast
  );

  const selectedCount = files.filter(f => selectedFileIds.includes(f.id)).length;
  const allSelected = files.length > 0 && selectedCount === files.length;

  const filesForExport = async () => {
    const activeFiles = files.filter(f => selectedFileIds.includes(f.id));
    const binaries = selectedFileIds.includes('asset_manifest') ? await resolveAssetFiles(assets) : [];
    return { activeFiles, binaries };
  };

  const handleDirectSync = async () => {
    if (!dirHandle) {
      onShowToast('Сначала подключите папку проекта Godot');
      return;
    }

    setIsSyncing(true);
    try {
      const { activeFiles, binaries } = await filesForExport();
      await writeFilesToGodotDirectory(dirHandle, [...activeFiles, ...binaries]);
      onSyncComplete();
      onShowToast(assetExportNote(activeFiles.length, binaries.length, assets.filter(item => item.targetPath.startsWith('res://')).length));
    } catch (err: unknown) {
      onShowToast(err instanceof Error ? err.message : 'Ошибка записи файлов в папку Godot');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleZipDownload = async () => {
    const { activeFiles, binaries } = await filesForExport();
    if (activeFiles.length === 0) {
      onShowToast('Выберите хотя бы один файл для скачивания');
      return;
    }
    downloadConfigBundleZip([...activeFiles, ...binaries]);
    onSyncComplete();
    onShowToast(assetExportNote(activeFiles.length, binaries.length, assets.filter(item => item.targetPath.startsWith('res://')).length));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Главный блок подключения к папке Godot */}
      <div
        style={{
          background: 'rgba(11, 16, 28, 0.95)',
          border: '1px solid rgba(0, 242, 254, 0.3)',
          borderRadius: '12px',
          padding: '16px 20px',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.4)',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '26px' }}>📁</span>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#fff' }}>
                  Локальный файловый мост с проектом Godot 4
                </h3>
                <span
                  style={{
                    fontSize: '10.5px',
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: '10px',
                    background: dirHandle ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                    color: dirHandle ? 'var(--accent-emerald)' : 'var(--accent-amber)',
                    border: `1px solid ${dirHandle ? 'var(--accent-emerald)' : 'var(--accent-amber)'}`
                  }}
                >
                  {dirHandle ? `● Подключено: ${connectedFolderName}` : pendingHandle ? `○ Нужно разрешение: ${connectedFolderName}` : '○ Папка не выбрана'}
                </span>
              </div>
              <p style={{ margin: '3px 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>
                Выгрузка баз данных мира, врагов, диалогов и скриптов прямо в структуру <code>res://data/</code> в один клик
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {isFsaSupported && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={pickDirectory}
                style={{ fontSize: '12px', padding: '6px 12px' }}
              >
                📂 {connectedFolderName ? 'Сменить папку проекта' : 'Выбрать папку Godot'}
              </button>
            )}

            {pendingHandle && !dirHandle && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={allowDirectory}
                style={{ fontSize: '12px', padding: '6px 12px' }}
              >
                Разрешить запись
              </button>
            )}

            {dirHandle && (
              <button
                type="button"
                className="btn btn-emerald"
                disabled={isSyncing || selectedCount === 0}
                onClick={handleDirectSync}
                style={{ fontSize: '12px', padding: '6px 14px', fontWeight: 700 }}
              >
                {isSyncing ? '⏳ Синхронизация...' : `⚡ Выгрузить ${selectedCount} файлов в res://`}
              </button>
            )}

            <button
              type="button"
              className="btn btn-primary"
              onClick={handleZipDownload}
              style={{ fontSize: '12px', padding: '6px 14px', fontWeight: 700 }}
              title="Скачать все выбранные конфиги одним архивом ZIP"
            >
              📦 Скачать пакетом (ZIP)
            </button>
          </div>
        </div>

        {/* Инфо-полоса с датой последней выгрузки */}
        <div
          style={{
            background: 'rgba(2, 6, 23, 0.6)',
            borderRadius: '8px',
            padding: '8px 12px',
            border: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '11.5px',
            color: 'var(--text-muted)',
            flexWrap: 'wrap',
            gap: '6px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>Выбрано файлов: <strong style={{ color: 'var(--accent-cyan)' }}>{selectedCount} из {files.length}</strong></span>
            <span>•</span>
            <button
              type="button"
              onClick={() => onToggleAllFiles(allSelected ? [] : files.map(file => file.id))}
              style={{ background: 'none', border: 'none', color: 'var(--accent-cyan)', cursor: 'pointer', fontSize: '11.5px', padding: 0 }}
            >
              {allSelected ? 'Снять все' : 'Выбрать все файлы'}
            </button>
          </div>

          {lastSyncAt && (
            <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
              Последняя синхронизация: {formatSyncAt(lastSyncAt)}
            </div>
          )}
        </div>
      </div>

      {/* Список файлов пакета для выгрузки в res:// */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '12px'
        }}
      >
        {files.map(file => {
          const isSelected = selectedFileIds.includes(file.id);
          const catMeta = CATEGORY_META[file.category];

          return (
            <div
              key={file.id}
              style={{
                background: isSelected ? 'rgba(15, 22, 38, 0.95)' : 'rgba(11, 16, 28, 0.65)',
                border: isSelected ? '1px solid rgba(0, 242, 254, 0.3)' : '1px solid rgba(255, 255, 255, 0.06)',
                borderRadius: '10px',
                padding: '12px 14px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onToggleFile(file.id)}
                    style={{ accentColor: 'var(--accent-cyan)', width: '15px', height: '15px', cursor: 'pointer' }}
                  />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '16px' }}>{file.icon}</span>
                    <strong style={{ fontSize: '13px', color: '#fff' }}>{file.filename}</strong>
                  </div>
                </label>

                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    padding: '2px 6px',
                    borderRadius: '4px',
                    background: `${catMeta.color}15`,
                    color: catMeta.color
                  }}
                >
                  {catMeta.ruTitle}
                </span>
              </div>

              {/* Целевой путь в структуре Godot */}
              <div
                style={{
                  background: 'rgba(2, 6, 23, 0.8)',
                  borderRadius: '6px',
                  padding: '4px 8px',
                  fontFamily: 'monospace',
                  fontSize: '11px',
                  color: 'var(--accent-cyan)',
                  border: '1px dashed rgba(0, 242, 254, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <span>{file.targetResPath}</span>
                <span style={{ fontSize: '10px', color: 'var(--text-dim)' }}>
                  {(file.fileSizeBytes / 1024).toFixed(1)} КБ
                </span>
              </div>

              <p style={{ margin: 0, fontSize: '11.5px', color: 'var(--text-muted)', lineHeight: '1.35' }}>
                {file.description}
              </p>
              <span style={{ fontSize: '10.5px', color: 'var(--accent-cyan)' }}>Источник: {file.sourceLabel}</span>

              {/* Действия с файлом */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px', marginTop: 'auto', paddingTop: '4px' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setPreviewFile(file)}
                  style={{ fontSize: '11px', padding: '3px 8px' }}
                >
                  👁 Просмотр
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    downloadConfigFile(file);
                    onShowToast(`Файл ${file.filename} скачан!`);
                  }}
                  style={{ fontSize: '11px', padding: '3px 8px' }}
                >
                  ⬇ Скачать
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Модальное окно предпросмотра содержимого файла */}
      {previewFile && (
        <div
          className="modal-backdrop"
          onClick={() => setPreviewFile(null)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0, 0, 0, 0.8)',
            zIndex: 1000
          }}
        >
          <div
            className="modal"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '720px',
              width: '94%',
              maxHeight: '85vh',
              display: 'flex',
              flexDirection: 'column',
              background: 'rgba(15, 22, 38, 0.98)',
              border: '1px solid var(--accent-cyan)',
              borderRadius: '12px',
              overflow: 'hidden'
            }}
          >
            <div className="modal-header" style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '20px' }}>{previewFile.icon}</span>
                <div>
                  <h3 style={{ margin: 0, fontSize: '15px', color: '#fff' }}>
                    {previewFile.filename}
                  </h3>
                  <span style={{ fontSize: '11px', color: 'var(--accent-cyan)', fontFamily: 'monospace' }}>
                    {previewFile.targetResPath}
                  </span>
                </div>
              </div>
              <button
                type="button"
                className="icon-btn"
                onClick={() => setPreviewFile(null)}
                style={{ fontSize: '18px', color: 'var(--text-dim)' }}
              >
                ✕
              </button>
            </div>

            <div style={{ padding: '16px', flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
              <textarea
                readOnly
                value={previewFile.content}
                style={{
                  flex: 1,
                  minHeight: '360px',
                  background: 'rgba(2, 6, 23, 0.95)',
                  border: '1px solid var(--border)',
                  borderRadius: '6px',
                  padding: '12px',
                  color: '#93c5fd',
                  fontFamily: 'monospace',
                  fontSize: '11.5px',
                  lineHeight: 1.45,
                  resize: 'none'
                }}
              />
            </div>

            <div
              className="modal-footer"
              style={{
                padding: '12px 20px',
                borderTop: '1px solid var(--border)',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '8px'
              }}
            >
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  navigator.clipboard.writeText(previewFile.content);
                  onShowToast(`Содержимое ${previewFile.filename} скопировано!`);
                }}
                style={{ fontSize: '12px' }}
              >
                Скопировать код
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  downloadConfigFile(previewFile);
                  onShowToast(`Файл ${previewFile.filename} скачан!`);
                }}
                style={{ fontSize: '12px' }}
              >
                Скачать {previewFile.filename}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
