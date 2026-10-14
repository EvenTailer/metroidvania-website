import { gdEnumName, gdFloat, gdString, stateRole, StateRole } from './gdFormat';
import { calculatePhysics } from './physicsFormulas';
import { PlatformerPhysicsParams, StateMachineState } from './types';

interface BoundState {
  state: StateMachineState;
  enumName: string;
  role: StateRole;
}

function bindStates(states: StateMachineState[]): BoundState[] {
  const used = new Set<string>();
  return states.filter(item => item.enabled).map(state => {
    let enumName = gdEnumName(state);
    while (used.has(enumName)) enumName = `${enumName}_2`;
    used.add(enumName);
    return { state, enumName, role: stateRole(state) };
  });
}

function findRole(bindings: BoundState[], role: StateRole): BoundState | undefined {
  return bindings.find(item => item.role === role);
}

function bodyFor(role: StateRole): string {
  switch (role) {
    case 'idle':
      return '\tvelocity.x = move_toward(velocity.x, 0.0, friction * delta)\n\t_try_jump()';
    case 'run':
      return `\tvar input_dir: float = Input.get_axis("ui_left", "ui_right")
\tif input_dir != 0.0:
\t\tvelocity.x = move_toward(velocity.x, input_dir * move_speed, acceleration * delta)
\t\t_update_facing(input_dir)
\telse:
\t\tvelocity.x = move_toward(velocity.x, 0.0, friction * delta)
\t_try_jump()`;
    case 'jump':
      return '\tvelocity.y += jump_gravity * delta\n\t_apply_jump_cut()\n\t_apply_air_steering(delta)\n\t_try_wall_jump()';
    case 'fall':
      return '\tvelocity.y += fall_gravity * delta\n\t_apply_air_steering(delta)\n\t_try_jump()\n\t_try_wall_slide()';
    case 'wall':
      return '\t_try_wall_slide()\n\t_try_wall_jump()';
    case 'dash':
      return `\tvelocity = dash_direction * dash_speed
\tif dash_timer <= 0.0:
\t\t_leave_dash()`;
    case 'parry':
      return '\tvelocity.x = move_toward(velocity.x, 0.0, friction * delta)';
    case 'hurt':
      return '\tvelocity.y += fall_gravity * delta';
    case 'dead':
      return '\tvelocity.x = move_toward(velocity.x, 0.0, friction * delta)\n\tvelocity.y += fall_gravity * delta';
    default:
      return '\tvelocity.y += fall_gravity * delta\n\t_apply_air_steering(delta)\n\t_try_jump()';
  }
}

function canEnterFn(bindings: BoundState[]): string {
  const branches = bindings.map(item => {
    const targets = item.state.canTransitionTo
      .map(id => bindings.find(other => other.state.id === id))
      .filter((other): other is BoundState => Boolean(other));
    const expr = targets.length === 0
      ? 'false'
      : targets.map(target => `target == State.${target.enumName}`).join(' or ');
    return `\t\tState.${item.enumName}:\n\t\t\treturn ${expr}`;
  }).join('\n');
  return `func _can_enter(target: State) -> bool:
\tmatch current_state:
${branches}
\t\t_:
\t\t\treturn false`;
}

function transitionFn(bindings: BoundState[]): string {
  const jump = findRole(bindings, 'jump');
  const fall = findRole(bindings, 'fall');
  const run = findRole(bindings, 'run');
  const idle = findRole(bindings, 'idle');
  const wall = findRole(bindings, 'wall');
  const locked = bindings.filter(item => item.role === 'dash' || item.role === 'dead' || item.role === 'hurt');
  const lines = ['func _check_state_transitions() -> void:'];
  if (locked.length > 0) {
    lines.push(`\tif ${locked.map(item => `current_state == State.${item.enumName}`).join(' or ')}:`);
    lines.push('\t\treturn');
  }
  lines.push('\tvar input_dir: float = Input.get_axis("ui_left", "ui_right")');
  lines.push('\tif not is_on_floor():');
  if (wall) {
    lines.push('\t\tif is_on_wall() and input_dir != 0.0 and _can_enter(State.' + wall.enumName + '):');
    lines.push('\t\t\tchange_state(State.' + wall.enumName + ')');
    lines.push('\t\t\treturn');
  }
  if (jump) {
    lines.push(`\t\tif velocity.y < 0.0 and current_state != State.${jump.enumName} and _can_enter(State.${jump.enumName}):`);
    lines.push(`\t\t\tchange_state(State.${jump.enumName})`);
  }
  if (fall) {
    const kw = jump ? 'elif' : 'if';
    lines.push(`\t\t${kw} velocity.y >= 0.0 and current_state != State.${fall.enumName} and _can_enter(State.${fall.enumName}):`);
    lines.push(`\t\t\tchange_state(State.${fall.enumName})`);
  }
  lines.push('\telse:');
  if (run) {
    lines.push(`\t\tif abs(velocity.x) > 10.0 and input_dir != 0.0 and current_state != State.${run.enumName} and _can_enter(State.${run.enumName}):`);
    lines.push(`\t\t\tchange_state(State.${run.enumName})`);
  }
  if (idle) {
    const kw = run ? 'elif' : 'if';
    lines.push(`\t\t${kw} current_state != State.${idle.enumName} and _can_enter(State.${idle.enumName}):`);
    lines.push(`\t\t\tchange_state(State.${idle.enumName})`);
  }
  return lines.join('\n');
}

function leaveDashFn(bindings: BoundState[]): string {
  const order: StateRole[] = ['fall', 'idle', 'run'];
  const lines = ['func _leave_dash() -> void:'];
  order.forEach((role, index) => {
    const target = findRole(bindings, role);
    if (!target) return;
    const guard = role === 'fall' ? 'not is_on_floor() and ' : role === 'idle' ? 'is_on_floor() and ' : '';
    const kw = index === 0 || lines.length === 1 ? 'if' : 'elif';
    lines.push(`\t${kw} ${guard}_can_enter(State.${target.enumName}):`);
    lines.push(`\t\tchange_state(State.${target.enumName})`);
  });
  if (lines.length === 1) lines.push('\tpass');
  return lines.join('\n');
}

export function generatePlayerControllerGd(
  params: PlatformerPhysicsParams,
  states: StateMachineState[]
): string {
  const comp = calculatePhysics(params);
  const bindings = bindStates(states);
  const initial = bindings.find(item => item.state.isInitial) ?? bindings[0];
  const enumNames = bindings.map(item => item.enumName).join(', ') || 'NONE';
  const initialName = initial?.enumName ?? 'NONE';
  const jump = findRole(bindings, 'jump');
  const dash = findRole(bindings, 'dash');
  const blocks = bindings.filter(item => item.role === 'dead' || item.role === 'hurt');

  const matchArms = bindings.map(item =>
    `\t\tState.${item.enumName}:\n\t\t\t_physics_${item.enumName.toLowerCase()}(delta)`
  ).join('\n');
  const physicsFns = bindings.map(item =>
    `func _physics_${item.enumName.toLowerCase()}(delta: float) -> void:\n${bodyFor(item.role)}`
  ).join('\n\n');
  const animArms = bindings.map(item =>
    `\t\tState.${item.enumName}: sprite.play(${gdString(item.state.animationName || item.enumName.toLowerCase())})`
  ).join('\n');

  const inputGuard = blocks.length === 0
    ? 'func _blocks_input() -> bool:\n\treturn false'
    : `func _blocks_input() -> bool:\n\treturn ${blocks.map(item => `current_state == State.${item.enumName}`).join(' or ')}`;

  const dashCall = dash
    ? `\tif (Input.is_action_just_pressed("dash") or Input.is_key_pressed(KEY_SHIFT)) and dash_cooldown_timer <= 0.0 and current_state != State.${dash.enumName}:\n\t\t_start_dash()`
    : '';

  const jumpChange = jump
    ? `\t\tif _can_enter(State.${jump.enumName}):\n\t\t\tchange_state(State.${jump.enumName})\n`
    : '';

  return `# ==============================================================================
# PlayerController.gd — 2D Контроллер персонажа для Godot 4.3
# Сгенерировано в Cyber-Duck Hub. Ветки match совпадают с включёнными состояниями.
# ==============================================================================
class_name PlayerController
extends CharacterBody2D

enum State { ${enumNames} }

@export_group("Движение по горизонтали")
@export var move_speed: float = ${gdFloat(params.moveSpeed)}
@export var acceleration: float = ${gdFloat(comp.acceleration)}
@export var friction: float = ${gdFloat(comp.friction)}

@export_group("Прыжок и Гравитация")
@export var jump_height_px: float = ${gdFloat(params.jumpHeight)}
@export var jump_velocity: float = ${gdFloat(comp.jumpVelocity)}
@export var jump_gravity: float = ${gdFloat(comp.jumpGravity)}
@export var fall_gravity: float = ${gdFloat(comp.fallGravity)}
@export var jump_cut_multiplier: float = ${gdFloat(params.jumpCutMultiplier)}

@export_group("Игровые ощущения (Game Feel)")
@export var coyote_time: float = ${gdFloat(params.coyoteTime)}
@export var jump_buffer_time: float = ${gdFloat(params.jumpBufferTime)}

@export_group("Рывок (Dash)")
@export var dash_speed: float = ${gdFloat(params.dashSpeed)}
@export var dash_duration: float = ${gdFloat(params.dashDuration)}
@export var dash_cooldown: float = ${gdFloat(params.dashCooldown)}

@export_group("Стена")
@export var wall_slide_speed: float = ${gdFloat(params.wallSlideSpeed)}
@export var wall_jump_speed_x: float = ${gdFloat(params.wallJumpSpeedX)}

var current_state: State = State.${initialName}
var coyote_timer: float = 0.0
var jump_buffer_timer: float = 0.0
var dash_timer: float = 0.0
var dash_cooldown_timer: float = 0.0
var dash_direction: Vector2 = Vector2.RIGHT
var is_facing_right: bool = true

@onready var sprite: AnimatedSprite2D = $AnimatedSprite2D

func _physics_process(delta: float) -> void:
\t_update_timers(delta)
\t_handle_input()
\tmatch current_state:
${matchArms || '\t\t_: pass'}
\tmove_and_slide()
\t_check_state_transitions()

func _update_timers(delta: float) -> void:
\tif is_on_floor():
\t\tcoyote_timer = coyote_time
\telse:
\t\tcoyote_timer = max(0.0, coyote_timer - delta)
\tif jump_buffer_timer > 0.0:
\t\tjump_buffer_timer = max(0.0, jump_buffer_timer - delta)
\tif dash_timer > 0.0:
\t\tdash_timer = max(0.0, dash_timer - delta)
\tif dash_cooldown_timer > 0.0:
\t\tdash_cooldown_timer = max(0.0, dash_cooldown_timer - delta)

${inputGuard}

func _handle_input() -> void:
\tif _blocks_input():
\t\treturn
\tif Input.is_action_just_pressed("ui_accept") or Input.is_action_just_pressed("jump"):
\t\tjump_buffer_timer = jump_buffer_time
\tif (Input.is_action_just_released("ui_accept") or Input.is_action_just_released("jump")) and velocity.y < 0.0:
\t\tvelocity.y *= jump_cut_multiplier
${dashCall}

${physicsFns}

${canEnterFn(bindings)}

${transitionFn(bindings)}

func change_state(new_state: State) -> void:
\tif current_state == new_state or not _can_enter(new_state):
\t\treturn
\tcurrent_state = new_state
\t_play_animation_for_state(new_state)

func _play_animation_for_state(state: State) -> void:
\tif not sprite:
\t\treturn
\tmatch state:
${animArms || '\t\t_: pass'}

func _try_jump() -> bool:
\tif jump_buffer_timer > 0.0 and (coyote_timer > 0.0 or is_on_floor()):
\t\tvelocity.y = jump_velocity
\t\tjump_buffer_timer = 0.0
\t\tcoyote_timer = 0.0
${jumpChange}\t\treturn true
\treturn false

func _apply_jump_cut() -> void:
\tif velocity.y < 0.0 and not Input.is_action_pressed("jump") and not Input.is_action_pressed("ui_accept"):
\t\tvelocity.y *= jump_cut_multiplier

func _try_wall_slide() -> void:
\tif is_on_floor() or not is_on_wall():
\t\treturn
\tif velocity.y > wall_slide_speed:
\t\tvelocity.y = wall_slide_speed

func _try_wall_jump() -> bool:
\tif is_on_floor() or not is_on_wall() or jump_buffer_timer <= 0.0:
\t\treturn false
\tvar away: float = -sign(get_wall_normal().x)
\tif away == 0.0:
\t\taway = -1.0 if is_facing_right else 1.0
\tvelocity.x = away * wall_jump_speed_x
\tvelocity.y = jump_velocity
\tjump_buffer_timer = 0.0
\t_update_facing(away)
${jumpChange}\treturn true

func _start_dash() -> void:
${dash ? `\tif not _can_enter(State.${dash.enumName}):\n\t\treturn` : '\treturn'}
\tvar input_dir: float = Input.get_axis("ui_left", "ui_right")
\tif input_dir != 0.0:
\t\tdash_direction = Vector2(sign(input_dir), 0.0)
\telse:
\t\tdash_direction = Vector2.RIGHT if is_facing_right else Vector2.LEFT
\tdash_timer = dash_duration
\tdash_cooldown_timer = dash_cooldown
${dash ? `\tchange_state(State.${dash.enumName})` : ''}

${leaveDashFn(bindings)}

func _apply_air_steering(delta: float) -> void:
\tvar input_dir: float = Input.get_axis("ui_left", "ui_right")
\tif input_dir != 0.0:
\t\tvelocity.x = move_toward(velocity.x, input_dir * move_speed, acceleration * 0.85 * delta)
\t\t_update_facing(input_dir)
\telse:
\t\tvelocity.x = move_toward(velocity.x, 0.0, friction * 0.4 * delta)

func _update_facing(dir: float) -> void:
\tif dir > 0.0 and not is_facing_right:
\t\tis_facing_right = true
\t\tif sprite: sprite.flip_h = false
\telif dir < 0.0 and is_facing_right:
\t\tis_facing_right = false
\t\tif sprite: sprite.flip_h = true
`;
}
