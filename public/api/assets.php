<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

$dataFile = __DIR__ . '/../data/assets.json';
$rootFile = __DIR__ . '/../data/godot-project.path';
$dataDir = dirname($dataFile);
if (!is_dir($dataDir)) {
    mkdir($dataDir, 0755, true);
}

function godot_root(string $rootFile): ?string
{
    if (!is_file($rootFile)) {
        return null;
    }
    $value = trim((string) file_get_contents($rootFile));
    return $value !== '' ? $value : null;
}

function probe_res_path(?string $root, string $resPath): array
{
    if ($root === null) {
        return ['configured' => false, 'exists' => null];
    }
    if (strpos($resPath, 'res://') !== 0) {
        return ['configured' => true, 'exists' => false];
    }
    $relative = str_replace(['/', '\\'], DIRECTORY_SEPARATOR, substr($resPath, 6));
    $full = realpath($root);
    $base = $full !== false ? $full : $root;
    $target = $base . DIRECTORY_SEPARATOR . $relative;
    $parent = realpath(dirname($target));
    if ($parent !== false && strpos($parent, $base) !== 0) {
        return ['configured' => true, 'exists' => false];
    }
    return ['configured' => true, 'exists' => is_file($target)];
}

function load_assets(string $path): array
{
    if (!is_file($path)) {
        return ['initialized' => false, 'savedAt' => null, 'items' => []];
    }
    $raw = file_get_contents($path);
    $data = json_decode($raw === false ? '' : $raw, true);
    if (!is_array($data)) {
        return ['initialized' => true, 'savedAt' => null, 'items' => []];
    }
    return [
        'initialized' => true,
        'savedAt' => is_string($data['savedAt'] ?? null) ? $data['savedAt'] : null,
        'items' => is_array($data['items'] ?? null) ? $data['items'] : [],
    ];
}

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'GET' && isset($_GET['probe'])) {
    $probe = is_string($_GET['probe']) ? $_GET['probe'] : '';
    echo json_encode(probe_res_path(godot_root($rootFile), $probe), JSON_UNESCAPED_UNICODE);
    exit;
}

if ($method === 'GET') {
    echo json_encode(load_assets($dataFile), JSON_UNESCAPED_UNICODE);
    exit;
}

if ($method === 'POST') {
    $body = json_decode(file_get_contents('php://input') ?: '', true);
    if (!is_array($body) || !is_array($body['items'] ?? null)) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid JSON']);
        exit;
    }
    $savedAt = gmdate('c');
    file_put_contents(
        $dataFile,
        json_encode(['savedAt' => $savedAt, 'items' => $body['items']], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT)
    );
    echo json_encode(['ok' => true, 'savedAt' => $savedAt], JSON_UNESCAPED_UNICODE);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Method not allowed']);
