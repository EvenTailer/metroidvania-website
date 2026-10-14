import React, { useState } from 'react';
import {
  ArtifactPlatform,
  BuildArtifact,
  BuildRelease,
  BuildStage,
  BuildStatus,
  ChangelogEntry
} from '../../entities/engine-bridge';
import { BuildRelationFields } from './BuildRelationFields';

interface RelationItem {
  id: string;
  title: string;
}

interface BuildEditModalProps {
  initialBuild: BuildRelease | null;
  tasks: RelationItem[];
  bugs: RelationItem[];
  onSave: (build: BuildRelease) => void;
  onClose: () => void;
}

export const BuildEditModal: React.FC<BuildEditModalProps> = ({
  initialBuild,
  tasks,
  bugs,
  onSave,
  onClose
}) => {
  const isEditing = Boolean(initialBuild);

  const [version, setVersion] = useState(initialBuild?.version || '');
  const [title, setTitle] = useState(initialBuild?.title || '');
  const [stage, setStage] = useState<BuildStage>(initialBuild?.stage || 'alpha');
  const [status, setStatus] = useState<BuildStatus>(initialBuild?.status || 'testing');
  const [targetEngineVersion, setTargetEngineVersion] = useState(initialBuild?.targetEngineVersion || 'Godot 4.3-stable');
  const [releaseDate, setReleaseDate] = useState(initialBuild?.releaseDate || new Date().toISOString().slice(0, 10));
  const [description, setDescription] = useState(initialBuild?.description || '');
  const [isLatestRelease, setIsLatestRelease] = useState(initialBuild?.isLatestRelease ?? false);
  const [testedHours, setTestedHours] = useState(initialBuild?.testedHours || 0);
  const [linkedTaskIds, setLinkedTaskIds] = useState<string[]>(initialBuild?.linkedTaskIds || []);
  const [linkedBugIds, setLinkedBugIds] = useState<string[]>(initialBuild?.linkedBugIds || []);

  const [changelog, setChangelog] = useState<ChangelogEntry[]>(initialBuild?.changelog || []);
  const [newChangeType, setNewChangeType] = useState<ChangelogEntry['type']>('feat');
  const [newChangeText, setNewChangeText] = useState('');

  const [artifacts, setArtifacts] = useState<BuildArtifact[]>(initialBuild?.artifacts || []);
  const [newArtPlatform, setNewArtPlatform] = useState<ArtifactPlatform>('windows');
  const [newArtTitle, setNewArtTitle] = useState('');
  const [newArtUrl, setNewArtUrl] = useState('');
  const [newArtSize, setNewArtSize] = useState<number | undefined>(undefined);

  const handleAddChange = () => {
    if (!newChangeText.trim()) return;
    setChangelog(prev => [
      ...prev,
      {
        id: `ch-${Date.now()}`,
        type: newChangeType,
        text: newChangeText.trim()
      }
    ]);
    setNewChangeText('');
  };

  const handleRemoveChange = (id: string) => {
    setChangelog(prev => prev.filter(c => c.id !== id));
  };

  const handleAddArtifact = () => {
    if (!newArtUrl.trim()) return;
    setArtifacts(prev => [
      ...prev,
      {
        id: `art-${Date.now()}`,
        platform: newArtPlatform,
        title: newArtTitle.trim() || 'Сборка игры',
        url: newArtUrl.trim(),
        sizeMb: newArtSize
      }
    ]);
    setNewArtUrl('');
  };

  const handleRemoveArtifact = (id: string) => {
    setArtifacts(prev => prev.filter(a => a.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!version.trim() || !title.trim()) return;

    const buildToSave: BuildRelease = {
      id: initialBuild?.id || `build-${Date.now()}`,
      version: version.trim(),
      title: title.trim(),
      stage,
      status,
      targetEngineVersion: targetEngineVersion.trim(),
      releaseDate,
      description: description.trim(),
      isLatestRelease,
      changelog,
      artifacts,
      linkedTaskIds,
      linkedBugIds,
      testedHours
    };

    onSave(buildToSave);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(2, 6, 23, 0.8)',
        backdropFilter: 'blur(4px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
      onClick={onClose}
    >
      <div
        className="modal-content"
        style={{
          width: '100%',
          maxWidth: '680px',
          maxHeight: '90vh',
          overflowY: 'auto',
          background: 'var(--bg-panel)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#fff' }}>
            {isEditing ? `✏️ Редактирование сборки ${initialBuild?.version}` : '🚀 Зафиксировать новую сборку (Релиз)'}
          </h3>
          <button type="button" className="icon-btn" onClick={onClose} style={{ fontSize: '18px' }}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-dim)', marginBottom: '4px' }}>
                Версия сборки (SemVer)*
              </label>
              <input
                type="text"
                className="field"
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                placeholder="v0.4.0-demo"
                required
                style={{ width: '100%', fontSize: '12.5px' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-dim)', marginBottom: '4px' }}>
                Этап готовности*
              </label>
              <select
                className="field"
                value={stage}
                onChange={(e) => setStage(e.target.value as BuildStage)}
                style={{ width: '100%', fontSize: '12.5px' }}
              >
                <option value="alpha">🌱 Альфа-прототип (Alpha)</option>
                <option value="vertical-slice">🎮 Вертикальный срез (Vertical Slice)</option>
                <option value="demo-steam">🔥 Демо-версия (Steam / Itch)</option>
                <option value="release-candidate">🏁 Релиз-кандидат (RC)</option>
                <option value="release">💎 Финальный релиз (Gold)</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-dim)', marginBottom: '4px' }}>
                Стабильность сборки*
              </label>
              <select
                className="field"
                value={status}
                onChange={(e) => setStatus(e.target.value as BuildStatus)}
                style={{ width: '100%', fontSize: '12.5px' }}
              >
                <option value="stable">✅ Стабильная (Ready for QA)</option>
                <option value="testing">🔍 На активном плейтесте</option>
                <option value="critical-bugs">💥 Есть блокеры / краши</option>
                <option value="deprecated">💤 Устарела</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-dim)', marginBottom: '4px' }}>
                Название сборки*
              </label>
              <input
                type="text"
                className="field"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Демоверсия для фестиваля игр"
                required
                style={{ width: '100%', fontSize: '12.5px' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-dim)', marginBottom: '4px' }}>
                Версия Godot
              </label>
              <input
                type="text"
                className="field"
                value={targetEngineVersion}
                onChange={(e) => setTargetEngineVersion(e.target.value)}
                placeholder="Godot 4.3-stable"
                style={{ width: '100%', fontSize: '12.5px' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-dim)', marginBottom: '4px' }}>
                Дата билда
              </label>
              <input
                type="date"
                className="field"
                value={releaseDate}
                onChange={(e) => setReleaseDate(e.target.value)}
                style={{ width: '100%', fontSize: '12.5px' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-dim)', marginBottom: '4px' }}>
              Краткое резюме сборки
            </label>
            <textarea
              className="field"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Основной фокус: баланс босса и тест геймпада..."
              style={{ width: '100%', fontSize: '12px' }}
            />
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '12px' }}>
            <input
              type="checkbox"
              checked={isLatestRelease}
              onChange={(e) => setIsLatestRelease(e.target.checked)}
            />
            <span>Пометить как актуальный текущий билд проекта</span>
          </label>

          {/* Редактор чейнджлога */}
          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>
              📝 Список изменений (Changelog):
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '10px' }}>
              {changelog.map(ch => (
                <div key={ch.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.03)', padding: '4px 8px', borderRadius: '4px' }}>
                  <span style={{ fontSize: '12px', color: '#cbd5e1' }}>
                    <b style={{ color: 'var(--accent-cyan)' }}>[{ch.type}]</b> {ch.text}
                  </span>
                  <button type="button" className="icon-btn" onClick={() => handleRemoveChange(ch.id)} style={{ color: 'var(--accent-rose)', fontSize: '12px' }}>
                    ✕
                  </button>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <select
                className="field"
                value={newChangeType}
                onChange={(e) => setNewChangeType(e.target.value as ChangelogEntry['type'])}
                style={{ width: '110px', fontSize: '11.5px' }}
              >
                <option value="feat">✨ Фича</option>
                <option value="fix">🐛 Багфикс</option>
                <option value="balance">⚖️ Баланс</option>
                <option value="perf">⚡ Опт.</option>
              </select>
              <input
                type="text"
                className="field"
                placeholder="Что добавлено / исправлено..."
                value={newChangeText}
                onChange={(e) => setNewChangeText(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddChange(); } }}
                style={{ flex: 1, fontSize: '11.5px' }}
              />
              <button type="button" className="btn btn-secondary" onClick={handleAddChange} style={{ fontSize: '11.5px' }}>
                Добавить
              </button>
            </div>
          </div>

          {/* Редактор артефактов */}
          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>
              📦 Ссылки на файлы для тестирования:
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '10px' }}>
              {artifacts.map(art => (
                <div key={art.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.03)', padding: '4px 8px', borderRadius: '4px' }}>
                  <span style={{ fontSize: '12px', color: '#cbd5e1' }}>
                    {art.title} — <span style={{ color: 'var(--text-dim)', fontSize: '11px' }}>{art.url}</span>
                  </span>
                  <button type="button" className="icon-btn" onClick={() => handleRemoveArtifact(art.id)} style={{ color: 'var(--accent-rose)', fontSize: '12px' }}>
                    ✕
                  </button>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <select
                className="field"
                value={newArtPlatform}
                onChange={(e) => {
                  const plat = e.target.value as ArtifactPlatform;
                  setNewArtPlatform(plat);
                  if (plat === 'steam') setNewArtTitle('Steam Branch (playtest)');
                  else if (plat === 'itch') setNewArtTitle('Itch.io Secret Demo');
                  else if (plat === 'linux') setNewArtTitle('Linux x64 Build (.tar.gz)');
                  else if (plat === 'drive') setNewArtTitle('Google Drive Archive');
                  else setNewArtTitle('Windows x64 Build (.zip)');
                }}
                style={{ width: '130px', fontSize: '11.5px' }}
              >
                <option value="windows">🪟 Windows</option>
                <option value="linux">🐧 Linux</option>
                <option value="steam">♨️ Steam</option>
                <option value="itch">🎮 Itch.io</option>
                <option value="drive">☁️ Google Drive</option>
              </select>
              <input
                type="text"
                className="field"
                placeholder="Заголовок ссылки"
                value={newArtTitle}
                onChange={(e) => setNewArtTitle(e.target.value)}
                style={{ flex: '1 1 140px', fontSize: '11.5px' }}
              />
              <input
                type="text"
                className="field"
                placeholder="URL (https://...)"
                value={newArtUrl}
                onChange={(e) => setNewArtUrl(e.target.value)}
                style={{ flex: '2 1 180px', fontSize: '11.5px' }}
              />
              <input
                type="number"
                className="field"
                placeholder="МБ"
                value={newArtSize || ''}
                onChange={(e) => setNewArtSize(e.target.value ? Number(e.target.value) : undefined)}
                style={{ width: '70px', fontSize: '11.5px' }}
              />
              <button type="button" className="btn btn-secondary" onClick={handleAddArtifact} style={{ fontSize: '11.5px' }}>
                Добавить
              </button>
            </div>
          </div>

          <BuildRelationFields
            tasks={tasks}
            bugs={bugs}
            linkedTaskIds={linkedTaskIds}
            linkedBugIds={linkedBugIds}
            testedHours={testedHours}
            onToggleTask={(id) => setLinkedTaskIds(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id])}
            onToggleBug={(id) => setLinkedBugIds(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id])}
            onTestedHours={setTestedHours}
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose} style={{ fontSize: '12px' }}>
              Отмена
            </button>
            <button type="submit" className="btn btn-primary" style={{ fontSize: '12px', fontWeight: 700 }}>
              {isEditing ? 'Сохранить изменения' : 'Создать запись о сборке'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
