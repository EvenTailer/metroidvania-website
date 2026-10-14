import React, { useRef } from 'react';
import {
  BugSeverity,
  BugStatus,
  PlaytestFilterState,
  SEVERITY_META,
  SORT_OPTIONS,
  STATUS_META
} from '../../entities/playtest';

interface PlaytestFilterBarProps {
  filter: PlaytestFilterState;
  totalCount: number;
  openBlockers: number;
  fixedCount: number;
  onFilterChange: (patch: Partial<PlaytestFilterState>) => void;
  onCreate: () => void;
  onExportMarkdown: () => void;
  onExportJson: () => void;
  onImportJson: (file: File) => void;
}

const SEVERITY_TABS: { id: BugSeverity | 'all'; label: string; hint: string }[] = [
  { id: 'all', label: 'Все баги', hint: 'Показать вообще все найденные ошибки' },
  { id: 'blocker', label: '💥 Стоп-игра', hint: SEVERITY_META.blocker.hint },
  { id: 'major', label: '⚠️ Серьёзные', hint: SEVERITY_META.major.hint },
  { id: 'minor', label: '🐛 Мелкие', hint: SEVERITY_META.minor.hint },
  { id: 'polish', label: '✨ Шлифовка', hint: SEVERITY_META.polish.hint }
];

const STATUS_FILTER_OPTIONS: { id: BugStatus | 'all'; label: string }[] = [
  { id: 'all', label: 'Все статусы' },
  { id: 'open', label: '🔴 Только неисправленные' },
  { id: 'fixed', label: '🟢 Только исправленные' },
  { id: 'wontfix', label: '⚪ Не баги / Фичи' }
];

export const PlaytestFilterBar: React.FC<PlaytestFilterBarProps> = ({
  filter,
  totalCount,
  openBlockers,
  fixedCount,
  onFilterChange,
  onCreate,
  onExportMarkdown,
  onExportJson,
  onImportJson
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImportJson(file);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Главная информационная плашка */}
      <div
        className="panel"
        style={{
          padding: '14px 18px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '14px',
          flexWrap: 'wrap',
          background: 'rgba(15, 23, 42, 0.85)',
          border: '1px solid rgba(255, 255, 255, 0.08)'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '15px', fontWeight: 800, color: '#fff', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              Журнал ошибок и плейтестов
            </span>
            <span style={{ fontSize: '11px', fontWeight: 700, padding: '3px 9px', borderRadius: '12px', background: 'rgba(0, 210, 255, 0.15)', color: 'var(--accent-cyan)', border: '1px solid rgba(0, 210, 255, 0.3)' }}>
              Всего: {totalCount}
            </span>
            <span
              title="Критические ошибки, которые мешают играть"
              style={{
                fontSize: '11px',
                fontWeight: 700,
                padding: '3px 9px',
                borderRadius: '12px',
                background: openBlockers > 0 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255,255,255,0.05)',
                color: openBlockers > 0 ? '#f87171' : 'var(--text-muted)',
                border: openBlockers > 0 ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid rgba(255,255,255,0.1)'
              }}
            >
              💥 Мешают играть: {openBlockers}
            </span>
            <span
              title="Ошибки, которые уже починили"
              style={{
                fontSize: '11px',
                fontWeight: 700,
                padding: '3px 9px',
                borderRadius: '12px',
                background: 'rgba(16, 185, 129, 0.15)',
                color: '#34d399',
                border: '1px solid rgba(16, 185, 129, 0.3)'
              }}
            >
              🟢 Починили: {fixedCount}
            </span>
          </div>
          <p style={{ margin: '6px 0 0', maxWidth: '750px', fontSize: '12px', lineHeight: 1.45, color: '#94a3b8' }}>
            Нашли ошибку или застряли во время игры? Жмите <strong>«+ Добавить баг»</strong> или нажмите <strong>Ctrl + V</strong> с готовым скриншотом.
          </p>
        </div>

        {/* Кнопки действий */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="chip-btn"
            title="Скопировать все найденные баги текстом для отправки в Discord или Telegram"
            onClick={onExportMarkdown}
            style={{ fontSize: '11px', padding: '6px 12px', color: 'var(--accent-cyan)' }}
          >
            📋 Скопировать список
          </button>
          <button
            type="button"
            className="chip-btn"
            title="Сохранить резервную копию всех записей в файл .json"
            onClick={onExportJson}
            style={{ fontSize: '11px', padding: '6px 10px' }}
          >
            💾 Сохранить файл
          </button>
          <button
            type="button"
            className="chip-btn"
            title="Загрузить ранее сохранённый файл с багами"
            onClick={() => fileInputRef.current?.click()}
            style={{ fontSize: '11px', padding: '6px 10px' }}
          >
            📂 Загрузить
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
          <button
            type="button"
            className="btn btn-primary"
            onClick={onCreate}
            style={{ fontSize: '12px', padding: '7px 16px', fontWeight: 700, letterSpacing: '0.02em' }}
          >
            + Добавить баг
          </button>
        </div>
      </div>

      {/* Панель фильтров: Табы важности слева, Сортировка/Статус/Поиск справа */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
        {/* Табы по степени важности */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {SEVERITY_TABS.map(tab => (
            <button
              key={tab.id}
              type="button"
              className={`chip-btn ${filter.severity === tab.id ? 'active' : ''}`}
              title={tab.hint}
              onClick={() => onFilterChange({ severity: tab.id })}
              style={{
                fontSize: '11.5px',
                padding: '6px 12px',
                fontWeight: filter.severity === tab.id ? 700 : 500
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Сортировка, статус и быстрый поиск */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          <select
            className="field"
            aria-label="Сортировка"
            value={filter.sortBy}
            onChange={event => onFilterChange({ sortBy: event.target.value as PlaytestFilterState['sortBy'] })}
            style={{
              padding: '6px 10px',
              fontSize: '11.5px',
              width: 'auto',
              background: '#0b101c',
              color: '#e2e8f0',
              borderColor: 'rgba(255,255,255,0.15)'
            }}
          >
            {SORT_OPTIONS.map(option => (
              <option key={option.id} value={option.id} style={{ background: '#0b101c', color: '#fff' }}>
                {option.label}
              </option>
            ))}
          </select>

          <select
            className="field"
            aria-label="Статус бага"
            value={filter.status}
            onChange={event => onFilterChange({ status: event.target.value as PlaytestFilterState['status'] })}
            style={{
              padding: '6px 10px',
              fontSize: '11.5px',
              width: 'auto',
              background: '#0b101c',
              color: '#e2e8f0',
              borderColor: 'rgba(255,255,255,0.15)'
            }}
          >
            {STATUS_FILTER_OPTIONS.map(option => (
              <option key={option.id} value={option.id} style={{ background: '#0b101c', color: '#fff' }}>
                {option.label}
              </option>
            ))}
          </select>

          <input
            className="field"
            aria-label="Поиск по журналу"
            placeholder="🔍 Поиск: название, комната, шаги..."
            value={filter.searchQuery}
            onChange={event => onFilterChange({ searchQuery: event.target.value })}
            style={{
              padding: '6px 12px',
              fontSize: '11.5px',
              width: '230px',
              background: '#0b101c',
              color: '#fff',
              borderColor: 'rgba(255,255,255,0.15)'
            }}
          />
        </div>
      </div>
    </div>
  );
};
