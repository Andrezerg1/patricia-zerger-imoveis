// Run the same PHP application used on the hosting server.
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('.', import.meta.url));
const php = process.env.PHP_BINARY || 'php';
const child = spawn(php, ['-d', 'post_max_size=16M', '-d', 'display_errors=0', '-S', '127.0.0.1:4173', '-t', 'docs', 'router.php'], {cwd:root,stdio:'inherit'});
child.on('error', error => {
 console.error('Instale PHP 8.2+ ou defina PHP_BINARY com o caminho do php.exe.');
 console.error(error.message); process.exitCode = 1;
});
child.on('exit', code => {process.exitCode = code || 0;});
process.on('SIGINT', () => child.kill('SIGINT'));
process.on('SIGTERM', () => child.kill('SIGTERM'));
