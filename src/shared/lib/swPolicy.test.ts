import { describe, expect, it } from 'vitest';
import { classifySwRequest } from './swPolicy';

const origin = 'https://hub.local';

function shape(url: string, extra: Partial<Parameters<typeof classifySwRequest>[0]> = {}) {
  return {
    method: 'GET',
    url,
    sameOrigin: new URL(url).origin === origin,
    ...extra
  };
}

describe('классификация запросов service worker', () => {
  it('не кэширует API, ИИ и сам воркер', () => {
    expect(classifySwRequest(shape(`${origin}/api/gallery.php`))).toBe('bypass');
    expect(classifySwRequest(shape('https://api.groq.com/openai/v1/chat'))).toBe('bypass');
    expect(classifySwRequest(shape('https://openrouter.ai/api/v1/chat'))).toBe('bypass');
    expect(classifySwRequest(shape('https://api.deepseek.com/chat'))).toBe('bypass');
    expect(classifySwRequest(shape(`${origin}/sw.js`))).toBe('bypass');
    expect(classifySwRequest(shape(`${origin}/index.html`, { method: 'POST' }))).toBe('bypass');
    expect(classifySwRequest(shape(`${origin}/assets/a.js`, { hasRange: true }))).toBe('bypass');
  });

  it('отдаёт оболочку из сети, статику из кэша, шрифты отдельно', () => {
    expect(classifySwRequest(shape(`${origin}/`, { mode: 'navigate' }))).toBe('navigate');
    expect(classifySwRequest(shape(`${origin}/index.html`))).toBe('navigate');
    expect(classifySwRequest(shape(`${origin}/assets/index-abc.js`))).toBe('static');
    expect(classifySwRequest(shape(`${origin}/favicon.svg`))).toBe('static');
    expect(classifySwRequest(shape('https://fonts.googleapis.com/css2?family=Cinzel'))).toBe('font');
    expect(classifySwRequest(shape('https://fonts.gstatic.com/s/cinzel.woff2'))).toBe('font');
  });
});
