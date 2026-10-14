export type SwRoute = 'bypass' | 'navigate' | 'font' | 'static';

export interface SwRequestShape {
  method: string;
  url: string;
  mode?: string;
  sameOrigin: boolean;
  hasRange?: boolean;
}

const AI_HOSTS = ['groq.com', 'openrouter.ai', 'deepseek.com'];
const FONT_HOSTS = ['fonts.googleapis.com', 'fonts.gstatic.com'];
const STATIC_EXT = /\.(?:js|css|svg|png|webp|jpe?g|gif|ico|woff2?|webmanifest)$/i;

function hostMatches(hostname: string, suffixes: string[]): boolean {
  return suffixes.some(suffix => hostname === suffix || hostname.endsWith(`.${suffix}`));
}

export function classifySwRequest(input: SwRequestShape): SwRoute {
  if (input.method !== 'GET' || input.hasRange) return 'bypass';

  let parsed: URL;
  try {
    parsed = new URL(input.url);
  } catch {
    return 'bypass';
  }

  if (hostMatches(parsed.hostname, AI_HOSTS)) return 'bypass';
  if (hostMatches(parsed.hostname, FONT_HOSTS)) return 'font';
  if (parsed.pathname === '/sw.js') return 'bypass';
  if (parsed.pathname.startsWith('/api/')) return 'bypass';

  const isDocument =
    input.mode === 'navigate' ||
    parsed.pathname === '/' ||
    parsed.pathname.endsWith('/index.html');
  if (isDocument) return 'navigate';

  if (!input.sameOrigin) return 'bypass';
  if (STATIC_EXT.test(parsed.pathname)) return 'static';
  return 'bypass';
}
