# Patricia Zerger Imóveis

Site imobiliário com catálogo no servidor, painel administrativo protegido e contato por WhatsApp. Destino de publicação: **www.patriciazergerimoveis.com.br**, em hospedagem HostGator com PHP e cPanel.

## Funcionalidades

- Busca por tipo, bairro, preço, rua/código e quartos; ordenação por destaque, preço e área.
- Detalhes de imóveis com galeria de até oito fotos.
- Administração em /admin/: login, cadastro, edição, exclusão, destaque, rascunho e publicação.
- Contato direto por WhatsApp na página principal e mensagem específica nos detalhes de cada imóvel. O ícone discreto aparece ao rolar a página e desaparece suavemente ao voltar ao topo.
- Número comercial editável no painel. Valor inicial fornecido: +55 43 9855-9499.
- Layout responsivo com logotipo fornecido e tipografia ajustada para celular e computador.

A primeira instalação começa sem anúncios. Cadastre imóveis reais pelo painel. Um catálogo já existente em private/data é preservado. O painel usa uma conta única e gerencia imóveis e WhatsApp; não é um editor de textos ou de layout.

## Publicação

O site está publicado na HostGator em **www.patriciazergerimoveis.com.br**. Siga o [passo a passo para a HostGator](HOSTGATOR.md) nas próximas instalações. Esta versão está em **codex/admin-hostgator**. A branch main ainda alimenta o GitHub Pages. Enviar ao GitHub não instala o site na HostGator; não mescle esta branch na fonte do Pages enquanto ele for usado, pois o painel exige PHP.

O conteúdo de docs/ vai para a raiz pública, normalmente public_html/. A pasta private/ fica ao lado dela, fora da raiz pública. Não exige banco de dados, Composer ou Node.js no servidor.

private/config.php, private/data/ e fotos de docs/uploads/ ficam fora do Git. Envie a configuração real separadamente se usar o ZIP do GitHub. Preserve esses arquivos nos backups e atualizações.

Para gerar o pacote de primeira instalação no Windows com PowerShell 7:

```powershell
./scripts/package.ps1 -OutputPath C:/caminho/patricia-zerger-hostgator.zip -IncludeLocalConfig
```

O parâmetro inclui a configuração local no pacote privado de instalação. Sem ele, o ZIP exige configurar a conta separadamente. Não publique esse pacote em repositórios ou dentro da raiz pública.

## Desenvolvimento e validação

Requer PHP 8.2+; validado com PHP 8.4. Configure private/config.php a partir de private/config.example.php usando password_hash() para a senha. Execute na raiz:

```sh
php -d post_max_size=16M -d display_errors=0 -S 127.0.0.1:4173 -t docs router.php
```

Site: http://127.0.0.1:4173/; painel: http://127.0.0.1:4173/admin/. node server.mjs também inicia PHP; use PHP_BINARY se ele não estiver no PATH.

tests/integration.mjs usa cópia temporária com sessões e dados isolados. Defina PHP_BINARY e PZ_TEST_PASSWORD conforme a configuração local e execute node tests/integration.mjs. Cobre autenticação, expiração, limite de tentativas, autorização, rascunhos, publicação, fotos e WhatsApp. node tests/contact.mjs valida o destino e a codificação da mensagem sem enviar mensagens externas.

## Imagens

Logotipo fornecido para Patricia Zerger Imóveis. Fotografias de ambientação do Unsplash: photo-1600596542815-ffad4c1539a9 e photo-1600210492486-724fe5c67fb0. Fotos dos anúncios são enviadas pelo administrador durante o cadastro.
