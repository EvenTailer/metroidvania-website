<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

$dataFile = __DIR__ . '/../data/chat.json';
$dataDir = dirname($dataFile);
if (!is_dir($dataDir)) {
    mkdir($dataDir, 0755, true);
}

function load_chat_messages(string $path): array
{
    if (!is_file($path)) {
        return [];
    }
    $raw = file_get_contents($path);
    if ($raw === false || $raw === '') {
        return [];
    }
    $data = json_decode($raw, true);
    return is_array($data['messages'] ?? null) ? $data['messages'] : [];
}

function save_chat_messages(string $path, array $messages): void
{
    file_put_contents($path, json_encode(['messages' => $messages], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
}

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'GET') {
    $msgs = load_chat_messages($dataFile);
    echo json_encode(['messages' => $msgs], JSON_UNESCAPED_UNICODE);
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

    $action = $body['action'] ?? 'send';
    $current = load_chat_messages($dataFile);

    if ($action === 'send') {
        $msg = $body['message'] ?? null;
        if (!is_array($msg) || empty($msg['id'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing message object']);
            exit;
        }

        // prepend new message
        array_unshift($current, $msg);
        // keep up to 200 messages
        if (count($current) > 200) {
            $current = array_slice($current, 0, 200);
        }
        save_chat_messages($dataFile, $current);
        echo json_encode(['ok' => true, 'message' => $msg, 'total' => count($current)], JSON_UNESCAPED_UNICODE);
        exit;
    }

    if ($action === 'delete') {
        $id = (string) ($body['id'] ?? '');
        $current = array_values(array_filter($current, static function ($m) use ($id) {
            return is_array($m) && ($m['id'] ?? '') !== $id;
        }));
        save_chat_messages($dataFile, $current);
        echo json_encode(['ok' => true, 'deletedId' => $id, 'total' => count($current)], JSON_UNESCAPED_UNICODE);
        exit;
    }

    if ($action === 'sync') {
        $list = $body['messages'] ?? [];
        if (is_array($list)) {
            save_chat_messages($dataFile, array_slice($list, 0, 200));
            echo json_encode(['ok' => true, 'total' => count($list)], JSON_UNESCAPED_UNICODE);
            exit;
        }
    }

    http_response_code(400);
    echo json_encode(['error' => 'Unknown action']);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Method not allowed']);
