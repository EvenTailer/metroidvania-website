import type { GalleryItem } from './types';

const GALLERY_API = import.meta.env.VITE_GALLERY_API ?? '/api/gallery.php';

export function getGalleryUploadToken(): string {
  const fromEnv = import.meta.env.VITE_GALLERY_UPLOAD_TOKEN;
  if (fromEnv && String(fromEnv).length > 0) {
    return String(fromEnv);
  }
  return sessionStorage.getItem('mv_gallery_upload_token') ?? '1111';
}

export async function fetchGalleryFromServer(): Promise<GalleryItem[]> {
  const res = await fetch(GALLERY_API, { method: 'GET' });
  if (!res.ok) {
    throw new Error(`Gallery list failed: ${res.status}`);
  }
  const data = (await res.json()) as { items?: GalleryItem[] };
  return Array.isArray(data.items) ? data.items : [];
}

export async function uploadImageToServer(file: File, title?: string): Promise<GalleryItem> {
  const form = new FormData();
  form.append('file', file);
  if (title?.trim()) {
    form.append('title', title.trim());
  }

  const res = await fetch(GALLERY_API, {
    method: 'POST',
    headers: { 'X-Hub-Token': getGalleryUploadToken() },
    body: form
  });

  if (!res.ok) {
    let message = `Upload failed: ${res.status}`;
    try {
      const err = (await res.json()) as { error?: string };
      if (err.error) message = err.error;
    } catch {
      /* ignore */
    }
    throw new Error(message);
  }

  const data = (await res.json()) as { item: GalleryItem };
  if (!data.item?.url) {
    throw new Error('Invalid server response');
  }
  return data.item;
}
