import React from 'react';
import {
  BuildFilterState,
  BuildRelease,
  BuildStage,
  BuildStatus,
  STAGE_META,
  STATUS_META
} from '../../entities/engine-bridge';

interface RelationItem {
  id: string;
  title: string;
}

interface BuildTrackerWidgetProps {
  builds: BuildRelease[];
  tasks: RelationItem[];
  bugs: RelationItem[];
  filter: BuildFilterState;
  selectedBuildId: string | null;
  onFilterChange: (patch: Partial<BuildFilterState>) => void;
  onSelectBuild: (id: string) => void;
  onCreateBuild: () => void;
  onEditBuild: (build: BuildRelease) => void;
  onDeleteBuild: (build: BuildRelease) => void;
  onShowToast: (msg: string) => void;
}

const ALL_STAGES: BuildStage[] = ['alpha', 'vertical-slice', 'demo-steam', 'release-candidate', 'release'];

export const BuildTrackerWidget: React.FC<BuildTrackerWidgetProps> = ({
  builds,
  tasks,
  bugs,
  filter,
  selectedBuildId,
  onFilterChange,
  onSelectBuild,
  onCreateBuild,
  onEditBuild,
  onDeleteBuild,
  onShowToast
}) => {
  const filtered = builds.filter(b => {
    if (filter.stage !== 'all' && b.stage !== filter.stage) return false;
    if (filter.status !== 'all' && b.status !== filter.status) return false;
    if (filter.searchQuery.trim()) {
      const q = filter.searchQuery.toLowerCase().trim();
      const haystack = [
        b.version,
        b.title,
        b.description,
        b.targetEngineVersion,
        ...b.changelog.map(c => c.text)
      ].join(' ').toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* Панель фильтров и добавления билда */}
      <div
        style={{
          background: 'rgba(11, 16, 28, 0.85)',
          border: '1px solid var(--border)',
          borderRadius: '10px',
          padding: '14px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '20px' }}>🚀</span>
            <div>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#fff' }}>
                Трекер версий и релизов (Build & Release Hub)
              </h3>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                Фиксация версий билдов (v0.1-alpha, Demo Steam, Vertical Slice), чейнджлоги и ссылки для тестеров
              </span>
            </div>
          </div>

          <button
            type="button"
            className="btn btn-primary"
            onClick={onCreateBuild}
            style={{ fontSize: '12px', padding: '6px 14px', fontWeight: 700 }}
          >
            + Зафиксировать новую сборку
          </button>
        </div>

        {/* Чипсы фильтрации по этапам */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', borderTop: '1px solid rgba(255, 255, 255, 0.06)', paddingTop: '10px' }}>
          <button
            type="button"
            className={`chip-btn ${filter.stage === 'all' ? 'active' : ''}`}
            onClick={() => onFilterChange({ stage: 'all' })}
            style={{ fontSize: '11px', padding: '4px 10px' }}
          >
            Все этапы ({builds.length})
          </button>

          {ALL_STAGES.map(st => {
            const meta = STAGE_META[st];
            const count = builds.filter(b => b.stage === st).length;
            const isCur = filter.stage === st;
            return (
              <button
                key={st}
                type="button"
                className={`chip-btn ${isCur ? 'active' : ''}`}
                onClick={() => onFilterChange({ stage: st })}
                style={{
                  fontSize: '11px',
                  padding: '4px 10px',
                  borderColor: isCur ? meta.color : undefined,
                  color: isCur ? meta.color : undefined
                }}
              >
                <span>{meta.icon}</span>
                <span>{meta.ruTitle}</span>
                <span style={{ fontSize: '9.5px', opacity: 0.8, marginLeft: '3px' }}>({count})</span>
              </button>
            );
          })}
        </div>

        {/* Поиск и фильтр по статусу */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 220px', position: 'relative' }}>
            <input
              type="text"
              className="field"
              placeholder="🔍 Поиск по номеру версии, названию или списку изменений..."
              value={filter.searchQuery}
              onChange={(e) => onFilterChange({ searchQuery: e.target.value })}
              style={{ width: '100%', fontSize: '12px', padding: '6px 10px' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>Статус:</span>
            <select
              className="field"
              value={filter.status}
              onChange={(e) => onFilterChange({ status: e.target.value as BuildStatus | 'all' })}
              style={{ fontSize: '11.5px', padding: '5px 8px' }}
            >
              <option value="all">Все статусы</option>
              <option value="stable">✅ Стабильный</option>
              <option value="testing">🔍 На тестах</option>
              <option value="critical-bugs">💥 Блокеры</option>
              <option value="deprecated">💤 Устарел</option>
            </select>
          </div>
        </div>
      </div>

      {/* Список карточек билдов */}
      {filtered.length === 0 ? (
        <div
          className="panel"
          style={{
            padding: '36px 20px',
            textAlign: 'center',
            background: 'rgba(11, 16, 28, 0.65)',
            border: '1px dashed var(--border)',
            borderRadius: '10px'
          }}
        >
          <span style={{ fontSize: '28px', display: 'block', marginBottom: '6px' }}>📦</span>
          <p style={{ margin: '0 0 10px', fontSize: '13px', color: '#cbd5e1' }}>
            Сборок по заданным критериям не найдено.
          </p>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => onFilterChange({ stage: 'all', status: 'all', searchQuery: '' })}
            style={{ fontSize: '12px' }}
          >
            Сбросить фильтры
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filtered.map(build => {
            const stageMeta = STAGE_META[build.stage];
            const statusMeta = STATUS_META[build.status];
            const isSelected = selectedBuildId === build.id;

            return (
              <div
                key={build.id}
                onClick={() => onSelectBuild(build.id)}
                style={{
                  background: isSelected ? 'rgba(15, 23, 42, 0.95)' : 'rgba(11, 16, 28, 0.8)',
                  border: isSelected
                    ? `1.5px solid ${stageMeta.color}`
                    : '1px solid rgba(255, 255, 255, 0.08)',
                  boxShadow: isSelected ? `0 0 16px ${stageMeta.color}25` : 'none',
                  borderRadius: '10px',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {/* Верхняя строка: Версия, Этап, Статус, Действия */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span
                      style={{
                        fontSize: '12px',
                        fontFamily: 'monospace',
                        fontWeight: 800,
                        color: 'var(--accent-cyan)',
                        background: 'rgba(0, 242, 254, 0.1)',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        border: '1px solid rgba(0, 242, 254, 0.25)'
                      }}
                    >
                      {build.version}
                    </span>

                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '4px',
                        background: `${stageMeta.color}18`,
                        color: stageMeta.color,
                        border: `1px solid ${stageMeta.color}35`
                      }}
                    >
                      {stageMeta.icon} {stageMeta.ruTitle}
                    </span>

                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '4px',
                        background: `${statusMeta.color}18`,
                        color: statusMeta.color
                      }}
                    >
                      {statusMeta.badge}
                    </span>

                    {build.isLatestRelease && (
                      <span
                        style={{
                          fontSize: '10px',
                          fontWeight: 800,
                          textTransform: 'uppercase',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          background: 'linear-gradient(90deg, var(--accent-cyan), var(--accent-purple))',
                          color: '#000'
                        }}
                      >
                        Текущий билд
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }} onClick={(e) => e.stopPropagation()}>
                    <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
                      {build.releaseDate} • {build.targetEngineVersion}
                    </span>
                    <button
                      type="button"
                      className="icon-btn"
                      onClick={() => onEditBuild(build)}
                      style={{ fontSize: '13px' }}
                      title="Редактировать билд"
                    >
                      ✏️
                    </button>
                    <button
                      type="button"
                      className="icon-btn"
                      onClick={() => onDeleteBuild(build)}
                      style={{ fontSize: '13px', color: 'var(--accent-rose)' }}
                      title="Удалить билд"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                {/* Название и описание */}
                <div>
                  <h4 style={{ margin: '0 0 4px', fontSize: '15px', color: '#fff', fontWeight: 700 }}>
                    {build.title}
                  </h4>
                  <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                    {build.description}
                  </p>
                  <p style={{ margin: '6px 0 0', fontSize: '11.5px', color: 'var(--text-dim)' }}>
                    Плейтест: {build.testedHours || 0} ч
                    {' · '}
                    Задачи: {build.linkedTaskIds.length === 0 ? 'нет' : build.linkedTaskIds.map(id => tasks.find(task => task.id === id)?.title || id).join(', ')}
                    {' · '}
                    Баги: {build.linkedBugIds.length === 0 ? 'нет' : build.linkedBugIds.map(id => bugs.find(bug => bug.id === id)?.title || id).join(', ')}
                  </p>
                </div>

                {/* Список изменений (Changelog) */}
                {build.changelog.length > 0 && (
                  <div style={{ background: 'rgba(2, 6, 23, 0.5)', borderRadius: '6px', padding: '10px 12px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-dim)', marginBottom: '6px', textTransform: 'uppercase' }}>
                      Список изменений (Changelog):
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {build.changelog.map(ch => {
                        const typeTag = ch.type === 'feat' ? '✨ Новое' : ch.type === 'fix' ? '🐛 Фикс' : ch.type === 'balance' ? '⚖️ Баланс' : '⚡ Опт.';
                        const typeColor = ch.type === 'feat' ? 'var(--accent-cyan)' : ch.type === 'fix' ? 'var(--accent-rose)' : ch.type === 'balance' ? 'var(--accent-amber)' : 'var(--accent-emerald)';
                        return (
                          <div key={ch.id} style={{ display: 'flex', alignItems: 'baseline', gap: '8px', fontSize: '11.5px', color: '#cbd5e1' }}>
                            <span style={{ fontSize: '9.5px', fontWeight: 800, color: typeColor, minWidth: '55px' }}>
                              [{typeTag}]
                            </span>
                            <span>{ch.text}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Ссылки на сборки для тестеров */}
                {build.artifacts.length > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }} onClick={(e) => e.stopPropagation()}>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Файлы для тестеров:</span>
                    {build.artifacts.map(art => (
                      <a
                        key={art.id}
                        href={art.url}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-secondary"
                        style={{
                          fontSize: '11px',
                          padding: '4px 10px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          textDecoration: 'none'
                        }}
                        onClick={() => onShowToast(`Открыта ссылка на сборку: ${art.title}`)}
                      >
                        <span>⬇</span>
                        <span>{art.title}</span>
                        {art.sizeMb && <span style={{ opacity: 0.6, fontSize: '9.5px' }}>({art.sizeMb} МБ)</span>}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
