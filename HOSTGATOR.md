# Instalação na HostGator

Domínio: **www.patriciazergerimoveis.com.br**. Usa PHP 8.2+, sessões e arquivos JSON. Não exige banco de dados, WordPress, Composer nem Node.js na hospedagem. Validado localmente com PHP 8.4.

## 1. Preparar a hospedagem

1. No cPanel, abra **Domínios** e confira a raiz do documento de patriciazergerimoveis.com.br. Para o domínio principal, normalmente é /home/SEU_USUARIO/public_html. O www deve servir a mesma pasta.
2. Faça backup dos arquivos atuais, inclusive .htaccess. Guarde fora da pasta pública ou baixe para o computador.
3. Em **Alterar versão de PHP / Gerenciador MultiPHP**, selecione PHP 8.4, se disponível, para esse domínio e aplique. O código requer 8.2+. Não altere outros domínios.
4. Confirme que o domínio com e sem www aponta para esta hospedagem e que HTTPS funciona antes de entrar no painel. O SSL gratuito da HostGator é ativado automaticamente quando os requisitos de apontamento estão atendidos. Se houver erro de certificado, confira o status no painel ou com o suporte.

## 2. Enviar os arquivos

Use **patricia-zerger-hostgator.zip**, preparado para a primeira instalação, ou a branch **codex/admin-hostgator** do GitHub. A branch main ainda alimenta o GitHub Pages e não contém o painel PHP.

No **Gerenciador de arquivos**, abra **Configurações → Mostrar arquivos ocultos**. A estrutura final deve ser:

```text
/home/SEU_USUARIO/
  public_html/          ← conteúdo de docs
    index.html
    styles.css
    app.js
    common.js
    contact.js
    admin/
    api/
    assets/
    uploads/
      .htaccess
    .htaccess
    .user.ini
  private/              ← fora da pasta pública
    bootstrap.php
    properties.php
    property-form.php
    config.php
    config.example.php
    seed.json
    settings-defaults.json
    data/
    .htaccess
```

1. Crie uma pasta temporária, como **instalacao-pz**, na pasta inicial da conta, **fora de public_html**.
2. Entre nela, clique em **Carregar**, selecione o ZIP e aguarde. Volte, selecione o ZIP e clique em **Extrair**.
3. Mova **o conteúdo de public_html do pacote** para a raiz pública do domínio. O resultado deve ser public_html/index.html, e não public_html/public_html/index.html ou public_html/docs/index.html.
4. Coloque **private ao lado da raiz pública**, nunca dentro dela. Para domínio adicional, use a raiz mostrada em Domínios e mantenha private como pasta irmã. Se outra aplicação já usar uma pasta private nesse local, não sobrescreva: ajuste a instalação antes.
5. Preserve .htaccess e .user.ini do projeto. Se o .htaccess anterior contiver um bloco do cPanel para selecionar PHP, mantenha esse bloco junto das regras do projeto. Regras antigas de WordPress ou redirecionamentos precisam ser avaliadas antes de reaproveitar.
6. Guarde a página padrão da hospedagem (index.php, default.html etc.) no backup fora da raiz pública. A entrada desta versão é index.html.
7. Após conferir, retire o ZIP e a pasta temporária do servidor. Não deixe o pacote de instalação disponível por URL pública.

## 3. Configurar acesso e armazenamento

O pacote local gerado com **-IncludeLocalConfig** inclui private/config.php, com usuário **admin** e o hash da senha combinada. Essa configuração **não vai para o GitHub**. O ZIP baixado do GitHub não inclui esse arquivo: envie a cópia local separadamente para private.

Para configurar a partir do código, copie private/config.example.php para private/config.php e preencha username e password_hash usando o resultado de password_hash() do PHP. Não escreva a senha em texto puro nesse campo. Antes da abertura ao público, recomenda-se trocar a senha curta por uma senha forte e exclusiva; o pacote preparado mantém a conta solicitada.

O PHP precisa gravar em **private/data** e **public_html/uploads**. Comece com as permissões normais da conta (pastas 755 e arquivos 644; configuração privada pode usar 600 se PHP executa como o mesmo usuário). **Não use 777**. Em caso de falha, confira proprietário e permissões com o suporte.

.user.ini inclui post_max_size=16M e memory_limit=128M. Se a hospedagem não aplicar o arquivo, ajuste esses valores no editor de INI do PHP no cPanel, se disponível.

## 4. Primeiro acesso e testes

1. Abra **https://www.patriciazergerimoveis.com.br/admin/** e entre com a conta configurada.
2. Em **Contato do site**, confira **+55 43 9855-9499**, exatamente como informado. O número pode ser alterado nessa tela. Confirme no seu aparelho que a conversa abre para o destino correto antes de divulgar.
3. O catálogo inicia **vazio**. Cadastre imóveis reais com fotos, endereço, preço e descrição correspondentes. Salve como rascunho até estarem prontos.
4. Publique um imóvel e confira em **Ver site** e em uma janela anônima. Rascunhos não devem aparecer; /admin/ deve exigir login.
5. Preencha o contato e clique em **Continuar no WhatsApp**. A conversa abrirá com o texto preparado. A mensagem só será enviada após confirmação no WhatsApp; o site não guarda os dados do formulário.
6. Confira no celular, abra as fotos e teste **Sair** do painel.

Dados antigos guardados no navegador não são importados automaticamente. Se já existir private/data/catalog.json no servidor, ele será preservado. Revise eventuais anúncios de exemplo antigos antes de divulgar.

## 5. Atualizações e backups

- O site foi instalado em www.patriciazergerimoveis.com.br. O redirecionamento HTTPS está em public_html/.htaccess; preserve também o handler PHP 8.4 que o cPanel acrescentou nesse arquivo.
- Faça backup de **private/data**, **private/config.php** e **public_html/uploads**: catálogo, contato configurado, conta e fotos ficam fora do Git.
- Em atualizações, envie os arquivos de código e preserve os dados, a configuração e as fotos existentes. O pacote não contém catálogo de execução nem fotos cadastradas localmente.
- O painel atualiza o site neste domínio, sem alterar o GitHub ou a cópia anterior do GitHub Pages.
- Não mescle a branch PHP na fonte atual do Pages antes de mudar a estratégia de publicação. GitHub Pages não executa PHP.

## Limites da primeira versão

Uma conta administrativa, sem recuperação automática de senha. Até 100 imóveis e oito fotos por imóvel. Fotos são reduzidas a 1600 pixels e precisam ficar abaixo de 1,5 MB após conversão. Exclusão não tem lixeira. Fotos são arquivos públicos: uma URL conhecida pode ser acessada mesmo se o anúncio for rascunho. O painel gerencia catálogo e WhatsApp; textos e layout geral são atualizados pelo código.

Login com hash de senha, cookie HttpOnly/SameSite, regeneração de sessão, expiração após uma hora e limite de cinco tentativas incorretas por IP em 15 minutos. Gravações exigem sessão e token CSRF.

## Referências oficiais

- [Enviar arquivos pelo cPanel — HostGator](https://suporte.hostgator.com.br/hc/pt-br/articles/30813145737235-Como-enviar-um-arquivo-para-o-cPanel)
- [Gerenciador de arquivos — HostGator](https://suporte.hostgator.com.br/hc/pt-br/articles/30808065412371-Quais-as-funcionalidades-do-Gerenciador-de-arquivos-do-cPanel)
- [Selecionar PHP — HostGator](https://suporte.hostgator.com.br/hc/pt-br/articles/30807998885395-Como-alterar-a-vers%C3%A3o-do-PHP-na-hospedagem)
- [SSL gratuito — HostGator](https://suporte.hostgator.com.br/hc/pt-br/articles/30808218548627-Como-funciona-o-certificado-SSL-gratuito-na-Hospedagem-da-HostGator)
- [Clique para conversa — WhatsApp](https://faq.whatsapp.com/5913398998672934/?locale=pt_BR)
