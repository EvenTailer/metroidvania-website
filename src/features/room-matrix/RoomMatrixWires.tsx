import React from 'react';
import { Direction, GatingSimulationResult, RoomLock, RoomNode } from '../../entities/room-matrix';

export interface ConnectingWireState {
  fromRoomId: string;
  fromDirection: Direction;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  targetRoomId: string | null;
  targetDirection: Direction | null;
}

interface RoomMatrixWiresProps {
  rooms: RoomNode[];
  roomMap: Map<string, RoomNode>;
  gatingResult: GatingSimulationResult;
  dragRoomId: string | null;
  dragGridPos: { x: number; y: number } | null;
  connecting: ConnectingWireState | null;
  getPortCoords: (room: RoomNode, dir: Direction, gX?: number, gY?: number) => { x: number; y: number };
  onOpenConnectionEdit: (fromRoomId: string, toRoomId: string, lock?: RoomLock) => void;
}

function getOppositeDirection(dir: Direction): Direction {
  switch (dir) {
    case 'north': return 'south';
    case 'south': return 'north';
    case 'east': return 'west';
    case 'west': return 'east';
  }
}

export function createBezierPath(
  p1: { x: number; y: number },
  dir1: Direction,
  p2: { x: number; y: number },
  dir2?: Direction | null
): { path: string; midX: number; midY: number } {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const dist = Math.hypot(dx, dy);
  const curvature = Math.max(35, Math.min(220, dist * 0.45));

  let cp1x = p1.x;
  let cp1y = p1.y;
  switch (dir1) {
    case 'east': cp1x += curvature; break;
    case 'west': cp1x -= curvature; break;
    case 'south': cp1y += curvature; break;
    case 'north': cp1y -= curvature; break;
  }

  let cp2x = p2.x;
  let cp2y = p2.y;
  if (dir2) {
    switch (dir2) {
      case 'east': cp2x += curvature; break;
      case 'west': cp2x -= curvature; break;
      case 'south': cp2y += curvature; break;
      case 'north': cp2y -= curvature; break;
    }
  } else {
    switch (dir1) {
      case 'east': cp2x -= curvature * 0.5; break;
      case 'west': cp2x += curvature * 0.5; break;
      case 'south': cp2y += curvature * 0.5; break;
      case 'north': cp2y += curvature * 0.5; break;
    }
  }

  // Exact mid-point at t = 0.5 on cubic bezier curve
  const midX = 0.125 * p1.x + 0.375 * cp1x + 0.375 * cp2x + 0.125 * p2.x;
  const midY = 0.125 * p1.y + 0.375 * cp1y + 0.375 * cp2y + 0.125 * p2.y;

  return {
    path: `M ${p1.x} ${p1.y} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`,
    midX,
    midY
  };
}

const DIR_LABELS: Record<Direction, string> = {
  north: 'Север',
  east: 'Восток',
  south: 'Юг',
  west: 'Запад'
};

export const RoomMatrixWires: React.FC<RoomMatrixWiresProps> = ({
  rooms,
  roomMap,
  gatingResult,
  dragRoomId,
  dragGridPos,
  connecting,
  getPortCoords,
  onOpenConnectionEdit
}) => {
  // Build unique existing connections list
  const existingConnections = React.useMemo(() => {
    const list: {
      key: string;
      fromRoomId: string;
      toRoomId: string;
      path: string;
      midX: number;
      midY: number;
      isLocked: boolean;
      lock?: RoomLock;
    }[] = [];

    const seen = new Set<string>();

    rooms.forEach(fromRoom => {
      fromRoom.connections.forEach(conn => {
        const toRoom = roomMap.get(conn.targetRoomId);
        if (!toRoom) return;

        const pairKey = [fromRoom.id, toRoom.id].sort().join('--');
        if (seen.has(pairKey)) return;
        seen.add(pairKey);

        const gX1 = dragRoomId === fromRoom.id && dragGridPos ? dragGridPos.x : fromRoom.gridX;
        const gY1 = dragRoomId === fromRoom.id && dragGridPos ? dragGridPos.y : fromRoom.gridY;
        const gX2 = dragRoomId === toRoom.id && dragGridPos ? dragGridPos.x : toRoom.gridX;
        const gY2 = dragRoomId === toRoom.id && dragGridPos ? dragGridPos.y : toRoom.gridY;

        const toConn = toRoom.connections.find(c => c.targetRoomId === fromRoom.id);
        const toDir = toConn?.direction || getOppositeDirection(conn.direction);

        const p1 = getPortCoords(fromRoom, conn.direction, gX1, gY1);
        const p2 = getPortCoords(toRoom, toDir, gX2, gY2);

        const { path, midX, midY } = createBezierPath(p1, conn.direction, p2, toDir);

        const isLocked = Boolean(
          conn.lock && gatingResult.blockingLocks.some(b => b.lock.id === conn.lock?.id)
        );

        list.push({
          key: pairKey,
          fromRoomId: fromRoom.id,
          toRoomId: toRoom.id,
          path,
          midX,
          midY,
          isLocked,
          lock: conn.lock
        });
      });
    });

    return list;
  }, [rooms, roomMap, gatingResult, dragRoomId, dragGridPos, getPortCoords]);

  // Live connecting wire calculation
  const liveWire = React.useMemo(() => {
    if (!connecting) return null;
    const { path, midX, midY } = createBezierPath(
      { x: connecting.startX, y: connecting.startY },
      connecting.fromDirection,
      { x: connecting.currentX, y: connecting.currentY },
      connecting.targetDirection
    );
    const targetRoom = connecting.targetRoomId ? roomMap.get(connecting.targetRoomId) : null;
    return {
      path,
      midX,
      midY,
      targetRoom,
      isSnapped: Boolean(connecting.targetRoomId && connecting.targetDirection)
    };
  }, [connecting, roomMap]);

  return (
    <>
      {/* 1. LAYER UNDER ROOMS: Corridor Pathways, Neon Wires, and Badges (zIndex: 2) */}
      <svg
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '6000px',
          height: '4000px',
          overflow: 'visible',
          pointerEvents: 'none',
          zIndex: 2
        }}
      >
        <defs>
          <linearGradient id="wire-cyan-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00d2ff" />
            <stop offset="50%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#00d2ff" />
          </linearGradient>
          <linearGradient id="wire-red-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="50%" stopColor="#f87171" />
            <stop offset="100%" stopColor="#ef4444" />
          </linearGradient>
        </defs>

        {existingConnections.map(c => {
          const strokeColor = c.isLocked ? '#ef4444' : '#00d2ff';
          const corridorBorder = c.isLocked ? 'rgba(239, 68, 68, 0.45)' : 'rgba(0, 210, 255, 0.4)';

          return (
            <g key={c.key} className="room-wire-group">
              {/* Outer Corridor Trench / Subway Path */}
              <path
                d={c.path}
                fill="none"
                stroke="rgba(6, 10, 18, 0.95)"
                strokeWidth="22"
                strokeLinecap="round"
              />
              {/* Corridor Glowing Edge Track */}
              <path
                d={c.path}
                fill="none"
                stroke={corridorBorder}
                strokeWidth="18"
                strokeLinecap="round"
              />
              {/* Corridor Inner Pathway */}
              <path
                d={c.path}
                fill="none"
                stroke="#080e1b"
                strokeWidth="12"
                strokeLinecap="round"
              />

              {/* Core Neon Conduit Cable */}
              <path
                d={c.path}
                fill="none"
                stroke={strokeColor}
                strokeWidth={c.isLocked ? 3.5 : 3}
                strokeDasharray={c.isLocked ? '8 5' : 'none'}
                strokeLinecap="round"
                style={{
                  filter: c.isLocked
                    ? 'drop-shadow(0 0 6px rgba(239,68,68,0.8))'
                    : 'drop-shadow(0 0 6px rgba(0,210,255,0.85))'
                }}
              />

              {/* Interactive Lock / Link Badge in the center of the pathway */}
              <g
                transform={`translate(${c.midX}, ${c.midY})`}
                style={{ pointerEvents: 'auto', cursor: 'pointer' }}
                onClick={() => onOpenConnectionEdit(c.fromRoomId, c.toRoomId, c.lock)}
              >
                <circle
                  r="13"
                  fill={c.isLocked ? '#7f1d1d' : '#042f2e'}
                  stroke={c.isLocked ? '#ef4444' : '#14b8a6'}
                  strokeWidth="2"
                  style={{
                    filter: c.isLocked
                      ? 'drop-shadow(0 0 8px rgba(239,68,68,0.8))'
                      : 'drop-shadow(0 0 8px rgba(20,184,166,0.7))',
                    transition: 'transform 0.15s ease'
                  }}
                >
                  <title>
                    {c.lock
                      ? `Замок: ${c.lock.label} (кликните для изменения или удаления связи)`
                      : 'Свободный проход (кликните для настройки замка или удаления связи)'}
                  </title>
                </circle>
                <text
                  y="4"
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize="11"
                  fontWeight="bold"
                  style={{ pointerEvents: 'none', userSelect: 'none' }}
                >
                  {c.isLocked ? '🔒' : '🔗'}
                </text>
              </g>
            </g>
          );
        })}
      </svg>

      {/* 2. LAYER OVER ROOMS: Active Live Wire being actively pulled across the canvas (zIndex: 35) */}
      {liveWire && connecting && (
        <svg
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '6000px',
            height: '4000px',
            overflow: 'visible',
            pointerEvents: 'none',
            zIndex: 35
          }}
        >
          <defs>
            <linearGradient id="live-wire-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#00d2ff" />
              <stop offset="50%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
          </defs>

          <g className="live-connecting-wire">
            {/* Broad outer corridor glow */}
            <path
              d={liveWire.path}
              fill="none"
              stroke="rgba(6, 10, 18, 0.85)"
              strokeWidth="20"
              strokeLinecap="round"
            />
            <path
              d={liveWire.path}
              fill="none"
              stroke={liveWire.isSnapped ? 'rgba(16, 185, 129, 0.5)' : 'rgba(0, 210, 255, 0.45)'}
              strokeWidth="16"
              strokeLinecap="round"
            />
            {/* Dark inner track */}
            <path
              d={liveWire.path}
              fill="none"
              stroke="#080e1b"
              strokeWidth="10"
              strokeLinecap="round"
            />
            {/* Main wire core */}
            <path
              d={liveWire.path}
              fill="none"
              stroke={liveWire.isSnapped ? '#10b981' : 'url(#live-wire-grad)'}
              strokeWidth="3.5"
              strokeLinecap="round"
              style={{
                filter: liveWire.isSnapped
                  ? 'drop-shadow(0 0 8px #10b981)'
                  : 'drop-shadow(0 0 8px #00d2ff)'
              }}
            />
            {/* Animated pulsing electric dashed stream */}
            <path
              d={liveWire.path}
              fill="none"
              stroke="#ffffff"
              strokeWidth="2"
              strokeDasharray="6 8"
              className="wire-laser-pulse"
              strokeLinecap="round"
            />

            {/* Starting Port Pin Indicator */}
            <circle
              cx={connecting.startX}
              cy={connecting.startY}
              r="7"
              fill="#00d2ff"
              stroke="#ffffff"
              strokeWidth="2"
              style={{ filter: 'drop-shadow(0 0 8px #00d2ff)' }}
            />

            {/* Current Tip / Plug Circle */}
            <circle
              cx={connecting.currentX}
              cy={connecting.currentY}
              r={liveWire.isSnapped ? 9 : 7}
              fill={liveWire.isSnapped ? '#10b981' : '#a855f7'}
              stroke="#ffffff"
              strokeWidth="2"
              style={{
                filter: liveWire.isSnapped
                  ? 'drop-shadow(0 0 12px #10b981)'
                  : 'drop-shadow(0 0 10px #a855f7)'
              }}
            />

            {/* Magnetic Snap Target Ring */}
            {liveWire.isSnapped && (
              <circle
                cx={connecting.currentX}
                cy={connecting.currentY}
                r="16"
                fill="none"
                stroke="#10b981"
                strokeWidth="2.5"
                strokeDasharray="4 3"
                className="snap-pulse"
              />
            )}

            {/* Floating Live Tooltip Pill */}
            <g transform={`translate(${connecting.currentX + 16}, ${connecting.currentY - 16})`}>
              <rect
                rx="6"
                ry="6"
                x="0"
                y="-18"
                width={liveWire.isSnapped ? 250 : 185}
                height="28"
                fill="rgba(11, 16, 28, 0.96)"
                stroke={liveWire.isSnapped ? '#10b981' : '#00d2ff'}
                strokeWidth="1.4"
                style={{ filter: 'drop-shadow(0 4px 14px rgba(0,0,0,0.75))' }}
              />
              <text
                x="10"
                y="0"
                fill={liveWire.isSnapped ? '#a7f3d0' : '#bae6fd'}
                fontSize="11.5"
                fontWeight="700"
                style={{ userSelect: 'none' }}
              >
                {liveWire.isSnapped && liveWire.targetRoom && connecting.targetDirection
                  ? `✓ Отпустите: «${liveWire.targetRoom.name.slice(0, 16)}» (${DIR_LABELS[connecting.targetDirection]})`
                  : '⚡ Тяните к точке комнаты'}
              </text>
            </g>
          </g>
        </svg>
      )}
    </>
  );
};
