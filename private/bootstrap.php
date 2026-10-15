<?php
declare(strict_types=1);

const SESSION_TTL = 3600;
const MAX_REQUEST_BYTES = 16 * 1024 * 1024;

function data_dir(): string {
    $dir = getenv('PZ_DATA_DIR') ?: __DIR__ . '/data';
    if (!is_dir($dir) && !mkdir($dir, 0700, true) && !is_dir($dir)) {
        throw new RuntimeException('Armazenamento indisponível.');
    }
    return $dir;
}

function start_session(): void {
    if (session_status() === PHP_SESSION_ACTIVE) return;
    ini_set('session.use_strict_mode', '1');
    ini_set('session.use_only_cookies', '1');
    ini_set('session.gc_maxlifetime', (string) SESSION_TTL);
    session_name('PZADMIN');
    $base = str_replace('\\', '/', dirname(dirname($_SERVER['SCRIPT_NAME'])));
    session_set_cookie_params([
        'lifetime' => 0, 'path' => rtrim($base, '/') . '/',
        'secure' => !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off',
        'httponly' => true, 'samesite' => 'Strict',
    ]);
    session_start();
    header('Cache-Control: no-store, private');
    header('X-Content-Type-Options: nosniff');
    header('X-Frame-Options: DENY');
    header('Referrer-Policy: same-origin');
    $_SESSION['csrf'] ??= bin2hex(random_bytes(32));
}

function authenticated(): bool {
    start_session();
    if (empty($_SESSION['admin']) || time() - ($_SESSION['last_active'] ?? 0) > SESSION_TTL) {
        unset($_SESSION['admin'], $_SESSION['last_active']);
        return false;
    }
    $_SESSION['last_active'] = time();
    return true;
}

function csrf_valid(string $token): bool {
    start_session();
    return $token !== '' && hash_equals($_SESSION['csrf'], $token);
}

function h(string $value): string {
    return htmlspecialchars($value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

function require_admin(): void {
    if (!authenticated()) { header('Location: login.php'); exit; }
}

function config(): array {
    $path = __DIR__ . '/config.php';
    if (!is_file($path)) throw new RuntimeException('Configure a conta administrativa no servidor.');
    $config = require $path;
    if (empty($config['password_hash']) || empty($config['username'])) {
        throw new RuntimeException('Configure a conta administrativa no servidor.');
    }
    return $config;
}

// A persistent lock serializes catalog updates and login attempts across sessions.
function locked_file(string $name, callable $operation): mixed {
    $lock = fopen(data_dir() . '/' . $name . '.lock', 'c');
    if (!$lock || !flock($lock, LOCK_EX)) throw new RuntimeException('Armazenamento indisponível.');
    try { return $operation(data_dir() . '/' . $name . '.json'); }
    finally { flock($lock, LOCK_UN); fclose($lock); }
}

function read_json(string $file): array {
    $raw = file_get_contents($file);
    if ($raw === false) throw new RuntimeException('Falha ao ler os dados.');
    return json_decode($raw, true, 64, JSON_THROW_ON_ERROR);
}

function write_json(string $file, array $value): void {
    $tmp = $file . '.' . bin2hex(random_bytes(6)) . '.tmp';
    try {
        if (file_put_contents($tmp, json_encode($value, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR), LOCK_EX) === false) {
            throw new RuntimeException('Não foi possível salvar os dados.');
        }
        chmod($tmp, 0600);
        if (!rename($tmp, $file)) throw new RuntimeException('Não foi possível salvar os dados.');
    } finally { if (is_file($tmp)) unlink($tmp); }
}

function catalog(?callable $update = null): array {
    return locked_file('catalog', function ($file) use ($update) {
        $rows = read_json(is_file($file) ? $file : __DIR__ . '/seed.json');
        if ($update) { $rows = array_values($update($rows)); write_json($file, $rows); }
        return $rows;
    });
}

function attempt_login(string $username, string $password): string {
    $config = config();
    return locked_file('login-attempts', function ($file) use ($username, $password, $config) {
        $attempts = is_file($file) ? read_json($file) : [];
        $now = time();
        $attempts = array_filter($attempts, fn($entry) => $entry['started'] > $now - 900);
        $key = hash('sha256', $_SERVER['REMOTE_ADDR'] ?? 'local');
        $entry = $attempts[$key] ?? ['started' => $now, 'count' => 0];
        if ($entry['count'] >= 5) return 'Muitas tentativas. Aguarde 15 minutos e tente novamente.';
        $validPassword = password_verify($password, $config['password_hash']);
        if (hash_equals($config['username'], $username) && $validPassword) {
            unset($attempts[$key]); write_json($file, $attempts);
            session_regenerate_id(true);
            $_SESSION = ['admin' => true, 'last_active' => $now, 'csrf' => bin2hex(random_bytes(32))];
            return '';
        }
        $entry['count']++; $attempts[$key] = $entry; write_json($file, $attempts);
        return 'Usuário ou senha incorretos. Tente novamente.';
    });
}
