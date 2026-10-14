import React from 'react';

interface RelationItem {
  id: string;
  title: string;
}

interface BuildRelationFieldsProps {
  tasks: RelationItem[];
  bugs: RelationItem[];
  linkedTaskIds: string[];
  linkedBugIds: string[];
  testedHours: number;
  onToggleTask: (id: string) => void;
  onToggleBug: (id: string) => void;
  onTestedHours: (hours: number) => void;
}

function RelationList({
  title,
  empty,
  items,
  selected,
  onToggle
}: {
  title: string;
  empty: string;
  items: RelationItem[];
  selected: string[];
  onToggle: (id: string) => void;
}) {
  return (
    <div style={{ flex: '1 1 220px' }}>
      <div style={{ fontSize: '12px', fontWeight: 700, color: '#fff', marginBottom: '6px' }}>{title}</div>
      {items.length === 0 ? (
        <p style={{ margin: 0, fontSize: '11.5px', color: 'var(--text-dim)' }}>{empty}</p>
      ) : (
        <div style={{ maxHeight: '120px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {items.map(item => (
            <label key={item.id} style={{ display: 'flex', gap: '6px', alignItems: 'center', fontSize: '11.5px', color: '#cbd5e1' }}>
              <input type="checkbox" checked={selected.includes(item.id)} onChange={() => onToggle(item.id)} />
              <span>{item.title}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

export const BuildRelationFields: React.FC<BuildRelationFieldsProps> = ({
  tasks,
  bugs,
  linkedTaskIds,
  linkedBugIds,
  testedHours,
  onToggleTask,
  onToggleBug,
  onTestedHours
}) => (
  <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
    <label style={{ fontSize: '12px', color: '#fff', fontWeight: 700 }}>
      Часы плейтеста
      <input
        type="number"
        min={0}
        step={0.5}
        className="field"
        value={testedHours}
        onChange={(event) => onTestedHours(Number(event.target.value) || 0)}
        style={{ display: 'block', width: '120px', marginTop: '6px', fontSize: '12px' }}
      />
    </label>
    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
      <RelationList
        title="Задачи канбана"
        empty="На канбане нет задач"
        items={tasks}
        selected={linkedTaskIds}
        onToggle={onToggleTask}
      />
      <RelationList
        title="Баги плейтестов"
        empty="В журнале нет багов"
        items={bugs}
        selected={linkedBugIds}
        onToggle={onToggleBug}
      />
    </div>
  </div>
);
