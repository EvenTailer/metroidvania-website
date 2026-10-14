import React, { useMemo, useState } from 'react';
import {
  EnemyItem,
  exportBestiaryToJson,
  exportEnemyDatabaseGdscript,
  exportEnemyToTres,
  parseBestiaryImport
} from '../../entities/bestiary';

interface BestiaryExportModalProps {
  enemies: EnemyItem[];
  selectedEnemy: EnemyItem | null;
  onClose: () => void;
  onShowToast: (msg: string) => void;
  onImport: (enemies: EnemyItem[]) => void;
}

export const BestiaryExportModal: React.FC<BestiaryExportModalProps> = ({
  enemies,
  selectedEnemy,
  onClose,
  onShowToast,
  onImport
}) => {
  const [exportType, setExportType] = useState<'tres' | 'gdscript' | 'json' | 'import'>('gdscript');
  const [importText, setImportText] = useState('');
  const [importError, setImportError] = useState<string | null>(null);

  const content = useMemo(() => {
    if (exportType === 'import') return '';
    switch (exportType) {
      case 'tres':
        return selectedEnemy
          ? exportEnemyToTres(selectedEnemy)
          : '# Выберите конкретного врага в списке для экспорта его ресурса .tres\n' + exportEnemyToTres(enemies[0]);
      case 'gdscript':
        return exportEnemyDatabaseGdscript(enemies);
      case 'json':
        return exportBestiaryToJson(enemies);
    }
  }, [exportType, enemies, selectedEnemy]);

  const fileName = useMemo(() => {
    if (exportType === 'import') return 'enemies.json';
    switch (exportType) {
      case 'tres':
        return selectedEnemy ? `${selectedEnemy.id}.tres` : 'enemy_sample.tres';
      case 'gdscript':
        return 'EnemyDatabase.gd';
      case 'json':
        return 'enemies.json';
    }
  }, [exportType, selectedEnemy]);

  const handleCopy = () => {
    navigator.clipboard.writeText(content).then(() => {
      onShowToast(`Код ${fileName} скопирован в буфер!`);
    });
  };

  const handleDownload = () => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
    onShowToast(`Файл ${fileName} скачан!`);
  };

  const applyImport = (text: string) => {
    const result = parseBestiaryImport(text);
    if ('error' in result) {
      setImportError(result.error);
      return;
    }
    onImport(result.enemies);
    onShowToast(`Каталог заменён: ${result.enemies.length} врагов`);
    onClose();
  };

  const readImportFile = (file: File | undefined) => {
    if (!file) return;
    file.text().then(text => {
      setImportText(text);
      setImportError(null);
    }).catch(() => {
      setImportError('Не удалось прочитать файл.');
    });
  };

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div
        className="modal"
        onClick={e => e.stopPropagation()}
        style={{ maxWidth: '680px', width: '92%', maxHeight: '88vh', display: 'flex', flexDirection: 'column' }}
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '18px' }}>💾</span>
            <div>
              <h3 className="modal-title">Обмен с Godot 4</h3>
              <p style={{ margin: 0, fontSize: '11.5px', color: 'var(--text-muted)' }}>
                Экспорт базы и обратный импорт JSON-снимка
              </p>
            </div>
          </div>
          <button type="button" className="modal-close" onClick={onClose}>×</button>
        </div>

        {/* Format Selector Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
          <button
            type="button"
            className={`chip-btn ${exportType === 'gdscript' ? 'active' : ''}`}
            onClick={() => setExportType('gdscript')}
            style={{ fontSize: '11.5px', padding: '6px 12px' }}
          >
            📜 EnemyDatabase.gd (Все враги)
          </button>
          <button
            type="button"
            className={`chip-btn ${exportType === 'tres' ? 'active' : ''}`}
            onClick={() => setExportType('tres')}
            style={{ fontSize: '11.5px', padding: '6px 12px' }}
          >
            📦 Ресурс .tres ({selectedEnemy ? selectedEnemy.name : 'Первый враг'})
          </button>
          <button
            type="button"
            className={`chip-btn ${exportType === 'json' ? 'active' : ''}`}
            onClick={() => setExportType('json')}
            style={{ fontSize: '11.5px', padding: '6px 12px' }}
          >
            JSON-снимок
          </button>
          <button
            type="button"
            className={`chip-btn ${exportType === 'import' ? 'active' : ''}`}
            onClick={() => setExportType('import')}
            style={{ fontSize: '11.5px', padding: '6px 12px' }}
          >
            Импорт JSON
          </button>
        </div>
        <p style={{ margin: '0 0 10px', fontSize: '12px', lineHeight: 1.4, color: 'var(--text-muted)' }}>
          {exportType === 'gdscript' && 'Один скрипт со всеми врагами. Его кладут в проект Godot как базу бестиария.'}
          {exportType === 'tres' && `Файл одного врага: ${selectedEnemy ? selectedEnemy.name : 'сначала выберите карточку на странице'}. Рамка на карточке показывает, кто выбран.`}
          {exportType === 'json' && 'Полная копия каталога. Этот же текст можно загрузить обратно через «Импорт JSON».'}
          {exportType === 'import' && 'Нужен JSON-снимок из соседней вкладки или файл enemies.json.'}
        </p>

        {exportType === 'import' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
            <label className="composer-label" htmlFor="bestiary-import-file">Файл снимка</label>
            <input
              id="bestiary-import-file"
              type="file"
              accept="application/json,.json"
              className="field"
              onChange={event => readImportFile(event.target.files?.[0])}
            />
            <label className="composer-label" htmlFor="bestiary-import-text">Или вставьте JSON</label>
            <textarea
              id="bestiary-import-text"
              className="field"
              value={importText}
              onChange={event => {
                setImportText(event.target.value);
                if (importError) setImportError(null);
              }}
              style={{ minHeight: '180px', fontFamily: 'monospace', fontSize: '11px' }}
            />
            {importError && (
              <p style={{ margin: 0, color: '#f87171', fontSize: '12px' }}>{importError}</p>
            )}
            <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)' }}>
              Замена перезапишет текущий каталог. Скачайте JSON-снимок, если нужно сохранить копию.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-primary" onClick={() => applyImport(importText)}>
                Заменить каталог
              </button>
            </div>
          </div>
        ) : (
        <>
        <div style={{ position: 'relative', flex: 1, minHeight: '260px', marginBottom: '14px' }}>
          <textarea
            readOnly
            className="field"
            value={content}
            style={{
              width: '100%',
              height: '100%',
              minHeight: '260px',
              fontFamily: 'monospace',
              fontSize: '11px',
              lineHeight: 1.45,
              background: '#040711',
              color: '#38bdf8',
              resize: 'none'
            }}
          />
        </div>

        {/* Footer Actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            Имя файла: <strong>{fileName}</strong>
          </span>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button type="button" className="btn btn-secondary" onClick={handleCopy} style={{ fontSize: '12px' }}>
              📋 Скопировать
            </button>
            <button type="button" className="btn btn-primary" onClick={handleDownload} style={{ fontSize: '12px' }}>
              Скачать {fileName}
            </button>
          </div>
        </div>
        </>
        )}
      </div>
    </div>
  );
};
