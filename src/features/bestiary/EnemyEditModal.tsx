import React, { useState } from 'react';
import { BossPhase, EnemyAttack, EnemyItem, EnemyType, ProductionChecklist } from '../../entities/bestiary';
import { RoomNode, SectorInfo } from '../../entities/room-matrix';
import { EnemyAttackEditor } from './EnemyAttackEditor';
import { EnemyPhaseEditor } from './EnemyPhaseEditor';
import { EnemySpawnFields } from './EnemySpawnFields';
import { FieldHint } from './FieldHint';

interface EnemyEditModalProps {
  enemy: EnemyItem | null;
  sectors: SectorInfo[];
  rooms: RoomNode[];
  onSave: (saved: EnemyItem) => void;
  onClose: () => void;
}

const EMPTY_CHECKLIST: ProductionChecklist = {
  sprite: false,
  skeleton2d: false,
  hitboxes: false,
  audio: false,
  tested: false
};

function usesPhases(type: EnemyType): boolean {
  return type === 'boss' || type === 'miniboss';
}

export const EnemyEditModal: React.FC<EnemyEditModalProps> = ({
  enemy,
  sectors,
  rooms,
  onSave,
  onClose
}) => {
  const isEditing = Boolean(enemy);
  const [name, setName] = useState(enemy?.name || 'Новый противник');
  const [code, setCode] = useState(enemy?.code || `ENM-${Math.floor(Math.random() * 90 + 10)}`);
  const [type, setType] = useState<EnemyType>(enemy?.type || 'minion');
  const [sectorId, setSectorId] = useState(enemy?.sectorId || sectors[0]?.id || 'sec-0');
  const [hp, setHp] = useState(enemy?.hp || 80);
  const [damage, setDamage] = useState(enemy?.damage || 15);
  const [speed, setSpeed] = useState(enemy?.speed || 100);
  const [staggerThreshold, setStaggerThreshold] = useState(enemy?.staggerThreshold || 3);
  const [parryWindow, setParryWindow] = useState(enemy?.parryWindow || 0.16);
  const [godotScene, setGodotScene] = useState(enemy?.godotScene || 'res://scenes/enemies/enemy_new.tscn');
  const [description, setDescription] = useState(enemy?.description || '');
  const [lore, setLore] = useState(enemy?.lore || '');
  const [imageUrl, setImageUrl] = useState(enemy?.imageUrl || '');
  const [spawnRoomIds, setSpawnRoomIds] = useState<string[]>(enemy?.spawnRoomIds || []);
  const [attacks, setAttacks] = useState<EnemyAttack[]>(enemy?.attacks || []);
  const [phases, setPhases] = useState<BossPhase[]>(enemy?.phases || []);
  const [checklist, setChecklist] = useState<ProductionChecklist>(enemy?.checklist || EMPTY_CHECKLIST);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim()) return;

    const nextPhases = usesPhases(type)
      ? phases.map((phase, index) => ({
          ...phase,
          phaseNumber: index + 1,
          musicTrack: phase.musicTrack?.trim() || undefined
        }))
      : undefined;

    onSave({
      id: enemy?.id || `enm-${Date.now()}`,
      name: name.trim(),
      code: code.trim(),
      type,
      sectorId,
      hp: Number(hp),
      damage: Number(damage),
      speed: Number(speed),
      staggerThreshold: Number(staggerThreshold),
      parryWindow: Number(parryWindow),
      godotScene: godotScene.trim(),
      description: description.trim(),
      lore: lore.trim(),
      imageUrl: imageUrl.trim() || undefined,
      spawnRoomIds,
      attacks: attacks.filter(attack => attack.name.trim()).map(attack => ({
        ...attack,
        name: attack.name.trim(),
        description: attack.description.trim()
      })),
      phases: nextPhases,
      checklist
    });
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div
        className="modal"
        onClick={event => event.stopPropagation()}
        style={{ maxWidth: '720px', width: '94%', maxHeight: '90vh', overflowY: 'auto' }}
      >
        <div className="modal-header">
          <h3 className="modal-title">
            {isEditing ? `Досье: ${enemy?.name}` : 'Новый враг'}
          </h3>
          <button type="button" className="modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(120px, 1fr)', gap: '10px' }}>
            <div>
              <label className="composer-label" htmlFor="enemy-name">Имя</label>
              <input id="enemy-name" className="field" value={name} onChange={event => setName(event.target.value)} required />
            </div>
            <div>
              <label className="composer-label" htmlFor="enemy-code">Код</label>
              <input id="enemy-code" className="field" value={code} onChange={event => setCode(event.target.value)} required />
            </div>
          </div>
          <FieldHint>Код — короткий шифр для поиска и файлов, например BOSS-01.</FieldHint>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label className="composer-label" htmlFor="enemy-type">Тип</label>
              <select id="enemy-type" className="field" value={type} onChange={event => setType(event.target.value as EnemyType)}>
                <option value="minion">Рядовой</option>
                <option value="elite">Элита</option>
                <option value="miniboss">Мини-босс</option>
                <option value="boss">Босс</option>
              </select>
            </div>
            <div>
              <label className="composer-label" htmlFor="enemy-sector">Сектор</label>
              <select id="enemy-sector" className="field" value={sectorId} onChange={event => setSectorId(event.target.value)}>
                {sectors.map(sector => (
                  <option key={sector.id} value={sector.id}>{sector.code}: {sector.name}</option>
                ))}
              </select>
            </div>
          </div>
          <FieldHint>У босса и мини-босса ниже появятся фазы. Сектор задаёт, из каких комнат можно выбрать появление.</FieldHint>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0, 1fr))', gap: '8px' }}>
            <div>
              <label className="composer-label" htmlFor="enemy-hp">HP</label>
              <input id="enemy-hp" type="number" min={1} className="field" value={hp} onChange={event => setHp(Number(event.target.value))} />
            </div>
            <div>
              <label className="composer-label" htmlFor="enemy-damage">Урон</label>
              <input id="enemy-damage" type="number" min={1} className="field" value={damage} onChange={event => setDamage(Number(event.target.value))} />
            </div>
            <div>
              <label className="composer-label" htmlFor="enemy-speed">Скорость</label>
              <input id="enemy-speed" type="number" min={1} className="field" value={speed} onChange={event => setSpeed(Number(event.target.value))} />
            </div>
            <div>
              <label className="composer-label" htmlFor="enemy-stagger">Оглушение</label>
              <input id="enemy-stagger" type="number" min={1} className="field" value={staggerThreshold} onChange={event => setStaggerThreshold(Number(event.target.value))} />
            </div>
            <div>
              <label className="composer-label" htmlFor="enemy-parry">Парирование</label>
              <input id="enemy-parry" type="number" min={0.05} max={0.6} step={0.01} className="field" value={parryWindow} onChange={event => setParryWindow(Number(event.target.value))} />
            </div>
          </div>
          <FieldHint>
            HP — здоровье. Урон — сила обычного удара. Скорость — пиксели в секунду. Оглушение — сколько ударов подряд сбивают врага. Парирование — секунды, когда удар отбивается кибер-рукой, обычно 0.12–0.20.
          </FieldHint>

          <div>
            <label className="composer-label" htmlFor="enemy-scene">Сцена Godot</label>
            <input id="enemy-scene" className="field" value={godotScene} onChange={event => setGodotScene(event.target.value)} />
            <FieldHint>Путь к сцене .tscn в проекте Godot. На карточке его можно скопировать.</FieldHint>
          </div>
          <div>
            <label className="composer-label" htmlFor="enemy-image">Портрет, ссылка</label>
            <input id="enemy-image" className="field" value={imageUrl} placeholder="https://... или /assets/enemy.png" onChange={event => setImageUrl(event.target.value)} />
            <FieldHint>Картинка на карточке. Пустое поле — карточка без портрета.</FieldHint>
          </div>
          {imageUrl.trim() && (
            <img src={imageUrl} alt="" style={{ width: 96, height: 96, objectFit: 'cover', borderRadius: 8, border: '1px solid rgba(255,255,255,0.12)' }} />
          )}
          <div>
            <label className="composer-label" htmlFor="enemy-description">Поведение в бою</label>
            <textarea id="enemy-description" className="field" rows={2} value={description} onChange={event => setDescription(event.target.value)} />
          </div>
          <div>
            <label className="composer-label" htmlFor="enemy-lore">Лор</label>
            <textarea id="enemy-lore" className="field" rows={2} value={lore} onChange={event => setLore(event.target.value)} />
            <FieldHint>Поведение — как враг дерётся. Лор — история для команды, на бой не влияет.</FieldHint>
          </div>

          <EnemyAttackEditor attacks={attacks} idPrefix="base" title="Удары" onChange={setAttacks} />
          {usesPhases(type) && <EnemyPhaseEditor phases={phases} onChange={setPhases} />}
          <EnemySpawnFields rooms={rooms} sectorId={sectorId} spawnRoomIds={spawnRoomIds} onChange={setSpawnRoomIds} />

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '10px' }}>
            <span className="composer-label">Что уже сделано в Godot</span>
            <FieldHint>Пять галочек значат, что враг готов. Те же пункты есть кнопками на карточке.</FieldHint>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '6px' }}>
              {(
                [
                  ['sprite', 'Спрайт'],
                  ['skeleton2d', 'Скелет'],
                  ['hitboxes', 'Хитбоксы'],
                  ['audio', 'Звук'],
                  ['tested', 'Тест-арена']
                ] as const
              ).map(([key, label]) => (
                <label key={key} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#cbd5e1' }}>
                  <input
                    type="checkbox"
                    checked={checklist[key]}
                    onChange={event => setChecklist({ ...checklist, [key]: event.target.checked })}
                  />
                  {label}
                </label>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Отмена</button>
            <button type="submit" className="btn btn-primary">{isEditing ? 'Сохранить досье' : 'Добавить в бестиарий'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};
