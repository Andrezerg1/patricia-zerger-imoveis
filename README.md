# Patricia Zerger Imóveis

Protótipo responsivo de uma vitrine imobiliária em HTML, CSS e JavaScript.

**Acesse:** https://andrezerg1.github.io/patricia-zerger-imoveis/

## Funcionalidades

- Catálogo com seis imóveis ilustrativos.
- Filtros combinados por tipo, bairro, preço, rua/código e quartos.
- Ordenação por destaque, preço e área.
- Detalhes do imóvel com galeria e formulário de interesse pré-preenchido.
- Painel administrativo demonstrativo com criação, edição, rascunho e exclusão.
- Upload de até oito fotos por imóvel, redimensionadas para até 1600 px.
- Armazenamento de cadastros e imagens em IndexedDB no navegador.
- Interface responsiva em verde, branco e cinza; sem cadastro de visitantes ou pagamentos.

## Limites do protótipo

Os imóveis, endereços, características e valores são fictícios. O painel não possui autenticação. Não insira dados reais ou confidenciais. As alterações ficam somente no navegador e na origem do site; não são compartilhadas com outros visitantes ou dispositivos. Limpar os dados do navegador apaga os cadastros. O formulário de contato apenas simula o envio.

A versão no GitHub Pages tem armazenamento local separado da prévia anterior. O catálogo demonstrativo é criado na primeira abertura.

## Desenvolvimento local

Com Node.js instalado:

```sh
git clone https://github.com/Andrezerg1/patricia-zerger-imoveis.git
cd patricia-zerger-imoveis
node server.mjs
```

Abra http://localhost:4173. Não há dependências de instalação ou etapa de build.

## Publicação

O GitHub Pages publica a pasta `docs/` da branch `main`. Alterações enviadas para essa pasta atualizam o site automaticamente. Os caminhos de imagens, CSS e JavaScript são relativos para funcionar no endereço do projeto.

```text
docs/
  index.html
  styles.css
  app.js
  assets/
  .nojekyll
server.mjs
```

## Próximas etapas

Definir cidade de atuação, logotipo definitivo e canais oficiais. Implementar login administrativo seguro, API, banco de dados compartilhado, armazenamento de fotos e envio real de contatos. O GitHub Pages hospeda esta interface estática; os serviços de backend precisarão de hospedagem própria ou de um serviço externo.

## Imagens

Fotografias ilustrativas do Unsplash: `photo-1600596542815-ffad4c1539a9`, `photo-1600585154340-be6161a56a0c`, `photo-1600210492486-724fe5c67fb0`, `photo-1600607687939-ce8a6c25118c`, `photo-1600566753086-00f18fb6b3ea` e `photo-1500382017468-9049fed747ef`.
