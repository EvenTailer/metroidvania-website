import React, { useState } from 'react';
import {
  ABILITY_DEFINITIONS,
  Direction,
  getRoomDimensions,
  RoomConnection,
  RoomLoot,
  RoomNode,
  RoomSize,
  RoomStatus,
  RoomType,
  SectorInfo
} from '../../entities/room-matrix';
import { RoomSizeSelector } from './RoomSizeSelector';

interface RoomEditModalProps {
  room: RoomNode | null;
  sectors: SectorInfo[];
  allRooms: RoomNode[];
  onSave: (savedRoom: RoomNode) => void;
  onClose: () => void;
}

export const RoomEditModal: React.FC<RoomEditModalProps> = ({
  room,
  sectors,
  allRooms,
  onSave,
  onClose
}) => {
  const isEditing = Boolean(room);

  const [name, setName] = useState(room?.name || 'Новая комната');
  const [sectorId, setSectorId] = useState(room?.sectorId || sectors[0]?.id || 'sec-0');
  const [gridX, setGridX] = useState(room?.gridX || 1);
  const [gridY, setGridY] = useState(room?.gridY || 1);
  const [size, setSize] = useState<RoomSize>(room?.size || '1x1');
  const [type, setType] = useState<RoomType>(room?.type || 'standard');
  const [status, setStatus] = useState<RoomStatus>(room?.status || 'concept');
  const [description, setDescription] = useState(room?.description || '');
  const [godotScene, setGodotScene] = useState(room?.godotScene || 'res://scenes/rooms/room_new.tscn');
  const [imageUrl, setImageUrl] = useState(room?.imageUrl || '');
  const [connections, setConnections] = useState<RoomConnection[]>(room?.connections || []);
  const [loot, setLoot] = useState<RoomLoot[]>(room?.loot || []);

  // Quick form for adding connection
  const [connTarget, setConnTarget] = useState(allRooms.find(r => r.id !== room?.id)?.id || '');
  const [connDir, setConnDir] = useState<Direction>('east');
  const [connHasLock, setConnHasLock] = useState(false);
  const [connLockAbility, setConnLockAbility] = useState(ABILITY_DEFINITIONS[1]?.id || 'ab-eye');
  const [connLockLabel, setConnLockLabel] = useState('Лазерная решетка');

  // Quick form for adding loot
  const [lootName, setLootName] = useState('');
  const [lootType, setLootType] = useState<RoomLoot['type']>('hp_upgrade');

  const activeSector = sectors.find(s => s.id === sectorId) || sectors[0];
  const sizeDims = getRoomDimensions(size);

  const handleAddConnection = () => {
    if (!connTarget) return;
    const newConn: RoomConnection = {
      targetRoomId: connTarget,
      direction: connDir,
      lock: connHasLock
        ? {
            id: `lk-${Date.now()}`,
            direction: connDir,
            requiredAbilityId: connLockAbility,
            label: connLockLabel.trim() || 'Замок способности',
            type: 'ability'
          }
        : undefined
    };
    setConnections([...connections, newConn]);
  };

  const handleRemoveConnection = (idx: number) => {
    setConnections(connections.filter((_, i) => i !== idx));
  };

  const handleAddLoot = () => {
    if (!lootName.trim()) return;
    const item: RoomLoot = {
      id: `lt-${Date.now()}`,
      name: lootName.trim(),
      type: lootType
    };
    setLoot([...loot, item]);
    setLootName('');
  };

  const handleRemoveLoot = (idx: number) => {
    setLoot(loot.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const payload: RoomNode = {
      id: room?.id || `r-${Date.now()}`,
      name: name.trim(),
      sectorId,
      gridX: Number(gridX),
      gridY: Number(gridY),
      size,
      type,
      status,
      description: description.trim(),
      godotScene: godotScene.trim(),
      imageUrl: imageUrl.trim() || undefined,
      connections,
      loot
    };

    onSave(payload);
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div
        className="modal"
        onClick={e => e.stopPropagation()}
        style={{ maxWidth: '640px', width: '92%', maxHeight: '90vh', overflowY: 'auto' }}
      >
        <div className="modal-header">
          <h3 className="modal-title">{isEditing ? `Редактирование: ${room?.name}` : 'Создание новой комнаты'}</h3>
          <button type="button" className="modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label className="composer-label">Название комнаты</label>
            <input
              type="text"
              className="field"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Например: Шлюз Литейного цеха"
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px' }}>
            <div>
              <label className="composer-label">Сектор</label>
              <select className="field" value={sectorId} onChange={e => setSectorId(e.target.value)}>
                {sectors.map(s => (
                  <option key={s.id} value={s.id}>{s.code}: {s.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="composer-label">Тип комнаты</label>
              <select className="field" value={type} onChange={e => setType(e.target.value as RoomType)}>
                <option value="standard">◻️ Стандартная</option>
                <option value="save_point">💾 Точка сохранения</option>
                <option value="boss">👑 Арена Босса</option>
                <option value="ability_shrine">✨ Алтарь способности</option>
                <option value="transit">🚪 Скоростной транзит / Лифт</option>
                <option value="secret">❓ Секретная комната</option>
              </select>
            </div>

            <div>
              <label className="composer-label">Статус в Godot</label>
              <select className="field" value={status} onChange={e => setStatus(e.target.value as RoomStatus)}>
                <option value="concept">Концепт</option>
                <option value="blocked_out">Блокаут (Geometry)</option>
                <option value="art_ready">Арт готов</option>
                <option value="tested">Протестировано</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label className="composer-label">Координата Сетка X (колонка)</label>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  type="button"
                  className="chip-btn"
                  style={{ padding: '0 10px', fontSize: '13px' }}
                  onClick={() => setGridX(Math.max(1, Number(gridX) - 1))}
                >
                  −
                </button>
                <input
                  type="number"
                  min={1}
                  max={30}
                  className="field"
                  value={gridX}
                  onChange={e => setGridX(Math.max(1, Number(e.target.value)))}
                  style={{ textAlign: 'center', fontWeight: 700 }}
                />
                <button
                  type="button"
                  className="chip-btn"
                  style={{ padding: '0 10px', fontSize: '13px' }}
                  onClick={() => setGridX(Number(gridX) + 1)}
                >
                  +
                </button>
              </div>
            </div>

            <div>
              <label className="composer-label">Координата Сетка Y (строка)</label>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  type="button"
                  className="chip-btn"
                  style={{ padding: '0 10px', fontSize: '13px' }}
                  onClick={() => setGridY(Math.max(1, Number(gridY) - 1))}
                >
                  −
                </button>
                <input
                  type="number"
                  min={1}
                  max={30}
                  className="field"
                  value={gridY}
                  onChange={e => setGridY(Math.max(1, Number(e.target.value)))}
                  style={{ textAlign: 'center', fontWeight: 700 }}
                />
                <button
                  type="button"
                  className="chip-btn"
                  style={{ padding: '0 10px', fontSize: '13px' }}
                  onClick={() => setGridY(Number(gridY) + 1)}
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Visual Size Selector */}
          <RoomSizeSelector
            value={size}
            onChange={setSize}
            sectorColor={activeSector.color}
          />

          {/* Live Preview Bar */}
          <div
            style={{
              background: 'rgba(0, 0, 0, 0.35)',
              border: `1px dashed ${activeSector.color}66`,
              borderRadius: '8px',
              padding: '10px 14px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '10px'
            }}
          >
            <div>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                Итоговый размер блока на холсте:
              </span>
              <div style={{ fontSize: '12.5px', color: '#fff', fontWeight: 800, marginTop: '2px' }}>
                {sizeDims.cols}×{sizeDims.rows} кл. • {sizeDims.width} × {sizeDims.height} px
              </div>
            </div>

            <div
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: `1px solid ${activeSector.color}`,
                background: 'rgba(15, 23, 42, 0.95)',
                boxShadow: `0 0 10px ${activeSector.color}33`,
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <span style={{ fontSize: '11px', fontWeight: 800, color: activeSector.color }}>
                {activeSector.code} ({gridX},{gridY})
              </span>
              <span style={{ fontSize: '11px', color: '#fff', fontWeight: 700 }}>
                {name || 'Новая комната'}
              </span>
            </div>
          </div>

          <div>
            <label className="composer-label">Путь к сцене Godot (.tscn)</label>
            <input
              type="text"
              className="field"
              value={godotScene}
              onChange={e => setGodotScene(e.target.value)}
              placeholder="res://scenes/rooms/sector1/room_name.tscn"
            />
          </div>

          <div>
            <label className="composer-label">Изображение / Скриншот комнаты (URL)</label>
            <input
              type="text"
              className="field"
              value={imageUrl}
              onChange={e => setImageUrl(e.target.value)}
              placeholder="https://... или data:image/... (скриншот локации из Godot)"
            />
          </div>

          <div>
            <label className="composer-label">Описание и назначение</label>
            <textarea
              className="field"
              rows={2}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Краткое описание геймплея, ловушек и ориентиров комнаты"
            />
          </div>

          {/* Connections Section */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '10px' }}>
            <label className="composer-label" style={{ marginBottom: '8px' }}>Переходы в другие комнаты ({connections.length})</label>
            {connections.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '10px' }}>
                {connections.map((c, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.3)', padding: '5px 8px', borderRadius: '4px', fontSize: '11.5px' }}>
                    <span>[{c.direction}] → {allRooms.find(r => r.id === c.targetRoomId)?.name || c.targetRoomId} {c.lock ? `(🔒 ${c.lock.label})` : ''}</span>
                    <button type="button" className="chip-btn" style={{ padding: '1px 6px', fontSize: '10px' }} onClick={() => handleRemoveConnection(i)}>Удалить</button>
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr auto', gap: '6px', alignItems: 'center' }}>
              <select className="field" value={connTarget} onChange={e => setConnTarget(e.target.value)}>
                <option value="">Выберите целевую комнату...</option>
                {allRooms.filter(r => r.id !== room?.id).map(r => (
                  <option key={r.id} value={r.id}>{r.name} ({r.gridX},{r.gridY})</option>
                ))}
              </select>
              <select className="field" value={connDir} onChange={e => setConnDir(e.target.value as Direction)}>
                <option value="east">Восток (East)</option>
                <option value="west">Запад (West)</option>
                <option value="north">Север (North)</option>
                <option value="south">Юг (South)</option>
              </select>
              <button type="button" className="btn btn-secondary" onClick={handleAddConnection} style={{ fontSize: '11px', padding: '6px 10px' }}>+ Переход</button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '6px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <input type="checkbox" checked={connHasLock} onChange={e => setConnHasLock(e.target.checked)} />
                Запереть замок способности на переходе
              </label>
              {connHasLock && (
                <select className="field" style={{ width: 'auto', padding: '3px 8px', fontSize: '11px' }} value={connLockAbility} onChange={e => setConnLockAbility(e.target.value)}>
                  {ABILITY_DEFINITIONS.map(a => (
                    <option key={a.id} value={a.id}>{a.icon} {a.name}</option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Loot Section */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '10px' }}>
            <label className="composer-label" style={{ marginBottom: '8px' }}>Лут и награды в комнате ({loot.length})</label>
            {loot.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '8px' }}>
                {loot.map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(245,158,11,0.1)', padding: '4px 8px', borderRadius: '4px', fontSize: '11.5px', color: '#fbbf24' }}>
                    <span>🎁 [{item.type}] {item.name}</span>
                    <button type="button" className="chip-btn" style={{ padding: '1px 6px', fontSize: '10px' }} onClick={() => handleRemoveLoot(i)}>Удалить</button>
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr auto', gap: '6px', alignItems: 'center' }}>
              <input
                type="text"
                className="field"
                value={lootName}
                onChange={e => setLootName(e.target.value)}
                placeholder="Название предмета..."
              />
              <select className="field" value={lootType} onChange={e => setLootType(e.target.value as RoomLoot['type'])}>
                <option value="hp_upgrade">Фрагмент HP</option>
                <option value="energy_cell">Энергоячейка</option>
                <option value="ability">Имплант (Способность)</option>
                <option value="key_item">Ключевой предмет</option>
                <option value="lore_terminal">Лор-терминал</option>
              </select>
              <button type="button" className="btn btn-secondary" onClick={handleAddLoot} style={{ fontSize: '11px', padding: '6px 10px' }}>+ Лут</button>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '14px' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Отмена</button>
            <button type="submit" className="btn btn-primary">{isEditing ? 'Сохранить изменения' : 'Создать комнату'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};
