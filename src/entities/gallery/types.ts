export interface GalleryItem {
  id: string;
  title: string;
  url: string;
}

export const DEFAULT_GALLERY: GalleryItem[] = [
  { id: 'g-1', title: 'A-Pose: Кибер-Утка (4 ракурса)', url: '/assets/duck_hero.png' }
];

const PINNED_GALLERY = DEFAULT_GALLERY[0];

export function ensurePinnedGallery(items: GalleryItem[]): GalleryItem[] {
  const rest = items.filter(item => item.id !== PINNED_GALLERY.id && item.url !== PINNED_GALLERY.url);
  return [PINNED_GALLERY, ...rest];
}
