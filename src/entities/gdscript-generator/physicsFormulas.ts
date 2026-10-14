import { ComputedPhysics, PlatformerPhysicsParams } from './types';

export function calculatePhysics(params: PlatformerPhysicsParams): ComputedPhysics {
  const h = Math.max(1, params.jumpHeight);
  const tPeak = Math.max(0.05, params.timeToPeak);
  const tFall = Math.max(0.05, params.fallTime);
  const moveSpeed = Math.max(1, params.moveSpeed);
  const tAccel = Math.max(0.01, params.accelTime);
  const tFric = Math.max(0.01, params.frictionTime);
  const tileUnit = Math.max(1, params.tileUnit);

  // v0 = -2h / t_peak (отрицательная скорость, т.к. в Godot ось Y направлена вниз)
  const jumpVelocity = -Math.round((2 * h) / tPeak);

  // g_up = 2h / (t_peak^2)
  const jumpGravity = Math.round((2 * h) / (tPeak * tPeak));

  // g_down = 2h / (t_fall^2)
  const fallGravity = Math.round((2 * h) / (tFall * tFall));

  // a = v_max / t_accel
  const acceleration = Math.round(moveSpeed / tAccel);

  // friction = v_max / t_fric
  const friction = Math.round(moveSpeed / tFric);

  const jumpHeightTiles = Number((h / tileUnit).toFixed(1));
  const dashDistance = Math.round(params.dashSpeed * params.dashDuration);

  return {
    jumpVelocity,
    jumpGravity,
    fallGravity,
    acceleration,
    friction,
    jumpHeightTiles,
    dashDistance
  };
}

/**
 * Вычисляет точки траектории прыжка для отображения на графике (x, y от 0 до totalTime)
 */
export function calculateJumpTrajectory(
  params: PlatformerPhysicsParams,
  steps: number = 30
): Array<{ t: number; x: number; y: number }> {
  const { jumpVelocity, jumpGravity, fallGravity } = calculatePhysics(params);
  const totalTime = params.timeToPeak + params.fallTime;
  const points: Array<{ t: number; x: number; y: number }> = [];

  for (let i = 0; i <= steps; i++) {
    const t = (totalTime * i) / steps;
    const x = params.moveSpeed * t;
    let y = 0;

    if (t <= params.timeToPeak) {
      // Подъем: y(t) = - (v0*t + 0.5*g_up*t^2)
      // Берем по модулю вверх для графика
      const vert = jumpVelocity * t + 0.5 * jumpGravity * t * t;
      y = -vert;
    } else {
      // Спуск от вершины:
      const dt = t - params.timeToPeak;
      const vert = 0.5 * fallGravity * dt * dt;
      y = params.jumpHeight - vert;
    }

    points.push({
      t: Number(t.toFixed(2)),
      x: Math.round(x),
      y: Math.max(0, Math.round(y))
    });
  }

  return points;
}
