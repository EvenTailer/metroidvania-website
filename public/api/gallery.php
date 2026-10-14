<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

$configPath = __DIR__ . '/config.php';
if (!is_file($configPath)) {
    http_response_code(500);
    echo json_encode(['error' => 'Missing api/config.php — copy from config.example.php']);
    exit;
}

$config = require $configPath;
$uploadDir = $config['upload_dir'];
$dataFile = $config['data_file'];
$maxBytes = (int) ($config['max_bytes'] ?? 5242880);
$token = (string) ($config['upload_token'] ?? '');

if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}
$dataDir = dirname($dataFile);
if (!is_dir($dataDir)) {
    mkdir($dataDir, 0755, true);
}

function load_items(string $path): array
{
    if (!is_file($path)) {
        return [];
    }
    $raw = file_get_contents($path);
    if ($raw === false || $raw === '') {
        return [];
    }
    $data = json_decode($raw, true);
    return is_array($data['items'] ?? null) ? $data['items'] : [];
}

function save_items(string $path, array $items): void
{
    file_put_contents($path, json_encode(['items' => $items], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
}

function check_token(string $expected): void
{
    $given = $_SERVER['HTTP_X_HUB_TOKEN'] ?? '';
    if ($expected === '' || $given !== $expected) {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized']);
        exit;
    }
}

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'GET') {
    echo json_encode(['items' => load_items($dataFile)], JSON_UNESCAPED_UNICODE);
    exit;
}

if ($method === 'POST') {
    check_token($token);

    if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
        http_response_code(400);
        echo json_encode(['error' => 'No file uploaded']);
        exit;
    }

    $file = $_FILES['file'];
    if ($file['size'] > $maxBytes) {
        http_response_code(413);
        echo json_encode(['error' => 'File too large']);
        exit;
    }

    $finfo = new finfo(FILEINFO_MIME_TYPE);
    $mime = $finfo->file($file['tmp_name']) ?: '';
    $imageTypes = [
        'image/jpeg' => 'jpg',
        'image/png' => 'png',
        'image/gif' => 'gif',
        'image/webp' => 'webp',
    ];
    $docExt = ['pdf', 'txt', 'md', 'json', 'zip', 'csv', 'doc', 'docx', 'xls', 'xlsx', 'gd', 'tscn', 'tres'];
    $blocked = ['php', 'phtml', 'phar', 'html', 'htm', 'js', 'exe', 'sh', 'bat', 'cmd', 'svg'];
    $clientExt = strtolower(pathinfo((string) ($file['name'] ?? ''), PATHINFO_EXTENSION));
    $isImage = isset($imageTypes[$mime]);
    if ($isImage) {
        $ext = $imageTypes[$mime];
    } elseif (
        $clientExt !== ''
        && preg_match('/^[a-z0-9]{1,8}$/', $clientExt)
        && !in_array($clientExt, $blocked, true)
        && in_array($clientExt, $docExt, true)
    ) {
        $ext = $clientExt;
    } else {
        http_response_code(415);
        echo json_encode(['error' => 'Unsupported file type']);
        exit;
    }
    $id = 'g-' . (string) (int) (microtime(true) * 1000) . '-' . bin2hex(random_bytes(3));
    $filename = $id . '.' . $ext;
    $dest = $uploadDir . '/' . $filename;

    if (!move_uploaded_file($file['tmp_name'], $dest)) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to save file']);
        exit;
    }

    $title = trim((string) ($_POST['title'] ?? ''));
    if ($title === '') {
        $orig = (string) ($file['name'] ?? 'image');
        $title = preg_replace('/\.[^.]+$/', '', $orig) ?: 'Новый арт';
    }

    $url = '/uploads/gallery/' . $filename;
    $item = ['id' => $id, 'title' => $title, 'url' => $url];

    if ($isImage) {
        $items = load_items($dataFile);
        array_unshift($items, $item);
        save_items($dataFile, $items);
    }

    echo json_encode(['item' => $item], JSON_UNESCAPED_UNICODE);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Method not allowed']);
