<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

$dataFile = __DIR__ . '/../data/narrative.json';
$dataDir = dirname($dataFile);
if (!is_dir($dataDir)) {
    mkdir($dataDir, 0755, true);
}

function load_narrative(string $path): array
{
    if (!is_file($path)) {
        return [];
    }
    $raw = file_get_contents($path);
    if ($raw === false || $raw === '') {
        return [];
    }
    $data = json_decode($raw, true);
    return is_array($data['chapters'] ?? null) ? $data['chapters'] : [];
}

function save_narrative(string $path, array $chapters): void
{
    file_put_contents($path, json_encode(['chapters' => $chapters], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
}

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'GET') {
    echo json_encode(['chapters' => load_narrative($dataFile)], JSON_UNESCAPED_UNICODE);
    exit;
}

if ($method === 'POST') {
    $raw = file_get_contents('php://input');
    $body = json_decode($raw ?: '', true);

    if (!is_array($body) || !isset($body['chapters']) || !is_array($body['chapters'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid JSON payload. Expected { chapters: [...] }']);
        exit;
    }

    save_narrative($dataFile, $body['chapters']);
    echo json_encode(['ok' => true, 'total' => count($body['chapters'])], JSON_UNESCAPED_UNICODE);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Method not allowed']);
