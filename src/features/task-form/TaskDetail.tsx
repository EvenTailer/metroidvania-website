import React, { useEffect, useState } from 'react';
import { Task, TaskCategory, TaskComment, TaskFile, TaskStatus } from '../../entities/task';

const CATEGORY_LABEL: Record<TaskCategory, string> = {
  code: 'Код',
  art: 'Арт',
  design: 'Дизайн',
  audio: 'Звук'
};

const STATUS_LABEL: Record<TaskStatus, string> = {
  backlog: 'План',
  'in-progress': 'В работе',
  test: 'Тест',
  done: 'Готово'
};

interface TaskDetailProps {
  task: Task;
  steps: { id: string; title: string }[];
  onClose: () => void;
  onAddComment: (text: string, file?: File) => void | Promise<void>;
  onUpdateComment: (commentId: string, text: string, file?: File) => void | Promise<void>;
  onRemoveComment: (commentId: string) => void;
  onOpenLightbox: (url: string) => void;
}

function clipboardImage(event: React.ClipboardEvent): File | null {
  const items = event.clipboardData?.items;
  if (!items) return null;
  for (const item of Array.from(items)) {
    if (item.type.startsWith('image/')) return item.getAsFile();
  }
  return null;
}

function takeFile(event: React.ChangeEvent<HTMLInputElement>): File | null {
  const file = event.target.files?.[0] || null;
  event.target.value = '';
  return file;
}

function isImageName(name: string): boolean {
  return /\.(png|jpe?g|gif|webp)$/i.test(name);
}

function PencilIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}

function ClipIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 17.99 8.8l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48" />
    </svg>
  );
}

function FileChip({ name, onClear }: { name: string; onClear?: () => void }) {
  return (
    <span className="task-file-chip">
      <ClipIcon />
      <span>{name}</span>
      {onClear && <button type="button" aria-label="Убрать файл" onClick={onClear}>×</button>}
    </span>
  );
}

function StoredFile({ file, onOpen }: { file: TaskFile; onOpen: (url: string) => void }) {
  if (isImageName(file.name)) {
    return (
      <button type="button" className="kanban-photo-open" onClick={() => onOpen(file.url)}>
        <img src={file.url} alt={file.name} className="task-shot-thumb" />
      </button>
    );
  }
  return (
    <a className="task-file-chip" href={file.url} target="_blank" rel="noreferrer">
      <ClipIcon />
      <span>{file.name}</span>
    </a>
  );
}

export const TaskDetail: React.FC<TaskDetailProps> = ({
  task,
  steps,
  onClose,
  onAddComment,
  onUpdateComment,
  onRemoveComment,
  onOpenLightbox
}) => {
  const [comment, setComment] = useState('');
  const [commentFile, setCommentFile] = useState<File | null>(null);
  const [commentPreview, setCommentPreview] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [editFile, setEditFile] = useState<File | null>(null);
  const [editPreview, setEditPreview] = useState('');
  const [busy, setBusy] = useState(false);
  const stepTitle = steps.find(step => step.id === task.stepId)?.title;
  const comments = task.comments || [];

  useEffect(() => {
    if (!commentFile || !commentFile.type.startsWith('image/')) {
      setCommentPreview('');
      return;
    }
    const url = URL.createObjectURL(commentFile);
    setCommentPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [commentFile]);

  useEffect(() => {
    if (!editFile || !editFile.type.startsWith('image/')) {
      setEditPreview('');
      return;
    }
    const url = URL.createObjectURL(editFile);
    setEditPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [editFile]);

  const sendComment = async () => {
    const text = comment.trim();
    if ((!text && !commentFile) || busy) return;
    setBusy(true);
    try {
      await onAddComment(text, commentFile || undefined);
      setComment('');
      setCommentFile(null);
    } finally {
      setBusy(false);
    }
  };

  const startEdit = (item: TaskComment) => {
    setEditingId(item.id);
    setEditText(item.text);
    setEditFile(null);
  };

  const saveEdit = async (item: TaskComment) => {
    const text = editText.trim();
    if ((!text && !item.image && !item.file && !editFile) || busy) return;
    setBusy(true);
    try {
      await onUpdateComment(item.id, text, editFile || undefined);
      setEditingId(null);
      setEditFile(null);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="sheet-backdrop task-view-backdrop" onClick={onClose}>
      <div
        className="task-view"
        role="dialog"
        aria-modal="true"
        aria-labelledby="task-detail-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="task-view-head">
          <div>
            <div className="task-view-badges">
              <span className={`task-status task-status-${task.status}`}>{STATUS_LABEL[task.status]}</span>
              <span className={`card-tag ${task.category}`}>{CATEGORY_LABEL[task.category]}</span>
            </div>
            <h3 id="task-detail-title" className="task-view-title">{task.title}</h3>
          </div>
          <button type="button" className="task-view-close" aria-label="Закрыть" onClick={onClose}>×</button>
        </header>

        <div className="task-view-body">
          <section className="task-view-main">
            <div className="task-view-scroll">
              <p className={`task-view-desc ${task.description?.trim() ? '' : 'is-empty'}`}>
                {task.description?.trim() || 'Описания пока нет.'}
              </p>

              {(task.image || task.file) && (
                <div className="task-shots">
                  {task.image && (
                    <button type="button" className="kanban-photo-open" onClick={() => onOpenLightbox(task.image!)}>
                      <img src={task.image} alt="Фото задачи" className="task-view-photo" />
                    </button>
                  )}
                  {task.file && <StoredFile file={task.file} onOpen={onOpenLightbox} />}
                </div>
              )}

              <div className="task-activity">
                <h4>Комментарии <span>{comments.length}</span></h4>
                {comments.map((item) => (
                  <article key={item.id} className="task-comment">
                    <div className="task-comment-avatar" aria-hidden="true">{item.author.replace(/\D/g, '') || item.author.slice(0, 1)}</div>
                    <div className="task-comment-body">
                      <div className="task-comment-meta">
                        <b>{item.author}</b>
                        <time dateTime={item.createdAt}>
                          {new Date(item.createdAt).toLocaleString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </time>
                        <button type="button" className="task-icon-btn" aria-label="Изменить комментарий" onClick={() => startEdit(item)}>
                          <PencilIcon />
                        </button>
                        <button type="button" className="task-icon-btn" aria-label="Удалить комментарий" onClick={() => onRemoveComment(item.id)}>×</button>
                      </div>
                      {editingId === item.id ? (
                        <form
                          className="task-comment-editor"
                          onSubmit={(event) => {
                            event.preventDefault();
                            void saveEdit(item);
                          }}
                        >
                          <textarea
                            value={editText}
                            rows={3}
                            aria-label="Текст комментария"
                            onChange={(event) => setEditText(event.target.value)}
                            onPaste={(event) => {
                              const file = clipboardImage(event);
                              if (!file) return;
                              event.preventDefault();
                              setEditFile(file);
                            }}
                          />
                          {editPreview && <img src={editPreview} alt="" className="task-shot-thumb" />}
                          {editFile && !editPreview && <FileChip name={editFile.name} onClear={() => setEditFile(null)} />}
                          {!editFile && item.image && (
                            <img src={item.image} alt="" className="task-shot-thumb" />
                          )}
                          {!editFile && item.file && <StoredFile file={item.file} onOpen={onOpenLightbox} />}
                          <div className="task-comment-editor-actions">
                            <label className="task-icon-btn" title="Файл или фото" aria-label="Прикрепить файл или фото">
                              <ClipIcon />
                              <input type="file" className="sr-only" onChange={(event) => {
                                const file = takeFile(event);
                                if (file) setEditFile(file);
                              }} />
                            </label>
                            <button type="button" className="task-text-btn" onClick={() => { setEditingId(null); setEditFile(null); }}>Отмена</button>
                            <button type="submit" className="btn btn-primary" disabled={busy || (!editText.trim() && !item.image && !item.file && !editFile)}>Сохранить</button>
                          </div>
                        </form>
                      ) : (
                        <>
                          {item.text && <p>{item.text}</p>}
                          {item.image && (
                            <button type="button" className="kanban-photo-open" onClick={() => onOpenLightbox(item.image!)}>
                              <img src={item.image} alt="Вложение" className="task-shot-thumb" />
                            </button>
                          )}
                          {item.file && <StoredFile file={item.file} onOpen={onOpenLightbox} />}
                        </>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <form
              className="task-composer"
              onSubmit={(event) => {
                event.preventDefault();
                void sendComment();
              }}
            >
              {commentPreview && (
                <div className="task-shot-row">
                  <img src={commentPreview} alt="" className="task-shot-thumb" />
                  <button type="button" className="task-icon-btn" aria-label="Убрать файл" onClick={() => setCommentFile(null)}>×</button>
                </div>
              )}
              {commentFile && !commentPreview && <FileChip name={commentFile.name} onClear={() => setCommentFile(null)} />}
              <div className="task-composer-row">
                <label className="sr-only" htmlFor="task-comment-input">Комментарий</label>
                <textarea
                  id="task-comment-input"
                  value={comment}
                  rows={2}
                  placeholder="Написать комментарий"
                  onChange={(event) => setComment(event.target.value)}
                  onPaste={(event) => {
                    const file = clipboardImage(event);
                    if (!file) return;
                    event.preventDefault();
                    setCommentFile(file);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
                      event.preventDefault();
                      void sendComment();
                    }
                  }}
                />
                <div className="task-composer-actions">
                  <label className="task-icon-btn task-icon-btn-lg" title="Файл или фото" aria-label="Прикрепить файл или фото">
                    <ClipIcon />
                    <input type="file" className="sr-only" onChange={(event) => {
                      const file = takeFile(event);
                      if (file) setCommentFile(file);
                    }} />
                  </label>
                  <button type="submit" className="btn btn-primary" disabled={busy || (!comment.trim() && !commentFile)}>Отправить</button>
                </div>
              </div>
            </form>
          </section>

          <aside className="task-view-rail">
            <h4>Детали</h4>
            <dl>
              <div>
                <dt>Статус</dt>
                <dd>{STATUS_LABEL[task.status]}</dd>
              </div>
              <div>
                <dt>Категория</dt>
                <dd>{CATEGORY_LABEL[task.category]}</dd>
              </div>
              <div>
                <dt>Автор</dt>
                <dd>{task.author}</dd>
              </div>
              <div>
                <dt>Шаг</dt>
                <dd>{stepTitle || 'Не привязан'}</dd>
              </div>
            </dl>
          </aside>
        </div>
      </div>
    </div>
  );
};
