import React, { useMemo, useState } from 'react';
import {
  AssetItem,
  downloadGodotAssetManifest,
  exportAssetsToJson,
  formatAssetsSummaryMarkdown,
  generateGodotAssetManifest,
  parseAssetsFromJson
} from '../../entities/asset-pipeline';

interface AssetExportModalProps {
  assets: AssetItem[];
  onImportAssets: (items: AssetItem[]) => void;
  onClose: () => void;
  onShowToast: (msg: string) => void;
}

type TabType = 'gdscript' | 'json' | 'markdown' | 'import';

export const AssetExportModal: React.FC<AssetExportModalProps> = ({
  assets,
  onImportAssets,
  onClose,
  onShowToast
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('gdscript');
  const [importError, setImportError] = useState<string | null>(null);

  const gdscriptCode = useMemo(() => generateGodotAssetManifest(assets), [assets]);
  const jsonCode = useMemo(() => JSON.stringify(assets, null, 2), [assets]);
  const markdownText = useMemo(() => formatAssetsSummaryMarkdown(assets), [assets]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      onShowToast(`${label} скопирован в буфер обмена!`);
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const text = String(reader.result || '');
        const items = parseAssetsFromJson(text);
        onImportAssets(items);
        onShowToast(`Успешно импортировано ${items.length} ассетов!`);
        onClose();
      } catch (err) {
        setImportError(err instanceof Error ? err.message : 'Ошибка парсинга JSON файла');
      }
    };
    reader.onerror = () => setImportError('Не удалось прочитать файл');
    reader.readAsText(file);
  };

  return (
    <div
      className="modal-backdrop"
      onClick={onClose}
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
          maxWidth: '740px',
          width: '94%',
          maxHeight: '88vh',
          display: 'flex',
          flexDirection: 'column',
          background: 'rgba(15, 22, 38, 0.98)',
          border: '1px solid rgba(0, 242, 254, 0.3)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.8), 0 0 25px rgba(0, 242, 254, 0.15)',
          borderRadius: '12px',
          overflow: 'hidden'
        }}
      >
        <div
          className="modal-header"
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '20px' }}>📦</span>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#fff' }}>
              Экспорт и интеграция в Godot 4
            </h3>
          </div>
          <button
            type="button"
            className="icon-btn"
            onClick={onClose}
            style={{ fontSize: '18px', color: 'var(--text-dim)' }}
          >
            ✕
          </button>
        </div>

        {/* Вкладки */}
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid var(--border)',
            background: 'rgba(2, 6, 23, 0.5)',
            padding: '0 16px'
          }}
        >
          <button
            type="button"
            className={`tab-pill ${activeTab === 'gdscript' ? 'active' : ''}`}
            onClick={() => setActiveTab('gdscript')}
            style={{
              padding: '10px 14px',
              border: 'none',
              background: 'none',
              borderBottom: activeTab === 'gdscript' ? '2px solid var(--accent-cyan)' : '2px solid transparent',
              color: activeTab === 'gdscript' ? 'var(--accent-cyan)' : 'var(--text-muted)',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            ⚙️ AssetManifest.gd (Godot 4)
          </button>

          <button
            type="button"
            className={`tab-pill ${activeTab === 'json' ? 'active' : ''}`}
            onClick={() => setActiveTab('json')}
            style={{
              padding: '10px 14px',
              border: 'none',
              background: 'none',
              borderBottom: activeTab === 'json' ? '2px solid var(--accent-cyan)' : '2px solid transparent',
              color: activeTab === 'json' ? 'var(--accent-cyan)' : 'var(--text-muted)',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            📄 JSON Реестр
          </button>

          <button
            type="button"
            className={`tab-pill ${activeTab === 'markdown' ? 'active' : ''}`}
            onClick={() => setActiveTab('markdown')}
            style={{
              padding: '10px 14px',
              border: 'none',
              background: 'none',
              borderBottom: activeTab === 'markdown' ? '2px solid var(--accent-cyan)' : '2px solid transparent',
              color: activeTab === 'markdown' ? 'var(--accent-cyan)' : 'var(--text-muted)',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            📋 Markdown Сводка
          </button>

          <button
            type="button"
            className={`tab-pill ${activeTab === 'import' ? 'active' : ''}`}
            onClick={() => setActiveTab('import')}
            style={{
              padding: '10px 14px',
              border: 'none',
              background: 'none',
              borderBottom: activeTab === 'import' ? '2px solid var(--accent-cyan)' : '2px solid transparent',
              color: activeTab === 'import' ? 'var(--accent-cyan)' : 'var(--text-muted)',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            📥 Импорт JSON
          </button>
        </div>

        {/* Тело вкладки */}
        <div style={{ flex: 1, minHeight: 0, padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {activeTab === 'gdscript' && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)' }}>
                  Готовый GDScript класс-синглтон со статическими методами безопасной загрузки ассетов в Godot 4.3:
                </p>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => copyToClipboard(gdscriptCode, 'GDScript')}
                    style={{ fontSize: '11.5px', padding: '5px 10px' }}
                  >
                    Копировать код
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => {
                      downloadGodotAssetManifest(assets);
                      onShowToast('Файл AssetManifest.gd скачан!');
                    }}
                    style={{ fontSize: '11.5px', padding: '5px 12px' }}
                  >
                    Скачать AssetManifest.gd
                  </button>
                </div>
              </div>

              <textarea
                readOnly
                value={gdscriptCode}
                style={{
                  flex: 1,
                  minHeight: '260px',
                  background: 'rgba(2, 6, 23, 0.85)',
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
            </>
          )}

          {activeTab === 'json' && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)' }}>
                  Полный JSON-дамп всех ассетов, стадий и чек-листов (для бекапа или синхронизации):
                </p>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => copyToClipboard(jsonCode, 'JSON')}
                    style={{ fontSize: '11.5px', padding: '5px 10px' }}
                  >
                    Копировать JSON
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => {
                      exportAssetsToJson(assets);
                      onShowToast('Файл JSON скачан!');
                    }}
                    style={{ fontSize: '11.5px', padding: '5px 12px' }}
                  >
                    Скачать .json
                  </button>
                </div>
              </div>

              <textarea
                readOnly
                value={jsonCode}
                style={{
                  flex: 1,
                  minHeight: '260px',
                  background: 'rgba(2, 6, 23, 0.85)',
                  border: '1px solid var(--border)',
                  borderRadius: '6px',
                  padding: '12px',
                  color: '#86efac',
                  fontFamily: 'monospace',
                  fontSize: '11.5px',
                  lineHeight: 1.45,
                  resize: 'none'
                }}
              />
            </>
          )}

          {activeTab === 'markdown' && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)' }}>
                  Отчет по пайплайну в формате Markdown для Discord, Telegram или задач GitHub:
                </p>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => copyToClipboard(markdownText, 'Markdown отчет')}
                  style={{ fontSize: '11.5px', padding: '5px 12px' }}
                >
                  Копировать Markdown
                </button>
              </div>

              <textarea
                readOnly
                value={markdownText}
                style={{
                  flex: 1,
                  minHeight: '260px',
                  background: 'rgba(2, 6, 23, 0.85)',
                  border: '1px solid var(--border)',
                  borderRadius: '6px',
                  padding: '12px',
                  color: '#cbd5e1',
                  fontFamily: 'monospace',
                  fontSize: '11.5px',
                  lineHeight: 1.45,
                  resize: 'none'
                }}
              />
            </>
          )}

          {activeTab === 'import' && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '16px',
                padding: '40px 20px',
                background: 'rgba(2, 6, 23, 0.6)',
                border: '1px dashed rgba(0, 242, 254, 0.3)',
                borderRadius: '8px'
              }}
            >
              <span style={{ fontSize: '36px' }}>📂</span>
              <div style={{ textAlign: 'center' }}>
                <h4 style={{ margin: '0 0 6px', fontSize: '15px', color: '#fff' }}>
                  Загрузить JSON файл реестра ассетов
                </h4>
                <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)' }}>
                  Выберите сохраненный ранее файл `asset_pipeline_*.json` для восстановления данных
                </p>
              </div>

              <label className="btn btn-primary" style={{ cursor: 'pointer', padding: '8px 16px', fontSize: '13px' }}>
                <span>Выбрать файл JSON</span>
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                />
              </label>

              {importError && (
                <div
                  style={{
                    color: 'var(--accent-rose)',
                    fontSize: '12px',
                    background: 'rgba(244, 63, 94, 0.1)',
                    border: '1px solid var(--accent-rose)',
                    borderRadius: '4px',
                    padding: '8px 12px'
                  }}
                >
                  {importError}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
