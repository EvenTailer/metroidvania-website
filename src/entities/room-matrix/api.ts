import type { RoomNode, SectorInfo } from './types';

export interface RoomMatrixSnapshot {
  initialized: boolean;
  rooms: RoomNode[];
  sectors: SectorInfo[];
}

export async function fetchRoomMatrixFromServer(): Promise<RoomMatrixSnapshot> {
  const res = await fetch('/api/matrix.php');
  if (!res.ok) throw new Error(`Matrix fetch failed: ${res.status}`);
  const data = await res.json();
  return {
    initialized: Boolean(data.initialized),
    rooms: Array.isArray(data.rooms) ? data.rooms : [],
    sectors: Array.isArray(data.sectors) ? data.sectors : []
  };
}

export async function saveRoomMatrixToServer(rooms: RoomNode[], sectors: SectorInfo[]): Promise<void> {
  const res = await fetch('/api/matrix.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rooms, sectors })
  });
  if (!res.ok) throw new Error(`Matrix save failed: ${res.status}`);
}
