import { classifySwRequest } from '../shared/lib/swPolicy';

declare const __PRECACHE_URLS__: string[];

const CACHE_NAME = 'cyber-duck-hub-v2';
const PRECACHE_URLS: string[] = __PRECACHE_URLS__;

interface WorkerGlobal {
  skipWaiting: () => Promise<void>;
  clients: { claim: () => Promise<void> };
  addEventListener: (type: string, listener: (event: Event) => void) => void;
  location: { origin: string };
}

const worker = globalThis as unknown as WorkerGlobal;

interface WaitUntilEvent extends Event {
  waitUntil: (work: Promise<unknown>) => void;
}

interface FetchEventLike extends WaitUntilEvent {
  request: Request;
  respondWith: (response: Promise<Response> | Response) => void;
}

function offlineDocument(): Response {
  const html = `<!doctype html><html lang="ru"><meta charset="utf-8"><title>Офлайн</title><body style="margin:0;min-height:100vh;display:grid;place-items:center;background:#050811;color:#e2e8f0;font-family:sans-serif"><p>Хаб ещё не в кэше. Подключитесь к сети и откройте страницу один раз.</p></body></html>`;
  return new Response(html, {
    status: 503,
    headers: { 'Content-Type': 'text/html; charset=utf-8' }
  });
}

const FONT_CSS = 'https://fonts.googleapis.com/css2?family=Cinzel:wght@700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap';

async function precacheFonts(cache: Cache): Promise<void> {
  const cssResponse = await fetch(FONT_CSS);
  if (!cssResponse.ok) return;
  const css = await cssResponse.clone().text();
  await cache.put(FONT_CSS, cssResponse);
  const fontUrls = [...css.matchAll(/url\(([^)]+)\)/g)].map(match => match[1].replace(/['"]/g, ''));
  await Promise.all(fontUrls.map(async url => {
    const absolute = new URL(url, FONT_CSS).href;
    const font = await fetch(absolute);
    if (font.ok) await cache.put(absolute, font);
  }));
}

async function precache(): Promise<void> {
  const cache = await caches.open(CACHE_NAME);
  const missing: string[] = [];
  await Promise.all(PRECACHE_URLS.map(async url => {
    try {
      const response = await fetch(url, { cache: 'reload' });
      if (!response.ok) {
        missing.push(url);
        return;
      }
      await cache.put(url, response);
    } catch {
      missing.push(url);
    }
  }));
  if (missing.length > 0) {
    throw new Error(`[PWA] Не удалось закэшировать: ${missing.join(', ')}`);
  }
  try {
    await precacheFonts(cache);
  } catch (error) {
    console.warn('[PWA] Шрифты не попали в кэш', error);
  }
}

async function fromCache(request: Request): Promise<Response | undefined> {
  return (await caches.match(request)) || undefined;
}

async function putCache(request: Request, response: Response): Promise<void> {
  if (!(response.ok || response.type === 'opaque')) return;
  const cache = await caches.open(CACHE_NAME);
  await cache.put(request, response.clone());
}

async function networkFirstDocument(request: Request): Promise<Response> {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      await cache.put('/index.html', response.clone());
      await cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = (await caches.match('/index.html')) || (await caches.match('/')) || (await caches.match(request));
    return cached || offlineDocument();
  }
}

async function cacheFirstStatic(request: Request): Promise<Response> {
  const cached = await fromCache(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok && response.type === 'basic') await putCache(request, response);
    return response;
  } catch {
    return new Response('Ресурс недоступен офлайн', { status: 504, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
  }
}

async function networkFirstFont(request: Request): Promise<Response> {
  try {
    const response = await fetch(request);
    await putCache(request, response);
    return response;
  } catch {
    const cached = await fromCache(request);
    if (cached) return cached;
    return new Response('', { status: 504 });
  }
}

worker.addEventListener('install', event => {
  (event as WaitUntilEvent).waitUntil(precache());
});

worker.addEventListener('activate', event => {
  (event as WaitUntilEvent).waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key.startsWith('cyber-duck-hub-') && key !== CACHE_NAME).map(key => caches.delete(key)));
    await worker.clients.claim();
  })());
});

worker.addEventListener('message', event => {
  const data = (event as MessageEvent).data as { type?: string } | null;
  if (data?.type === 'SKIP_WAITING') void worker.skipWaiting();
});

worker.addEventListener('fetch', event => {
  const fetchEvent = event as FetchEventLike;
  const request = fetchEvent.request;
  const route = classifySwRequest({
    method: request.method,
    url: request.url,
    mode: request.mode,
    sameOrigin: new URL(request.url).origin === worker.location.origin,
    hasRange: request.headers.has('range')
  });
  if (route === 'bypass') return;
  if (route === 'navigate') {
    fetchEvent.respondWith(networkFirstDocument(request));
    return;
  }
  if (route === 'font') {
    fetchEvent.respondWith(networkFirstFont(request));
    return;
  }
  fetchEvent.respondWith(cacheFirstStatic(request));
});
