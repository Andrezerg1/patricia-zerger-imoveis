# Hospedagem e administração

Esta versão usa PHP 8.2 ou superior, sessões PHP e arquivos JSON. Não exige Composer, Node.js em produção, banco de dados ou serviços externos. O catálogo tem até 100 imóveis e cada imóvel aceita até oito fotos. As imagens são reduzidas no navegador para 1600 px e limitadas a 1,5 MB após a conversão; o envio completo aceita até 16 MB.

## Estrutura na HostGator

Use uma hospedagem Linux com PHP e cPanel. A documentação oficial descreve as [versões disponíveis](https://suporte.hostgator.com.br/hc/pt-br/articles/30820193707155-Vers%C3%B5es-dos-principais-softwares-da-HostGator) e [como selecionar PHP](https://suporte.hostgator.com.br/hc/pt-br/articles/30807998885395-Como-alterar-a-vers%C3%A3o-do-PHP-na-hospedagem). A conta e o plano específicos ainda precisam ser conferidos antes da publicação.

1. Configure o domínio para usar a pasta `docs` como raiz pública, mantendo `private` como sua irmã fora da raiz pública.
2. Se o domínio principal tiver raiz fixa `public_html`, copie o conteúdo de `docs` para `public_html` e coloque `private` ao lado de `public_html`. Nenhum ajuste de código é necessário para essa estrutura.
3. Copie `private/config.example.php` para `private/config.php` e configure `username` e o resultado de `password_hash()` para a senha escolhida. A cópia local já contém a conta solicitada. O arquivo real de credenciais é ignorado pelo Git.
4. Permita que o PHP grave em `private/data` e na pasta pública `uploads`. Não use permissões 777. O catálogo é criado no primeiro salvamento; os seis imóveis ilustrativos vêm de `private/seed.json`.
5. Ative HTTPS no domínio para que o cookie de sessão seja enviado apenas por conexão segura. Confirme `post_max_size=16M` e `memory_limit=128M` pelo cPanel se a hospedagem não aplicar `.user.ini`.
6. Acesse `/admin/`, confira o login e faça um cadastro de teste. Preserve os arquivos `.htaccess` enviados. Faça backup de `private/data`, `private/config.php` e `uploads` antes de atualizações.

O login usa hash de senha, cookie HttpOnly/SameSite, regeneração da sessão, expiração após uma hora sem atividade e limite de cinco tentativas incorretas por IP em 15 minutos. Gravação e exclusão exigem sessão e token CSRF. Rascunhos não são entregues pela API pública. Fotos são servidas como arquivos estáticos; uma URL de foto já conhecida pode ser acessada diretamente.

## Limites desta etapa

- Uma única conta administrativa; sem cadastro de usuários, recuperação de senha ou níveis de permissão.
- Catálogo em arquivos para uma operação pequena. Alterações simultâneas no mesmo imóvel seguem o último salvamento; o bloqueio de arquivo evita corromper o catálogo.
- Fotos substituídas ou excluídas são removidas quando não são mais usadas. Não há lixeira.
- Os dados anteriores do IndexedDB continuam no navegador de origem, mas não são importados automaticamente. Esta versão inicia com os seis exemplos do repositório.
- O formulário de contato continua sendo uma simulação.
- GitHub pode armazenar o código, mas **GitHub Pages não executa PHP**. Esta versão deve ser publicada na HostGator; enviar o código ao GitHub não instala o sistema na hospedagem.
- O código desta versão fica na branch `codex/admin-hostgator` do GitHub. A publicação funcional na HostGator depende da configuração da hospedagem; o envio do código não altera o site atual do GitHub Pages.
