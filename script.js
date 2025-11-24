// A URL FINAL e CORRETA do seu Worker
const WORKER_URL = 'https://api.autenticacaohistoricoufam.com.br'; 

// Elementos HTML
const messageElement = document.getElementById('message');
const authForm = document.getElementById('authForm');
const buscarBtn = document.getElementById('buscar-btn');

// Listener do Formulário
authForm.addEventListener('submit', function(event) {
    event.preventDefault();

    // Captura apenas o Código (Data/Hora são apenas visuais para o usuário)
    const codigo = document.getElementById('codigo').value.trim();
    
    // Inicia o processamento
    buscarBtn.disabled = true;
    messageElement.textContent = 'Buscando...';
    messageElement.style.color = 'black';

    // 1. Chamada ao Cloudflare Worker (API)
    const apiCallUrl = `${WORKER_URL}?code=${codigo}`;

    fetch(apiCallUrl)
        .then(response => {
            if (response.ok && response.redirected) {
                // SUCESSO na autenticação (o Worker encontrou o código)

                // Exibe a mensagem de sucesso (verde)
                messageElement.style.color = 'green';
                messageElement.textContent = 'Documento Autenticado!';
                
                // Atraso de 2 segundos antes de liberar o download
                setTimeout(() => {
                    // Abre o PDF em uma nova aba
                    window.open(response.url, '_blank'); 
                    messageElement.textContent = 'Documento Autenticado! Download liberado.';
                    buscarBtn.disabled = false; // Habilita o botão
                }, 2000); // 2000 milissegundos = 2 segundos

            } else {
                // FALHA na autenticação (código inválido ou erro do Worker)
                messageElement.style.color = 'red';
                // Mensagem de erro padrão conforme solicitado
                messageElement.textContent = 'Arquivo não encontrado, verifique as informações e tente novamente!';
                
                buscarBtn.disabled = false; // Habilita o botão
            }
        })
        .catch(error => {
            // ERRO de Conexão com o servidor
            messageElement.style.color = 'red';
            messageElement.textContent = 'Erro de conexão com o servidor de autenticação.';
            console.error('Fetch error:', error);
            
            buscarBtn.disabled = false; // Habilita o botão
        });
});
