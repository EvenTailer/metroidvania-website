import { describe, expect, it } from 'vitest';
import { calculateJumpTrajectory, calculatePhysics } from './physicsFormulas';
import { DEFAULT_PHYSICS_PARAMS, DEFAULT_STATE_MACHINE_STATES, PHYSICS_PRESETS } from './defaultData';
import { gdFloat, generatePhysicsDataGd, generatePhysicsResourceTres, generatePlayerControllerGd, generateStateMachineOopGd } from './codeGenerators';
import {
  gdscriptGeneratorSlice,
  physicsParamUpdated,
  presetSelected,
  resetToDefaults,
  stateAdded,
  stateRemoved,
  stateToggled,
  transitionToggled
} from './slice';

describe('gdscriptGenerator entity', () => {
  it('корректно рассчитывает гравитацию, скорость прыжка и трение', () => {
    const comp = calculatePhysics(DEFAULT_PHYSICS_PARAMS);
    expect(comp.jumpVelocity).toBeLessThan(0); // В Godot прыжок вверх — отрицательный Y
    expect(comp.jumpGravity).toBeGreaterThan(0);
    expect(comp.fallGravity).toBeGreaterThan(0);
    // В хорошем платформере падение быстрее взлета для отзывчивости
    expect(comp.fallGravity).toBeGreaterThan(comp.jumpGravity);
    expect(comp.jumpHeightTiles).toBe(3.3);
    expect(comp.dashDistance).toBeGreaterThan(50);
  });

  it('строит траекторию параболы прыжка с подъемом и спуском', () => {
    const points = calculateJumpTrajectory(DEFAULT_PHYSICS_PARAMS, 20);
    expect(points.length).toBe(21);
    expect(points[0].y).toBe(0); // старт с земли
    const maxY = Math.max(...points.map(p => p.y));
    expect(maxY).toBeCloseTo(DEFAULT_PHYSICS_PARAMS.jumpHeight, -1);
  });

  it('генерирует валидный GDScript для PlayerController.gd', () => {
    const code = generatePlayerControllerGd(DEFAULT_PHYSICS_PARAMS, DEFAULT_STATE_MACHINE_STATES);
    expect(code).toContain('class_name PlayerController');
    expect(code).toContain('extends CharacterBody2D');
    expect(code).toContain('coyote_timer');
    expect(code).toContain('jump_buffer_timer');
    expect(code).toContain('func _physics_process');
    expect(code).toContain('move_and_slide()');
  });

  it('генерирует ООП StateMachine.gd, базовый State.gd и скрипт на каждое состояние', () => {
    const { stateMachineGd, baseStateGd, stateFiles } = generateStateMachineOopGd(
      DEFAULT_PHYSICS_PARAMS,
      DEFAULT_STATE_MACHINE_STATES
    );
    expect(stateMachineGd).toContain('class_name StateMachine');
    expect(stateMachineGd).toContain('change_state');
    expect(baseStateGd).toContain('class_name State');
    expect(baseStateGd).toContain('func physics_update');
    expect(stateFiles).toHaveLength(8);
    expect(stateFiles.some(file => file.code.includes('sprite.play("idle")'))).toBe(true);
    expect(stateFiles.some(file => file.code.includes('transitioned.emit'))).toBe(true);
  });

  it('не ссылается на выключенное состояние и пишет свою анимацию', () => {
    const withoutParry = DEFAULT_STATE_MACHINE_STATES.map(item => (
      item.id === 'parry' ? { ...item, enabled: false } : item
    ));
    const disabledCode = generatePlayerControllerGd(DEFAULT_PHYSICS_PARAMS, withoutParry);
    expect(disabledCode).not.toContain('PARRY');
    expect(disabledCode).toContain('enum State {');

    const withWall = [
      ...DEFAULT_STATE_MACHINE_STATES,
      {
        id: 'wall-slide',
        name: 'WallSlide',
        label: 'Стена',
        description: 'Скольжение',
        animationName: 'wall_glide',
        icon: '🧗',
        color: '#eab308',
        enabled: true,
        canTransitionTo: ['jump', 'fall']
      }
    ];
    const customCode = generatePlayerControllerGd(DEFAULT_PHYSICS_PARAMS, withWall);
    expect(customCode).toContain('State.WALLSLIDE');
    expect(customCode).toContain('_physics_wallslide');
    expect(customCode).toContain('sprite.play("wall_glide")');
    expect(customCode).toContain('jump_cut_multiplier');
    expect(customCode).toContain('wall_slide_speed');
  });

  it('форматирует числа GDScript и пишет PlayerPhysicsData.gd', () => {
    expect(gdFloat(48)).toBe('48.0');
    expect(gdFloat(175.5)).toBe('175.5');
    const script = generatePhysicsDataGd(DEFAULT_PHYSICS_PARAMS);
    expect(script).toContain('class_name PlayerPhysicsData');
    expect(script).toContain('jump_cut_multiplier');
    const tres = generatePhysicsResourceTres(DEFAULT_PHYSICS_PARAMS);
    expect(tres).toContain('res://data/PlayerPhysicsData.gd');
    expect(tres).toContain('wall_jump_speed_x');
  });

  it('генерирует Godot 4 .tres ресурс', () => {
    const tres = generatePhysicsResourceTres(DEFAULT_PHYSICS_PARAMS);
    expect(tres).toContain('[gd_resource type="Resource"');
    expect(tres).toContain('move_speed');
    expect(tres).toContain('jump_gravity');
  });

  it('обрабатывает экшены Redux-слайса: пресеты, параметры, стейты', () => {
    let state = gdscriptGeneratorSlice.reducer(undefined, { type: '@@INIT' });
    expect(state.states.length).toBe(8);

    // Применение пресета Celeste
    state = gdscriptGeneratorSlice.reducer(state, presetSelected('celeste'));
    expect(state.selectedPresetId).toBe('celeste');
    expect(state.physicsParams.jumpHeight).toBe(48);

    // Правка параметра
    state = gdscriptGeneratorSlice.reducer(
      state,
      physicsParamUpdated({ key: 'jumpHeight', value: 70 })
    );
    expect(state.physicsParams.jumpHeight).toBe(70);
    expect(state.selectedPresetId).toBe('custom');

    // Переключение стейта
    state = gdscriptGeneratorSlice.reducer(state, stateToggled('parry'));
    expect(state.states.find(s => s.id === 'parry')?.enabled).toBe(false);

    // Добавление кастомного стейта
    const customState = {
      id: 'wall-slide',
      name: 'WallSlide',
      label: 'Скольжение по стене',
      description: 'Медленное сползание по вертикальным поверхностям',
      animationName: 'wall_slide',
      icon: '🧗',
      color: '#eab308',
      enabled: true,
      canTransitionTo: ['jump', 'fall']
    };
    state = gdscriptGeneratorSlice.reducer(state, stateAdded(customState));
    expect(state.states.length).toBe(9);

    // Переключение перехода
    state = gdscriptGeneratorSlice.reducer(
      state,
      transitionToggled({ fromId: 'wall-slide', toId: 'idle' })
    );
    expect(state.states.find(s => s.id === 'wall-slide')?.canTransitionTo).toContain('idle');

    // Удаление стейта
    state = gdscriptGeneratorSlice.reducer(state, stateRemoved('wall-slide'));
    expect(state.states.length).toBe(8);

    // Сброс к дефолтам
    state = gdscriptGeneratorSlice.reducer(state, resetToDefaults());
    expect(state.selectedPresetId).toBe('cyber-duck');
  });
});
