import React from 'react';
import { ComputedPhysics } from '../../entities/gdscript-generator';

export const PhysicsComputedReadout: React.FC<{ computed: ComputedPhysics }> = ({ computed }) => (
  <div
    style={{
      background: 'rgba(2, 6, 23, 0.7)',
      border: '1px solid rgba(0, 242, 254, 0.25)',
      borderRadius: '10px',
      padding: '14px',
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
      gap: '10px'
    }}
  >
    <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '10px', borderRadius: '6px' }}>
      <div style={{ fontSize: '10.5px', color: 'var(--text-dim)' }}>Скорость прыжка v0:</div>
      <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--accent-cyan)' }}>
        {computed.jumpVelocity} px/s
      </div>
      <div style={{ fontSize: '9.5px', color: 'var(--text-muted)' }}>В Godot: минус по оси Y</div>
    </div>
    <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '10px', borderRadius: '6px' }}>
      <div style={{ fontSize: '10.5px', color: 'var(--text-dim)' }}>Гравитация взлета (g_up):</div>
      <div style={{ fontSize: '16px', fontWeight: 800, color: '#fff' }}>
        {computed.jumpGravity} px/s²
      </div>
      <div style={{ fontSize: '9.5px', color: 'var(--text-muted)' }}>2h / t_peak²</div>
    </div>
    <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '10px', borderRadius: '6px' }}>
      <div style={{ fontSize: '10.5px', color: 'var(--text-dim)' }}>Гравитация падения (g_down):</div>
      <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--accent-amber)' }}>
        {computed.fallGravity} px/s²
      </div>
      <div style={{ fontSize: '9.5px', color: 'var(--text-muted)' }}>
        {Number((computed.fallGravity / computed.jumpGravity).toFixed(1))}x от взлета
      </div>
    </div>
    <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '10px', borderRadius: '6px' }}>
      <div style={{ fontSize: '10.5px', color: 'var(--text-dim)' }}>Ускорение разгона:</div>
      <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--accent-purple)' }}>
        {computed.acceleration} px/s²
      </div>
      <div style={{ fontSize: '9.5px', color: 'var(--text-muted)' }}>move_speed / t_accel</div>
    </div>
    <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '10px', borderRadius: '6px' }}>
      <div style={{ fontSize: '10.5px', color: 'var(--text-dim)' }}>Сила торможения:</div>
      <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--accent-rose)' }}>
        {computed.friction} px/s²
      </div>
      <div style={{ fontSize: '9.5px', color: 'var(--text-muted)' }}>move_speed / t_fric</div>
    </div>
  </div>
);
