import { GatingSimulationResult, RoomLock, RoomNode } from './types';

export function solveGatingProgression(
  rooms: RoomNode[],
  activeAbilities: string[],
  startRoomId: string = 'r-hub-base'
): GatingSimulationResult {
  const roomMap = new Map<string, RoomNode>();
  rooms.forEach(r => roomMap.set(r.id, r));

  const abilitySet = new Set<string>(activeAbilities);
  const reachableRoomIds = new Set<string>();
  const blockingLocks: { lock: RoomLock; fromRoomId: string; toRoomId: string }[] = [];

  const startRoom = roomMap.get(startRoomId) || rooms[0];
  if (!startRoom) {
    return {
      reachableRoomIds: new Set(),
      unlockedLoot: [],
      blockedRoomCount: 0,
      blockingLocks: []
    };
  }

  const queue: string[] = [startRoom.id];
  reachableRoomIds.add(startRoom.id);

  while (queue.length > 0) {
    const currentId = queue.shift()!;
    const currentRoom = roomMap.get(currentId);
    if (!currentRoom) continue;

    for (const conn of currentRoom.connections) {
      const targetRoom = roomMap.get(conn.targetRoomId);
      if (!targetRoom) continue;

      if (conn.lock) {
        const canPass = abilitySet.has(conn.lock.requiredAbilityId);
        if (canPass) {
          if (!reachableRoomIds.has(targetRoom.id)) {
            reachableRoomIds.add(targetRoom.id);
            queue.push(targetRoom.id);
          }
        } else {
          blockingLocks.push({
            lock: conn.lock,
            fromRoomId: currentRoom.id,
            toRoomId: targetRoom.id
          });
        }
      } else {
        if (!reachableRoomIds.has(targetRoom.id)) {
          reachableRoomIds.add(targetRoom.id);
          queue.push(targetRoom.id);
        }
      }
    }
  }

  const unlockedLoot = rooms
    .filter(r => reachableRoomIds.has(r.id))
    .flatMap(r => r.loot);

  return {
    reachableRoomIds,
    unlockedLoot,
    blockedRoomCount: Math.max(0, rooms.length - reachableRoomIds.size),
    blockingLocks
  };
}
