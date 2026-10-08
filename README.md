# Patricia Zerger Imóveis

Vitrine imobiliária responsiva em HTML, CSS e JavaScript, com administração protegida por PHP.

**Versão local:** http://127.0.0.1:4173/ · **Administração:** http://127.0.0.1:4173/admin/

A prévia anterior permanece no GitHub Pages a partir da branch `main`. A nova administração está na branch `codex/admin-hostgator`, exige PHP e aguarda instalação na HostGator. GitHub Pages não executa esta versão; não mescle esta branch na fonte de publicação atual antes de migrar a hospedagem.

## Funcionalidades

- Catálogo com seis imóveis ilustrativos.
- Filtros combinados por tipo, bairro, preço, rua/código e quartos.
- Ordenação por destaque, preço e área.
- Detalhes do imóvel com galeria e formulário de interesse pré-preenchido.
- Página administrativa separada, com login, sessão e botão para sair.
- Criação, edição, destaque, rascunho e exclusão de imóveis após o login.
- Upload de até oito fotos por imóvel, redimensionadas para até 1600 px.
- Armazenamento compartilhado no servidor: catálogo JSON e fotos em arquivos.
- Interface responsiva em verde, branco e cinza; sem cadastro de visitantes ou pagamentos.

## Limites do protótipo

Os imóveis, endereços, características e valores iniciais são fictícios. A administração usa uma conta única. As alterações publicadas passam a ser vistas por todos os visitantes; rascunhos são listados somente para o administrador. O formulário de contato ainda simula o envio.

O catálogo inicia com os seis imóveis do repositório. Dados antigos salvos em IndexedDB não são importados automaticamente e permanecem no navegador de origem.

## Desenvolvimento local

Com PHP 8.2+ instalado, configure `private/config.php` a partir do exemplo, usando o usuário e um hash gerado por `password_hash()` para a senha. O arquivo real de credenciais e os dados de execução ficam fora do Git. A cópia local deste trabalho já está configurada.

```sh
git clone https://github.com/Andrezerg1/patricia-zerger-imoveis.git
cd patricia-zerger-imoveis
git switch codex/admin-hostgator
php -d post_max_size=16M -d display_errors=0 -S 127.0.0.1:4173 -t docs router.php
```

Abra http://127.0.0.1:4173. Não há bibliotecas externas de backend nem etapa de build. Como alternativa, `node server.mjs` inicia o mesmo servidor PHP; defina `PHP_BINARY` se o executável não estiver no PATH.

## Publicação

Siga [HOSTGATOR.md](HOSTGATOR.md). Em produção, `docs/` (ou seu conteúdo em `public_html/`) é a raiz pública; `private/` fica fora dela. Use HTTPS e PHP 8.2+. O código pode ser versionado no GitHub, mas o envio ao GitHub não instala o sistema na HostGator. Não publique esta versão no GitHub Pages.

```text
docs/
  index.html
  styles.css
  app.js
  common.js
  admin/
  api/
  assets/
  uploads/       # fotos criadas pelo administrador; fora do Git
private/
  bootstrap.php
  config.php     # conta e hash da senha; fora do Git
  seed.json
  data/          # catálogo e limites de login; fora do Git
router.php
server.mjs
```

## Próximas etapas

Definir cidade de atuação, logotipo definitivo e canais oficiais. Conectar o envio real de contatos e configurar a hospedagem. Os limites e procedimentos de backup estão em [HOSTGATOR.md](HOSTGATOR.md).

## Testes

`tests/integration.mjs` inicia um servidor PHP descartável e testa autenticação, autorização, CSRF, expiração, limite de tentativas, cadastro, edição, publicação, rascunhos, upload e exclusão. Requer Node.js e PHP. Defina `PHP_BINARY` e `PZ_TEST_PASSWORD` com a senha da configuração local, e execute `node tests/integration.mjs`. A senha não é registrada no código. O teste usa cópias temporárias e não modifica os dados da prévia.

## Imagens

Fotografias ilustrativas do Unsplash: `photo-1600596542815-ffad4c1539a9`, `photo-1600585154340-be6161a56a0c`, `photo-1600210492486-724fe5c67fb0`, `photo-1600607687939-ce8a6c25118c`, `photo-1600566753086-00f18fb6b3ea` e `photo-1500382017468-9049fed747ef`.
