import React from 'react';

interface CanvasNavHudProps {
  zoom: number;
  onZoomChange: (delta: number) => void;
  onResetView: () => void;
  onFitView: () => void;
}

export const CanvasNavHud: React.FC<CanvasNavHudProps> = ({
  zoom,
  onZoomChange,
  onResetView,
  onFitView
}) => {
  return (
    <div
      style={{
        position: 'absolute',
        bottom: '16px',
        left: '16px',
        zIndex: 30,
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        background: 'rgba(11, 16, 28, 0.88)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(0, 210, 255, 0.25)',
        borderRadius: '10px',
        padding: '6px 10px',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.55)',
        pointerEvents: 'auto',
        userSelect: 'none'
      }}
    >
      {/* Navigation Instruction Pill (Desktop) */}
      <div
        className="canvas-nav-desktop-help"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          paddingRight: '10px',
          borderRight: '1px solid rgba(255, 255, 255, 0.1)',
          fontSize: '11px',
          color: 'var(--text-muted)'
        }}
      >
        <span>
          🖱️ <strong>Колесико</strong>: зум
        </span>
        <span style={{ opacity: 0.4 }}>•</span>
        <span>
          <strong>Зажатое колесико (СКМ)</strong>: панорама
        </span>
        <span style={{ opacity: 0.4 }}>•</span>
        <span style={{ color: 'var(--accent-cyan)' }}>
          <strong>Точки</strong>: нити связи
        </span>
      </div>

      {/* Navigation Instruction Pill (Mobile) */}
      <div
        className="canvas-nav-mobile-help"
        style={{
          display: 'none',
          alignItems: 'center',
          gap: '6px',
          paddingRight: '8px',
          borderRight: '1px solid rgba(255, 255, 255, 0.1)',
          fontSize: '10.5px',
          color: 'var(--text-muted)'
        }}
      >
        <span>🖐️ <strong>Фон</strong>: сдвиг</span>
        <span style={{ opacity: 0.4 }}>•</span>
        <span>🤏 <strong>2 пальца</strong>: зум</span>
      </div>

      {/* Zoom Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <button
          type="button"
          className="chip-btn"
          style={{ padding: '3px 8px', fontSize: '12px' }}
          onClick={() => onZoomChange(-0.1)}
          disabled={zoom <= 0.35}
          title="Отдалить"
        >
          −
        </button>

        <button
          type="button"
          className="chip-btn"
          style={{
            padding: '3px 8px',
            fontSize: '11px',
            fontWeight: 800,
            minWidth: '46px',
            textAlign: 'center',
            color: '#fff'
          }}
          onClick={onResetView}
          title="Сбросить масштаб к 100%"
        >
          {Math.round(zoom * 100)}%
        </button>

        <button
          type="button"
          className="chip-btn"
          style={{ padding: '3px 8px', fontSize: '12px' }}
          onClick={() => onZoomChange(0.1)}
          disabled={zoom >= 2.4}
          title="Приблизить"
        >
          +
        </button>
      </div>

      {/* Fit View Button */}
      <button
        type="button"
        className="chip-btn"
        style={{ padding: '4px 10px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}
        onClick={onFitView}
        title="Показать все комнаты по центру экрана"
      >
        <span>🎯</span>
        <span>По центру</span>
      </button>
    </div>
  );
};
