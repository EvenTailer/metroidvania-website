import React from 'react';

interface WeeklyMetricsStripProps {
  totalPlanned: number;
  totalDone: number;
  totalMinutesSpent: number;
}

export const WeeklyMetricsStrip: React.FC<WeeklyMetricsStripProps> = ({
  totalPlanned,
  totalDone,
  totalMinutesSpent
}) => {
  const weekProgressPct = totalPlanned > 0 ? Math.round((totalDone / totalPlanned) * 100) : 0;
  const hoursSpent = (totalMinutesSpent / 60).toFixed(1);
  return (
    <section className="weekly-metrics-strip" aria-label="Метрики спринта">
      <div className="weekly-metric-item">
        <div className="metric-header"><span className="metric-icon">📋</span><span className="metric-label">Всего в плане</span></div>
        <span className="metric-value">{totalPlanned}</span>
        <span className="metric-sub">{totalPlanned === 0 ? 'пока ни одной задачи' : 'задач на неделю'}</span>
      </div>
      <div className="weekly-metric-item">
        <div className="metric-header"><span className="metric-icon">✅</span><span className="metric-label">Выполнено</span></div>
        <span className="metric-value accent-emerald">{totalDone}</span>
        <span className="metric-sub">{totalDone === 0 ? 'закрытых задач нет' : 'задач закрыто'}</span>
      </div>
      <div className="weekly-metric-item">
        <div className="metric-header"><span className="metric-icon">⚡</span><span className="metric-label">Прогресс</span></div>
        <div className="metric-value-row">
          <span className="metric-value accent-cyan">{totalPlanned === 0 ? '—' : `${weekProgressPct}%`}</span>
          <div className="weekly-strip-progress" aria-hidden="true"><div className="weekly-strip-progress-fill" style={{ width: `${weekProgressPct}%` }} /></div>
        </div>
        <span className="metric-sub">{totalPlanned === 0 ? 'неделя ещё пустая' : `${totalDone} из ${totalPlanned} задач`}</span>
      </div>
      <div className="weekly-metric-item">
        <div className="metric-header"><span className="metric-icon">⏱️</span><span className="metric-label">Время в фокусе</span></div>
        <span className="metric-value accent-purple">{hoursSpent} ч</span>
        <span className="metric-sub">{totalMinutesSpent === 0 ? 'сессий ещё не было' : `${totalMinutesSpent} минут`}</span>
      </div>
    </section>
  );
};
