import React from 'react';
import { RoomSize } from '../../entities/room-matrix';

interface RoomSizeOption {
  id: RoomSize;
  title: string;
  subtitle: string;
  cols: number;
  rows: number;
  pixels: string;
  hint: string;
}

const SIZE_OPTIONS: RoomSizeOption[] = [
  {
    id: '1x1',
    title: '1×1 Стандарт',
    subtitle: 'Базовая комната',
    cols: 1,
    rows: 1,
    pixels: '150 × 125 px',
    hint: 'Терминал, одиночный зал, магазин'
  },
  {
    id: '2x1',
    title: '2×1 Широкая',
    subtitle: 'Горизонтальный зал',
    cols: 2,
    rows: 1,
    pixels: '320 × 125 px',
    hint: 'Улица, переулок, коридор с врагами'
  },
  {
    id: '1x2',
    title: '1×2 Высокая',
    subtitle: 'Вертикальная шахта',
    cols: 1,
    rows: 2,
    pixels: '150 × 270 px',
    hint: 'Лифтовый ствол, шахта кабелей'
  },
  {
    id: '2x2',
    title: '2×2 Арена',
    subtitle: 'Большой комплекс',
    cols: 2,
    rows: 2,
    pixels: '320 × 270 px',
    hint: 'Логово босса, храм улучшений'
  },
  {
    id: '3x1',
    title: '3×1 Магистраль',
    subtitle: 'Длинный транзит',
    cols: 3,
    rows: 1,
    pixels: '490 × 125 px',
    hint: 'Шоссе, мост, длинный тоннель'
  },
  {
    id: '3x2',
    title: '3×2 Мега-зона',
    subtitle: 'Огромный сектор',
    cols: 3,
    rows: 2,
    pixels: '490 × 270 px',
    hint: 'Заводской цех, ядро реактора'
  }
];

interface RoomSizeSelectorProps {
  value: RoomSize;
  onChange: (size: RoomSize) => void;
  sectorColor?: string;
}

export const RoomSizeSelector: React.FC<RoomSizeSelectorProps> = ({
  value,
  onChange,
  sectorColor = '#00d2ff'
}) => {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <label className="composer-label" style={{ margin: 0, fontWeight: 700, color: '#fff' }}>
          Размер и габариты комнаты на сетке мира
        </label>
        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
          Выберите формат локации:
        </span>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
          gap: '8px'
        }}
      >
        {SIZE_OPTIONS.map(opt => {
          const isSelected = value === opt.id;
          return (
            <div
              key={opt.id}
              onClick={() => onChange(opt.id)}
              style={{
                position: 'relative',
                padding: '10px',
                borderRadius: '8px',
                background: isSelected ? 'rgba(0, 210, 255, 0.12)' : 'rgba(15, 23, 42, 0.65)',
                border: isSelected ? `2px solid ${sectorColor}` : '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: isSelected ? `0 0 14px ${sectorColor}33, inset 0 0 10px ${sectorColor}11` : 'none',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 800, color: isSelected ? '#fff' : '#cbd5e1' }}>
                    {opt.title}
                  </div>
                  <div style={{ fontSize: '10px', color: sectorColor, fontWeight: 600 }}>
                    {opt.pixels}
                  </div>
                </div>

                {/* Mini Visual Grid Box */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 11px)',
                    gridTemplateRows: 'repeat(2, 9px)',
                    gap: '2px',
                    background: 'rgba(0, 0, 0, 0.4)',
                    padding: '3px',
                    borderRadius: '4px',
                    border: '1px solid rgba(255, 255, 255, 0.08)'
                  }}
                >
                  {[0, 1].map(r =>
                    [0, 1, 2].map(c => {
                      const isActive = c < opt.cols && r < opt.rows;
                      return (
                        <div
                          key={`${r}-${c}`}
                          style={{
                            borderRadius: '1px',
                            background: isActive
                              ? sectorColor
                              : 'rgba(255, 255, 255, 0.08)',
                            boxShadow: isActive ? `0 0 4px ${sectorColor}` : 'none'
                          }}
                        />
                      );
                    })
                  )}
                </div>
              </div>

              <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', lineHeight: 1.3 }}>
                {opt.hint}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
