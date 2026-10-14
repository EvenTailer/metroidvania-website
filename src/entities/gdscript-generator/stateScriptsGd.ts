import { gdEnumName, gdFloat, gdString, stateRole, StateRole } from './gdFormat';
import { calculatePhysics } from './physicsFormulas';
import { PlatformerPhysicsParams, StateMachineState } from './types';

export interface GeneratedStateFile {
  fileName: string;
  code: string;
}

function targetsOf(state: StateMachineState, enabled: StateMachineState[], role: StateRole): StateMachineState[] {
  return state.canTransitionTo
    .map(id => enabled.find(item => item.id === id))
    .filter((item): item is StateMachineState => Boolean(item && stateRole(item) === role));
}

function physicsBody(
  state: StateMachineState,
  enabled: StateMachineState[],
  params: PlatformerPhysicsParams
): string {
  const comp = calculatePhysics(params);
  const role = stateRole(state);
  const jump = targetsOf(state, enabled, 'jump')[0];
  const fall = targetsOf(state, enabled, 'fall')[0];
  const run = targetsOf(state, enabled, 'run')[0];
  const idle = targetsOf(state, enabled, 'idle')[0];
  const dash = targetsOf(state, enabled, 'dash')[0];
  const lines: string[] = [];
  if (role === 'idle' || role === 'parry') {
    lines.push(`\tactor.velocity.x = move_toward(actor.velocity.x, 0.0, ${gdFloat(comp.friction)} * delta)`);
  } else if (role === 'run' || role === 'custom') {
    lines.push('\tvar input_dir: float = Input.get_axis("ui_left", "ui_right")');
    lines.push(`\tactor.velocity.x = move_toward(actor.velocity.x, input_dir * ${gdFloat(params.moveSpeed)}, ${gdFloat(comp.acceleration)} * delta)`);
  } else if (role === 'jump') {
    lines.push(`\tactor.velocity.y += ${gdFloat(comp.jumpGravity)} * delta`);
    lines.push(`\tif actor.velocity.y < 0.0 and not Input.is_action_pressed("jump"):`);
    lines.push(`\t\tactor.velocity.y *= ${gdFloat(params.jumpCutMultiplier)}`);
  } else if (role === 'fall' || role === 'hurt' || role === 'dead') {
    lines.push(`\tactor.velocity.y += ${gdFloat(comp.fallGravity)} * delta`);
  } else if (role === 'wall') {
    lines.push(`\tif actor.velocity.y > ${gdFloat(params.wallSlideSpeed)}:`);
    lines.push(`\t\tactor.velocity.y = ${gdFloat(params.wallSlideSpeed)}`);
  } else if (role === 'dash') {
    lines.push('\t_dash_left -= delta');
    lines.push('\tvar dir: float = Input.get_axis("ui_left", "ui_right")');
    lines.push('\tif dir == 0.0:');
    lines.push('\t\tdir = 1.0');
    lines.push(`\tactor.velocity = Vector2(dir, 0.0) * ${gdFloat(params.dashSpeed)}`);
  }
  if (jump && (role === 'idle' || role === 'run' || role === 'fall' || role === 'wall' || role === 'custom')) {
    lines.push('\tif Input.is_action_just_pressed("jump") or Input.is_action_just_pressed("ui_accept"):');
    if (role === 'wall') {
      lines.push(`\t\tactor.velocity = Vector2(-sign(actor.get_wall_normal().x) * ${gdFloat(params.wallJumpSpeedX)}, ${gdFloat(comp.jumpVelocity)})`);
    } else {
      lines.push(`\t\tactor.velocity.y = ${gdFloat(comp.jumpVelocity)}`);
    }
    lines.push(`\t\ttransitioned.emit(${gdString(jump.name)})`);
    lines.push('\t\treturn');
  }
  if (dash && role !== 'dash' && role !== 'dead') {
    lines.push('\tif Input.is_action_just_pressed("dash"):');
    lines.push(`\t\ttransitioned.emit(${gdString(dash.name)})`);
    lines.push('\t\treturn');
  }
  if (role === 'dash') {
    const next = fall ?? idle ?? run;
    if (next) {
      lines.push('\tif _dash_left <= 0.0:');
      lines.push(`\t\ttransitioned.emit(${gdString(next.name)})`);
    }
  } else if (role === 'idle' && run) {
    lines.push('\tif Input.get_axis("ui_left", "ui_right") != 0.0:');
    lines.push(`\t\ttransitioned.emit(${gdString(run.name)})`);
  } else if (role === 'run' && idle) {
    lines.push('\tif Input.get_axis("ui_left", "ui_right") == 0.0:');
    lines.push(`\t\ttransitioned.emit(${gdString(idle.name)})`);
  } else if (actorAir(role) && fall && role !== 'fall') {
    lines.push('\tif actor.velocity.y >= 0.0:');
    lines.push(`\t\ttransitioned.emit(${gdString(fall.name)})`);
  } else if (role === 'fall' && idle) {
    lines.push('\tif actor.is_on_floor():');
    lines.push(`\t\ttransitioned.emit(${gdString(run && idle ? idle.name : idle.name)})`);
  }
  if (lines.length === 0) lines.push('\tpass');
  return lines.join('\n');
}

function actorAir(role: StateRole): boolean {
  return role === 'jump' || role === 'fall' || role === 'wall' || role === 'dash';
}

export function generateStateMachineOopGd(
  params: PlatformerPhysicsParams,
  states: StateMachineState[]
): { stateMachineGd: string; baseStateGd: string; stateFiles: GeneratedStateFile[] } {
  const enabled = states.filter(item => item.enabled);
  const stateFiles = enabled.map(state => ({
    fileName: `${gdEnumName(state)}State.gd`,
    code: `# ${state.label}
class_name ${gdEnumName(state)}State
extends State

${stateRole(state) === 'dash' ? `var _dash_left: float = ${gdFloat(params.dashDuration)}\n\n` : ''}func enter() -> void:
${stateRole(state) === 'dash' ? `\t_dash_left = ${gdFloat(params.dashDuration)}\n` : ''}\tvar sprite := actor.get_node_or_null("AnimatedSprite2D") as AnimatedSprite2D
\tif sprite:
\t\tsprite.play(${gdString(state.animationName || state.id)})

func physics_update(delta: float) -> void:
\tif actor == null:
\t\treturn
${physicsBody(state, enabled, params)}
`
  }));

  const stateMachineGd = `# ==============================================================================
# StateMachine.gd — дочерние ноды назовите точно как имя состояния: ${enabled.map(item => item.name).join(', ') || 'нет'}
# ==============================================================================
class_name StateMachine
extends Node

signal state_changed(from_state: State, to_state: State)

@export var initial_state: State
var current_state: State
var states: Dictionary = {}

func _ready() -> void:
\tfor child in get_children():
\t\tif child is State:
\t\t\tstates[child.name.to_lower()] = child
\t\t\tchild.transitioned.connect(_on_state_transitioned)
\tif initial_state:
\t\tcurrent_state = initial_state
\t\tcurrent_state.enter()
\telif states.size() > 0:
\t\tcurrent_state = states.values()[0]
\t\tcurrent_state.enter()

func _physics_process(delta: float) -> void:
\tif current_state:
\t\tcurrent_state.physics_update(delta)
\tvar body := owner as CharacterBody2D
\tif body:
\t\tbody.move_and_slide()

func _process(delta: float) -> void:
\tif current_state:
\t\tcurrent_state.update(delta)

func _unhandled_input(event: InputEvent) -> void:
\tif current_state:
\t\tcurrent_state.handle_input(event)

func change_state(new_state_name: String) -> void:
\tvar key: String = new_state_name.to_lower()
\tif not states.has(key):
\t\tpush_error("Неизвестное состояние: " + new_state_name)
\t\treturn
\tvar new_state: State = states[key]
\tif current_state == new_state:
\t\treturn
\tvar old_state: State = current_state
\tif current_state:
\t\tcurrent_state.exit()
\tcurrent_state = new_state
\tcurrent_state.enter()
\tstate_changed.emit(old_state, new_state)

func _on_state_transitioned(target_state_name: String) -> void:
\tchange_state(target_state_name)
`;

  const baseStateGd = `# ==============================================================================
# State.gd — базовый класс. Логика каждого состояния лежит в отдельном скрипте.
# ==============================================================================
class_name State
extends Node

signal transitioned(target_state_name: String)

@onready var actor: CharacterBody2D = owner as CharacterBody2D

func enter() -> void:
\tpass

func exit() -> void:
\tpass

func update(_delta: float) -> void:
\tpass

func physics_update(_delta: float) -> void:
\tpass

func handle_input(_event: InputEvent) -> void:
\tpass
`;

  return { stateMachineGd, baseStateGd, stateFiles };
}
