import { useCallback, useEffect, useRef, useState } from 'react';

function dropDevWorkers(): void {
  if (!('serviceWorker' in navigator)) return;
  void navigator.serviceWorker.getRegistrations().then(registrations => {
    for (const registration of registrations) void registration.unregister();
  });
  if (!('caches' in window)) return;
  void caches.keys().then(keys => {
    for (const key of keys) {
      if (key.startsWith('cyber-duck-hub-')) void caches.delete(key);
    }
  });
}

export function useServiceWorkerControlled(): boolean {
  const [controlled, setControlled] = useState(() =>
    typeof navigator !== 'undefined' && 'serviceWorker' in navigator && Boolean(navigator.serviceWorker.controller)
  );

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;
    const sync = () => setControlled(Boolean(navigator.serviceWorker.controller));
    navigator.serviceWorker.addEventListener('controllerchange', sync);
    sync();
    return () => navigator.serviceWorker.removeEventListener('controllerchange', sync);
  }, []);

  return controlled;
}

export function usePwaUpdate(): { updateReady: boolean; applyUpdate: () => void } {
  const [updateReady, setUpdateReady] = useState(false);
  const waitingRef = useRef<ServiceWorker | null>(null);
  const expectReload = useRef(false);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    if (import.meta.env.DEV) {
      dropDevWorkers();
      return;
    }

    const onControllerChange = () => {
      if (!expectReload.current) return;
      window.location.reload();
    };
    navigator.serviceWorker.addEventListener('controllerchange', onControllerChange);

    const watch = (registration: ServiceWorkerRegistration) => {
      const seen = new WeakSet<ServiceWorker>();
      const track = (worker: ServiceWorker | null) => {
        if (!worker || seen.has(worker)) return;
        seen.add(worker);
        const ready = () => {
          if (worker.state === 'installed' && navigator.serviceWorker.controller) {
            waitingRef.current = worker;
            setUpdateReady(true);
          }
        };
        ready();
        worker.addEventListener('statechange', ready);
      };
      track(registration.installing);
      track(registration.waiting);
      registration.addEventListener('updatefound', () => track(registration.installing));
    };

    const register = () => {
      navigator.serviceWorker.register('/sw.js').then(watch).catch(error => {
        console.warn('[PWA] Ошибка регистрации Service Worker:', error);
      });
    };

    if (document.readyState === 'complete') register();
    else window.addEventListener('load', register, { once: true });

    return () => navigator.serviceWorker.removeEventListener('controllerchange', onControllerChange);
  }, []);

  const applyUpdate = useCallback(() => {
    const waiting = waitingRef.current;
    if (!waiting) return;
    expectReload.current = true;
    waiting.postMessage({ type: 'SKIP_WAITING' });
  }, []);

  return { updateReady, applyUpdate };
}
