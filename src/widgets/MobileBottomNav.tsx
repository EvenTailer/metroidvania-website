import React from 'react';
import { ViewType } from '../shared/config/views';

interface MobileBottomNavProps {
  currentView: ViewType;
  onSelectView: (view: ViewType) => void;
  onOpenSidebar: () => void;
}

function NavGlyph({ d }: { d: string }) {
  return (
    <span className="nav-glyph">
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={d} />
      </svg>
    </span>
  );
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentView,
  onSelectView,
  onOpenSidebar
}) => {
  return (
    <nav className="mobile-bottom-nav" aria-label="Мобильная навигация">
      <ul className="mobile-nav-list">
        <li>
          <button
            type="button"
            className={`mobile-nav-item ${currentView === 'dashboard' ? 'active' : ''}`}
            onClick={() => onSelectView('dashboard')}
          >
            <NavGlyph d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            <span>Обзор</span>
          </button>
        </li>
        <li>
          <button
            type="button"
            className={`mobile-nav-item ${currentView === 'kanban' ? 'active' : ''}`}
            onClick={() => onSelectView('kanban')}
          >
            <NavGlyph d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7" />
            <span>Канбан</span>
          </button>
        </li>
        <li>
          <button
            type="button"
            className={`mobile-nav-item is-primary ${currentView === 'notes' ? 'active' : ''}`}
            onClick={() => onSelectView('notes')}
          >
            <NavGlyph d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            <span>Мысли</span>
          </button>
        </li>
        <li>
          <button
            type="button"
            className={`mobile-nav-item ${currentView === 'asset-pipeline' ? 'active' : ''}`}
            onClick={() => onSelectView('asset-pipeline')}
          >
            <NavGlyph d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            <span>Ассеты</span>
          </button>
        </li>
        <li>
          <button
            type="button"
            className={`mobile-nav-item ${currentView === 'team-chat' ? 'active' : ''}`}
            onClick={() => onSelectView('team-chat')}
          >
            <NavGlyph d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            <span>Чат</span>
          </button>
        </li>
        <li>
          <button type="button" className="mobile-nav-item" onClick={onOpenSidebar}>
            <NavGlyph d="M4 6h16M4 12h16M4 18h16" />
            <span>Ещё</span>
          </button>
        </li>
      </ul>
    </nav>
  );
};
