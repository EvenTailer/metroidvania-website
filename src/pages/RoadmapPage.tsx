import React, { useState } from 'react';
import { RoadmapStep, RoadmapDeliverable } from '../entities/roadmap';
import { TaskCategory } from '../entities/task';

interface RoadmapTab {
  id: string;
  title: string;
}

interface RoadmapPageProps {
  title: string;
  docs: RoadmapTab[];
  activeId: string;
  steps: RoadmapStep[];
  currentSprintStepId: string | null;
  onSelectRoadmap: (id: string) => void;
  onCreateRoadmap: (title: string) => void;
  onRenameRoadmap: (id: string, title: string) => void;
  onDeleteRoadmap: (id: string) => void;
  onAddStep: () => void;
  onSaveStep: (id: string, patch: Partial<RoadmapStep>) => void;
  onDeleteStep: (id: string) => void;
  onSetSprintStep: (stepId: string | null) => void;
  onPushSubtasksToKanban: (stepId: string) => void;
  onToggleStepDone?: (stepId: string) => void;
  onPushSingleTaskToKanban?: (title: string, category: TaskCategory, stepId: string) => void;
}

export const RoadmapPage: React.FC<RoadmapPageProps> = ({
  title,
  docs,
  activeId,
  steps,
  currentSprintStepId,
  onSelectRoadmap,
  onCreateRoadmap,
  onRenameRoadmap,
  onDeleteRoadmap,
  onAddStep,
  onSaveStep,
  onDeleteStep,
  onSetSprintStep,
  onPushSubtasksToKanban,
  onToggleStepDone,
  onPushSingleTaskToKanban
}) => {
  const [expandedStepId, setExpandedStepId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'todo' | 'done'>('all');
  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState({ phase: '', title: '', desc: '', duration: '', goal: '', tech: '', subtasks: '' });
  const [pendingDelete, setPendingDelete] = useState<
    { kind: 'roadmap' | 'step'; id: string; title: string } | null
  >(null);

  const completedCount = steps.filter(s => s.done).length;
  const progressPercent = steps.length ? Math.round((completedCount / steps.length) * 100) : 0;

  const filteredSteps = steps.filter(step => {
    if (filter === 'done') return step.done;
    if (filter === 'todo') return !step.done;
    return true;
  });

  const getRoleBadge = (role: RoadmapDeliverable['role']) => {
    switch (role) {
      case 'code':
        return { label: '⚡ КОД', color: 'var(--accent-cyan)', bg: 'rgba(0, 242, 254, 0.1)' };
      case 'art':
        return { label: '🎨 АРТ', color: 'var(--accent-purple)', bg: 'rgba(168, 85, 247, 0.1)' };
      case 'design':
        return { label: '🗺 ДИЗАЙН', color: 'var(--accent-emerald)', bg: 'rgba(16, 185, 129, 0.1)' };
      case 'audio':
        return { label: '🎵 ЗВУК', color: 'var(--accent-pink)', bg: 'rgba(236, 72, 153, 0.1)' };
    }
  };

  return (
    <div className="view-content">
      <div className="roadmap-tabs" role="tablist" aria-label="Роадмапы">
        {docs.map(doc => (
          <div key={doc.id} className={`roadmap-tab ${doc.id === activeId ? 'active' : ''}`}>
            <button type="button" className="roadmap-tab-label" onClick={() => onSelectRoadmap(doc.id)}>
              {doc.title}
            </button>
            {docs.length > 1 && (
              <button
                type="button"
                className="roadmap-tab-close"
                aria-label={`Удалить ${doc.title}`}
                onClick={() => setPendingDelete({ kind: 'roadmap', id: doc.id, title: doc.title })}
              >
                ×
              </button>
            )}
          </div>
        ))}
        {creating ? (
          <form
            className="roadmap-tab-create"
            onSubmit={(event) => {
              event.preventDefault();
              onCreateRoadmap(newTitle);
              setNewTitle('');
              setCreating(false);
            }}
          >
            <input
              className="field"
              value={newTitle}
              autoFocus
              placeholder="Например: Анимация"
              onChange={(event) => setNewTitle(event.target.value)}
            />
            <button type="submit" className="btn btn-primary">Создать</button>
          </form>
        ) : (
          <button type="button" className="roadmap-tab-add" onClick={() => setCreating(true)}>
            + Роадмап
          </button>
        )}
      </div>

      <div className="roadmap-header-card">
        <div className="roadmap-header-top">
          <div>
            <input
              className="field roadmap-rename"
              aria-label="Название роадмапа"
              defaultValue={title}
              key={activeId + title}
              onBlur={(event) => {
                if (event.target.value.trim() && event.target.value.trim() !== title) onRenameRoadmap(activeId, event.target.value);
              }}
            />
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px', marginBottom: 0 }}>
              Отдельная вкладка — отдельный план. Игровой роадмап можно оставить, а анимацию вести рядом.
            </p>
          </div>
          <div className="roadmap-progress-badge">
            <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>ПРОГРЕСС РЕЛИЗА</span>
            <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--accent-cyan)', fontFamily: 'JetBrains Mono, monospace' }}>
              {progressPercent}%
            </div>
            <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
              {completedCount} из {steps.length} шагов
            </span>
          </div>
        </div>

        {/* Progress Bar Track */}
        <div className="roadmap-progress-track">
          <div
            className="roadmap-progress-fill"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Filters */}
        <div className="roadmap-filter-row">
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            <button
              className={`pill-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              Все шаги ({steps.length})
            </button>
            <button
              className={`pill-btn ${filter === 'todo' ? 'active' : ''}`}
              onClick={() => setFilter('todo')}
            >
              В очереди / работе ({steps.length - completedCount})
            </button>
            <button
              className={`pill-btn ${filter === 'done' ? 'active' : ''}`}
              onClick={() => setFilter('done')}
            >
              Выполнено ({completedCount})
            </button>
            <button type="button" className="pill-btn" onClick={onAddStep}>
              + Шаг
            </button>
          </div>

          <div style={{ fontSize: '11px', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>Текущий спринт (2 недели):</span>
            {currentSprintStepId ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <b style={{ color: 'var(--accent-cyan)' }}>{currentSprintStepId.toUpperCase()}</b>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ fontSize: '10px', padding: '2px 6px', height: '22px' }}
                  onClick={() => onSetSprintStep(null)}
                  title="Сбросить выбранный спринт"
                >
                  ✕ Снять
                </button>
              </span>
            ) : (
              <span style={{ color: 'var(--text-muted)' }}>не выбран</span>
            )}
          </div>
        </div>
      </div>

      {/* Steps List */}
      <div className="roadmap-list" style={{ marginTop: '16px' }}>
        {filteredSteps.map(step => {
          const isCurrent = step.id === currentSprintStepId;
          const isExpanded = expandedStepId === step.id;

          return (
            <div
              key={step.id}
              className={`roadmap-card-v2 ${isCurrent ? 'active-sprint' : ''} ${step.done ? 'is-done' : ''}`}
            >
              {/* Card Header Section */}
              <div
                className="roadmap-card-header"
                onClick={() => setExpandedStepId(isExpanded ? null : step.id)}
              >
                <div className="roadmap-step-badge-col">
                  <div className="step-pill">{step.id.toUpperCase()}</div>
                  <div
                    className={`roadmap-status-pill ${
                      step.done ? 'status-done' : isCurrent ? 'status-sprint' : 'status-queued'
                    }`}
                  >
                    {step.done ? '✓ Готово' : isCurrent ? '⚡ В спринте' : 'В очереди'}
                  </div>
                </div>

                <div className="roadmap-card-main-info">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span className="roadmap-phase-label">{step.phase}</span>
                    {step.duration && (
                      <span className="roadmap-duration-label">⏱ {step.duration}</span>
                    )}
                  </div>
                  <h4 className="roadmap-step-title">{step.title}</h4>
                  <p className="roadmap-step-desc">{step.desc}</p>
                  <div className="roadmap-tech-pills">
                    {step.tech.split('•').map((t, i) => (
                      <span key={i} className="roadmap-tech-tag">
                        {t.trim()}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="roadmap-header-actions" onClick={e => e.stopPropagation()}>
                  <button
                    className={`btn ${isCurrent ? 'btn-cyan' : 'btn-primary'}`}
                    style={{ fontSize: '11px', whiteSpace: 'nowrap' }}
                    onClick={() => onSetSprintStep(isCurrent ? null : step.id)}
                  >
                    {isCurrent ? '⚡ В спринте (снять)' : '🎯 Взять в спринт'}
                  </button>

                  {onToggleStepDone && (
                    <button
                      className={`btn ${step.done ? 'btn-secondary' : 'btn-emerald-outline'}`}
                      style={{ fontSize: '11px', whiteSpace: 'nowrap' }}
                      onClick={() => onToggleStepDone(step.id)}
                    >
                      {step.done ? '↩ Вернуть в работу' : 'Отметить готовым ✓'}
                    </button>
                  )}

                  <button
                    className="btn btn-secondary"
                    style={{ fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                    onClick={() => {
                      setEditingId(step.id);
                      setDraft({
                        phase: step.phase,
                        title: step.title,
                        desc: step.desc,
                        duration: step.duration,
                        goal: step.goal,
                        tech: step.tech,
                        subtasks: step.subtasks.join('\n')
                      });
                      setExpandedStepId(step.id);
                    }}
                  >
                    Править
                  </button>
                  <button
                    className="btn btn-secondary"
                    style={{ fontSize: '11px' }}
                    onClick={() => setPendingDelete({ kind: 'step', id: step.id, title: step.title })}
                  >
                    Удалить
                  </button>
                </div>
              </div>

              {/* Expanded Detailed Inspection Section */}
              {isExpanded && editingId === step.id && (
                <form
                  className="roadmap-edit-form"
                  onSubmit={(event) => {
                    event.preventDefault();
                    onSaveStep(step.id, {
                      phase: draft.phase,
                      title: draft.title.trim() || 'Без названия',
                      desc: draft.desc,
                      duration: draft.duration,
                      goal: draft.goal,
                      tech: draft.tech,
                      subtasks: draft.subtasks.split('\n').map(line => line.trim()).filter(Boolean)
                    });
                    setEditingId(null);
                  }}
                >
                  <input className="field" value={draft.phase} onChange={(event) => setDraft({ ...draft, phase: event.target.value })} placeholder="Фаза" />
                  <input className="field" value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} placeholder="Название шага" />
                  <input className="field" value={draft.duration} onChange={(event) => setDraft({ ...draft, duration: event.target.value })} placeholder="Срок" />
                  <textarea className="field" rows={2} value={draft.desc} onChange={(event) => setDraft({ ...draft, desc: event.target.value })} placeholder="Описание" />
                  <textarea className="field" rows={2} value={draft.goal} onChange={(event) => setDraft({ ...draft, goal: event.target.value })} placeholder="Цель шага" />
                  <textarea className="field" rows={3} value={draft.subtasks} onChange={(event) => setDraft({ ...draft, subtasks: event.target.value })} placeholder="Подзадачи, каждая с новой строки" />
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button type="submit" className="btn btn-primary">Сохранить шаг</button>
                    <button type="button" className="btn btn-secondary" onClick={() => setEditingId(null)}>Отмена</button>
                  </div>
                </form>
              )}

              {isExpanded && editingId !== step.id && (
                <div className="roadmap-expanded-panel">
                  {/* Goal Block */}
                  <div className="roadmap-detail-box goal-box">
                    <div className="detail-box-title">
                      🎯 Конечная цель шага (Definition of Done)
                    </div>
                    <div style={{ fontSize: '12.5px', color: '#e2e8f0', lineHeight: 1.5 }}>
                      {step.goal}
                    </div>
                  </div>

                  {/* Godot Nodes Architecture */}
                  {step.godotNodes && step.godotNodes.length > 0 && (
                    <div className="roadmap-detail-box nodes-box">
                      <div className="detail-box-title">
                        🛠️ Архитектура Godot 4.3 (Узлы, ноды и компоненты)
                      </div>
                      <div className="roadmap-nodes-wrap">
                        {step.godotNodes.map((node, i) => (
                          <span key={i} className="roadmap-node-chip">
                            ⚙️ {node}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tasks by Role (Deliverables) */}
                  {step.deliverables && step.deliverables.length > 0 && (
                    <div className="roadmap-detail-box tasks-box">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
                        <div className="detail-box-title" style={{ margin: 0 }}>
                          📋 Задачи по направлениям (Код, Арт, Дизайн, Звук)
                        </div>
                        <button
                          className="btn btn-secondary"
                          style={{ fontSize: '10.5px', padding: '4px 10px' }}
                          onClick={() => onPushSubtasksToKanban(step.id)}
                        >
                          + Отправить все задачи в Канбан ({step.deliverables.length})
                        </button>
                      </div>

                      <div className="roadmap-deliverables-list">
                        {step.deliverables.map((item, idx) => {
                          const badge = getRoleBadge(item.role);
                          return (
                            <div key={idx} className="roadmap-deliverable-item">
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <span
                                    className="role-badge"
                                    style={{ color: badge.color, background: badge.bg, borderColor: badge.color }}
                                  >
                                    {badge.label}
                                  </span>
                                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#fff' }}>
                                    {item.title}
                                  </span>
                                </div>

                                {onPushSingleTaskToKanban && (
                                  <button
                                    className="btn btn-ghost"
                                    style={{ fontSize: '10px', padding: '3px 8px', color: 'var(--accent-cyan)' }}
                                    onClick={() => onPushSingleTaskToKanban(item.title, item.role, step.id)}
                                  >
                                    + В Канбан
                                  </button>
                                )}
                              </div>
                              <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '4px', lineHeight: 1.45 }}>
                                {item.desc}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Pitfalls and Common Mistakes */}
                  {step.pitfalls && step.pitfalls.length > 0 && (
                    <div className="roadmap-detail-box pitfall-box">
                      <div className="detail-box-title warning-title">
                        ⚠️ Подводные камни и частые ошибки (Что не стоит делать)
                      </div>
                      <ul className="roadmap-bullet-list warning-list">
                        {step.pitfalls.map((p, i) => (
                          <li key={i}>{p}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Testing & Acceptance Criteria */}
                  {step.testCriteria && step.testCriteria.length > 0 && (
                    <div className="roadmap-detail-box criteria-box">
                      <div className="detail-box-title success-title">
                        🧪 Как протестировать готовность шага (Критерии приемки)
                      </div>
                      <ul className="roadmap-bullet-list criteria-list">
                        {step.testCriteria.map((tc, i) => (
                          <li key={i}>{tc}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Bottom Action Footer for this step */}
                  <div className="roadmap-card-footer">
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <button
                        className={`btn ${isCurrent ? 'btn-cyan' : 'btn-primary'}`}
                        style={{ fontSize: '11px' }}
                        onClick={() => onSetSprintStep(isCurrent ? null : step.id)}
                      >
                        {isCurrent ? '⚡ Шаг в спринте (снять)' : '🎯 Взять в текущий спринт (2 недели)'}
                      </button>
                      <button
                        className="btn btn-secondary"
                        style={{ fontSize: '11px' }}
                        onClick={() => onPushSubtasksToKanban(step.id)}
                      >
                        + Разбить шаг на задачи для Канбана
                      </button>
                    </div>

                    {onToggleStepDone && (
                      <button
                        className={`btn ${step.done ? 'btn-secondary' : 'btn-emerald'}`}
                        style={{ fontSize: '11px' }}
                        onClick={() => onToggleStepDone(step.id)}
                      >
                        {step.done ? '↩ Вернуть в работу' : '✓ Отметить шаг выполненным'}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {filteredSteps.length === 0 && (
          <p style={{ color: 'var(--text-muted)', marginTop: '12px' }}>В этом роадмапе пока нет шагов. Нажмите «+ Шаг».</p>
        )}
      </div>

      {pendingDelete && (
        <div className="sheet-backdrop" onClick={() => setPendingDelete(null)}>
          <div
            className="confirm-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="roadmap-delete-title"
            onClick={(event) => event.stopPropagation()}
          >
            <h3 id="roadmap-delete-title" className="composer-title">Точно удалить?</h3>
            <p className="confirm-dialog-text">
              {pendingDelete.kind === 'roadmap'
                ? `Удалить роадмап «${pendingDelete.title}» и все его шаги? Задачи в канбане останутся.`
                : `Удалить шаг «${pendingDelete.title}»?`}
            </p>
            <div className="note-actions">
              <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setPendingDelete(null)}>
                Нет
              </button>
              <button
                type="button"
                className="btn btn-primary"
                style={{ flex: 1 }}
                onClick={() => {
                  if (pendingDelete.kind === 'roadmap') onDeleteRoadmap(pendingDelete.id);
                  else {
                    onDeleteStep(pendingDelete.id);
                    if (expandedStepId === pendingDelete.id) setExpandedStepId(null);
                  }
                  setPendingDelete(null);
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
