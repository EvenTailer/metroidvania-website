import React, { useRef, useState } from 'react';
import { MicButton } from '../../shared/ui/MicButton';
import { useSpeechInput } from '../../shared/lib/useSpeechInput';

const NOTE_TAGS = ['💡 Механика', '🎨 Арт', '🗺 Уровень', '👾 Босс', '🎵 Звук'];

interface NoteComposerProps {
  onAddNote: (tag: string, text: string) => void;
  onShowToast: (msg: string) => void;
  dock?: boolean;
}

export const NoteComposer: React.FC<NoteComposerProps> = ({ onAddNote, onShowToast, dock }) => {
  const [tag, setTag] = useState(NOTE_TAGS[0]);
  const [text, setText] = useState('');
  const [interim, setInterim] = useState('');
  const interimRef = useRef('');
  const speech = useSpeechInput(onShowToast);

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
      onShowToast('Сначала напишите или надиктуйте мысль');
      return;
    }
    onAddNote(tag, clean);
    setText('');
    onShowToast('Мысль записана в GDD');
  };

  return (
    <section className={`note-composer panel ${dock ? 'note-composer--dock' : ''}`}>
      <h4 className="composer-title">Записать мысль</h4>
      <p className="composer-hint">Надиктуйте мысль. Текст встанет в поле: поправьте его и нажмите «Сохранить текст».</p>
      <div className="note-tag-row" role="group" aria-label="Тип заметки">
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
      <label className="sr-only" htmlFor="note-text">Текст мысли</label>
      <textarea
        id="note-text"
        className="field"
        rows={3}
        placeholder="Например: звук парирования — металлический звон с эхом"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      {interim && <p className="live-line" aria-live="polite">{interim}</p>}
      <div className="note-actions">
        <MicButton recording={speech.recording} onStart={startVoice} onStop={stopVoice} />
        <button type="button" className="btn btn-primary note-save" onClick={handleSaveText}>
          Сохранить текст
        </button>
      </div>
    </section>
  );
};
