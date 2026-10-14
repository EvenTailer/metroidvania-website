import React, { useState } from 'react';
import { GatingSimulationResult, RoomNode, SectorInfo } from '../../entities/room-matrix';
import { ConfirmModal } from '../../shared/ui/ConfirmModal';

interface RoomDetailDrawerProps {
  room: RoomNode | null;
  sectors: SectorInfo[];
  allRooms: RoomNode[];
  gatingResult: GatingSimulationResult;
  onEditRoom: () => void;
  onDeleteRoom: (id: string) => void;
  onCopyScenePath: (path: string) => void;
  onSelectConnectedRoom: (id: string) => void;
  onUpdateImage?: (roomId: string, imageUrl: string) => void;
  onOpenLightbox?: (url: string) => void;
  spawns?: { id: string; name: string; code: string }[];
  onOpenEnemy?: (enemyId: string) => void;
  bugs?: { id: string; title: string; severityLabel: string }[];
  onOpenBug?: (reportId: string) => void;
}

export const RoomDetailDrawer: React.FC<RoomDetailDrawerProps> = ({
  room,
  sectors,
  allRooms,
  gatingResult,
  onEditRoom,
  onDeleteRoom,
  onCopyScenePath,
  onSelectConnectedRoom,
  onUpdateImage,
  onOpenLightbox,
  spawns = [],
  onOpenEnemy,
  bugs = [],
  onOpenBug
}) => {
  const [showImageInput, setShowImageInput] = useState(false);
  const [tempImageUrl, setTempImageUrl] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  if (!room) {
    return (
      <div className="panel" style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>
        <p style={{ margin: 0, fontSize: '13px' }}>Выберите комнату на карте, чтобы увидеть параметры и замки гейтинга.</p>
      </div>
    );
  }

  const sector = sectors.find(s => s.id === room.sectorId);
  const isReachable = gatingResult.reachableRoomIds.has(room.id);
  const roomMap = new Map(allRooms.map(r => [r.id, r]));

  const handleSaveImage = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdateImage) {
      onUpdateImage(room.id, tempImageUrl.trim());
    }
    setShowImageInput(false);
  };

  const handleRemoveImage = () => {
    if (onUpdateImage) {
      onUpdateImage(room.id, '');
    }
    setTempImageUrl('');
  };

  return (
    <div className="panel" style={{ padding: '18px 20px', height: '100%', display: 'flex', flexDirection: 'column', gap: '14px', overflowY: 'auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span
              style={{
                fontSize: '10.5px',
                fontWeight: 800,
                padding: '2px 8px',
                borderRadius: '4px',
                background: `${sector?.color || '#00d2ff'}22`,
                color: sector?.color || '#00d2ff',
                border: `1px solid ${sector?.color || '#00d2ff'}55`
              }}
            >
              {sector?.code || 'SEC'} • ({room.gridX}, {room.gridY})
            </span>
            <span
              style={{
                fontSize: '10px',
                padding: '2px 6px',
                borderRadius: '4px',
                background: isReachable ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                color: isReachable ? 'var(--accent-emerald)' : '#f87171',
                border: `1px solid ${isReachable ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`
              }}
            >
              {isReachable ? '✓ Доступна' : '🔒 Заблокирована'}
            </span>
          </div>
          <h3 style={{ margin: 0, fontSize: '16px', color: '#fff', fontWeight: 800 }}>{room.name}</h3>
        </div>

        <div style={{ display: 'flex', gap: '6px' }}>
          <button type="button" className="chip-btn" onClick={onEditRoom} title="Редактировать">
            ✏️
          </button>
          <button
            type="button"
            className="chip-btn"
            style={{ color: '#f87171' }}
            onClick={() => setIsDeleteModalOpen(true)}
            title="Удалить"
          >
            🗑️
          </button>
        </div>
      </div>

      {/* Room Image Banner */}
      {room.imageUrl ? (
        <div style={{ position: 'relative', width: '100%', height: '110px', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
          <img
            src={room.imageUrl}
            alt={room.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer' }}
            onClick={() => onOpenLightbox?.(room.imageUrl!)}
            title="Кликните для увеличения"
          />
          <div style={{ position: 'absolute', bottom: '6px', right: '6px', display: 'flex', gap: '4px' }}>
            <button
              type="button"
              className="chip-btn"
              style={{ fontSize: '10px', padding: '2px 6px', background: 'rgba(0,0,0,0.7)' }}
              onClick={() => onOpenLightbox?.(room.imageUrl!)}
            >
              🔍
            </button>
            <button
              type="button"
              className="chip-btn"
              style={{ fontSize: '10px', padding: '2px 6px', background: 'rgba(0,0,0,0.7)', color: '#f87171' }}
              onClick={handleRemoveImage}
              title="Удалить скриншот"
            >
              ✕
            </button>
          </div>
        </div>
      ) : (
        <div>
          {!showImageInput ? (
            <button
              type="button"
              className="btn btn-secondary"
              style={{ width: '100%', fontSize: '11.5px', padding: '6px 12px' }}
              onClick={() => {
                setTempImageUrl('');
                setShowImageInput(true);
              }}
            >
              🖼️ Прикрепить скриншот / концепт локации
            </button>
          ) : (
            <form onSubmit={handleSaveImage} style={{ display: 'flex', gap: '6px' }}>
              <input
                type="text"
                className="field"
                style={{ fontSize: '11.5px', padding: '4px 8px' }}
                placeholder="Вставьте URL картинки (png, jpg, webp)..."
                value={tempImageUrl}
                onChange={e => setTempImageUrl(e.target.value)}
                autoFocus
              />
              <button type="submit" className="btn btn-primary" style={{ fontSize: '11px', padding: '4px 10px' }}>
                ОК
              </button>
              <button
                type="button"
                className="chip-btn"
                style={{ fontSize: '11px', padding: '4px 8px' }}
                onClick={() => setShowImageInput(false)}
              >
                ✕
              </button>
            </form>
          )}
        </div>
      )}

      {/* Description */}
      {room.description && (
        <p style={{ margin: 0, fontSize: '12.5px', color: 'var(--text-muted)', lineHeight: 1.45 }}>
          {room.description}
        </p>
      )}

      {/* Godot Scene Path */}
      <div style={{ background: 'rgba(0, 0, 0, 0.35)', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
          <span style={{ fontSize: '10.5px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            🎬 Сцена Godot 4
          </span>
          <button
            type="button"
            className="chip-btn"
            style={{ fontSize: '10px', padding: '2px 8px' }}
            onClick={() => onCopyScenePath(room.godotScene)}
          >
            📋 Копировать путь
          </button>
        </div>
        <code style={{ fontSize: '11px', color: 'var(--accent-cyan)', wordBreak: 'break-all' }}>
          {room.godotScene || 'res://scenes/rooms/not_set.tscn'}
        </code>
      </div>

      <div>
        <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>
          Враги в этой комнате ({spawns.length})
        </div>
        {spawns.length === 0 ? (
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            В бестиарии нет врагов, привязанных к этой комнате.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Кнопка открывает досье этого врага в бестиарии.
            </div>
            {spawns.map(spawn => (
              <button
                key={spawn.id}
                type="button"
                onClick={() => onOpenEnemy?.(spawn.id)}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '6px 10px',
                  borderRadius: '6px',
                  background: 'rgba(0, 210, 255, 0.08)',
                  border: '1px solid rgba(0, 210, 255, 0.25)',
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: '12px',
                  textAlign: 'left'
                }}
              >
                <span>{spawn.name}</span>
                <span style={{ color: 'var(--accent-cyan)', fontSize: '10px' }}>{spawn.code}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div>
        <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>
          Открытые баги ({bugs.length})
        </div>
        {bugs.length === 0 ? (
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            В журнале плейтестов нет открытых багов этой комнаты.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Кнопка открывает запись в журнале плейтестов.
            </div>
            {bugs.map(bug => (
              <button
                key={bug.id}
                type="button"
                onClick={() => onOpenBug?.(bug.id)}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px 10px',
                  borderRadius: '6px',
                  background: 'rgba(248, 113, 113, 0.08)',
                  border: '1px solid rgba(248, 113, 113, 0.28)',
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: '12px',
                  textAlign: 'left'
                }}
              >
                <span>{bug.title}</span>
                <span style={{ color: '#f87171', fontSize: '10px', flexShrink: 0 }}>{bug.severityLabel}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Connections List */}
      <div>
        <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#fff', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          🔗 Переходы ({room.connections.length})
        </div>
        {room.connections.length === 0 ? (
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Нет выходов (потяните за точку на карточке, чтобы связать)</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {room.connections.map((c, i) => {
              const target = roomMap.get(c.targetRoomId);
              return (
                <div
                  key={i}
                  onClick={() => onSelectConnectedRoom(c.targetRoomId)}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '6px 10px',
                    borderRadius: '6px',
                    background: 'rgba(255, 255, 255, 0.04)',
                    cursor: 'pointer',
                    fontSize: '11.5px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ color: 'var(--accent-cyan)', fontWeight: 700, textTransform: 'uppercase', fontSize: '10px' }}>
                      [{c.direction}]
                    </span>
                    <span style={{ color: '#fff' }}>{target?.name || c.targetRoomId}</span>
                  </div>
                  {c.lock ? (
                    <span style={{ fontSize: '10px', color: '#f87171', background: 'rgba(239,68,68,0.15)', padding: '1px 6px', borderRadius: '4px' }}>
                      🔒 {c.lock.label}
                    </span>
                  ) : (
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Свободный</span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Loot / Collectibles */}
      <div>
        <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#fff', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          🎁 Награды & Лут ({room.loot.length})
        </div>
        {room.loot.length === 0 ? (
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>В комнате нет ключевых предметов</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {room.loot.map(item => (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px 10px',
                  borderRadius: '6px',
                  background: 'rgba(245, 158, 11, 0.1)',
                  border: '1px solid rgba(245, 158, 11, 0.25)',
                  fontSize: '11.5px',
                  color: '#fbbf24'
                }}
              >
                <span>🎁</span>
                <span>{item.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        title="Удаление комнаты"
        message={`Вы уверены, что хотите удалить комнату «${room.name}» (${sector?.code || 'SEC'})? Все переходы и связи с ней будут автоматически разорваны.`}
        confirmText="Удалить комнату"
        cancelText="Отмена"
        danger={true}
        onConfirm={() => onDeleteRoom(room.id)}
        onClose={() => setIsDeleteModalOpen(false)}
      />
    </div>
  );
};
