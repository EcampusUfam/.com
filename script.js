document.getElementById('authForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const codigo = document.getElementById('codigo').value.trim();
    const validationCode = document.getElementById('validation_code').value.trim().toLowerCase();
    const messageElement = document.getElementById('message');
    
    // Configurações
    // Sua URL do Worker, usando o nome 'auth-api' que definimos.
    const WORKER_URL = 'https://auth-api.gabriel-navarro-rn7.workers.dev'; 
    const captchaText = "9zjicg"; // O texto que está na imagem simulada (sem espaços)

    messageElement.textContent = 'Buscando...';

    // 1. Verificação do CAPTCHA
    if (validationCode !== captchaText) {
        messageElement.style.color = 'red';
        messageElement.textContent = 'Código de Validação incorreto. Tente novamente.';
        return;
    }

    // 2. Chamada ao Cloudflare Worker
    // Construímos a URL para o Worker, passando o código como parâmetro
    // Ex: https://auth-api.gabriel-navarro-rn7.workers.dev?code=75fbf6cbf6
    const apiCallUrl = `${WORKER_URL}?code=${codigo}`;

    fetch(apiCallUrl)
        .then(response => {
            if (response.ok && response.redirected) {
                // Sucesso: O Worker liberou o download.
                messageElement.style.color = 'green';
                messageElement.textContent = 'Documento autenticado! O download começará em breve ou clique no link abaixo.';
                
                // Abre o arquivo em uma nova aba para iniciar o download
                window.open(response.url, '_blank'); 

            } else if (!response.ok) {
                // Falha: O Worker retornou um erro (código inválido ou erro interno).
                response.text().then(text => {
                    messageElement.style.color = 'red';
                    // Mostra a mensagem de erro que veio do Worker (se o código não for encontrado)
                    messageElement.textContent = text || 'Falha na autenticação. Código ou dados inválidos.';
                });
            } else {
                messageElement.style.color = 'red';
                messageElement.textContent = 'Ocorreu um erro inesperado na comunicação.';
            }
        })
        .catch(error => {
            messageElement.style.color = 'red';
            messageElement.textContent = 'Erro de conexão com o servidor de autenticação.';
            console.error('Fetch error:', error);
        });
});