import { gdFloat } from './gdFormat';
import { calculatePhysics } from './physicsFormulas';
import { PlatformerPhysicsParams } from './types';

export function generatePhysicsDataGd(params: PlatformerPhysicsParams): string {
  const comp = calculatePhysics(params);
  return `# ==============================================================================
# PlayerPhysicsData.gd — ресурс физики персонажа для Godot 4.3
# Сгенерировано в Cyber-Duck Hub
# ==============================================================================
class_name PlayerPhysicsData
extends Resource

@export var move_speed: float = ${gdFloat(params.moveSpeed)}
@export var acceleration: float = ${gdFloat(comp.acceleration)}
@export var friction: float = ${gdFloat(comp.friction)}
@export var jump_height_px: float = ${gdFloat(params.jumpHeight)}
@export var jump_velocity: float = ${gdFloat(comp.jumpVelocity)}
@export var jump_gravity: float = ${gdFloat(comp.jumpGravity)}
@export var fall_gravity: float = ${gdFloat(comp.fallGravity)}
@export var coyote_time: float = ${gdFloat(params.coyoteTime)}
@export var jump_buffer_time: float = ${gdFloat(params.jumpBufferTime)}
@export var jump_cut_multiplier: float = ${gdFloat(params.jumpCutMultiplier)}
@export var dash_speed: float = ${gdFloat(params.dashSpeed)}
@export var dash_duration: float = ${gdFloat(params.dashDuration)}
@export var dash_cooldown: float = ${gdFloat(params.dashCooldown)}
@export var wall_slide_speed: float = ${gdFloat(params.wallSlideSpeed)}
@export var wall_jump_speed_x: float = ${gdFloat(params.wallJumpSpeedX)}
@export var tile_unit: int = ${Math.round(params.tileUnit)}
`;
}

export function generatePhysicsResourceTres(params: PlatformerPhysicsParams): string {
  const comp = calculatePhysics(params);
  return `[gd_resource type="Resource" script_class="PlayerPhysicsData" load_steps=2 format=3]

[ext_resource type="Script" path="res://data/PlayerPhysicsData.gd" id="1_phys"]

[resource]
script = ExtResource("1_phys")
move_speed = ${gdFloat(params.moveSpeed)}
acceleration = ${gdFloat(comp.acceleration)}
friction = ${gdFloat(comp.friction)}
jump_height_px = ${gdFloat(params.jumpHeight)}
jump_velocity = ${gdFloat(comp.jumpVelocity)}
jump_gravity = ${gdFloat(comp.jumpGravity)}
fall_gravity = ${gdFloat(comp.fallGravity)}
coyote_time = ${gdFloat(params.coyoteTime)}
jump_buffer_time = ${gdFloat(params.jumpBufferTime)}
jump_cut_multiplier = ${gdFloat(params.jumpCutMultiplier)}
dash_speed = ${gdFloat(params.dashSpeed)}
dash_duration = ${gdFloat(params.dashDuration)}
dash_cooldown = ${gdFloat(params.dashCooldown)}
wall_slide_speed = ${gdFloat(params.wallSlideSpeed)}
wall_jump_speed_x = ${gdFloat(params.wallJumpSpeedX)}
tile_unit = ${Math.round(params.tileUnit)}
`;
}
