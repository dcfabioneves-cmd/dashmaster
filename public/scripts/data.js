// ===== DATA MANAGER (Client p/ Backend Python) =====

class DataManager {
    constructor() {
        this.cache = new Map();
        this.apiBaseUrl = 'http://localhost:8000/api'; // Valor padrão, será atualizado
        this.init();
    }

    init() {
        console.log('📊 DataManager initialized');
        
        // Atualiza configuração se disponível
        this.updateConfig();
    }

    /**
     * Atualiza configuração a partir de AppConfig
     */
    updateConfig() {
        if (window.AppConfig) {
            this.apiBaseUrl = window.AppConfig.API.BASE_URL || this.apiBaseUrl;
            console.log(`📡 Configuração atualizada: ${this.apiBaseUrl}`);
        } else if (window.CONFIG) {
            // Fallback para configuração antiga
            this.apiBaseUrl = window.CONFIG.API_BASE_URL || this.apiBaseUrl;
            console.log(`📡 Usando configuração fallback: ${this.apiBaseUrl}`);
        }
    }

    /**
     * Busca dados processados do backend Python
     * @param {string} spreadsheetUrl - URL da planilha do Google
     * @param {string[]} categories - Lista de categorias (ex: ['email', 'social'])
     * @returns {Promise<Object>} Dados processados
     */
    async loadData(spreadsheetUrl, categories) {
        console.log(`📡 Conectando ao backend Python para processar:`, categories);

        try {
            // Atualiza configuração antes da requisição
            this.updateConfig();

            // Verifica cache simples para evitar requisições repetidas rápidas
            const cacheKey = `${spreadsheetUrl}-${categories.join(',')}`;
            const cachedData = this.getCachedData(cacheKey);
            if (cachedData) {
                return cachedData;
            }

            // Prepara URL da API corretamente
            const apiUrl = this.buildApiUrl('/process-data');
            
            // 1. Prepara a requisição para o FastAPI
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: this.getRequestHeaders(),
                body: JSON.stringify({
                    spreadsheet_url: spreadsheetUrl,
                    categories: categories
                })
            });

            // 2. Verifica erros HTTP
            if (!response.ok) {
                await this.handleResponseError(response);
            }

            // 3. Processa a resposta do Python
            const result = await response.json();

            if (result.status === 'success') {
                console.log('🐍 Dados recebidos e processados pelo Pandas com sucesso');
                
                // Processa insights de IA
                this.processAIInsights(result.ai_insights);
                
                // Salva no cache
                this.cacheData(cacheKey, result.data);
                
                // Retorna os dados formatados
                return result.data;
            } else {
                throw new Error('O backend retornou um status de erro.');
            }

        } catch (error) {
            console.error('❌ Falha na comunicação com o Python:', error);
            
            // FALLBACK: Se o servidor Python não estiver rodando, usa dados simulados
            console.warn('⚠️ O backend parece offline. Usando gerador de dados simulados (Fallback).');
            return await this.generateMockDataPromise(categories);
        }
    }

    /**
     * Constrói URL da API corretamente
     * @param {string} endpoint - Endpoint da API
     * @returns {string} URL completa
     */
    buildApiUrl(endpoint) {
        let baseUrl = this.apiBaseUrl;
        
        // Remove barras duplicadas
        baseUrl = baseUrl.replace(/\/+$/, '');
        
        // Adiciona barra antes do endpoint se necessário
        endpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
        
        return `${baseUrl}${endpoint}`;
    }

    /**
     * Obtém headers da requisição
     * @returns {Object} Headers da requisição
     */
    getRequestHeaders() {
        const headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };

        // Adiciona token de autenticação se disponível
        if (window.authManager && window.authManager.isAuthenticated()) {
            const authHeaders = window.authManager.getAuthHeaders();
            Object.assign(headers, authHeaders);
        }

        return headers;
    }

    /**
     * Obtém dados do cache
     * @param {string} cacheKey - Chave do cache
     * @returns {Object|null} Dados em cache ou null
     */
    getCachedData(cacheKey) {
        if (this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            // Verifica se o cache ainda é válido (5 minutos)
            if (Date.now() - (cached.timestamp || 0) < 5 * 60 * 1000) {
                console.log('⚡ Retornando dados do cache local');
                return cached.data;
            } else {
                // Cache expirado, remove
                this.cache.delete(cacheKey);
            }
        }
        return null;
    }

    /**
     * Salva dados no cache
     * @param {string} cacheKey - Chave do cache
     * @param {Object} data - Dados para cache
     */
    cacheData(cacheKey, data) {
        this.cache.set(cacheKey, {
            data: data,
            timestamp: Date.now()
        });
        
        // Limita tamanho do cache
        if (this.cache.size > 20) {
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }
    }

    /**
     * Processa insights de IA da resposta
     * @param {Object} aiInsights - Insights de IA
     */
    processAIInsights(aiInsights) {
        if (aiInsights && window.AppState) {
            window.AppState.aiInsights = aiInsights;
            console.log('🤖 IA Insights recebidos:', Object.keys(aiInsights).length, 'categorias');
        }
    }

    /**
     * Trata erros de resposta HTTP
     * @param {Response} response - Resposta HTTP
     */
    async handleResponseError(response) {
        let errorMessage = `Erro HTTP: ${response.status}`;
        
        try {
            const errorData = await response.json();
            errorMessage = errorData.detail || errorData.message || errorMessage;
            
            // Tratamento específico para erros comuns
            if (response.status === 401) {
                errorMessage = 'Autenticação expirada. Faça login novamente.';
                // Força logout se token inválido
                if (window.authManager) {
                    window.authManager.logout();
                }
            } else if (response.status === 403) {
                errorMessage = 'Acesso negado. Permissões insuficientes.';
            } else if (response.status === 404) {
                errorMessage = 'Endpoint não encontrado. Verifique a configuração da API.';
            } else if (response.status === 500) {
                errorMessage = 'Erro interno do servidor. Tente novamente mais tarde.';
            }
        } catch (jsonError) {
            console.warn('Não foi possível parsear resposta de erro:', jsonError);
        }
        
        throw new Error(errorMessage);
    }

    // --- MÉTODOS DE FALLBACK (Mantidos para segurança) ---

    /**
     * Gera dados simulados (fallback)
     * @param {string[]} categories - Categorias
     * @returns {Promise<Object>} Dados simulados
     */
    async generateMockDataPromise(categories) {
        return new Promise(resolve => {
            setTimeout(() => {
                const mockData = {};
                categories.forEach(cat => {
                    mockData[cat] = this.generateMockCategoryData(cat);
                });
                resolve(mockData);
            }, 800);
        });
    }

    /**
     * Gera dados simulados para uma categoria
     * @param {string} category - Categoria
     * @returns {Array} Dados simulados
     */
    generateMockCategoryData(category) {
        const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'];
        
        // Configurações específicas por categoria
        const categoryConfigs = {
            'email': {
                fields: [
                    { key: 'taxa_abertura', min: 10, max: 40, suffix: '%' },
                    { key: 'taxa_cliques', min: 1, max: 6, suffix: '%' },
                    { key: 'taxa_conversao', min: 0.5, max: 3.5, suffix: '%' },
                    { key: 'taxa_rejeicao', min: 0, max: 10, suffix: '%' },
                    { key: 'investimento', min: 1000, max: 6000, prefix: 'R$ ' }
                ]
            },
            'social': {
                fields: [
                    { key: 'engajamento', min: 100, max: 1100 },
                    { key: 'alcance', min: 1000, max: 11000 },
                    { key: 'seguidores', min: 500, max: 5500 },
                    { key: 'taxa_roas', min: 1, max: 11, suffix: 'x' },
                    { key: 'investimento', min: 800, max: 5800, prefix: 'R$ ' }
                ]
            },
            'ads': {
                fields: [
                    { key: 'cpc', min: 0.5, max: 5.5, prefix: 'R$ ' },
                    { key: 'ctr', min: 0.5, max: 5.5, suffix: '%' },
                    { key: 'conversoes', min: 10, max: 110 },
                    { key: 'roas', min: 1, max: 11, suffix: 'x' },
                    { key: 'investimento', min: 1500, max: 6500, prefix: 'R$ ' }
                ]
            }
        };

        const config = categoryConfigs[category] || categoryConfigs.email;

        return months.map(month => {
            const data = {};
            
            config.fields.forEach(field => {
                let value = (Math.random() * (field.max - field.min)) + field.min;
                value = parseFloat(value.toFixed(2));
                
                // Formata o valor
                let formattedValue = value;
                if (field.prefix) formattedValue = field.prefix + formattedValue;
                if (field.suffix) formattedValue = formattedValue + field.suffix;
                
                data[field.key] = formattedValue;
            });

            return {
                'Mês': month,
                'data': data
            };
        });
    }

    /**
     * Limpa cache de dados
     * @param {string} [cacheKey] - Chave específica para limpar (opcional)
     */
    clearCache(cacheKey = null) {
        if (cacheKey) {
            this.cache.delete(cacheKey);
            console.log(`🧹 Cache limpo para chave: ${cacheKey}`);
        } else {
            this.cache.clear();
            console.log('🧹 Cache completamente limpo');
        }
    }

    /**
     * Obtém estatísticas do cache
     * @returns {Object} Estatísticas do cache
     */
    getCacheStats() {
        return {
            size: this.cache.size,
            entries: Array.from(this.cache.entries()).map(([key, value]) => ({
                key: key,
                timestamp: new Date(value.timestamp).toLocaleTimeString(),
                dataSize: JSON.stringify(value.data).length
            }))
        };
    }
}

// ===== INSTANCIAÇÃO E EXPORTAÇÃO =====

// Instanciação global
window.DataManager = DataManager;

// Cria instância global
if (!window.dataManager) {
    window.dataManager = new DataManager();
    console.log('✅ DataManager instanciado globalmente');
}

// Atualiza configuração quando AppConfig estiver disponível
if (window.AppConfig) {
    window.dataManager.updateConfig();
}

// Export para módulos ES6 (se aplicável)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DataManager;
}

console.log('📊 DataManager carregado e pronto para comunicação com Python Backend');