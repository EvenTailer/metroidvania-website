import { BugSeverity, BugStatus, PlaytestReport } from './types';

const SEVERITIES = new Set<BugSeverity>(['blocker', 'major', 'minor', 'polish']);
const STATUSES = new Set<BugStatus>(['open', 'fixed', 'wontfix']);

function text(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value.trim() : fallback;
}

export function normalizeReport(raw: unknown, index: number): PlaytestReport | null {
  if (!raw || typeof raw !== 'object') return null;
  const source = raw as Partial<PlaytestReport>;
  const title = text(source.title);
  if (!title) return null;
  const severity = SEVERITIES.has(source.severity as BugSeverity) ? source.severity as BugSeverity : 'minor';
  const status = STATUSES.has(source.status as BugStatus) ? source.status as BugStatus : 'open';
  const roomId = text(source.roomId);
  const screenshot = text(source.screenshotUrl);
  const buildVersion = text(source.buildVersion);
  const godotLog = text(source.godotLog);

  return {
    id: text(source.id) || `bug-${index + 1}`,
    title,
    severity,
    status,
    tester: text(source.tester) || 'Тестер',
    scenePath: text(source.scenePath),
    roomId: roomId || null,
    steps: text(source.steps),
    expected: text(source.expected),
    actual: text(source.actual),
    buildVersion: buildVersion || undefined,
    godotLog: godotLog || undefined,
    screenshotUrl: screenshot || undefined,
    createdAt: text(source.createdAt) || new Date(0).toISOString()
  };
}
