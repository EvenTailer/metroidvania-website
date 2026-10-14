import React, { useState } from 'react';
import { playCyberClick } from '../../shared/lib/cyberSound';
import { useDialog } from '../../shared/lib/useDialog';
import '../../shared/ui/hub-dialog.css';

interface GlossaryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface TermItem {
  id: string;
  term: string;
  category: 'physics' | 'gameplay' | 'engine' | 'production';
  categoryLabel: string;
  shortDesc: string;
  simpleExplanation: string;
  gameExample: string;
  icon: string;
}

const TERMS: TermItem[] = [
  {
    id: 'coyote-time',
    term: 'Время Койота (Coyote Time)',
    category: 'physics',
    categoryLabel: 'Физика платформера',
    icon: '🐺',
    shortDesc: 'Окно времени (0.1–0.15 сек) для прыжка после схода с края платформы.',
    simpleExplanation:
      'Названо в честь койота из мультика Looney Tunes, который бежит в воздухе несколько шагов перед тем, как упасть. В играх это спасает игроков от падений в яму, когда они жмут прыжок на 1 кадр позже.',
    gameExample:
      'В нашей игре Кибер-Утка имеет coyote_time = 0.12 сек, что позволяет комфортно скакать по неоновым трубам завода.'
  },
  {
    id: 'jump-buffer',
    term: 'Буфер прыжка (Jump Buffer)',
    category: 'physics',
    categoryLabel: 'Физика платформера',
    icon: '⏳',
    shortDesc: 'Запоминание нажатия кнопки прыжка незадолго до приземления на пол.',
    simpleExplanation:
      'Игрок нажал Пробел, когда до пола оставалось пару сантиметров. Без буфера персонаж бы просто шлёпнулся и остался стоять. С буфером игра запоминает нажатие и подпрыгивает в первый же кадр касания земли.',
    gameExample:
      'Буфер 0.10 сек делает прыжки Кибер-Утки невероятно плавными и отзывчивыми.'
  },
  {
    id: 'gating',
    term: 'Гейтинг локаций (Ability Gate)',
    category: 'gameplay',
    categoryLabel: 'Геймдизайн метроидвании',
    icon: '🔒',
    shortDesc: 'Блокировка проходов в новые зоны требованиями к способностям героя.',
    simpleExplanation:
      'Ключевая механика жанра Metroidvania. Вы видите проход, заваленный энерго-барьером, но не можете пройти. Позже находите Плазменный Рывок, возвращаетесь и открываете целый новый биом!',
    gameExample:
      'В нашей матрице комнат сектор Неонового Склепа закрыт на Энерго-Рывок (Dash), а Лаборатория — на ключ-карту Омега.'
  },
  {
    id: 'state-machine',
    term: 'Машина состояний (FSM / State Machine)',
    category: 'engine',
    categoryLabel: 'Архитектура Godot 4',
    icon: '⚙️',
    shortDesc: 'Система строгих правил поведения: персонаж всегда находится ровно в одном состоянии.',
    simpleExplanation:
      'Чтобы герой случайно не начал одновременно умирать, атаковать и прыгать. Машина переключает: Покой (Idle) → Бег (Run) → Прыжок (Jump) → Падение (Fall) → Рывок (Dash).',
    gameExample:
      'Наш генератор GDScript создаёт класс StateMachine.gd с 8 состояниями и чистым переключением без спагетти-кода.'
  },
  {
    id: 'parry',
    term: 'Окно парирования (Parry Window)',
    category: 'gameplay',
    categoryLabel: 'Боевая система',
    icon: '⚔️',
    shortDesc: 'Короткий интервал (0.15–0.25 сек) для отражения удара в тайминг.',
    simpleExplanation:
      'Если нажать блок за мгновение до попадания удара врага, персонаж не просто защищается, а оглушает противника и наносит критический урон!',
    gameExample:
      'Утка парирует летящие лазерные ракеты Дрона-Надзирателя и отправляет их обратно во врага.'
  },
  {
    id: 'res-folder',
    term: 'Файловая система res:// в Godot',
    category: 'engine',
    categoryLabel: 'Архитектура Godot 4',
    icon: '📁',
    shortDesc: 'Внутренний виртуальный корень всех файлов игры (Resource Root).',
    simpleExplanation:
      'Вместо пути "C:/Games/CyberDuck/data" движок использует короткий путь "res://data/world_matrix.json", который одинаково работает на Windows, Linux, Mac и Steam Deck.',
    gameExample:
      'Наш "Файловый мост" выгружает сгенерированные файлы прямо в структуру папок res://data/ и res://scripts/.'
  },
  {
    id: 'vertical-slice',
    term: 'Вертикальный срез (Vertical Slice)',
    category: 'production',
    categoryLabel: 'Пайплайн разработки',
    icon: '💎',
    shortDesc: 'Готовый финальный фрагмент игры максимального качества со всеми полировками.',
    simpleExplanation:
      'Не половина игры без графики, а всего 1 уровень или 1 комната с боссом, но с финальной графикой, звуком, эффектами и балансом. Чтобы показать издателю: "Вот так будет выглядеть игра!".',
    gameExample:
      'Сборка v0.3.0 в нашем трекере релизов — это как раз Вертикальный срез сектора Городской Порт.'
  }
];

export const GlossaryModal: React.FC<GlossaryModalProps> = ({ isOpen, onClose }) => {
  const panelRef = useDialog(isOpen);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  if (!isOpen) return null;

  const filteredTerms = TERMS.filter(t => {
    if (selectedCategory !== 'all' && t.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const match =
        t.term.toLowerCase().includes(q) ||
        t.shortDesc.toLowerCase().includes(q) ||
        t.simpleExplanation.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  return (
    <div className="hub-dialog-backdrop hub-dialog-backdrop--glossary" onClick={onClose}>
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="glossary-title"
        data-hub-dialog="open"
        style={{
          width: '100%',
          maxWidth: '720px',
          maxHeight: '90vh',
          background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.98) 0%, rgba(11, 16, 28, 0.98) 100%)',
          border: '1px solid rgba(0, 242, 254, 0.35)',
          borderRadius: '12px',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.9), 0 0 30px rgba(0, 242, 254, 0.2)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Шапка */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(2, 6, 23, 0.4)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '24px' }}>📖</span>
            <div>
              <h3 id="glossary-title" style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#fff' }}>
                Справочник разработчика: Понятно даже школьнику
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: '11px', color: 'var(--text-muted)' }}>
                Простые объяснения сложных терминов Godot 4, физики платформеров и метроидваний
              </p>
            </div>
          </div>

          <button
            type="button"
            className="icon-btn"
            onClick={() => {
              playCyberClick();
              onClose();
            }}
            style={{ fontSize: '16px', color: 'var(--text-dim)' }}
          >
            ✕
          </button>
        </div>

        {/* Фильтры и поиск */}
        <div
          style={{
            padding: '12px 20px',
            background: 'rgba(2, 6, 23, 0.2)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}
        >
          <input
            type="text"
            className="field"
            data-dialog-initial-focus
            placeholder="Поиск по терминам и описаниям"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%', fontSize: '12.5px', padding: '6px 12px' }}
          />

          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            <button
              type="button"
              className={`chip-btn ${selectedCategory === 'all' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('all')}
              style={{ fontSize: '11px', padding: '3px 10px' }}
            >
              Все термины ({TERMS.length})
            </button>
            <button
              type="button"
              className={`chip-btn ${selectedCategory === 'physics' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('physics')}
              style={{ fontSize: '11px', padding: '3px 10px' }}
            >
              ⚡ Физика платформера
            </button>
            <button
              type="button"
              className={`chip-btn ${selectedCategory === 'gameplay' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('gameplay')}
              style={{ fontSize: '11px', padding: '3px 10px' }}
            >
              🎮 Геймдизайн метроидвании
            </button>
            <button
              type="button"
              className={`chip-btn ${selectedCategory === 'engine' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('engine')}
              style={{ fontSize: '11px', padding: '3px 10px' }}
            >
              ⚙️ Движок Godot 4
            </button>
            <button
              type="button"
              className={`chip-btn ${selectedCategory === 'production' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('production')}
              style={{ fontSize: '11px', padding: '3px 10px' }}
            >
              💎 Пайплайн
            </button>
          </div>
        </div>

        {/* Список терминов */}
        <div
          style={{
            padding: '16px 20px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}
        >
          {filteredTerms.length === 0 ? (
            <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>
              Терминов по запросу не найдено
            </div>
          ) : (
            filteredTerms.map(term => (
              <div
                key={term.id}
                style={{
                  background: 'rgba(2, 6, 23, 0.5)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '8px',
                  padding: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '20px' }}>{term.icon}</span>
                    <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 800, color: 'var(--accent-cyan)' }}>
                      {term.term}
                    </h4>
                  </div>
                  <span
                    style={{
                      fontSize: '10px',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      background: 'rgba(255, 255, 255, 0.06)',
                      color: 'var(--text-dim)'
                    }}
                  >
                    {term.categoryLabel}
                  </span>
                </div>

                <div style={{ fontSize: '12px', fontWeight: 600, color: '#f1f5f9', lineHeight: '1.4' }}>
                  {term.shortDesc}
                </div>

                <div
                  style={{
                    fontSize: '11.5px',
                    color: '#94a3b8',
                    lineHeight: '1.45',
                    background: 'rgba(15, 23, 42, 0.6)',
                    padding: '8px 10px',
                    borderRadius: '6px',
                    borderLeft: '3px solid var(--accent-purple)'
                  }}
                >
                  <b style={{ color: '#fff' }}>Простыми словами: </b>
                  {term.simpleExplanation}
                </div>

                <div style={{ fontSize: '11px', color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>🦆</span>
                  <span>
                    <b>Пример в Cyber-Duck: </b>
                    {term.gameExample}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
