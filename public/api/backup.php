<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

$dataDir = __DIR__ . '/../data';
if (!is_dir($dataDir)) {
    mkdir($dataDir, 0755, true);
}

$files = [
    'board' => $dataDir . '/board.json',
    'matrix' => $dataDir . '/matrix.json',
    'bestiary' => $dataDir . '/bestiary.json',
    'playtest' => $dataDir . '/playtest.json',
    'weeklyPlan' => $dataDir . '/weekly-plan.json',
    'engine' => $dataDir . '/engine.json',
    'assets' => $dataDir . '/assets.json',
    'gallery' => $dataDir . '/gallery.json',
    'chat' => $dataDir . '/chat.json',
    'narrative' => $dataDir . '/narrative.json',
];

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'GET') {
    $bundle = [
        'version' => '1.0',
        'exportedAt' => date('c'),
        'project' => 'cyber-duck-metroidvania-hub',
        'data' => [],
    ];
    foreach ($files as $key => $filePath) {
        if (is_file($filePath)) {
            $raw = file_get_contents($filePath);
            $parsed = json_decode($raw ?: '', true);
            $bundle['data'][$key] = $parsed;
        } else {
            $bundle['data'][$key] = null;
        }
    }
    echo json_encode($bundle, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    exit;
}

if ($method === 'POST') {
    $raw = file_get_contents('php://input');
    $body = json_decode($raw ?: '', true);
    if (!is_array($body) || !is_array($body['data'] ?? null)) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid backup payload']);
        exit;
    }
    $restored = [];
    foreach ($files as $key => $filePath) {
        if (isset($body['data'][$key]) && $body['data'][$key] !== null) {
            file_put_contents(
                $filePath,
                json_encode($body['data'][$key], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE)
            );
            $restored[] = $key;
        }
    }
    echo json_encode(['ok' => true, 'restored' => $restored, 'restoredAt' => date('c')]);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Method not allowed']);
