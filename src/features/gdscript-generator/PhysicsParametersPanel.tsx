import React from 'react';
import {
  calculatePhysics,
  PHYSICS_PRESETS,
  PlatformerPhysicsParams
} from '../../entities/gdscript-generator';
import { PhysicsComputedReadout } from './PhysicsComputedReadout';

interface PhysicsParametersPanelProps {
  params: PlatformerPhysicsParams;
  selectedPresetId: string;
  onParamChange: <K extends keyof PlatformerPhysicsParams>(
    key: K,
    value: PlatformerPhysicsParams[K]
  ) => void;
  onSelectPreset: (presetId: string) => void;
  onReset: () => void;
}

export const PhysicsParametersPanel: React.FC<PhysicsParametersPanelProps> = ({
  params,
  selectedPresetId,
  onParamChange,
  onSelectPreset,
  onReset
}) => {
  const comp = calculatePhysics(params);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Пресеты в один клик */}
      <div
        style={{
          background: 'rgba(11, 16, 28, 0.85)',
          border: '1px solid var(--border)',
          borderRadius: '10px',
          padding: '12px 14px'
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '10px',
            flexWrap: 'wrap',
            gap: '8px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '16px' }}>⚡</span>
            <strong style={{ fontSize: '13px', color: '#fff' }}>Готовые пресеты физики:</strong>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              (кликните для быстрой настройки)
            </span>
          </div>

          <button
            type="button"
            className="btn btn-ghost"
            onClick={onReset}
            style={{ fontSize: '11px', padding: '3px 8px', color: 'var(--text-dim)' }}
          >
            Сбросить
          </button>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {PHYSICS_PRESETS.map(preset => {
            const isCur = selectedPresetId === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                className={`chip-btn ${isCur ? 'active' : ''}`}
                onClick={() => onSelectPreset(preset.id)}
                style={{
                  fontSize: '11.5px',
                  padding: '5px 11px',
                  borderColor: isCur ? preset.color : undefined,
                  color: isCur ? preset.color : undefined,
                  boxShadow: isCur ? `0 0 10px ${preset.color}35` : undefined
                }}
                title={preset.description}
              >
                <span>{preset.title}</span>
                <span
                  style={{
                    fontSize: '9.5px',
                    opacity: 0.8,
                    background: 'rgba(255, 255, 255, 0.08)',
                    padding: '1px 5px',
                    borderRadius: '10px'
                  }}
                >
                  {preset.badge}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Основные ползунки и параметры */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '14px'
        }}
      >
        {/* Группа 1: Прыжок и Гравитация */}
        <div
          style={{
            background: 'rgba(15, 22, 38, 0.9)',
            border: '1px solid rgba(0, 242, 254, 0.2)',
            borderRadius: '10px',
            padding: '14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
            <span style={{ fontSize: '18px' }}>🚀</span>
            <div>
              <h4 style={{ margin: 0, fontSize: '13.5px', color: 'var(--accent-cyan)' }}>
                Прыжок и Гравитация
              </h4>
              <span style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>
                Высота и время в воздухе
              </span>
            </div>
          </div>

          {/* Высота прыжка */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <label style={{ fontSize: '11.5px', color: '#cbd5e1' }}>
                Высота прыжка:
              </label>
              <strong style={{ fontSize: '11.5px', color: 'var(--accent-cyan)' }}>
                {params.jumpHeight} px ({comp.jumpHeightTiles} тайла)
              </strong>
            </div>
            <input
              type="range"
              min="20"
              max="160"
              step="2"
              value={params.jumpHeight}
              onChange={(e) => onParamChange('jumpHeight', Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--accent-cyan)', cursor: 'pointer' }}
            />
          </div>

          {/* Время до вершины */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <label style={{ fontSize: '11.5px', color: '#cbd5e1' }}>
                Время взлета (до вершины):
              </label>
              <strong style={{ fontSize: '11.5px', color: '#fff' }}>
                {params.timeToPeak} сек
              </strong>
            </div>
            <input
              type="range"
              min="0.15"
              max="0.80"
              step="0.01"
              value={params.timeToPeak}
              onChange={(e) => onParamChange('timeToPeak', Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--accent-cyan)', cursor: 'pointer' }}
            />
          </div>

          {/* Время падения */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <label style={{ fontSize: '11.5px', color: '#cbd5e1' }}>
                Время падения (до земли):
              </label>
              <strong style={{ fontSize: '11.5px', color: '#fff' }}>
                {params.fallTime} сек
              </strong>
            </div>
            <input
              type="range"
              min="0.15"
              max="0.80"
              step="0.01"
              value={params.fallTime}
              onChange={(e) => onParamChange('fallTime', Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--accent-cyan)', cursor: 'pointer' }}
            />
            <span style={{ fontSize: '10px', color: 'var(--text-dim)', display: 'block', marginTop: '2px' }}>
              💡 Совет: если падение быстрее взлета ({params.fallTime} &lt; {params.timeToPeak}), прыжок ощущается сочно и динамично.
            </span>
          </div>
        </div>

        {/* Группа 2: Бег и Управление */}
        <div
          style={{
            background: 'rgba(15, 22, 38, 0.9)',
            border: '1px solid rgba(168, 85, 247, 0.2)',
            borderRadius: '10px',
            padding: '14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
            <span style={{ fontSize: '18px' }}>🏃</span>
            <div>
              <h4 style={{ margin: 0, fontSize: '13.5px', color: 'var(--accent-purple)' }}>
                Бег и Инерция
              </h4>
              <span style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>
                Скорость, разгон и торможение
              </span>
            </div>
          </div>

          {/* Скорость бега */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <label style={{ fontSize: '11.5px', color: '#cbd5e1' }}>
                Макс. скорость бега:
              </label>
              <strong style={{ fontSize: '11.5px', color: 'var(--accent-purple)' }}>
                {params.moveSpeed} px/s
              </strong>
            </div>
            <input
              type="range"
              min="80"
              max="350"
              step="5"
              value={params.moveSpeed}
              onChange={(e) => onParamChange('moveSpeed', Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--accent-purple)', cursor: 'pointer' }}
            />
          </div>

          {/* Время разгона */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <label style={{ fontSize: '11.5px', color: '#cbd5e1' }}>
                Время разгона:
              </label>
              <strong style={{ fontSize: '11.5px', color: '#fff' }}>
                {params.accelTime} сек
              </strong>
            </div>
            <input
              type="range"
              min="0.02"
              max="0.30"
              step="0.01"
              value={params.accelTime}
              onChange={(e) => onParamChange('accelTime', Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--accent-purple)', cursor: 'pointer' }}
            />
          </div>

          {/* Время торможения */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <label style={{ fontSize: '11.5px', color: '#cbd5e1' }}>
                Время торможения (трение):
              </label>
              <strong style={{ fontSize: '11.5px', color: '#fff' }}>
                {params.frictionTime} сек
              </strong>
            </div>
            <input
              type="range"
              min="0.01"
              max="0.25"
              step="0.01"
              value={params.frictionTime}
              onChange={(e) => onParamChange('frictionTime', Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--accent-purple)', cursor: 'pointer' }}
            />
          </div>
        </div>

        {/* Группа 3: Секреты Game Feel (Coyote & Buffer & Dash) */}
        <div
          style={{
            background: 'rgba(15, 22, 38, 0.9)',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            borderRadius: '10px',
            padding: '14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
            <span style={{ fontSize: '18px' }}>✨</span>
            <div>
              <h4 style={{ margin: 0, fontSize: '13.5px', color: 'var(--accent-emerald)' }}>
                Game Feel: Пощада ввода
              </h4>
              <span style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>
                Секреты отзывчивости платформеров
              </span>
            </div>
          </div>

          {/* Coyote Time */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <label style={{ fontSize: '11.5px', color: '#cbd5e1' }}>
                  Coyote Time (время пощады):
                </label>
              </div>
              <strong style={{ fontSize: '11.5px', color: 'var(--accent-emerald)' }}>
                {params.coyoteTime} сек ({Math.round(params.coyoteTime * 60)} кадров)
              </strong>
            </div>
            <input
              type="range"
              min="0.04"
              max="0.25"
              step="0.01"
              value={params.coyoteTime}
              onChange={(e) => onParamChange('coyoteTime', Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--accent-emerald)', cursor: 'pointer' }}
            />
            <span style={{ fontSize: '10px', color: 'var(--text-dim)', display: 'block', marginTop: '2px' }}>
              🐺 Прыжок разрешен даже спустя {params.coyoteTime}с после схода с края обрыва.
            </span>
          </div>

          {/* Jump Buffer */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <label style={{ fontSize: '11.5px', color: '#cbd5e1' }}>
                Jump Buffer (буфер ввода):
              </label>
              <strong style={{ fontSize: '11.5px', color: 'var(--accent-emerald)' }}>
                {params.jumpBufferTime} сек ({Math.round(params.jumpBufferTime * 60)} кадров)
              </strong>
            </div>
            <input
              type="range"
              min="0.04"
              max="0.25"
              step="0.01"
              value={params.jumpBufferTime}
              onChange={(e) => onParamChange('jumpBufferTime', Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--accent-emerald)', cursor: 'pointer' }}
            />
            <span style={{ fontSize: '10px', color: 'var(--text-dim)', display: 'block', marginTop: '2px' }}>
              📥 Нажали пробел за {params.jumpBufferTime}с до пола? Персонаж прыгнет сразу при касании!
            </span>
          </div>

          {/* Рывок (Dash) */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <label style={{ fontSize: '11.5px', color: '#cbd5e1' }}>
                Рывок (Dash):
              </label>
              <strong style={{ fontSize: '11.5px', color: 'var(--accent-amber)' }}>
                {params.dashSpeed} px/s ({comp.dashDistance}px за {params.dashDuration}с)
              </strong>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div>
                <span style={{ fontSize: '10px', color: 'var(--text-dim)' }}>Скорость:</span>
                <input
                  type="number"
                  className="field"
                  value={params.dashSpeed}
                  onChange={(e) => onParamChange('dashSpeed', Number(e.target.value))}
                  style={{ width: '100%', fontSize: '11.5px', padding: '3px 6px' }}
                />
              </div>
              <div>
                <span style={{ fontSize: '10px', color: 'var(--text-dim)' }}>Длительность (сек):</span>
                <input
                  type="number"
                  step="0.01"
                  className="field"
                  value={params.dashDuration}
                  onChange={(e) => onParamChange('dashDuration', Number(e.target.value))}
                  style={{ width: '100%', fontSize: '11.5px', padding: '3px 6px' }}
                />
              </div>
              <div>
                <span style={{ fontSize: '10px', color: 'var(--text-dim)' }}>Кулдаун (сек):</span>
                <input
                  type="number"
                  step="0.05"
                  className="field"
                  value={params.dashCooldown}
                  onChange={(e) => onParamChange('dashCooldown', Number(e.target.value))}
                  style={{ width: '100%', fontSize: '11.5px', padding: '3px 6px' }}
                />
              </div>
              <div>
                <span style={{ fontSize: '10px', color: 'var(--text-dim)' }}>Тайл (px):</span>
                <input
                  type="number"
                  className="field"
                  value={params.tileUnit}
                  onChange={(e) => onParamChange('tileUnit', Number(e.target.value))}
                  style={{ width: '100%', fontSize: '11.5px', padding: '3px 6px' }}
                />
              </div>
              <div>
                <span style={{ fontSize: '10px', color: 'var(--text-dim)' }}>Срез прыжка:</span>
                <input
                  type="number"
                  step="0.05"
                  min="0.1"
                  max="1"
                  className="field"
                  value={params.jumpCutMultiplier}
                  onChange={(e) => onParamChange('jumpCutMultiplier', Number(e.target.value))}
                  style={{ width: '100%', fontSize: '11.5px', padding: '3px 6px' }}
                />
              </div>
              <div>
                <span style={{ fontSize: '10px', color: 'var(--text-dim)' }}>Скольжение по стене:</span>
                <input
                  type="number"
                  className="field"
                  value={params.wallSlideSpeed}
                  onChange={(e) => onParamChange('wallSlideSpeed', Number(e.target.value))}
                  style={{ width: '100%', fontSize: '11.5px', padding: '3px 6px' }}
                />
              </div>
              <div>
                <span style={{ fontSize: '10px', color: 'var(--text-dim)' }}>Прыжок от стены X:</span>
                <input
                  type="number"
                  className="field"
                  value={params.wallJumpSpeedX}
                  onChange={(e) => onParamChange('wallJumpSpeedX', Number(e.target.value))}
                  style={{ width: '100%', fontSize: '11.5px', padding: '3px 6px' }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <PhysicsComputedReadout computed={comp} />
    </div>
  );
};
