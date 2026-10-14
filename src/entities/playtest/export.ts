import { normalizeReport } from './normalize';
import { BugSeverity, BugStatus, PlaytestReport, SEVERITY_META, STATUS_META } from './types';

export function formatReportAsMarkdown(report: PlaytestReport, roomName?: string): string {
  const sev = SEVERITY_META[report.severity]?.label || report.severity;
  const status = STATUS_META[report.status]?.label || report.status;
  const lines: string[] = [];

  lines.push(`### [${sev}] ${report.title}`);
  lines.push(`- **Статус:** ${status}`);
  if (report.buildVersion) lines.push(`- **Билд:** \`${report.buildVersion}\``);
  if (report.roomId) lines.push(`- **Комната:** ${roomName || report.roomId} (\`${report.roomId}\`)`);
  if (report.scenePath) lines.push(`- **Сцена Godot:** \`${report.scenePath}\``);
  lines.push(`- **Тестер:** ${report.tester}`);
  lines.push(`- **Дата:** ${report.createdAt.split('T')[0]}`);
  lines.push('');

  if (report.steps) {
    lines.push('#### Шаги воспроизведения:');
    lines.push(report.steps);
    lines.push('');
  }

  if (report.expected || report.actual) {
    lines.push('#### Результат:');
    if (report.expected) lines.push(`- **Ожидалось:** ${report.expected}`);
    if (report.actual) lines.push(`- **Фактически:** ${report.actual}`);
    lines.push('');
  }

  if (report.godotLog) {
    lines.push('#### Лог Godot / Stacktrace:');
    lines.push('```text');
    lines.push(report.godotLog);
    lines.push('```');
    lines.push('');
  }

  return lines.join('\n');
}

export function formatAllReportsAsMarkdown(
  reports: PlaytestReport[],
  roomMap: Map<string, { name: string }>
): string {
  const dateStr = new Date().toISOString().split('T')[0];
  const blockers = reports.filter(r => r.severity === 'blocker' && r.status === 'open').length;
  const openCount = reports.filter(r => r.status === 'open').length;

  const header = [
    `# CYBER-DUCK: Сводка плейтеста (${dateStr})`,
    `Всего записей: **${reports.length}** | Открытых: **${openCount}** | Открытых блокеров: **${blockers}**`,
    '',
    '---',
    ''
  ].join('\n');

  const bodies = reports.map(r => {
    const roomName = r.roomId ? roomMap.get(r.roomId)?.name : undefined;
    return formatReportAsMarkdown(r, roomName);
  }).join('\n---\n\n');

  return header + bodies;
}

export function parseReportsFromJson(jsonText: string): PlaytestReport[] {
  const parsed = JSON.parse(jsonText);
  if (!Array.isArray(parsed)) throw new Error('Файл не содержит массив записей.');
  const items = parsed
    .map((item, index) => normalizeReport(item, index))
    .filter((item): item is PlaytestReport => item !== null);
  if (items.length === 0) throw new Error('В файле не найдено корректных баг-репортов.');
  return items;
}
