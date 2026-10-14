import React, { useEffect, useState } from 'react';
import {
  BugSeverity,
  BugStatus,
  PlaytestReport,
  SEVERITY_META,
  STATUS_META
} from '../../entities/playtest';
import { RoomNode } from '../../entities/room-matrix';
import { readScreenshotFile } from './readScreenshot';

interface PlaytestEditModalProps {
  report: PlaytestReport | null;
  rooms: RoomNode[];
  onSave: (report: PlaytestReport) => void;
  onClose: () => void;
  onError: (message: string) => void;
}

export const PlaytestEditModal: React.FC<PlaytestEditModalProps> = ({
  report,
  rooms,
  onSave,
  onClose,
  onError
}) => {
  const [title, setTitle] = useState(report?.title || '');
  const [severity, setSeverity] = useState<BugSeverity>(report?.severity || 'minor');
  const [status, setStatus] = useState<BugStatus>(report?.status || 'open');
  const [tester, setTester] = useState(report?.tester || 'Тестер');
  const [buildVersion, setBuildVersion] = useState(report?.buildVersion || 'v0.2.0-demo');
  const [roomId, setRoomId] = useState(report?.roomId || '');
  const [scenePath, setScenePath] = useState(report?.scenePath || '');
  const [steps, setSteps] = useState(report?.steps || '');
  const [expected, setExpected] = useState(report?.expected || '');
  const [actual, setActual] = useState(report?.actual || '');
  const [godotLog, setGodotLog] = useState(report?.godotLog || '');
  const [screenshotUrl, setScreenshotUrl] = useState(report?.screenshotUrl || '');
  const [isDragging, setIsDragging] = useState(false);

  const pickRoom = (nextRoomId: string) => {
    setRoomId(nextRoomId);
    const room = rooms.find(item => item.id === nextRoomId);
    if (room?.godotScene) setScenePath(room.godotScene);
  };

  const processImageFile = (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      onError('Выбранный файл не является изображением.');
      return;
    }
    readScreenshotFile(file)
      .then(setScreenshotUrl)
      .catch(error => {
        onError(error instanceof Error ? error.message : 'Не удалось прикрепить скриншот.');
      });
  };

  // Поддержка быстрой вставки скриншота через Ctrl+V прямо в окно
  useEffect(() => {
    const handlePaste = (event: ClipboardEvent) => {
      const items = event.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) {
            event.preventDefault();
            processImageFile(file);
            break;
          }
        }
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    processImageFile(file);
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!title.trim()) return;
    onSave({
      id: report?.id || `bug-${Date.now()}`,
      title: title.trim(),
      severity,
      status,
      tester: tester.trim() || 'Тестер',
      buildVersion: buildVersion.trim() || undefined,
      scenePath: scenePath.trim(),
      roomId: roomId || null,
      steps: steps.trim(),
      expected: expected.trim(),
      actual: actual.trim(),
      godotLog: godotLog.trim() || undefined,
      screenshotUrl: screenshotUrl || undefined,
      createdAt: report?.createdAt || new Date().toISOString()
    });
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div
        className="modal"
        onClick={event => event.stopPropagation()}
        style={{
          maxWidth: '780px',
          width: '95%',
          maxHeight: '92vh',
          overflowY: 'auto',
          background: '#0d1322',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          borderRadius: '12px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.7)'
        }}
      >
        <div className="modal-header" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '12px' }}>
          <div>
            <h3 className="modal-title" style={{ fontSize: '18px', fontWeight: 800 }}>
              {report ? `✏️ Редактирование: ${report.title}` : '➕ Сообщить о баге в игре'}
            </h3>
            <p style={{ margin: '3px 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>
              Заполните, что пошло не так, чтобы разработчик мог быстро найти и исправить ошибку.
            </p>
          </div>
          <button type="button" className="modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '14px' }}>
          {/* Поле названия */}
          <div>
            <label className="composer-label" htmlFor="bug-title" style={{ fontSize: '12px', fontWeight: 700, color: '#fff' }}>
              Что сломалось? (кратко и понятно) <span style={{ color: '#f87171' }}>*</span>
            </label>
            <input
              id="bug-title"
              className="field"
              value={title}
              onChange={event => setTitle(event.target.value)}
              required
              placeholder="Например: После победы над боссом восточная дверь не открывается"
              style={{ fontSize: '13px', padding: '9px 12px' }}
            />
          </div>

          {/* Карточки выбора важности */}
          <div>
            <label className="composer-label" style={{ fontSize: '12px', fontWeight: 700, color: '#fff', marginBottom: '6px' }}>
              Насколько всё плохо? (Степень важности)
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '8px' }}>
              {(Object.keys(SEVERITY_META) as BugSeverity[]).map(key => {
                const meta = SEVERITY_META[key];
                const active = severity === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSeverity(key)}
                    style={{
                      border: active ? `2px solid ${meta.color}` : '1px solid rgba(255, 255, 255, 0.1)',
                      background: active ? `${meta.color}20` : 'rgba(255, 255, 255, 0.03)',
                      borderRadius: '8px',
                      padding: '8px 10px',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ fontSize: '12px', fontWeight: 800, color: active ? meta.color : '#e2e8f0', marginBottom: '2px' }}>
                      {meta.badge}
                    </div>
                    <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', lineHeight: 1.3 }}>
                      {meta.hint}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Статус, версия и тестер */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
            {/* Статус */}
            <div>
              <label className="composer-label" htmlFor="bug-status">Состояние ошибки</label>
              <select
                id="bug-status"
                className="field"
                value={status}
                onChange={event => setStatus(event.target.value as BugStatus)}
                style={{ background: '#0b101c', color: '#fff', borderColor: 'rgba(255,255,255,0.15)' }}
              >
                {(Object.keys(STATUS_META) as BugStatus[]).map(key => (
                  <option key={key} value={key} style={{ background: '#0b101c', color: '#fff' }}>
                    {STATUS_META[key].badge}
                  </option>
                ))}
              </select>
            </div>

            {/* Билд */}
            <div>
              <label className="composer-label" htmlFor="bug-version">Сборка / Версия игры</label>
              <input
                id="bug-version"
                className="field"
                value={buildVersion}
                onChange={event => setBuildVersion(event.target.value)}
                placeholder="v0.2.0-demo"
                list="build-presets"
                style={{ background: '#0b101c', color: '#fff', borderColor: 'rgba(255,255,255,0.15)' }}
              />
              <datalist id="build-presets">
                <option value="v0.1.0-proto" />
                <option value="v0.2.0-demo" />
                <option value="v0.3.0-vertical-slice" />
                <option value="master-nightly" />
              </datalist>
            </div>

            {/* Автор */}
            <div>
              <label className="composer-label" htmlFor="bug-tester">Кто нашёл (имя/ник)</label>
              <input
                id="bug-tester"
                className="field"
                value={tester}
                onChange={event => setTester(event.target.value)}
                placeholder="Илья / Тестер"
                style={{ background: '#0b101c', color: '#fff', borderColor: 'rgba(255,255,255,0.15)' }}
              />
            </div>
          </div>

          {/* Комната и файл сцены Godot */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
            <div>
              <label className="composer-label" htmlFor="bug-room">Комната на карте игры</label>
              <select
                id="bug-room"
                className="field"
                value={roomId}
                onChange={event => pickRoom(event.target.value)}
                style={{ background: '#0b101c', color: '#fff', borderColor: 'rgba(255,255,255,0.15)' }}
              >
                <option value="">Не привязана к комнате</option>
                {rooms.map(room => (
                  <option key={room.id} value={room.id} style={{ background: '#0b101c', color: '#fff' }}>
                    📍 {room.name}
                  </option>
                ))}
              </select>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginTop: '3px' }}>
                Выбор комнаты сам подставит файл сцены .tscn.
              </span>
            </div>

            <div>
              <label className="composer-label" htmlFor="bug-scene">Файл сцены Godot (.tscn)</label>
              <input
                id="bug-scene"
                className="field"
                value={scenePath}
                onChange={event => setScenePath(event.target.value)}
                placeholder="res://scenes/rooms/sector1/room_centurion_boss.tscn"
                style={{ background: '#0b101c', color: '#fff', borderColor: 'rgba(255,255,255,0.15)' }}
              />
            </div>
          </div>

          {/* Шаги воспроизведения */}
          <div>
            <label className="composer-label" htmlFor="bug-steps">
              Как повторить баг? (Шаги: что нужно нажать по порядку)
            </label>
            <textarea
              id="bug-steps"
              className="field"
              rows={3}
              value={steps}
              onChange={event => setSteps(event.target.value)}
              placeholder={'1. Подойти к двери босса\n2. Победить центуриона\n3. Нажать вправо к выходу'}
              style={{ background: '#0b101c', color: '#fff', borderColor: 'rgba(255,255,255,0.15)', lineHeight: 1.4 }}
            />
          </div>

          {/* Ожидалось и Фактически */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
            <div>
              <label className="composer-label" htmlFor="bug-expected" style={{ color: '#34d399' }}>
                🟢 Как должно работать (Ожидалось)
              </label>
              <textarea
                id="bug-expected"
                className="field"
                rows={2}
                value={expected}
                onChange={event => setExpected(event.target.value)}
                placeholder="Дверь должна открыться и пустить дальше..."
                style={{ background: '#0b101c', color: '#fff', borderColor: 'rgba(16, 185, 129, 0.3)' }}
              />
            </div>

            <div>
              <label className="composer-label" htmlFor="bug-actual" style={{ color: '#f87171' }}>
                🔴 Что происходит сейчас (Фактически)
              </label>
              <textarea
                id="bug-actual"
                className="field"
                rows={2}
                value={actual}
                onChange={event => setActual(event.target.value)}
                placeholder="Дверь заперта, утка застряла на арене..."
                style={{ background: '#0b101c', color: '#fff', borderColor: 'rgba(239, 68, 68, 0.3)' }}
              />
            </div>
          </div>

          {/* Текст ошибки из консоли Godot */}
          <div>
            <label className="composer-label" htmlFor="bug-godot-log">
              ⚠️ Ошибка в консоли Godot / Текст из файла godot.log (если есть)
            </label>
            <textarea
              id="bug-godot-log"
              className="field"
              rows={2}
              value={godotLog}
              onChange={event => setGodotLog(event.target.value)}
              placeholder="ERROR: Door._on_boss_defeated(): Signal 'arena_cleared' failed..."
              style={{
                fontFamily: 'Consolas, Monaco, "Courier New", monospace',
                fontSize: '11px',
                color: '#fca5a5',
                background: '#050811',
                borderColor: 'rgba(239, 68, 68, 0.3)'
              }}
            />
          </div>

          {/* Зона скриншота */}
          <div>
            <label className="composer-label">📸 Скриншот или кадр с ошибкой</label>
            <div
              onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => document.getElementById('bug-shot-file')?.click()}
              style={{
                border: isDragging ? '2px dashed var(--accent-cyan)' : '1px dashed rgba(0, 210, 255, 0.35)',
                borderRadius: '8px',
                padding: '16px',
                textAlign: 'center',
                background: isDragging ? 'rgba(0, 210, 255, 0.12)' : 'rgba(0, 210, 255, 0.03)',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <p style={{ margin: '0 0 4px', fontSize: '13px', fontWeight: 600, color: '#e2e8f0' }}>
                📁 Нажмите для выбора картинки или просто нажмите <kbd style={{ background: '#1e293b', padding: '2px 7px', borderRadius: '4px', border: '1px solid #475569', color: 'var(--accent-cyan)' }}>Ctrl + V</kbd>
              </p>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                Скриншот автоматически сожмётся и сохранится прямо в браузере.
              </span>
              <input
                id="bug-shot-file"
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={event => processImageFile(event.target.files?.[0])}
              />
            </div>

            {screenshotUrl && (
              <div style={{ marginTop: '10px', display: 'flex', gap: '12px', alignItems: 'center' }}>
                <img
                  src={screenshotUrl}
                  alt="Превью"
                  style={{ width: '150px', maxHeight: '95px', objectFit: 'cover', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.2)' }}
                />
                <button
                  type="button"
                  className="chip-btn"
                  style={{ color: '#f87171', fontSize: '11.5px', padding: '4px 10px' }}
                  onClick={() => setScreenshotUrl('')}
                >
                  ✕ Удалить скриншот
                </button>
              </div>
            )}
          </div>

          {/* Нижние кнопки */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '12px' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose} style={{ padding: '8px 16px' }}>
              Отмена
            </button>
            <button type="submit" className="btn btn-primary" style={{ padding: '8px 20px', fontWeight: 700 }}>
              {report ? '💾 Сохранить изменения' : '➕ Добавить в журнал'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
