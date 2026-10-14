import React, { useState } from 'react';
import type { GoalIndex, PlanItemPatch, PlannedItem, WeekdayKey, WeeklyBigGoal, WeeklyPlanState, WeeklyRetro } from '../entities/weekly-plan';
import { DAY_ORDER, WEEKDAYS_META, dateForWeekday, toIsoDate } from '../entities/weekly-plan';
import type { Task, TaskCategory } from '../entities/task';
import { WeeklyBigThree } from '../features/weekly-planner/WeeklyBigThree';
import { WeeklyFocusTimer } from '../features/weekly-planner/WeeklyFocusTimer';
import { WeeklyRetroModal } from '../features/weekly-planner/WeeklyRetroModal';
import { WeeklyWeekBar } from '../features/weekly-planner/WeeklyWeekBar';
import { WeeklyDayColumn } from '../features/weekly-planner/WeeklyDayColumn';
import { WeeklyBacklogDrawer } from '../features/weekly-planner/WeeklyBacklogDrawer';
import { WeeklyMetricsStrip } from '../features/weekly-planner/WeeklyMetricsStrip';

interface WeeklyPlanPageProps {
  weeklyPlan: WeeklyPlanState;
  tasks: Task[];
  onAddPlanItem: (day: WeekdayKey, title: string, category: TaskCategory, taskId?: string, estimatedMinutes?: number, goalIndex?: GoalIndex) => void;
  onTogglePlanItem: (day: WeekdayKey, itemId: string) => void;
  onRemovePlanItem: (day: WeekdayKey, itemId: string) => void;
  onUpdatePlanItem: (day: WeekdayKey, itemId: string, patch: PlanItemPatch) => void;
  onMovePlanItem: (fromDay: WeekdayKey, toDay: WeekdayKey, itemId: string) => void;
  onUpdateBigGoal: (index: number, text: string) => void;
  onToggleBigGoal: (index: number) => void;
  onSaveRetro: (patch: Partial<WeeklyRetro>) => void;
  onUpdateTitle: (title: string) => void;
  onResetWeek: (keepGoals: boolean) => void;
  onSelectWeek: (weekStart: string) => void;
  onScheduleTask: (task: Task, day: WeekdayKey) => void;
  onTimerPreset: (minutes: number) => void;
  onTimerToggle: () => void;
  onTimerReset: () => void;
  onTimerAddFive: () => void;
  onTimerSubtractFive: () => void;
  onTimerSelectTask: (taskKey: string) => void;
  onLogElapsed: () => void;
  onOpenKanban: () => void;
  onShowToast: (msg: string) => void;
}

type WeekFilterMode = 'all' | 'workdays' | WeekdayKey;

function todayKeyInWeek(weekStart: string): WeekdayKey | null {
  const today = toIsoDate(new Date());
  const match = WEEKDAYS_META.find(meta => dateForWeekday(weekStart, meta.key) === today);
  return match?.key || null;
}

export const WeeklyPlanPage: React.FC<WeeklyPlanPageProps> = ({
  weeklyPlan,
  tasks,
  onAddPlanItem,
  onTogglePlanItem,
  onRemovePlanItem,
  onUpdatePlanItem,
  onMovePlanItem,
  onUpdateBigGoal,
  onToggleBigGoal,
  onSaveRetro,
  onUpdateTitle,
  onResetWeek,
  onSelectWeek,
  onScheduleTask,
  onTimerPreset,
  onTimerToggle,
  onTimerReset,
  onTimerAddFive,
  onTimerSubtractFive,
  onTimerSelectTask,
  onLogElapsed,
  onOpenKanban,
  onShowToast
}) => {
  const [retroOpen, setRetroOpen] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(weeklyPlan.weekTitle);
  const [filterMode, setFilterMode] = useState<WeekFilterMode>(() => {
    const today = todayKeyInWeek(weeklyPlan.weekStart);
    return typeof window !== 'undefined' && window.innerWidth < 850 && today ? today : 'all';
  });
  const [kanbanFilter, setKanbanFilter] = useState<'all' | TaskCategory>('all');
  const [kanbanSearch, setKanbanSearch] = useState('');
  const [showDrawer, setShowDrawer] = useState(false);

  let totalPlanned = 0;
  let totalDone = 0;
  let totalMinutesSpent = 0;
  const taskOptions: { day: WeekdayKey; item: PlannedItem }[] = [];
  const linked = [0, 1, 2].map(() => ({ total: 0, done: 0 }));

  DAY_ORDER.forEach(day => {
    (weeklyPlan.days[day] || []).forEach(item => {
      totalPlanned += 1;
      if (item.done) totalDone += 1;
      if (item.spentMinutes) totalMinutesSpent += item.spentMinutes;
      if (!item.done) taskOptions.push({ day, item });
      if (item.goalIndex !== undefined) {
        linked[item.goalIndex].total += 1;
        if (item.done) linked[item.goalIndex].done += 1;
      }
    });
  });

  const scheduledTaskIds = new Set<string>();
  DAY_ORDER.forEach(day => {
    (weeklyPlan.days[day] || []).forEach(item => {
      if (item.taskId) scheduledTaskIds.add(item.taskId);
    });
  });

  const openTasks = tasks.filter(task => task.status !== 'done');
  const availableTasks = openTasks.filter(task => {
    if (kanbanFilter !== 'all' && task.category !== kanbanFilter) return false;
    if (kanbanSearch.trim() && !task.title.toLowerCase().includes(kanbanSearch.toLowerCase())) return false;
    return true;
  });

  const todayKey = todayKeyInWeek(weeklyPlan.weekStart);
  let displayedDays = WEEKDAYS_META;
  if (filterMode === 'workdays') displayedDays = WEEKDAYS_META.filter(meta => !meta.isWeekend);
  else if (filterMode !== 'all') displayedDays = WEEKDAYS_META.filter(meta => meta.key === filterMode);
  const isSingleDayMode = filterMode !== 'all' && filterMode !== 'workdays';

  const saveTitle = () => {
    const clean = titleDraft.trim();
    if (clean) onUpdateTitle(clean);
    setEditingTitle(false);
  };

  return (
    <div className="view-content weekly-plan-view">
      <header className="weekly-header-banner">
        <div className="weekly-header-info">
          <div className="weekly-header-eyebrow">
            <span className="live-dot" />
            <span>План недели</span>
          </div>
          {editingTitle ? (
            <div className="weekly-title-edit-form">
              <input type="text" className="field weekly-title-input" value={titleDraft} autoFocus onChange={event => setTitleDraft(event.target.value)} onKeyDown={event => { if (event.key === 'Enter') saveTitle(); if (event.key === 'Escape') setEditingTitle(false); }} />
              <button type="button" className="btn btn-primary btn-sm" onClick={saveTitle}>Сохранить</button>
            </div>
          ) : (
            <button type="button" className="weekly-title-display" onClick={() => { setTitleDraft(weeklyPlan.weekTitle); setEditingTitle(true); }}>
              <h2>{weeklyPlan.weekTitle}</h2>
              <span className="weekly-edit-pen" aria-hidden="true">✎</span>
            </button>
          )}
          <WeeklyWeekBar
            weekStart={weeklyPlan.weekStart}
            activeDays={weeklyPlan.days}
            archive={weeklyPlan.archive}
            onSelectWeek={onSelectWeek}
            onPickDay={day => setFilterMode(day)}
            onShowWeek={() => setFilterMode('all')}
            viewingToday={filterMode === todayKey}
            viewingWeek={filterMode === 'all'}
          />
        </div>
        <div className="weekly-header-actions">
          <button type="button" className={`btn ${showDrawer ? 'btn-primary' : 'btn-secondary'} weekly-action-btn`} onClick={() => setShowDrawer(value => !value)}>
            {showDrawer ? 'Скрыть бэклог' : 'Задачи бэклога'}
          </button>
          <button type="button" className="btn btn-primary weekly-retro-btn" onClick={() => setRetroOpen(true)}>Итоги недели</button>
        </div>
      </header>

      <WeeklyMetricsStrip totalPlanned={totalPlanned} totalDone={totalDone} totalMinutesSpent={totalMinutesSpent} />

      {totalPlanned === 0 && openTasks.length > 0 && !showDrawer && (
        <button type="button" className="weekly-empty-callout" onClick={() => setShowDrawer(true)}>
          В бэклоге {openTasks.length} задач. Откройте панель и разложите их по дням.
        </button>
      )}

      <div className="weekly-top-widgets-row">
        <WeeklyBigThree goals={weeklyPlan.bigThree} linkedCounts={linked} onToggleGoal={onToggleBigGoal} onUpdateGoal={onUpdateBigGoal} />
        <WeeklyFocusTimer
          timer={weeklyPlan.timer}
          taskOptions={taskOptions}
          onPreset={onTimerPreset}
          onToggle={onTimerToggle}
          onReset={onTimerReset}
          onAddFive={onTimerAddFive}
          onSubtractFive={onTimerSubtractFive}
          onSelectTask={onTimerSelectTask}
          onLogElapsed={onLogElapsed}
        />
      </div>

      <nav className="weekly-days-nav-card" aria-label="Выбор отображения дней">
        <div className="weekly-nav-pills-scroll">
          <button type="button" className={`weekly-day-tab-pill ${filterMode === 'all' ? 'active' : ''}`} onClick={() => setFilterMode('all')}>
            <span>Вся неделя</span>
            <span className="tab-pill-badge">{totalPlanned}</span>
          </button>
          <button type="button" className={`weekly-day-tab-pill ${filterMode === 'workdays' ? 'active' : ''}`} onClick={() => setFilterMode('workdays')}>
            <span>Будни</span>
          </button>
          <div className="weekly-nav-divider" />
          {WEEKDAYS_META.map(meta => {
            const count = (weeklyPlan.days[meta.key] || []).length;
            const dayNumber = dateForWeekday(weeklyPlan.weekStart, meta.key).slice(-2).replace(/^0/, '');
            return (
              <button key={meta.key} type="button" className={`weekly-day-tab-pill ${filterMode === meta.key ? 'active' : ''} ${meta.key === todayKey ? 'is-today' : ''}`} onClick={() => setFilterMode(meta.key)}>
                <span className="tab-pill-short">{meta.shortLabel} {dayNumber}</span>
                <span className="tab-pill-badge">{count}</span>
              </button>
            );
          })}
        </div>
      </nav>

      <div className={`weekly-board-layout ${showDrawer ? 'with-drawer' : ''}`}>
        <div className={`weekly-days-container ${isSingleDayMode ? 'single-day-mode' : filterMode === 'workdays' ? 'workdays-mode' : 'all-days-mode'}`}>
          {displayedDays.map(meta => (
            <WeeklyDayColumn
              key={meta.key}
              meta={meta}
              weekStart={weeklyPlan.weekStart}
              items={weeklyPlan.days[meta.key] || []}
              isToday={meta.key === todayKey}
              goals={weeklyPlan.bigThree}
              tasks={tasks}
              onShowToast={onShowToast}
              onAdd={(title, category, estimatedMinutes, goalIndex) => onAddPlanItem(meta.key, title, category, undefined, estimatedMinutes, goalIndex)}
              onToggle={itemId => onTogglePlanItem(meta.key, itemId)}
              onRemove={itemId => onRemovePlanItem(meta.key, itemId)}
              onUpdate={(itemId, patch) => onUpdatePlanItem(meta.key, itemId, patch)}
              onMove={onMovePlanItem}
              onScheduleTask={task => onScheduleTask(task, meta.key)}
            />
          ))}
        </div>
        {showDrawer && (
          <WeeklyBacklogDrawer
            tasks={availableTasks}
            scheduledTaskIds={scheduledTaskIds}
            filter={kanbanFilter}
            search={kanbanSearch}
            onFilter={setKanbanFilter}
            onSearch={setKanbanSearch}
            onClose={() => setShowDrawer(false)}
            onOpenKanban={onOpenKanban}
            onSchedule={onScheduleTask}
          />
        )}
      </div>

      <WeeklyRetroModal
        isOpen={retroOpen}
        retro={weeklyPlan.retro}
        totalPlanned={totalPlanned}
        totalDone={totalDone}
        totalMinutesSpent={totalMinutesSpent}
        onClose={() => setRetroOpen(false)}
        onSaveRetro={onSaveRetro}
        onResetWeek={onResetWeek}
      />
    </div>
  );
};
