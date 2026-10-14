import { AssetItem } from '../asset-pipeline';
import { getScreenshotIdb } from '../../shared/lib/indexedDbStorage';
import { BridgeConfigFile } from './types';

function dataUrlToBytes(dataUrl: string): Uint8Array | null {
  const comma = dataUrl.indexOf(',');
  if (comma < 0) return null;
  const meta = dataUrl.slice(0, comma);
  const body = dataUrl.slice(comma + 1);
  if (!meta.includes(';base64')) return new TextEncoder().encode(decodeURIComponent(body));
  const binary = atob(body);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return bytes;
}

async function readPreviewBytes(previewUrl: string): Promise<Uint8Array | null> {
  if (previewUrl.startsWith('idb:')) {
    const stored = await getScreenshotIdb(previewUrl.slice(4));
    return stored ? dataUrlToBytes(stored) : null;
  }
  if (previewUrl.startsWith('data:')) return dataUrlToBytes(previewUrl);
  if (previewUrl.startsWith('blob:') || previewUrl.startsWith('http') || previewUrl.startsWith('/')) {
    try {
      const response = await fetch(previewUrl);
      if (!response.ok) return null;
      return new Uint8Array(await response.arrayBuffer());
    } catch {
      return null;
    }
  }
  return null;
}

export async function resolveAssetFiles(assets: AssetItem[]): Promise<BridgeConfigFile[]> {
  const files: BridgeConfigFile[] = [];
  for (const asset of assets) {
    if (!asset.previewUrl || !asset.targetPath.startsWith('res://')) continue;
    const bytes = await readPreviewBytes(asset.previewUrl);
    if (!bytes || bytes.byteLength === 0) continue;
    const filename = asset.targetPath.split('/').pop() || `${asset.id}.bin`;
    files.push({
      id: `asset_bin_${asset.id}`,
      filename,
      targetResPath: asset.targetPath,
      category: 'assets',
      title: asset.title,
      description: 'Файл превью из пайплайна ассетов',
      icon: '🖼️',
      sourceLabel: 'Пайплайн ассетов',
      selected: true,
      content: '',
      binary: bytes,
      fileSizeBytes: bytes.byteLength
    });
  }
  return files;
}

export function assetExportNote(configCount: number, copiedFiles: number, assetsWithPath: number): string {
  const missed = Math.max(0, assetsWithPath - copiedFiles);
  if (copiedFiles === 0) {
    return `Выгружено ${configCount} конфигов. Превью в хабе нет, в проект попали только пути из AssetManifest.gd`;
  }
  if (missed === 0) {
    return `Выгружено ${configCount} конфигов и ${copiedFiles} файлов ассетов`;
  }
  return `Выгружено ${configCount} конфигов и ${copiedFiles} файлов ассетов. Ещё ${missed} записей без файла в хабе: в Godot ушёл только путь`;
}
