// Configurações das APIs
const config = {
    facebook: {
        appId: 'SEU_APP_ID_AQUI',
        pageId: 'SEU_PAGE_ID_AQUI',
        accessToken: 'SEU_ACCESS_TOKEN_AQUI'
    },
    instagram: {
        accessToken: 'SEU_INSTAGRAM_ACCESS_TOKEN_AQUI'
    }
};

// Instruções para obter as credenciais:
// 1. Facebook:
//    - Acesse https://developers.facebook.com
//    - Crie uma conta de desenvolvedor
//    - Crie um novo aplicativo
//    - Configure o aplicativo para acessar a página do Facebook de Euzebio Olivertino Borges
//    - Obtenha o App ID e Page ID
//    - Gere um token de acesso de longa duração com as permissões necessárias
//
// 2. Instagram:
//    - Use a mesma conta de desenvolvedor do Facebook
//    - Configure o Instagram Basic Display API
//    - Conecte sua conta do Instagram (euzebio.olivertino)
//    - Gere um token de acesso de longa duração

// Função para carregar posts do Facebook
async function loadFacebookPosts() {
    const facebookFeed = document.querySelector('#facebook-feed .feed-content');
    try {
        const response = await fetch(`https://graph.facebook.com/v18.0/${config.facebook.pageId}/posts?access_token=${config.facebook.accessToken}&fields=message,created_time,full_picture`);
        const data = await response.json();
        
        if (data.data && data.data.length > 0) {
            const posts = data.data.slice(0, 3); // Mostrar apenas 3 posts
            const postsHTML = posts.map(post => `
                <div class="social-post">
                    ${post.full_picture ? `<img src="${post.full_picture}" alt="Post image">` : ''}
                    <p>${post.message || ''}</p>
                    <small>${new Date(post.created_time).toLocaleDateString()}</small>
                </div>
            `).join('');
            
            facebookFeed.innerHTML = postsHTML;
        } else {
            facebookFeed.innerHTML = '<p>Nenhum post encontrado.</p>';
        }
    } catch (error) {
        console.error('Erro ao carregar posts do Facebook:', error);
        facebookFeed.innerHTML = '<p>Erro ao carregar posts do Facebook.</p>';
    }
}

// Função para carregar posts do Instagram
async function loadInstagramPosts() {
    const instagramFeed = document.querySelector('#instagram-feed .feed-content');
    try {
        const response = await fetch(`https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,thumbnail_url,permalink,timestamp&access_token=${config.instagram.accessToken}`);
        const data = await response.json();
        
        if (data.data && data.data.length > 0) {
            const posts = data.data.slice(0, 3); // Mostrar apenas 3 posts
            const postsHTML = posts.map(post => `
                <div class="social-post">
                    <img src="${post.media_url}" alt="Instagram post">
                    <p>${post.caption || ''}</p>
                    <small>${new Date(post.timestamp).toLocaleDateString()}</small>
                </div>
            `).join('');
            
            instagramFeed.innerHTML = postsHTML;
        } else {
            instagramFeed.innerHTML = '<p>Nenhum post encontrado.</p>';
        }
    } catch (error) {
        console.error('Erro ao carregar posts do Instagram:', error);
        instagramFeed.innerHTML = '<p>Erro ao carregar posts do Instagram.</p>';
    }
}

// Função para lidar com o envio do formulário de contato
document.getElementById('contact-form').addEventListener('submit', async (e) => {
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

// Carregar posts quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    loadFacebookPosts();
    loadInstagramPosts();
});

document.addEventListener('DOMContentLoaded', function() {
    const menuButton = document.querySelector('.menu-button');
    const navLinks = document.querySelector('.nav-links');
    
    menuButton.addEventListener('click', function() {
        navLinks.classList.toggle('active');
        menuButton.classList.toggle('active');
    });
}); 