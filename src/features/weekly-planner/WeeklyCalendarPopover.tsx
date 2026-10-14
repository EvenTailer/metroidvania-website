import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  WEEKDAYS_META,
  WeekdayKey,
  dateForWeekday,
  formatMonthTitle,
  formatWeekRange,
  mondayOf,
  mondayOfIso,
  monthCells,
  parseIsoDate,
  toIsoDate,
  weekdayKeyFromIso
} from '../../entities/weekly-plan';
import type { PlannedItem } from '../../entities/weekly-plan';

interface WeeklyCalendarPopoverProps {
  weekStart: string;
  activeDays: Record<WeekdayKey, PlannedItem[]>;
  archive: Record<string, { days: Record<WeekdayKey, PlannedItem[]> }>;
  onSelectDate: (iso: string) => void;
  onClose: () => void;
}

function taskCount(
  iso: string,
  weekStart: string,
  activeDays: Record<WeekdayKey, PlannedItem[]>,
  archive: WeeklyCalendarPopoverProps['archive']
): number {
  const monday = mondayOfIso(iso);
  const key = weekdayKeyFromIso(iso);
  const days = monday === weekStart ? activeDays : archive[monday]?.days;
  return days?.[key]?.length || 0;
}

export const WeeklyCalendarPopover: React.FC<WeeklyCalendarPopoverProps> = ({
  weekStart,
  activeDays,
  archive,
  onSelectDate,
  onClose
}) => {
  const startDate = parseIsoDate(weekStart);
  const [cursor, setCursor] = useState({ year: startDate.getFullYear(), month: startDate.getMonth() });
  const panelRef = useRef<HTMLDivElement>(null);
  const todayIso = toIsoDate(new Date());

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const cells = useMemo(() => monthCells(cursor.year, cursor.month), [cursor.year, cursor.month]);
  const weeks: string[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

  const shiftMonth = (delta: number) => {
    const date = new Date(cursor.year, cursor.month + delta, 1);
    setCursor({ year: date.getFullYear(), month: date.getMonth() });
  };

  return (
    <div className="weekly-calendar-popover" ref={panelRef} role="dialog" aria-label="Календарь недель">
      <div className="weekly-cal-head">
        <button type="button" className="weekly-weekbar-arrow" onClick={() => shiftMonth(-1)} aria-label="Предыдущий месяц">‹</button>
        <strong>{formatMonthTitle(cursor.year, cursor.month)}</strong>
        <button type="button" className="weekly-weekbar-arrow" onClick={() => shiftMonth(1)} aria-label="Следующий месяц">›</button>
      </div>
      <div className="weekly-cal-dow">
        {WEEKDAYS_META.map(meta => <span key={meta.key}>{meta.shortLabel}</span>)}
      </div>
      <div className="weekly-cal-grid">
        {weeks.map(week => {
          const rowStart = mondayOfIso(week[0]);
          const selected = rowStart === weekStart;
          return (
            <div key={rowStart} className={`weekly-cal-week ${selected ? 'is-selected' : ''}`}>
              {week.map(iso => {
                const inMonth = parseIsoDate(iso).getMonth() === cursor.month;
                const count = taskCount(iso, weekStart, activeDays, archive);
                return (
                  <button
                    key={iso}
                    type="button"
                    className={`weekly-cal-day ${inMonth ? '' : 'is-outside'} ${iso === todayIso ? 'is-today' : ''} ${count > 0 ? 'has-tasks' : ''}`}
                    onClick={() => onSelectDate(iso)}
                    aria-label={`${parseIsoDate(iso).getDate()} ${formatWeekRange(mondayOf(parseIsoDate(iso)))}${count ? `, задач: ${count}` : ''}`}
                  >
                    <span>{parseIsoDate(iso).getDate()}</span>
                    {count > 0 && <i aria-hidden="true" />}
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>
      <p className="weekly-cal-hint">Нажмите день — откроется его неделя и колонка.</p>
    </div>
  );
};

export function dateLabel(weekStart: string, key: WeekdayKey): string {
  return String(parseIsoDate(dateForWeekday(weekStart, key)).getDate());
}
