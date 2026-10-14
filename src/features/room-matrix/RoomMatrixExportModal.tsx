import React, { useState } from 'react';
import { exportToGdscript, exportToJson, RoomNode, SectorInfo } from '../../entities/room-matrix';

interface RoomMatrixExportModalProps {
  rooms: RoomNode[];
  sectors: SectorInfo[];
  onClose: () => void;
  onShowToast: (msg: string) => void;
}

export const RoomMatrixExportModal: React.FC<RoomMatrixExportModalProps> = ({
  rooms,
  sectors,
  onClose,
  onShowToast
}) => {
  const [activeTab, setActiveTab] = useState<'gdscript' | 'json'>('gdscript');

  const gdscriptCode = exportToGdscript(rooms, sectors);
  const jsonCode = exportToJson(rooms, sectors);

  const currentContent = activeTab === 'gdscript' ? gdscriptCode : jsonCode;
  const fileName = activeTab === 'gdscript' ? 'WorldRoomDatabase.gd' : 'world_matrix.json';

  const handleCopy = () => {
    navigator.clipboard.writeText(currentContent).then(() => {
      onShowToast(`Код ${fileName} скопирован в буфер обмена!`);
    });
  };

  const handleDownload = () => {
    const mime = activeTab === 'gdscript' ? 'text/plain;charset=utf-8' : 'application/json;charset=utf-8';
    const blob = new Blob([currentContent], { type: mime });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
    onShowToast(`Файл ${fileName} скачан!`);
  };

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div
        className="modal"
        onClick={e => e.stopPropagation()}
        style={{ maxWidth: '720px', width: '92%', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '18px' }}>💾</span>
            <div>
              <h3 className="modal-title">Экспорт карты комнат в Godot 4</h3>
              <p style={{ margin: 0, fontSize: '11.5px', color: 'var(--text-muted)' }}>
                Используйте этот скрипт или JSON для инициализации комнат, переходов и замков в проекте Godot.
              </p>
            </div>
          </div>
          <button type="button" className="modal-close" onClick={onClose}>×</button>
        </div>

        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
          <button
            type="button"
            className={`chip-btn ${activeTab === 'gdscript' ? 'active' : ''}`}
            onClick={() => setActiveTab('gdscript')}
          >
            GDScript (WorldRoomDatabase.gd)
          </button>
          <button
            type="button"
            className={`chip-btn ${activeTab === 'json' ? 'active' : ''}`}
            onClick={() => setActiveTab('json')}
          >
            JSON (world_matrix.json)
          </button>
        </div>

        <pre
          style={{
            flex: 1,
            background: '#090d16',
            color: '#a5f3fc',
            padding: '14px',
            borderRadius: '8px',
            fontSize: '11px',
            fontFamily: 'Consolas, monospace',
            overflow: 'auto',
            maxHeight: '440px',
            border: '1px solid rgba(0, 210, 255, 0.2)',
            whiteSpace: 'pre',
            lineHeight: 1.45
          }}
        >
          {currentContent}
        </pre>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '14px', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
            Комнат: {rooms.length} • Секторов: {sectors.length}
          </span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button type="button" className="btn btn-secondary" onClick={handleCopy}>
              📋 Скопировать код
            </button>
            <button type="button" className="btn btn-primary" onClick={handleDownload}>
              ⬇️ Скачать {fileName}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
