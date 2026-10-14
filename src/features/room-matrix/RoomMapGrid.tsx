import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Direction,
  GatingSimulationResult,
  getRoomDimensions,
  RoomLock,
  RoomNode,
  SectorInfo
} from '../../entities/room-matrix';
import { CanvasNavHud } from './CanvasNavHud';
import { ConnectingWireState, RoomMatrixWires } from './RoomMatrixWires';
import { RoomNodeCard } from './RoomNodeCard';
import {
  CELL_HEIGHT,
  CELL_WIDTH,
  STEP_X,
  STEP_Y,
  useCanvasPanZoom
} from './useCanvasPanZoom';

interface RoomMapGridProps {
  rooms: RoomNode[];
  sectors: SectorInfo[];
  selectedRoomId: string | null;
  activeSectorId: string | 'all';
  gatingResult: GatingSimulationResult;
  zoom: number;
  onZoomChange?: (newZoom: number) => void;
  onSelectRoom: (id: string) => void;
  onMoveRoomToPosition: (id: string, gridX: number, gridY: number) => void;
  onConnectRooms: (
    fromRoomId: string,
    toRoomId: string,
    fromDirection: Direction,
    toDirection?: Direction
  ) => void;
  onOpenConnectionEdit: (fromRoomId: string, toRoomId: string, lock?: RoomLock) => void;
  onDoubleClickCanvas: (gridX: number, gridY: number) => void;
}

interface DragRoomState {
  roomId: string;
  startClientX: number;
  startClientY: number;
  startGridX: number;
  startGridY: number;
  currentGridX: number;
  currentGridY: number;
}

export const RoomMapGrid: React.FC<RoomMapGridProps> = ({
  rooms,
  sectors,
  selectedRoomId,
  activeSectorId,
  gatingResult,
  zoom,
  onZoomChange,
  onSelectRoom,
  onMoveRoomToPosition,
  onConnectRooms,
  onOpenConnectionEdit,
  onDoubleClickCanvas
}) => {
  const {
    containerRef,
    pan,
    isPanning,
    handleMouseDown: handlePanMouseDown,
    screenToWorld,
    resetView,
    fitView
  } = useCanvasPanZoom({
    zoom,
    onZoomChange,
    initialPan: { x: 70, y: 50 }
  });

  const [dragRoom, setDragRoom] = useState<DragRoomState | null>(null);
  const [connecting, setConnecting] = useState<ConnectingWireState | null>(null);

  const sectorMap = useMemo(() => {
    const map = new Map<string, SectorInfo>();
    sectors.forEach(s => map.set(s.id, s));
    return map;
  }, [sectors]);

  const roomMap = useMemo(() => {
    const map = new Map<string, RoomNode>();
    rooms.forEach(r => map.set(r.id, r));
    return map;
  }, [rooms]);

  const getRoomDims = (room: RoomNode) => {
    const { width, height } = getRoomDimensions(room.size);
    return { w: width, h: height };
  };

  const getPortCoords = (room: RoomNode, dir: Direction, gX?: number, gY?: number) => {
    const posX = gX ?? room.gridX;
    const posY = gY ?? room.gridY;
    const { w, h } = getRoomDims(room);
    const left = (posX - 1) * STEP_X + 40;
    const top = (posY - 1) * STEP_Y + 40;

    switch (dir) {
      case 'north': return { x: left + w / 2, y: top };
      case 'east': return { x: left + w, y: top + h / 2 };
      case 'south': return { x: left + w / 2, y: top + h };
      case 'west': return { x: left, y: top + h / 2 };
    }
  };

  // Find nearest magnetic port across other rooms
  const findSnapPort = (worldX: number, worldY: number, excludeRoomId: string) => {
    let closest: { roomId: string; direction: Direction; x: number; y: number } | null = null;
    let minDist = 42; // magnetic snap distance

    const directions: Direction[] = ['north', 'east', 'south', 'west'];

    for (const room of rooms) {
      if (room.id === excludeRoomId) continue;
      const gX = dragRoom?.roomId === room.id ? dragRoom.currentGridX : room.gridX;
      const gY = dragRoom?.roomId === room.id ? dragRoom.currentGridY : room.gridY;

      for (const dir of directions) {
        const pt = getPortCoords(room, dir, gX, gY);
        const dist = Math.hypot(worldX - pt.x, worldY - pt.y);
        if (dist < minDist) {
          minDist = dist;
          closest = { roomId: room.id, direction: dir, x: pt.x, y: pt.y };
        }
      }
    }

    // If not snapped to a port, check if cursor is over room body to snap to closest port of that room
    if (!closest) {
      for (const room of rooms) {
        if (room.id === excludeRoomId) continue;
        const gX = dragRoom?.roomId === room.id ? dragRoom.currentGridX : room.gridX;
        const gY = dragRoom?.roomId === room.id ? dragRoom.currentGridY : room.gridY;
        const left = (gX - 1) * STEP_X + 40;
        const top = (gY - 1) * STEP_Y + 40;
        const { w, h } = getRoomDims(room);

        if (worldX >= left && worldX <= left + w && worldY >= top && worldY <= top + h) {
          // Inside room body: pick closest of the 4 ports
          let localMin = Infinity;
          let localDir: Direction = 'west';
          let localPt = { x: left, y: top + h / 2 };

          for (const dir of directions) {
            const pt = getPortCoords(room, dir, gX, gY);
            const dist = Math.hypot(worldX - pt.x, worldY - pt.y);
            if (dist < localMin) {
              localMin = dist;
              localDir = dir;
              localPt = pt;
            }
          }

          closest = { roomId: room.id, direction: localDir, x: localPt.x, y: localPt.y };
          break;
        }
      }
    }

    return closest;
  };

  // Global mouse handlers on window for rock-solid drag and wire connection
  const dragRoomRef = useRef(dragRoom);
  dragRoomRef.current = dragRoom;

  const connectingRef = useRef(connecting);
  connectingRef.current = connecting;

  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      // 1. Room Card Dragging
      if (dragRoomRef.current) {
        const d = dragRoomRef.current;
        const deltaClientX = (e.clientX - d.startClientX) / zoom;
        const deltaClientY = (e.clientY - d.startClientY) / zoom;

        const nextGridX = Math.max(1, Math.round(d.startGridX + deltaClientX / STEP_X));
        const nextGridY = Math.max(1, Math.round(d.startGridY + deltaClientY / STEP_Y));

        if (nextGridX !== d.currentGridX || nextGridY !== d.currentGridY) {
          setDragRoom({ ...d, currentGridX: nextGridX, currentGridY: nextGridY });
        }
      }

      // 2. Wire Pulling / Connecting
      if (connectingRef.current) {
        const c = connectingRef.current;
        const world = screenToWorld(e.clientX, e.clientY);
        const snap = findSnapPort(world.x, world.y, c.fromRoomId);

        setConnecting({
          ...c,
          currentX: snap ? snap.x : world.x,
          currentY: snap ? snap.y : world.y,
          targetRoomId: snap ? snap.roomId : null,
          targetDirection: snap ? snap.direction : null
        });
      }
    };

    const handleGlobalMouseUp = () => {
      // Finish Room Move
      if (dragRoomRef.current) {
        const d = dragRoomRef.current;
        if (d.currentGridX !== d.startGridX || d.currentGridY !== d.startGridY) {
          onMoveRoomToPosition(d.roomId, d.currentGridX, d.currentGridY);
        }
        setDragRoom(null);
      }

      // Finish Wire Connect
      if (connectingRef.current) {
        const c = connectingRef.current;
        if (c.targetRoomId && c.targetDirection && c.targetRoomId !== c.fromRoomId) {
          onConnectRooms(c.fromRoomId, c.targetRoomId, c.fromDirection, c.targetDirection);
        }
        setConnecting(null);
      }
    };

    window.addEventListener('mousemove', handleGlobalMouseMove);
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [zoom, rooms, onMoveRoomToPosition, onConnectRooms]);

  const handleStartDragCard = (roomId: string, e: React.MouseEvent) => {
    if (e.button === 1) return; // Middle click handled by pan
    e.stopPropagation();
    const room = roomMap.get(roomId);
    if (!room) return;
    onSelectRoom(roomId);
    setDragRoom({
      roomId,
      startClientX: e.clientX,
      startClientY: e.clientY,
      startGridX: room.gridX,
      startGridY: room.gridY,
      currentGridX: room.gridX,
      currentGridY: room.gridY
    });
  };

  const handleStartConnect = (roomId: string, direction: Direction, e: React.MouseEvent) => {
    if (e.button === 1) return;
    e.stopPropagation();
    const room = roomMap.get(roomId);
    if (!room) return;
    const pt = getPortCoords(room, direction);
    setConnecting({
      fromRoomId: roomId,
      fromDirection: direction,
      startX: pt.x,
      startY: pt.y,
      currentX: pt.x,
      currentY: pt.y,
      targetRoomId: null,
      targetDirection: null
    });
  };

  const handleEndConnect = (targetRoomId: string, targetDirection?: Direction) => {
    if (connecting && connecting.fromRoomId !== targetRoomId) {
      onConnectRooms(
        connecting.fromRoomId,
        targetRoomId,
        connecting.fromDirection,
        targetDirection || 'west'
      );
    }
    setConnecting(null);
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    const world = screenToWorld(e.clientX, e.clientY);
    const targetGridX = Math.max(1, Math.round((world.x - 40) / STEP_X) + 1);
    const targetGridY = Math.max(1, Math.round((world.y - 40) / STEP_Y) + 1);
    onDoubleClickCanvas(targetGridX, targetGridY);
  };

  return (
    <div
      ref={containerRef}
      onMouseDown={handlePanMouseDown}
      onDoubleClick={handleDoubleClick}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        minHeight: '580px',
        overflow: 'hidden',
        background: 'radial-gradient(circle at 50% 50%, rgba(15, 23, 42, 0.95) 0%, #070a12 100%)',
        border: '1px solid rgba(0, 210, 255, 0.25)',
        borderRadius: '12px',
        boxShadow: 'inset 0 0 45px rgba(0, 0, 0, 0.9)',
        cursor: isPanning ? 'grabbing' : dragRoom ? 'grabbing' : connecting ? 'crosshair' : 'default',
        userSelect: 'none'
      }}
    >
      {/* Infinite Grid Background that moves with pan and scales with zoom */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            linear-gradient(to right, rgba(0, 210, 255, 0.06) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0, 210, 255, 0.06) 1px, transparent 1px)
          `,
          backgroundPosition: `${pan.x}px ${pan.y}px`,
          backgroundSize: `${STEP_X * zoom}px ${STEP_Y * zoom}px`,
          pointerEvents: 'none'
        }}
      />

      {/* World Transform Layer */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '6000px',
          height: '4000px',
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: '0 0',
          transition: isPanning || dragRoom || connecting ? 'none' : 'transform 0.1s ease-out',
          pointerEvents: 'none'
        }}
      >
        {/* SVG Wires Layer */}
        <RoomMatrixWires
          rooms={rooms}
          roomMap={roomMap}
          gatingResult={gatingResult}
          dragRoomId={dragRoom ? dragRoom.roomId : null}
          dragGridPos={dragRoom ? { x: dragRoom.currentGridX, y: dragRoom.currentGridY } : null}
          connecting={connecting}
          getPortCoords={getPortCoords}
          onOpenConnectionEdit={onOpenConnectionEdit}
        />

        {/* Room Nodes */}
        {rooms.map(room => {
          const isReachable = gatingResult.reachableRoomIds.has(room.id);
          const isSelected = selectedRoomId === room.id;
          const sector = sectorMap.get(room.sectorId);
          const isVisibleByFilter = activeSectorId === 'all' || room.sectorId === activeSectorId;

          const blockInfo = gatingResult.blockingLocks.find(b => b.toRoomId === room.id);
          const blockingReason = blockInfo ? blockInfo.lock.label : undefined;

          const gX = dragRoom?.roomId === room.id ? dragRoom.currentGridX : room.gridX;
          const gY = dragRoom?.roomId === room.id ? dragRoom.currentGridY : room.gridY;

          const left = (gX - 1) * STEP_X + 40;
          const top = (gY - 1) * STEP_Y + 40;

          const isSource = connecting?.fromRoomId === room.id;
          const isSnapped = connecting?.targetRoomId === room.id;
          const snappedPort = isSnapped ? connecting?.targetDirection : null;

          return (
            <div
              key={room.id}
              style={{
                position: 'absolute',
                left: `${left}px`,
                top: `${top}px`,
                opacity: isVisibleByFilter ? 1 : 0.25,
                transition: dragRoom?.roomId === room.id ? 'none' : 'all 0.15s ease-out',
                zIndex: dragRoom?.roomId === room.id ? 25 : isSelected ? 15 : 10,
                pointerEvents: 'auto'
              }}
            >
              <RoomNodeCard
                room={room}
                sector={sector}
                isReachable={isReachable}
                isSelected={isSelected}
                isConnectingSource={isSource}
                isConnectingActive={Boolean(connecting && !isSource)}
                snappedPortDir={snappedPort}
                blockingReason={blockingReason}
                onSelect={() => onSelectRoom(room.id)}
                onStartDrag={e => handleStartDragCard(room.id, e)}
                onStartConnect={(dir, e) => handleStartConnect(room.id, dir, e)}
                onEndConnect={dir => handleEndConnect(room.id, dir)}
              />
            </div>
          );
        })}
      </div>

      {/* Floating Canvas Navigation HUD */}
      <CanvasNavHud
        zoom={zoom}
        onZoomChange={delta => {
          if (onZoomChange) {
            const next = Math.min(2.4, Math.max(0.35, Math.round((zoom + delta) * 10) / 10));
            onZoomChange(next);
          }
        }}
        onResetView={resetView}
        onFitView={() => fitView(rooms)}
      />
    </div>
  );
};
