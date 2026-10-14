import React from 'react';
import { Author } from '../entities/author';
import { ViewType } from '../shared/config/views';

interface TopbarProps {
  currentView: ViewType;
  currentAuthor: Author;
  onCycleAuthor: () => void;
  onToggleSidebar: () => void;
  onCopyContext: () => void;
  onOpenCommandPalette?: () => void;
  onOpenHotkeysModal?: () => void;
  onOpenGlossaryModal?: () => void;
  isSoundMuted?: boolean;
  onToggleSoundMute?: () => void;
  isOnline?: boolean;
  cacheReady?: boolean;
}

const VIEW_TITLES: Record<ViewType, { title: string; subtitle: string }> = {
  dashboard: { title: 'Обзор проекта', subtitle: 'Статус разработки кибер-метроидвании' },
  'weekly-plan': { title: 'План на неделю', subtitle: 'Тактическое планирование по дням, три цели и таймер фокуса' },
  roadmap: { title: 'Роадмап (0 → Steam)', subtitle: 'Пошаговый план от установки Godot до релиза в магазине' },
  kanban: { title: 'Канбан-доска', subtitle: 'Спринт на 2 недели и распределение задач' },
  'team-chat': { title: 'Командный чат', subtitle: 'Оперативная связь команды: Юзер 1, Юзер 2, Юзер 3' },
  gallery: { title: 'Арт-хранилище', subtitle: 'Галерея концептов, спрайтов и референсов' },
  hero: { title: 'Герой и способности', subtitle: 'Импланты, гейтинг зон и карточки персонажей' },
  notes: { title: 'Мысли & Сценарий', subtitle: 'Голосовые заметки GDD и блочный конструктор сюжета' },
  'ai-chat': { title: 'Встроенный ИИ-Чат', subtitle: 'Диалог с геймдизайн-ассистентом (DeepSeek / Groq / OpenRouter)' },
  'ai-export': { title: 'AI Context / Export', subtitle: 'Генератор единого контекста для Cursor и Grok' },
  'fsd-spec': { title: 'React FSD Спецификация', subtitle: 'Архитектура слоев для масштабирования' },
  'room-matrix': { title: 'Матрица комнат & Гейтинг', subtitle: 'Интерактивная карта мира, проверка замков способностей и экспорт в Godot 4' },
  bestiary: { title: 'Бестиарий & Combat Design', subtitle: 'Каталог врагов: досье, комнаты появления и файлы для Godot' },
  playtest: { title: 'Журнал плейтестов', subtitle: 'Баги и застревания: сцена Godot, комната, шаги и скриншот' },
  'asset-pipeline': { title: 'Пайплайн ассетов', subtitle: 'Трекинг графики и звука от наброска до игры с чек-листом для Godot 4' },
  'gdscript-generator': { title: 'Генератор GDScript & Калькулятор физики', subtitle: 'State Machine (8 состояний) и расчет физики CharacterBody2D для Godot 4' },
  'engine-bridge': { title: 'Мост к движку Godot & Трекер релизов', subtitle: 'Синхронизация конфигов в res://data/ и трекер версий билдов для плейтестов' }
};

export const Topbar: React.FC<TopbarProps> = ({
  currentView,
  currentAuthor,
  onCycleAuthor,
  onToggleSidebar,
  onCopyContext,
  onOpenCommandPalette,
  onOpenHotkeysModal,
  onOpenGlossaryModal,
  isSoundMuted = false,
  onToggleSoundMute,
  isOnline = true,
  cacheReady = false
}) => {
  const meta = VIEW_TITLES[currentView] || { title: 'Разработка', subtitle: '' };

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="mobile-menu-btn" onClick={onToggleSidebar}>
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div>
          <h2 className="topbar-title">{meta.title}</h2>
          <p className="topbar-subtitle">{meta.subtitle}</p>
        </div>
      </div>

      <div className="topbar-right">
        {/* Кнопка быстрого поиска Command Palette */}
        {onOpenCommandPalette && (
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onOpenCommandPalette}
            title="Открыть командную палитру поиска (Ctrl+K)"
            style={{
              fontSize: '11.5px',
              padding: '5px 10px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              borderColor: 'rgba(0, 242, 254, 0.3)'
            }}
          >
            <span>🔍</span>
            <span className="topbar-search-label">Поиск</span>
            <kbd
              style={{
                fontSize: '9.5px',
                fontFamily: 'monospace',
                background: 'rgba(0, 242, 254, 0.1)',
                color: 'var(--accent-cyan)',
                border: '1px solid rgba(0, 242, 254, 0.25)',
                borderRadius: '3px',
                padding: '1px 4px'
              }}
            >
              Ctrl+K
            </kbd>
          </button>
        )}

        {/* Справочник терминов */}
        {onOpenGlossaryModal && (
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onOpenGlossaryModal}
            title="Справочник разработчика: понятно даже школьнику (клавиша G)"
            style={{ fontSize: '11.5px', padding: '5px 8px', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
          >
            <span>📖</span>
            <span className="topbar-help-label">Справка</span>
          </button>
        )}

        {/* Горячие клавиши */}
        {onOpenHotkeysModal && (
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onOpenHotkeysModal}
            title="Шпаргалка горячих клавиш (клавиша ?)"
            style={{ fontSize: '11.5px', padding: '5px 8px', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
          >
            <span>⌨️</span>
            <kbd style={{ fontSize: '9.5px', opacity: 0.8 }}>?</kbd>
          </button>
        )}

        {/* Переключатель звука */}
        {onToggleSoundMute && (
          <button
            type="button"
            className="icon-btn"
            onClick={onToggleSoundMute}
            title={isSoundMuted ? 'Включить звуковые эффекты (клавиша M)' : 'Выключить звуковые эффекты (клавиша M)'}
            style={{ fontSize: '13px', padding: '5px' }}
          >
            {isSoundMuted ? '🔇' : '🔊'}
          </button>
        )}

        {/* Индикатор сети PWA */}
        <div
          title={isOnline ? 'Сеть подключена' : cacheReady ? 'Сети нет. Оболочка хаба открыта из кэша' : 'Сети нет. Кэш ещё не готов: откройте хаб онлайн один раз'}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            fontSize: '11px',
            padding: '4px 8px',
            borderRadius: '12px',
            background: isOnline ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.15)',
            border: `1px solid ${isOnline ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.4)'}`,
            color: isOnline ? 'var(--accent-emerald)' : 'var(--accent-amber)',
            fontWeight: 700
          }}
        >
          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: isOnline ? '#10b981' : '#f59e0b',
              boxShadow: isOnline ? '0 0 6px #10b981' : '0 0 6px #f59e0b'
            }}
          />
          <span className="topbar-online-text">{isOnline ? 'Онлайн' : 'Офлайн'}</span>
        </div>

        <div className="author-badge" onClick={onCycleAuthor} title="Кликните для смены роли">
          <div className="author-avatar-dot">{currentAuthor.avatar}</div>
          <span className="author-name">{currentAuthor.name}</span>
        </div>

        <button type="button" className="btn btn-cyan" onClick={onCopyContext} aria-label="Скопировать контекст для агента">
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
          </svg>
          <span className="topbar-copy-label">Контекст для Агента</span>
        </button>
      </div>
    </header>
  );
};
