import React, { useCallback, useEffect, useRef, useState } from 'react';
import { GalleryItem } from '../entities/gallery';

interface PendingUpload {
  file: File;
  previewUrl: string;
  suggestedTitle: string;
}

interface GalleryPageProps {
  items: GalleryItem[];
  serverSync: boolean;
  uploading: boolean;
  onRequestUpload: (file: File, title: string) => Promise<void>;
  onOpenLightbox: (url: string) => void;
}

export const GalleryPage: React.FC<GalleryPageProps> = ({
  items,
  serverSync,
  uploading,
  onRequestUpload,
  onOpenLightbox
}) => {
  const [title, setTitle] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [pending, setPending] = useState<PendingUpload | null>(null);
  const [pendingTitle, setPendingTitle] = useState('');
  const dragDepth = useRef(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const queueFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) return;
    const fallback = file.name.replace(/\.[^.]+$/, '') || 'Новый арт';
    const previewUrl = URL.createObjectURL(file);
    const chosenTitle = title.trim() || fallback;
    setPending({
      file,
      previewUrl,
      suggestedTitle: chosenTitle
    });
    setPendingTitle(chosenTitle);
  }, [title]);

  useEffect(() => {
    return () => {
      if (pending?.previewUrl) URL.revokeObjectURL(pending.previewUrl);
    };
  }, [pending?.previewUrl]);

  const clearPending = () => {
    if (pending?.previewUrl) URL.revokeObjectURL(pending.previewUrl);
    setPending(null);
    setPendingTitle('');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (file) queueFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    dragDepth.current = 0;
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) queueFile(file);
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    dragDepth.current += 1;
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    dragDepth.current -= 1;
    if (dragDepth.current <= 0) {
      dragDepth.current = 0;
      setDragOver(false);
    }
  };

  const confirmUpload = async () => {
    if (!pending || uploading) return;
    const uploadTitle = pendingTitle.trim() || pending.suggestedTitle;
    await onRequestUpload(pending.file, uploadTitle);
    setTitle('');
    clearPending();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="view-content">
      {/* Header section */}
      <div className="panel" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h2 style={{ fontSize: '18px', color: '#fff', fontWeight: 800, margin: '0 0 4px' }}>
              🎨 Арт-хранилище и референсы (Общий сервер)
            </h2>
            <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', margin: 0 }}>
              Спрайты, ракурсы утки, мокапы локаций и референсы Nine Sols / Hollow Knight. Картинки доступны со всех устройств.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {serverSync ? (
              <span className="badge-sync ok">● Сервер активен</span>
            ) : (
              <span className="badge-sync warn">○ Локальный режим</span>
            )}
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Всего артов: <b>{items.length}</b>
            </span>
          </div>
        </div>
      </div>

      {/* EXPANDED PROMINENT DROPZONE HERO */}
      <div className="panel" style={{ marginBottom: '24px', padding: '20px' }}>
        <div
          className={`gallery-hero-dropzone ${dragOver ? 'gallery-hero-dropzone--active' : ''}`}
          onDragEnter={handleDragEnter}
          onDragOver={(e) => e.preventDefault()}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={handleFileChange}
          />
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            hidden
            onChange={handleFileChange}
          />

          <div className="dropzone-icon-ring">
            <svg width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>

          <h3 className="dropzone-hero-title">
            Перетащите арт или референс прямо сюда
          </h3>
          <p className="dropzone-hero-subtitle">
            Кликните для выбора файла или перетащите изображение в любую часть этого блока.
          </p>
          <div className="dropzone-hero-meta">
            <span>PNG, JPG, WEBP, GIF</span>
            <span>•</span>
            <span>Максимум 5 МБ</span>
            <span>•</span>
            <span style={{ color: 'var(--accent-cyan)' }}>Обязательный диалог подтверждения перед загрузкой</span>
          </div>
        </div>

        {/* Action toolbar below dropzone */}
        <div className="gallery-toolbar-row">
          <div style={{ flex: 1, minWidth: '240px' }}>
            <label className="field-label" htmlFor="gallery-quick-title">Название нового арта (необязательно)</label>
            <input
              id="gallery-quick-title"
              className="field"
              value={title}
              placeholder="Например: Спрайт прыжка / Референс босса / Задник лаборатории"
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="gallery-toolbar-btns">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => cameraInputRef.current?.click()}
            >
              📷 Камера
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => fileInputRef.current?.click()}
            >
              📁 Выбрать файл
            </button>
          </div>
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="gallery-grid">
        {items.map(item => (
          <div
            key={item.id}
            className="gallery-item"
            onClick={() => onOpenLightbox(item.url)}
          >
            <img src={item.url} alt={item.title} loading="lazy" />
            <div className="gallery-item-foot">
              <div className="gallery-item-title">{item.title}</div>
              <a
                className="gallery-download"
                href={item.url}
                download={item.url.split('/').pop() || 'image'}
                onClick={(event) => event.stopPropagation()}
              >
                Скачать
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* CONFIRMATION MODAL WITH PREVIEW */}
      {pending && (
        <div className="sheet-backdrop" onClick={clearPending}>
          <div
            className="confirm-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="gallery-upload-confirm"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sheet-handle" aria-hidden="true" />
            <h3 id="gallery-upload-confirm" className="composer-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>🚀</span> Подтверждение загрузки на сервер
            </h3>
            
            <p className="confirm-dialog-text">
              Вы хотите загрузить это изображение в общее облачное хранилище проекта?
            </p>

            <div style={{ border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden', marginBottom: '14px', background: '#05070e' }}>
              <img className="confirm-dialog-preview" src={pending.previewUrl} alt="Предпросмотр" />
              <div style={{ padding: '8px 12px', fontSize: '11px', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  📄 {pending.file.name}
                </span>
                <span>{formatFileSize(pending.file.size)}</span>
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label className="field-label" htmlFor="pending-title-edit">Название в галерее:</label>
              <input
                id="pending-title-edit"
                className="field"
                value={pendingTitle}
                autoFocus
                onChange={(e) => setPendingTitle(e.target.value)}
              />
            </div>

            <div className="note-actions">
              <button
                type="button"
                className="btn btn-secondary"
                disabled={uploading}
                onClick={clearPending}
                style={{ flex: 1 }}
              >
                Отмена (Не загружать)
              </button>
              <button
                type="button"
                className="btn btn-primary"
                disabled={uploading}
                onClick={confirmUpload}
                style={{ flex: 1.3 }}
              >
                {uploading ? '⏳ Загрузка на сервер...' : '✓ Да, загрузить'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
