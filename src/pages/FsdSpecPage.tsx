import React from 'react';

const LAYERS = [
  { name: 'app/', color: '#38bdf8', desc: 'Провайдер Redux, store, маршрут по адресу #/экран, стили. main.tsx рендерит только этот корень.' },
  { name: 'pages/', color: '#818cf8', desc: 'Экраны. Данные доски приходят из store, страница их не хранит.' },
  { name: 'widgets/', color: '#c084fc', desc: 'Sidebar, Topbar, AuthModal.' },
  { name: 'features/', color: '#34d399', desc: 'note-capture, task-form, character-form, ability-form, narrative-editor.' },
  { name: 'entities/', color: '#fbbf24', desc: 'Слайсы и API: task, note, gallery, chat, narrative, roadmap, character, session.' },
  { name: 'shared/', color: '#94a3b8', desc: 'Речь, маршрут #/экран, readJson, кнопка микрофона. Без знания доски.' }
];

export const FsdSpecPage: React.FC = () => {
  return (
    <div className="view-content">
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ fontSize: '16px', color: '#fff' }}>Feature-Sliced Design (FSD) Спецификация</h3>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '3px' }}>
          Состояние доски лежит в Redux Toolkit. Экран берётся из адреса, например #/kanban.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {LAYERS.map(layer => (
          <div key={layer.name} className="panel" style={{ borderLeft: `4px solid ${layer.color}` }}>
            <div style={{ fontWeight: 700, color: layer.color, fontSize: '13px' }}>{layer.name}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{layer.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
