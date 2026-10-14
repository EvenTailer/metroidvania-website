import React, { useEffect, useRef, useState } from 'react';
import { MicButton } from '../../shared/ui/MicButton';
import { useSpeechInput } from '../../shared/lib/useSpeechInput';

const NOTE_TAGS = ['💡 Механика', '🎨 Арт', '🗺 Уровень', '👾 Босс', '🎵 Звук', '📜 Сюжет'];

interface QuickNoteFabProps {
  onAddNote: (tag: string, text: string) => void;
  onShowToast: (msg: string) => void;
}

export const QuickNoteFab: React.FC<QuickNoteFabProps> = ({ onAddNote, onShowToast }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [tag, setTag] = useState(NOTE_TAGS[0]);
  const [text, setText] = useState('');
  const [interim, setInterim] = useState('');
  const interimRef = useRef('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const speech = useSpeechInput(onShowToast);

  // Auto-focus textarea when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => textareaRef.current?.focus(), 80);
    } else {
      if (speech.recording) {
        speech.stop();
      }
      setText('');
      setInterim('');
    }
  }, [isOpen]);

  // Global keyboard shortcut to open modal: Ctrl + M / Cmd + M
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 'm' || e.key === 'ь')) {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const startVoice = () => {
    if (speech.recording) return;
    speech.start({
      onInterim: (chunk) => {
        interimRef.current = chunk;
        setInterim(chunk);
      },
      onFinal: (spoken) => {
        interimRef.current = '';
        setInterim('');
        setText(prev => (prev ? `${prev} ${spoken}` : spoken));
      },
      onEnd: () => {
        const pending = interimRef.current.trim();
        if (pending) {
          setText(prev => (prev ? `${prev} ${pending}` : pending));
        }
        interimRef.current = '';
        setInterim('');
      }
    });
  };

  const stopVoice = () => {
    speech.stop();
  };

  const handleSaveText = () => {
    const clean = text.trim();
    if (!clean) {
      onShowToast('Введите текст или надиктуйте мысль');
      return;
    }
    onAddNote(tag, clean);
    setText('');
    onShowToast('Мысль сохранена в GDD!');
    setIsOpen(false);
  };

  const handleTextKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSaveText();
    }
  };

  return (
    <>
      {/* ALWAYS VISIBLE FLOATING BUTTON */}
      <button
        type="button"
        className="floating-thought-fab"
        onClick={() => setIsOpen(true)}
        aria-label="Записать мысль или идею"
        title="Записать мысль голосом или текстом (Ctrl+M)"
      >
        <span className="fab-pulse-dot" aria-hidden="true" />
        <span style={{ fontSize: '15px' }}>💡</span>
        <span>Записать мысль</span>
        <span className="fab-mic-tag">🎙️ / ✍️</span>
      </button>

      {/* QUICK NOTE MODAL DIALOG */}
      {isOpen && (
        <div className="sheet-backdrop" onClick={() => setIsOpen(false)}>
          <div
            className="sheet"
            role="dialog"
            aria-modal="true"
            aria-labelledby="quick-thought-title"
            style={{ maxWidth: '520px', background: '#080d1a', border: '1px solid var(--border-bright)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sheet-handle" aria-hidden="true" />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div>
                <h3 id="quick-thought-title" className="composer-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>💡</span>
                  <span>Быстрая мысль & GDD Заметка</span>
                </h3>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '4px 0 0' }}>
                  Диктуйте голосом или пишите — идея сразу зафиксируется в базе проекта.
                </p>
              </div>
              <button
                type="button"
                className="icon-btn"
                onClick={() => setIsOpen(false)}
                aria-label="Закрыть окно"
                style={{ width: '32px', height: '32px', fontSize: '14px' }}
              >
                ✕
              </button>
            </div>

            {/* Tag Selector */}
            <div className="note-tag-row" style={{ marginBottom: '12px', flexWrap: 'wrap', gap: '6px' }}>
              {NOTE_TAGS.map((item) => (
                <button
                  key={item}
                  type="button"
                  className={`chip-btn ${tag === item ? 'active' : ''}`}
                  onClick={() => setTag(item)}
                >
                  {item}
                </button>
              ))}
            </div>

            {/* Live speech interim banner */}
            {speech.recording && (
              <div
                style={{
                  background: 'rgba(239, 68, 68, 0.12)',
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  marginBottom: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}
              >
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444', display: 'inline-block', animation: 'pulseDot 1s infinite' }} />
                <span style={{ fontSize: '12px', color: '#fca5a5', fontWeight: 600 }}>
                  Идет запись... {interim ? `«${interim}»` : 'Говорите, текст появится в поле'}
                </span>
              </div>
            )}

            {/* Note text field */}
            <label className="sr-only" htmlFor="quick-note-textarea">Текст мысли</label>
            <textarea
              ref={textareaRef}
              id="quick-note-textarea"
              className="field"
              rows={4}
              placeholder="Например: звук парирования — металлический звон с эхом, заряжает шкалу ярости..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleTextKeyDown}
              style={{ resize: 'vertical', minHeight: '90px' }}
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', gap: '10px', flexWrap: 'wrap' }}>
              <MicButton recording={speech.recording} onStart={startVoice} onStop={stopVoice} />

              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-dim)' }} className="topbar-copy-label">
                  Ctrl+Enter
                </span>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleSaveText}
                  style={{ minWidth: '130px' }}
                >
                  💾 Сохранить мысль
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
