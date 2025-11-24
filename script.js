document.getElementById('authForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const codigo = document.getElementById('codigo').value.trim();
    const validationCode = document.getElementById('validation_code').value.trim().toLowerCase();
    const messageElement = document.getElementById('message');
    
    // Configurações
    // URL FINAL do seu Worker, usando o subdomínio oficial do seu site.
    const WORKER_URL = 'https://api.autenticacaohistoricoufam.com.br'; 
    
    // O texto exato da imagem CAPTCHA
    const captchaText = "9zjicg"; 

    messageElement.textContent = 'Buscando...';

    // 1. Verificação do CAPTCHA
    if (validationCode !== captchaText) {
        messageElement.style.color = 'red';
        messageElement.textContent = 'Código de Validação incorreto. Tente novamente.';
        return;
    }

    // 2. Chamada ao Cloudflare Worker
    // Ex: https://api.autenticacaohistoricoufam.com.br?code=75fbf6cbf6
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
                // Falha: O Worker retornou um erro (código inválido).
                response.text().then(text => {
                    messageElement.style.color = 'red';
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
