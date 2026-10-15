import React, { useRef, useState } from 'react';

interface BackupRestoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  fullData: Record<string, unknown>;
  onRestore: (data: Record<string, any>) => void;
  onShowToast: (msg: string) => void;
}

export const BackupRestoreModal: React.FC<BackupRestoreModalProps> = ({
  isOpen,
  onClose,
  fullData,
  onRestore,
  onShowToast
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [restoring, setRestoring] = useState(false);
  const [serverSyncing, setServerSyncing] = useState(false);

  if (!isOpen) return null;

  const handleDownloadBackup = () => {
    const bundle = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      project: 'cyber-duck-metroidvania-hub',
      data: fullData
    };

    const dateStr = new Date().toISOString().slice(0, 10);
    const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cyber-duck-backup-${dateStr}.json`;
    a.click();
    URL.revokeObjectURL(url);
    onShowToast('Бэкап проекта скачан на устройство!');
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setRestoring(true);
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const data = parsed.data || parsed;

      onRestore(data);

      // Отправляем восстановленный бэкап также на сервер
      try {
        await fetch('/api/backup.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data })
        });
      } catch {
        /* оффлайн режим */
      }

      onShowToast('Бэкап успешно применен!');
      onClose();
    } catch {
      onShowToast('Ошибка чтения файла бэкапа: неверный формат JSON');
    } finally {
      setRestoring(false);
    }
  };

  const handleSyncServerSnapshot = async () => {
    setServerSyncing(true);
    try {
      const res = await fetch('/api/backup.php');
      if (res.ok) {
        const bundle = await res.json();
        const dateStr = new Date().toISOString().slice(0, 10);
        const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `server-data-snapshot-${dateStr}.json`;
        a.click();
        URL.revokeObjectURL(url);
        onShowToast('Слепок серверных данных успешно скачан!');
      } else {
        onShowToast('Сервер недоступен для создания слепка');
      }
    } catch {
      onShowToast('Ошибка связи с сервером');
    } finally {
      setServerSyncing(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: '520px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '20px' }}>📦</span>
            <h3 style={{ margin: 0, fontSize: '16px', color: '#fff', fontWeight: 800 }}>
              Резервное копирование & Сервер
            </h3>
          </div>
          <button type="button" className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', lineHeight: 1.5, margin: '8px 0 16px' }}>
          Все данные проекта (комнаты, задачи, враги, сценарий, заметки, релизы) автоматически кэшируются на устройстве и сохраняются на вашем сервере. Здесь можно выгрузить единый слепок проекта или восстановить всё на другом ПК/телефоне в 1 клик.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Скачать бэкап */}
          <div className="panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#fff' }}>Экспорт локального бэкапа</div>
              <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Скачать cyber-duck-backup.json</div>
            </div>
            <button type="button" className="btn btn-primary" onClick={handleDownloadBackup}>
              ⬇️ Скачать
            </button>
          </div>

          {/* Загрузить бэкап */}
          <div className="panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#fff' }}>Восстановить из файла</div>
              <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Загрузить .json и применить ко всем модулям</div>
            </div>
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,application/json"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
              <button
                type="button"
                className="btn btn-secondary"
                disabled={restoring}
                onClick={() => fileInputRef.current?.click()}
              >
                {restoring ? 'Загрузка...' : '⬆️ Выбрать файл'}
              </button>
            </div>
          </div>

          {/* Серверный слепок */}
          <div className="panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#fff' }}>Слепок файлов сервера</div>
              <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Выгрузить /public/data/*.json с сервера</div>
            </div>
            <button
              type="button"
              className="btn btn-cyan"
              disabled={serverSyncing}
              onClick={handleSyncServerSnapshot}
            >
              {serverSyncing ? 'Связь...' : '🌐 Слепок сервера'}
            </button>
          </div>
        </div>

        <div style={{ marginTop: '18px', textAlign: 'right' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};
