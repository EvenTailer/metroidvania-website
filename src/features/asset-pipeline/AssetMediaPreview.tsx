import React, { useEffect, useState } from 'react';
import { getScreenshotIdb } from '../../shared/lib/indexedDbStorage';

interface AssetMediaPreviewProps {
  previewUrl?: string;
}

export const AssetMediaPreview: React.FC<AssetMediaPreviewProps> = ({ previewUrl }) => {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    if (!previewUrl) {
      setSrc(null);
      return;
    }
    if (previewUrl.startsWith('idb:')) {
      getScreenshotIdb(previewUrl.slice(4)).then(value => {
        if (alive) setSrc(value);
      });
      return () => {
        alive = false;
      };
    }
    setSrc(previewUrl);
    return () => {
      alive = false;
    };
  }, [previewUrl]);

  if (!src) return null;
  const audio = src.startsWith('data:audio') || /\.(wav|ogg|mp3)(\?|$)/i.test(src);
  if (audio) {
    return <audio src={src} controls style={{ width: '100%', height: '32px' }} />;
  }
  return (
    <img
      src={src}
      alt=""
      style={{
        width: '100%',
        height: '84px',
        objectFit: 'contain',
        background: 'rgba(2, 6, 23, 0.7)',
        borderRadius: '6px'
      }}
    />
  );
};
