// A URL FINAL do seu Worker, usando o subdomínio oficial do seu site.
const WORKER_URL = 'https://api.autenticacaohistoricoufam.com.br'; 

// Elementos HTML (garanta que estes IDs existam no seu index.html)
const messageElement = document.getElementById('message');
const captchaDisplay = document.getElementById('captcha_display');
const authForm = document.getElementById('authForm');

let currentCaptchaText = '';

// Função para gerar um código CAPTCHA aleatório (6 caracteres alfanuméricos)
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
    // Exibe o texto em maiúsculas (para melhorar a leitura, mas a comparação é em minúsculas)
    captchaDisplay.textContent = currentCaptchaText.toUpperCase(); 
}

// 1. Inicializa o CAPTCHA ao carregar a página
document.addEventListener('DOMContentLoaded', displayNewCaptcha);

// 2. Adiciona o Listener ao Formulário
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
        // Gera e exibe um novo CAPTCHA após a falha
        displayNewCaptcha(); 
        return;
    }

    // 2. Chamada ao Cloudflare Worker (API)
    const apiCallUrl = `${WORKER_URL}?code=${codigo}`;

    fetch(apiCallUrl)
        .then(response => {
            // Se o Worker retornar 302 (redirecionamento) e for bem-sucedido:
            if (response.ok && response.redirected) {
                messageElement.style.color = 'green';
                messageElement.textContent = 'Documento autenticado! O download começará em breve.';
                // Abre o PDF em uma nova aba
                window.open(response.url, '_blank'); 
            } else if (!response.ok) {
                // Se o Worker retornar um erro 404/400 (código inválido)
                response.text().then(text => {
                    messageElement.style.color = 'red';
                    // O Worker deve retornar uma mensagem como "Código inválido"
                    messageElement.textContent = text || 'Falha na autenticação. Código ou dados inválidos.';
                });
            } else {
                messageElement.style.color = 'red';
                messageElement.textContent = 'Ocorreu um erro inesperado na comunicação.';
            }
            // Não importa o resultado, geramos um novo CAPTCHA
            displayNewCaptcha(); 
        })
        .catch(error => {
            // Este catch captura o "Erro de conexão com o servidor"
            messageElement.style.color = 'red';
            messageElement.textContent = 'Erro de conexão com o servidor de autenticação.';
            console.error('Fetch error:', error);
            displayNewCaptcha();
        });
});
