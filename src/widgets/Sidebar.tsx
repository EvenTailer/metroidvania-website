import React from 'react';
import { ViewType } from '../shared/config/views';

interface SidebarProps {
  currentView: ViewType;
  onSelectView: (view: ViewType) => void;
  isOpen: boolean;
  onLogout: () => void;
  taskCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onSelectView,
  isOpen,
  onLogout,
  taskCount
}) => {
  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="brand">
        <div className="brand-icon-duck" />
        <div className="brand-info">
          <h1>CYBER-DUCK</h1>
          <p>DEV HUB & AGENT NEXUS</p>
        </div>
      </div>

      <ul className="nav-list">
        <li className="nav-section-title">Разработка игры</li>
        <li>
          <button
            className={`nav-item ${currentView === 'dashboard' ? 'active' : ''}`}
            onClick={() => onSelectView('dashboard')}
          >
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" width="17" height="17">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span>Обзор проекта</span>
          </button>
        </li>
        <li>
          <button
            className={`nav-item ${currentView === 'weekly-plan' ? 'active' : ''}`}
            onClick={() => onSelectView('weekly-plan')}
          >
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" width="17" height="17">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>План на неделю</span>
            <span className="nav-badge" style={{ color: 'var(--accent-cyan)' }}>Фокус</span>
          </button>
        </li>
        <li>
          <button
            className={`nav-item ${currentView === 'roadmap' ? 'active' : ''}`}
            onClick={() => onSelectView('roadmap')}
          >
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" width="17" height="17">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span>Роадмап (0 → Steam)</span>
            <span className="nav-badge">11 шагов</span>
          </button>
        </li>
        <li>
          <button
            className={`nav-item ${currentView === 'kanban' ? 'active' : ''}`}
            onClick={() => onSelectView('kanban')}
          >
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" width="17" height="17">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7" />
            </svg>
            <span>Канбан (Спринт)</span>
            <span className="nav-badge">{taskCount}</span>
          </button>
        </li>
        <li>
          <button
            className={`nav-item ${currentView === 'team-chat' ? 'active' : ''}`}
            onClick={() => onSelectView('team-chat')}
          >
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" width="17" height="17">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span>Командный чат</span>
            <span className="nav-badge" style={{ color: 'var(--accent-cyan)' }}>Live</span>
          </button>
        </li>
        <li>
          <button
            className={`nav-item ${currentView === 'gallery' ? 'active' : ''}`}
            onClick={() => onSelectView('gallery')}
          >
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" width="17" height="17">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>Арт-хранилище</span>
          </button>
        </li>
        <li>
          <button
            className={`nav-item ${currentView === 'hero' ? 'active' : ''}`}
            onClick={() => onSelectView('hero')}
          >
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" width="17" height="17">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span>Герой и способности</span>
          </button>
        </li>
        <li>
          <button
            className={`nav-item ${currentView === 'room-matrix' ? 'active' : ''}`}
            onClick={() => onSelectView('room-matrix')}
          >
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" width="17" height="17">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            <span>Карта комнат & Гейтинг</span>
            <span className="nav-badge" style={{ color: 'var(--accent-cyan)' }}>GDD</span>
          </button>
        </li>
        <li>
          <button
            className={`nav-item ${currentView === 'bestiary' ? 'active' : ''}`}
            onClick={() => onSelectView('bestiary')}
          >
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" width="17" height="17">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span>Бестиарий & Combat</span>
            <span className="nav-badge" style={{ color: 'var(--accent-rose)' }}>Godot 4</span>
          </button>
        </li>
        <li>
          <button
            className={`nav-item ${currentView === 'playtest' ? 'active' : ''}`}
            onClick={() => onSelectView('playtest')}
          >
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" width="17" height="17">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
            <span>Журнал плейтестов</span>
            <span className="nav-badge" style={{ color: 'var(--accent-amber)' }}>QA</span>
          </button>
        </li>
        <li>
          <button
            className={`nav-item ${currentView === 'asset-pipeline' ? 'active' : ''}`}
            onClick={() => onSelectView('asset-pipeline')}
          >
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" width="17" height="17">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>Пайплайн ассетов</span>
            <span className="nav-badge" style={{ color: 'var(--accent-cyan)' }}>Checklist</span>
          </button>
        </li>
        <li>
          <button
            className={`nav-item ${currentView === 'gdscript-generator' ? 'active' : ''}`}
            onClick={() => onSelectView('gdscript-generator')}
          >
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" width="17" height="17">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
            <span>GDScript & Физика</span>
            <span className="nav-badge" style={{ color: 'var(--accent-purple)' }}>State/Move</span>
          </button>
        </li>
        <li>
          <button
            className={`nav-item ${currentView === 'engine-bridge' ? 'active' : ''}`}
            onClick={() => onSelectView('engine-bridge')}
          >
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" width="17" height="17">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
            </svg>
            <span>Мост Godot & Релизы</span>
            <span className="nav-badge" style={{ color: 'var(--accent-cyan)' }}>res://</span>
          </button>
        </li>
        <li>
          <button
            className={`nav-item ${currentView === 'notes' ? 'active' : ''}`}
            onClick={() => onSelectView('notes')}
          >
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" width="17" height="17">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <span>Мысли & Сценарий</span>
          </button>
        </li>

        <li className="nav-section-title">ИИ Интеллект & Агенты</li>
        <li>
          <button
            className={`nav-item ${currentView === 'ai-chat' ? 'active' : ''}`}
            onClick={() => onSelectView('ai-chat')}
          >
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" width="17" height="17">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            <span>Встроенный ИИ-Чат</span>
            <span className="nav-badge" style={{ color: 'var(--accent-emerald)' }}>API</span>
          </button>
        </li>
        <li>
          <button
            className={`nav-item ${currentView === 'ai-export' ? 'active' : ''}`}
            onClick={() => onSelectView('ai-export')}
          >
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" width="17" height="17">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
            </svg>
            <span>AI Context / Export</span>
          </button>
        </li>
        <li>
          <button
            className={`nav-item ${currentView === 'fsd-spec' ? 'active' : ''}`}
            onClick={() => onSelectView('fsd-spec')}
          >
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" width="17" height="17">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <span>React + FSD Карта</span>
          </button>
        </li>
      </ul>

      <div className="sidebar-footer">
        <div style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Стек: Godot 4.3</span>
          <button onClick={onLogout} style={{ background: 'none', border: 'none', color: 'var(--accent-rose)', cursor: 'pointer', fontSize: '11px' }}>
            Выйти
          </button>
        </div>
      </div>
    </aside>
  );
};
