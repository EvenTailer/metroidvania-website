import { useEffect, useRef, useState } from 'react';
import { FolderAccess, loadGodotDirHandle, saveGodotDirHandle } from '../../entities/engine-bridge';

type PermissionHandle = FileSystemDirectoryHandle & {
  queryPermission?: (descriptor: { mode: 'readwrite' }) => Promise<PermissionState>;
  requestPermission?: (descriptor: { mode: 'readwrite' }) => Promise<PermissionState>;
};

async function readPermission(handle: FileSystemDirectoryHandle): Promise<PermissionState> {
  try {
    return await (handle as PermissionHandle).queryPermission?.({ mode: 'readwrite' }) ?? 'prompt';
  } catch {
    return 'prompt';
  }
}

export function useGodotDirectory(
  onConnectedFolderChange: (name: string | null) => void,
  onFolderAccess: (access: FolderAccess) => void,
  onShowToast: (message: string) => void
) {
  const [dirHandle, setDirHandle] = useState<FileSystemDirectoryHandle | null>(null);
  const [pendingHandle, setPendingHandle] = useState<FileSystemDirectoryHandle | null>(null);
  const onName = useRef(onConnectedFolderChange);
  const onAccess = useRef(onFolderAccess);
  const onToast = useRef(onShowToast);
  onName.current = onConnectedFolderChange;
  onAccess.current = onFolderAccess;
  onToast.current = onShowToast;

  const isFsaSupported = typeof window !== 'undefined' && 'showDirectoryPicker' in window;

  useEffect(() => {
    let cancelled = false;
    loadGodotDirHandle().then(async stored => {
      if (cancelled) return;
      if (!stored) {
        onName.current(null);
        onAccess.current('none');
        return;
      }
      const permission = await readPermission(stored);
      if (cancelled) return;
      onName.current(stored.name);
      if (permission === 'granted') {
        setDirHandle(stored);
        setPendingHandle(null);
        onAccess.current('ready');
        return;
      }
      setPendingHandle(stored);
      onAccess.current('prompt');
    }).catch(() => {
      if (!cancelled) onAccess.current('none');
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const applyHandle = async (handle: FileSystemDirectoryHandle) => {
    await saveGodotDirHandle(handle);
    setDirHandle(handle);
    setPendingHandle(null);
    onName.current(handle.name);
    onAccess.current('ready');
    onToast.current(`Папка проекта Godot подключена: ${handle.name}`);
  };

  const pickDirectory = async () => {
    if (!isFsaSupported) {
      onToast.current('Браузер не поддерживает прямой доступ к папкам. Используйте выгрузку ZIP');
      return;
    }
    try {
      // @ts-expect-error File System Access API
      const handle: FileSystemDirectoryHandle = await window.showDirectoryPicker({
        mode: 'readwrite',
        startIn: 'documents'
      });
      await applyHandle(handle);
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== 'AbortError') {
        onToast.current(`Ошибка выбора папки: ${err.message}`);
      }
    }
  };

  const allowDirectory = async () => {
    if (!pendingHandle) return;
    try {
      const permission = await (pendingHandle as PermissionHandle).requestPermission?.({ mode: 'readwrite' }) ?? 'denied';
      if (permission !== 'granted') {
        onToast.current('Запись в папку не разрешена');
        return;
      }
      await applyHandle(pendingHandle);
    } catch (err: unknown) {
      onToast.current(err instanceof Error ? err.message : 'Не удалось вернуть доступ к папке');
    }
  };

  return { dirHandle, pendingHandle, isFsaSupported, pickDirectory, allowDirectory };
}
