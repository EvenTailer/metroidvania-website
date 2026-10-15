import type { WeeklyPlanState } from './types';

export interface WeeklyPlanSnapshot {
  initialized: boolean;
  plan: WeeklyPlanState | null;
}

export async function fetchWeeklyPlanFromServer(): Promise<WeeklyPlanSnapshot> {
  const res = await fetch('/api/weekly-plan.php');
  if (!res.ok) throw new Error(`Weekly plan fetch failed: ${res.status}`);
  const data = await res.json();
  return {
    initialized: Boolean(data.initialized),
    plan: data.plan || null
  };
}

export async function saveWeeklyPlanToServer(plan: WeeklyPlanState): Promise<void> {
  const res = await fetch('/api/weekly-plan.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ plan })
  });
  if (!res.ok) throw new Error(`Weekly plan save failed: ${res.status}`);
}
