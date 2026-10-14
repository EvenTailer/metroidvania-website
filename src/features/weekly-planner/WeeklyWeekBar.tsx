import React, { useEffect, useRef, useState } from 'react';
import { addDays, formatWeekRange, toIsoDate, weekdayKeyFromIso } from '../../entities/weekly-plan';
import type { PlannedItem, WeekdayKey } from '../../entities/weekly-plan';
import { WeeklyCalendarPopover } from './WeeklyCalendarPopover';

interface WeeklyWeekBarProps {
  weekStart: string;
  activeDays: Record<WeekdayKey, PlannedItem[]>;
  archive: Record<string, { days: Record<WeekdayKey, PlannedItem[]> }>;
  onSelectWeek: (weekStart: string) => void;
  onPickDay: (day: WeekdayKey) => void;
  onShowWeek: () => void;
  viewingToday: boolean;
  viewingWeek: boolean;
}

export const WeeklyWeekBar: React.FC<WeeklyWeekBarProps> = ({
  weekStart,
  activeDays,
  archive,
  onSelectWeek,
  onPickDay,
  onShowWeek,
  viewingToday,
  viewingWeek
}) => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onPointer = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onPointer);
    return () => document.removeEventListener('mousedown', onPointer);
  }, [open]);

  const jumpTo = (iso: string) => {
    onSelectWeek(iso);
    onPickDay(weekdayKeyFromIso(iso));
    setOpen(false);
  };

  return (
    <div className="weekly-weekbar" ref={rootRef}>
      <button type="button" className="weekly-weekbar-arrow" aria-label="Предыдущая неделя" onClick={() => onSelectWeek(addDays(weekStart, -7))}>‹</button>
      <button
        type="button"
        className="weekly-weekbar-range"
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => setOpen(value => !value)}
      >
        <span>{formatWeekRange(weekStart)}</span>
        <span className="weekly-weekbar-caret">{open ? '▴' : '▾'}</span>
      </button>
      <button type="button" className="weekly-weekbar-arrow" aria-label="Следующая неделя" onClick={() => onSelectWeek(addDays(weekStart, 7))}>›</button>
      <div className="weekly-weekbar-switch" role="group" aria-label="Вид дней">
        <button
          type="button"
          className={`weekly-weekbar-switch-btn ${viewingToday ? 'is-active' : ''}`}
          aria-pressed={viewingToday}
          onClick={() => jumpTo(toIsoDate(new Date()))}
        >
          Сегодня
        </button>
        <button
          type="button"
          className={`weekly-weekbar-switch-btn ${viewingWeek ? 'is-active' : ''}`}
          aria-pressed={viewingWeek}
          onClick={onShowWeek}
        >
          Неделя
        </button>
      </div>
      {open && (
        <WeeklyCalendarPopover
          weekStart={weekStart}
          activeDays={activeDays}
          archive={archive}
          onClose={() => setOpen(false)}
          onSelectDate={jumpTo}
        />
      )}
    </div>
  );
};
