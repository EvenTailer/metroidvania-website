import React, { useEffect, useState } from 'react';
import { Task, TaskStatus } from '../entities/task';
import { RoadmapStep } from '../entities/roadmap';
import { TaskDetail } from '../features/task-form/TaskDetail';
import { TaskDraft, TaskSheet } from '../features/task-form/TaskSheet';

interface KanbanPageProps {
  tasks: Task[];
  steps: { id: string; title: string }[];
  currentSprintStep: RoadmapStep | null;
  onOpenWeeklyPlan?: () => void;
  onCreateTask: (draft: TaskDraft) => void;
  onAddComment: (id: string, text: string, file?: File) => void;
  onUpdateComment: (id: string, commentId: string, text: string, file?: File) => void;
  onRemoveComment: (id: string, commentId: string) => void;
  onDeleteTask: (id: string) => void;
  onUpdateTaskStatus: (id: string, status: TaskStatus) => void;
  onAttachImage: (id: string, file: File) => void;
  onOpenLightbox: (url: string) => void;
  onShowToast: (msg: string) => void;
}

const COLUMNS: { id: TaskStatus; label: string; shortLabel: string; icon: string; color: string }[] = [
  { id: 'backlog', label: 'План / Бэклог', shortLabel: 'План', icon: '📋', color: 'var(--text-muted)' },
  { id: 'in-progress', label: 'В работе на 2 недели', shortLabel: 'В работе', icon: '⚡', color: 'var(--accent-purple)' },
  { id: 'test', label: 'Тест в Godot 4', shortLabel: 'Тест', icon: '🧪', color: 'var(--accent-amber)' },
  { id: 'done', label: 'Готово ✓', shortLabel: 'Готово', icon: '✓', color: 'var(--accent-emerald)' }
];

export const KanbanPage: React.FC<KanbanPageProps> = ({
  tasks,
  steps,
  currentSprintStep,
  onOpenWeeklyPlan,
  onCreateTask,
  onAddComment,
  onUpdateComment,
  onRemoveComment,
  onDeleteTask,
  onUpdateTaskStatus,
  onAttachImage,
  onOpenLightbox,
  onShowToast
}) => {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetStatus, setSheetStatus] = useState<TaskStatus>('backlog');
  const [openId, setOpenId] = useState<string | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [canDrag, setCanDrag] = useState(false);
  const [activeMobileCol, setActiveMobileCol] = useState<TaskStatus>('in-progress');
  const openTask = tasks.find(task => task.id === openId) || null;
  const pendingDelete = tasks.find(task => task.id === pendingDeleteId) || null;

  useEffect(() => {
    const media = window.matchMedia('(hover: hover) and (pointer: fine)');
    const sync = () => setCanDrag(media.matches);
    sync();
    media.addEventListener('change', sync);
    return () => media.removeEventListener('change', sync);
  }, []);

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('text/plain', taskId);
  };

  const handleDrop = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId) {
      onUpdateTaskStatus(taskId, status);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, taskId: string) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (file) onAttachImage(taskId, file);
  };

  const renderCard = (task: Task) => {
    return (
      <div
        key={task.id}
        className="kanban-card"
        draggable={canDrag}
        onClick={(event) => {
          if ((event.target as HTMLElement).closest('button, label, input, select')) return;
          setOpenId(task.id);
        }}
        onDragStart={(e) => {
          if ((e.target as HTMLElement).closest('button, label, input')) {
            e.preventDefault();
            return;
          }
          handleDragStart(e, task.id);
        }}
      >
        {/* Card Header: Category & Author & Delete */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span className={`card-tag ${task.category}`}>
              {task.category === 'code' ? 'Код' : task.category === 'art' ? 'Арт' : task.category === 'design' ? 'Дизайн' : 'Звук'}
            </span>
            <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
              {task.author}
            </span>
          </div>

          <button
            type="button"
            className="icon-btn"
            style={{ width: '24px', height: '24px', fontSize: '11px' }}
            aria-label="Удалить задачу"
            onClick={() => setPendingDeleteId(task.id)}
          >
            ✕
          </button>
        </div>

        <button type="button" className="kanban-card-open" onClick={() => setOpenId(task.id)}>
          {task.title}
        </button>
        {(task.comments?.length || 0) > 0 && (
          <span className="kanban-comment-count">💬 {task.comments?.length}</span>
        )}
        {task.description ? (
          <p className="kanban-card-desc">{task.description}</p>
        ) : (
          <p className="kanban-card-desc">Нажмите, чтобы открыть.</p>
        )}

        {/* Optional Image */}
        {task.image && (
          <div style={{ position: 'relative', marginBottom: '10px', borderRadius: '6px', overflow: 'hidden' }}>
            <img
              src={task.image}
              alt="Вложение"
              className="card-img-preview"
              style={{ marginTop: 0 }}
              onClick={() => onOpenLightbox(task.image!)}
            />
            <span style={{ position: 'absolute', bottom: '4px', right: '4px', background: 'rgba(0,0,0,0.7)', fontSize: '9px', padding: '1px 5px', borderRadius: '3px', color: 'var(--accent-cyan)' }}>
              🔍 Фото
            </span>
          </div>
        )}

        {/* Card Actions: Photo and Logical Move Step */}
        <div className="kanban-card-actions">
          <label className="card-photo-btn" title="Прикрепить скриншот">
            📷 Фото
            <input
              type="file"
              accept="image/*"
              capture="environment"
              hidden
              onChange={(e) => handleFileChange(e, task.id)}
            />
          </label>

          <div className="card-step-actions">
            {task.status !== 'backlog' && (
              <button
                type="button"
                className="card-step-back-btn"
                title="Шаг назад"
                onClick={() => {
                  const prev = task.status === 'done' ? 'test' : task.status === 'test' ? 'in-progress' : 'backlog';
                  onUpdateTaskStatus(task.id, prev);
                }}
              >
                ←
              </button>
            )}

            {task.status === 'backlog' && (
              <button
                type="button"
                className="card-advance-btn progress"
                onClick={() => onUpdateTaskStatus(task.id, 'in-progress')}
              >
                В работу →
              </button>
            )}

            {task.status === 'in-progress' && (
              <button
                type="button"
                className="card-advance-btn test"
                onClick={() => onUpdateTaskStatus(task.id, 'test')}
              >
                В тест Godot 🧪 →
              </button>
            )}

            {task.status === 'test' && (
              <button
                type="button"
                className="card-advance-btn done"
                onClick={() => onUpdateTaskStatus(task.id, 'done')}
              >
                Готово ✓
              </button>
            )}

            {task.status === 'done' && (
              <span className="card-done-badge">
                Завершено ✓
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="view-content">
      {/* Sprint Header */}
      <div className="sprint-banner">
        <div>
          <div className="sprint-focus-title">
            {currentSprintStep ? '📌 Текущий спринт (2 недели)' : '📌 Спринт не выбран'}
          </div>
          <div style={{ fontSize: '15px', fontWeight: 800, color: '#fff' }}>
            {currentSprintStep
              ? `${currentSprintStep.id.toUpperCase()}: ${currentSprintStep.title}`
              : 'Общий пул задач (фокусный шаг не назначен)'}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
            Нажмите карточку, чтобы открыть её и оставить комментарий. Задач в работе может быть сколько нужно.
          </div>
        </div>
        <div className="sprint-banner-action">
          <input
            className="field kanban-search"
            value={query}
            placeholder="Поиск по задачам"
            aria-label="Поиск по задачам"
            onChange={(event) => setQuery(event.target.value)}
          />
          {onOpenWeeklyPlan && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onOpenWeeklyPlan}
            >
              📅 План недели
            </button>
          )}
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              setSheetStatus('backlog');
              setSheetOpen(true);
            }}
          >
            + Новая задача
          </button>
        </div>
      </div>

      {/* MOBILE COLUMN SELECTOR BAR */}
      <div className="kanban-mobile-tabs" role="tablist">
        {COLUMNS.map(col => {
          const count = tasks.filter(t => t.status === col.id).length;
          const isActive = activeMobileCol === col.id;
          return (
            <button
              key={col.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={`kanban-mobile-tab ${isActive ? 'active' : ''}`}
              style={{
                borderColor: isActive ? col.color : 'transparent'
              }}
              onClick={() => setActiveMobileCol(col.id)}
            >
              <span>{col.icon} {col.shortLabel}</span>
              <span
                className="kanban-mobile-badge"
                style={{
                  background: isActive ? col.color : 'rgba(255,255,255,0.08)',
                  color: isActive ? '#000' : 'var(--text-muted)'
                }}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Grid: On Desktop 4 columns, on Mobile only the active column */}
      <div className="kanban-grid">
        {COLUMNS.map(col => {
          const needle = query.trim().toLowerCase();
          const colTasks = tasks.filter(task => {
            if (task.status !== col.id) return false;
            if (!needle) return true;
            return task.title.toLowerCase().includes(needle) || (task.description || '').toLowerCase().includes(needle);
          });
          const isMobileActive = activeMobileCol === col.id;

          return (
            <div
              key={col.id}
              className={`kanban-col ${isMobileActive ? 'mobile-visible' : 'mobile-hidden'}`}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleDrop(e, col.id)}
            >
              <div
                className="kanban-col-head"
                style={{ borderBottomColor: col.color || 'var(--border)' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>{col.icon}</span>
                  <span style={{ color: col.color || '#fff' }}>{col.label}</span>
                </div>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <button
                    type="button"
                    className="icon-btn"
                    aria-label={`Добавить в ${col.shortLabel}`}
                    onClick={() => {
                      setSheetStatus(col.id);
                      setSheetOpen(true);
                    }}
                  >
                    +
                  </button>
                  <span className="nav-badge" style={{ color: col.color || 'var(--text-muted)' }}>
                    {colTasks.length}
                  </span>
                </span>
              </div>

              <div className="kanban-cards-box">
                {colTasks.length === 0 ? (
                  <p className="composer-hint" style={{ textAlign: 'center', padding: '30px 10px' }}>
                    Здесь пока нет задач
                  </p>
                ) : (
                  colTasks.map(renderCard)
                )}
              </div>
            </div>
          );
        })}
      </div>

      {sheetOpen && (
        <TaskSheet
          initialStatus={sheetStatus}
          onClose={() => setSheetOpen(false)}
          onCreate={onCreateTask}
          onShowToast={onShowToast}
        />
      )}

      {openTask && (
        <TaskDetail
          task={openTask}
          steps={steps}
          onClose={() => setOpenId(null)}
          onAddComment={(text, file) => onAddComment(openTask.id, text, file)}
          onUpdateComment={(commentId, text, file) => onUpdateComment(openTask.id, commentId, text, file)}
          onRemoveComment={(commentId) => onRemoveComment(openTask.id, commentId)}
          onOpenLightbox={onOpenLightbox}
        />
      )}

      {pendingDelete && (
        <div className="sheet-backdrop" onClick={() => setPendingDeleteId(null)}>
          <div
            className="confirm-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="task-delete-title"
            onClick={(event) => event.stopPropagation()}
          >
            <h3 id="task-delete-title" className="composer-title">Точно удалить?</h3>
            <p className="confirm-dialog-text">Удалить задачу «{pendingDelete.title}»?</p>
            <div className="note-actions">
              <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setPendingDeleteId(null)}>
                Нет
              </button>
              <button
                type="button"
                className="btn btn-primary"
                style={{ flex: 1 }}
                onClick={() => {
                  onDeleteTask(pendingDelete.id);
                  if (openId === pendingDelete.id) setOpenId(null);
                  setPendingDeleteId(null);
                }}
              >
                Да, удалить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
