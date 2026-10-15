import React, { useState } from 'react';
import { GameAbility, DEFAULT_ABILITIES } from '../entities/ability';
import { CharacterItem } from '../entities/character';
import { AbilityModal } from '../features/ability-form/AbilityModal';
import { CharacterModal } from '../features/character-form/CharacterModal';

interface HeroPageProps {
  characters: CharacterItem[];
  onSaveCharacter: (char: CharacterItem) => void;
  onDeleteCharacter: (id: string) => void;
  onOpenLightbox: (url: string) => void;
  onShowToast: (msg: string) => void;
}

const GATING_MAP = [
  { zone: 'Сектор 0: Трущобы и База', ability: 'Базовый прыжок + Coyote Time', desc: 'Начальная обучающая зона. Проверка физики CharacterBody2D.', boss: 'Нет (Тренировочный манекен)' },
  { zone: 'Сектор 1: Лаборатории «Нейро-Синтез»', ability: '👁 Нейро-глаз «Спектр» (Q)', desc: 'Открывает синие барьеры, проявляет скрытые платформы.', boss: 'Корпоративный Центурион MK-IV' },
  { zone: 'Сектор 2: Заброшенный Литейный цех', ability: '🦾 Кибер-рука (J / K)', desc: 'Парирование огнеметов и выбивание силовых гермодверей.', boss: 'Плавильный Дробитель' },
  { zone: 'Сектор 3: Кислотные коллекторы', ability: '👟 Реактивный Dash (Shift)', desc: 'Пролет сквозь кислотные гейзеры и фиолетовые лазеры.', boss: 'Кибер-Пиявка Улья' },
  { zone: 'Сектор 4: Верхний шпиль корпорации', ability: '🪝 Трос-гарпун (RMB / E)', desc: 'Вертикальный платформинг по висячим кабелям и шахтам.', boss: 'Архитектор «Спектра» (Финал)' }
];

export const HeroPage: React.FC<HeroPageProps> = ({
  characters,
  onSaveCharacter,
  onDeleteCharacter,
  onOpenLightbox,
  onShowToast
}) => {
  const [activeTab, setActiveTab] = useState<'abilities' | 'gating' | 'characters'>('abilities');
  const [abilities, setAbilities] = useState<GameAbility[]>(() => {
    try {
      const raw = localStorage.getItem('mv4_abilities');
      if (raw) return JSON.parse(raw);
    } catch {
      /* ignore */
    }
    return DEFAULT_ABILITIES;
  });

  const [editingAbility, setEditingAbility] = useState<GameAbility | null>(null);
  const [abilityModalOpen, setAbilityModalOpen] = useState(false);

  const [editingCharacter, setEditingCharacter] = useState<CharacterItem | null>(null);
  const [charModalOpen, setCharModalOpen] = useState(false);

  const saveAbilitiesToStorage = (updated: GameAbility[]) => {
    setAbilities(updated);
    try {
      localStorage.setItem('mv4_abilities', JSON.stringify(updated));
    } catch {
      /* ignore */
    }
  };

  const handleSaveAbility = (ab: GameAbility) => {
    const exists = abilities.some(a => a.id === ab.id);
    const next = exists
      ? abilities.map(a => a.id === ab.id ? ab : a)
      : [ab, ...abilities];
    saveAbilitiesToStorage(next);
  };

  const handleDeleteAbility = (id: string) => {
    const next = abilities.filter(a => a.id !== id);
    saveAbilitiesToStorage(next);
    onShowToast('Способность удалена');
  };

  const copyGdscript = () => {
    const lines = [
      '# Godot 4.3 Abilities Registry (Auto-generated from Cyber-Duck Hub)',
      'class_name AbilityRegistry extends RefCounted',
      '',
      'const ABILITIES = {'
    ];
    abilities.forEach(a => {
      lines.push(`\t"${a.id}": {`);
      lines.push(`\t\t"name": "${a.name}",`);
      lines.push(`\t\t"input": "${a.godotInput}",`);
      lines.push(`\t\t"node": "${a.godotNode}",`);
      lines.push(`\t\t"barrier": "${a.gatingBarrier}"`);
      lines.push('\t},');
    });
    lines.push('}');
    navigator.clipboard.writeText(lines.join('\n')).then(() => {
      onShowToast('GDScript словарь способностей скопирован в буфер!');
    });
  };

  return (
    <div className="view-content">
      {/* Top Banner */}
      <div className="panel" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 style={{ fontSize: '18px', color: '#fff', fontWeight: 800, margin: '0 0 4px' }}>
              🧬 Досье Кибер-Утки, Способности & Ability Gating
            </h2>
            <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', margin: 0 }}>
              Архитектура геймдизайна: способности как ключи к локациям (Classic Metroidvania Lock & Key Design).
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button type="button" className="btn btn-secondary" onClick={copyGdscript}>
              📋 Экспорт GDScript
            </button>
            {activeTab === 'abilities' && (
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  setEditingAbility(null);
                  setAbilityModalOpen(true);
                }}
              >
                + Добавить способность
              </button>
            )}
            {activeTab === 'characters' && (
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  setEditingCharacter(null);
                  setCharModalOpen(true);
                }}
              >
                + Добавить персонажа
              </button>
            )}
          </div>
        </div>

        {/* Tab switcher */}
        <div className="note-tag-row" style={{ marginTop: '16px', borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
          <button
            type="button"
            className={`chip-btn ${activeTab === 'abilities' ? 'active' : ''}`}
            onClick={() => setActiveTab('abilities')}
          >
            ⚡ Способности и тайминги ({abilities.length})
          </button>
          <button
            type="button"
            className={`chip-btn ${activeTab === 'gating' ? 'active' : ''}`}
            onClick={() => setActiveTab('gating')}
          >
            🗺️ Карта гейтинга зон (Lock & Key)
          </button>
          <button
            type="button"
            className={`chip-btn ${activeTab === 'characters' ? 'active' : ''}`}
            onClick={() => setActiveTab('characters')}
          >
            👥 Бестиарий и Персонажи ({characters.length})
          </button>
        </div>
      </div>

      {/* TAB 1: ABILITIES */}
      {activeTab === 'abilities' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '16px' }}>
          {abilities.map(ab => {
            const statusColor = ab.status === 'done' ? 'var(--accent-emerald)' : ab.status === 'in-progress' ? 'var(--accent-amber)' : 'var(--text-muted)';
            const statusLabel = ab.status === 'done' ? 'Готово в Godot' : ab.status === 'in-progress' ? 'В разработке' : 'В планах';

            return (
              <div key={ab.id} className="panel" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '24px' }}>{ab.icon}</span>
                      <div>
                        <h4 style={{ fontSize: '15px', color: '#fff', fontWeight: 700, margin: 0 }}>
                          {ab.name}
                        </h4>
                        <span style={{ fontSize: '11px', color: 'var(--accent-cyan)' }}>
                          Кнопка: <b>{ab.godotInput}</b>
                        </span>
                      </div>
                    </div>
                    <span style={{ fontSize: '10.5px', padding: '2px 8px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', color: statusColor, border: `1px solid ${statusColor}` }}>
                      {statusLabel}
                    </span>
                  </div>

                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.55, marginBottom: '12px' }}>
                    {ab.mechanic}
                  </p>

                  <div style={{ background: '#070b16', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border)', marginBottom: '12px', fontSize: '11.5px' }}>
                    <div style={{ color: 'var(--accent-cyan)', fontWeight: 600, marginBottom: '4px' }}>
                      🔑 Гейтинг: {ab.gatingBarrier}
                    </div>
                    <div style={{ color: 'var(--text-dim)', marginBottom: '2px' }}>
                      ⏱️ <b>Тайминги:</b> {ab.timing}
                    </div>
                    <div style={{ color: 'var(--text-dim)' }}>
                      🌲 <b>Узел Godot:</b> <code>{ab.godotNode}</code>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', borderTop: '1px solid var(--border)', paddingTop: '10px' }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ fontSize: '11.5px', padding: '5px 12px' }}
                    onClick={() => {
                      setEditingAbility(ab);
                      setAbilityModalOpen(true);
                    }}
                  >
                    ✏️ Редактировать
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 2: GATING MAP */}
      {activeTab === 'gating' && (
        <div className="panel">
          <h3 style={{ fontSize: '16px', color: '#fff', marginBottom: '8px' }}>
            Прогрессия зон и Ability Lock & Key
          </h3>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '18px' }}>
            Схема прохождения игры: каждая зона заблокирована до получения соответствующего импланта Кибер-Утки.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {GATING_MAP.map((item, idx) => (
              <div
                key={idx}
                style={{
                  background: '#070b16',
                  border: '1px solid var(--border)',
                  borderRadius: '10px',
                  padding: '14px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}
              >
                <div style={{ minWidth: '240px', flex: 1 }}>
                  <div style={{ fontSize: '11px', color: 'var(--accent-cyan)', textTransform: 'uppercase', fontWeight: 700 }}>
                    Этап {idx + 1}
                  </div>
                  <div style={{ fontSize: '14px', color: '#fff', fontWeight: 700, margin: '2px 0' }}>
                    {item.zone}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    {item.desc}
                  </div>
                </div>

                <div style={{ minWidth: '220px' }}>
                  <div style={{ fontSize: '10.5px', color: 'var(--text-dim)' }}>Ключ доступа (Способность):</div>
                  <div style={{ fontSize: '13px', color: 'var(--accent-purple)', fontWeight: 700 }}>
                    {item.ability}
                  </div>
                </div>

                <div style={{ minWidth: '180px' }}>
                  <div style={{ fontSize: '10.5px', color: 'var(--text-dim)' }}>Охраняющий босс:</div>
                  <div style={{ fontSize: '12.5px', color: 'var(--accent-amber)', fontWeight: 600 }}>
                    {item.boss}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: CHARACTERS */}
      {activeTab === 'characters' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '16px' }}>
          {characters.map(char => (
            <div key={char.id} className="panel hero-dossier hero-dossier-card" style={{ padding: '16px' }}>
              <div
                style={{
                  border: '1px solid var(--border-bright)',
                  borderRadius: 'var(--radius-sm)',
                  background: '#060910',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  height: '140px',
                  position: 'relative'
                }}
                onClick={() => onOpenLightbox(char.imageUrl)}
              >
                <img src={char.imageUrl} alt={char.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <span className={`card-tag ${char.role === 'Главный герой' ? 'art' : char.role === 'Босс' ? 'code' : 'design'}`}>
                    {char.role}
                  </span>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ fontSize: '11px', padding: '3px 8px' }}
                    onClick={() => {
                      setEditingCharacter(char);
                      setCharModalOpen(true);
                    }}
                  >
                    ✏️ Изменить
                  </button>
                </div>

                <h4 style={{ fontSize: '15px', color: '#fff', fontWeight: 700, margin: '6px 0 4px' }}>
                  {char.name}
                </h4>
                <div style={{ fontSize: '11px', color: 'var(--accent-cyan)', marginBottom: '8px' }}>
                  {char.tag}
                </div>
                <p style={{ fontSize: '11.5px', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '10px' }}>
                  {char.lore}
                </p>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {char.skills.map((s, i) => (
                    <span key={i} className="step-pill" style={{ fontSize: '10.5px' }}>
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      {abilityModalOpen && (
        <AbilityModal
          ability={editingAbility}
          onSave={handleSaveAbility}
          onDelete={handleDeleteAbility}
          onClose={() => setAbilityModalOpen(false)}
          onShowToast={onShowToast}
        />
      )}

      {charModalOpen && (
        <CharacterModal
          character={editingCharacter}
          onSave={onSaveCharacter}
          onDelete={onDeleteCharacter}
          onClose={() => setCharModalOpen(false)}
          onShowToast={onShowToast}
        />
      )}
    </div>
  );
};
