// A URL FINAL do seu Worker, usando o subdomínio oficial do seu site.
const WORKER_URL = 'https://api.autenticacaohistoricoufam.com.br'; 

const messageElement = document.getElementById('message');
const captchaDisplay = document.getElementById('captcha_display');

let currentCaptchaText = '';

// Função para gerar um código CAPTCHA aleatório
function generateCaptcha() {
    const chars = '0123456789abcdefghijklmnopqrstuvwxyz';
    let captcha = '';
    for (let i = 0; i < 6; i++) {
        captcha += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return captcha;
}

// Função para exibir o CAPTCHA
function displayNewCaptcha() {
    currentCaptchaText = generateCaptcha();
    // Apenas para fins de teste, você pode exibir o texto puro
    // No seu HTML final, você deve ter uma imagem que mostre este texto
    captchaDisplay.textContent = currentCaptchaText.toUpperCase(); 
}

// Chama a função para exibir o CAPTCHA ao carregar a página
document.addEventListener('DOMContentLoaded', displayNewCaptcha);

document.getElementById('authForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const codigo = document.getElementById('codigo').value.trim();
    const validationCode = document.getElementById('validation_code').value.trim().toLowerCase();
    
    messageElement.textContent = 'Buscando...';

    // 1. Verificação do CAPTCHA
    if (validationCode !== currentCaptchaText) {
        messageElement.style.color = 'red';
        messageElement.textContent = 'Código de Validação incorreto. Tente novamente.';
        // Gera e exibe um novo CAPTCHA após a falha
        displayNewCaptcha(); 
        return;
    }

    // 2. Chamada ao Cloudflare Worker
    const apiCallUrl = `${WORKER_URL}?code=${codigo}`;

    fetch(apiCallUrl)
        .then(response => {
            if (response.ok && response.redirected) {
                // Sucesso: O Worker liberou o download.
                messageElement.style.color = 'green';
                messageElement.textContent = 'Documento autenticado! O download começará em breve ou clique no link abaixo.';
                window.open(response.url, '_blank'); 
            } else if (!response.ok) {
                // Falha: O Worker retornou um erro (código inválido).
                response.text().then(text => {
                    messageElement.style.color = 'red';
                    messageElement.textContent = text || 'Falha na autenticação. Código ou dados inválidos.';
                });
            } else {
                messageElement.style.color = 'red';
                messageElement.textContent = 'Ocorreu um erro inesperado na comunicação.';
            }
            // Não importa o resultado (sucesso ou falha na API), resetamos o CAPTCHA
            displayNewCaptcha(); 
        })
        .catch(error => {
            messageElement.style.color = 'red';
            messageElement.textContent = 'Erro de conexão com o servidor de autenticação.';
            console.error('Fetch error:', error);
            // Reseta o CAPTCHA em caso de erro de conexão
            displayNewCaptcha();
        });
});
