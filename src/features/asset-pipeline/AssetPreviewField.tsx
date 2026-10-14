import React, { useState } from 'react';
import { GalleryItem, uploadImageToServer } from '../../entities/gallery';
import { deleteScreenshotIdb, saveScreenshotIdb } from '../../shared/lib/indexedDbStorage';

interface AssetPreviewFieldProps {
  assetId: string;
  previewUrl?: string;
  onChange: (previewUrl: string | undefined) => void;
  onGalleryItem: (item: GalleryItem) => void;
  onError: (message: string) => void;
}

export const AssetPreviewField: React.FC<AssetPreviewFieldProps> = ({
  assetId,
  previewUrl,
  onChange,
  onGalleryItem,
  onError
}) => {
  const [busy, setBusy] = useState(false);

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    setBusy(true);
    try {
      if (file.type.startsWith('image/')) {
        try {
          const item = await uploadImageToServer(file, file.name);
          onGalleryItem(item);
          onChange(item.url);
          return;
        } catch {
          const dataUrl = await readFile(file);
          const key = `asset-preview-${assetId}`;
          await saveScreenshotIdb(key, dataUrl);
          onChange(`idb:${key}`);
          onError('Арт-хранилище недоступно. Превью сохранено только в этом браузере');
          return;
        }
      }
      if (!file.type.startsWith('audio/')) {
        onError('Превью: картинка уходит в арт-хранилище, звук хранится локально');
        return;
      }
      const dataUrl = await readFile(file);
      const key = `asset-preview-${assetId}`;
      await saveScreenshotIdb(key, dataUrl);
      onChange(`idb:${key}`);
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Не удалось прикрепить превью');
    } finally {
      setBusy(false);
    }
  };

  const clear = async () => {
    if (previewUrl?.startsWith('idb:')) {
      await deleteScreenshotIdb(previewUrl.slice(4));
    }
    onChange(undefined);
  };

  return (
    <div>
      <label style={{ display: 'block', fontSize: '11.5px', color: 'var(--text-muted)', marginBottom: '5px' }}>
        Превью файла
      </label>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
        <input
          type="file"
          accept="image/*,audio/*"
          disabled={busy}
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = '';
            onFile(file);
          }}
          style={{ fontSize: '12px', color: 'var(--text-muted)' }}
        />
        {previewUrl && (
          <button type="button" className="btn btn-ghost" onClick={clear} style={{ fontSize: '11px' }}>
            Убрать превью
          </button>
        )}
      </div>
      <p style={{ margin: '6px 0 0', fontSize: '10.5px', color: 'var(--text-dim)' }}>
        Картинка попадает в арт-хранилище и видна на других компьютерах. Звук остаётся в этом браузере.
      </p>
    </div>
  );
};

function readFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(reader.error || new Error('Не удалось прочитать файл'));
    reader.readAsDataURL(file);
  });
}
