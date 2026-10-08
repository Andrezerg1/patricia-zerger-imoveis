<?php
declare(strict_types=1);
require dirname(__DIR__, 2) . '/private/bootstrap.php';
start_session();
if ($_SERVER['REQUEST_METHOD'] !== 'POST' || !csrf_valid(is_string($_POST['csrf'] ?? null) ? $_POST['csrf'] : '')) {
    http_response_code(403); exit('Solicitação inválida.');
}
$_SESSION = [];
$params = session_get_cookie_params();
setcookie(session_name(), '', ['expires'=>time()-3600, 'path'=>$params['path'], 'secure'=>$params['secure'], 'httponly'=>true, 'samesite'=>'Strict']);
session_destroy();
header('Location: login.php?loggedout=1', true, 303);
