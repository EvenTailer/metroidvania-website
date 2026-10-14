import {
  formatAllReportsAsMarkdown,
  formatReportAsMarkdown,
  parseReportsFromJson,
  PlaytestReport
} from '../../entities/playtest';

export { formatReportAsMarkdown, formatAllReportsAsMarkdown, parseReportsFromJson };

export function downloadFile(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function exportPlaytestToJson(reports: PlaytestReport[]) {
  const json = JSON.stringify(reports, null, 2);
  const date = new Date().toISOString().slice(0, 10);
  downloadFile(json, `cyberduck-playtest-${date}.json`, 'application/json');
}
