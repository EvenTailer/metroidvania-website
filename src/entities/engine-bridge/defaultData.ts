import { BuildRelease } from './types';

export function withoutFactorySeeds(builds: BuildRelease[]): BuildRelease[] {
  return builds.filter(build => {
    const seed = DEFAULT_BUILDS.find(item => item.id === build.id);
    if (!seed) return true;
    return build.version !== seed.version || build.title !== seed.title;
  });
}

export const DEFAULT_BUILDS: BuildRelease[] = [
  {
    id: 'build-v0-3-0',
    version: 'v0.3.0-vertical-slice',
    title: 'Vertical Slice (Секторы Альфа + Бета & Босс)',
    stage: 'vertical-slice',
    status: 'testing',
    releaseDate: '2026-10-06',
    targetEngineVersion: 'Godot 4.3-stable',
    description: 'Ключевая сборка для закрытого теста издателем и тестерами. Включает прохождение Секторов Альфа и Бета, битву с боссом Страж Улья, механику Dash через лазеры и парирование кибер-рукой.',
    changelog: [
      { id: 'ch-1', type: 'feat', text: 'Интегрирован босс Страж Улья с 3 боевыми фазами и призывом дронов' },
      { id: 'ch-2', type: 'feat', text: 'Добавлен расчет coyote_time (0.12с) и jump_buffer (0.10с) в PlayerController.gd' },
      { id: 'ch-3', type: 'fix', text: 'Устранен софтлок в комнате room-b2 при отсутствии способности рывка' },
      { id: 'ch-4', type: 'balance', text: 'Урон лазерного залпа босса снижен с 35 до 25 HP для честного баланса' },
      { id: 'ch-5', type: 'perf', text: 'Оптимизирован парсинг world_matrix.json при переходе между секторами' }
    ],
    artifacts: [
      { id: 'art-1', platform: 'windows', title: 'Windows x64 (.zip)', url: 'https://drive.google.com/cyber-duck/v0.3.0-win64.zip', sizeMb: 78.4 },
      { id: 'art-2', platform: 'steam', title: 'Steam Playtest Branch [beta-testing]', url: 'steam://install/9999990' },
      { id: 'art-3', platform: 'linux', title: 'Linux SteamDeck (.tar.gz)', url: 'https://drive.google.com/cyber-duck/v0.3.0-linux.tar.gz', sizeMb: 82.1 }
    ],
    linkedTaskIds: ['task-boss-ai', 'task-coyote-time', 'task-dash-laser'],
    linkedBugIds: ['pt-1', 'pt-2'],
    testedHours: 14.5,
    isLatestRelease: true
  },
  {
    id: 'build-v0-2-1',
    version: 'v0.2.1-demo-candidate',
    title: 'Steam Next Fest Demo (Кандидат)',
    stage: 'demo-steam',
    status: 'stable',
    releaseDate: '2026-09-28',
    targetEngineVersion: 'Godot 4.3',
    description: 'Публичный 30-минутный срез игры для игроков: пролог, получение первого импланта нейро-глаза, исследование неоновых пещер и мини-босс.',
    changelog: [
      { id: 'ch-21', type: 'feat', text: 'Стартовое меню с полной поддержкой геймпадов Xbox / DualSense' },
      { id: 'ch-22', type: 'feat', text: 'Диалоговая система с портретами персонажей из dialogues.json' },
      { id: 'ch-23', type: 'fix', text: 'Устранено подергивание камеры Pixel Snap при движении по наклонным поверхностям' },
      { id: 'ch-24', type: 'perf', text: 'Предзагрузка шейдеров исключила фризы при первом выстреле' }
    ],
    artifacts: [
      { id: 'art-21', platform: 'itch', title: 'Itch.io Закрытая страница демо', url: 'https://itch.io/cyber-duck-demo-secret' },
      { id: 'art-22', platform: 'windows', title: 'Windows Demo (.zip)', url: 'https://drive.google.com/cyber-duck/v0.2.1-demo.zip', sizeMb: 64.2 }
    ],
    linkedTaskIds: ['task-menu-gamepad', 'task-dialogue-system'],
    linkedBugIds: ['pt-3'],
    testedHours: 26.0,
    isLatestRelease: false
  },
  {
    id: 'build-v0-1-0',
    version: 'v0.1.0-alpha-prototype',
    title: 'Первый играбельный прототип (Whitebox)',
    stage: 'alpha',
    status: 'deprecated',
    releaseDate: '2026-09-12',
    targetEngineVersion: 'Godot 4.2.2',
    description: 'Ранняя проверка управления персонажем, физики прыжка и базового тайлсета без врагов и звука.',
    changelog: [
      { id: 'ch-31', type: 'feat', text: 'Первый запуск CharacterBody2D с бегом и прыжком' },
      { id: 'ch-32', type: 'feat', text: 'Базовая сетка комнат 16x16' }
    ],
    artifacts: [
      { id: 'art-31', platform: 'drive', title: 'Архив прототипа (Google Drive)', url: 'https://drive.google.com/cyber-duck/alpha_v0.1.zip', sizeMb: 42.0 }
    ],
    linkedTaskIds: ['task-character-setup'],
    linkedBugIds: [],
    testedHours: 8.0,
    isLatestRelease: false
  }
];
