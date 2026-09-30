// Infoserviços Tecnologias - script do site
// ATENÇÃO: nunca coloque tokens/segredos (API keys, access tokens, senhas)
// neste arquivo. Tudo aqui é executado no navegador do visitante.

// Formulário de contato
const contactForm = document.getElementById('contact-form');

if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const form = e.target;
        const formData = new FormData(form);

        // Aqui você pode adicionar a lógica para enviar o formulário
        // Por exemplo, enviando para um endpoint da sua API
        console.log('Dados do formulário:', Object.fromEntries(formData));

        // Limpar o formulário
        form.reset();
        alert('Mensagem enviada com sucesso!');
    });
}

// Área do Cliente
//
// A autenticação NÃO acontece aqui. O painel vive em outro domínio, protegido
// pelo Cloudflare Access (Zero Trust), que exige um código enviado por e-mail.
// Esta página é apenas um link para o painel — por isso não há formulário de
// senha, nem qualquer segredo no arquivo.
//
// Para trocar o destino, edite o href do botão em area-clientes.html.

// Menu mobile
document.addEventListener('DOMContentLoaded', function() {
    const menuButton = document.querySelector('.menu-button');
    const navLinks = document.querySelector('.nav-links');

    if (!menuButton || !navLinks) return;

    function setMenu(open) {
        navLinks.classList.toggle('active', open);
        menuButton.classList.toggle('active', open);
        menuButton.setAttribute('aria-expanded', String(open));
        document.body.classList.toggle('menu-open', open);
    }

    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Abrir menu');

    menuButton.addEventListener('click', function() {
        setMenu(!navLinks.classList.contains('active'));
    });

    // Fecha ao navegar para outra pagina
    navLinks.querySelectorAll('a').forEach(function(link) {
        link.addEventListener('click', function() {
            setMenu(false);
        });
    });

    // Fecha com Esc
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && navLinks.classList.contains('active')) {
            setMenu(false);
            menuButton.focus();
        }
    });

    // Se a tela grow e o menu mobile sumir, nao deixa estado preso
    window.addEventListener('resize', function() {
        if (window.innerWidth > 1024 && navLinks.classList.contains('active')) {
            setMenu(false);
        }
    });
});
