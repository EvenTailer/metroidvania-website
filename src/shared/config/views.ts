export type ViewType =
  | 'dashboard'
  | 'weekly-plan'
  | 'roadmap'
  | 'kanban'
  | 'team-chat'
  | 'gallery'
  | 'hero'
  | 'notes'
  | 'ai-chat'
  | 'ai-export'
  | 'fsd-spec'
  | 'room-matrix'
  | 'bestiary'
  | 'playtest'
  | 'asset-pipeline'
  | 'gdscript-generator'
  | 'engine-bridge';

const VIEWS = new Set<ViewType>([
  'dashboard',
  'weekly-plan',
  'roadmap',
  'kanban',
  'team-chat',
  'gallery',
  'hero',
  'notes',
  'ai-chat',
  'ai-export',
  'fsd-spec',
  'room-matrix',
  'bestiary',
  'playtest',
  'asset-pipeline',
  'gdscript-generator',
  'engine-bridge'
]);

export const NUMBER_KEY_VIEWS: Record<string, ViewType> = {
  '1': 'dashboard',
  '2': 'weekly-plan',
  '3': 'roadmap',
  '4': 'kanban',
  '5': 'room-matrix',
  '6': 'bestiary',
  '7': 'playtest',
  '8': 'asset-pipeline',
  '9': 'gdscript-generator',
  '0': 'engine-bridge'
};

export function viewForNumberKey(key: string): ViewType | undefined {
  return NUMBER_KEY_VIEWS[key];
}

export function numberKeyForView(view: ViewType): string | undefined {
  return Object.entries(NUMBER_KEY_VIEWS).find(([, value]) => value === view)?.[0];
}

export function viewFromLocation(): ViewType {
  const raw = window.location.hash.replace(/^#\/?/, '').split(/[?#]/)[0];
  return VIEWS.has(raw as ViewType) ? (raw as ViewType) : 'dashboard';
}

export function writeViewHash(view: ViewType, mode: 'push' | 'replace') {
  const next = `#/${view}`;
  if (window.location.hash === next) return;
  const url = `${window.location.pathname}${window.location.search}${next}`;
  if (mode === 'push') history.pushState({ view }, '', url);
  else history.replaceState({ view }, '', url);
  window.dispatchEvent(new HashChangeEvent('hashchange'));
}
