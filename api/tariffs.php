<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');

$dataFile = dirname(__DIR__) . DIRECTORY_SEPARATOR . 'data' . DIRECTORY_SEPARATOR . 'tariffs.json';

if (!is_file($dataFile)) {
    http_response_code(503);
    echo json_encode([
        'updated_at' => null,
        'cities' => new stdClass(),
        'error' => 'cache_missing',
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

$json = file_get_contents($dataFile);
$data = json_decode($json ?: '', true);

if (!is_array($data)) {
    http_response_code(500);
    echo json_encode([
        'updated_at' => null,
        'cities' => new stdClass(),
        'error' => 'cache_corrupted',
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
