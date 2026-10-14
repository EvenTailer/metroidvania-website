import { PhysicsPreset, PlatformerPhysicsParams, StateMachineState } from './types';

export const PHYSICS_PRESETS: PhysicsPreset[] = [
  {
    id: 'cyber-duck',
    title: 'Кибер-Утка (Оптимальный)',
    description: 'Идеальный баланс резкости и контроля для 2D-метроидвании',
    badge: '★ Рекомендуемый',
    color: '#00f2fe',
    params: {
      jumpHeight: 52,
      timeToPeak: 0.32,
      fallTime: 0.26,
      moveSpeed: 175,
      accelTime: 0.08,
      frictionTime: 0.06,
      coyoteTime: 0.12,
      jumpBufferTime: 0.10,
      dashSpeed: 380,
      dashDuration: 0.18,
      dashCooldown: 0.55,
      jumpCutMultiplier: 0.5,
      wallSlideSpeed: 50,
      wallJumpSpeedX: 210,
      tileUnit: 16
    }
  },
  {
    id: 'celeste',
    title: 'Селеста / Мгновенный отклик',
    description: 'Сверхточный прыжок с резким падением и длинным буфером ввода',
    badge: 'Точный платформер',
    color: '#a855f7',
    params: {
      jumpHeight: 48,
      timeToPeak: 0.28,
      fallTime: 0.22,
      moveSpeed: 190,
      accelTime: 0.04,
      frictionTime: 0.03,
      coyoteTime: 0.15,
      jumpBufferTime: 0.12,
      dashSpeed: 440,
      dashDuration: 0.15,
      dashCooldown: 0.40,
      jumpCutMultiplier: 0.4,
      wallSlideSpeed: 30,
      wallJumpSpeedX: 260,
      tileUnit: 16
    }
  },
  {
    id: 'hollow-knight',
    title: 'Hollow Knight / Соулс',
    description: 'Высокая дуга прыжка, мягкий апекс и стремительный спуск',
    badge: 'Метроидвания',
    color: '#38bdf8',
    params: {
      jumpHeight: 64,
      timeToPeak: 0.36,
      fallTime: 0.28,
      moveSpeed: 160,
      accelTime: 0.06,
      frictionTime: 0.05,
      coyoteTime: 0.10,
      jumpBufferTime: 0.09,
      dashSpeed: 360,
      dashDuration: 0.20,
      dashCooldown: 0.60,
      jumpCutMultiplier: 0.55,
      wallSlideSpeed: 70,
      wallJumpSpeedX: 180,
      tileUnit: 16
    }
  },
  {
    id: 'heavy-mech',
    title: 'Тяжелый Мех / Дроид',
    description: 'Ощутимая масса, инерция разгона и сокрушительное падение',
    badge: 'Тяжеловес',
    color: '#f59e0b',
    params: {
      jumpHeight: 40,
      timeToPeak: 0.40,
      fallTime: 0.24,
      moveSpeed: 130,
      accelTime: 0.18,
      frictionTime: 0.14,
      coyoteTime: 0.08,
      jumpBufferTime: 0.08,
      dashSpeed: 290,
      dashDuration: 0.22,
      dashCooldown: 0.90,
      jumpCutMultiplier: 0.7,
      wallSlideSpeed: 90,
      wallJumpSpeedX: 140,
      tileUnit: 16
    }
  },
  {
    id: 'moon-gravity',
    title: 'Лунная гравитация',
    description: 'Мягкий парящий прыжок с низкой гравитацией для исследования космоса',
    badge: 'Низкая гравитация',
    color: '#10b981',
    params: {
      jumpHeight: 80,
      timeToPeak: 0.55,
      fallTime: 0.50,
      moveSpeed: 150,
      accelTime: 0.12,
      frictionTime: 0.10,
      coyoteTime: 0.16,
      jumpBufferTime: 0.14,
      dashSpeed: 330,
      dashDuration: 0.22,
      dashCooldown: 0.70,
      jumpCutMultiplier: 0.65,
      wallSlideSpeed: 20,
      wallJumpSpeedX: 160,
      tileUnit: 16
    }
  }
];

export const DEFAULT_PHYSICS_PARAMS: PlatformerPhysicsParams = PHYSICS_PRESETS[0].params;

export const DEFAULT_STATE_MACHINE_STATES: StateMachineState[] = [
  {
    id: 'idle',
    name: 'Idle',
    label: 'Покой',
    description: 'Персонаж стоит на земле, дышит и ждет команды управления',
    animationName: 'idle',
    icon: '🧍',
    color: '#94a3b8',
    enabled: true,
    isInitial: true,
    canTransitionTo: ['run', 'jump', 'fall', 'dash', 'parry', 'hurt']
  },
  {
    id: 'run',
    name: 'Run',
    label: 'Бег',
    description: 'Движение по горизонтали с разгоном и проверкой наклонов пола',
    animationName: 'run',
    icon: '🏃',
    color: '#38bdf8',
    enabled: true,
    canTransitionTo: ['idle', 'jump', 'fall', 'dash', 'parry', 'hurt']
  },
  {
    id: 'jump',
    name: 'Jump',
    label: 'Прыжок',
    description: 'Вертикальный взлет при нажатии Space/A с импульсом скорости v0',
    animationName: 'jump',
    icon: '🚀',
    color: '#00f2fe',
    enabled: true,
    canTransitionTo: ['fall', 'dash', 'parry', 'hurt']
  },
  {
    id: 'fall',
    name: 'Fall',
    label: 'Падение',
    description: 'Движение вниз под действием увеличенной гравитации падения',
    animationName: 'fall',
    icon: '🪂',
    color: '#a855f7',
    enabled: true,
    canTransitionTo: ['idle', 'run', 'jump', 'dash', 'parry', 'hurt']
  },
  {
    id: 'dash',
    name: 'Dash',
    label: 'Рывок',
    description: 'Горизонтальный реактивный рывок сквозь лазеры с неуязвимостью (i-frames)',
    animationName: 'dash',
    icon: '⚡',
    color: '#fbbf24',
    enabled: true,
    canTransitionTo: ['idle', 'run', 'fall', 'hurt']
  },
  {
    id: 'parry',
    name: 'Parry',
    label: 'Парирование',
    description: 'Активация кибер-щита в окне 0.15 сек для отражения вражеских снарядов',
    animationName: 'parry',
    icon: '🛡️',
    color: '#10b981',
    enabled: true,
    canTransitionTo: ['idle', 'run', 'hurt']
  },
  {
    id: 'hurt',
    name: 'Hurt',
    label: 'Урон',
    description: 'Отдача и потеря контроля при получении ранения, проверка на гибель',
    animationName: 'hurt',
    icon: '💥',
    color: '#f43f5e',
    enabled: true,
    canTransitionTo: ['idle', 'fall', 'dead']
  },
  {
    id: 'dead',
    name: 'Dead',
    label: 'Гибель',
    description: 'Конечное состояние: отключение ввода, воспроизведение эффекта гибели и респаун',
    animationName: 'dead',
    icon: '💀',
    color: '#64748b',
    enabled: true,
    canTransitionTo: ['idle']
  }
];
