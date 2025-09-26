// URL da API que vamos consumir (agora apontando para o servidor online)
const apiUrl = 'https://proxy-vtex-status.onrender.com/api/status'; // <-- IMPORTANTE: Substitua pela URL real do seu backend na Render!

// Elementos do HTML que vamos manipular
const statusGeralEl = document.getElementById('status-geral');
const componentesListaEl = document.getElementById('componentes-lista');

// Função para mapear o status da API para as classes CSS e texto traduzido
function getStatusInfo(status) {
    switch (status) {
        case 'operational':
            return {
                text: 'Operacional',
                cssClass: 'status-operational'
            };
        case 'degraded_performance':
            return {
                text: 'Performance Degradada',
                cssClass: 'status-degraded_performance'
            };
        case 'partial_outage':
            return {
                text: 'Indisponibilidade Parcial',
                cssClass: 'status-partial_outage'
            };
        case 'major_outage':
            return {
                text: 'Indisponibilidade Total',
                cssClass: 'status-major_outage'
            };
        default:
            return {
                text: status.replace('_', ' ').toUpperCase(),
                cssClass: ''
            };
    }
}

// Função principal que busca e renderiza os dados
async function fetchStatus() {
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        // 1. Atualizar o Status Geral
        const statusGeralInfo = getStatusInfo(data.status.indicator);
        statusGeralEl.className = `status-box ${statusGeralInfo.cssClass}`;
        statusGeralEl.querySelector('.description').textContent = data.status.description;

        // Limpa a lista de componentes antes de adicionar os novos
        componentesListaEl.innerHTML = ''; 
        
        // 2. Renderizar cada Componente de Serviço
        data.components.forEach(componente => {
            // Ignorar componentes que são "pais" de outros
            if (!componente.group) {
                const statusComponenteInfo = getStatusInfo(componente.status);

                // Cria o HTML para cada item da lista
                const componenteHtml = `
                    <div class="componente">
                        <span class="componente-nome">${componente.name}</span>
                        <span class="componente-status ${statusComponenteInfo.cssClass}">
                            ${statusComponenteInfo.text}
                        </span>
                    </div>
                `;
                // Adiciona o HTML criado na lista principal
                componentesListaEl.insertAdjacentHTML('beforeend', componenteHtml);
            }
        });

    } catch (error) {
        console.error("Falha ao buscar dados da API:", error);
        statusGeralEl.querySelector('.description').textContent = 'Não foi possível carregar o status.';
        statusGeralEl.className = 'status-box status-major_outage';
    }
}

// Chama a função para buscar os dados assim que a página carregar
fetchStatus();

// (Opcional) Atualiza os dados a cada 5 minutos (300000 milissegundos)
setInterval(fetchStatus, 300000);
