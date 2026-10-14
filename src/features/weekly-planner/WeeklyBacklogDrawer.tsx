import React from 'react';
import type { WeekdayKey } from '../../entities/weekly-plan';
import { WEEKDAYS_META } from '../../entities/weekly-plan';
import type { Task, TaskCategory } from '../../entities/task';
import { CATEGORY_MAP } from './categoryMap';

interface WeeklyBacklogDrawerProps {
  tasks: Task[];
  scheduledTaskIds: Set<string>;
  filter: 'all' | TaskCategory;
  search: string;
  onFilter: (filter: 'all' | TaskCategory) => void;
  onSearch: (value: string) => void;
  onClose: () => void;
  onOpenKanban: () => void;
  onSchedule: (task: Task, day: WeekdayKey) => void;
}

export const WeeklyBacklogDrawer: React.FC<WeeklyBacklogDrawerProps> = ({
  tasks,
  scheduledTaskIds,
  filter,
  search,
  onFilter,
  onSearch,
  onClose,
  onOpenKanban,
  onSchedule
}) => (
  <aside className="weekly-kanban-drawer panel" aria-label="Задачи спринта и бэклога">
    <div className="weekly-drawer-header">
      <div>
        <h4 className="weekly-drawer-title-main">Бэклог и спринт</h4>
        <p className="weekly-drawer-desc">Перетащите задачу в день или нажмите день недели</p>
      </div>
      <div className="weekly-drawer-actions">
        <button type="button" className="btn btn-secondary btn-sm" onClick={onOpenKanban}>Канбан</button>
        <button type="button" className="modal-close" onClick={onClose} aria-label="Закрыть панель бэклога">×</button>
      </div>
    </div>
    <div className="weekly-drawer-cats">
      {(['all', 'code', 'art', 'design', 'audio'] as const).map(value => (
        <button key={value} type="button" className={`chip-btn ${filter === value ? 'active' : ''}`} onClick={() => onFilter(value)}>
          {value === 'all' ? 'Все' : CATEGORY_MAP[value].label}
        </button>
      ))}
    </div>
    <input type="text" className="field weekly-drawer-search" placeholder="Поиск задачи в бэклоге" value={search} onChange={event => onSearch(event.target.value)} />
    <div className="weekly-drawer-task-list">
      {tasks.length === 0 ? (
        <div className="weekly-drawer-empty">
          <span>Нет доступных задач</span>
          <small>Все задачи выполнены или скрыты фильтром</small>
        </div>
      ) : tasks.map(task => {
        const scheduled = scheduledTaskIds.has(task.id);
        const catStyle = CATEGORY_MAP[task.category] || CATEGORY_MAP.code;
        return (
          <div
            key={task.id}
            className={`weekly-drawer-card ${scheduled ? 'is-scheduled' : ''}`}
            draggable={!scheduled}
            onDragStart={event => {
              event.dataTransfer.setData('text/plain', JSON.stringify({ type: 'kanban-task', id: task.id }));
            }}
          >
            <div className="weekly-drawer-card-top">
              <span className="weekly-card-tag" style={{ color: catStyle.color, backgroundColor: catStyle.bg }}>{catStyle.icon} {catStyle.label}</span>
              {scheduled && <span className="weekly-scheduled-badge">В плане</span>}
            </div>
            <div className="weekly-drawer-card-title">{task.title}</div>
            <div className="weekly-quick-schedule-bar">
              <span className="schedule-hint">В день:</span>
              <div className="schedule-pills">
                {WEEKDAYS_META.map(meta => (
                  <button key={meta.key} type="button" className="weekly-schedule-pill-btn" title={`Запланировать на ${meta.accusative}`} disabled={scheduled} onClick={() => onSchedule(task, meta.key)}>
                    {meta.shortLabel}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  </aside>
);
