import React, { useState } from 'react';
import { BugStatus, PlaytestReport, SEVERITY_META, STATUS_META } from '../../entities/playtest';
import { RoomNode } from '../../entities/room-matrix';
import { formatReportAsMarkdown } from './exportPlaytest';

interface PlaytestCardProps {
  report: PlaytestReport;
  room?: RoomNode;
  isSelected: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onOpenRoom: (roomId: string) => void;
  onOpenScreenshot: (url: string) => void;
  onStatusChange?: (status: BugStatus) => void;
  onCopyScenePath?: (path: string) => void;
  onShowToast?: (message: string) => void;
}

export const PlaytestCard: React.FC<PlaytestCardProps> = ({
  report,
  room,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
  onOpenRoom,
  onOpenScreenshot,
  onStatusChange,
  onCopyScenePath,
  onShowToast
}) => {
  const [showLog, setShowLog] = useState(false);
  const severity = SEVERITY_META[report.severity];
  const stepPreview = report.steps
    .split('\n')
    .map(s => s.trim())
    .filter(Boolean);
  const logLineCount = report.godotLog ? report.godotLog.trim().split('\n').length : 0;

  // Извлекаем только имя файла для простоты восприятия, например "room_centurion_boss.tscn"
  const sceneFileName = report.scenePath ? report.scenePath.split('/').pop() || report.scenePath : '';

  const handleCopyMarkdown = (e: React.MouseEvent) => {
    e.stopPropagation();
    const md = formatReportAsMarkdown(report, room?.name);
    navigator.clipboard.writeText(md).then(() => {
      onShowToast?.(`Текст бага «${report.title}» скопирован! Можно отправлять в Discord или чат.`);
    });
  };

  const handleCopyLog = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!report.godotLog) return;
    navigator.clipboard.writeText(report.godotLog).then(() => {
      onShowToast?.('Лог ошибки скопирован в буфер!');
    });
  };

  return (
    <article
      className="panel"
      onClick={onSelect}
      style={{
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        cursor: 'pointer',
        border: isSelected ? `2px solid ${severity.color}` : '1px solid rgba(255, 255, 255, 0.08)',
        background: isSelected ? 'rgba(16, 24, 40, 0.95)' : 'rgba(11, 16, 28, 0.88)',
        boxShadow: isSelected ? `0 0 20px ${severity.color}25` : '0 4px 16px rgba(0,0,0,0.3)',
        transition: 'all 0.15s ease'
      }}
    >
      {/* Верхняя строка: Тяжесть, Статус (кнопочный переключатель) и Действия */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        {/* Бейдж важности */}
        <span
          title={severity.hint}
          style={{
            fontSize: '11px',
            fontWeight: 800,
            color: severity.color,
            padding: '4px 8px',
            borderRadius: '6px',
            border: `1px solid ${severity.color}55`,
            background: `${severity.color}18`,
            letterSpacing: '0.02em',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          {severity.badge}
        </span>

        {/* Действия карточки */}
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          <button
            type="button"
            className="chip-btn"
            title="Скопировать карточку текстом для отправки разработчику в Discord или Telegram"
            style={{ fontSize: '11px', padding: '3px 8px', color: 'var(--accent-cyan)' }}
            onClick={handleCopyMarkdown}
          >
            📋 В Discord
          </button>
          <button
            type="button"
            className="chip-btn"
            title="Изменить описание или шаги"
            style={{ fontSize: '11px', padding: '3px 8px' }}
            onClick={event => { event.stopPropagation(); onEdit(); }}
          >
            ✏️ Изменить
          </button>
          <button
            type="button"
            className="chip-btn"
            title="Удалить запись"
            style={{ fontSize: '11px', padding: '3px 8px', color: '#f87171' }}
            onClick={event => { event.stopPropagation(); onDelete(); }}
          >
            🗑️
          </button>
        </div>
      </div>

      {/* Быстрый переключатель статуса без нативного селекта */}
      <div
        style={{
          display: 'flex',
          background: 'rgba(0, 0, 0, 0.45)',
          padding: '3px',
          borderRadius: '8px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          gap: '3px'
        }}
        onClick={e => e.stopPropagation()}
      >
        {(['open', 'fixed', 'wontfix'] as BugStatus[]).map(st => {
          const active = report.status === st;
          const meta = STATUS_META[st];
          return (
            <button
              key={st}
              type="button"
              title={meta.hint}
              onClick={() => onStatusChange?.(st)}
              style={{
                flex: 1,
                border: 'none',
                borderRadius: '6px',
                padding: '4px 6px',
                fontSize: '11px',
                fontWeight: active ? 700 : 500,
                cursor: 'pointer',
                background: active
                  ? st === 'fixed'
                    ? 'rgba(16, 185, 129, 0.25)'
                    : st === 'open'
                      ? 'rgba(239, 68, 68, 0.25)'
                      : 'rgba(148, 163, 184, 0.25)'
                  : 'transparent',
                color: active
                  ? st === 'fixed'
                    ? '#34d399'
                    : st === 'open'
                      ? '#fca5a5'
                      : '#cbd5e1'
                  : 'var(--text-muted)',
                boxShadow: active ? `inset 0 0 0 1px ${meta.color}66` : 'none',
                transition: 'all 0.15s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                whiteSpace: 'nowrap'
              }}
            >
              <span>{meta.badge.slice(0, 2)}</span>
              <span>{meta.actionLabel}</span>
            </button>
          );
        })}
      </div>

      {/* Название ошибки и автор */}
      <div>
        <h3 style={{ margin: '0 0 4px', fontSize: '15.5px', color: '#fff', lineHeight: 1.35, fontWeight: 700 }}>
          {report.title}
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', fontSize: '11px', color: 'var(--text-muted)' }}>
          <span>👤 {report.tester}</span>
          {report.createdAt && <span>• {report.createdAt.split('T')[0]}</span>}
          {report.buildVersion && (
            <span
              title="Версия сборки игры, в которой найден баг"
              style={{
                padding: '1px 6px',
                borderRadius: '4px',
                background: 'rgba(99, 102, 241, 0.15)',
                color: '#a5b4fc',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                fontSize: '10.5px'
              }}
            >
              🏷️ Сборка: {report.buildVersion}
            </span>
          )}
        </div>
      </div>

      {/* Скриншот */}
      {report.screenshotUrl && (
        <button
          type="button"
          onClick={event => { event.stopPropagation(); onOpenScreenshot(report.screenshotUrl!); }}
          title="Нажмите, чтобы рассмотреть скриншот на весь экран"
          style={{
            padding: 0,
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: '8px',
            overflow: 'hidden',
            background: '#000',
            cursor: 'pointer',
            position: 'relative'
          }}
        >
          <img
            src={report.screenshotUrl}
            alt={`Скриншот: ${report.title}`}
            style={{ display: 'block', width: '100%', maxHeight: '150px', objectFit: 'cover' }}
          />
          <span
            style={{
              position: 'absolute',
              bottom: '6px',
              right: '6px',
              background: 'rgba(0,0,0,0.75)',
              color: '#fff',
              fontSize: '10px',
              padding: '2px 6px',
              borderRadius: '4px'
            }}
          >
            🔍 Увеличить
          </span>
        </button>
      )}

      {/* Шаги воспроизведения */}
      {stepPreview.length > 0 && (
        <div style={{ background: 'rgba(0,0,0,0.25)', padding: '8px 10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)' }}>
          <div style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Как повторить (по шагам):
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {stepPreview.map((line, idx) => {
              const cleanText = line.replace(/^\d+[\.\)]\s*/, '');
              return (
                <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', fontSize: '11.5px', color: '#e2e8f0', lineHeight: 1.4 }}>
                  <span
                    style={{
                      background: 'rgba(0, 210, 255, 0.15)',
                      color: 'var(--accent-cyan)',
                      fontSize: '10px',
                      fontWeight: 800,
                      borderRadius: '50%',
                      width: '18px',
                      height: '18px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: '1px'
                    }}
                  >
                    {idx + 1}
                  </span>
                  <span>{cleanText}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Ожидалось vs Фактически */}
      {(report.expected || report.actual) && (
        <div style={{ display: 'grid', gridTemplateColumns: report.expected && report.actual ? '1fr 1fr' : '1fr', gap: '8px' }}>
          {report.expected && (
            <div
              style={{
                background: 'rgba(16, 185, 129, 0.08)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                padding: '8px 10px',
                borderRadius: '6px',
                fontSize: '11px'
              }}
            >
              <div style={{ color: '#34d399', fontWeight: 800, fontSize: '10px', marginBottom: '3px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span>🟢</span> КАК ДОЛЖНО БЫТЬ:
              </div>
              <div style={{ color: '#cbd5e1', lineHeight: 1.4 }}>{report.expected}</div>
            </div>
          )}
          {report.actual && (
            <div
              style={{
                background: 'rgba(239, 68, 68, 0.08)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                padding: '8px 10px',
                borderRadius: '6px',
                fontSize: '11px'
              }}
            >
              <div style={{ color: '#f87171', fontWeight: 800, fontSize: '10px', marginBottom: '3px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span>🔴</span> ЧТО СЛУЧИЛОСЬ:
              </div>
              <div style={{ color: '#cbd5e1', lineHeight: 1.4 }}>{report.actual}</div>
            </div>
          )}
        </div>
      )}

      {/* Лог ошибки Godot */}
      {report.godotLog && (
        <div
          onClick={e => e.stopPropagation()}
          style={{
            background: 'rgba(0, 0, 0, 0.55)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            borderRadius: '6px',
            padding: '6px 10px',
            fontSize: '11px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button
              type="button"
              onClick={() => setShowLog(v => !v)}
              className="chip-btn"
              style={{ fontSize: '10.5px', padding: '2px 6px', color: '#fca5a5' }}
            >
              {showLog ? '▼ Скрыть лог ошибки Godot' : `▶ ⚠️ Лог ошибки Godot (${logLineCount} стр.)`}
            </button>
            <button
              type="button"
              onClick={handleCopyLog}
              className="chip-btn"
              style={{ fontSize: '10px', padding: '2px 6px' }}
            >
              Копировать лог
            </button>
          </div>
          {showLog && (
            <pre
              style={{
                margin: '6px 0 0',
                padding: '8px',
                background: '#050811',
                borderRadius: '4px',
                fontSize: '10.5px',
                lineHeight: 1.4,
                color: '#f87171',
                overflowX: 'auto',
                whiteSpace: 'pre-wrap',
                fontFamily: 'Consolas, Monaco, "Courier New", monospace'
              }}
            >
              {report.godotLog}
            </pre>
          )}
        </div>
      )}

      {/* Привязка к комнате на карте */}
      {report.roomId && (
        <div>
          <button
            type="button"
            className="chip-btn"
            title="Открыть эту комнату на интерактивной карте"
            style={{ fontSize: '11px', padding: '4px 10px', color: 'var(--accent-cyan)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
            onClick={event => { event.stopPropagation(); onOpenRoom(report.roomId!); }}
          >
            <span>📍 Найти на карте:</span>
            <strong>{room?.name || report.roomId}</strong>
            <span style={{ fontSize: '9px', opacity: 0.7 }}>→</span>
          </button>
        </div>
      )}

      {/* Файл сцены Godot */}
      {report.scenePath && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
            background: 'rgba(0, 0, 0, 0.45)',
            padding: '6px 10px',
            borderRadius: '6px',
            fontSize: '11px',
            color: 'var(--text-muted)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden' }} title={report.scenePath}>
            <span style={{ flexShrink: 0 }}>🎬</span>
            <span style={{ color: '#cbd5e1', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {sceneFileName}
            </span>
          </div>
          {onCopyScenePath && (
            <button
              type="button"
              className="chip-btn"
              style={{ fontSize: '10.5px', padding: '2px 8px', flexShrink: 0 }}
              onClick={e => {
                e.stopPropagation();
                onCopyScenePath(report.scenePath);
              }}
              title="Скопировать путь к файлу сцены для вставки в Godot Engine"
            >
              Копировать путь
            </button>
          )}
        </div>
      )}
    </article>
  );
};
