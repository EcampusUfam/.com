// A URL FINAL e CORRETA do seu Worker
const WORKER_URL = 'https://api.autenticacaohistoricoufam.com.br'; 

// Elementos HTML
const messageElement = document.getElementById('message');
const captchaDisplay = document.getElementById('captcha_display');
const authForm = document.getElementById('authForm');
const buscarBtn = document.getElementById('buscar-btn'); // Captura o botão para desabilitar

let currentCaptchaText = '';

// Função para gerar um código CAPTCHA aleatório (6 caracteres)
function function generateCaptcha() {
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

    // Captura os dados de entrada (todos os campos são obrigatórios via HTML 'required')
    const codigo = document.getElementById('codigo').value.trim();
    const data = document.getElementById('data').value.trim();
    const hora = document.getElementById('hora').value.trim();
    const validationCode = document.getElementById('validation_code').value.trim().toLowerCase();
    
    // Desabilita o botão para evitar cliques duplos durante o processamento
    buscarBtn.disabled = true;

    messageElement.textContent = 'Buscando...';
    messageElement.style.color = 'black';

    // 1. Verificação do CAPTCHA
    if (validationCode !== currentCaptchaText) {
        messageElement.style.color = 'red';
        messageElement.textContent = 'Arquivo não encontrado, verifique as informações e tente novamente!';
        displayNewCaptcha(); 
        buscarBtn.disabled = false; // Habilita o botão após falha
        return;
    }

    // A lógica de verificação dos campos Data/Hora deve ser feita no Worker
    // Mas como o Worker só verifica o 'code', a falha do usuário será tratada abaixo

    // 2. Chamada ao Cloudflare Worker (API)
    const apiCallUrl = `${WORKER_URL}?code=${codigo}`;

    fetch(apiCallUrl)
        .then(response => {
            if (response.ok && response.redirected) {
                // SUCESSO na autenticação (o Worker encontrou o código)

                // 2.1. Exibe a mensagem de sucesso (verde)
                messageElement.style.color = 'green';
                messageElement.textContent = 'Documento Autenticado!';
                
                // 2.2. Atraso de 2 segundos antes de liberar o download
                setTimeout(() => {
                    // Abre o PDF em uma nova aba
                    window.open(response.url, '_blank'); 
                    messageElement.textContent = 'Documento Autenticado! Download liberado.';
                    displayNewCaptcha(); // Novo CAPTCHA
                    buscarBtn.disabled = false; // Habilita o botão
                }, 2000); // 2000 milissegundos = 2 segundos

            } else {
                // FALHA na autenticação (código inválido ou erro do Worker)
                response.text().then(text => {
                    messageElement.style.color = 'red';
                    // Mensagem de erro padrão conforme solicitado
                    messageElement.textContent = 'Arquivo não encontrado, verifique as informações e tente novamente!';
                });
                displayNewCaptcha(); // Novo CAPTCHA após o erro
                buscarBtn.disabled = false; // Habilita o botão
            }
        })
        .catch(error => {
            // ERRO de Conexão com o servidor
            messageElement.style.color = 'red';
            messageElement.textContent = 'Erro de conexão com o servidor de autenticação.';
            console.error('Fetch error:', error);
            displayNewCaptcha();
            buscarBtn.disabled = false; // Habilita o botão
        });
});
