import { ViewType, viewForNumberKey } from '../../shared/config/views';

export interface HotkeyEvent {
  key: string;
  ctrlKey: boolean;
  metaKey: boolean;
  altKey: boolean;
  shiftKey: boolean;
  typing: boolean;
}

export type HotkeyCommand =
  | { type: 'palette' }
  | { type: 'close' }
  | { type: 'help' }
  | { type: 'glossary' }
  | { type: 'mute' }
  | { type: 'view'; view: ViewType };

export function resolveHotkey(event: HotkeyEvent, blockAppShortcuts: boolean): HotkeyCommand | null {
  const key = event.key;
  if ((event.ctrlKey || event.metaKey) && !event.altKey && (key === 'k' || key === 'K' || key === 'л' || key === 'Л')) {
    return { type: 'palette' };
  }
  if (key === 'Escape') return { type: 'close' };
  if (event.typing || blockAppShortcuts || event.ctrlKey || event.altKey || event.metaKey) return null;
  if (key === '?' || key === 'F1') return { type: 'help' };
  if (key === 'g' || key === 'G' || key === 'п' || key === 'П') return { type: 'glossary' };
  if (key === 'm' || key === 'M' || key === 'ь' || key === 'Ь') return { type: 'mute' };
  const view = viewForNumberKey(key);
  if (view && !event.shiftKey) return { type: 'view', view };
  return null;
}
