<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

$dataFile = __DIR__ . '/../data/board.json';
$dataDir = dirname($dataFile);
if (!is_dir($dataDir)) {
    mkdir($dataDir, 0755, true);
}

function load_board(string $path): array
{
    if (!is_file($path)) {
        return [
            'initialized' => false,
            'tasks' => [],
            'sprintStepId' => null,
            'stepsDone' => new stdClass(),
        ];
    }
    $raw = file_get_contents($path);
    if ($raw === false || $raw === '') {
        return [
            'initialized' => false,
            'tasks' => [],
            'sprintStepId' => null,
            'stepsDone' => new stdClass(),
        ];
    }
    $data = json_decode($raw, true);
    if (!is_array($data)) {
        return [
            'initialized' => false,
            'tasks' => [],
            'sprintStepId' => null,
            'stepsDone' => new stdClass(),
        ];
    }
    $done = $data['stepsDone'] ?? null;
    return [
        'initialized' => true,
        'tasks' => is_array($data['tasks'] ?? null) ? $data['tasks'] : [],
        'sprintStepId' => is_string($data['sprintStepId'] ?? null) ? $data['sprintStepId'] : null,
        'stepsDone' => is_array($done) ? $done : new stdClass(),
    ];
}

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'GET') {
    echo json_encode(load_board($dataFile), JSON_UNESCAPED_UNICODE);
    exit;
}

if ($method === 'POST') {
    $raw = file_get_contents('php://input');
    $body = json_decode($raw ?: '', true);
    if (!is_array($body) || !is_array($body['tasks'] ?? null)) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid JSON']);
        exit;
    }
    $done = $body['stepsDone'] ?? null;
    $payload = [
        'tasks' => $body['tasks'],
        'sprintStepId' => is_string($body['sprintStepId'] ?? null) ? $body['sprintStepId'] : null,
        'stepsDone' => is_array($done) ? $done : new stdClass(),
    ];
    file_put_contents(
        $dataFile,
        json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT)
    );
    echo json_encode(['ok' => true], JSON_UNESCAPED_UNICODE);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Method not allowed']);
