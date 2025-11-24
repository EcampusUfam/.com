// A URL FINAL e CORRETA do seu Worker
const WORKER_URL = 'https://api.autenticacaohistoricoufam.com.br'; 

// Elementos HTML
const messageElement = document.getElementById('message');
const captchaDisplay = document.getElementById('captcha_display');
const authForm = document.getElementById('authForm');

let currentCaptchaText = '';

// Função para gerar um código CAPTCHA aleatório (6 caracteres)
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
    captchaDisplay.textContent = currentCaptchaText.toUpperCase(); 
}

// Inicializa o CAPTCHA ao carregar a página
document.addEventListener('DOMContentLoaded', displayNewCaptcha);

// Listener do Formulário
authForm.addEventListener('submit', function(event) {
    event.preventDefault();

    const codigo = document.getElementById('codigo').value.trim();
    const validationCode = document.getElementById('validation_code').value.trim().toLowerCase();
    
    messageElement.textContent = 'Buscando...';
    messageElement.style.color = 'black';

    // 1. Verificação do CAPTCHA
    if (validationCode !== currentCaptchaText) {
        messageElement.style.color = 'red';
        messageElement.textContent = 'Código de Validação incorreto. Tente novamente.';
        displayNewCaptcha(); 
        return;
    }

    // 2. Chamada ao Cloudflare Worker (API)
    const apiCallUrl = `${WORKER_URL}?code=${codigo}`;

    fetch(apiCallUrl)
        .then(response => {
            if (response.ok && response.redirected) {
                // Sucesso: Redirecionamento para o PDF
                messageElement.style.color = 'green';
                messageElement.textContent = 'Documento autenticado! O download começará em breve.';
                window.open(response.url, '_blank'); 
            } else if (!response.ok) {
                // Falha: Código inválido
                response.text().then(text => {
                    messageElement.style.color = 'red';
                    messageElement.textContent = text || 'Falha na autenticação. Código ou dados inválidos.';
                });
            } else {
                messageElement.style.color = 'red';
                messageElement.textContent = 'Ocorreu um erro inesperado na comunicação.';
            }
            displayNewCaptcha(); // Novo CAPTCHA após o envio
        })
        .catch(error => {
            // Este catch resolve o erro de CORS ou DNS do Worker (erro de conexão)
            messageElement.style.color = 'red';
            messageElement.textContent = 'Erro de conexão com o servidor de autenticação.';
            console.error('Fetch error:', error);
            displayNewCaptcha();
        });
});
