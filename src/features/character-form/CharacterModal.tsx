import React, { useRef, useState } from 'react';
import { CharacterItem } from '../../entities/character';
import { uploadImageToServer } from '../../entities/gallery';
import { ConfirmModal } from '../../shared/ui/ConfirmModal';

interface CharacterModalProps {
  character?: CharacterItem | null;
  onSave: (char: CharacterItem) => void;
  onDelete?: (id: string) => void;
  onClose: () => void;
  onShowToast: (msg: string) => void;
}

const ROLE_PRESETS = [
  { label: 'Главный герой', value: 'Главный герой', icon: '🦆' },
  { label: 'Друг героя', value: 'Друг главного героя', icon: '🤝' },
  { label: 'Любовь героя', value: 'Любовь главного героя', icon: '❤️' },
  { label: 'Босс', value: 'Босс', icon: '👾' },
  { label: 'NPC / Союзник', value: 'NPC / Союзник', icon: '🛠️' },
  { label: 'Враг', value: 'Враг', icon: '⚔️' },
  { label: 'Наставник', value: 'Наставник', icon: '🎓' }
];

export const getCharacterRoleIcon = (roleStr: string) => {
  const r = (roleStr || '').toLowerCase();
  if (r.includes('герой') || r.includes('протагонист')) return '🦆';
  if (r.includes('люб') || r.includes('девушк') || r.includes('парен')) return '❤️';
  if (r.includes('друг') || r.includes('союзник') || r.includes('напарник')) return '🤝';
  if (r.includes('босс')) return '👾';
  if (r.includes('враг') || r.includes('противник')) return '⚔️';
  if (r.includes('наставник') || r.includes('ментор')) return '🎓';
  if (r.includes('npc') || r.includes('торговец') || r.includes('мастер')) return '🛠️';
  return '👤';
};

export const CharacterModal: React.FC<CharacterModalProps> = ({
  character,
  onSave,
  onDelete,
  onClose,
  onShowToast
}) => {
  const isEditing = Boolean(character);
  const [name, setName] = useState(character?.name || '');
  const [role, setRole] = useState<string>(character?.role || 'Главный герой');
  const [tag, setTag] = useState(character?.tag || '');
  const [imageUrl, setImageUrl] = useState(character?.imageUrl || '/assets/duck_hero.png');
  const [lore, setLore] = useState(character?.lore || '');
  const [skillsText, setSkillsText] = useState(character?.skills?.join(', ') || '');
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragDepth = useRef(0);

  const uploadFile = async (file: File) => {
    const looksLikeImage = file.type.startsWith('image/') || /\.(png|jpe?g|gif|webp)$/i.test(file.name);
    if (!looksLikeImage) {
      onShowToast('Нужна картинка: PNG, JPG, GIF или WebP');
      return;
    }
    setUploading(true);
    try {
      const item = await uploadImageToServer(file, name.trim() || 'Персонаж');
      setImageUrl(item.url);
      onShowToast('Картинка загружена на сервер!');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Ошибка загрузки';
      onShowToast(msg);
    } finally {
      setUploading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (file) uploadFile(file);
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragDepth.current += 1;
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragDepth.current -= 1;
    if (dragDepth.current <= 0) {
      dragDepth.current = 0;
      setDragOver(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragDepth.current = 0;
    setDragOver(false);
    if (uploading) return;
    const file = e.dataTransfer.files?.[0];
    if (file) uploadFile(file);
  };

  const handleSave = () => {
    const cleanName = name.trim();
    if (!cleanName) {
      onShowToast('Введите имя персонажа');
      return;
    }

    const cleanRole = role.trim() || 'Персонаж';

    const skills = skillsText
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    const item: CharacterItem = {
      id: character?.id || 'char-' + Date.now(),
      name: cleanName,
      role: cleanRole,
      tag: tag.trim() || cleanRole,
      imageUrl: imageUrl.trim() || '/assets/duck_hero.png',
      lore: lore.trim(),
      skills: skills.length > 0 ? skills : ['Базовые движения']
    };

    onSave(item);
    onShowToast(isEditing ? 'Персонаж обновлён' : 'Персонаж добавлен!');
    onClose();
  };

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div
        className="sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="char-modal-title"
        style={{ maxWidth: '540px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sheet-handle" aria-hidden="true" />
        <h3 id="char-modal-title" className="composer-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>{getCharacterRoleIcon(role)}</span>
          {isEditing ? 'Редактировать персонажа' : 'Добавить персонажа / героя'}
        </h3>

        {/* Role Select & Custom input */}
        <div style={{ marginBottom: '14px' }}>
          <label className="field-label" htmlFor="char-role-input">
            Роль / Кто этот персонаж (выберите или напишите свой вариант)
          </label>
          <div className="note-tag-row" style={{ marginBottom: '8px', flexWrap: 'wrap', gap: '6px' }}>
            {ROLE_PRESETS.map((p) => {
              const isActive = role.trim().toLowerCase() === p.value.toLowerCase();
              return (
                <button
                  key={p.value}
                  type="button"
                  className={`chip-btn ${isActive ? 'active' : ''}`}
                  onClick={() => setRole(p.value)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                >
                  <span>{p.icon}</span>
                  <span>{p.label}</span>
                </button>
              );
            })}
          </div>

          <input
            id="char-role-input"
            className="field"
            value={role}
            placeholder="Например: Друг главного героя, Любовь героя, Наставник, Торговец..."
            onChange={(e) => setRole(e.target.value)}
          />
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
            💡 Вы можете написать абсолютно любую роль (друг, возлюбленная, босс, торговец имплантами и т.д.).
          </div>
        </div>

        {/* Name input */}
        <div style={{ marginBottom: '12px' }}>
          <label className="field-label" htmlFor="char-name">Имя / Позывной</label>
          <input
            id="char-name"
            className="field"
            value={name}
            placeholder="Например: Агент-09, Генерал Клюв, Кибер-Жаба"
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        {/* Subtitle Tag */}
        <div style={{ marginBottom: '12px' }}>
          <label className="field-label" htmlFor="char-tag">Фракция / Подзаголовок</label>
          <input
            id="char-tag"
            className="field"
            value={tag}
            placeholder="Например: Босс Сектора 1, Хакер подполья, Охрана корпорации"
            onChange={(e) => setTag(e.target.value)}
          />
        </div>

        {/* Image & Upload */}
        <div style={{ marginBottom: '14px' }}>
          <label className="field-label">Изображение / Спрайт</label>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <input
              className="field"
              value={imageUrl}
              placeholder="Ссылка на изображение (/assets/..., URL)"
              style={{ flex: 1 }}
              onChange={(e) => setImageUrl(e.target.value)}
            />
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={handleFileUpload}
            />
            <button
              type="button"
              className="btn btn-secondary"
              disabled={uploading}
              style={{ minHeight: '44px', whiteSpace: 'nowrap' }}
              onClick={() => fileInputRef.current?.click()}
            >
              {uploading ? '⏳ Загрузка...' : '📁 Загрузить файл'}
            </button>
          </div>
          <div
            className={`char-image-drop ${dragOver ? 'char-image-drop--active' : ''}`}
            onDragEnter={handleDragEnter}
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {imageUrl && (
              <img src={imageUrl} alt="Предпросмотр" />
            )}
            <div className="char-image-drop-hint">
              {uploading ? 'Загрузка...' : 'Перетащите картинку сюда'}
            </div>
          </div>
        </div>

        {/* Lore / Bio */}
        <div style={{ marginBottom: '12px' }}>
          <label className="field-label" htmlFor="char-lore">Лор, предыстория и паттерны поведения</label>
          <textarea
            id="char-lore"
            className="field"
            rows={3}
            value={lore}
            placeholder="Опишите характер, предысторию, роль в сюжете или механику поведения..."
            onChange={(e) => setLore(e.target.value)}
          />
        </div>

        {/* Skills / Abilities */}
        <div style={{ marginBottom: '16px' }}>
          <label className="field-label" htmlFor="char-skills">
            Способности / Скиллы (через запятую)
          </label>
          <input
            id="char-skills"
            className="field"
            value={skillsText}
            placeholder="🦾 Парирование пуль, 👁 Спектральный глаз, ⚡ Электро-рывок"
            onChange={(e) => setSkillsText(e.target.value)}
          />
        </div>

        {/* Actions */}
        <div className="note-actions" style={{ gap: '10px' }}>
          {isEditing && character && onDelete && (
            <button
              type="button"
              className="btn btn-secondary"
              style={{ color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.4)' }}
              onClick={() => setIsDeleteConfirmOpen(true)}
            >
              Удалить
            </button>
          )}
          <button type="button" className="btn btn-secondary" onClick={onClose} style={{ flex: 1 }}>
            Отмена
          </button>
          <button type="button" className="btn btn-primary" onClick={handleSave} style={{ flex: 1.4 }}>
            {isEditing ? 'Сохранить изменения' : 'Создать персонажа'}
          </button>
        </div>
      </div>

      {isEditing && character && onDelete && (
        <ConfirmModal
          isOpen={isDeleteConfirmOpen}
          title="Удаление персонажа"
          message={`Вы уверены, что хотите удалить карточку «${name}»?`}
          confirmText="Удалить"
          cancelText="Отмена"
          danger={true}
          onConfirm={() => {
            onDelete(character.id);
            onClose();
          }}
          onClose={() => setIsDeleteConfirmOpen(false)}
        />
      )}
    </div>
  );
};
