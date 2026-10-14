export interface PlatformerPhysicsParams {
  jumpHeight: number;        // пиксели (например 52)
  timeToPeak: number;        // секунды до вершины прыжка (например 0.32)
  fallTime: number;          // секунды падения от вершины до земли (например 0.28)
  moveSpeed: number;         // горизонтальная скорость в px/s (например 160)
  accelTime: number;         // секунды до набора полной скорости (например 0.08)
  frictionTime: number;      // секунды до полной остановки при отпускании (например 0.06)
  coyoteTime: number;        // секунды после схода с платформы (например 0.12)
  jumpBufferTime: number;    // секунды буфера прыжка перед приземлением (например 0.10)
  dashSpeed: number;         // скорость рывка в px/s (например 360)
  dashDuration: number;      // длительность рывка в секундах (например 0.18)
  dashCooldown: number;      // перезарядка рывка в секундах (например 0.6)
  jumpCutMultiplier: number; // доля скорости вверх, если отпустить прыжок (например 0.5)
  wallSlideSpeed: number;    // максимальная скорость скольжения по стене, px/s
  wallJumpSpeedX: number;    // горизонтальный импульс от стены, px/s
  tileUnit: number;          // размер одного тайла в пикселях (по умолчанию 16)
}

export interface ComputedPhysics {
  jumpVelocity: number;      // начальная вертикальная скорость (отрицательная для Godot, e.g. -325 px/s)
  jumpGravity: number;       // гравитация при движении вверх (px/s^2)
  fallGravity: number;       // гравитация при падении (px/s^2)
  acceleration: number;      // ускорение бега (px/s^2)
  friction: number;          // торможение (px/s^2)
  jumpHeightTiles: number;   // высота в тайлах
  dashDistance: number;      // дистанция рывка в пикселях
}

export interface StateMachineState {
  id: string;
  name: string;
  label: string;
  description: string;
  animationName: string;
  icon: string;
  color: string;
  enabled: boolean;
  isInitial?: boolean;
  canTransitionTo: string[]; // id других состояний
}

export interface PhysicsPreset {
  id: string;
  title: string;
  description: string;
  badge: string;
  color: string;
  params: PlatformerPhysicsParams;
}
