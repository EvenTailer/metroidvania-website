import type { WeekdayKey } from './types';

export const DAY_ORDER: WeekdayKey[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

const MONTHS_GENITIVE = [
  'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
  'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
];

const MONTHS_NOMINATIVE = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
];

export function toIsoDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function parseIsoDate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

export function isIsoDate(value: unknown): value is string {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export function addDays(iso: string, days: number): string {
  const date = parseIsoDate(iso);
  date.setDate(date.getDate() + days);
  return toIsoDate(date);
}

export function mondayOf(date: Date): string {
  const local = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const jsDay = local.getDay();
  const diff = jsDay === 0 ? -6 : 1 - jsDay;
  local.setDate(local.getDate() + diff);
  return toIsoDate(local);
}

export function mondayOfIso(iso: string): string {
  return mondayOf(parseIsoDate(iso));
}

export function weekdayKeyFromIso(iso: string): WeekdayKey {
  const jsDay = parseIsoDate(iso).getDay();
  if (jsDay === 0) return 'sun';
  return DAY_ORDER[jsDay - 1] || 'mon';
}

export function dateForWeekday(weekStart: string, key: WeekdayKey): string {
  return addDays(weekStart, Math.max(0, DAY_ORDER.indexOf(key)));
}

export function formatWeekRange(weekStart: string): string {
  const start = parseIsoDate(weekStart);
  const end = parseIsoDate(addDays(weekStart, 6));
  const year = end.getFullYear();
  if (start.getMonth() === end.getMonth()) {
    return `${start.getDate()}–${end.getDate()} ${MONTHS_GENITIVE[end.getMonth()]} ${year}`;
  }
  return `${start.getDate()} ${MONTHS_GENITIVE[start.getMonth()]} – ${end.getDate()} ${MONTHS_GENITIVE[end.getMonth()]} ${year}`;
}

export function formatMonthTitle(year: number, monthIndex: number): string {
  return `${MONTHS_NOMINATIVE[monthIndex] || ''} ${year}`;
}

export function defaultWeekTitle(weekStart: string): string {
  return `Неделя ${formatWeekRange(weekStart)}`;
}

export function monthCells(year: number, monthIndex: number): string[] {
  const first = new Date(year, monthIndex, 1);
  const start = parseIsoDate(mondayOf(first));
  const cells: string[] = [];
  for (let i = 0; i < 42; i++) {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    cells.push(toIsoDate(date));
  }
  return cells;
}
