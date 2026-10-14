import React, { useState } from 'react';

export const ExplanationGuide: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      style={{
        background: 'rgba(15, 23, 42, 0.75)',
        border: '1px solid rgba(0, 242, 254, 0.25)',
        borderRadius: '10px',
        padding: '12px 16px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          userSelect: 'none'
        }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '18px' }}>🎓</span>
          <div>
            <h4 style={{ margin: 0, fontSize: '13.5px', fontWeight: 700, color: '#fff' }}>
              База для новичков: Как устроена математика прыжка и стейт-машина в Godot 4
            </h4>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Почему нельзя просто писать «gravity = 9.8» и что делает управление отзывчивым как в Celeste
            </span>
          </div>
        </div>

        <button
          type="button"
          className="btn btn-secondary"
          style={{ fontSize: '11px', padding: '4px 10px', minHeight: '26px' }}
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(!isOpen);
          }}
        >
          {isOpen ? 'Свернуть ▲' : 'Подробнее о физике ▼'}
        </button>
      </div>

      {isOpen && (
        <div
          style={{
            marginTop: '12px',
            paddingTop: '12px',
            borderTop: '1px solid var(--border)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '12px'
          }}
        >
          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '10px', borderRadius: '6px' }}>
            <strong style={{ fontSize: '12px', color: 'var(--accent-cyan)' }}>
              1. Формулы прыжка вместо случайных чисел
            </strong>
            <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#cbd5e1', lineHeight: '1.4' }}>
              Геймдизайнер мыслит в понятных категориях: «хочу прыжок на 3 тайла за 0.3 секунды». Калькулятор сам рассчитывает точную скорость <code>v0 = -2h / t</code> и силу гравитации <code>g = 2h / t²</code>!
            </p>
          </div>

          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '10px', borderRadius: '6px' }}>
            <strong style={{ fontSize: '12px', color: 'var(--accent-emerald)' }}>
              2. Coyote Time (Время койота)
            </strong>
            <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#cbd5e1', lineHeight: '1.4' }}>
              Как в мультике про койота, который висит в воздухе секунду до падения. Если игрок сошел с платформы, у него есть 0.12 сек, чтобы нажать прыжок. Это спасает от 90% нечестных падений!
            </p>
          </div>

          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '10px', borderRadius: '6px' }}>
            <strong style={{ fontSize: '12px', color: 'var(--accent-purple)' }}>
              3. Jump Buffer (Буфер нажатия)
            </strong>
            <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#cbd5e1', lineHeight: '1.4' }}>
              Люди нажимают прыжок за доли секунды до касания земли. Если буфер равен 0.1 сек, игра «запоминает» нажатие и прыгает в первый же кадр касания пола!
            </p>
          </div>

          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '10px', borderRadius: '6px' }}>
            <strong style={{ fontSize: '12px', color: 'var(--accent-amber)' }}>
              4. Зачем нужен Конечный Автомат (State Machine)?
            </strong>
            <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#cbd5e1', lineHeight: '1.4' }}>
              Без него код превращается в кашу из 50 <code>if / else</code> (например: «если прыгает, но нажал рывок и получает урон...»). Автомат четко делит поведение на изолированные состояния.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
