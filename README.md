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
| `npm run deploy` | Publica o **site** em produção (aplica as alterações imediatamente) |
| `npm run preview` | Igual ao dev, mas na infraestrutura da Cloudflare |
| `npm run dev:painel` | Sobe o **painel** localmente com uma identidade Access simulada |
| `npm run deploy:painel` | Publica o **painel** em `painel-infoservicos.infoservicos.workers.dev` |

Os comandos `*painel` usam uma configuração separada (`painel/wrangler.toml`), porque dois Workers não podem compartilhar o mesmo `wrangler.toml`.

Publicar pela primeira vez exige autenticar:

```bash
npx wrangler login
```

## Estrutura

```
.
├── site/                  # site institucional, público (vai ao ar)
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
├── painel/                # painel do cliente, protegido pelo Access
│   ├── wrangler.toml      # name = "painel-infoservicos"
│   └── worker/index.js    # lê ctx.access, não implementa login
├── worker/index.js        # router do site (reescreve / para index.html)
├── wrangler.toml          # configuração do site e dos assets
├── package.json
└── README.md
```

Qualquer arquivo novo do **site** que precise ir ao ar deve ficar em `site/`. Arquivos na raiz do repositório **não** são publicados. O painel é independente e **não** usa `site/` — ele não tem bloco `[assets]` de propósito.

## Segurança

Os cabeçalhos de segurança ficam em `site/_headers` e são aplicados automaticamente pelo Cloudflare: HSTS, Content Security Policy, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy` e `Permissions-Policy`.

Ao adicionar um domínio externo (CDN de script, fonte ou imagem), libere-o também na diretiva correspondente da CSP em `site/_headers`, senão o navegador vai bloquear o recurso.

**Nunca coloque chaves de API, tokens ou senhas no `script.js`**: tudo o que está nele é executado no navegador do visitante.

## Área do Cliente

A área do cliente **não tem senha nem formulário de login neste site**. O login acontece fora daqui, no painel, protegido pelo **Cloudflare Access (Zero Trust)**.

O motivo é simples: um formulário de login em HTML puro não protege nada. Quem lê o código-fonte (ou o campo escondido `value=""` que existia antes) descobre o endereço do painel e entra direto, sem digitar nada. A proteção de verdade precisa ficar **na frente** do painel, não na página que o anuncia.

O painel é um **segundo Worker**, separado do site institucional. Os dois nunca podem ser o mesmo: se você ligar o Access no Worker do site, o site inteiro passa a exigir login.

```
site/                 ->  pagina-infoservi-os.infoservicos.workers.dev   (público)
painel/               ->  painel-infoservicos.infoservicos.workers.dev  (protegido)
```

### Publicar o painel

```bash
npm run deploy:painel
```

Isso cria `https://painel-infoservicos.infoservicos.workers.dev/`.

O subdomínio `infoservios` é **por conta**, definido nas configurações do Cloudflare. Não existe "criar um domínio novo": o que define o endereço é o `name` em `painel/wrangler.toml`.

### Ligar o Access no painel

Depois do primeiro deploy, o painel responde **403** com um aviso explicando o que falta. Isso é intencional — protege contra o painel ficar aberto por engano.

1. **Workers & Pages → painel-infoservicos → aba Access**
2. **Protect this Worker behind Access**
3. Em **Authentication policy**, cole os e-mails dos clientes (ou use uma Email List)
4. **Apply Access**
5. Teste em janela anônima: deve pedir o código de acesso

Ligar o Access no nível do Worker protege automaticamente o `workers.dev`, o custom domain e as previews.

Para produção, considere um subdomínio próprio (ex. `painel.seudominio.com.br`) em **Settings → Domains & Routes → Add → Custom domain**: a Cloudflare classifica `workers.dev` como ambiente Free/hobby.

### Saber quem está logado

O painel **não** implementa login. O Access autentica antes de qualquer código rodar, e o código só lê a identidade via `ctx.access`:

```js
async fetch(request, env, ctx) {
  if (!ctx.access) return new Response("Acesso nao liberado", { status: 403 });

  const identity = await ctx.access.getIdentity();
  return Response.json({ email: identity?.email });
}
```

- `ctx.access` é `undefined` quando o Access não autenticou a requisição.
- `getIdentity()` devolve `{ email, name, groups }`.

Isso dispensa validar o JWT `Cf-Access-Jwt-Assertion` na mão e dispensa as variáveis `POLICY_AUD` e `TEAM_DOMAIN`.

`GET /api/sessao` no painel já devolve essa identidade em JSON — é o ponto de partida para o painel real mostrar apenas os dados do cliente que entrou.

> **Não adicione um bloco `[assets]` em `painel/wrangler.toml`.** Workers com Static Assets rodam atrás de um router interno que não repassa o `ctx.access`, e o painel precisa dele.

### Rodar o painel localmente

O bloco `[access.dev]` em `painel/wrangler.toml` simula uma identidade autenticada, para você desenvolver sem fazer deploy:

```bash
npm run dev:painel    # http://localhost:8787
```

Troque o e-mail em `[access.dev.identity]` para testar como outro cliente. O `aud` é obrigatório — o Wrangler não sobe sem ele. O `access.dev` só tem efeito local: em produção a identidade vem do Access de verdade.

### O que o site faz

`site/area-clientes.html` é só um botão que leva ao painel. O endereço já está preenchido; se mudar o `name` do painel, atualize o `href`.

### Cadastrar um cliente novo

Não existe cadastro neste repositório — e isso é intencional. Para liberar um cliente:

1. Zero Trust → **Access → Applications** → `painel-infoservicos` → **Policies**
2. Adicione o e-mail do cliente em **Include → Emails**, ou numa **Email List** se já usar uma
3. Salve. O acesso vale imediatamente, sem novo deploy

Para **remover** o acesso, apague o e-mail da policy. Para encerrar sessões **já abertas** imediatamente, remova o usuário em **Team & Resources → Users** — remover da policy só afeta os próximos logins.

### Cadastrar vários de uma vez

Crie uma **Email List** (Zero Trust → Settings → Email Lists), suba os e-mails e referencie a lista na policy.

Ou pela API do Cloudflare:

```bash
curl -X POST "https://api.cloudflare.com/client/v4/accounts/$ACCOUNT_ID/access/policies" \
  -H "Authorization: Bearer $API_TOKEN" -H "Content-Type: application/json" \
  -d '{
    "name": "Clientes Infoservicos",
    "decision": "allow",
    "include": [{ "email_list": { "email_list": "<LIST_UUID>" } }],
    "session_duration": "24h"
  }'
```

Dessa forma os e-mails dos clientes também **não ficam expostos no site**.

### Limites

O plano grátis do Zero Trust dá **50 seats**. Cada pessoa que se autentica ocupa um seat, e ele só é liberado quando você a remove em **Team & Resources → Users**. Para mais de 50 usuários simultâneos é preciso contratar.

## Publicar alterações

```bash
git add -A
git commit -m "descricao da alteracao"
git push
npm run deploy
```

## Licença

MIT.
