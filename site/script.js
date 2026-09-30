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

// Área do Cliente: redireciona para o painel externo.
// A senha NUNCA é enviada nem armazenada aqui — a autenticação
// acontece no painel do Infoserviços. Configure o destino no campo
// hidden "destino" dentro de area-clientes.html
const clientForm = document.getElementById('client-login-form');

if (clientForm) {
    clientForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const email = clientForm.querySelector('#cliente-email');
        const destino = clientForm.querySelector('#cliente-destino');
        const aviso = document.getElementById('cliente-aviso');
        const url = (destino.value || '').trim();

        if (!url) {
            aviso.textContent = 'Painel ainda não configurado. Fale com a gente para liberar seu acesso.';
            aviso.classList.add('visible');
            return;
        }

        const separator = url.includes('?') ? '&' : '?';
        const emailValue = email ? encodeURIComponent(email.value.trim()) : '';
        window.location.href = emailValue ? `${url}${separator}email=${emailValue}` : url;
    });
}

// Menu mobile
document.addEventListener('DOMContentLoaded', function() {
    const menuButton = document.querySelector('.menu-button');
    const navLinks = document.querySelector('.nav-links');

    if (!menuButton || !navLinks) return;

    menuButton.addEventListener('click', function() {
        navLinks.classList.toggle('active');
        menuButton.classList.toggle('active');
    });
});
