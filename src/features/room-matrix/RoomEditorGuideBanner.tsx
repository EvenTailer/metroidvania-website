import React, { useState } from 'react';

export const RoomEditorGuideBanner: React.FC = () => {
  const [isOpen, setIsOpen] = useState(() => {
    try {
      return localStorage.getItem('mv4_room_guide_open') !== 'false';
    } catch {
      return true;
    }
  });

  const toggle = () => {
    const next = !isOpen;
    setIsOpen(next);
    try {
      localStorage.setItem('mv4_room_guide_open', String(next));
    } catch {
      /* ignore */
    }
  };

  return (
    <div
      className="panel"
      style={{
        padding: isOpen ? '10px 16px' : '6px 14px',
        marginBottom: '10px',
        background: 'linear-gradient(90deg, rgba(14, 165, 233, 0.12) 0%, rgba(168, 85, 247, 0.08) 100%)',
        border: '1px solid rgba(0, 210, 255, 0.25)',
        borderRadius: '10px',
        flexShrink: 0
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '15px' }}>💡</span>
          <span style={{ fontSize: '12.5px', fontWeight: 800, color: '#fff' }}>
            Интерактивная карта: свободная навигация и соединение комнат нитями
          </span>
        </div>
        <button
          type="button"
          className="chip-btn"
          style={{ fontSize: '11px', padding: '3px 10px' }}
          onClick={toggle}
        >
          {isOpen ? 'Скрыть подсказки ▲' : 'Как пользоваться? ▼'}
        </button>
      </div>

      {isOpen && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
            gap: '10px',
            marginTop: '10px',
            fontSize: '11.5px',
            color: 'var(--text-muted)',
            lineHeight: 1.45
          }}
        >
          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '8px 10px', borderRadius: '6px' }}>
            <strong style={{ color: 'var(--accent-cyan)', display: 'block', marginBottom: '2px' }}>
              🧭 1. Панорама и Зум (без прокрутки страницы)
            </strong>
            <strong>Зажмите колесико мыши (СКМ)</strong> для перемещения по карте. <strong>Крутите колесико</strong> для приближения/отдаления к курсору.
          </div>

          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '8px 10px', borderRadius: '6px' }}>
            <strong style={{ color: 'var(--accent-purple)', display: 'block', marginBottom: '2px' }}>
              🪢 2. Протягивание нитей от точки к точке
            </strong>
            Зажмите круглую точку (Север, Восток, Юг, Запад) и тяните гибкую неоновую нить. Она сама примагнитится к точке назначения при сближении!
          </div>

          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '8px 10px', borderRadius: '6px' }}>
            <strong style={{ color: 'var(--accent-amber)', display: 'block', marginBottom: '2px' }}>
              🔒 3. Замки способностей и удаление
            </strong>
            Кликните по кружку 🔗 или 🔒 в центре нити, чтобы установить замок (Нейро-глаз, Dash, Силовой удар) или удалить связь.
          </div>

          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '8px 10px', borderRadius: '6px' }}>
            <strong style={{ color: 'var(--accent-emerald)', display: 'block', marginBottom: '2px' }}>
              📦 4. Размеры и создание локаций
            </strong>
            Двойной клик по холсту или кнопка <strong>«+ Новая комната»</strong>. Доступны любые форматы комнат: <strong>1×1</strong> (стандарт), <strong>2×1</strong> (коридор), <strong>1×2</strong> (шахта лифта), <strong>2×2</strong> (арена босса), <strong>3×1</strong> и <strong>3×2</strong>.
          </div>
        </div>
      )}
    </div>
  );
};
