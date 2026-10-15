import React, { useState } from 'react';
import { ConfirmModal } from '../shared/ui/ConfirmModal';
import {
  PlatformerPhysicsParams,
  StateMachineState
} from '../entities/gdscript-generator';
import {
  CodeExporterPanel,
  ExplanationGuide,
  JumpSimulator,
  PhysicsParametersPanel,
  StateMachineDesigner
} from '../features/gdscript-generator';

interface GdscriptGeneratorPageProps {
  physicsParams: PlatformerPhysicsParams;
  selectedPresetId: string;
  states: StateMachineState[];
  selectedStateId: string | null;
  activeTab: 'physics' | 'states' | 'code';
  onTabChange: (tab: 'physics' | 'states' | 'code') => void;
  onParamChange: <K extends keyof PlatformerPhysicsParams>(
    key: K,
    value: PlatformerPhysicsParams[K]
  ) => void;
  onSelectPreset: (presetId: string) => void;
  onSelectState: (id: string) => void;
  onToggleState: (id: string) => void;
  onUpdateState: (state: StateMachineState) => void;
  onAddState: (state: StateMachineState) => void;
  onRemoveState: (id: string) => void;
  onToggleTransition: (fromId: string, toId: string) => void;
  onResetDefaults: () => void;
  onShowToast: (msg: string) => void;
}

export const GdscriptGeneratorPage: React.FC<GdscriptGeneratorPageProps> = ({
  physicsParams,
  selectedPresetId,
  states,
  selectedStateId,
  activeTab,
  onTabChange,
  onParamChange,
  onSelectPreset,
  onSelectState,
  onToggleState,
  onUpdateState,
  onAddState,
  onRemoveState,
  onToggleTransition,
  onResetDefaults,
  onShowToast
}) => {
  const [pendingReset, setPendingReset] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Шапка страницы */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '24px' }}>⚡</span>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#fff' }}>
              Генератор шаблонов кода Godot 4 & Калькулятор физики
            </h2>
          </div>
          <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>
            Конструктор State Machine (Idle, Run, Jump, Fall, Dash, Parry, Hurt, Dead) и расчет прыжка CharacterBody2D с coyote_time и jump_buffer
          </p>
        </div>

        {/* Переключатель вкладок страницы */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '4px',
            background: 'rgba(2, 6, 23, 0.7)',
            padding: '4px',
            borderRadius: '8px',
            border: '1px solid var(--border)'
          }}
        >
          <button
            type="button"
            onClick={() => onTabChange('physics')}
            style={{
              padding: '6px 14px',
              borderRadius: '6px',
              border: 'none',
              background: activeTab === 'physics' ? 'var(--accent-cyan)' : 'none',
              color: activeTab === 'physics' ? '#000' : 'var(--text-muted)',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>🎮</span>
            <span>Физика & Симулятор</span>
          </button>

          <button
            type="button"
            onClick={() => onTabChange('states')}
            style={{
              padding: '6px 14px',
              borderRadius: '6px',
              border: 'none',
              background: activeTab === 'states' ? 'var(--accent-cyan)' : 'none',
              color: activeTab === 'states' ? '#000' : 'var(--text-muted)',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>🤖</span>
            <span>State Machine</span>
          </button>

          <button
            type="button"
            onClick={() => onTabChange('code')}
            style={{
              padding: '6px 14px',
              borderRadius: '6px',
              border: 'none',
              background: activeTab === 'code' ? 'var(--accent-cyan)' : 'none',
              color: activeTab === 'code' ? '#000' : 'var(--text-muted)',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>💾</span>
            <span>Готовый GDScript</span>
          </button>
        </div>
      </div>

      {/* Обучающая плашка для новичков */}
      <ExplanationGuide />

      {/* Вкладка 1: Физика и Интерактивный симулятор */}
      {activeTab === 'physics' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <JumpSimulator params={physicsParams} />
          <PhysicsParametersPanel
            params={physicsParams}
            selectedPresetId={selectedPresetId}
            onParamChange={onParamChange}
            onSelectPreset={onSelectPreset}
            onReset={() => setPendingReset(true)}
          />
        </div>
      )}

      {/* Вкладка 2: Конструктор конечного автомата (State Machine) */}
      {activeTab === 'states' && (
        <StateMachineDesigner
          states={states}
          selectedStateId={selectedStateId}
          onSelectState={onSelectState}
          onToggleState={onToggleState}
          onUpdateState={onUpdateState}
          onAddState={onAddState}
          onRemoveState={onRemoveState}
          onToggleTransition={onToggleTransition}
        />
      )}

      {/* Вкладка 3: Готовый GDScript код и экспорт */}
      {activeTab === 'code' && (
        <CodeExporterPanel
          params={physicsParams}
          states={states}
          onShowToast={onShowToast}
        />
      )}

      <ConfirmModal
        isOpen={pendingReset}
        title="Сброс генератора"
        message="Физика и машина состояний вернутся к набору Кибер-Утки. Свои состояния пропадут."
        confirmText="Сбросить"
        onConfirm={() => {
          onResetDefaults();
          setPendingReset(false);
          onShowToast('Генератор сброшен к набору Кибер-Утки');
        }}
        onClose={() => setPendingReset(false)}
      />
    </div>
  );
};
