<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

$dataFile = __DIR__ . '/../data/bestiary.json';
$dataDir = dirname($dataFile);
if (!is_dir($dataDir)) {
    mkdir($dataDir, 0755, true);
}

function load_bestiary(string $path): array
{
    if (!is_file($path)) {
        return ['initialized' => false, 'items' => []];
    }
    $raw = file_get_contents($path);
    if ($raw === false || $raw === '') {
        return ['initialized' => false, 'items' => []];
    }
    $data = json_decode($raw, true);
    if (!is_array($data)) {
        return ['initialized' => false, 'items' => []];
    }
    return [
        'initialized' => true,
        'items' => is_array($data['items'] ?? null) ? $data['items'] : [],
    ];
}

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'GET') {
    echo json_encode(load_bestiary($dataFile), JSON_UNESCAPED_UNICODE);
    exit;
}

if ($method === 'POST') {
    $raw = file_get_contents('php://input');
    $body = json_decode($raw ?: '', true);
    if (!is_array($body) || !is_array($body['items'] ?? null)) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid JSON']);
        exit;
    }
    $payload = [
        'items' => $body['items'],
        'savedAt' => date('c'),
    ];
    file_put_contents($dataFile, json_encode($payload, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
    echo json_encode(['ok' => true, 'savedAt' => $payload['savedAt']]);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Method not allowed']);
