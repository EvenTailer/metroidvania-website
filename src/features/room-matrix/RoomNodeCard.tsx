import React from 'react';
import { Direction, getRoomDimensions, RoomNode, SectorInfo } from '../../entities/room-matrix';

interface RoomNodeCardProps {
  room: RoomNode;
  sector?: SectorInfo;
  isReachable: boolean;
  isSelected: boolean;
  isConnectingSource?: boolean;
  isConnectingActive?: boolean;
  snappedPortDir?: Direction | null;
  blockingReason?: string;
  onSelect: () => void;
  onStartDrag: (e: React.MouseEvent) => void;
  onStartConnect: (direction: Direction, e: React.MouseEvent) => void;
  onEndConnect: (direction: Direction) => void;
}

const TYPE_ICONS: Record<RoomNode['type'], string> = {
  save_point: '💾',
  boss: '👑',
  ability_shrine: '✨',
  transit: '🚪',
  secret: '❓',
  standard: '◻️'
};

const STATUS_LABELS: Record<RoomNode['status'], { label: string; color: string }> = {
  concept: { label: 'Концепт', color: '#94a3b8' },
  blocked_out: { label: 'Блокаут', color: '#eab308' },
  art_ready: { label: 'Арт готов', color: '#38bdf8' },
  tested: { label: 'Тест пройден', color: '#10b981' }
};

export const RoomNodeCard: React.FC<RoomNodeCardProps> = ({
  room,
  sector,
  isReachable,
  isSelected,
  isConnectingSource,
  isConnectingActive,
  snappedPortDir,
  blockingReason,
  onSelect,
  onStartDrag,
  onStartConnect,
  onEndConnect
}) => {
  const sectorColor = sector?.color || '#00d2ff';
  const statusInfo = STATUS_LABELS[room.status];
  const { width: cardWidth, height: cardHeight } = getRoomDimensions(room.size);

  const renderPort = (dir: Direction, positionStyle: React.CSSProperties, label: string) => {
    const isSnapped = snappedPortDir === dir;
    const isSource = isConnectingSource;

    let portBg = 'var(--accent-cyan)';
    let portBorder = '#0b0f19';
    let portShadow = '0 0 6px rgba(0, 210, 255, 0.6)';
    let transform = 'scale(1)';

    if (isSnapped) {
      portBg = '#10b981';
      portBorder = '#ffffff';
      portShadow = '0 0 14px rgba(16, 185, 129, 0.95)';
      transform = 'scale(1.4)';
    } else if (isSource) {
      portBg = 'var(--accent-purple)';
      portShadow = '0 0 10px rgba(168, 85, 247, 0.8)';
    } else if (isConnectingActive) {
      portBg = '#38bdf8';
      portShadow = '0 0 10px rgba(56, 189, 248, 0.8)';
      transform = 'scale(1.15)';
    }

    return (
      <div
        className="room-port-handle"
        style={{
          position: 'absolute',
          width: '14px',
          height: '14px',
          borderRadius: '50%',
          background: portBg,
          border: `2px solid ${portBorder}`,
          boxShadow: portShadow,
          cursor: 'crosshair',
          zIndex: 10,
          transform,
          transition: 'transform 0.15s ease, background 0.15s ease, box-shadow 0.15s ease',
          ...positionStyle
        }}
        title={`Тяните нить (${label}) или отпустите сюда`}
        onMouseDown={e => {
          if (e.button === 1) return; // Allow middle-click panning
          e.stopPropagation();
          onStartConnect(dir, e);
        }}
        onMouseUp={e => {
          if (e.button === 1) return;
          e.stopPropagation();
          onEndConnect(dir);
        }}
      />
    );
  };

  return (
    <div
      className={`room-node-card ${isSelected ? 'selected' : ''}`}
      onClick={onSelect}
      onMouseDown={e => {
        if (e.button === 1) return; // Allow middle-click canvas pan
        onStartDrag(e);
      }}
      onMouseUp={e => {
        if (e.button === 1) return;
        // If connecting, dropping on card defaults to closest direction or west
        onEndConnect(snappedPortDir || 'west');
      }}
      style={{
        position: 'relative',
        width: `${cardWidth}px`,
        height: `${cardHeight}px`,
        background: isSelected
          ? 'rgba(15, 23, 42, 0.96)'
          : isReachable
          ? 'rgba(15, 23, 42, 0.88)'
          : 'rgba(10, 15, 28, 0.72)',
        borderRadius: '10px',
        border: isSelected
          ? '2px solid var(--accent-cyan)'
          : isReachable
          ? `1px solid ${sectorColor}`
          : '1px dashed rgba(239, 68, 68, 0.55)',
        boxShadow: isSelected
          ? '0 0 20px rgba(0, 210, 255, 0.45), inset 0 0 10px rgba(0, 210, 255, 0.1)'
          : isReachable
          ? '0 6px 16px rgba(0, 0, 0, 0.5)'
          : 'none',
        opacity: isReachable ? 1 : 0.65,
        padding: '8px 10px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        cursor: 'grab',
        transition: 'box-shadow 0.18s ease-in-out, border-color 0.18s ease-in-out',
        userSelect: 'none'
      }}
    >
      {/* 4 Interactive Connection Ports (North, East, South, West) */}
      {renderPort('north', { top: '-7px', left: 'calc(50% - 7px)' }, 'Север')}
      {renderPort('east', { right: '-7px', top: 'calc(50% - 7px)' }, 'Восток')}
      {renderPort('south', { bottom: '-7px', left: 'calc(50% - 7px)' }, 'Юг')}
      {renderPort('west', { left: '-7px', top: 'calc(50% - 7px)' }, 'Запад')}

      {/* Optional Thumbnail Image */}
      {room.imageUrl && (
        <div
          style={{
            width: '100%',
            height: '42px',
            borderRadius: '6px',
            overflow: 'hidden',
            marginBottom: '6px',
            position: 'relative',
            background: '#040711',
            border: '1px solid rgba(255,255,255,0.1)'
          }}
        >
          <img
            src={room.imageUrl}
            alt={room.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to top, rgba(15,23,42,0.85) 0%, transparent 60%)'
            }}
          />
        </div>
      )}

      {/* Top Header */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
          <span
            style={{
              fontSize: '9.5px',
              fontWeight: 800,
              color: sectorColor,
              textTransform: 'uppercase',
              letterSpacing: '0.04em'
            }}
          >
            {sector?.code || 'SEC'} ({room.gridX},{room.gridY})
          </span>
          <span style={{ fontSize: '13px' }} title={`Тип: ${room.type}`}>
            {TYPE_ICONS[room.type]}
          </span>
        </div>

        <div
          style={{
            fontSize: '11.5px',
            fontWeight: 700,
            color: isReachable ? '#fff' : '#94a3b8',
            lineHeight: 1.25,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: room.size === '1x2' ? 3 : 2,
            WebkitBoxOrient: 'vertical'
          }}
        >
          {room.name}
        </div>
      </div>

      {/* Gating Status / Blocking badge */}
      <div>
        {!isReachable ? (
          <div
            style={{
              fontSize: '9.5px',
              fontWeight: 700,
              padding: '2px 4px',
              borderRadius: '4px',
              background: 'rgba(239, 68, 68, 0.2)',
              color: '#f87171',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              marginBottom: '4px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
            title={blockingReason || 'Заблокировано замком способности'}
          >
            🔒 {blockingReason || 'Заблокировано'}
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4px', marginBottom: '2px' }}>
            <span
              style={{
                fontSize: '9px',
                fontWeight: 600,
                padding: '1px 5px',
                borderRadius: '4px',
                background: 'rgba(255, 255, 255, 0.06)',
                color: statusInfo.color
              }}
            >
              {statusInfo.label}
            </span>
            {room.loot.length > 0 && (
              <span
                style={{
                  fontSize: '9px',
                  fontWeight: 600,
                  padding: '1px 5px',
                  borderRadius: '4px',
                  background: 'rgba(245, 158, 11, 0.15)',
                  color: '#fbbf24'
                }}
              >
                🎁 {room.loot.length}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
