import { useEffect, useRef, useState } from 'react';
import { getRoomDimensions, RoomNode } from '../../entities/room-matrix';

export const CELL_WIDTH = 150;
export const CELL_HEIGHT = 125;
export const GAP = 20;
export const STEP_X = CELL_WIDTH + GAP; // 170
export const STEP_Y = CELL_HEIGHT + GAP; // 145

interface UseCanvasPanZoomProps {
  zoom: number;
  onZoomChange?: (newZoom: number) => void;
  initialPan?: { x: number; y: number };
}

export function useCanvasPanZoom({
  zoom,
  onZoomChange,
  initialPan = { x: 80, y: 60 }
}: UseCanvasPanZoomProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pan, setPan] = useState<{ x: number; y: number }>(initialPan);
  const [isPanning, setIsPanning] = useState(false);

  // Keep ref to avoid stale closures in event listeners
  const panRef = useRef(pan);
  panRef.current = pan;

  const zoomRef = useRef(zoom);
  zoomRef.current = zoom;

  const isPanningRef = useRef(false);
  const panStartRef = useRef<{ clientX: number; clientY: number; startPanX: number; startPanY: number }>({
    clientX: 0,
    clientY: 0,
    startPanX: 0,
    startPanY: 0
  });

  // Non-passive wheel event listener for cursor-centered zoom & scroll prevention
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const rect = el.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const currentZ = zoomRef.current;
      const currentP = panRef.current;

      const zoomFactor = e.deltaY < 0 ? 1.12 : 0.89;
      const rawZoom = currentZ * zoomFactor;
      const nextZoom = Math.min(2.5, Math.max(0.35, Math.round(rawZoom * 100) / 100));

      if (nextZoom === currentZ) return;

      // Anchor zoom around cursor position:
      // mouseX in world coords before: (mouseX - currentP.x) / currentZ
      // new pan should keep that world point at mouseX:
      const newPanX = mouseX - (mouseX - currentP.x) * (nextZoom / currentZ);
      const newPanY = mouseY - (mouseY - currentP.y) * (nextZoom / currentZ);

      setPan({ x: Math.round(newPanX), y: Math.round(newPanY) });
      if (onZoomChange) {
        onZoomChange(nextZoom);
      }
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      el.removeEventListener('wheel', handleWheel);
    };
  }, [onZoomChange]);

  // Window-level mouse listeners for middle-click / space drag pan
  useEffect(() => {
    const handleWindowMouseMove = (e: MouseEvent) => {
      if (!isPanningRef.current) return;
      const dx = e.clientX - panStartRef.current.clientX;
      const dy = e.clientY - panStartRef.current.clientY;
      const nextPan = {
        x: panStartRef.current.startPanX + dx,
        y: panStartRef.current.startPanY + dy
      };
      setPan(nextPan);
    };

    const handleWindowMouseUp = (e: MouseEvent) => {
      if (e.button === 1 || isPanningRef.current) {
        isPanningRef.current = false;
        setIsPanning(false);
      }
    };

    window.addEventListener('mousemove', handleWindowMouseMove);
    window.addEventListener('mouseup', handleWindowMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleWindowMouseMove);
      window.removeEventListener('mouseup', handleWindowMouseUp);
    };
  }, []);

  // Touch listeners for mobile: 1-finger canvas panning, 2-finger pinch-to-zoom
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let touchStartDist = 0;
    let initialZoom = 1;
    let touchStartPan = { x: 0, y: 0 };
    let touchStartCenter = { x: 0, y: 0 };
    let isTouchPanning = false;

    const getTouchDist = (t1: Touch, t2: Touch) => {
      const dx = t1.clientX - t2.clientX;
      const dy = t1.clientY - t2.clientY;
      return Math.sqrt(dx * dx + dy * dy);
    };

    const getTouchCenter = (t1: Touch, t2: Touch) => {
      return {
        x: (t1.clientX + t2.clientX) / 2,
        y: (t1.clientY + t2.clientY) / 2
      };
    };

    const handleTouchStart = (e: TouchEvent) => {
      const target = e.target as HTMLElement | null;
      // Do not intercept interactive elements
      if (target?.closest('button, input, select, textarea, .room-port-handle, .chip-btn')) {
        return;
      }

      if (e.touches.length === 2) {
        e.preventDefault();
        isTouchPanning = true;
        touchStartDist = getTouchDist(e.touches[0], e.touches[1]);
        initialZoom = zoomRef.current;
        touchStartPan = { ...panRef.current };
        touchStartCenter = getTouchCenter(e.touches[0], e.touches[1]);
      } else if (e.touches.length === 1) {
        // Only pan if touching canvas background (not inside a room card)
        const insideCard = target?.closest('.room-node-card');
        if (!insideCard) {
          isTouchPanning = true;
          touchStartPan = { ...panRef.current };
          touchStartCenter = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        }
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isTouchPanning) return;

      if (e.touches.length === 2) {
        e.preventDefault();
        const dist = getTouchDist(e.touches[0], e.touches[1]);
        const center = getTouchCenter(e.touches[0], e.touches[1]);
        const scale = dist / (touchStartDist || 1);
        const rawZoom = initialZoom * scale;
        const nextZoom = Math.min(2.2, Math.max(0.4, Math.round(rawZoom * 100) / 100));

        const dx = center.x - touchStartCenter.x;
        const dy = center.y - touchStartCenter.y;

        setPan({
          x: Math.round(touchStartPan.x + dx),
          y: Math.round(touchStartPan.y + dy)
        });

        if (onZoomChange && nextZoom !== zoomRef.current) {
          onZoomChange(nextZoom);
        }
      } else if (e.touches.length === 1) {
        e.preventDefault();
        const dx = e.touches[0].clientX - touchStartCenter.x;
        const dy = e.touches[0].clientY - touchStartCenter.y;
        setPan({
          x: Math.round(touchStartPan.x + dx),
          y: Math.round(touchStartPan.y + dy)
        });
      }
    };

    const handleTouchEnd = () => {
      isTouchPanning = false;
    };

    el.addEventListener('touchstart', handleTouchStart, { passive: false });
    el.addEventListener('touchmove', handleTouchMove, { passive: false });
    el.addEventListener('touchend', handleTouchEnd);
    el.addEventListener('touchcancel', handleTouchEnd);

    return () => {
      el.removeEventListener('touchstart', handleTouchStart);
      el.removeEventListener('touchmove', handleTouchMove);
      el.removeEventListener('touchend', handleTouchEnd);
      el.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [onZoomChange]);

  const handleMouseDown = (e: React.MouseEvent) => {
    // Middle mouse button (wheel press) or Space + Left button
    if (e.button === 1 || (e.button === 0 && e.shiftKey)) {
      e.preventDefault();
      e.stopPropagation();
      isPanningRef.current = true;
      setIsPanning(true);
      panStartRef.current = {
        clientX: e.clientX,
        clientY: e.clientY,
        startPanX: pan.x,
        startPanY: pan.y
      };
    }
  };

  const screenToWorld = (clientX: number, clientY: number): { x: number; y: number } => {
    const el = containerRef.current;
    if (!el) return { x: 0, y: 0 };
    const rect = el.getBoundingClientRect();
    return {
      x: (clientX - rect.left - pan.x) / zoom,
      y: (clientY - rect.top - pan.y) / zoom
    };
  };

  const resetView = () => {
    setPan({ x: 80, y: 60 });
    if (onZoomChange) {
      onZoomChange(1.0);
    }
  };

  const fitView = (rooms: RoomNode[]) => {
    const el = containerRef.current;
    if (!el || rooms.length === 0) {
      resetView();
      return;
    }
    const rect = el.getBoundingClientRect();

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    rooms.forEach(r => {
      const { width: w, height: h } = getRoomDimensions(r.size);
      const x1 = (r.gridX - 1) * STEP_X + 40;
      const y1 = (r.gridY - 1) * STEP_Y + 40;
      if (x1 < minX) minX = x1;
      if (y1 < minY) minY = y1;
      if (x1 + w > maxX) maxX = x1 + w;
      if (y1 + h > maxY) maxY = y1 + h;
    });

    const boxW = Math.max(300, maxX - minX + 80);
    const boxH = Math.max(200, maxY - minY + 80);

    const targetZoom = Math.min(1.2, Math.max(0.45, Math.min(rect.width / boxW, rect.height / boxH) * 0.9));
    const centerX = minX + boxW / 2;
    const centerY = minY + boxH / 2;

    const nextPanX = rect.width / 2 - centerX * targetZoom;
    const nextPanY = rect.height / 2 - centerY * targetZoom;

    setPan({ x: Math.round(nextPanX), y: Math.round(nextPanY) });
    if (onZoomChange) {
      onZoomChange(Math.round(targetZoom * 100) / 100);
    }
  };

  return {
    containerRef,
    pan,
    setPan,
    isPanning,
    handleMouseDown,
    screenToWorld,
    resetView,
    fitView
  };
}
