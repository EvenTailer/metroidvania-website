import { RoomNode, SectorInfo } from './types';

export function exportToGdscript(rooms: RoomNode[], sectors: SectorInfo[]): string {
  const lines: string[] = [
    '# ============================================================================== #',
    '# CYBER-DUCK METROIDVANIA — ROOM MATRIX & WORLD GRAPH DATABASE',
    '# Auto-generated from Cyber-Duck Dev Hub',
    '# Godot Engine 4.3+ (GDScript RefCounted)',
    '# ============================================================================== #',
    'class_name WorldRoomDatabase',
    'extends RefCounted',
    '',
    '# Сектора игрового мира',
    'const SECTORS: Dictionary = {'
  ];

  sectors.forEach(s => {
    lines.push(`\t"${s.id}": {`);
    lines.push(`\t\t"name": "${s.name}",`);
    lines.push(`\t\t"code": "${s.code}",`);
    lines.push(`\t\t"color": "${s.color}",`);
    lines.push(`\t\t"danger_level": ${s.dangerLevel}`);
    lines.push('\t},');
  });

  lines.push('}');
  lines.push('');
  lines.push('# База комнат и узлов переходов');
  lines.push('const ROOMS: Dictionary = {');

  rooms.forEach(r => {
    lines.push(`\t"${r.id}": {`);
    lines.push(`\t\t"name": "${r.name}",`);
    lines.push(`\t\t"sector": "${r.sectorId}",`);
    lines.push(`\t\t"grid_pos": Vector2i(${r.gridX}, ${r.gridY}),`);
    lines.push(`\t\t"type": "${r.type}",`);
    lines.push(`\t\t"status": "${r.status}",`);
    lines.push(`\t\t"scene_path": "${r.godotScene}",`);

    // Connections
    lines.push('\t\t"connections": [');
    r.connections.forEach(c => {
      const lockData = c.lock
        ? `, "lock": {"id": "${c.lock.id}", "req_ability": "${c.lock.requiredAbilityId}", "label": "${c.lock.label}"}`
        : '';
      lines.push(`\t\t\t{"target": "${c.targetRoomId}", "direction": "${c.direction}"${lockData}},`);
    });
    lines.push('\t\t],');

    // Loot
    lines.push('\t\t"loot": [');
    r.loot.forEach(l => {
      const ab = l.abilityId ? `, "ability_id": "${l.abilityId}"` : '';
      lines.push(`\t\t\t{"id": "${l.id}", "type": "${l.type}", "name": "${l.name}"${ab}},`);
    });
    lines.push('\t\t]');

    lines.push('\t},');
  });

  lines.push('}');
  lines.push('');
  lines.push('# Вспомогательный метод получения пути к сцене комнаты');
  lines.push('static func get_room_scene_path(room_id: String) -> String:');
  lines.push('\tif ROOMS.has(room_id):');
  lines.push('\t\treturn ROOMS[room_id].get("scene_path", "")');
  lines.push('\treturn ""');
  lines.push('');
  lines.push('# Вспомогательный метод проверки перехода');
  lines.push('static func can_traverse_passage(from_room: String, target_room: String, unlocked_abilities: Array[String]) -> bool:');
  lines.push('\tif not ROOMS.has(from_room): return false');
  lines.push('\tvar conns = ROOMS[from_room].get("connections", [])');
  lines.push('\tfor c in conns:');
  lines.push('\t\tif c.get("target") == target_room:');
  lines.push('\t\t\tif not c.has("lock"):');
  lines.push('\t\t\t\treturn true');
  lines.push('\t\t\tvar req = c["lock"].get("req_ability", "")');
  lines.push('\t\t\treturn unlocked_abilities.has(req)');
  lines.push('\treturn false');

  return lines.join('\n');
}

export function exportToJson(rooms: RoomNode[], sectors: SectorInfo[]): string {
  const payload = {
    project: 'Cyber-Duck Metroidvania',
    version: '1.0.0',
    engine: 'Godot 4.3+',
    timestamp: new Date().toISOString(),
    sectors,
    rooms
  };
  return JSON.stringify(payload, null, 2);
}
