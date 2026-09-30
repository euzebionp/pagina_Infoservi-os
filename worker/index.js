// Infoservicos Tecnologias - Worker
//
// O site continua sendo 100% estatico: nao ha logica de negocio aqui.
// Este Worker existe apenas porque `html_handling = "none"` faz a Cloudflare
// servir somente caminhos exatos de arquivo, e com essa opcao a raiz "/" NAO
// cai automaticamente em "/index.html" (resultando em 404 na home).
//
// A configuracao `run_worker_first = ["/"]` garante que so a raiz passe por
// aqui. Qualquer outro caminho e servido direto pelos assets estaticos.

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // "/" reescreve para "/index.html" mantendo status 200.
    // Serve o conteudo direto (sem redirect) para que o sitemap.xml possa
    // declarar "/" como URL canonica.
    if (url.pathname === '/') {
      const indexRequest = new Request(new URL('/index.html', url), request);
      const indexResponse = await env.ASSETS.fetch(indexRequest);
      return new Response(indexResponse.body, indexResponse);
    }

    return env.ASSETS.fetch(request);
  },
};