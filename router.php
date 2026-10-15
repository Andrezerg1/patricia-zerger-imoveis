<?php
// Development router. Production is served by Apache/PHP using docs/ as web root.
declare(strict_types=1);
$path = rawurldecode(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH) ?: '/');
if (str_contains($path, '\\') || preg_match('#(^|/)\.#', $path)) {
    http_response_code(404); exit('Not found');
}
if ($path === '/') $path = '/index.html';
if ($path === '/admin') { header('Location: /admin/'); exit; }
if ($path === '/admin/') {
    $_SERVER['SCRIPT_NAME'] = '/admin/index.php';
    require __DIR__ . '/docs/admin/index.php';
    return true;
}
if (str_contains($path, '.php/') || !is_file(__DIR__ . '/docs' . $path)) {
    http_response_code(404); exit('Not found');
}
return false;
