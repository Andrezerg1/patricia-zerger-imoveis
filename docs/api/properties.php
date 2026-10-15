<?php
declare(strict_types=1);
define('PUBLIC_ROOT', dirname(__DIR__));
require dirname(__DIR__, 2) . '/private/bootstrap.php';
require dirname(__DIR__, 2) . '/private/properties.php';
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');

function respond(int $status, array $data): never {
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

try {
    $method = $_SERVER['REQUEST_METHOD'];
    if (!in_array($method, ['GET','POST','DELETE'], true)) {
        header('Allow: GET, POST, DELETE'); respond(405, ['error'=>'Método não permitido.']);
    }
    $admin = isset($_GET['admin']);
    if (($admin || $method !== 'GET') && !authenticated()) respond(401, ['error'=>'Entre na sua conta para continuar.']);
    if ($method === 'GET') {
        $rows = catalog();
        respond(200, array_values($admin ? $rows : array_filter($rows, fn($row) => $row['status'] === 'published')));
    }
    if (!csrf_valid($_SERVER['HTTP_X_CSRF_TOKEN'] ?? '')) respond(403, ['error'=>'Sessão inválida. Atualize a página.']);
    if (!str_starts_with($_SERVER['CONTENT_TYPE'] ?? '', 'application/json')) respond(415, ['error'=>'Formato inválido.']);
    if ((int)($_SERVER['CONTENT_LENGTH'] ?? 0) > MAX_REQUEST_BYTES) respond(413, ['error'=>'As fotos ultrapassaram o limite de envio.']);
    $raw = file_get_contents('php://input', false, null, 0, MAX_REQUEST_BYTES + 1);
    if (strlen($raw) > MAX_REQUEST_BYTES) respond(413, ['error'=>'As fotos ultrapassaram o limite de envio.']);
    $input = json_decode($raw, true, 64, JSON_THROW_ON_ERROR);
    if (!is_array($input) || array_is_list($input)) throw new InvalidArgumentException('Dados inválidos.');
    catalog(function ($rows) use ($method, $input) {
        if ($method === 'POST') {
            $entry = validate_property($input, $rows);
            $rows = array_filter($rows, fn($row) => $row['id'] !== $entry['id']);
            $rows[] = $entry;
        } else {
            $id = $input['id'] ?? null;
            if (!is_string($id) || !in_array($id, array_column($rows, 'id'), true)) throw new InvalidArgumentException('Imóvel não encontrado.');
            $rows = array_filter($rows, fn($row) => $row['id'] !== $id);
        }
        return $rows;
    });
    // Use the same catalog lock so a concurrent upload cannot be collected.
    locked_file('catalog', function ($file) { remove_unused_photos(read_json($file)); });
    respond(200, ['ok'=>true]);
} catch (InvalidArgumentException | JsonException $error) {
    respond(422, ['error'=>$error instanceof JsonException ? 'Dados inválidos.' : $error->getMessage()]);
} catch (Throwable $error) {
    error_log((string)$error);
    respond(500, ['error'=>'Não foi possível acessar o catálogo. Tente novamente.']);
}
