import { describe, expect, it } from 'vitest';
import {
  addDays,
  bigGoalToggled,
  DEFAULT_WEEKLY_PLAN,
  migrateWeeklyPlan,
  mondayOf,
  planItemAdded,
  planItemMoved,
  planItemToggled,
  weekActivated,
  weekReset,
  weeklyPlanReducer
} from './index';

describe('weeklyPlan entity', () => {
  it('добавляет и переключает статус задачи дня', () => {
    let state = DEFAULT_WEEKLY_PLAN;
    state = weeklyPlanReducer(state, planItemAdded({
      day: 'mon',
      item: {
        id: 'wp-test-1',
        title: 'Тест прыжка в Godot 4',
        category: 'code',
        done: false
      }
    }));

    expect(state.days.mon.length).toBe(1);
    expect(state.days.mon[0].done).toBe(false);

    state = weeklyPlanReducer(state, planItemToggled({ day: 'mon', itemId: 'wp-test-1' }));
    expect(state.days.mon[0].done).toBe(true);
  });

  it('переносит задачу между днями', () => {
    let state = DEFAULT_WEEKLY_PLAN;
    state = weeklyPlanReducer(state, planItemAdded({
      day: 'mon',
      item: {
        id: 'wp-test-2',
        title: 'Спрайт атаки',
        category: 'art',
        done: false
      }
    }));

    state = weeklyPlanReducer(state, planItemMoved({
      fromDay: 'mon',
      toDay: 'wed',
      itemId: 'wp-test-2'
    }));

    expect(state.days.mon.length).toBe(0);
    expect(state.days.wed.length).toBe(1);
    expect(state.days.wed[0].title).toBe('Спрайт атаки');
  });

  it('переключает выполнение Big 3 цели', () => {
    let state = DEFAULT_WEEKLY_PLAN;
    expect(state.bigThree[0].done).toBe(false);

    state = weeklyPlanReducer(state, bigGoalToggled({ index: 0 }));
    expect(state.bigThree[0].done).toBe(true);
  });

  it('считает понедельник от четверга 8 октября 2026', () => {
    expect(mondayOf(new Date(2026, 9, 8))).toBe('2026-10-05');
    expect(addDays('2026-10-05', 6)).toBe('2026-10-11');
  });

  it('прячет текущую неделю в архив и возвращает её', () => {
    let state = weeklyPlanReducer(DEFAULT_WEEKLY_PLAN, planItemAdded({
      day: 'thu',
      item: { id: 'wp-arch', title: 'Босс сектора', category: 'design', done: false }
    }));
    const origin = state.weekStart;
    const next = addDays(origin, 7);
    state = weeklyPlanReducer(state, weekActivated({ weekStart: next, now: 1 }));
    expect(state.weekStart).toBe(next);
    expect(state.days.thu).toHaveLength(0);
    expect(state.archive[origin].days.thu[0].title).toBe('Босс сектора');

    state = weeklyPlanReducer(state, weekActivated({ weekStart: origin, now: 2 }));
    expect(state.days.thu[0].title).toBe('Босс сектора');
    expect(state.archive[origin]).toBeUndefined();
  });

  it('закрытие недели сохраняет задачи и открывает следующую', () => {
    let state = weeklyPlanReducer(DEFAULT_WEEKLY_PLAN, planItemAdded({
      day: 'mon',
      item: { id: 'wp-close', title: 'Прыжок', category: 'code', done: false }
    }));
    const origin = state.weekStart;
    state = weeklyPlanReducer(state, weekReset({ keepGoals: true, now: 3 }));
    expect(state.weekStart).toBe(addDays(origin, 7));
    expect(state.days.mon).toHaveLength(0);
    expect(state.archive[origin].days.mon).toHaveLength(1);
    expect(state.bigThree[0].text).toBe(DEFAULT_WEEKLY_PLAN.bigThree[0].text);
  });

  it('поднимает старый план без даты в текущую неделю', () => {
    const migrated = migrateWeeklyPlan({
      weekTitle: 'Старый спринт',
      bigThree: DEFAULT_WEEKLY_PLAN.bigThree,
      days: { mon: [], tue: [], wed: [], thu: [], fri: [], sat: [], sun: [] },
      retro: DEFAULT_WEEKLY_PLAN.retro
    });
    expect(migrated.weekStart).toBe(mondayOf(new Date()));
    expect(migrated.weekTitle).toBe('Старый спринт');
    expect(migrated.archive).toEqual({});
    expect(migrated.timer.running).toBe(false);
  });
});
