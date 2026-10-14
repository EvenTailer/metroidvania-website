import React, { useState } from 'react';
import { TaskCategory } from '../entities/task';
import { NoteItem } from '../entities/note';
import { NarrativeChapter } from '../entities/narrative';
import { NoteComposer } from '../features/note-capture/NoteComposer';
import { NarrativeEditor } from '../features/narrative-editor/NarrativeEditor';

interface NotesPageProps {
  notes: NoteItem[];
  onAddNote: (tag: string, text: string) => void;
  onDeleteNote?: (id: string) => void;
  onCreateTask?: (title: string, category: TaskCategory) => void;
  chapters?: NarrativeChapter[];
  onSaveChapters?: (chapters: NarrativeChapter[]) => void;
  onShowToast: (msg: string) => void;
}

const NOTE_TAGS = [
  { id: 'all', label: 'Все идеи', icon: '⚡' },
  { id: 'Механика', label: 'Механики', icon: '💡' },
  { id: 'Арт', label: 'Арт & Спрайты', icon: '🎨' },
  { id: 'Уровень', label: 'Левел-дизайн', icon: '🗺' },
  { id: 'Босс', label: 'Боссы & Мобы', icon: '👾' },
  { id: 'Звук', label: 'Звук & Музыка', icon: '🎵' },
  { id: 'Лор', label: 'Сюжет & Лор', icon: '📜' }
];

export const NotesPage: React.FC<NotesPageProps> = ({
  notes,
  onAddNote,
  onDeleteNote,
  onCreateTask,
  chapters = [],
  onSaveChapters,
  onShowToast
}) => {
  const [activeTab, setActiveTab] = useState<'notes' | 'narrative'>('notes');
  const [selectedTagFilter, setSelectedTagFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredNotes = notes.filter(n => {
    const matchTag = selectedTagFilter === 'all' || n.tag === selectedTagFilter;
    const matchSearch = !searchQuery.trim() || n.text.toLowerCase().includes(searchQuery.toLowerCase());
    return matchTag && matchSearch;
  });

  const handlePushToKanban = (note: NoteItem) => {
    if (!onCreateTask) return;
    const cat: TaskCategory =
      note.tag === 'Механика' ? 'code' : note.tag === 'Арт' ? 'art' : note.tag === 'Звук' ? 'audio' : 'design';
    onCreateTask(`[ИДЕЯ: ${note.tag}] ${note.text.slice(0, 70)}`, cat);
    onShowToast('Мысль успешно отправлена в задачи Канбана!');
  };

  const handlePushToNarrative = (note: NoteItem) => {
    if (!onSaveChapters || chapters.length === 0) return;
    const firstChapter = chapters[0];
    const newBlock = {
      id: `b-note-${Date.now()}`,
      type: 'lore' as const,
      title: `Заметка GDD (${note.tag})`,
      content: note.text
    };
    const nextChapters = chapters.map(c =>
      c.id === firstChapter.id ? { ...c, blocks: [...c.blocks, newBlock] } : c
    );
    onSaveChapters(nextChapters);
    onShowToast(`Мысль скопирована в главу «${firstChapter.title}» сценария!`);
  };

  return (
    <div className="view-content gdd-notes-view">
      {/* Top Tabs Switcher: Thoughts vs Narrative */}
      <div className="gdd-main-tabs-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <div className="gdd-nav-pill-group">
            <button
              type="button"
              className={`gdd-nav-pill ${activeTab === 'notes' ? 'active' : ''}`}
              onClick={() => setActiveTab('notes')}
            >
              💡 Мысли & GDD Заметки ({notes.length})
            </button>
            <button
              type="button"
              className={`gdd-nav-pill ${activeTab === 'narrative' ? 'active' : ''}`}
              onClick={() => setActiveTab('narrative')}
            >
              📜 Сценарий по блокам (Narrative Studio)
            </button>
          </div>

          <div style={{ fontSize: '11.5px', color: 'var(--text-dim)' }}>
            {activeTab === 'notes' ? 'Голосовые и текстовые мысли' : 'Сюжет, диалоги и лорные логи'}
          </div>
        </div>
      </div>

      {/* VIEW 1: NARRATIVE EDITOR */}
      {activeTab === 'narrative' && onSaveChapters && (
        <NarrativeEditor
          chapters={chapters}
          onSaveChapters={onSaveChapters}
          onShowToast={onShowToast}
        />
      )}

      {/* VIEW 2: THOUGHTS & GDD CARDS */}
      {activeTab === 'notes' && (
        <div className="notes-studio-container">
          {/* Note Composer Box */}
          <NoteComposer onAddNote={onAddNote} onShowToast={onShowToast} dock />

          {/* Filter & Search Bar */}
          <div className="notes-filter-search-bar">
            <div className="notes-tag-filters">
              {NOTE_TAGS.map(t => (
                <button
                  key={t.id}
                  type="button"
                  className={`pill-btn ${selectedTagFilter === t.id ? 'active' : ''}`}
                  onClick={() => setSelectedTagFilter(t.id)}
                >
                  <span>{t.icon}</span> {t.label}
                </button>
              ))}
            </div>

            <div className="notes-search-box">
              <input
                type="text"
                placeholder="🔍 Поиск по мыслям..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Cards Grid */}
          <div className="notes-cards-grid">
            {filteredNotes.length === 0 ? (
              <div className="notes-empty-state">
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>💡</div>
                <div style={{ fontSize: '15px', color: '#fff', fontWeight: 700 }}>
                  {searchQuery ? 'Ничего не найдено по вашему запросу' : 'Пока нет сохраненных мыслей'}
                </div>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Нажмите на микрофон или введите текст выше, чтобы зафиксировать идею механики, арта или босса.
                </p>
              </div>
            ) : (
              filteredNotes.map(note => {
                const authorColor = note.author.includes('1')
                  ? 'var(--accent-cyan)'
                  : note.author.includes('2')
                  ? 'var(--accent-purple)'
                  : 'var(--accent-amber)';

                return (
                  <div key={note.id} className="gdd-note-card">
                    <div className="gdd-note-card-header">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span className="gdd-note-tag-badge">
                          {note.tag}
                        </span>
                        <span className="gdd-note-author" style={{ color: authorColor }}>
                          • {note.author}
                        </span>
                      </div>
                      <span className="gdd-note-date">{note.date}</span>
                    </div>

                    <div className="gdd-note-text">
                      {note.text}
                    </div>

                    <div className="gdd-note-card-footer">
                      <div style={{ display: 'flex', gap: '6px' }}>
                        {onCreateTask && (
                          <button
                            type="button"
                            className="gdd-card-btn"
                            onClick={() => handlePushToKanban(note)}
                            title="Создать задачу в Канбане из этой идеи"
                          >
                            + В Канбан
                          </button>
                        )}
                        {onSaveChapters && (
                          <button
                            type="button"
                            className="gdd-card-btn"
                            onClick={() => handlePushToNarrative(note)}
                            title="Добавить эту мысль в сценарий игры"
                          >
                            + В сценарий
                          </button>
                        )}
                      </div>

                      {onDeleteNote && (
                        <button
                          type="button"
                          className="gdd-card-delete-btn"
                          onClick={() => onDeleteNote(note.id)}
                          title="Удалить мысль"
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
