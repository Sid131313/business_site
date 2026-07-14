<?php
declare(strict_types=1);

if (PHP_SAPI !== 'cli') {
    http_response_code(403);
    echo "CLI only\n";
    exit(1);
}

$root = dirname(__DIR__);
$dataDir = $root . DIRECTORY_SEPARATOR . 'data';
$logDir = $root . DIRECTORY_SEPARATOR . 'logs';
$cacheFile = $dataDir . DIRECTORY_SEPARATOR . 'tariffs.json';
$tmpFile = $cacheFile . '.tmp';
$logFile = $logDir . DIRECTORY_SEPARATOR . 'tariffs-update.log';

if (!is_dir($logDir)) {
    mkdir($logDir, 0775, true);
}

$cities = [
    'moskva' => [
        'name' => 'Москва',
        'url' => 'https://moskva.justconnect.ru',
    ],
    'sankt-peterburg' => [
        'name' => 'Санкт-Петербург',
        'url' => 'https://sankt-peterburg.justconnect.ru',
    ],
];

$result = [
    'updated_at' => (new DateTimeImmutable('now', new DateTimeZone('Europe/Moscow')))->format(DateTimeInterface::ATOM),
    'cities' => [],
];

foreach ($cities as $slug => $city) {
    $home = fetchTariffsForCity($city['url'] . '/tarifs/');
    $business = fetchTariffsForCity($city['url'] . '/s/office/');

    $result['cities'][$slug] = [
        'name' => $city['name'],
        'home' => [
            'internet_tv' => normalizeTariffs($home['internet_tv'] ?? []),
            'internet' => normalizeTariffs($home['internet'] ?? []),
        ],
        'business' => normalizeTariffs($business['business'] ?? []),
    ];
}

$encoded = json_encode($result, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);
if ($encoded === false) {
    logLine($logFile, 'Failed to encode JSON cache');
    exit(1);
}

if (file_put_contents($tmpFile, $encoded . PHP_EOL, LOCK_EX) === false) {
    logLine($logFile, 'Failed to write temporary cache file');
    exit(1);
}

if (!rename($tmpFile, $cacheFile)) {
    @unlink($tmpFile);
    logLine($logFile, 'Failed to rotate cache file');
    exit(1);
}

logLine($logFile, 'Updated tariffs cache at ' . $result['updated_at']);
exit(0);

function fetchTariffsForCity(string $url): array
{
    $ch = curl_init($url);
    if ($ch === false) {
        return [];
    }

    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_CONNECTTIMEOUT => 10,
        CURLOPT_TIMEOUT => 20,
        CURLOPT_USERAGENT => 'Mozilla/5.0 (compatible; InetSetiTariffsBot/1.0; +https://example.invalid)',
        CURLOPT_ENCODING => '',
        CURLOPT_HTTPHEADER => [
            'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language: ru-RU,ru;q=0.9,en;q=0.8',
        ],
    ]);

    $html = curl_exec($ch);
    $status = (int) curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
    $error = curl_error($ch);
    curl_close($ch);

    if ($html === false || $status >= 400) {
        return [];
    }

    return parseTariffsHtml((string) $html);
}

function parseTariffsHtml(string $html): array
{
    $dom = new DOMDocument();
    libxml_use_internal_errors(true);
    $dom->loadHTML($html);
    libxml_clear_errors();

    $xpath = new DOMXPath($dom);
    $cards = [];

    foreach ($xpath->query("//*[contains(@class, 'tariff')]") as $node) {
        $name = trim($xpath->evaluate("string(.//*[self::h1 or self::h2 or self::h3][1])", $node));
        if ($name === '') {
            continue;
        }

        $priceText = trim($xpath->evaluate("string(.//*[contains(@class, 'price')][1])", $node));
        $cards[] = [
            'name' => $name,
            'price' => extractNumber($priceText),
            'description' => trim($xpath->evaluate("string(.//p[1])", $node)),
            'options' => [],
        ];
    }

    return [
        'internet_tv' => $cards,
        'internet' => $cards,
        'business' => $cards,
    ];
}

function normalizeTariffs(array $items): array
{
    $result = [];
    foreach ($items as $item) {
        if (!is_array($item)) {
            continue;
        }
        if (!isset($item['name'], $item['price'])) {
            continue;
        }
        $result[] = $item;
    }
    return $result;
}

function extractNumber(string $text): ?int
{
    if (!preg_match('/(\d[\d\s]*)/', $text, $m)) {
        return null;
    }
    return (int) preg_replace('/\D+/', '', $m[1]);
}

function logLine(string $file, string $message): void
{
    $line = '[' . (new DateTimeImmutable('now', new DateTimeZone('Europe/Moscow')))->format('Y-m-d H:i:s') . '] ' . $message . PHP_EOL;
    file_put_contents($file, $line, FILE_APPEND | LOCK_EX);
}
