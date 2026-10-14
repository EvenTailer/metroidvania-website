import React, { useState } from 'react';
import { STAGE_META, STAGE_SEQUENCE } from '../../entities/asset-pipeline';

export const AssetPipelineStageGuide: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      style={{
        background: 'rgba(15, 23, 42, 0.75)',
        border: '1px solid rgba(0, 242, 254, 0.25)',
        borderRadius: '10px',
        padding: '14px 16px',
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '20px' }}>💡</span>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#fff' }}>
                Шпаргалка пайплайна: Как готовить графику и звук для Godot 4
              </h4>
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  padding: '2px 7px',
                  borderRadius: '12px',
                  background: 'rgba(0, 242, 254, 0.15)',
                  color: 'var(--accent-cyan)',
                  border: '1px solid rgba(0, 242, 254, 0.3)'
                }}
              >
                UX Гид для любого уровня
              </span>
            </div>
            <p style={{ margin: '3px 0 0', fontSize: '11.5px', color: 'var(--text-muted)' }}>
              5 простых шагов от наброска на бумаге до идеальной работы в коде игры без мыла и задержек
            </p>
          </div>
        </div>

        <button
          type="button"
          className="btn btn-secondary"
          style={{
            fontSize: '11px',
            padding: '4px 10px',
            minHeight: '28px',
            display: 'flex',
            alignItems: 'center',
            gap: '5px'
          }}
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(!isOpen);
          }}
        >
          {isOpen ? 'Свернуть подсказку ▲' : 'Развернуть 5 шагов ▼'}
        </button>
      </div>

      {isOpen && (
        <div style={{ marginTop: '14px', paddingTop: '14px', borderTop: '1px solid var(--border)' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '12px'
            }}
          >
            {STAGE_SEQUENCE.map((stageKey) => {
              const meta = STAGE_META[stageKey];
              return (
                <div
                  key={stageKey}
                  style={{
                    background: 'rgba(2, 6, 23, 0.6)',
                    border: `1px solid ${meta.color}35`,
                    borderRadius: '8px',
                    padding: '10px 12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    position: 'relative'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '18px' }}>{meta.icon}</span>
                    <span
                      style={{
                        fontSize: '10px',
                        fontWeight: 800,
                        color: meta.color,
                        background: `${meta.color}15`,
                        padding: '1px 6px',
                        borderRadius: '4px'
                      }}
                    >
                      ШАГ {meta.stepNumber}
                    </span>
                  </div>

                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#fff' }}>
                    {meta.ruTitle}
                  </div>

                  <div style={{ fontSize: '11px', color: '#cbd5e1', lineHeight: '1.35' }}>
                    {meta.hint}
                  </div>

                  <div
                    style={{
                      marginTop: 'auto',
                      fontSize: '10px',
                      color: meta.color,
                      background: 'rgba(0,0,0,0.3)',
                      padding: '5px 7px',
                      borderRadius: '4px',
                      borderLeft: `2px solid ${meta.color}`
                    }}
                  >
                    <strong>Godot 4:</strong> {meta.godotTip}
                  </div>
                </div>
              );
            })}
          </div>

          <div
            style={{
              marginTop: '12px',
              padding: '8px 12px',
              background: 'rgba(0, 242, 254, 0.05)',
              borderRadius: '6px',
              border: '1px dashed rgba(0, 242, 254, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '11px',
              color: 'var(--text-muted)'
            }}
          >
            <span>
              💡 <strong>Золотое правило пиксель-арта:</strong> Всегда включайте в настройках проекта Godot:
              <code style={{ color: 'var(--accent-cyan)', marginLeft: '4px' }}>
                Rendering → Textures → Default Texture Filter: Nearest
              </code>
            </span>
            <span style={{ color: 'var(--accent-emerald)', fontWeight: 700 }}>
              Никакого мыла!
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
