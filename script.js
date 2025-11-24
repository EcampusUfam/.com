// A URL FINAL e CORRETA do seu Worker
const WORKER_URL = 'https://api.autenticacaohistoricoufam.com.br'; 

// Elementos HTML
const messageElement = document.getElementById('message');
const authForm = document.getElementById('authForm');
const buscarBtn = document.getElementById('buscar-btn');
const inputData = document.getElementById('data');
const inputHora = document.getElementById('hora');

// --- Funções de Máscara (Formatação Automática) ---

// Máscara para Data (DD/MM/AAAA)
function maskDate(value) {
    // Remove tudo que não for dígito
    value = value.replace(/\D/g, "");
    // Adiciona a barra (/) após o 2º e 4º dígito
    value = value.replace(/(\d{2})(\d)/, "$1/$2");
    value = value.replace(/(\d{2})\/(\d{2})(\d)/, "$1/$2/$3");
    // Limita o tamanho para 10 caracteres (DD/MM/AAAA)
    if (value.length > 10) {
        value = value.substring(0, 10);
    }
    return value;
}

// Máscara para Hora (HH:MM:SS)
function maskTime(value) {
    // Remove tudo que não for dígito
    value = value.replace(/\D/g, "");
    // Adiciona os dois pontos (:) após o 2º e 4º dígito
    value = value.replace(/(\d{2})(\d)/, "$1:$2");
    value = value.replace(/(\d{2}):(\d{2})(\d)/, "$1:$2:$3");
    // Limita o tamanho para 8 caracteres (HH:MM:SS)
    if (value.length > 8) {
        value = value.substring(0, 8);
    }
    return value;
}

// Aplica as máscaras aos eventos de input
inputData.addEventListener('input', function(e) {
    e.target.value = maskDate(e.target.value);
});

inputHora.addEventListener('input', function(e) {
    e.target.value = maskTime(e.target.value);
});

// --- Lógica de Autenticação ---

authForm.addEventListener('submit', function(event) {
    event.preventDefault();

    // Captura o Código. Campos Data e Hora são formatados e obrigatórios (via HTML 'required').
    const codigo = document.getElementById('codigo').value.trim();
    
    buscarBtn.disabled = true;
    messageElement.textContent = 'Buscando...';
    messageElement.style.color = 'black';

    // Chamada ao Cloudflare Worker (API)
    const apiCallUrl = `${WORKER_URL}?code=${codigo}`;

    fetch(apiCallUrl)
        .then(response => {
            if (response.ok && response.redirected) {
                // SUCESSO: O Worker encontrou o código.

                messageElement.style.color = 'green';
                messageElement.textContent = 'Documento Autenticado!';
                
                // Atraso de 2 segundos antes de liberar o download
                setTimeout(() => {
                    window.open(response.url, '_blank'); 
                    messageElement.textContent = 'Documento Autenticado! Download liberado.';
                    buscarBtn.disabled = false;
                }, 2000); 

            } else {
                // FALHA: Código inválido, não encontrado ou erro do Worker.
                messageElement.style.color = 'red';
                messageElement.textContent = 'Arquivo não encontrado, verifique as informações e tente novamente!';
                
                buscarBtn.disabled = false;
            }
        })
        .catch(error => {
            // ERRO de Conexão: O Worker não está acessível.
            messageElement.style.color = 'red';
            messageElement.textContent = 'Erro de conexão com o servidor de autenticação.';
            console.error('Fetch error:', error);
            
            buscarBtn.disabled = false;
        });
});
