import React, { useState } from 'react';
import { Task, TaskCategory, TaskStatus, taskCoversSubtask } from '../entities/task';
import { RoadmapStep } from '../entities/roadmap';
import { CharacterItem } from '../entities/character';
import { CharacterModal, getCharacterRoleIcon } from '../features/character-form/CharacterModal';
import { QuickNoteFab } from '../features/note-capture/QuickNoteFab';
import { ConfirmModal } from '../shared/ui/ConfirmModal';

interface DashboardPageProps {
  currentSprintStep: RoadmapStep | null;
  tasks: Task[];
  characters: CharacterItem[];
  onOpenKanban: () => void;
  onOpenRoadmap: () => void;
  onOpenWeeklyPlan?: () => void;
  onSetSprintStep?: (stepId: string) => void;
  onOpenLightbox: (url: string) => void;
  onAddNote: (tag: string, text: string) => void;
  onSaveCharacter: (char: CharacterItem) => void;
  onDeleteCharacter: (id: string) => void;
  onCreateTask: (title: string, category: TaskCategory) => void;
  onUpdateTaskStatus: (id: string, status: TaskStatus) => void;
  onPushMissing: (stepId: string) => void;
  onShowToast: (msg: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  currentSprintStep,
  tasks,
  characters,
  onOpenKanban,
  onOpenRoadmap,
  onOpenWeeklyPlan,
  onSetSprintStep,
  onOpenLightbox,
  onAddNote,
  onSaveCharacter,
  onDeleteCharacter,
  onCreateTask,
  onUpdateTaskStatus,
  onPushMissing,
  onShowToast
}) => {
  const [editingCharacter, setEditingCharacter] = useState<CharacterItem | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [charToDelete, setCharToDelete] = useState<CharacterItem | null>(null);
  const [quickTaskTitle, setQuickTaskTitle] = useState('');
  const [quickCategory, setQuickCategory] = useState<TaskCategory>('code');

  const stepTasks = currentSprintStep
    ? tasks.filter(t => t.stepId === currentSprintStep.id)
    : [];
  const doneCount = stepTasks.filter(t => t.status === 'done').length;
  const inProgressCount = stepTasks.filter(t => t.status === 'in-progress').length;
  const pct = stepTasks.length ? Math.round((doneCount / stepTasks.length) * 100) : 0;
  const activeSprintTasks = stepTasks.filter(t => t.status !== 'done');
  const missedSubtasks = currentSprintStep
    ? currentSprintStep.subtasks.filter(sub => !taskCoversSubtask(tasks, currentSprintStep.id, sub))
    : [];
  const unboundCount = tasks.filter(t => !t.stepId).length;

  const handleQuickAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = quickTaskTitle.trim();
    if (!clean) return;
    onCreateTask(clean, quickCategory);
    setQuickTaskTitle('');
  };

  const getRoleTagColor = (roleStr: string) => {
    const r = (roleStr || '').toLowerCase();
    if (r.includes('герой') || r.includes('протагонист')) return 'art';
    if (r.includes('босс') || r.includes('враг')) return 'code';
    if (r.includes('люб')) return 'audio';
    if (r.includes('друг') || r.includes('союзник') || r.includes('напарник')) return 'design';
    return 'design';
  };

  return (
    <div className="view-content">
      {/* SPRINT BANNER (2 WEEKS) */}
      {currentSprintStep ? (
        <div className="sprint-banner">
          <div>
            <div className="sprint-focus-title">🎯 Спринт (2 недели) • Главный фокус разработки</div>
            <div className="sprint-name">
              {currentSprintStep.id.toUpperCase()}: {currentSprintStep.title}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
              {currentSprintStep.desc}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'right', marginBottom: '4px' }}>
                <b>{doneCount}</b> из <b>{stepTasks.length}</b> задач шага • <b>{inProgressCount}</b> в работе
              </div>
              <div className="sprint-progress-bar">
                <div className="sprint-progress-fill" style={{ width: `${pct}%` }} />
              </div>
            </div>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ fontSize: '11.5px', padding: '6px 12px' }}
              onClick={onOpenRoadmap}
            >
              Сменить шаг
            </button>
            {onOpenWeeklyPlan && (
              <button
                type="button"
                className="btn btn-secondary"
                style={{ fontSize: '11.5px', padding: '6px 12px' }}
                onClick={onOpenWeeklyPlan}
              >
                📅 План недели
              </button>
            )}
            <button type="button" className="btn btn-primary" onClick={onOpenKanban}>
              Открыть Канбан →
            </button>
          </div>
        </div>
      ) : (
        <div
          className="sprint-banner"
          style={{
            background: 'linear-gradient(135deg, rgba(11, 18, 33, 0.95) 0%, rgba(26, 21, 56, 0.95) 100%)',
            borderColor: 'rgba(99, 102, 241, 0.35)'
          }}
        >
          <div>
            <div className="sprint-focus-title" style={{ color: 'var(--text-muted)' }}>
              ⏸️ Спринт (2 недели) • Шаг еще не выбран
            </div>
            <div className="sprint-name" style={{ color: '#fff', fontSize: '16px' }}>
              Разработка еще не запущена (даже STEP-0 не начат)
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Выберите стартовый шаг в Дорожной карте, чтобы сфокусировать команду на ближайшие 2 недели разработки.
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {onSetSprintStep && (
              <>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ fontSize: '11.5px', padding: '6px 12px' }}
                  onClick={() => onSetSprintStep('step-0')}
                >
                  🎯 Начать со STEP-0 (Сетап Godot)
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ fontSize: '11.5px', padding: '6px 12px' }}
                  onClick={() => onSetSprintStep('step-1')}
                >
                  🎯 Начать со STEP-1 (Движение)
                </button>
              </>
            )}
            <button
              type="button"
              className="btn btn-primary"
              style={{ fontSize: '12px' }}
              onClick={onOpenRoadmap}
            >
              🗺️ Открыть Роадмап →
            </button>
          </div>
        </div>
      )}

      {/* SECTION: WHAT TO DO RIGHT NOW (TASKS IN PROGRESS) */}
      <div className="panel" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <h3 style={{ fontSize: '16px', color: '#fff', fontWeight: 700, margin: '0 0 2px' }}>
              ⚡ Что нужно сделать в текущем спринте
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
              {currentSprintStep
                ? `Только задачи шага ${currentSprintStep.id.toUpperCase()}.`
                : 'Сначала выбери шаг выше. Задачи других шагов сюда не попадают.'}
            </p>
          </div>
          <button
            type="button"
            className="btn btn-secondary"
            style={{ fontSize: '11.5px', padding: '6px 12px' }}
            onClick={onOpenKanban}
          >
            Все задачи ({tasks.length})
          </button>
        </div>

        {/* Quick Task List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
          {!currentSprintStep ? (
            <div style={{ color: 'var(--text-dim)', fontSize: '13px', padding: '12px 0' }}>
              Шаг не выбран. На канбане {tasks.length} задач — это не текущая работа.
            </div>
          ) : activeSprintTasks.length === 0 ? (
            <div style={{ color: 'var(--text-dim)', fontSize: '13px', padding: '12px 0' }}>
              {stepTasks.length === 0
                ? 'У этого шага ещё нет карточек. Пропуски из плана — в блоке ниже.'
                : 'Открытых задач этого шага нет.'}
            </div>
          ) : (
            activeSprintTasks.map(task => (
              <div
                key={task.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: '#070b16',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  gap: '10px',
                  flexWrap: 'wrap'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '160px' }}>
                  <span className={`card-tag ${task.category}`} style={{ margin: 0 }}>
                    {task.category === 'code' ? 'Код' : task.category === 'art' ? 'Арт' : task.category === 'design' ? 'Дизайн' : 'Звук'}
                  </span>
                  <span style={{ fontSize: '13px', color: '#fff', fontWeight: 600 }}>
                    {task.title}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    {task.author}
                  </span>
                  {task.status === 'backlog' && (
                    <button
                      type="button"
                      className="btn btn-secondary"
                      style={{ fontSize: '11px', padding: '4px 8px' }}
                      onClick={() => onUpdateTaskStatus(task.id, 'in-progress')}
                    >
                      ▶ В работу
                    </button>
                  )}
                  {task.status === 'in-progress' && (
                    <button
                      type="button"
                      className="btn btn-secondary"
                      style={{ fontSize: '11px', padding: '4px 8px', color: 'var(--accent-amber)' }}
                      onClick={() => onUpdateTaskStatus(task.id, 'test')}
                    >
                      🧪 В тест Godot
                    </button>
                  )}
                  {task.status === 'test' && (
                    <button
                      type="button"
                      className="btn btn-secondary"
                      style={{ fontSize: '11px', padding: '4px 8px', color: 'var(--accent-emerald)' }}
                      onClick={() => onUpdateTaskStatus(task.id, 'done')}
                    >
                      ✓ Готово
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Quick Add Task Field */}
        {currentSprintStep && unboundCount > 0 && (
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '10px' }}>
            Ещё {unboundCount} задач без шага. Они видны только на канбане.
          </div>
        )}

        {currentSprintStep && (
        <form onSubmit={handleQuickAddTask} style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <input
            className="field"
            value={quickTaskTitle}
            placeholder="+ Быстро добавить задачу в текущий спринт..."
            style={{ flex: 1, minWidth: '160px' }}
            onChange={(e) => setQuickTaskTitle(e.target.value)}
          />
          <select
            className="field"
            value={quickCategory}
            style={{ width: '120px' }}
            onChange={(e) => setQuickCategory(e.target.value as TaskCategory)}
          >
            <option value="code">Код</option>
            <option value="art">Арт</option>
            <option value="design">Дизайн</option>
            <option value="audio">Звук</option>
          </select>
          <button type="submit" className="btn btn-primary" style={{ whiteSpace: 'nowrap' }}>
            Добавить
          </button>
        </form>
        )}
      </div>

      {currentSprintStep && (
        <div className="panel" style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '10px' }}>
            <div>
              <h3 style={{ fontSize: '16px', color: '#fff', fontWeight: 700, margin: '0 0 2px' }}>
                Что упустил в {currentSprintStep.id.toUpperCase()}
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
                Подзадачи плана, которых нет в канбане.
              </p>
            </div>
            {missedSubtasks.length > 0 && (
              <button
                type="button"
                className="btn btn-primary"
                style={{ fontSize: '11.5px', padding: '6px 12px' }}
                onClick={() => onPushMissing(currentSprintStep.id)}
              >
                Добавить пропущенные ({missedSubtasks.length})
              </button>
            )}
          </div>
          {missedSubtasks.length === 0 ? (
            <div style={{ color: 'var(--text-dim)', fontSize: '13px' }}>
              Все подзадачи этого шага уже есть в канбане.
            </div>
          ) : (
            <ul style={{ margin: 0, paddingLeft: '18px', color: '#fff', fontSize: '13px', lineHeight: 1.55 }}>
              {missedSubtasks.map(sub => (
                <li key={sub}>{sub}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* TECH PILLARS & ENGINE SPECS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px', marginBottom: '20px' }}>
        <div className="panel" style={{ padding: '14px 16px' }}>
          <div style={{ fontSize: '12px', color: 'var(--accent-cyan)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>
            🎮 Godot 4.3 Standard 2D
          </div>
          <div style={{ fontSize: '14px', color: '#fff', fontWeight: 700, marginBottom: '4px' }}>
            Pixel Snap & Resolution
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.45 }}>
            384×216 базовый viewport, Stretch mode: canvas_items. Пиксель-арт без дрожания субпикселей.
          </div>
        </div>

        <div className="panel" style={{ padding: '14px 16px' }}>
          <div style={{ fontSize: '12px', color: 'var(--accent-purple)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>
            ⏱️ Game Feel Тайминги
          </div>
          <div style={{ fontSize: '14px', color: '#fff', fontWeight: 700, marginBottom: '4px' }}>
            Coyote 0.12s • Jump Buffer 0.10s
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.45 }}>
            Парирование кибер-рукой в окно 0.15с, замирание кадра Hitstop 0.08с (Engine.time_scale).
          </div>
        </div>

        <div className="panel" style={{ padding: '14px 16px' }}>
          <div style={{ fontSize: '12px', color: 'var(--accent-amber)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>
            🔑 Ability Gating
          </div>
          <div style={{ fontSize: '14px', color: '#fff', fontWeight: 700, marginBottom: '4px' }}>
            4 Ключевых Импланта
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.45 }}>
            Спектр-глаз (Q), Парирование (J), Dash (Shift), Гарпун (E) открывают зоны корпораций.
          </div>
        </div>

        <div className="panel" style={{ padding: '14px 16px' }}>
          <div style={{ fontSize: '12px', color: 'var(--accent-emerald)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>
            🚀 Таргет Майлстоун
          </div>
          <div style={{ fontSize: '14px', color: '#fff', fontWeight: 700, marginBottom: '4px' }}>
            Vertical Slice (Steam Demo)
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.45 }}>
            Стабильные 60 FPS, 3 боевые комнаты, сектор лаборатории и арена первого босса.
          </div>
        </div>
      </div>

      {/* EDITABLE CHARACTERS / HERO / BOSSES SECTION */}
      <div className="panel" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h3 style={{ fontSize: '17px', color: '#fff', fontWeight: 800, margin: '0 0 4px' }}>
              👥 Персонажи, Боссы и Лор игры
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
              Добавляйте и редактируйте досье героев, боссов и NPC: меняйте лор, картинку и список способностей.
            </p>
          </div>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              setEditingCharacter(null);
              setModalOpen(true);
            }}
          >
            + Добавить блок персонажа
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {characters.map(char => (
            <div
              key={char.id}
              className="panel hero-dossier"
              style={{
                background: '#070b16',
                border: '1px solid var(--border)',
                marginBottom: 0
              }}
            >
              <div
                style={{
                  border: '1px solid var(--border-bright)',
                  borderRadius: 'var(--radius-md)',
                  background: '#060910',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  position: 'relative',
                  minHeight: '160px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                onClick={() => onOpenLightbox(char.imageUrl)}
              >
                <img
                  src={char.imageUrl}
                  alt={char.name}
                  style={{ width: '100%', height: '100%', maxHeight: '200px', objectFit: 'contain', display: 'block' }}
                />
                <div style={{ position: 'absolute', bottom: '6px', right: '6px', background: 'rgba(0,0,0,0.7)', fontSize: '10px', padding: '2px 6px', borderRadius: '4px', color: 'var(--accent-cyan)' }}>
                  🔍 Увеличить
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                  <span className={`card-tag ${getRoleTagColor(char.role)}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                    <span>{getCharacterRoleIcon(char.role)}</span>
                    <span>{char.role}</span>
                    {char.tag && char.tag.trim().toLowerCase() !== char.role.trim().toLowerCase() && (
                      <span style={{ opacity: 0.85 }}>• {char.tag}</span>
                    )}
                  </span>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      style={{ fontSize: '11px', padding: '4px 10px' }}
                      onClick={() => {
                        setEditingCharacter(char);
                        setModalOpen(true);
                      }}
                    >
                      ✏️ Редактировать
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      style={{ fontSize: '11px', padding: '4px 10px', color: '#f87171', borderColor: 'rgba(239, 68, 68, 0.4)' }}
                      onClick={() => setCharToDelete(char)}
                    >
                      🗑️ Удалить
                    </button>
                  </div>
                </div>

                <h3 style={{ fontSize: '18px', color: '#fff', fontWeight: 800, margin: '6px 0 8px' }}>
                  {char.name}
                </h3>
                <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', lineHeight: 1.55, marginBottom: '14px' }}>
                  {char.lore}
                </p>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {char.skills.map((s, idx) => (
                    <span key={idx} className="step-pill">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Character Edit / Create Modal */}
      {modalOpen && (
        <CharacterModal
          character={editingCharacter}
          onSave={onSaveCharacter}
          onDelete={onDeleteCharacter}
          onClose={() => setModalOpen(false)}
          onShowToast={onShowToast}
        />
      )}

      {/* FAB только на обзоре; на мобилке скрыт (есть пункт «Мысли» в нижнем меню) */}
      <QuickNoteFab onAddNote={onAddNote} onShowToast={onShowToast} />

      <ConfirmModal
        isOpen={Boolean(charToDelete)}
        title="Удаление персонажа"
        message={`Вы уверены, что хотите удалить персонажа «${charToDelete?.name}»?`}
        confirmText="Удалить"
        cancelText="Отмена"
        danger={true}
        onConfirm={() => {
          if (charToDelete) onDeleteCharacter(charToDelete.id);
        }}
        onClose={() => setCharToDelete(null)}
      />
    </div>
  );
};
