<?php
declare(strict_types=1);
require dirname(__DIR__, 2) . '/private/bootstrap.php';
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
    if (!in_array($method, ['GET', 'POST'], true)) {
        header('Allow: GET, POST');
        respond(405, ['error'=>'Método não permitido.']);
    }
    if (($method === 'POST' || isset($_GET['admin'])) && !authenticated()) {
        respond(401, ['error'=>'Entre na sua conta para continuar.']);
    }
    $whatsapp = null;
    if ($method === 'POST') {
        if (!csrf_valid($_SERVER['HTTP_X_CSRF_TOKEN'] ?? '')) respond(403, ['error'=>'Sessão inválida. Atualize a página.']);
        if (!str_starts_with($_SERVER['CONTENT_TYPE'] ?? '', 'application/json')) respond(415, ['error'=>'Formato inválido.']);
        $raw = file_get_contents('php://input', false, null, 0, 2049);
        if (strlen($raw) > 2048) respond(413, ['error'=>'Os dados ultrapassaram o limite de envio.']);
        $input = json_decode($raw, true, 16, JSON_THROW_ON_ERROR);
        if (!is_array($input) || !is_string($input['whatsapp'] ?? null)) throw new InvalidArgumentException('Informe o número do WhatsApp.');
        $value = trim($input['whatsapp']);
        if (strlen($value) > 40 || !preg_match('/^\+?[0-9 ().-]+$/D', $value)) throw new InvalidArgumentException('Use somente o número com código do país e DDD.');
        $whatsapp = preg_replace('/[^0-9]/', '', $value);
        if (!preg_match('/^[1-9][0-9]{9,14}$/D', $whatsapp)) throw new InvalidArgumentException('Informe um número com código do país e DDD, como 55 para o Brasil.');
    }
    $settings = locked_file('settings', function ($file) use ($whatsapp) {
        $saved = read_json(is_file($file) ? $file : dirname(__DIR__, 2) . '/private/settings-defaults.json');
        if ($whatsapp !== null) {
            $saved['whatsapp'] = $whatsapp;
            write_json($file, $saved);
        }
        // Only the public business contact is exposed, never private configuration.
        return ['whatsapp' => (string)($saved['whatsapp'] ?? '')];
    });
    respond(200, $settings);
} catch (InvalidArgumentException | JsonException $error) {
    respond(422, ['error'=>$error instanceof JsonException ? 'Dados inválidos.' : $error->getMessage()]);
} catch (Throwable $error) {
    error_log((string)$error);
    respond(500, ['error'=>'Não foi possível acessar o contato. Tente novamente.']);
}
