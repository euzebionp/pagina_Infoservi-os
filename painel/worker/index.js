// Infoservicos Tecnologias - Painel do Cliente
//
// O Cloudflare Access cuida da autenticacao ANTES deste codigo rodar.
// Se voce chegou ate aqui, o visitante ja apresentou um e-mail autorizado.
//
// Nao implemente login, senha ou token aqui. A unica coisa que este arquivo
// faz e ler a identidade de quem passou pelo Access.
//
// Como funciona o `ctx.access`:
//   - `ctx.access` e `undefined` quando o Access NAO autenticou a requisicao
//     (ou seja: o Access ainda nao foi ligado neste Worker).
//   - `await ctx.access.getIdentity()` devolve { email, name?, groups? }.
//
// Para listar quem tem acesso, use a policy do Access
// (Zero Trust > Access > Applications > Policies), nao uma lista neste arquivo.

const HEADERS = {
  "content-type": "text/html; charset=utf-8",
  "x-content-type-options": "nosniff",
  "referrer-policy": "strict-origin-when-cross-origin",
  "x-frame-options": "DENY",
  "content-security-policy":
    "default-src 'none'; style-src 'unsafe-inline'; form-action 'none'; frame-ancestors 'none'; base-uri 'none'",
  "cache-control": "no-store",
};

const esc = (s) =>
  String(s).replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c],
  );

function page({ email, name, setup = false }) {
  if (setup) {
    return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="robots" content="noindex, nofollow">
<title>Acesso nao liberado - Infoserviços</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:1.5rem;
    background:#050505;color:#fff;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;line-height:1.6}
  .card{width:100%;max-width:560px;background:rgba(20,20,25,.85);border:1px solid rgba(255,165,0,.35);
    border-radius:14px;padding:2rem}
  h1{font-size:1.15rem;letter-spacing:1px;text-transform:uppercase;color:#ffb347;margin-bottom:1rem}
  p{color:#a0a0a0;font-size:.9rem;margin-bottom:1rem}
  ol{color:#a0a0a0;font-size:.9rem;padding-left:1.25rem;margin-bottom:1rem}
  li{margin-bottom:.5rem}
  code{background:rgba(255,255,255,.07);padding:.15rem .4rem;border-radius:4px;font-size:.85em;color:#00f3ff}
</style>
</head>
<body>
  <main class="card">
    <h1>Acesso ainda nao liberado</h1>
    <p>Este painel esta no ar, mas o Cloudflare Access ainda nao foi ativado nele. Qualquer pessoa que descubra o endereco entraria sem Restricted nada.</p>
    <p>Para ativar:</p>
    <ol>
      <li>Workers &amp; Pages &rarr; <strong>painel-infoservicos</strong> &rarr; aba <strong>Access</strong></li>
      <li>Clique em <strong>Protect this Worker behind Access</strong></li>
      <li>Em <em>Authentication policy</em>, cole os e-mails dos clientes</li>
      <li>Confirme e teste em janela anonima</li>
    </ol>
    <p>Enquanto isso, o painel nao deve ser liberado para clientes.</p>
  </main>
</body>
</html>`;
  }

  const quem = email
    ? `<span class="mail">${esc(email)}</span>`
    : '<span class="mail warn">nenhuma identidade recebida</span>';

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="robots" content="noindex, nofollow">
<title>Painel do Cliente - Infoserviços</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:1.5rem;
    background:#050505;color:#fff;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;line-height:1.6}
  .card{width:100%;max-width:520px;background:rgba(20,20,25,.85);border:1px solid rgba(255,255,255,.1);
    border-radius:14px;padding:2rem;text-align:center;box-shadow:0 0 50px rgba(0,243,255,.08)}
  h1{font-size:1.25rem;letter-spacing:1px;text-transform:uppercase;color:#00f3ff;margin-bottom:.5rem}
  p.sub{color:#a0a0a0;font-size:.9rem;margin-bottom:1.5rem}
  .mail{display:inline-block;padding:.5rem 1rem;border:1px solid rgba(0,243,255,.4);border-radius:6px;
    background:rgba(0,243,255,.07);color:#00f3ff;font-weight:600;word-break:break-all}
  .mail.warn{border-color:rgba(255,165,0,.4);background:rgba(255,165,0,.1);color:#ffb347}
  ul{text-align:left;color:#a0a0a0;font-size:.85rem;margin:1.5rem 0 0;padding-left:1.25rem}
  li{margin-bottom:.4rem}
  footer{margin-top:1.75rem;padding-top:1.25rem;border-top:1px solid rgba(255,255,255,.1);
    color:rgba(255,255,255,.35);font-size:.75rem}
</style>
</head>
<body>
  <main class="card">
    <h1>Painel do Cliente</h1>
    <p class="sub">${name ? `Ola, ${esc(name)}.` : "Autenticado via Cloudflare Access."}</p>
    <p>Voce entrou com:</p>
    ${quem}
    <ul>
      <li>Contratos e servicos contratados</li>
      <li>Orcamentos e chamado tecnico</li>
      <li>Documentos e notas de servico</li>
    </ul>
    <footer>Infoservicos Tecnologias &middot; conteudo do painel ainda a implementar</footer>
  </main>
</body>
</html>`;
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // `ctx.access` ausente = o Access ainda nao protege este Worker.
    if (!ctx.access) {
      // Endpoint de exemplo: o painel real usa isto para descobrir qual cliente
      // entrou e mostrar apenas os dados dele.
      if (url.pathname === "/api/sessao") {
        return Response.json({ erro: "acesso nao liberado" }, { status: 403 });
      }
      return new Response(page({ setup: true }), { status: 403, headers: HEADERS });
    }

    const identity = await ctx.access.getIdentity();

    if (url.pathname === "/api/sessao") {
      return Response.json(
        {
          email: identity?.email ?? null,
          nome: identity?.name ?? null,
          grupos: identity?.groups ?? [],
        },
        { headers: { "cache-control": "no-store" } },
      );
    }

    return new Response(page({ email: identity?.email, name: identity?.name }), {
      headers: HEADERS,
    });
  },
};
