import React, { useState } from 'react';
import {
  NarrativeChapter,
  NarrativeBlock,
  NarrativeBlockType,
  DEFAULT_NARRATIVE_CHAPTERS
} from '../../entities/narrative';
import { ConfirmModal } from '../../shared/ui/ConfirmModal';

interface NarrativeEditorProps {
  chapters: NarrativeChapter[];
  onSaveChapters: (chapters: NarrativeChapter[]) => void;
  onShowToast: (msg: string) => void;
}

const BLOCK_META: Record<NarrativeBlockType, { label: string; icon: string; color: string; bg: string }> = {
  dialogue: { label: 'Диалог', icon: '💬', color: 'var(--accent-cyan)', bg: 'rgba(0, 242, 254, 0.1)' },
  cutscene: { label: 'Катсцена / Действие', icon: '🎬', color: 'var(--accent-purple)', bg: 'rgba(168, 85, 247, 0.1)' },
  lore: { label: 'Лор / Записка / Терминал', icon: '📟', color: 'var(--accent-amber)', bg: 'rgba(245, 158, 11, 0.1)' },
  choice: { label: 'Выбор игрока', icon: '🔀', color: 'var(--accent-pink)', bg: 'rgba(236, 72, 153, 0.1)' },
  event: { label: 'Триггер Godot 4.3', icon: '⚙️', color: 'var(--accent-emerald)', bg: 'rgba(16, 185, 129, 0.1)' }
};

const SUGGESTED_SPEAKERS = [
  'Агент-09: Кибер-Утка',
  'Док «Стилус»',
  'Корпоративный Центурион MK-IV',
  'ИИ-Диспетчер «Нейро-Синтез»',
  'Дрон-разведчик V-12',
  'Торговец запчастями'
];

export const NarrativeEditor: React.FC<NarrativeEditorProps> = ({
  chapters,
  onSaveChapters,
  onShowToast
}) => {
  const [selectedChapterId, setSelectedChapterId] = useState<string>(
    chapters[0]?.id || DEFAULT_NARRATIVE_CHAPTERS[0].id
  );
  const [editingBlockId, setEditingBlockId] = useState<string | null>(null);
  const [chapterToDelete, setChapterToDelete] = useState<string | null>(null);

  // Fallback to defaults if list is empty
  const activeChapters = chapters.length > 0 ? chapters : DEFAULT_NARRATIVE_CHAPTERS;
  const currentChapter =
    activeChapters.find(c => c.id === selectedChapterId) || activeChapters[0];

  const updateChapter = (updated: NarrativeChapter) => {
    const next = activeChapters.map(c => (c.id === updated.id ? updated : c));
    onSaveChapters(next);
  };

  const handleAddChapter = () => {
    const newIdx = activeChapters.length;
    const newChapter: NarrativeChapter = {
      id: `ch-${Date.now()}`,
      act: `Акт ${newIdx} • Новый эпизод`,
      title: 'Название новой главы сценария',
      location: 'Неоновый сектор',
      summary: 'Краткое описание событий и сюжетной цели эпизода...',
      blocks: [
        {
          id: `b-${Date.now()}-1`,
          type: 'cutscene',
          title: 'Вход в локацию',
          content: 'Кибер-Утка проникает через вентиляционную решетку в заброшенный отсек...'
        }
      ]
    };
    const next = [...activeChapters, newChapter];
    onSaveChapters(next);
    setSelectedChapterId(newChapter.id);
    onShowToast('Новая глава добавлена в сценарий!');
  };

  const handleDeleteChapter = (chId: string) => {
    if (activeChapters.length <= 1) {
      onShowToast('В сценарии должна оставаться хотя бы одна глава');
      return;
    }
    setChapterToDelete(chId);
  };

  const confirmDeleteChapter = () => {
    if (!chapterToDelete) return;
    const next = activeChapters.filter(c => c.id !== chapterToDelete);
    onSaveChapters(next);
    setSelectedChapterId(next[0].id);
    onShowToast('Глава удалена');
    setChapterToDelete(null);
  };

  const handleAddBlock = (type: NarrativeBlockType) => {
    if (!currentChapter) return;
    const newBlock: NarrativeBlock = {
      id: `b-${Date.now()}`,
      type,
      speaker: type === 'dialogue' ? 'Агент-09: Кибер-Утка' : undefined,
      emotion: type === 'dialogue' ? 'Спокойно' : undefined,
      title: type === 'cutscene' ? 'Действие в кадре' : type === 'lore' ? 'Зашифрованный файл' : type === 'choice' ? 'Решение героя' : 'Событие движка',
      content: type === 'dialogue' ? 'Текст реплики персонажа...' : type === 'choice' ? 'Вопрос перед выбором пути' : 'Описание происходящего...',
      godotTrigger: type === 'event' ? '$Door.open() • SoundManager.play("sfx_door")' : undefined,
      choices: type === 'choice' ? [
        { text: 'Вариант ответа 1', reaction: 'Реакция собеседника на вариант 1' },
        { text: 'Вариант ответа 2', reaction: 'Реакция собеседника на вариант 2' }
      ] : undefined
    };

    const nextBlocks = [...currentChapter.blocks, newBlock];
    updateChapter({ ...currentChapter, blocks: nextBlocks });
    setEditingBlockId(newBlock.id);
    onShowToast(`Добавлен блок: ${BLOCK_META[type].label}`);
  };

  const handleMoveBlock = (idx: number, direction: 'up' | 'down') => {
    if (!currentChapter) return;
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= currentChapter.blocks.length) return;

    const list = [...currentChapter.blocks];
    const [moved] = list.splice(idx, 1);
    list.splice(targetIdx, 0, moved);
    updateChapter({ ...currentChapter, blocks: list });
  };

  const handleDeleteBlock = (blockId: string) => {
    if (!currentChapter) return;
    const nextBlocks = currentChapter.blocks.filter(b => b.id !== blockId);
    updateChapter({ ...currentChapter, blocks: nextBlocks });
    if (editingBlockId === blockId) setEditingBlockId(null);
    onShowToast('Блок сценария удален');
  };

  const handleUpdateBlockField = (blockId: string, field: keyof NarrativeBlock, val: unknown) => {
    if (!currentChapter) return;
    const nextBlocks = currentChapter.blocks.map(b => (b.id === blockId ? { ...b, [field]: val } : b));
    updateChapter({ ...currentChapter, blocks: nextBlocks });
  };

  const exportScenarioToText = () => {
    let script = `# СЦЕНАРИЙ И ДИАЛОГИ: CYBER-DUCK METROIDVANIA\n# Экспорт для диалоговой системы и катсцен Godot 4.3\n\n`;

    activeChapters.forEach((ch, ci) => {
      script += `========================================================\n`;
      script += `## [${ch.act}] ${ch.title.toUpperCase()}\n`;
      script += `Локация: ${ch.location}\n`;
      script += `Синопсис: ${ch.summary}\n`;
      script += `========================================================\n\n`;

      ch.blocks.forEach((b, bi) => {
        const meta = BLOCK_META[b.type];
        script += `[БЛОК ${ci + 1}.${bi + 1} • ${meta.label.toUpperCase()}]\n`;

        if (b.type === 'dialogue') {
          script += `${b.speaker || 'ГЕРОЙ'} (${b.emotion || 'Обычный'}):\n`;
          script += `"${b.content}"\n`;
        } else if (b.type === 'cutscene') {
          script += `🎬 ДЕЙСТВИЕ (${b.title || 'Сцена'}):\n`;
          script += `${b.content}\n`;
        } else if (b.type === 'lore') {
          script += `📟 ТЕРМИНАЛ / ЗАПИСЬ: ${b.title || 'Лог'}\n`;
          script += `"${b.content}"\n`;
        } else if (b.type === 'choice') {
          script += `🔀 ВЫБОР ИГРОКА: ${b.content}\n`;
          b.choices?.forEach((c, idx) => {
            script += `  [${idx + 1}] "${c.text}" -> ${c.reaction || ''}\n`;
          });
        } else if (b.type === 'event') {
          script += `⚙️ ТРИГГЕР GODOT: ${b.title}\n`;
          script += `Событие: ${b.content}\n`;
        }

        if (b.godotTrigger) {
          script += `[Godot Signal / Node]: ${b.godotTrigger}\n`;
        }
        script += `\n`;
      });
      script += `\n`;
    });

    navigator.clipboard.writeText(script).then(() => {
      onShowToast('Сценарий скопирован! Можно вставлять в Godot Dialogic или GDD');
    });
  };

  return (
    <div className="narrative-studio-layout">
      {/* Studio Header & Chapter Tabs */}
      <div className="narrative-studio-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h3 style={{ fontSize: '17px', color: '#fff', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>📜</span> Сценарный конструктор: Сюжет, Диалоги & Логи
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '3px 0 0' }}>
              Пишите сюжет игры по блокам: реплики персонажей, катсцены, терминалы лора и выборы для интеграции в Godot.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-primary"
              style={{ fontSize: '11.5px', padding: '6px 12px' }}
              onClick={exportScenarioToText}
            >
              📋 Экспорт в Godot (Копировать)
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ fontSize: '11.5px', padding: '6px 12px' }}
              onClick={handleAddChapter}
            >
              + Новая глава
            </button>
          </div>
        </div>

        {/* Chapters selector horizontal list */}
        <div className="narrative-chapters-pills">
          {activeChapters.map(ch => {
            const isSel = ch.id === currentChapter?.id;
            return (
              <button
                key={ch.id}
                type="button"
                className={`chapter-tab-pill ${isSel ? 'active' : ''}`}
                onClick={() => {
                  setSelectedChapterId(ch.id);
                  setEditingBlockId(null);
                }}
              >
                <div style={{ fontSize: '10px', color: isSel ? 'var(--accent-cyan)' : 'var(--text-dim)', fontWeight: 700 }}>
                  {ch.act}
                </div>
                <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '200px' }}>
                  {ch.title}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {currentChapter && (
        <div className="narrative-chapter-body">
          {/* Chapter Meta Card */}
          <div className="chapter-meta-card">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
              <div>
                <label className="composer-label">Акт / Фаза</label>
                <input
                  type="text"
                  className="input-text"
                  value={currentChapter.act}
                  onChange={e => updateChapter({ ...currentChapter, act: e.target.value })}
                />
              </div>

              <div>
                <label className="composer-label">Название эпизода</label>
                <input
                  type="text"
                  className="input-text"
                  value={currentChapter.title}
                  onChange={e => updateChapter({ ...currentChapter, title: e.target.value })}
                />
              </div>

              <div>
                <label className="composer-label">Локация в игре (Сектор / Комната)</label>
                <input
                  type="text"
                  className="input-text"
                  value={currentChapter.location}
                  onChange={e => updateChapter({ ...currentChapter, location: e.target.value })}
                />
              </div>
            </div>

            <div style={{ marginTop: '10px' }}>
              <label className="composer-label">Синопсис и задача главы</label>
              <textarea
                className="composer-textarea"
                rows={2}
                value={currentChapter.summary}
                onChange={e => updateChapter({ ...currentChapter, summary: e.target.value })}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
              <button
                type="button"
                className="btn btn-ghost"
                style={{ fontSize: '11px', color: 'var(--accent-pink)' }}
                onClick={() => handleDeleteChapter(currentChapter.id)}
              >
                🗑️ Удалить главу
              </button>
            </div>
          </div>

          {/* Quick Add Block Bar */}
          <div className="narrative-quick-add-bar">
            <span style={{ fontSize: '11.5px', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase' }}>
              + Добавить блок:
            </span>
            <button
              type="button"
              className="narrative-add-type-btn"
              style={{ color: 'var(--accent-cyan)', borderColor: 'rgba(0, 242, 254, 0.3)' }}
              onClick={() => handleAddBlock('dialogue')}
            >
              💬 Диалог
            </button>
            <button
              type="button"
              className="narrative-add-type-btn"
              style={{ color: 'var(--accent-purple)', borderColor: 'rgba(168, 85, 247, 0.3)' }}
              onClick={() => handleAddBlock('cutscene')}
            >
              🎬 Катсцена
            </button>
            <button
              type="button"
              className="narrative-add-type-btn"
              style={{ color: 'var(--accent-amber)', borderColor: 'rgba(245, 158, 11, 0.3)' }}
              onClick={() => handleAddBlock('lore')}
            >
              📟 Лор / Терминал
            </button>
            <button
              type="button"
              className="narrative-add-type-btn"
              style={{ color: 'var(--accent-pink)', borderColor: 'rgba(236, 72, 153, 0.3)' }}
              onClick={() => handleAddBlock('choice')}
            >
              🔀 Выбор игрока
            </button>
            <button
              type="button"
              className="narrative-add-type-btn"
              style={{ color: 'var(--accent-emerald)', borderColor: 'rgba(16, 185, 129, 0.3)' }}
              onClick={() => handleAddBlock('event')}
            >
              ⚙️ Триггер Godot
            </button>
          </div>

          {/* Blocks Timeline / Script View */}
          <div className="narrative-blocks-stream">
            {currentChapter.blocks.length === 0 ? (
              <div className="empty-blocks-placeholder">
                В этой главе еще нет сценарных блоков. Добавьте первый диалог или катсцену кнопками выше!
              </div>
            ) : (
              currentChapter.blocks.map((block, idx) => {
                const meta = BLOCK_META[block.type];
                const isEditing = editingBlockId === block.id;

                return (
                  <div key={block.id} className={`narrative-block-card ${isEditing ? 'is-editing' : ''}`}>
                    {/* Block Header */}
                    <div className="block-card-header">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span className="block-index-pill">#{idx + 1}</span>
                        <span
                          className="role-badge"
                          style={{ color: meta.color, background: meta.bg, borderColor: meta.color }}
                        >
                          {meta.icon} {meta.label}
                        </span>

                        {block.type === 'dialogue' && (
                          <span style={{ fontSize: '13px', fontWeight: 700, color: '#fff' }}>
                            {block.speaker || 'Персонаж'}
                            {block.emotion && (
                              <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500, marginLeft: '6px' }}>
                                ({block.emotion})
                              </span>
                            )}
                          </span>
                        )}

                        {block.type !== 'dialogue' && block.title && (
                          <span style={{ fontSize: '13px', fontWeight: 700, color: '#fff' }}>
                            {block.title}
                          </span>
                        )}
                      </div>

                      {/* Header controls: move up/down, edit, delete */}
                      <div className="block-controls-row">
                        <button
                          type="button"
                          className="block-mini-btn"
                          disabled={idx === 0}
                          onClick={() => handleMoveBlock(idx, 'up')}
                          title="Сдвинуть вверх"
                        >
                          ▲
                        </button>
                        <button
                          type="button"
                          className="block-mini-btn"
                          disabled={idx === currentChapter.blocks.length - 1}
                          onClick={() => handleMoveBlock(idx, 'down')}
                          title="Сдвинуть вниз"
                        >
                          ▼
                        </button>
                        <button
                          type="button"
                          className={`block-mini-btn ${isEditing ? 'active' : ''}`}
                          onClick={() => setEditingBlockId(isEditing ? null : block.id)}
                          title="Редактировать блок"
                        >
                          {isEditing ? '✓ Закрыть' : '✏️ Редактировать'}
                        </button>
                        <button
                          type="button"
                          className="block-mini-btn danger"
                          onClick={() => handleDeleteBlock(block.id)}
                          title="Удалить блок"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>

                    {/* Block Preview Content */}
                    {!isEditing && (
                      <div className="block-preview-content">
                        {block.type === 'dialogue' && (
                          <div className="dialogue-speech-box">
                            «{block.content}»
                          </div>
                        )}

                        {block.type === 'cutscene' && (
                          <div className="cutscene-desc-box">
                            🎬 {block.content}
                          </div>
                        )}

                        {block.type === 'lore' && (
                          <div className="lore-terminal-box">
                            <div style={{ fontSize: '11px', color: 'var(--accent-amber)', marginBottom: '4px', textTransform: 'uppercase' }}>
                              [ТЕРМИНАЛ / ДАННЫЕ]
                            </div>
                            {block.content}
                          </div>
                        )}

                        {block.type === 'choice' && (
                          <div className="choice-options-box">
                            <div style={{ fontSize: '12px', fontWeight: 700, color: '#fff', marginBottom: '6px' }}>
                              {block.content}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              {block.choices?.map((c, ci) => (
                                <div key={ci} className="choice-option-pill">
                                  <span style={{ color: 'var(--accent-pink)', fontWeight: 700 }}>{ci + 1}.</span> {c.text}
                                  {c.reaction && (
                                    <span style={{ color: 'var(--text-dim)', fontSize: '11px', marginLeft: '6px' }}>
                                      → {c.reaction}
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {block.type === 'event' && (
                          <div className="event-trigger-box">
                            ⚙️ <b>Событие:</b> {block.content}
                          </div>
                        )}

                        {block.godotTrigger && (
                          <div className="block-godot-badge">
                            🎮 Godot: <code>{block.godotTrigger}</code>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Inline Editor Panel */}
                    {isEditing && (
                      <div className="block-inline-editor">
                        {block.type === 'dialogue' && (
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', marginBottom: '10px' }}>
                            <div>
                              <label className="composer-label">Говорящий персонаж</label>
                              <input
                                type="text"
                                className="input-text"
                                list="speakers-list"
                                value={block.speaker || ''}
                                onChange={e => handleUpdateBlockField(block.id, 'speaker', e.target.value)}
                              />
                              <datalist id="speakers-list">
                                {SUGGESTED_SPEAKERS.map(s => (
                                  <option key={s} value={s} />
                                ))}
                              </datalist>
                            </div>

                            <div>
                              <label className="composer-label">Эмоция / Интонация</label>
                              <input
                                type="text"
                                className="input-text"
                                placeholder="Спокойно, Злость, Усмешка, Помехи..."
                                value={block.emotion || ''}
                                onChange={e => handleUpdateBlockField(block.id, 'emotion', e.target.value)}
                              />
                            </div>
                          </div>
                        )}

                        {block.type !== 'dialogue' && (
                          <div style={{ marginBottom: '10px' }}>
                            <label className="composer-label">Заголовок / Название сцены</label>
                            <input
                              type="text"
                              className="input-text"
                              value={block.title || ''}
                              onChange={e => handleUpdateBlockField(block.id, 'title', e.target.value)}
                            />
                          </div>
                        )}

                        <div style={{ marginBottom: '10px' }}>
                          <label className="composer-label">
                            {block.type === 'dialogue' ? 'Текст реплики' : 'Описание / Текст терминала'}
                          </label>
                          <textarea
                            className="composer-textarea"
                            rows={3}
                            value={block.content}
                            onChange={e => handleUpdateBlockField(block.id, 'content', e.target.value)}
                          />
                        </div>

                        <div>
                          <label className="composer-label">
                            🎮 Узел / Триггер Godot 4.3 (сигнал, скрипт, метод)
                          </label>
                          <input
                            type="text"
                            className="input-text"
                            style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11.5px', color: 'var(--accent-cyan)' }}
                            placeholder='$Player.unlock("dash") / emit_signal("dialogue_finished")'
                            value={block.godotTrigger || ''}
                            onChange={e => handleUpdateBlockField(block.id, 'godotTrigger', e.target.value)}
                          />
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                          <button
                            type="button"
                            className="btn btn-primary"
                            style={{ fontSize: '11px', padding: '4px 12px' }}
                            onClick={() => setEditingBlockId(null)}
                          >
                            ✓ Готово
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={Boolean(chapterToDelete)}
        title="Удаление главы сценария"
        message="Вы уверены, что хотите удалить эту главу со всеми диалогами, катсценами и триггерами Godot? Это действие нельзя будет отменить."
        confirmText="Удалить главу"
        cancelText="Отмена"
        danger={true}
        onConfirm={confirmDeleteChapter}
        onClose={() => setChapterToDelete(null)}
      />
    </div>
  );
};
