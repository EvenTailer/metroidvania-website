import React, { useMemo, useState } from 'react';
import {
  BugStatus,
  PlaytestFilterState,
  PlaytestReport,
  SEVERITY_META,
  STATUS_META
} from '../entities/playtest';
import { RoomNode } from '../entities/room-matrix';
import {
  exportPlaytestToJson,
  formatAllReportsAsMarkdown,
  parseReportsFromJson,
  PlaytestCard,
  PlaytestEditModal,
  PlaytestFilterBar
} from '../features/playtest';
import { ConfirmModal } from '../shared/ui/ConfirmModal';

interface PlaytestPageProps {
  reports: PlaytestReport[];
  rooms: RoomNode[];
  filter: PlaytestFilterState;
  selectedReportId: string | null;
  onFilterChange: (patch: Partial<PlaytestFilterState>) => void;
  onSelectReport: (id: string) => void;
  onAddReport: (report: PlaytestReport) => void;
  onUpdateReport: (report: PlaytestReport) => void;
  onRemoveReport: (id: string) => void;
  onStatusChange?: (id: string, status: BugStatus) => void;
  onImportReports?: (reports: PlaytestReport[]) => void;
  onOpenRoom: (roomId: string) => void;
  onOpenScreenshot: (url: string) => void;
  onShowToast: (message: string) => void;
}

export const PlaytestPage: React.FC<PlaytestPageProps> = ({
  reports,
  rooms,
  filter,
  selectedReportId,
  onFilterChange,
  onSelectReport,
  onAddReport,
  onUpdateReport,
  onRemoveReport,
  onStatusChange,
  onImportReports,
  onOpenRoom,
  onOpenScreenshot,
  onShowToast
}) => {
  const [editing, setEditing] = useState<PlaytestReport | null>(null);
  const [creating, setCreating] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<PlaytestReport | null>(null);
  const roomMap = useMemo(() => new Map(rooms.map(room => [room.id, room])), [rooms]);

  const visible = useMemo(() => {
    let result = reports.filter(report => {
      if (filter.severity !== 'all' && report.severity !== filter.severity) return false;
      if (filter.status !== 'all' && report.status !== filter.status) return false;
      if (filter.searchQuery.trim()) {
        const query = filter.searchQuery.toLowerCase().trim();
        const haystack = [
          report.title,
          report.steps,
          report.scenePath,
          report.tester,
          report.expected,
          report.actual,
          report.buildVersion || '',
          report.godotLog || '',
          report.roomId || ''
        ].join(' ').toLowerCase();
        if (!haystack.includes(query)) return false;
      }
      return true;
    });

    // Сортировка
    return [...result].sort((a, b) => {
      switch (filter.sortBy) {
        case 'severity': {
          const diff = SEVERITY_META[a.severity].order - SEVERITY_META[b.severity].order;
          return diff !== 0 ? diff : b.createdAt.localeCompare(a.createdAt);
        }
        case 'date-desc':
          return b.createdAt.localeCompare(a.createdAt);
        case 'date-asc':
          return a.createdAt.localeCompare(b.createdAt);
        case 'status': {
          const diff = STATUS_META[a.status].order - STATUS_META[b.status].order;
          return diff !== 0 ? diff : SEVERITY_META[a.severity].order - SEVERITY_META[b.severity].order;
        }
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });
  }, [reports, filter]);

  const openBlockers = reports.filter(report => report.severity === 'blocker' && report.status === 'open').length;
  const fixedCount = reports.filter(report => report.status === 'fixed').length;

  const handleCopyScenePath = (path: string) => {
    navigator.clipboard.writeText(path).then(() => {
      onShowToast(`Путь сцены скопирован: ${path}`);
    });
  };

  const handleExportMarkdown = () => {
    const md = formatAllReportsAsMarkdown(visible, roomMap);
    navigator.clipboard.writeText(md).then(() => {
      onShowToast(`Сводка ${visible.length} багов скопирована в Markdown!`);
    });
  };

  const handleExportJson = () => {
    exportPlaytestToJson(reports);
    onShowToast(`Экспортировано ${reports.length} записей в JSON`);
  };

  const handleImportJson = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const text = String(reader.result || '');
        const items = parseReportsFromJson(text);
        onImportReports?.(items);
        onShowToast(`Успешно импортировано ${items.length} багов`);
      } catch (err) {
        onShowToast(err instanceof Error ? err.message : 'Ошибка импорта JSON');
      }
    };
    reader.readAsText(file);
  };

  const save = (report: PlaytestReport) => {
    if (editing) {
      onUpdateReport(report);
      onShowToast(`Запись «${report.title}» сохранена`);
    } else {
      onAddReport(report);
      onShowToast(`Запись «${report.title}» добавлена`);
    }
    setCreating(false);
    setEditing(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <PlaytestFilterBar
        filter={filter}
        totalCount={reports.length}
        openBlockers={openBlockers}
        fixedCount={fixedCount}
        onFilterChange={onFilterChange}
        onCreate={() => { setEditing(null); setCreating(true); }}
        onExportMarkdown={handleExportMarkdown}
        onExportJson={handleExportJson}
        onImportJson={handleImportJson}
      />

      {visible.length === 0 ? (
        <div className="panel" style={{ padding: '36px 20px', textAlign: 'center', background: 'rgba(11, 16, 28, 0.65)' }}>
          <p style={{ margin: '0 0 10px', fontSize: '14px', color: '#cbd5e1' }}>
            Записей с такими фильтрами не найдено.
          </p>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => onFilterChange({ severity: 'all', status: 'all', searchQuery: '', sortBy: 'severity' })}
          >
            Сбросить фильтры
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 320px), 1fr))', gap: '14px', alignItems: 'start' }}>
          {visible.map(report => (
            <PlaytestCard
              key={report.id}
              report={report}
              room={report.roomId ? roomMap.get(report.roomId) : undefined}
              isSelected={report.id === selectedReportId}
              onSelect={() => onSelectReport(report.id)}
              onEdit={() => setEditing(report)}
              onDelete={() => setPendingDelete(report)}
              onOpenRoom={onOpenRoom}
              onOpenScreenshot={onOpenScreenshot}
              onStatusChange={(status: BugStatus) => onStatusChange?.(report.id, status)}
              onCopyScenePath={handleCopyScenePath}
              onShowToast={onShowToast}
            />
          ))}
        </div>
      )}

      {(creating || editing) && (
        <PlaytestEditModal
          report={editing}
          rooms={rooms}
          onSave={save}
          onClose={() => { setCreating(false); setEditing(null); }}
          onError={onShowToast}
        />
      )}

      <ConfirmModal
        isOpen={Boolean(pendingDelete)}
        title="Удаление записи"
        message={`Удалить «${pendingDelete?.title}»? Скриншот и лог ошибки будут удалены.`}
        confirmText="Удалить запись"
        cancelText="Отмена"
        danger
        onConfirm={() => {
          if (!pendingDelete) return;
          onRemoveReport(pendingDelete.id);
          onShowToast(`Запись «${pendingDelete.title}» удалена`);
          setPendingDelete(null);
        }}
        onClose={() => setPendingDelete(null)}
      />
    </div>
  );
};
