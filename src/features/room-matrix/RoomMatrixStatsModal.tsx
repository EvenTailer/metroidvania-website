import React from 'react';
import { RoomNode, SectorInfo } from '../../entities/room-matrix';

interface RoomMatrixStatsModalProps {
  rooms: RoomNode[];
  sectors: SectorInfo[];
  onClose: () => void;
}

export const RoomMatrixStatsModal: React.FC<RoomMatrixStatsModalProps> = ({
  rooms,
  sectors,
  onClose
}) => {
  const totalLocks = rooms.reduce((acc, r) => acc + r.connections.filter(c => c.lock).length, 0);
  const totalLoot = rooms.reduce((acc, r) => acc + r.loot.length, 0);

  const statusCounts: Record<RoomNode['status'], number> = {
    concept: 0,
    blocked_out: 0,
    art_ready: 0,
    tested: 0
  };
  rooms.forEach(r => { statusCounts[r.status] = (statusCounts[r.status] || 0) + 1; });

  const typeCounts: Record<RoomNode['type'], number> = {
    standard: 0,
    boss: 0,
    save_point: 0,
    ability_shrine: 0,
    transit: 0,
    secret: 0
  };
  rooms.forEach(r => { typeCounts[r.type] = (typeCounts[r.type] || 0) + 1; });

  const testedPercent = rooms.length > 0 ? Math.round((statusCounts.tested / rooms.length) * 100) : 0;

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div
        className="modal"
        onClick={e => e.stopPropagation()}
        style={{ maxWidth: '640px', width: '92%', maxHeight: '90vh', overflowY: 'auto' }}
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '18px' }}>📊</span>
            <div>
              <h3 className="modal-title">Метрики мира и геймдизайна</h3>
              <p style={{ margin: 0, fontSize: '11.5px', color: 'var(--text-muted)' }}>
                Баланс локаций, плотность замков способностей и статус готовности сцен Godot
              </p>
            </div>
          </div>
          <button type="button" className="modal-close" onClick={onClose}>×</button>
        </div>

        {/* Top Summary Badges */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '10px', marginBottom: '16px' }}>
          <div className="panel" style={{ padding: '12px', textAlign: 'center', background: 'rgba(0,0,0,0.3)' }}>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#fff' }}>{rooms.length}</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Всего комнат</div>
          </div>
          <div className="panel" style={{ padding: '12px', textAlign: 'center', background: 'rgba(0,0,0,0.3)' }}>
            <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--accent-cyan)' }}>{sectors.length}</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Секторов мира</div>
          </div>
          <div className="panel" style={{ padding: '12px', textAlign: 'center', background: 'rgba(0,0,0,0.3)' }}>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#f87171' }}>{totalLocks}</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Замков способностей</div>
          </div>
          <div className="panel" style={{ padding: '12px', textAlign: 'center', background: 'rgba(0,0,0,0.3)' }}>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#fbbf24' }}>{totalLoot}</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Ключевого лута</div>
          </div>
        </div>

        {/* Production Readiness Bar */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
            <span style={{ fontWeight: 700, color: '#fff' }}>Готовность сцен в Godot 4:</span>
            <span style={{ color: 'var(--accent-emerald)', fontWeight: 700 }}>{testedPercent}% протестировано</span>
          </div>
          <div style={{ display: 'flex', height: '10px', borderRadius: '5px', overflow: 'hidden', background: 'rgba(255,255,255,0.1)' }}>
            <div style={{ width: `${(statusCounts.tested / rooms.length) * 100}%`, background: '#10b981' }} title="Протестировано" />
            <div style={{ width: `${(statusCounts.art_ready / rooms.length) * 100}%`, background: '#38bdf8' }} title="Арт готов" />
            <div style={{ width: `${(statusCounts.blocked_out / rooms.length) * 100}%`, background: '#eab308' }} title="Блокаут" />
            <div style={{ width: `${(statusCounts.concept / rooms.length) * 100}%`, background: '#64748b' }} title="Концепт" />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10.5px', color: 'var(--text-muted)', marginTop: '4px' }}>
            <span>🟩 Тест: {statusCounts.tested}</span>
            <span>🟦 Арт: {statusCounts.art_ready}</span>
            <span>🟨 Блокаут: {statusCounts.blocked_out}</span>
            <span>⬜ Концепт: {statusCounts.concept}</span>
          </div>
        </div>

        {/* Breakdown by Type */}
        <div style={{ marginBottom: '16px' }}>
          <h4 style={{ margin: '0 0 8px', fontSize: '12.5px', color: '#fff', fontWeight: 700 }}>Типы комнат</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '8px' }}>
            <div style={{ padding: '8px', background: 'rgba(255,255,255,0.03)', borderRadius: '6px', fontSize: '11.5px' }}>
              ◻️ Стандартные: <strong>{typeCounts.standard}</strong>
            </div>
            <div style={{ padding: '8px', background: 'rgba(255,255,255,0.03)', borderRadius: '6px', fontSize: '11.5px' }}>
              💾 Точки сохранения: <strong>{typeCounts.save_point}</strong>
            </div>
            <div style={{ padding: '8px', background: 'rgba(255,255,255,0.03)', borderRadius: '6px', fontSize: '11.5px' }}>
              👑 Арены Боссов: <strong>{typeCounts.boss}</strong>
            </div>
            <div style={{ padding: '8px', background: 'rgba(255,255,255,0.03)', borderRadius: '6px', fontSize: '11.5px' }}>
              ✨ Алтари способностей: <strong>{typeCounts.ability_shrine}</strong>
            </div>
            <div style={{ padding: '8px', background: 'rgba(255,255,255,0.03)', borderRadius: '6px', fontSize: '11.5px' }}>
              🚪 Лифты и транзит: <strong>{typeCounts.transit}</strong>
            </div>
            <div style={{ padding: '8px', background: 'rgba(255,255,255,0.03)', borderRadius: '6px', fontSize: '11.5px' }}>
              ❓ Секретные комнаты: <strong>{typeCounts.secret}</strong>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>Закрыть</button>
        </div>
      </div>
    </div>
  );
};
