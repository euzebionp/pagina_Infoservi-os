# Infoserviços Tecnologias

Site institucional da Infoserviços Tecnologias. Site 100% estático (HTML, CSS e JS), publicado no **Cloudflare Workers**.

**Produção:** https://pagina-infoservi-os.infoservicos.workers.dev/

## Requisitos

- Node.js 18 ou superior
- Conta no Cloudflare

## Instalação

```bash
npm install
```

## Comandos

| Comando | O que faz |
|---|---|
| `npm run dev` | Sobe o site em `http://localhost:8787` com recarga automática |
| `npm run deploy` | Publica em produção (aplica as alterações imediatamente) |
| `npm run preview` |igual ao dev, mas na infraestrutura da Cloudflare |

Publicar pela primeira vez exige autenticar:

```bash
npx wrangler login
```

## Estrutura

```
.
├── site/                  # tudo o que vai para o ar
│   ├── index.html
│   ├── area-clientes.html
│   ├── 404.html
│   ├── desenvolvimento-web.html
│   ├── aplicativos-mobile.html
│   ├── manutencao-montagem.html
│   ├── quem-somos.html
│   ├── contatos.html
│   ├── styles.css
│   ├── script.js
│   ├── favicon.ico
│   ├── _headers           # cabeçalhos de segurança (CSP, HSTS, etc.)
│   ├── robots.txt
│   └── sitemap.xml
├── wrangler.toml          # configuração do Worker e dos assets
├── package.json
└── README.md
```

Qualquer arquivo novo que precise ir ao ar deve ficar em `site/`. Arquivos na raiz do repositório **não** são publicados.

## Segurança

Os cabeçalhos de segurança ficam em `site/_headers` e são aplicados automaticamente pelo Cloudflare: HSTS, Content Security Policy, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy` e `Permissions-Policy`.

Ao adicionar um domínio externo (CDN de script, fonte ou imagem), libere-o também na diretiva correspondente da CSP em `site/_headers`, senão o navegador vai bloquear o recurso.

**Nunca coloque chaves de API, tokens ou senhas no `script.js`**: tudo o que está nele é executado no navegador do visitante.

## Área do Cliente

`site/area-clientes.html` é uma tela de login que redireciona para o painel externo. Configure o destino no campo `hidden` `#cliente-destino`, dentro do `<form>`:

```html
<input type="hidden" id="cliente-destino" value="https://seu-painel.com.br/login">
```

A autenticação acontece no painel externo, não neste site. Para proteger a área de verdade, use o **Cloudflare Access** (Zero Trust) no domínio do painel.

## Publicar alterações

```bash
git add -A
git commit -m "descricao da alteracao"
git push
npm run deploy
```

## Licença

MIT.
