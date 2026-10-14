import React, { useState } from 'react';
import { TaskCategory, TaskStatus } from '../../entities/task';
import { MicButton } from '../../shared/ui/MicButton';
import { useSpeechInput } from '../../shared/lib/useSpeechInput';

const CATEGORIES: { id: TaskCategory; label: string }[] = [
  { id: 'code', label: 'Код' },
  { id: 'art', label: 'Арт' },
  { id: 'design', label: 'Дизайн' },
  { id: 'audio', label: 'Звук' }
];

const STATUSES: { id: TaskStatus; label: string }[] = [
  { id: 'backlog', label: 'План' },
  { id: 'in-progress', label: 'В работе' },
  { id: 'test', label: 'Тест' },
  { id: 'done', label: 'Готово' }
];

export interface TaskDraft {
  title: string;
  description: string;
  category: TaskCategory;
  status: TaskStatus;
  file: File | null;
}

interface TaskSheetProps {
  initialStatus?: TaskStatus;
  onClose: () => void;
  onCreate: (draft: TaskDraft) => void;
  onShowToast: (msg: string) => void;
}

export const TaskSheet: React.FC<TaskSheetProps> = ({ initialStatus = 'backlog', onClose, onCreate, onShowToast }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<TaskCategory>('code');
  const [status, setStatus] = useState<TaskStatus>(initialStatus);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState('');
  const [interim, setInterim] = useState('');
  const speech = useSpeechInput(onShowToast);

  const startVoice = () => {
    if (speech.recording) return;
    speech.start({
      onInterim: setInterim,
      onFinal: (spoken) => {
        setInterim('');
        setDescription((prev) => (prev ? `${prev} ${spoken}` : spoken));
      },
      onEnd: () => setInterim('')
    });
  };

  const handleFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const next = event.target.files?.[0] || null;
    event.target.value = '';
    if (preview) URL.revokeObjectURL(preview);
    setFile(next);
    setPreview(next ? URL.createObjectURL(next) : '');
  };

  const handleSubmit = () => {
    const clean = title.trim();
    if (!clean) {
      onShowToast('Введите название задачи');
      return;
    }
    onCreate({ title: clean, description: description.trim(), category, status, file });
    if (preview) URL.revokeObjectURL(preview);
    onClose();
  };

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div
        className="sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="task-sheet-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="sheet-handle" aria-hidden="true" />
        <h3 id="task-sheet-title" className="composer-title">Новая задача</h3>
        <label className="field-label" htmlFor="task-title">Название</label>
        <input
          id="task-title"
          className="field"
          value={title}
          placeholder="Что сделать"
          onChange={(event) => setTitle(event.target.value)}
          onKeyDown={(event) => { if (event.key === 'Enter') handleSubmit(); }}
        />
        <label className="field-label" htmlFor="task-desc">Описание</label>
        <textarea
          id="task-desc"
          className="field"
          rows={4}
          value={description}
          placeholder="Подробности, критерии, ссылки"
          onChange={(event) => setDescription(event.target.value)}
        />
        {interim && <p className="live-line" aria-live="polite">{interim}</p>}
        <div className="note-tag-row" role="group" aria-label="Категория">
          {CATEGORIES.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`chip-btn ${category === item.id ? 'active' : ''}`}
              onClick={() => setCategory(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div className="note-tag-row" role="group" aria-label="Колонка">
          {STATUSES.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`chip-btn ${status === item.id ? 'active' : ''}`}
              onClick={() => setStatus(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
        <label className="card-photo-btn" style={{ marginTop: '8px' }}>
          {file ? 'Заменить фото' : 'Добавить фото'}
          <input type="file" accept="image/*" hidden onChange={handleFile} />
        </label>
        {preview && (
          <img src={preview} alt="Предпросмотр" className="card-img-preview" style={{ height: '140px', marginTop: '8px' }} />
        )}
        <div className="note-actions">
          <MicButton recording={speech.recording} onStart={startVoice} onStop={speech.stop} />
          <button type="button" className="btn btn-primary note-save" onClick={handleSubmit}>
            Создать
          </button>
        </div>
        <button type="button" className="btn btn-secondary sheet-cancel" onClick={onClose}>
          Отмена
        </button>
      </div>
    </div>
  );
};
