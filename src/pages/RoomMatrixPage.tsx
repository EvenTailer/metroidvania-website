import React, { useMemo, useState } from 'react';
import { EnemyItem } from '../entities/bestiary';
import { PlaytestReport, SEVERITY_META } from '../entities/playtest';
import {
  Direction,
  RoomLock,
  RoomMatrixState,
  RoomNode,
  solveGatingProgression
} from '../entities/room-matrix';
import {
  ConnectionEditModal,
  GatingSimulatorBar,
  RoomDetailDrawer,
  RoomEditModal,
  RoomEditorGuideBanner,
  RoomMapGrid,
  RoomMatrixExportModal,
  RoomMatrixStatsModal,
  SectorFilterBar
} from '../features/room-matrix';
import { ConfirmModal } from '../shared/ui/ConfirmModal';

interface RoomMatrixPageProps {
  roomMatrix: RoomMatrixState;
  enemies: EnemyItem[];
  bugs: PlaytestReport[];
  onOpenEnemy: (enemyId: string) => void;
  onOpenBug: (reportId: string) => void;
  onSelectRoom: (id: string | null) => void;
  onAddRoom: (room: RoomNode) => void;
  onUpdateRoom: (room: RoomNode) => void;
  onRemoveRoom: (id: string) => void;
  onSetRoomPosition: (id: string, gridX: number, gridY: number) => void;
  onConnectRooms: (
    fromRoomId: string,
    toRoomId: string,
    direction: Direction,
    toDirection?: Direction,
    lock?: RoomLock
  ) => void;
  onDisconnectRooms: (fromRoomId: string, toRoomId: string) => void;
  onUpdateConnectionLock: (fromRoomId: string, toRoomId: string, lock?: RoomLock) => void;
  onUpdateRoomImage: (roomId: string, imageUrl: string) => void;
  onFilterSector: (sectorId: string | 'all') => void;
  onToggleSimulatedAbility: (abilityId: string) => void;
  onResetSimulatedAbilities: () => void;
  onUnlockAllAbilities: () => void;
  onResetMatrixToDefault: () => void;
  onOpenLightbox?: (url: string) => void;
  onShowToast: (msg: string) => void;
}

export const RoomMatrixPage: React.FC<RoomMatrixPageProps> = ({
  roomMatrix,
  enemies,
  bugs,
  onOpenEnemy,
  onOpenBug,
  onSelectRoom,
  onAddRoom,
  onUpdateRoom,
  onRemoveRoom,
  onSetRoomPosition,
  onConnectRooms,
  onDisconnectRooms,
  onUpdateConnectionLock,
  onUpdateRoomImage,
  onFilterSector,
  onToggleSimulatedAbility,
  onResetSimulatedAbilities,
  onUnlockAllAbilities,
  onResetMatrixToDefault,
  onOpenLightbox,
  onShowToast
}) => {
  const {
    rooms,
    sectors,
    selectedRoomId,
    activeFilterSector,
    simulatedAbilities
  } = roomMatrix;

  const [zoom, setZoom] = useState(1);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [roomToEdit, setRoomToEdit] = useState<RoomNode | null>(null);

  // Connection edit modal state
  const [connEditPair, setConnEditPair] = useState<{
    fromRoom: RoomNode;
    toRoom: RoomNode;
    lock?: RoomLock;
  } | null>(null);

  // Compute gating reachability graph
  const gatingResult = useMemo(() => {
    return solveGatingProgression(rooms, simulatedAbilities, 'r-hub-base');
  }, [rooms, simulatedAbilities]);

  const selectedRoom = useMemo(() => {
    return rooms.find(r => r.id === selectedRoomId) || null;
  }, [rooms, selectedRoomId]);

  const roomSpawns = useMemo(() => {
    if (!selectedRoom) return [];
    return enemies
      .filter(enemy => enemy.spawnRoomIds.includes(selectedRoom.id))
      .map(enemy => ({ id: enemy.id, name: enemy.name, code: enemy.code }));
  }, [enemies, selectedRoom]);

  const roomBugs = useMemo(() => {
    if (!selectedRoom) return [];
    return bugs
      .filter(report => report.roomId === selectedRoom.id && report.status === 'open')
      .map(report => ({
        id: report.id,
        title: report.title,
        severityLabel: SEVERITY_META[report.severity].label
      }));
  }, [bugs, selectedRoom]);

  const handleOpenCreateModal = (initX?: number, initY?: number) => {
    if (initX && initY) {
      setRoomToEdit({
        id: `r-${Date.now()}`,
        name: 'Новая комната',
        sectorId: activeFilterSector !== 'all' ? activeFilterSector : sectors[0]?.id || 'sec-0',
        gridX: initX,
        gridY: initY,
        size: '1x1',
        type: 'standard',
        status: 'concept',
        description: '',
        godotScene: 'res://scenes/rooms/room_new.tscn',
        connections: [],
        loot: []
      });
    } else {
      setRoomToEdit(null);
    }
    setIsEditModalOpen(true);
  };

  const handleOpenEditModal = () => {
    if (selectedRoom) {
      setRoomToEdit(selectedRoom);
      setIsEditModalOpen(true);
    }
  };

  const handleSaveRoom = (saved: RoomNode) => {
    const exists = rooms.some(r => r.id === saved.id);
    if (exists) {
      onUpdateRoom(saved);
      onShowToast(`Комната «${saved.name}» сохранена`);
    } else {
      onAddRoom(saved);
      onShowToast(`Создана комната «${saved.name}»`);
    }
  };

  const handleDeleteRoom = (id: string) => {
    onRemoveRoom(id);
    onShowToast('Комната удалена');
  };

  const handleConnect = (fromId: string, toId: string, fromDir: Direction, toDir?: Direction) => {
    const fromRoom = rooms.find(r => r.id === fromId);
    const toRoom = rooms.find(r => r.id === toId);
    if (!fromRoom || !toRoom) return;

    const alreadyConnected = fromRoom.connections.some(c => c.targetRoomId === toId);
    if (alreadyConnected) {
      onShowToast(`Комнаты «${fromRoom.name}» и «${toRoom.name}» уже соединены!`);
      return;
    }

    onConnectRooms(fromId, toId, fromDir, toDir);
    onShowToast(`Связано нитью: ${fromRoom.name} ⇄ ${toRoom.name}`);
  };

  const handleOpenConnectionEdit = (fromId: string, toId: string, lock?: RoomLock) => {
    const fromRoom = rooms.find(r => r.id === fromId);
    const toRoom = rooms.find(r => r.id === toId);
    if (fromRoom && toRoom) {
      setConnEditPair({ fromRoom, toRoom, lock });
    }
  };

  const handleSaveConnectionLock = (lock?: RoomLock) => {
    if (!connEditPair) return;
    onUpdateConnectionLock(connEditPair.fromRoom.id, connEditPair.toRoom.id, lock);
    onShowToast(lock ? `Установлен замок: ${lock.label}` : 'Замок снят: свободный проход');
    setConnEditPair(null);
  };

  const handleDeleteConnection = () => {
    if (!connEditPair) return;
    onDisconnectRooms(connEditPair.fromRoom.id, connEditPair.toRoom.id);
    onShowToast('Связь между комнатами удалена');
    setConnEditPair(null);
  };

  const handleCopyScenePath = (path: string) => {
    navigator.clipboard.writeText(path).then(() => {
      onShowToast('Путь к сцене Godot скопирован!');
    });
  };

  const handleChangeZoom = (delta: number) => {
    setZoom(prev => {
      const next = Math.round((prev + delta) * 10) / 10;
      return Math.min(1.4, Math.max(0.7, next));
    });
  };

  const handleResetToDefault = () => {
    setIsResetConfirmOpen(true);
  };

  const handleConfirmReset = () => {
    onResetMatrixToDefault();
    onShowToast('Карта комнат сброшена к стандартной схеме');
  };

  return (
    <div className="view-content view-content--matrix">
      {/* Onboarding Guide Banner */}
      <RoomEditorGuideBanner />

      {/* Top simulator bar */}
      <GatingSimulatorBar
        activeAbilities={simulatedAbilities}
        totalRooms={rooms.length}
        reachableCount={gatingResult.reachableRoomIds.size}
        onToggleAbility={onToggleSimulatedAbility}
        onResetToStart={onResetSimulatedAbilities}
        onUnlockAll={onUnlockAllAbilities}
        zoom={zoom}
        onChangeZoom={handleChangeZoom}
      />

      {/* Sector filter & actions */}
      <SectorFilterBar
        sectors={sectors}
        activeSectorId={activeFilterSector}
        onSelectSector={onFilterSector}
        onOpenCreateModal={() => handleOpenCreateModal()}
        onOpenStatsModal={() => setIsStatsModalOpen(true)}
        onOpenExportModal={() => setIsExportModalOpen(true)}
        onResetToDefault={handleResetToDefault}
      />

      {/* Main Layout: 2D Grid Canvas + Details Drawer */}
      <div className="matrix-layout-grid">
        <div className="matrix-map-wrapper">
          <RoomMapGrid
            rooms={rooms}
            sectors={sectors}
            selectedRoomId={selectedRoomId}
            activeSectorId={activeFilterSector}
            gatingResult={gatingResult}
            zoom={zoom}
            onZoomChange={setZoom}
            onSelectRoom={onSelectRoom}
            onMoveRoomToPosition={(id, gx, gy) => onSetRoomPosition(id, gx, gy)}
            onConnectRooms={handleConnect}
            onOpenConnectionEdit={handleOpenConnectionEdit}
            onDoubleClickCanvas={(gx, gy) => handleOpenCreateModal(gx, gy)}
          />
        </div>

        <div className="matrix-drawer-wrapper">
          <RoomDetailDrawer
            room={selectedRoom}
            sectors={sectors}
            allRooms={rooms}
            gatingResult={gatingResult}
            onEditRoom={handleOpenEditModal}
            onDeleteRoom={handleDeleteRoom}
            onCopyScenePath={handleCopyScenePath}
            onSelectConnectedRoom={onSelectRoom}
            onUpdateImage={onUpdateRoomImage}
            onOpenLightbox={onOpenLightbox}
            spawns={roomSpawns}
            onOpenEnemy={onOpenEnemy}
            bugs={roomBugs}
            onOpenBug={onOpenBug}
          />
        </div>
      </div>

      {/* Modals */}
      {isEditModalOpen && (
        <RoomEditModal
          room={roomToEdit}
          sectors={sectors}
          allRooms={rooms}
          onSave={handleSaveRoom}
          onClose={() => setIsEditModalOpen(false)}
        />
      )}

      {connEditPair && (
        <ConnectionEditModal
          fromRoom={connEditPair.fromRoom}
          toRoom={connEditPair.toRoom}
          initialLock={connEditPair.lock}
          onSave={handleSaveConnectionLock}
          onDelete={handleDeleteConnection}
          onClose={() => setConnEditPair(null)}
        />
      )}

      {isStatsModalOpen && (
        <RoomMatrixStatsModal
          rooms={rooms}
          sectors={sectors}
          onClose={() => setIsStatsModalOpen(false)}
        />
      )}

      {isExportModalOpen && (
        <RoomMatrixExportModal
          rooms={rooms}
          sectors={sectors}
          onClose={() => setIsExportModalOpen(false)}
          onShowToast={onShowToast}
        />
      )}

      <ConfirmModal
        isOpen={isResetConfirmOpen}
        title="Сброс карты комнат"
        message="Вы уверены, что хотите сбросить всю карту комнат и связи к исходной схеме Cyber-Duck? Все пользовательские изменения будут заменены стандартной схемой."
        confirmText="Сбросить к стандарту"
        cancelText="Отмена"
        danger={true}
        onConfirm={handleConfirmReset}
        onClose={() => setIsResetConfirmOpen(false)}
      />
    </div>
  );
};
