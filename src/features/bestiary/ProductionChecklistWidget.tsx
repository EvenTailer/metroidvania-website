import React from 'react';
import { ProductionChecklist } from '../../entities/bestiary';

interface ProductionChecklistWidgetProps {
  checklist: ProductionChecklist;
  onToggle: (step: keyof ProductionChecklist) => void;
  compact?: boolean;
}

const CHECKLIST_STEPS: { key: keyof ProductionChecklist; label: string; icon: string; hint: string }[] = [
  { key: 'sprite', label: 'Спрайт', icon: '🎨', hint: 'Картинка врага нарисована' },
  { key: 'skeleton2d', label: 'Скелет', icon: '🦴', hint: 'В Godot собран Skeleton2D и анимации' },
  { key: 'hitboxes', label: 'Хитбоксы', icon: '📐', hint: 'Зоны удара и получения урона расставлены' },
  { key: 'audio', label: 'Звук', icon: '🔊', hint: 'Звуки атак и попадания подключены' },
  { key: 'tested', label: 'Тест', icon: '🕹️', hint: 'Враг проверен в бою на тест-арене' }
];

export const ProductionChecklistWidget: React.FC<ProductionChecklistWidgetProps> = ({
  checklist,
  onToggle,
  compact = false
}) => {
  const completedCount = CHECKLIST_STEPS.filter(s => checklist[s.key]).length;
  const isAllDone = completedCount === CHECKLIST_STEPS.length;

  return (
    <div style={{ marginTop: '8px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
        <span style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Готовность в Godot
        </span>
        <span
          style={{
            fontSize: '10px',
            fontWeight: 800,
            color: isAllDone ? 'var(--accent-emerald)' : 'var(--accent-cyan)'
          }}
        >
          {completedCount} / 5 {isAllDone ? '✓ ГОТОВ' : ''}
        </span>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
        {CHECKLIST_STEPS.map(step => {
          const isDone = checklist[step.key];
          return (
            <button
              key={step.key}
              type="button"
              onClick={e => {
                e.stopPropagation();
                onToggle(step.key);
              }}
              style={{
                fontSize: compact ? '9px' : '10px',
                padding: '2px 6px',
                borderRadius: '4px',
                border: isDone
                  ? '1px solid rgba(16, 185, 129, 0.5)'
                  : '1px solid rgba(255, 255, 255, 0.1)',
                background: isDone
                  ? 'rgba(16, 185, 129, 0.15)'
                  : 'rgba(255, 255, 255, 0.03)',
                color: isDone ? '#6ee7b7' : '#94a3b8',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                transition: 'all 0.12s ease'
              }}
              title={`${step.hint}. Нажмите, чтобы отметить.`}
            >
              <span>{isDone ? '✓' : step.icon}</span>
              <span>{step.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
