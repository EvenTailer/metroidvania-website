import React, { useState } from 'react';
import {
  AssetChecklistItem,
  AssetItem,
  AssetPriority,
  AssetStage,
  AssetType,
  buildTargetPath,
  isPlaceholderPath,
  STAGE_META,
  STAGE_SEQUENCE,
  TYPE_META
} from '../../entities/asset-pipeline';
import { GalleryItem } from '../../entities/gallery';
import { AssetChecklistEditor } from './AssetChecklistEditor';
import { AssetPreviewField } from './AssetPreviewField';
import { AssetTypePicker } from './AssetTypePicker';

interface AssetEditModalProps {
  asset: AssetItem | null;
  authorName: string;
  onSave: (asset: AssetItem) => void;
  onClose: () => void;
  onError: (msg: string) => void;
  onGalleryItem: (item: GalleryItem) => void;
}

const DEFAULT_CHECKLIST_BY_TYPE: Record<AssetType, string[]> = {
  tileset: [
    'Эскиз модульной сетки 16x16',
    'Отрисовка базовых тайлов и вариаций',
    'Нарезка в атлас без смещения пикселей',
    'Импорт в Godot: Texture Filter = Nearest',
    'Настройка TileSet Physics Layer и коллизий'
  ],
  character: [
    'Концепт силуэта и ключевых поз',
    'Отрисовка спрайтов в единой палитре',
    'Сборка спрайтшита с центрированным pivot',
    'Импорт в Godot: Nearest filter, Pixel Snap',
    'Подключение к AnimatedSprite2D и CharacterBody2D'
  ],
  ui: [
    'Векторный или пиксельный эскиз',
    'Отрисовка 9-patch состояний (Normal, Pressed, Hover)',
    'Нарезка в атлас интерфейса',
    'Настройка TextureProgressBar / NinePatchRect в Godot',
    'Привязка к сигналам UI-скриптов'
  ],
  sfx: [
    'Референс звука и спектральный профиль',
    'Синтез или полевая запись эффекта',
    'Срез тишины в начале (0ms latency)',
    'Импорт WAV (16-bit 44.1kHz) и Audio Bus: SFX',
    'Тест воспроизведения из AnimationPlayer / GDScript'
  ],
  music: [
    'Мудборд, гармония и темп (BPM)',
    'Аранжировка синтов и инструментов',
    'Бесшовный рендеринг зацикленного фрагмента (Loop)',
    'Экспорт в Ogg Vorbis и импорт с Loop = On',
    'Интеграция с локацией через MusicManager / Area2D'
  ]
};

export const AssetEditModal: React.FC<AssetEditModalProps> = ({
  asset,
  authorName,
  onSave,
  onClose,
  onError,
  onGalleryItem
}) => {
  const isEditing = Boolean(asset);
  const [assetId] = useState(asset?.id || `asset-${Date.now()}`);

  const [title, setTitle] = useState(asset?.title || '');
  const [type, setType] = useState<AssetType>(asset?.type || 'tileset');
  const [stage, setStage] = useState<AssetStage>(asset?.stage || 'concept');
  const [priority, setPriority] = useState<AssetPriority>(asset?.priority || 'normal');
  const [author, setAuthor] = useState(asset?.author || authorName);
  const [description, setDescription] = useState(asset?.description || '');
  const [pathTouched, setPathTouched] = useState(
    () => Boolean(asset?.targetPath && !isPlaceholderPath(asset.targetPath))
  );
  const [targetPath, setTargetPath] = useState(
    asset?.targetPath || buildTargetPath('tileset', asset?.title || 'asset')
  );
  const [dimensions, setDimensions] = useState(asset?.dimensions || '16x16 px');
  const [format, setFormat] = useState(asset?.format || '.png');
  const [tagsInput, setTagsInput] = useState(asset?.tags?.join(', ') || '');
  const [godotTips, setGodotTips] = useState(
    asset?.godotTips || 'Texture Filter: Nearest, Pixel Snap: On'
  );
  const [previewUrl, setPreviewUrl] = useState(asset?.previewUrl);
  const [checklist, setChecklist] = useState<AssetChecklistItem[]>(
    asset?.checklist ||
      DEFAULT_CHECKLIST_BY_TYPE.tileset.map((t, i) => ({
        id: `c-${i + 1}`,
        title: t,
        completed: false
      }))
  );
  const [newCheckText, setNewCheckText] = useState('');

  const applyGeneratedPath = (nextType: AssetType, nextTitle: string) => {
    if (pathTouched && !isPlaceholderPath(targetPath)) return;
    const meta = TYPE_META[nextType];
    setTargetPath(buildTargetPath(nextType, nextTitle || 'asset'));
    setFormat(meta.defaultFormat);
  };

  const handleTypeChange = (nextType: AssetType) => {
    setType(nextType);
    applyGeneratedPath(nextType, title);
  };

  const handleTitleChange = (nextTitle: string) => {
    setTitle(nextTitle);
    applyGeneratedPath(type, nextTitle);
  };

  const handleApplyDefaultChecklist = () => {
    const defaults = DEFAULT_CHECKLIST_BY_TYPE[type] || [];
    setChecklist(
      defaults.map((t, i) => ({
        id: `c-${Date.now()}-${i}`,
        title: t,
        completed: false
      }))
    );
  };

  const handleAddCheckItem = () => {
    if (!newCheckText.trim()) return;
    setChecklist([
      ...checklist,
      {
        id: `c-${Date.now()}`,
        title: newCheckText.trim(),
        completed: false
      }
    ]);
    setNewCheckText('');
  };

  const handleRemoveCheckItem = (id: string) => {
    setChecklist(checklist.filter(c => c.id !== id));
  };

  const handleToggleCheckItem = (id: string) => {
    setChecklist(
      checklist.map(c => (c.id === id ? { ...c, completed: !c.completed } : c))
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      onError('Введите название ассета');
      return;
    }
    if (!targetPath.trim() || !targetPath.startsWith('res://')) {
      onError('Путь должен начинаться с res://');
      return;
    }

    const tags = tagsInput
      .split(',')
      .map(t => t.trim().replace(/^#/, ''))
      .filter(Boolean);

    const result: AssetItem = {
      id: assetId,
      title: title.trim(),
      type,
      stage,
      priority,
      author: author.trim() || authorName,
      description: description.trim(),
      targetPath: targetPath.trim(),
      dimensions: dimensions.trim() || undefined,
      format: format.trim() || undefined,
      tags,
      godotTips: godotTips.trim(),
      previewUrl,
      checklist,
      createdAt: asset?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onSave(result);
  };

  return (
    <div
      className="modal-backdrop"
      onClick={onClose}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0, 0, 0, 0.75)',
        zIndex: 1000
      }}
    >
      <div
        className="modal"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '680px',
          width: '94%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          background: 'rgba(15, 22, 38, 0.98)',
          border: '1px solid rgba(0, 242, 254, 0.3)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.8), 0 0 24px rgba(0, 242, 254, 0.15)',
          borderRadius: '12px',
          overflow: 'hidden'
        }}
      >
        <div className="modal-header" style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '20px' }}>{TYPE_META[type].icon}</span>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#fff' }}>
              {isEditing ? `Редактирование: ${asset?.title}` : 'Новый игровой ассет'}
            </h3>
          </div>
          <button
            type="button"
            className="icon-btn"
            onClick={onClose}
            style={{ fontSize: '18px', color: 'var(--text-dim)' }}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
          <div style={{ padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Тип ассета */}
            <AssetTypePicker type={type} onChange={handleTypeChange} />

            {/* Название */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '5px' }}>
                Название ассета <span style={{ color: 'var(--accent-rose)' }}>*</span>
              </label>
              <input
                type="text"
                className="field"
                placeholder="например: Спрайтшит Кибер-Утки или Звук Рывка"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                required
                style={{ width: '100%', fontSize: '13px' }}
              />
            </div>

            {/* Ряд: Этап, Приоритет, Автор */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '10px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11.5px', color: 'var(--text-muted)', marginBottom: '5px' }}>
                  Текущий этап:
                </label>
                <select
                  className="field"
                  value={stage}
                  onChange={(e) => setStage(e.target.value as AssetStage)}
                  style={{ width: '100%', fontSize: '12px' }}
                >
                  {STAGE_SEQUENCE.map(s => (
                    <option key={s} value={s}>
                      {STAGE_META[s].stepNumber}. {STAGE_META[s].ruTitle}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11.5px', color: 'var(--text-muted)', marginBottom: '5px' }}>
                  Приоритет:
                </label>
                <select
                  className="field"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as AssetPriority)}
                  style={{ width: '100%', fontSize: '12px' }}
                >
                  <option value="high">🔥 Высокий (блокер игры)</option>
                  <option value="normal">🔹 Обычный (в плане)</option>
                  <option value="low">💤 Низкий (полировка)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11.5px', color: 'var(--text-muted)', marginBottom: '5px' }}>
                  Ответственный автор:
                </label>
                <input
                  type="text"
                  className="field"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="Cleaf / Ilya"
                  style={{ width: '100%', fontSize: '12px' }}
                />
              </div>
            </div>

            {/* Путь в Godot (res://) */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '5px' }}>
                <label style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                  Путь в проекте Godot (res://) <span style={{ color: 'var(--accent-rose)' }}>*</span>
                </label>
                <span style={{ fontSize: '10.5px', color: 'var(--accent-cyan)' }}>
                  Пример: res://assets/sprites/hero/duck.png
                </span>
              </div>
              <input
                type="text"
                className="field"
                value={targetPath}
                onChange={(e) => {
                  setPathTouched(true);
                  setTargetPath(e.target.value);
                }}
                required
                style={{ width: '100%', fontFamily: 'monospace', fontSize: '12px' }}
              />
            </div>

            {/* Ряд: Размеры и Формат */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11.5px', color: 'var(--text-muted)', marginBottom: '5px' }}>
                  Разрешение / Габариты:
                </label>
                <input
                  type="text"
                  className="field"
                  value={dimensions}
                  onChange={(e) => setDimensions(e.target.value)}
                  placeholder="16x16 px / 32x32 / 2 мин"
                  style={{ width: '100%', fontSize: '12px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11.5px', color: 'var(--text-muted)', marginBottom: '5px' }}>
                  Формат файла:
                </label>
                <input
                  type="text"
                  className="field"
                  value={format}
                  onChange={(e) => setFormat(e.target.value)}
                  placeholder=".png / .wav / .ogg"
                  style={{ width: '100%', fontSize: '12px' }}
                />
              </div>
            </div>

            {/* Описание */}
            <div>
              <label style={{ display: 'block', fontSize: '11.5px', color: 'var(--text-muted)', marginBottom: '5px' }}>
                Описание и требования к ассету:
              </label>
              <textarea
                className="field"
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Что за ассет, в какой зоне игры используется, особые пожелания к арту или звуку..."
                style={{ width: '100%', fontSize: '12px', resize: 'vertical' }}
              />
            </div>

            {/* Подсказка для Godot 4 */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '5px' }}>
                <label style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                  Настройки импорта Godot 4:
                </label>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button
                    type="button"
                    className="btn btn-ghost"
                    style={{ fontSize: '10px', padding: '1px 6px' }}
                    onClick={() => setGodotTips('Texture Filter: Nearest, Pixel Snap: On, 2D')}
                  >
                    + Pixel Snap
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost"
                    style={{ fontSize: '10px', padding: '1px 6px' }}
                    onClick={() => setGodotTips('Audio Bus: SFX, WAV 16-bit 44.1kHz')}
                  >
                    + SFX Bus
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost"
                    style={{ fontSize: '10px', padding: '1px 6px' }}
                    onClick={() => setGodotTips('Ogg Vorbis, Loop = On, Audio Bus: Music')}
                  >
                    + Music Loop
                  </button>
                </div>
              </div>
              <input
                type="text"
                className="field"
                value={godotTips}
                onChange={(e) => setGodotTips(e.target.value)}
                placeholder="например: Texture Filter = Nearest, Pixel Snap = On"
                style={{ width: '100%', fontSize: '12px' }}
              />
            </div>

            {/* Чек-лист шагов */}
            <AssetPreviewField
              assetId={assetId}
              previewUrl={previewUrl}
              onChange={setPreviewUrl}
              onGalleryItem={onGalleryItem}
              onError={onError}
            />

            <AssetChecklistEditor
              checklist={checklist}
              newCheckText={newCheckText}
              onNewCheckText={setNewCheckText}
              onApplyDefault={handleApplyDefaultChecklist}
              onToggle={handleToggleCheckItem}
              onRemove={handleRemoveCheckItem}
              onAdd={handleAddCheckItem}
            />

            {/* Теги */}
            <div>
              <label style={{ display: 'block', fontSize: '11.5px', color: 'var(--text-muted)', marginBottom: '5px' }}>
                Теги (через запятую):
              </label>
              <input
                type="text"
                className="field"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="герой, анимация, прыжок, 16x16"
                style={{ width: '100%', fontSize: '12px' }}
              />
            </div>
          </div>

          <div
            className="modal-footer"
            style={{
              padding: '14px 20px',
              borderTop: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '10px'
            }}
          >
            <button type="button" className="btn btn-secondary" onClick={onClose} style={{ fontSize: '12.5px' }}>
              Отмена
            </button>
            <button type="submit" className="btn btn-primary" style={{ fontSize: '12.5px', fontWeight: 700 }}>
              {isEditing ? 'Сохранить изменения' : 'Создать ассет'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
