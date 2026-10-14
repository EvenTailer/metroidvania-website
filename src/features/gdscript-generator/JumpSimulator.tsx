import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  calculateJumpTrajectory,
  calculatePhysics,
  PlatformerPhysicsParams
} from '../../entities/gdscript-generator';
import { isTypingTarget } from '../../shared/lib/isTypingTarget';
import { simulatorCommand, syncWalk } from './simulatorInput';

interface JumpSimulatorProps {
  params: PlatformerPhysicsParams;
}

export const JumpSimulator: React.FC<JumpSimulatorProps> = ({ params }) => {
  const comp = calculatePhysics(params);
  const trajectory = useMemo(() => calculateJumpTrajectory(params, 40), [params]);

  // Интерактивное состояние симулятора
  const [duckX, setDuckX] = useState(40);
  const [duckY, setDuckY] = useState(0); // 0 = на полу, больше 0 = в воздухе (пиксели)
  const [isJumping, setIsJumping] = useState(false);
  const [isDashing, setIsDashing] = useState(false);
  const [coyoteActive, setCoyoteActive] = useState(false);
  const [bufferActive, setBufferActive] = useState(false);
  const [hudMessage, setHudMessage] = useState<string | null>(null);

  const animFrameRef = useRef<number | null>(null);
  const simStateRef = useRef({
    y: 0,
    vy: 0,
    x: 40,
    isGrounded: true,
    coyoteTimer: 0,
    bufferTimer: 0,
    dashTimer: 0,
    dashCooldown: 0,
    leftHeld: false,
    rightHeld: false,
    walkDir: 0,
    facing: 1,
    onWall: false
  });

  // Запуск прыжка
  const releaseJump = () => {
    const s = simStateRef.current;
    if (s.vy > 0) {
      s.vy *= params.jumpCutMultiplier;
      setHudMessage('Срез прыжка: кнопка отпущена');
    }
  };

  const triggerJump = () => {
    const s = simStateRef.current;
    if (s.onWall) {
      s.onWall = false;
      s.isGrounded = false;
      s.vy = Math.abs(comp.jumpVelocity);
      s.x = Math.max(40, s.x - 36);
      setIsJumping(true);
      setHudMessage('Прыжок от стены');
      return;
    }
    if (s.isGrounded || s.coyoteTimer > 0) {
      if (!s.isGrounded && s.coyoteTimer > 0) {
        setCoyoteActive(true);
        setHudMessage('🐺 Сработал Coyote Time! Прыжок с воздуха!');
        setTimeout(() => setCoyoteActive(false), 900);
      } else {
        setHudMessage('🚀 Прыжок!');
      }
      s.vy = Math.abs(comp.jumpVelocity); // вверх
      s.isGrounded = false;
      s.coyoteTimer = 0;
      s.bufferTimer = 0;
      setIsJumping(true);
    } else {
      // Игрок в воздухе нажал прыжок -> активируем Jump Buffer
      s.bufferTimer = params.jumpBufferTime;
      setBufferActive(true);
      setHudMessage(`📥 Jump Buffer активирован! (${params.jumpBufferTime}с)`);
      setTimeout(() => setBufferActive(false), params.jumpBufferTime * 1000);
    }
  };

  // Запуск рывка
  const triggerDash = () => {
    const s = simStateRef.current;
    if (s.dashCooldown > 0) {
      setHudMessage(`Рывок на перезарядке (${s.dashCooldown.toFixed(2)}с)`);
      return;
    }
    if (s.dashTimer <= 0) {
      s.dashTimer = params.dashDuration;
      setIsDashing(true);
      setHudMessage(`⚡ Реактивный рывок Dash! (${params.dashSpeed} px/s)`);
      setTimeout(() => {
        setIsDashing(false);
      }, params.dashDuration * 1000);
    }
  };

  // Анимационный цикл физики в реальном времени
  useEffect(() => {
    let lastTime = performance.now();

    const loop = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.05);
      lastTime = time;
      const s = simStateRef.current;

      // Обновление таймеров
      if (s.bufferTimer > 0) s.bufferTimer = Math.max(0, s.bufferTimer - dt);
      if (s.coyoteTimer > 0) s.coyoteTimer = Math.max(0, s.coyoteTimer - dt);
      if (s.dashCooldown > 0) s.dashCooldown = Math.max(0, s.dashCooldown - dt);
      const overFloor = s.x < 120 || s.x > 400;

      if (s.dashTimer > 0) {
        s.dashTimer = Math.max(0, s.dashTimer - dt);
        s.onWall = false;
        s.x += params.dashSpeed * dt * 0.25 * s.facing;
        if (s.dashTimer <= 0) s.dashCooldown = params.dashCooldown;
      } else if (!s.isGrounded) {
        const gravity = s.vy > 0 ? comp.jumpGravity : comp.fallGravity;
        s.vy -= gravity * dt;
        if (s.onWall && s.vy < 0) s.vy = Math.max(s.vy, -params.wallSlideSpeed);
        s.y += s.vy * dt;
        if (s.walkDir !== 0) s.x += params.moveSpeed * dt * 0.2 * s.walkDir;
        if (s.y > 0 && s.x >= 500) {
          s.x = 500;
          s.onWall = true;
        }
        if (s.y <= 0 && overFloor) {
          s.y = 0;
          s.vy = 0;
          s.isGrounded = true;
          s.onWall = false;
          setIsJumping(false);
          if (s.bufferTimer > 0) {
            setHudMessage('Jump Buffer сработал при касании земли');
            s.vy = Math.abs(comp.jumpVelocity);
            s.isGrounded = false;
            s.bufferTimer = 0;
            setIsJumping(true);
          }
        } else if (s.y < -140) {
          s.x = 40;
          s.y = 0;
          s.vy = 0;
          s.isGrounded = true;
          s.onWall = false;
          setIsJumping(false);
          setHudMessage('Яма. Возврат на платформу');
        }
      } else if (s.walkDir !== 0) {
        s.x += params.moveSpeed * dt * 0.25 * s.walkDir;
        if (s.x >= 120 && s.x < 400) {
          s.isGrounded = false;
          s.y = 1;
          s.coyoteTimer = params.coyoteTime;
          setHudMessage('Край платформы. Coyote Time пошёл');
        }
      }

      if (s.x < 40) s.x = 40;
      if (s.x > 540) s.x = 540;
      setDuckY(Math.round(s.y));
      setDuckX(Math.round(s.x));

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [comp, params]);

  // Слушатель пробела и Shift
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isTypingTarget(e.target) || document.querySelector('[data-hub-dialog="open"]')) return;
      const command = simulatorCommand(e.code, 'down');
      if (!command) return;
      const state = simStateRef.current;
      if (command === 'jump') {
        e.preventDefault();
        triggerJump();
      } else if (command === 'dash') {
        e.preventDefault();
        triggerDash();
      } else if (command === 'left-down') {
        state.leftHeld = true;
        syncWalk(state);
      } else if (command === 'right-down') {
        state.rightHeld = true;
        syncWalk(state);
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      const command = simulatorCommand(e.code, 'up');
      const state = simStateRef.current;
      if (command === 'release-jump') releaseJump();
      else if (command === 'left-up') {
        state.leftHeld = false;
        syncWalk(state);
      } else if (command === 'right-up') {
        state.rightHeld = false;
        syncWalk(state);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [comp, params]);

  const maxTrajectoryX = trajectory[trajectory.length - 1]?.x || 100;
  const svgWidth = 560;
  const svgHeight = 160;
  const groundY = 135;
  const scaleY = Math.min(1.4, 90 / Math.max(20, params.jumpHeight));
  const scaleX = Math.min(2.5, (svgWidth - 80) / Math.max(40, maxTrajectoryX));

  const pathData = useMemo(() => {
    if (trajectory.length === 0) return '';
    return trajectory
      .map((pt, i) => {
        const sx = 40 + pt.x * scaleX;
        const sy = groundY - pt.y * scaleY;
        return `${i === 0 ? 'M' : 'L'} ${sx.toFixed(1)} ${sy.toFixed(1)}`;
      })
      .join(' ');
  }, [trajectory, scaleX, scaleY]);

  return (
    <div
      style={{
        background: 'rgba(11, 16, 28, 0.95)',
        border: '1px solid rgba(0, 242, 254, 0.3)',
        borderRadius: '12px',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.4)'
      }}
    >
      {/* Верхняя плашка симулятора */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '20px' }}>🎮</span>
          <div>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#fff' }}>
              Интерактивный симулятор физики и параболы
            </h3>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              A/D или стрелки — ход, Space — прыжок, Shift — рывок. Сход с края включает Coyote Time.
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            className="btn btn-cyan"
            onMouseDown={triggerJump}
            onMouseUp={releaseJump}
            style={{ fontWeight: 700, fontSize: '12px', padding: '6px 14px' }}
          >
            🚀 Прыгнуть (Space)
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onMouseDown={() => { simStateRef.current.leftHeld = true; syncWalk(simStateRef.current); }}
            onMouseUp={() => { simStateRef.current.leftHeld = false; syncWalk(simStateRef.current); }}
            onMouseLeave={() => { simStateRef.current.leftHeld = false; syncWalk(simStateRef.current); }}
            style={{ fontWeight: 700, fontSize: '12px', padding: '6px 12px' }}
          >
            ⬅️ A
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onMouseDown={() => { simStateRef.current.rightHeld = true; syncWalk(simStateRef.current); }}
            onMouseUp={() => { simStateRef.current.rightHeld = false; syncWalk(simStateRef.current); }}
            onMouseLeave={() => { simStateRef.current.rightHeld = false; syncWalk(simStateRef.current); }}
            style={{ fontWeight: 700, fontSize: '12px', padding: '6px 12px' }}
          >
            D ➡️
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={triggerDash}
            style={{ fontWeight: 700, fontSize: '12px', padding: '6px 12px' }}
          >
            ⚡ Рывок (Shift)
          </button>
        </div>
      </div>

      {/* Индикаторы срабатывания Game Feel */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minHeight: '28px' }}>
        {coyoteActive && (
          <span
            style={{
              fontSize: '11px',
              fontWeight: 800,
              padding: '3px 10px',
              borderRadius: '20px',
              background: 'rgba(16, 185, 129, 0.2)',
              color: 'var(--accent-emerald)',
              border: '1px solid var(--accent-emerald)'
            }}
          >
            🐺 Coyote Time Сработал!
          </span>
        )}

        {bufferActive && (
          <span
            style={{
              fontSize: '11px',
              fontWeight: 800,
              padding: '3px 10px',
              borderRadius: '20px',
              background: 'rgba(0, 242, 254, 0.2)',
              color: 'var(--accent-cyan)',
              border: '1px solid var(--accent-cyan)'
            }}
          >
            📥 Jump Buffer активен (прыгнет на земле)
          </span>
        )}

        {hudMessage && (
          <span style={{ fontSize: '11.5px', color: '#e2e8f0', marginLeft: 'auto' }}>
            {hudMessage}
          </span>
        )}
      </div>

      {/* SVG Траектория и Интерактивная сцена */}
      <div
        style={{
          background: 'radial-gradient(ellipse at 50% 100%, rgba(0, 242, 254, 0.08), rgba(2, 6, 23, 0.95))',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '8px',
          overflow: 'hidden',
          position: 'relative'
        }}
      >
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          style={{ width: '100%', height: '180px', display: 'block' }}
        >
          {/* Сетка тайлов 16px */}
          <defs>
            <pattern id="grid16" width="32" height="32" patternUnits="userSpaceOnUse">
              <path d="M 32 0 L 0 0 0 32" fill="none" stroke="rgba(255, 255, 255, 0.04)" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid16)" />

          {/* Линия земли */}
          <line
            x1="0"
            y1={groundY}
            x2={svgWidth}
            y2={groundY}
            stroke="var(--accent-cyan)"
            strokeWidth="2"
            strokeDasharray="4 2"
          />

          {/* Платформа слева (для наглядности схода с уступа Coyote Time) */}
          <rect x="0" y={groundY} width="120" height="25" fill="rgba(0, 242, 254, 0.2)" stroke="var(--accent-cyan)" strokeWidth="1" />
          <rect x="400" y={groundY} width="160" height="25" fill="rgba(0, 242, 254, 0.12)" stroke="var(--accent-cyan)" strokeWidth="1" />
          <rect x="520" y={40} width="14" height={groundY - 40} fill="rgba(251, 191, 36, 0.35)" stroke="#fbbf24" strokeWidth="1" />
          <text x="10" y={groundY + 16} fill="var(--accent-cyan)" fontSize="10" fontWeight="bold">
            Платформа 1
          </text>

          {/* Линия максимальной высоты прыжка */}
          <line
            x1="40"
            y1={groundY - params.jumpHeight * scaleY}
            x2={svgWidth - 20}
            y2={groundY - params.jumpHeight * scaleY}
            stroke="rgba(168, 85, 247, 0.5)"
            strokeWidth="1"
            strokeDasharray="3 3"
          />
          <text
            x={svgWidth - 140}
            y={groundY - params.jumpHeight * scaleY - 6}
            fill="var(--accent-purple)"
            fontSize="10"
            fontWeight="bold"
          >
            Пик: {params.jumpHeight}px ({comp.jumpHeightTiles} тайла)
          </text>

          {/* Траектория параболы */}
          <path
            d={pathData}
            fill="none"
            stroke="var(--accent-cyan)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Интерактивный спрайт Утки */}
          <g transform={`translate(${duckX}, ${groundY - duckY * scaleY - 20})`}>
            {/* Тень на земле */}
            <ellipse
              cx="12"
              cy={duckY * scaleY + 20}
              rx={Math.max(4, 12 - duckY * 0.15)}
              ry="3"
              fill="rgba(0, 242, 254, 0.3)"
            />

            {/* Корпус персонажа */}
            <circle
              cx="12"
              cy="10"
              r="12"
              fill={isDashing ? '#fbbf24' : isJumping ? '#00f2fe' : '#a855f7'}
              stroke="#fff"
              strokeWidth="1.5"
            />
            {/* Клюв утки */}
            <polygon
              points="20,8 28,12 20,16"
              fill="#f59e0b"
            />
            {/* Глаз */}
            <circle cx="16" cy="7" r="2" fill="#020617" />
            <circle cx="17" cy="6" r="0.8" fill="#fff" />
          </g>
        </svg>

        {/* Индикатор высоты в реальном времени */}
        <div
          style={{
            position: 'absolute',
            bottom: '10px',
            right: '12px',
            background: 'rgba(2, 6, 23, 0.85)',
            border: '1px solid var(--border)',
            borderRadius: '6px',
            padding: '4px 10px',
            fontSize: '11px',
            color: 'var(--text-muted)'
          }}
        >
          Текущая высота: <strong style={{ color: 'var(--accent-cyan)' }}>{duckY} px</strong> (Y={duckY})
        </div>
      </div>
    </div>
  );
};
