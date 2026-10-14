import React, { useEffect, useState } from 'react';
import type { FocusTimerState, PlannedItem, WeekdayKey } from '../../entities/weekly-plan';
import { WEEKDAYS_META, elapsedMinutesToLog, timerElapsedMs, timerRemainingMs } from '../../entities/weekly-plan';

interface TaskOption {
  day: WeekdayKey;
  item: PlannedItem;
}

interface WeeklyFocusTimerProps {
  timer: FocusTimerState;
  taskOptions: TaskOption[];
  onPreset: (minutes: number) => void;
  onToggle: () => void;
  onReset: () => void;
  onAddFive: () => void;
  onSubtractFive: () => void;
  onSelectTask: (key: string) => void;
  onLogElapsed: () => void;
}

const PRESETS = [
  { label: '25м', value: 25 },
  { label: '50м', value: 50 },
  { label: '15м', value: 15 }
];

export const WeeklyFocusTimer: React.FC<WeeklyFocusTimerProps> = ({
  timer,
  taskOptions,
  onPreset,
  onToggle,
  onReset,
  onAddFive,
  onSubtractFive,
  onSelectTask,
  onLogElapsed
}) => {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(id);
  }, []);

  const remaining = timerRemainingMs(timer, now);
  const secondsLeft = Math.ceil(remaining / 1000);
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const totalSecs = timer.targetMinutes * 60;
  const progressRatio = totalSecs > 0 ? Math.min(1, (timerElapsedMs(timer, now) / 1000) / totalSecs) : 0;
  const strokeDashoffset = 283 * (1 - progressRatio);
  const logMinutes = elapsedMinutesToLog(timer, now);
  const elapsedMs = timerElapsedMs(timer, now);
  const minTarget = Math.max(5, Math.ceil(elapsedMs / 60_000));
  const canSubtractFive = timer.targetMinutes - 5 >= minTarget;
  const finished = !timer.running && timer.elapsedMs >= timer.targetMinutes * 60_000 && timer.elapsedMs > 0;

  return (
    <section className="panel weekly-timer-card" aria-label="Таймер фокуса разработки">
      <div className="weekly-timer-header">
        <div className="weekly-timer-header-left">
          <div className="weekly-timer-icon" aria-hidden="true">⏱️</div>
          <div>
            <div className="weekly-badge-tag cyan">Фокус</div>
            <h3 className="weekly-planner-card-title">Таймер фокуса</h3>
            <p className="weekly-card-subtitle">Сессия продолжается, даже если уйти со страницы</p>
          </div>
        </div>
        <div className="weekly-timer-presets-row" role="group" aria-label="Длительность сессии">
          {PRESETS.map(preset => (
            <button key={preset.value} type="button" className={`weekly-preset-chip ${timer.targetMinutes === preset.value ? 'active' : ''}`} onClick={() => onPreset(preset.value)}>
              {preset.label}
            </button>
          ))}
        </div>
      </div>
      <div className="weekly-timer-main-layout">
        <div className="weekly-dial-wrapper">
          <svg className="weekly-dial-svg" viewBox="0 0 100 100" aria-hidden="true">
            <circle className="weekly-dial-track" cx="50" cy="50" r="45" />
            <circle className={`weekly-dial-progress ${timer.running ? 'is-active' : ''}`} cx="50" cy="50" r="45" style={{ strokeDashoffset }} />
          </svg>
          <div className="weekly-dial-inner">
            <span className="weekly-dial-digits">{timeFormatted}</span>
            <span className={`weekly-dial-status ${timer.running ? 'pulse' : ''}`}>
              {timer.running ? 'Работа' : finished ? 'Финиш' : 'Пауза'}
            </span>
          </div>
        </div>
        <div className="weekly-timer-controls-area">
          <div className="weekly-timer-btn-row">
            <button type="button" className={`btn ${timer.running ? 'btn-secondary' : 'btn-primary'} weekly-timer-main-btn`} onClick={onToggle}>
              {timer.running ? 'Пауза' : finished ? 'Заново' : 'Старт'}
            </button>
            <button type="button" className="btn btn-secondary weekly-timer-sub-btn" onClick={onReset}>Сброс</button>
            <button type="button" className="btn btn-secondary weekly-timer-sub-btn" onClick={onSubtractFive} disabled={!canSubtractFive}>−5 мин</button>
            <button type="button" className="btn btn-secondary weekly-timer-sub-btn" onClick={onAddFive}>+5 мин</button>
          </div>
          <div className="weekly-timer-bind-box">
            <label className="weekly-bind-label" htmlFor="weekly-timer-task-select">Записать время в задачу</label>
            <div className="weekly-bind-controls">
              <select id="weekly-timer-task-select" className="modal-select weekly-bind-select" value={timer.selectedTaskKey} onChange={event => onSelectTask(event.target.value)}>
                <option value="">Выберите задачу</option>
                {taskOptions.map(opt => {
                  const short = WEEKDAYS_META.find(meta => meta.key === opt.day)?.shortLabel || '';
                  const title = opt.item.title.length > 34 ? `${opt.item.title.slice(0, 34)}…` : opt.item.title;
                  return <option key={`${opt.day}:${opt.item.id}`} value={`${opt.day}:${opt.item.id}`}>[{short}] {title}</option>;
                })}
              </select>
              <button type="button" className="btn btn-primary weekly-bind-btn" disabled={!timer.selectedTaskKey || logMinutes <= 0} onClick={onLogElapsed}>
                {logMinutes > 0 ? `Записать ${logMinutes} мин` : 'Записать'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
