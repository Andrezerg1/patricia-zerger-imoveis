<?php
declare(strict_types=1);
require dirname(__DIR__, 2) . '/private/bootstrap.php';
require_admin();
?>
<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow">
  <meta name="csrf-token" content="<?= h($_SESSION['csrf']) ?>"><base href="../">
  <title>Painel administrativo — Patricia Zerger Imóveis</title>
  <link rel="icon" href="assets/logo.svg" type="image/svg+xml"><link rel="stylesheet" href="styles.css"><link rel="stylesheet" href="admin/admin.css">
  <script src="common.js" defer></script><script src="admin/admin.js" defer></script>
</head>
<body class="admin-page">
  <div class="admin-topbar"><div class="container">ÁREA ADMINISTRATIVA <span>Acesso restrito</span></div></div>
  <header class="header"><div class="container nav-wrap">
    <a class="brand" href="./" aria-label="Patricia Zerger, corretora de imóveis — CRECI 35610 — voltar ao site"><svg class="brand-logo" viewBox="100 100 1420 340" width="1420" height="340" aria-hidden="true"><image href="assets/patricia-zerger-logo-verde.png" width="1600" height="532"/></svg></a>
    <div class="admin-account"><a href="./" class="view-site">Ver site ↗</a><span class="account-name">Administrador</span><form method="post" action="admin/logout.php"><input type="hidden" name="csrf" value="<?= h($_SESSION['csrf']) ?>"><button class="button outline small" type="submit">Sair</button></form></div>
  </div></header>
  <main class="container admin-main">
    <div class="admin-welcome"><div><p class="eyebrow">TUDO PRONTO PARA O PRÓXIMO CAPÍTULO</p><h1>Painel administrativo</h1><p>Organize seus imóveis e mantenha o catálogo atualizado.</p></div><button class="button" id="new-property" disabled>+ Novo imóvel</button></div>
    <div class="admin-stats" aria-label="Resumo do catálogo"><div><span>Total de imóveis</span><strong id="total-count">—</strong></div><div><span>Publicados no site</span><strong id="published-count">—</strong></div><div><span>Rascunhos</span><strong id="draft-count">—</strong></div></div>
    <section class="admin-catalog" aria-labelledby="admin-count"><div class="admin-heading"><h2 id="admin-count">Carregando imóveis…</h2><span>Seu catálogo</span></div><div id="admin-list"></div>
    <?php require dirname(__DIR__, 2) . '/private/property-form.php'; ?>
    </section>
    <section class="admin-catalog contact-settings" aria-labelledby="settings-title">
      <div class="admin-heading"><h2 id="settings-title">Contato do site</h2><span>WhatsApp</span></div>
      <form id="settings-form"><label for="whatsapp-number">Número do WhatsApp<input id="whatsapp-number" name="whatsapp" type="tel" inputmode="tel" autocomplete="tel" required maxlength="40" aria-describedby="whatsapp-help"></label><p id="whatsapp-help">Inclua o código do país e o DDD. Para o Brasil, comece com +55. O número será usado nos contatos do site.</p><button class="button" type="submit" disabled>Salvar contato</button><p id="settings-status" role="status" aria-live="polite" hidden></p></form>
    </section>
    <p class="admin-footnote">Imóveis publicados aparecem no site. Rascunhos ficam disponíveis apenas neste painel.</p>
  </main>
  <dialog id="confirm-dialog" class="confirm-dialog"><h3>Excluir este imóvel?</h3><p>Ele será removido do catálogo. Esta ação não pode ser desfeita.</p><div class="form-actions"><button id="confirm-delete" class="button danger">Excluir imóvel</button><button class="button outline" data-close>Cancelar</button></div></dialog>
  <div id="toast" class="toast" role="status" aria-live="polite" hidden></div>
</body></html>
