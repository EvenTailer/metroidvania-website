import { StateMachineState } from './types';

const RU: Record<string, string> = {
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z', и: 'i', й: 'y',
  к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f',
  х: 'h', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'sch', ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya'
};

export function gdFloat(value: number): string {
  if (!Number.isFinite(value)) return '0.0';
  const text = String(value);
  return text.includes('.') || text.includes('e') ? text : `${text}.0`;
}

export function gdString(value: string): string {
  return `"${value.replace(/\\/g, '\\\\').replace(/"/g, '')}"`;
}

export function gdEnumName(state: StateMachineState): string {
  const source = (state.name || state.id).trim().toLowerCase();
  let latin = '';
  for (const ch of source) latin += RU[ch] ?? ch;
  let name = latin.replace(/[^a-z0-9_]+/g, '_').replace(/^_+|_+$/g, '');
  if (!name || /^[0-9]/.test(name)) name = `state_${name || 'custom'}`;
  return name.toUpperCase();
}

export type StateRole = 'idle' | 'run' | 'jump' | 'fall' | 'dash' | 'parry' | 'hurt' | 'dead' | 'wall' | 'custom';

const KNOWN: StateRole[] = ['idle', 'run', 'jump', 'fall', 'dash', 'parry', 'hurt', 'dead'];

export function stateRole(state: StateMachineState): StateRole {
  const id = state.id.toLowerCase();
  if (KNOWN.includes(id as StateRole)) return id as StateRole;
  const blob = `${id} ${state.name}`.toLowerCase();
  if (blob.includes('wall')) return 'wall';
  return 'custom';
}
