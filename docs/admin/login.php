<?php
declare(strict_types=1);
require dirname(__DIR__, 2) . '/private/bootstrap.php';
start_session();
if (authenticated()) { header('Location: index.php'); exit; }
$error = '';
$username = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = is_string($_POST['username'] ?? null) ? trim($_POST['username']) : '';
    $password = is_string($_POST['password'] ?? null) ? $_POST['password'] : '';
    $token = is_string($_POST['csrf'] ?? null) ? $_POST['csrf'] : '';
    if (!csrf_valid($token)) $error = 'Sua sessão expirou. Tente novamente.';
    elseif (strlen($username) > 100 || strlen($password) > 200) $error = 'Usuário ou senha incorretos. Tente novamente.';
    else {
        try { $error = attempt_login($username, $password); }
        catch (Throwable $exception) { error_log((string)$exception); $error = 'Login indisponível no momento. Verifique a configuração da hospedagem.'; }
    }
    if ($error === '') { header('Location: index.php', true, 303); exit; }
}
?>
<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="robots" content="noindex,nofollow"><meta name="theme-color" content="#244d3d">
  <base href="../"><title>Acesso administrativo — Patricia Zerger Imóveis</title>
  <link rel="icon" href="assets/logo.svg" type="image/svg+xml"><link rel="stylesheet" href="styles.css"><link rel="stylesheet" href="admin/admin.css">
</head>
<body class="login-page">
  <main class="login-layout">
    <section class="login-story" aria-label="Patricia Zerger Imóveis">
      <img class="login-photo" src="assets/hero.jpg" alt="Casa contemporânea com piscina">
      <div class="login-shade"></div>
      <a class="brand login-brand" href="./" aria-label="Patricia Zerger, corretora de imóveis — CRECI 35610 — voltar ao site"><svg class="brand-logo" viewBox="100 100 1420 340" width="1420" height="340" aria-hidden="true"><image href="assets/patricia-zerger-logo-verde.png" width="1600" height="532"/></svg></a>
      <div class="login-story-copy"><p class="eyebrow light">CUIDE DE CADA NOVA HISTÓRIA.</p><h1>Seu catálogo.<br>Novas possibilidades.</h1><p>Um espaço para organizar seus imóveis<br>e preparar os próximos encontros.</p></div>
      <span class="login-story-footer">Patricia Zerger Imóveis · Área restrita</span>
    </section>
    <section class="login-panel">
      <a class="back-link" href="./">← Voltar ao site</a>
      <div class="login-card">
        <span class="login-symbol" aria-hidden="true"><svg viewBox="0 0 24 24"><rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3"/></svg></span>
        <p class="eyebrow">ACESSO EXCLUSIVO</p>
        <h2>Área administrativa</h2>
        <p class="login-intro">Entre com sua conta para gerenciar os imóveis.</p>
        <?php if ($error): ?><p class="login-message error" role="alert"><?= h($error) ?></p><?php endif; ?>
        <?php if (!$error && isset($_GET['expired'])): ?><p class="login-message" role="status">Sua sessão expirou. Entre novamente para continuar.</p><?php endif; ?>
        <?php if (!$error && isset($_GET['loggedout'])): ?><p class="login-message" role="status">Você saiu da sua conta com segurança.</p><?php endif; ?>
        <form class="login-form" method="post" action="admin/login.php">
          <input type="hidden" name="csrf" value="<?= h($_SESSION['csrf']) ?>">
          <label for="username">Usuário<input id="username" name="username" autocomplete="username" placeholder="Seu usuário" value="<?= h($username) ?>" required maxlength="100" autocapitalize="none" spellcheck="false"></label>
          <label for="password">Senha<input id="password" name="password" type="password" autocomplete="current-password" placeholder="Sua senha" required maxlength="200"></label>
          <button class="button" type="submit">Entrar no painel <span aria-hidden="true">→</span></button>
        </form>
        <p class="login-help">Acesso reservado à administração do site.</p>
      </div>
      <p class="login-copyright">© 2026 Patricia Zerger Imóveis</p>
    </section>
  </main>
</body></html>
