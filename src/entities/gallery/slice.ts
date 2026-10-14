import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { readJson } from '../../shared/lib/readJson';
import { DEFAULT_GALLERY, ensurePinnedGallery, GalleryItem } from './types';

export interface GalleryState {
  items: GalleryItem[];
  serverSync: boolean;
  uploading: boolean;
}

function loadGallery(): GalleryItem[] {
  const data = readJson<GalleryItem[]>('mv4_gallery', DEFAULT_GALLERY);
  return ensurePinnedGallery(Array.isArray(data) ? data : DEFAULT_GALLERY);
}

const gallerySlice = createSlice({
  name: 'gallery',
  initialState: {
    items: loadGallery(),
    serverSync: false,
    uploading: false
  } as GalleryState,
  reducers: {
    galleryReplaced(state, action: PayloadAction<GalleryItem[]>) {
      state.items = ensurePinnedGallery(action.payload);
    },
    galleryUpserted(state, action: PayloadAction<GalleryItem>) {
      const next = [action.payload, ...state.items.filter(item => item.id !== action.payload.id)];
      state.items = ensurePinnedGallery(next);
    },
    gallerySyncSet(state, action: PayloadAction<boolean>) {
      state.serverSync = action.payload;
    },
    galleryUploadingSet(state, action: PayloadAction<boolean>) {
      state.uploading = action.payload;
    }
  }
});

export const { galleryReplaced, galleryUpserted, gallerySyncSet, galleryUploadingSet } = gallerySlice.actions;
export const galleryReducer = gallerySlice.reducer;
