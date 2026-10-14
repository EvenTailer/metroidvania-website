import React from 'react';
import { RoomNode } from '../../entities/room-matrix';
import { FieldHint } from './FieldHint';

interface EnemySpawnFieldsProps {
  rooms: RoomNode[];
  sectorId: string;
  spawnRoomIds: string[];
  onChange: (spawnRoomIds: string[]) => void;
}

export const EnemySpawnFields: React.FC<EnemySpawnFieldsProps> = ({
  rooms,
  sectorId,
  spawnRoomIds,
  onChange
}) => {
  const sectorRooms = rooms.filter(room => room.sectorId === sectorId);
  const outside = spawnRoomIds.filter(id => !sectorRooms.some(room => room.id === id));

  const toggle = (roomId: string) => {
    if (spawnRoomIds.includes(roomId)) {
      onChange(spawnRoomIds.filter(id => id !== roomId));
      return;
    }
    onChange([...spawnRoomIds, roomId]);
  };

  return (
    <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '10px' }}>
      <span className="composer-label">Комнаты, где он появляется</span>
      <FieldHint>Список берётся из выбранного сектора. На карточке эти комнаты станут кнопками и откроют карту.</FieldHint>
      {sectorRooms.length === 0 ? (
        <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)' }}>
          В этом секторе пока нет комнат на карте.
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {sectorRooms.map(room => (
            <label key={room.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#e2e8f0' }}>
              <input
                type="checkbox"
                checked={spawnRoomIds.includes(room.id)}
                onChange={() => toggle(room.id)}
              />
              {room.name}
            </label>
          ))}
        </div>
      )}
      {outside.length > 0 && (
        <p style={{ margin: '8px 0 0', fontSize: '11px', color: 'var(--text-muted)' }}>
          Ещё {outside.length} комн. вне этого сектора останутся в списке.
        </p>
      )}
    </div>
  );
};
