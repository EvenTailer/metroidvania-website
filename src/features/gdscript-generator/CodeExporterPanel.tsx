import React, { useMemo, useState } from 'react';
import {
  generatePhysicsDataGd,
  generatePhysicsResourceTres,
  generatePlayerControllerGd,
  generateStateMachineOopGd,
  PlatformerPhysicsParams,
  StateMachineState
} from '../../entities/gdscript-generator';

interface CodeExporterPanelProps {
  params: PlatformerPhysicsParams;
  states: StateMachineState[];
  onShowToast: (msg: string) => void;
}

type TabKey = 'controller' | 'stateMachine' | 'state' | 'physicsData' | 'tres' | 'stateFile';

export const CodeExporterPanel: React.FC<CodeExporterPanelProps> = ({
  params,
  states,
  onShowToast
}) => {
  const [activeTab, setActiveTab] = useState<TabKey>('controller');
  const [stateFileIndex, setStateFileIndex] = useState(0);

  const playerCode = useMemo(
    () => generatePlayerControllerGd(params, states),
    [params, states]
  );

  const oopCode = useMemo(
    () => generateStateMachineOopGd(params, states),
    [params, states]
  );

  const physicsDataCode = useMemo(
    () => generatePhysicsDataGd(params),
    [params]
  );

  const tresCode = useMemo(
    () => generatePhysicsResourceTres(params),
    [params]
  );

  const stateFile = oopCode.stateFiles[stateFileIndex] ?? oopCode.stateFiles[0];

  const currentCode = useMemo(() => {
    switch (activeTab) {
      case 'controller':
        return playerCode;
      case 'stateMachine':
        return oopCode.stateMachineGd;
      case 'state':
        return oopCode.baseStateGd;
      case 'physicsData':
        return physicsDataCode;
      case 'tres':
        return tresCode;
      case 'stateFile':
        return stateFile?.code ?? '';
    }
  }, [activeTab, playerCode, oopCode, physicsDataCode, tresCode, stateFile]);

  const currentFileName = useMemo(() => {
    switch (activeTab) {
      case 'controller':
        return 'PlayerController.gd';
      case 'stateMachine':
        return 'StateMachine.gd';
      case 'state':
        return 'State.gd';
      case 'physicsData':
        return 'PlayerPhysicsData.gd';
      case 'tres':
        return 'player_physics.tres';
      case 'stateFile':
        return stateFile?.fileName ?? 'State.gd';
    }
  }, [activeTab, stateFile]);

  const copyCode = () => {
    navigator.clipboard.writeText(currentCode).then(() => {
      onShowToast(`Код ${currentFileName} скопирован в буфер!`);
    });
  };

  const downloadFile = () => {
    const blob = new Blob([currentCode], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = currentFileName;
    a.click();
    URL.revokeObjectURL(url);
    onShowToast(`Файл ${currentFileName} успешно скачан!`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* Шапка экспорта с кнопками скачивания и копирования */}
      <div
        style={{
          background: 'rgba(11, 16, 28, 0.95)',
          border: '1px solid var(--border)',
          borderRadius: '10px',
          padding: '14px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '10px'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '18px' }}>💾</span>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#fff' }}>
              Готовый код для Godot 4.3 (GDScript)
            </h3>
            <span
              style={{
                fontSize: '10px',
                fontWeight: 800,
                padding: '2px 7px',
                borderRadius: '10px',
                background: 'rgba(16, 185, 129, 0.2)',
                color: 'var(--accent-emerald)'
              }}
            >
              Совпадает с конструктором
            </span>
          </div>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            Включает математический расчет гравитации, Coyote Time, Jump Buffer, Dash и конечный автомат
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={copyCode}
            style={{ fontSize: '12px', padding: '6px 12px' }}
          >
            📋 Скопировать код
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={downloadFile}
            style={{ fontSize: '12px', padding: '6px 14px', fontWeight: 700 }}
          >
            ⬇ Скачать {currentFileName}
          </button>
        </div>
      </div>

      {/* Выбор файла / вкладки */}
      <div
        style={{
          display: 'flex',
          gap: '6px',
          background: 'rgba(2, 6, 23, 0.6)',
          padding: '4px',
          borderRadius: '8px',
          border: '1px solid var(--border)'
        }}
      >
        <button
          type="button"
          onClick={() => setActiveTab('controller')}
          style={{
            flex: 1,
            padding: '7px 10px',
            borderRadius: '6px',
            border: 'none',
            background: activeTab === 'controller' ? 'var(--accent-cyan)' : 'none',
            color: activeTab === 'controller' ? '#000' : 'var(--text-muted)',
            fontSize: '11.5px',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          🎮 PlayerController.gd (All-in-One)
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('stateMachine')}
          style={{
            flex: 1,
            padding: '7px 10px',
            borderRadius: '6px',
            border: 'none',
            background: activeTab === 'stateMachine' ? 'var(--accent-cyan)' : 'none',
            color: activeTab === 'stateMachine' ? '#000' : 'var(--text-muted)',
            fontSize: '11.5px',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          ⚙️ StateMachine.gd (ООП)
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('state')}
          style={{
            flex: 1,
            padding: '7px 10px',
            borderRadius: '6px',
            border: 'none',
            background: activeTab === 'state' ? 'var(--accent-cyan)' : 'none',
            color: activeTab === 'state' ? '#000' : 'var(--text-muted)',
            fontSize: '11.5px',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          📄 State.gd (Базовый стейт)
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('tres')}
          style={{
            flex: 1,
            padding: '7px 10px',
            borderRadius: '6px',
            border: 'none',
            background: activeTab === 'tres' ? 'var(--accent-cyan)' : 'none',
            color: activeTab === 'tres' ? '#000' : 'var(--text-muted)',
            fontSize: '11.5px',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          📦 player_physics.tres (Ресурс)
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('physicsData')}
          style={{
            flex: 1,
            padding: '7px 10px',
            borderRadius: '6px',
            border: 'none',
            background: activeTab === 'physicsData' ? 'var(--accent-cyan)' : 'none',
            color: activeTab === 'physicsData' ? '#000' : 'var(--text-muted)',
            fontSize: '11.5px',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          📜 PlayerPhysicsData.gd
        </button>
      </div>

      {oopCode.stateFiles.length > 0 && (
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-muted)' }}>
          Скрипт состояния
          <select
            className="field"
            value={stateFile?.fileName ?? ''}
            onChange={(event) => {
              const index = oopCode.stateFiles.findIndex(file => file.fileName === event.target.value);
              setStateFileIndex(index < 0 ? 0 : index);
              setActiveTab('stateFile');
            }}
            style={{ fontSize: '12px' }}
          >
            {oopCode.stateFiles.map(file => (
              <option key={file.fileName} value={file.fileName}>{file.fileName}</option>
            ))}
          </select>
        </label>
      )}

      {/* Окно кода */}
      <div style={{ position: 'relative' }}>
        <textarea
          readOnly
          value={currentCode}
          style={{
            width: '100%',
            height: '420px',
            background: 'rgba(2, 6, 23, 0.95)',
            border: '1px solid rgba(0, 242, 254, 0.25)',
            borderRadius: '8px',
            padding: '14px',
            color: '#93c5fd',
            fontFamily: 'Consolas, Monaco, "Courier New", monospace',
            fontSize: '12px',
            lineHeight: 1.45,
            resize: 'vertical',
            boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.5)'
          }}
        />
      </div>

      {/* 3 простых шага подключения для новичков и школьников */}
      <div
        style={{
          background: 'rgba(15, 23, 42, 0.7)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '8px',
          padding: '12px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}
      >
        <div style={{ fontSize: '12px', fontWeight: 800, color: '#fff' }}>
          💡 Как запустить в Godot 4.3 за 2 минуты:
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '8px 10px', borderRadius: '6px' }}>
            <span style={{ color: 'var(--accent-cyan)', fontWeight: 800, fontSize: '11px' }}>ШАГ 1:</span>
            <p style={{ margin: '3px 0 0', fontSize: '11px', color: '#cbd5e1' }}>
              В сцене создайте ноду <code>CharacterBody2D</code>, добавьте в неё <code>CollisionShape2D</code> и <code>AnimatedSprite2D</code>.
            </p>
          </div>
          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '8px 10px', borderRadius: '6px' }}>
            <span style={{ color: 'var(--accent-cyan)', fontWeight: 800, fontSize: '11px' }}>ШАГ 2:</span>
            <p style={{ margin: '3px 0 0', fontSize: '11px', color: '#cbd5e1' }}>
              Сохраните скачанный <code>PlayerController.gd</code> и прикрепите его на ноду CharacterBody2D.
            </p>
          </div>
          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '8px 10px', borderRadius: '6px' }}>
            <span style={{ color: 'var(--accent-cyan)', fontWeight: 800, fontSize: '11px' }}>ШАГ 3:</span>
            <p style={{ margin: '3px 0 0', fontSize: '11px', color: '#cbd5e1' }}>
              В Project Settings → Input Map проверьте клавиши <code>ui_left</code>, <code>ui_right</code>, <code>jump</code> и <code>dash</code>. Готово!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
