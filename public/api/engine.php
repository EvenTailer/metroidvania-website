<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

$dataFile = __DIR__ . '/../data/engine.json';
$dataDir = dirname($dataFile);
if (!is_dir($dataDir)) {
    mkdir($dataDir, 0755, true);
}

function load_engine(string $path): array
{
    if (!is_file($path)) {
        return ['initialized' => false, 'builds' => [], 'releaseChecklist' => [], 'physicsParams' => null, 'states' => []];
    }
    $raw = file_get_contents($path);
    if ($raw === false || $raw === '') {
        return ['initialized' => false, 'builds' => [], 'releaseChecklist' => [], 'physicsParams' => null, 'states' => []];
    }
    $data = json_decode($raw, true);
    if (!is_array($data)) {
        return ['initialized' => false, 'builds' => [], 'releaseChecklist' => [], 'physicsParams' => null, 'states' => []];
    }
    return [
        'initialized' => true,
        'builds' => is_array($data['builds'] ?? null) ? $data['builds'] : [],
        'releaseChecklist' => is_array($data['releaseChecklist'] ?? null) ? $data['releaseChecklist'] : [],
        'physicsParams' => $data['physicsParams'] ?? null,
        'states' => is_array($data['states'] ?? null) ? $data['states'] : [],
    ];
}

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'GET') {
    echo json_encode(load_engine($dataFile), JSON_UNESCAPED_UNICODE);
    exit;
}

if ($method === 'POST') {
    $raw = file_get_contents('php://input');
    $body = json_decode($raw ?: '', true);
    if (!is_array($body)) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid JSON']);
        exit;
    }
    $payload = [
        'builds' => is_array($body['builds'] ?? null) ? $body['builds'] : [],
        'releaseChecklist' => is_array($body['releaseChecklist'] ?? null) ? $body['releaseChecklist'] : [],
        'physicsParams' => $body['physicsParams'] ?? null,
        'states' => is_array($body['states'] ?? null) ? $body['states'] : [],
        'savedAt' => date('c'),
    ];
    file_put_contents($dataFile, json_encode($payload, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
    echo json_encode(['ok' => true, 'savedAt' => $payload['savedAt']]);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Method not allowed']);
