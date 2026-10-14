import React from 'react';
import { EnemyItem, ProductionChecklist } from '../../entities/bestiary';
import { RoomNode, SectorInfo } from '../../entities/room-matrix';
import { BossPhaseTimeline } from './BossPhaseTimeline';
import { ProductionChecklistWidget } from './ProductionChecklistWidget';

interface EnemyCardProps {
  enemy: EnemyItem;
  sector?: SectorInfo;
  rooms: RoomNode[];
  isSelected: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onToggleChecklist: (step: keyof ProductionChecklist) => void;
  onCopyScenePath: (path: string) => void;
  onOpenRoom: (roomId: string) => void;
}

const TYPE_CONFIG = {
  minion: { label: 'Рядовой моб', color: '#94a3b8', bg: 'rgba(148, 163, 184, 0.12)' },
  elite: { label: 'Элитный боец', color: 'var(--accent-amber)', bg: 'rgba(245, 158, 11, 0.15)' },
  miniboss: { label: 'Мини-босс', color: 'var(--accent-purple)', bg: 'rgba(168, 85, 247, 0.15)' },
  boss: { label: 'ГЛАВНЫЙ БОСС', color: 'var(--accent-rose)', bg: 'rgba(239, 68, 68, 0.2)' }
};

const ATTACK_TYPE_ICONS: Record<string, string> = {
  melee: '🗡️',
  projectile: '💥',
  laser: '⚡',
  area: '🌊',
  dash: '💨'
};

export const EnemyCard: React.FC<EnemyCardProps> = ({
  enemy,
  sector,
  rooms,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
  onToggleChecklist,
  onCopyScenePath,
  onOpenRoom
}) => {
  const typeInfo = TYPE_CONFIG[enemy.type] || TYPE_CONFIG.minion;
  const sectorColor = sector?.color || '#00d2ff';
  const isBoss = enemy.type === 'boss';
  const showPhases = (enemy.type === 'boss' || enemy.type === 'miniboss') && enemy.phases && enemy.phases.length > 0;
  const spawnRooms = (enemy.spawnRoomIds || []).map(roomId => rooms.find(room => room.id === roomId) || null);

  return (
    <div
      onClick={onSelect}
      className="panel"
      style={{
        position: 'relative',
        padding: '16px',
        background: isSelected ? 'rgba(15, 23, 42, 0.95)' : 'rgba(11, 16, 28, 0.85)',
        border: isSelected
          ? `2px solid ${isBoss ? 'var(--accent-rose)' : 'var(--accent-cyan)'}`
          : isBoss
          ? '1px solid rgba(239, 68, 68, 0.4)'
          : '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '10px',
        boxShadow: isSelected
          ? `0 0 20px ${isBoss ? 'rgba(239, 68, 68, 0.35)' : 'rgba(0, 210, 255, 0.3)'}`
          : 'none',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: '12px',
        transition: 'all 0.15s ease',
        cursor: 'pointer'
      }}
    >
      {/* Top Header */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            <span
              style={{
                fontSize: '10px',
                fontWeight: 900,
                color: sectorColor,
                padding: '2px 6px',
                borderRadius: '4px',
                background: `${sectorColor}18`,
                border: `1px solid ${sectorColor}44`
              }}
            >
              {sector?.code || 'SEC'} • {enemy.code}
            </span>

            <span
              style={{
                fontSize: '10px',
                fontWeight: 800,
                color: typeInfo.color,
                padding: '2px 6px',
                borderRadius: '4px',
                background: typeInfo.bg,
                border: `1px solid ${typeInfo.color}44`
              }}
            >
              {typeInfo.label}
            </span>
          </div>

          <div style={{ display: 'flex', gap: '4px' }}>
            <button
              type="button"
              className="chip-btn"
              onClick={e => {
                e.stopPropagation();
                onEdit();
              }}
              style={{ padding: '2px 8px', fontSize: '11px' }}
            >
              Править
            </button>
            <button
              type="button"
              className="chip-btn"
              onClick={e => {
                e.stopPropagation();
                onDelete();
              }}
              style={{ padding: '2px 8px', fontSize: '11px', color: '#f87171' }}
            >
              Удалить
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
          {enemy.imageUrl && (
            <img
              src={enemy.imageUrl}
              alt={enemy.name}
              style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 8, border: `1px solid ${sectorColor}66`, flexShrink: 0 }}
            />
          )}
          <div style={{ minWidth: 0 }}>
            <h3 style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: 800, color: '#fff' }}>
              {enemy.name}
            </h3>
            {isSelected && (
              <p style={{ margin: '0 0 4px', fontSize: '10.5px', color: 'var(--accent-cyan)' }}>
                Выбран для файла .tres
              </p>
            )}
            <p style={{ margin: 0, fontSize: '11.5px', color: 'var(--text-muted)', lineHeight: 1.4 }}>
              {enemy.description}
            </p>
            {enemy.lore && (
              <p style={{ margin: '6px 0 0', fontSize: '11.5px', color: '#cbd5e1', lineHeight: 1.4 }}>
                {enemy.lore}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Combat Stats Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: '6px',
          background: 'rgba(0, 0, 0, 0.35)',
          padding: '8px 10px',
          borderRadius: '8px',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          textAlign: 'center'
        }}
      >
        <div title="Здоровье">
          <span style={{ fontSize: '9px', color: '#f87171', display: 'block', fontWeight: 700 }}>HP</span>
          <span style={{ fontSize: '13px', fontWeight: 900, color: '#fff' }}>{enemy.hp}</span>
        </div>
        <div title="Урон обычного удара">
          <span style={{ fontSize: '9px', color: '#fbbf24', display: 'block', fontWeight: 700 }}>УРОН</span>
          <span style={{ fontSize: '13px', fontWeight: 900, color: '#fff' }}>{enemy.damage}</span>
        </div>
        <div title="Скорость движения, пиксели в секунду">
          <span style={{ fontSize: '9px', color: '#38bdf8', display: 'block', fontWeight: 700 }}>СКОРОСТЬ</span>
          <span style={{ fontSize: '13px', fontWeight: 900, color: '#fff' }}>{enemy.speed}</span>
        </div>
        <div title="Сколько ударов подряд оглушают врага">
          <span style={{ fontSize: '9px', color: '#a855f7', display: 'block', fontWeight: 700 }}>ОГЛУШ.</span>
          <span style={{ fontSize: '13px', fontWeight: 900, color: '#fff' }}>{enemy.staggerThreshold} уд.</span>
        </div>
        <div title="Секунды, когда удар можно отбить кибер-рукой">
          <span style={{ fontSize: '9px', color: 'var(--accent-emerald)', display: 'block', fontWeight: 700 }}>ПАРИР.</span>
          <span style={{ fontSize: '13px', fontWeight: 900, color: '#fff' }}>{enemy.parryWindow}с</span>
        </div>
      </div>

      {/* Attacks List */}
      <div>
        <div style={{ fontSize: '10.5px', fontWeight: 800, color: '#cbd5e1', marginBottom: '6px' }}>
          Удары ({enemy.attacks.length})
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {enemy.attacks.map(atk => (
            <div
              key={atk.id}
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                borderRadius: '4px',
                fontSize: '11px',
                borderLeft: `3px solid ${atk.parryable ? 'var(--accent-cyan)' : 'var(--accent-rose)'}`
              }}
            >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '4px 8px',
                gap: '8px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>{ATTACK_TYPE_ICONS[atk.type] || '⚔️'}</span>
                <span style={{ color: '#fff', fontWeight: 600 }}>{atk.name}</span>
                <span style={{ color: 'var(--text-muted)', fontSize: '10px' }}>({atk.telegraphTime}с замах)</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '10px' }} title="Кулдаун, секунды">кд {atk.cooldown}с</span>
                <span style={{ color: '#f87171', fontWeight: 800 }}>{atk.damage}</span>
                <span
                  style={{
                    fontSize: '9px',
                    fontWeight: 800,
                    padding: '1px 4px',
                    borderRadius: '3px',
                    background: atk.parryable ? 'rgba(0, 210, 255, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                    color: atk.parryable ? 'var(--accent-cyan)' : 'var(--accent-rose)'
                  }}
                >
                  {atk.parryable ? 'Парируемый' : 'Непарируемый'}
                </span>
              </div>
            </div>
            {atk.description && (
              <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', padding: '0 8px 6px 28px' }}>
                {atk.description}
              </div>
            )}
            </div>
          ))}
        </div>
      </div>

      {/* Boss Phases Timeline (if boss) */}
      {showPhases && enemy.phases && (
        <BossPhaseTimeline phases={enemy.phases} maxHp={enemy.hp} />
      )}

      {spawnRooms.length > 0 && (
        <div>
          <div style={{ fontSize: '10.5px', fontWeight: 800, color: '#cbd5e1', marginBottom: '4px' }}>
            Где появляется
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
            {spawnRooms.map((room, index) => {
              const roomId = enemy.spawnRoomIds[index];
              return (
                <button
                  key={roomId}
                  type="button"
                  className="chip-btn"
                  title="Открыть эту комнату на карте"
                  style={{ fontSize: '10px', padding: '2px 6px' }}
                  onClick={event => {
                    event.stopPropagation();
                    onOpenRoom(roomId);
                  }}
                >
                  {room?.name || roomId}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Production Checklist */}
      <ProductionChecklistWidget
        checklist={enemy.checklist}
        onToggle={onToggleChecklist}
      />

      {/* Godot Scene Path */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(0, 0, 0, 0.4)',
          padding: '6px 10px',
          borderRadius: '6px',
          fontSize: '10.5px',
          color: 'var(--text-muted)'
        }}
      >
        <span title="Путь к сцене врага в Godot" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '80%' }}>
          Сцена: {enemy.godotScene}
        </span>
        <button
          type="button"
          className="chip-btn"
          title="Скопировать путь сцены"
          style={{ fontSize: '10px', padding: '2px 6px' }}
          onClick={e => {
            e.stopPropagation();
            onCopyScenePath(enemy.godotScene);
          }}
        >
          Копировать
        </button>
      </div>
    </div>
  );
};
