import React from 'react';
import { Task } from '../entities/task';
import { RoadmapStep } from '../entities/roadmap';
import { NoteItem } from '../entities/note';

interface AiExportPageProps {
  tasks: Task[];
  roadmap: RoadmapStep[];
  currentSprintStepId: string | null;
  notes: NoteItem[];
  onShowToast: (msg: string) => void;
}

export function generateFullContext(
  tasks: Task[],
  roadmap: RoadmapStep[],
  currentSprintStepId: string | null,
  notes: NoteItem[] = []
): string {
  const line = (task: Task, label: string) =>
    `- [${label}] ${task.title} (${task.author}${task.stepId ? `, ${task.stepId}` : ''})`;
  const activeTasks = tasks.filter(t => t.status === 'in-progress').map(t => line(t, 'В РАБОТЕ')).join('\n');
  const backlogTasks = tasks.filter(t => t.status === 'backlog').map(t => line(t, 'БЭКЛОГ')).join('\n');
  const testTasks = tasks.filter(t => t.status === 'test').map(t => line(t, 'ТЕСТ')).join('\n');
  const doneTasks = tasks.filter(t => t.status === 'done').map(t => line(t, 'ГОТОВО')).join('\n');
  const notesBlock = notes.map(n => `- ${n.tag}: ${n.text} (${n.author})`).join('\n');
  const currentStep = currentSprintStepId ? roadmap.find(s => s.id === currentSprintStepId) : null;

  return `# PROJECT CONTEXT: CYBER-DUCK METROIDVANIA
## 1. Сеттинг и Персонаж
- **Жанр:** 2D Мрачная Киберпанк-Метроидвания (Nine Sols + Hollow Knight).
- **Движок:** Godot Engine 4.3+ (GDScript, 2D костная анимация Skeleton2D).
- **Главный герой:** Кибер-Утка (Агент-09), циничный детектив-наемник в карго-штанах, старых кроссовках и грязной майке с армейским жетоном.
- **Импланты героя (Ability Gating):**
  1. Нейро-глаз «Спектр» (проявляет скрытые стены и снимает синие лазерные решетки).
  2. Кибер-рука (парирование пуль с таймингом 0.15с, Hitstop 0.08с, выбивание дверей).
  3. Реактивные кроссовки (горизонтальный рывок Dash с i-frames через лазеры).
  4. Трос-гарпун (зацеп за неоновые точки подвеса на потолке).

## 2. Текущий фокус спринта недели
${
  currentStep
    ? `- **Активный шаг:** ${currentStep.id.toUpperCase()}: ${currentStep.title}
- **Технологии шага:** ${currentStep.tech}
- **Описание:** ${currentStep.desc}`
    : `- **Активный шаг:** Спринт еще не выбран (разработка на стадии инициализации / сетапа)`
}

## 3. Канбан-доска (Текущий статус задач)
${activeTasks || 'Нет задач в работе'}
${testTasks}
${backlogTasks}
${doneTasks || 'Нет закрытых задач'}

## 4. Заметки
${notesBlock || 'Нет заметок'}

## 5. Архитектура Веб-Хаба (React FSD)
- Стек: React (Vite + TypeScript) + Feature-Sliced Design (app, pages, widgets, features, entities, shared).
- Доска (задачи, спринт, галочки шагов): /api/board.php
- Чат: /api/chat.php. Галерея: /api/gallery.php. Сценарий: /api/narrative.php
- Ключи ИИ: localStorage mv_key_{provider}
`;
}

export const AiExportPage: React.FC<AiExportPageProps> = ({
  tasks,
  roadmap,
  currentSprintStepId,
  notes,
  onShowToast
}) => {
  const contextText = generateFullContext(tasks, roadmap, currentSprintStepId, notes);

  const copyMarkdown = () => {
    navigator.clipboard.writeText(contextText).then(() => {
      onShowToast('Слепок проекта скопирован! Вставьте в Cursor или Grok');
    });
  };

  const copyJson = () => {
    const data = {
      project: 'Cyber-Duck Metroidvania',
      engine: 'Godot 4.3',
      currentSprint: currentSprintStepId,
      tasks,
      roadmap,
      notes
    };
    navigator.clipboard.writeText(JSON.stringify(data, null, 2)).then(() => {
      onShowToast('context.json скопирован в буфер обмена!');
    });
  };

  const downloadMd = () => {
    const blob = new Blob([contextText], { type: 'text/markdown;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'PROJECT_CONTEXT.md';
    a.click();
    onShowToast('Файл PROJECT_CONTEXT.md скачан!');
  };

  return (
    <div className="view-content">
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ fontSize: '16px', color: '#fff' }}>
          Единый файл контекста для внешних агентов (Cursor / Grok / Claude)
        </h3>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '3px' }}>
          Этот генератор формирует полный актуальный слепок игры: лор персонажа, активный шаг роадмапа, задачи канбана, физику управления и архитектуру.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '14px', flexWrap: 'wrap' }}>
        <button className="btn btn-primary" onClick={copyMarkdown}>
          📋 Скопировать Markdown для Cursor / Grok
        </button>
        <button className="btn btn-secondary" onClick={downloadMd}>
          💾 Скачать PROJECT_CONTEXT.md
        </button>
        <button className="btn btn-cyan" onClick={copyJson}>
          📦 Скопировать context.json
        </button>
      </div>

      <div className="panel">
        <pre
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '12px',
            color: 'var(--text-muted)',
            whiteSpace: 'pre-wrap',
            maxHeight: '480px',
            overflowY: 'auto',
            lineHeight: 1.6
          }}
        >
          {contextText}
        </pre>
      </div>
    </div>
  );
};
