import { createZipArchive, ZipFileInput } from '../../shared/lib/simpleZip';
import {
  DEFAULT_PHYSICS_PARAMS,
  DEFAULT_STATE_MACHINE_STATES,
  generatePhysicsDataGd,
  generatePlayerControllerGd,
  generatePhysicsResourceTres,
  generateStateMachineOopGd,
  PlatformerPhysicsParams,
  StateMachineState
} from '../gdscript-generator';
import {
  DEFAULT_ASSETS,
  generateGodotAssetManifest,
  AssetItem
} from '../asset-pipeline';
import { BridgeConfigFile } from './types';

export function generateFullConfigBundle(inputs?: {
  roomMatrix?: unknown;
  bestiary?: unknown;
  narrative?: unknown;
  physicsParams?: PlatformerPhysicsParams;
  states?: StateMachineState[];
  assets?: AssetItem[];
}): BridgeConfigFile[] {
  const roomsJson = exportWorldMatrix(inputs?.roomMatrix);
  const bestiaryJson = exportEnemies(inputs?.bestiary);
  const narrativeJson = exportDialogues(inputs?.narrative);

  const physicsParams = inputs?.physicsParams ?? DEFAULT_PHYSICS_PARAMS;
  const states = inputs?.states ?? DEFAULT_STATE_MACHINE_STATES;
  const assets = inputs?.assets ?? DEFAULT_ASSETS;

  const playerControllerGd = generatePlayerControllerGd(physicsParams, states);
  const playerPhysicsTres = generatePhysicsResourceTres(physicsParams);
  const assetManifestGd = generateGodotAssetManifest(assets);
  const oop = generateStateMachineOopGd(physicsParams, states);

  const core = buildConfigBundle({
    roomsJson,
    bestiaryJson,
    narrativeJson,
    playerControllerGd,
    assetManifestGd,
    playerPhysicsTres
  });

  const scriptFiles: BridgeConfigFile[] = [
    textFile({
      id: 'player_physics_data',
      filename: 'PlayerPhysicsData.gd',
      targetResPath: 'res://data/PlayerPhysicsData.gd',
      category: 'code',
      title: 'Класс ресурса физики',
      description: 'Скрипт, на который ссылается player_physics.tres',
      icon: '📜',
      sourceLabel: 'GDScript и физика',
      content: generatePhysicsDataGd(physicsParams)
    }),
    textFile({
      id: 'state_machine',
      filename: 'StateMachine.gd',
      targetResPath: 'res://scripts/player/StateMachine.gd',
      category: 'code',
      title: 'Машина состояний',
      description: 'Альтернатива цельному контроллеру. Дочерние ноды называются как состояния',
      icon: '🤖',
      sourceLabel: 'GDScript и физика',
      content: oop.stateMachineGd
    }),
    textFile({
      id: 'state_base',
      filename: 'State.gd',
      targetResPath: 'res://scripts/player/State.gd',
      category: 'code',
      title: 'Базовый класс состояния',
      description: 'Общий класс. Логика каждого состояния лежит в своём файле',
      icon: '📄',
      sourceLabel: 'GDScript и физика',
      content: oop.baseStateGd
    })
  ];

  const usedNames = new Set<string>();
  const stateFiles = oop.stateFiles.map(file => {
    let filename = file.fileName;
    let index = 2;
    while (usedNames.has(filename)) {
      filename = file.fileName.replace(/\.gd$/, `_${index}.gd`);
      index += 1;
    }
    usedNames.add(filename);
    return textFile({
      id: `state_file_${filename.replace(/\.gd$/, '').toLowerCase()}`,
      filename,
      targetResPath: `res://scripts/player/states/${filename}`,
      category: 'code',
      title: `Состояние ${filename.replace(/State\.gd$/, '')}`,
      description: 'Скрипт одного включённого состояния из конструктора',
      icon: '🎬',
      sourceLabel: 'GDScript и физика',
      content: file.code
    });
  });

  return [...core, ...scriptFiles, ...stateFiles];
}

function exportWorldMatrix(roomMatrix: unknown): string {
  const data = roomMatrix && typeof roomMatrix === 'object' ? roomMatrix as { rooms?: unknown; sectors?: unknown } : {};
  return JSON.stringify({
    rooms: Array.isArray(data.rooms) ? data.rooms : [],
    sectors: Array.isArray(data.sectors) ? data.sectors : []
  }, null, 2);
}

function exportEnemies(bestiary: unknown): string {
  if (Array.isArray(bestiary)) return JSON.stringify(bestiary, null, 2);
  const items = bestiary && typeof bestiary === 'object' ? (bestiary as { items?: unknown }).items : [];
  return JSON.stringify(Array.isArray(items) ? items : [], null, 2);
}

function exportDialogues(narrative: unknown): string {
  if (Array.isArray(narrative)) return JSON.stringify(narrative, null, 2);
  const chapters = narrative && typeof narrative === 'object' ? (narrative as { chapters?: unknown }).chapters : [];
  return JSON.stringify(Array.isArray(chapters) ? chapters : [], null, 2);
}

function textFile(file: Omit<BridgeConfigFile, 'fileSizeBytes' | 'selected'>): BridgeConfigFile {
  return {
    ...file,
    selected: true,
    fileSizeBytes: new TextEncoder().encode(file.content).length
  };
}

export function buildConfigBundle(params: {
  roomsJson: string;
  bestiaryJson: string;
  narrativeJson: string;
  playerControllerGd: string;
  assetManifestGd: string;
  playerPhysicsTres: string;
}): BridgeConfigFile[] {
  const encoder = new TextEncoder();

  const configs: Omit<BridgeConfigFile, 'fileSizeBytes'>[] = [
    {
      id: 'world_matrix',
      filename: 'world_matrix.json',
      targetResPath: 'res://data/world_matrix.json',
      category: 'levels',
      title: 'Матрица комнат и сетка мира',
      description: 'Комнаты и секторы с карты. Фильтр экрана в файл не попадает',
      icon: '🗺️',
      sourceLabel: 'Карта комнат',
      selected: true,
      content: params.roomsJson
    },
    {
      id: 'enemies',
      filename: 'enemies.json',
      targetResPath: 'res://data/enemies.json',
      category: 'combat',
      title: 'База данных врагов и боссов',
      description: 'Список врагов из бестиария, без выбранной карточки и фильтра',
      icon: '👾',
      sourceLabel: 'Бестиарий',
      selected: true,
      content: params.bestiaryJson
    },
    {
      id: 'dialogues',
      filename: 'dialogues.json',
      targetResPath: 'res://data/dialogues.json',
      category: 'narrative',
      title: 'Диалоги и сценарий глав',
      description: 'Главы со страницы «Мысли и сценарий»',
      icon: '📜',
      sourceLabel: 'Мысли и сценарий',
      selected: true,
      content: params.narrativeJson
    },
    {
      id: 'player_controller',
      filename: 'PlayerController.gd',
      targetResPath: 'res://scripts/player/PlayerController.gd',
      category: 'code',
      title: 'Скрипт CharacterBody2D',
      description: 'Цельный контроллер. Его достаточно, если скрипты состояний не подключаете',
      icon: '🎮',
      sourceLabel: 'GDScript и физика',
      selected: true,
      content: params.playerControllerGd
    },
    {
      id: 'asset_manifest',
      filename: 'AssetManifest.gd',
      targetResPath: 'res://scripts/core/AssetManifest.gd',
      category: 'assets',
      title: 'Реестр ассетов игры',
      description: 'Пути из пайплайна. Превью, загруженные в хаб, копируются в эти res:// при выгрузке',
      icon: '📦',
      sourceLabel: 'Пайплайн ассетов',
      selected: true,
      content: params.assetManifestGd
    },
    {
      id: 'player_physics',
      filename: 'player_physics.tres',
      targetResPath: 'res://data/player_physics.tres',
      category: 'code',
      title: 'Ресурс физики игрока (.tres)',
      description: 'Скорость, гравитация и таймеры. Рядом кладётся PlayerPhysicsData.gd',
      icon: '⚡',
      sourceLabel: 'GDScript и физика',
      selected: true,
      content: params.playerPhysicsTres
    }
  ];

  return configs.map(c => ({
    ...c,
    fileSizeBytes: encoder.encode(c.content).length
  }));
}

function filePayload(file: BridgeConfigFile): BlobPart {
  if (file.binary && file.binary.byteLength > 0) return file.binary as BlobPart;
  return file.content;
}

export function downloadConfigFile(file: BridgeConfigFile) {
  const blob = new Blob([filePayload(file)], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = file.filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function downloadConfigBundleZip(files: BridgeConfigFile[]) {
  const zipInputs: ZipFileInput[] = files
    .filter(f => f.selected)
    .map(f => {
      // res://data/world_matrix.json -> data/world_matrix.json
      const relativePath = f.targetResPath.replace(/^res:\/\//, '');
      return {
        name: relativePath,
        content: f.binary && f.binary.byteLength > 0 ? f.binary : f.content
      };
    });

  const zipBlob = createZipArchive(zipInputs);
  const url = URL.createObjectURL(zipBlob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `cyber_duck_godot_configs_${new Date().toISOString().slice(0, 10)}.zip`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function writeFilesToGodotDirectory(
  dirHandle: FileSystemDirectoryHandle,
  files: BridgeConfigFile[]
): Promise<number> {
  let writtenCount = 0;

  for (const file of files) {
    if (!file.selected) continue;
    // res://data/world_matrix.json -> ['data', 'world_matrix.json']
    const parts = file.targetResPath.replace(/^res:\/\//, '').split('/');
    const fileName = parts.pop();
    if (!fileName) continue;

    let targetDir = dirHandle;
    for (const part of parts) {
      targetDir = await targetDir.getDirectoryHandle(part, { create: true });
    }

    const fileHandle = await targetDir.getFileHandle(fileName, { create: true });
    const writable = await fileHandle.createWritable();
    await writable.write(filePayload(file));
    await writable.close();
    writtenCount++;
  }

  return writtenCount;
}
