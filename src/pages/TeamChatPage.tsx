import React, { useRef, useState, useEffect } from 'react';
import { Author } from '../entities/author';
import { TeamMessage, TeamMessageTag } from '../entities/chat';
import { TaskCategory } from '../entities/task';
import { uploadImageToServer } from '../entities/gallery';
import { MicButton } from '../shared/ui/MicButton';
import { useSpeechInput } from '../shared/lib/useSpeechInput';

interface TeamChatPageProps {
  currentAuthor: Author;
  messages: TeamMessage[];
  onSendMessage: (msg: TeamMessage) => void;
  onDeleteMessage: (id: string) => void;
  onCreateTask: (title: string, category: TaskCategory) => void;
  onOpenLightbox: (url: string) => void;
  onShowToast: (msg: string) => void;
  onRefreshFromServer?: () => void;
  serverSynced?: boolean;
}

const TAG_CONFIG: Record<TeamMessageTag, { label: string; icon: string; color: string }> = {
  код: { label: 'Код', icon: '⚡', color: 'var(--accent-cyan)' },
  арт: { label: 'Арт', icon: '🎨', color: 'var(--accent-purple)' },
  баг: { label: 'Баги', icon: '🐞', color: 'var(--accent-pink)' },
  сборка: { label: 'Сборка', icon: '🎮', color: 'var(--accent-amber)' },
  обсуждение: { label: 'Идея', icon: '💡', color: '#38bdf8' }
};

const FILTER_TAGS: { id: TeamMessageTag | 'all'; label: string; icon: string }[] = [
  { id: 'all', label: 'Все', icon: '💬' },
  { id: 'код', label: 'Код', icon: '⚡' },
  { id: 'арт', label: 'Арт', icon: '🎨' },
  { id: 'баг', label: 'Баги', icon: '🐞' },
  { id: 'сборка', label: 'Сборка', icon: '🎮' },
  { id: 'обсуждение', label: 'Идеи', icon: '💡' }
];

export const TeamChatPage: React.FC<TeamChatPageProps> = ({
  currentAuthor,
  messages,
  onSendMessage,
  onDeleteMessage,
  onCreateTask,
  onOpenLightbox,
  onShowToast,
  onRefreshFromServer,
  serverSynced = true
}) => {
  const [inputText, setInputText] = useState('');
  const [selectedTag, setSelectedTag] = useState<TeamMessageTag>('обсуждение');
  const [filterTag, setFilterTag] = useState<TeamMessageTag | 'all'>('all');
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const speech = useSpeechInput(onShowToast);

  // Auto-scroll to bottom of chat
  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => {
    scrollToBottom('auto');
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const vv = window.visualViewport;
    const sync = () => {
      const height = vv?.height ?? window.innerHeight;
      const offset = vv?.offsetTop ?? 0;
      const keyboardOpen = window.innerHeight - height - offset > 80;
      root.style.setProperty('--vv-top', `${offset}px`);
      root.style.setProperty('--vv-height', `${height}px`);
      root.style.setProperty('--chat-bottom', keyboardOpen ? '0px' : 'var(--mobile-nav-height)');
    };
    sync();
    vv?.addEventListener('resize', sync);
    vv?.addEventListener('scroll', sync);
    window.addEventListener('resize', sync);
    return () => {
      vv?.removeEventListener('resize', sync);
      vv?.removeEventListener('scroll', sync);
      window.removeEventListener('resize', sync);
      root.style.removeProperty('--vv-top');
      root.style.removeProperty('--vv-height');
      root.style.removeProperty('--chat-bottom');
    };
  }, []);

  const startVoice = () => {
    if (speech.recording) return;
    speech.start({
      onInterim: () => {},
      onFinal: (spoken) => {
        setInputText(prev => (prev ? `${prev} ${spoken}` : spoken));
      },
      onEnd: () => {}
    });
  };

  const stopVoice = () => {
    speech.stop();
  };

  const handleImageFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setUploadingImage(true);
    onShowToast('Загрузка скриншота на сервер...');
    try {
      const item = await uploadImageToServer(file, 'Чат: ' + file.name);
      setAttachedImage(item.url);
      onShowToast('Скриншот прикреплен к сообщению');
    } catch {
      const reader = new FileReader();
      reader.onload = (evt) => {
        if (evt.target?.result) {
          setAttachedImage(evt.target.result as string);
          onShowToast('Картинка прикреплена');
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSend = () => {
    const clean = inputText.trim();
    if (!clean && !attachedImage) return;

    const timeStr = 'Сегодня, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newMsg: TeamMessage = {
      id: 'msg-' + Date.now(),
      author: currentAuthor.name,
      text: clean || (attachedImage ? '📷 Прикреплено изображение' : ''),
      time: timeStr,
      tag: selectedTag,
      image: attachedImage || undefined
    };

    onSendMessage(newMsg);
    setInputText('');
    setAttachedImage(null);
    setTimeout(() => scrollToBottom('smooth'), 50);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCreateTaskFromMessage = (msg: TeamMessage) => {
    const category: TaskCategory = msg.tag === 'код' ? 'code' : msg.tag === 'арт' ? 'art' : 'design';
    onCreateTask(msg.text.slice(0, 80), category);
    onShowToast('Создана задача в Канбане из сообщения!');
  };

  const filteredMessages = filterTag === 'all'
    ? messages
    : messages.filter(m => m.tag === filterTag);

  // We reverse to show oldest first in classic chat style or keep chronologic
  // If stored newest-first, we reverse for bottom-to-top chat stream
  const chronologicMessages = [...filteredMessages].reverse();

  return (
    <div className="view-content view-content--chat messenger-container">
      {/* Messenger App Window */}
      <div className="messenger-window">
        {/* Messenger Header Bar */}
        <div className="messenger-header">
          <div className="messenger-header-left">
            <div className="messenger-channel-avatar">
              🦆
            </div>
            <div>
              <div className="messenger-title-wrap">
                <span className="messenger-title">Cyber-Duck Hub Chat</span>
                <span className={`messenger-status-indicator ${serverSynced ? 'is-online' : 'is-offline'}`}>
                  {serverSynced ? '● Сервер онлайн' : '○ Локально'}
                </span>
              </div>
              <div className="messenger-subtitle">
                Вы: <b style={{ color: currentAuthor.avatar.includes('1') ? 'var(--accent-cyan)' : currentAuthor.avatar.includes('2') ? 'var(--accent-purple)' : 'var(--accent-amber)' }}>
                  {currentAuthor.name}
                </b> • 3 участника онлайн
              </div>
            </div>
          </div>

          <div className="messenger-header-right">
            {onRefreshFromServer && (
              <button
                type="button"
                className="btn btn-ghost"
                onClick={onRefreshFromServer}
                title="Синхронизировать сообщения с сервером"
                style={{ fontSize: '12px', padding: '5px 10px' }}
              >
                🔄 Обновить
              </button>
            )}
          </div>
        </div>

        {/* Filter chips bar */}
        <div className="messenger-filter-bar">
          <span
            className={`messenger-filter-status ${serverSynced ? 'is-online' : 'is-offline'}`}
            title={serverSynced ? 'Синхронизация с сервером активна' : 'Только локальные сообщения'}
          >
            {serverSynced ? '● Онлайн' : '○ Локально'}
          </span>
          <div className="messenger-filter-scroll">
            {FILTER_TAGS.map(t => (
              <button
                key={t.id}
                type="button"
                className={`msg-filter-chip ${filterTag === t.id ? 'active' : ''}`}
                onClick={() => setFilterTag(t.id)}
              >
                <span>{t.icon}</span> {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Messages Stream */}
        <div className="messenger-stream">
          {chronologicMessages.length === 0 ? (
            <div className="messenger-empty-state">
              <div style={{ fontSize: '36px', marginBottom: '8px' }}>💬</div>
              <div style={{ fontSize: '15px', color: '#fff', fontWeight: 700 }}>Здесь пока нет сообщений</div>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', maxWidth: '320px', margin: '4px auto 0' }}>
                Отправьте первый скриншот или текстовое сообщение коллегам. Все сообщения сохраняются на сервере.
              </p>
            </div>
          ) : (
            chronologicMessages.map(msg => {
              const isMe = msg.author === currentAuthor.name;
              const authorNum = msg.author.includes('1') ? '1' : msg.author.includes('2') ? '2' : '3';
              const authorColor = authorNum === '1' ? 'var(--accent-cyan)' : authorNum === '2' ? 'var(--accent-purple)' : 'var(--accent-amber)';
              const tagMeta = msg.tag ? TAG_CONFIG[msg.tag] : null;

              return (
                <div key={msg.id} className={`msg-bubble-wrap ${isMe ? 'msg-bubble-me' : 'msg-bubble-other'}`}>
                  {!isMe && (
                    <div className="msg-avatar-dot" style={{ borderColor: authorColor, color: authorColor }}>
                      {authorNum}
                    </div>
                  )}

                  <div className="msg-bubble">
                    {/* Header inside bubble */}
                    <div className="msg-bubble-header">
                      <span className="msg-author-name" style={{ color: authorColor }}>
                        {msg.author}
                      </span>
                      {tagMeta && (
                        <span className="msg-category-pill" style={{ borderColor: tagMeta.color, color: tagMeta.color }}>
                          {tagMeta.icon} {tagMeta.label}
                        </span>
                      )}
                    </div>

                    {/* Text content */}
                    {msg.text && (
                      <div className="msg-text-content">{msg.text}</div>
                    )}

                    {/* Attached Image preview */}
                    {msg.image && (
                      <div className="msg-image-attachment" onClick={() => onOpenLightbox(msg.image!)}>
                        <img src={msg.image} alt="Скриншот" loading="lazy" />
                        <div className="msg-img-overlay">
                          <span>🔍 Нажмите для зума</span>
                        </div>
                      </div>
                    )}

                    {/* Bubble Footer & Actions */}
                    <div className="msg-bubble-footer">
                      <div className="msg-actions-row">
                        <button
                          type="button"
                          className="msg-action-chip"
                          onClick={() => handleCreateTaskFromMessage(msg)}
                          title="Создать задачу в Канбане из этого сообщения"
                        >
                          + В Канбан
                        </button>
                        <button
                          type="button"
                          className="msg-delete-chip"
                          onClick={() => onDeleteMessage(msg.id)}
                          title="Удалить сообщение"
                        >
                          ✕
                        </button>
                      </div>

                      <span className="msg-timestamp">{msg.time}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Image upload preview */}
        {attachedImage && (
          <div className="msg-image-preview-dock">
            <div className="msg-preview-thumb-wrap">
              <img src={attachedImage} alt="Превью" />
              <button
                type="button"
                className="msg-preview-remove"
                onClick={() => setAttachedImage(null)}
                title="Убрать вложение"
              >
                ✕
              </button>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--accent-cyan)' }}>
              Скриншот готов к отправке на сервер
            </div>
          </div>
        )}

        {/* Bottom Input Area */}
        <div className="messenger-composer">
          {/* Tag Selector bar */}
          <div className="composer-tag-select">
            <span className="composer-tag-label">Тег</span>
            {(['обсуждение', 'код', 'арт', 'баг', 'сборка'] as TeamMessageTag[]).map(t => (
              <button
                key={t}
                type="button"
                className={`composer-tag-btn ${selectedTag === t ? 'active' : ''}`}
                onClick={() => setSelectedTag(t)}
              >
                {TAG_CONFIG[t].icon} {TAG_CONFIG[t].label}
              </button>
            ))}
          </div>

          <div className="composer-input-row">
            <button
              type="button"
              className="composer-tool-btn"
              onClick={() => fileInputRef.current?.click()}
              title="Прикрепить скриншот или арт"
              disabled={uploadingImage}
            >
              {uploadingImage ? '⏳' : '📷'}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleImageFile}
            />

            <div className="composer-mic-slot">
              <MicButton
                recording={speech.recording}
                onStart={startVoice}
                onStop={stopVoice}
                title="Голосовой ввод сообщения"
              />
            </div>

            <textarea
              className="composer-textarea"
              placeholder="Сообщение…"
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
            />

            <button
              type="button"
              className="composer-send-btn"
              onClick={handleSend}
              disabled={!inputText.trim() && !attachedImage}
              title="Отправить"
            >
              ➤
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
