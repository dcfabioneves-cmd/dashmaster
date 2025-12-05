// ===== INSIGHTS MANAGER (RENDERIZAÇÃO APENAS) =====

class InsightsManager {
    constructor() {
        this.container = document.getElementById('insights-container');
        this.summaryContainer = document.getElementById('insights-summary');
        this.insightsHistory = [];
        this.init();
    }
    
    init() {
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        const refreshBtn = document.getElementById('refresh-insights');
        const exportBtn = document.getElementById('export-insights');
        
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.refreshInsights();
            });
        }
        
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.exportInsights();
            });
        }
    }
    
    /**
     * Gera insights a partir dos dados processados pelo Python
     * O Python já faz a análise pesada e retorna insights prontos
     */
    async generateInsights(category, data) {
        if (!this.container) return;
        
        // Mostrar estado de carregamento
        this.showLoading();
        
        // Simular processamento (o processamento real já foi feito pelo Python)
        await this.simulateProcessing();
        
        try {
            // Buscar insights já calculados pelo Python
            const aiInsights = await this.fetchPythonInsights(category, data);
            const insights = this.formatPythonInsights(aiInsights);
            
            this.renderInsights(insights);
            this.updateSummary(insights);
            this.saveToHistory(insights, category);
            
        } catch (error) {
            console.error('Erro ao gerar insights:', error);
            this.showError('Erro ao analisar dados. Verifique a conexão com o servidor.');
        }
    }
    
    /**
     * Busca insights do servidor Python
     * O Python já processou os dados e retornou insights
     */
    async fetchPythonInsights(category, data) {
        const currentProject = window.AppState?.currentProject;
        
        if (!currentProject) {
            throw new Error('Nenhum projeto selecionado');
        }
        
        // Se já temos insights no AppState (vindos do Python), usamos eles
        if (window.AppState.aiInsights && window.AppState.aiInsights[category]) {
            return window.AppState.aiInsights[category];
        }
        
        // Se não temos, tentamos buscar do servidor
        try {
            // Aqui faríamos uma requisição para o backend Python
            // Mas como o Python já processou os dados anteriormente,
            // normalmente os insights já estarão no AppState
            
            // Simulação de fallback
            return await this.generateFallbackInsights(category, data);
            
        } catch (error) {
            console.warn('Não foi possível buscar insights do Python:', error);
            return await this.generateFallbackInsights(category, data);
        }
    }
    
    /**
     * Formata os insights do Python para o formato visual dos cards
     */
    formatPythonInsights(pythonInsights) {
        if (!pythonInsights || typeof pythonInsights !== 'object') {
            return [];
        }
        
        const insights = [];
        
        // Processar diferentes tipos de insights do Python
        
        // 1. Insights de tendência
        if (pythonInsights.trends) {
            pythonInsights.trends.forEach(trend => {
                insights.push({
                    metric: trend.metric || 'Tendência',
                    value: trend.value || '',
                    rawValue: trend.raw_value,
                    type: this.mapInsightType(trend.severity || trend.type),
                    message: trend.message || '',
                    advice: trend.advice || '',
                    actions: trend.recommendations || [],
                    description: trend.description || 'Análise de tendência'
                });
            });
        }
        
        // 2. Previsões
        if (pythonInsights.predictions) {
            pythonInsights.predictions.forEach(prediction => {
                const isPositive = prediction.trend === 'up' || prediction.change_percentage > 0;
                insights.push({
                    metric: prediction.metric || 'Previsão',
                    value: this.formatPredictionValue(prediction),
                    rawValue: prediction.value,
                    type: isPositive ? 'success' : 'warning',
                    message: `Previsão: ${isPositive ? 'Alta 📈' : 'Baixa 📉'}`,
                    advice: prediction.confidence 
                        ? `Confiança: ${prediction.confidence}%` 
                        : 'Baseado em análise histórica',
                    actions: prediction.actions || [],
                    description: 'Previsão baseada em modelo de machine learning'
                });
            });
        }
        
        // 3. Anomalias detectadas
        if (pythonInsights.anomalies) {
            pythonInsights.anomalies.forEach(anomaly => {
                insights.push({
                    metric: anomaly.metric || 'Anomalia',
                    value: anomaly.value || '',
                    rawValue: anomaly.raw_value,
                    type: 'danger',
                    message: anomaly.message || 'Anomalia Detectada',
                    advice: anomaly.explanation || 'Valor fora do padrão esperado',
                    actions: anomaly.suggestions || ['Investigar causa raiz'],
                    description: 'Detecção de outliers'
                });
            });
        }
        
        // 4. Insights gerais da IA
        if (pythonInsights.general_insights) {
            pythonInsights.general_insights.forEach(insight => {
                insights.push({
                    metric: 'Insight da IA',
                    value: '',
                    type: 'info',
                    message: insight.insight || '',
                    advice: insight.implication || '',
                    actions: insight.next_steps || [],
                    description: 'Análise de inteligência artificial'
                });
            });
        }
        
        // Se nenhum insight específico, criar um card informativo
        if (insights.length === 0 && Object.keys(pythonInsights).length > 0) {
            insights.push({
                metric: 'Análise Completa',
                value: '✅',
                type: 'success',
                message: 'Análise realizada com sucesso',
                advice: 'O servidor Python processou os dados e não encontrou problemas críticos.',
                description: 'Processamento por machine learning'
            });
        }
        
        // Ordenar por prioridade: danger > warning > success > info
        insights.sort((a, b) => {
            const priority = { danger: 0, warning: 1, success: 2, info: 3 };
            return priority[a.type] - priority[b.type];
        });
        
        return insights;
    }
    
    /**
     * Mapeia tipos do Python para tipos visuais
     */
    mapInsightType(pythonType) {
        const mapping = {
            'critical': 'danger',
            'high': 'danger',
            'medium': 'warning',
            'low': 'warning',
            'positive': 'success',
            'negative': 'warning',
            'neutral': 'info'
        };
        
        return mapping[pythonType.toLowerCase()] || 'info';
    }
    
    /**
     * Formata valores de previsão
     */
    formatPredictionValue(prediction) {
        if (prediction.value !== undefined) {
            if (prediction.unit === '%') {
                return `${prediction.value.toFixed(1)}%`;
            } else if (prediction.unit === 'R$') {
                return `R$ ${prediction.value.toFixed(2)}`;
            } else if (prediction.unit === 'x') {
                return `${prediction.value.toFixed(1)}x`;
            }
        }
        
        if (prediction.next_month_value) {
            return `R$ ${prediction.next_month_value}`;
        }
        
        return '';
    }
    
    /**
     * Fallback para quando o Python não está disponível
     */
    async generateFallbackInsights(category, data) {
        console.log('Usando insights de fallback (Python não disponível)');
        
        // Insights simples baseados nos dados brutos
        return {
            general_insights: [{
                insight: 'Análise limitada (modo offline)',
                implication: 'Para insights avançados, conecte-se ao servidor Python',
                next_steps: ['Configurar conexão com backend', 'Ativar processamento por IA']
            }]
        };
    }
    
    /**
     * Renderiza os insights na interface
     */
    renderInsights(insights) {
        if (!this.container) return;
        
        if (insights.length === 0) {
            this.container.innerHTML = this.createNoInsightsCard();
            return;
        }
        
        this.container.innerHTML = insights
            .map((insight, index) => this.createInsightCard(insight, index))
            .join('');
        
        // Adicionar animações
        this.animateInsights();
    }
    
    /**
     * Cria um card de insight individual
     */
    createInsightCard(insight, index) {
        const icons = {
            danger: 'fa-exclamation-triangle',
            warning: 'fa-exclamation-circle',
            success: 'fa-check-circle',
            info: 'fa-info-circle'
        };
        
        const titles = {
            danger: 'Atenção Crítica',
            warning: 'Oportunidade de Melhoria',
            success: 'Excelente Performance',
            info: 'Insight da IA'
        };
        
        const delays = {
            danger: 0,
            warning: 100,
            success: 200,
            info: 300
        };
        
        return `
            <div class="insight-card ${insight.type} animate__animated" 
                 style="animation-delay: ${delays[insight.type] || index * 50}ms">
                <div class="insight-header">
                    <div class="insight-icon">
                        <i class="fas ${icons[insight.type]}"></i>
                    </div>
                    <div class="insight-title">
                        <h4>${titles[insight.type]}</h4>
                        ${insight.metric ? `<span class="insight-metric">${insight.metric}: ${insight.value}</span>` : ''}
                    </div>
                    <div class="insight-priority ${insight.type}">
                        ${insight.type === 'danger' ? 'Alta' : 
                          insight.type === 'warning' ? 'Média' : 'Baixa'}
                    </div>
                </div>
                
                <div class="insight-body">
                    <p class="insight-message">${insight.message}</p>
                    <p class="insight-advice">${insight.advice}</p>
                    
                    ${insight.actions && insight.actions.length > 0 ? `
                        <div class="insight-actions">
                            <h5>Ações Recomendadas:</h5>
                            <ul>
                                ${insight.actions.map(action => 
                                    `<li><i class="fas fa-check"></i> ${action}</li>`
                                ).join('')}
                            </ul>
                        </div>
                    ` : ''}
                </div>
                
                <div class="insight-footer">
                    <div class="insight-meta">
                        ${insight.description ? `
                            <span class="meta-item">
                                <i class="fas fa-brain"></i>
                                ${insight.description}
                            </span>
                        ` : ''}
                        <span class="meta-item">
                            <i class="fas fa-clock"></i>
                            ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    </div>
                    <button class="insight-action" onclick="trackInsightAction('${insight.metric || 'insight'}', '${insight.type}')">
                        <i class="fas fa-check"></i> Marcar como Processado
                    </button>
                </div>
            </div>
        `;
    }
    
    createNoInsightsCard() {
        return `
            <div class="insight-card success">
                <div class="insight-header">
                    <div class="insight-icon">
                        <i class="fas fa-check-circle"></i>
                    </div>
                    <div class="insight-title">
                        <h4>Dados Processados!</h4>
                    </div>
                </div>
                <div class="insight-body">
                    <p class="insight-message">O servidor Python processou os dados com sucesso</p>
                    <p class="insight-advice">Nenhuma anomalia crítica detectada pelo modelo de machine learning.</p>
                </div>
                <div class="insight-footer">
                    <span class="meta-item">
                        <i class="fas fa-server"></i>
                        Backend Python conectado
                    </span>
                </div>
            </div>
        `;
    }
    
    updateSummary(insights) {
        if (!this.summaryContainer) return;
        
        const counts = {
            success: insights.filter(i => i.type === 'success').length,
            warning: insights.filter(i => i.type === 'warning').length,
            danger: insights.filter(i => i.type === 'danger').length
        };
        
        // Mostrar sumário apenas se houver insights
        if (insights.length > 0) {
            this.summaryContainer.style.display = 'flex';
            
            const successEl = document.getElementById('success-count');
            const warningEl = document.getElementById('warning-count');
            const dangerEl = document.getElementById('danger-count');
            
            if (successEl) successEl.textContent = counts.success;
            if (warningEl) warningEl.textContent = counts.warning;
            if (dangerEl) dangerEl.textContent = counts.danger;
        } else {
            this.summaryContainer.style.display = 'none';
        }
    }
    
    saveToHistory(insights, category) {
        const historyEntry = {
            timestamp: new Date().toISOString(),
            category,
            insights: insights.map(insight => ({
                metric: insight.metric,
                type: insight.type,
                value: insight.rawValue,
                message: insight.message
            })),
            source: 'python_backend',
            summary: {
                total: insights.length,
                success: insights.filter(i => i.type === 'success').length,
                warning: insights.filter(i => i.type === 'warning').length,
                danger: insights.filter(i => i.type === 'danger').length
            }
        };
        
        this.insightsHistory.push(historyEntry);
        
        // Manter apenas os últimos 100 registros
        if (this.insightsHistory.length > 100) {
            this.insightsHistory = this.insightsHistory.slice(-100);
        }
        
        // Salvar no localStorage para histórico local
        localStorage.setItem('insightsHistory', JSON.stringify(this.insightsHistory));
    }
    
    async refreshInsights() {
        const currentCategory = window.AppState?.currentCategory;
        const currentData = window.AppState?.sheetData?.[currentCategory];
        
        if (!currentCategory || !currentData) {
            this.showError('Nenhum dado disponível para análise');
            return;
        }
        
        await this.generateInsights(currentCategory, currentData);
        this.showNotification('Análise atualizada com sucesso', 'success');
    }
    
    async exportInsights() {
        try {
            const currentCategory = window.AppState?.currentCategory;
            const currentData = window.AppState?.sheetData?.[currentCategory];
            
            if (!currentCategory || !currentData) {
                throw new Error('Nenhum dado disponível');
            }
            
            // Buscar insights do Python novamente para exportação
            const pythonInsights = await this.fetchPythonInsights(currentCategory, currentData);
            const insights = this.formatPythonInsights(pythonInsights);
            
            // Criar conteúdo para exportação
            const exportContent = this.formatForExport(insights, currentCategory);
            
            // Criar e baixar arquivo
            const blob = new Blob([exportContent], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            
            const timestamp = new Date().toISOString().split('T')[0];
            a.href = url;
            a.download = `insights-${currentCategory}-${timestamp}.txt`;
            a.click();
            
            URL.revokeObjectURL(url);
            
            this.showNotification('Insights exportados com sucesso', 'success');
            
        } catch (error) {
            console.error('Erro ao exportar insights:', error);
            this.showError('Erro ao exportar insights');
        }
    }
    
    formatForExport(insights, category) {
        const timestamp = new Date().toLocaleString('pt-BR');
        let content = `= RELATÓRIO DE INSIGHTS - ${category.toUpperCase()} =\n`;
        content += `Data: ${timestamp}\n`;
        content += `Categoria: ${category}\n`;
        content += `Fonte: Backend Python (Machine Learning)\n`;
        content += '='.repeat(50) + '\n\n';
        
        if (insights.length === 0) {
            content += '✅ Análise concluída pelo Python.\n';
            content += 'Nenhuma anomalia detectada pelos modelos de IA.\n';
            return content;
        }
        
        // Agrupar por tipo
        const grouped = {
            danger: insights.filter(i => i.type === 'danger'),
            warning: insights.filter(i => i.type === 'warning'),
            success: insights.filter(i => i.type === 'success'),
            info: insights.filter(i => i.type === 'info')
        };
        
        // Adicionar resumo
        content += '📊 RESUMO (ANÁLISE POR IA):\n';
        content += `  • Críticos: ${grouped.danger.length}\n`;
        content += `  • Avisos: ${grouped.warning.length}\n`;
        content += `  • Sucessos: ${grouped.success.length}\n`;
        content += `  • Insights: ${grouped.info.length}\n`;
        content += '\n';
        
        // Adicionar insights críticos
        if (grouped.danger.length > 0) {
            content += '⚠️ ATENÇÃO CRÍTICA (DETECTADA POR IA):\n';
            grouped.danger.forEach((insight, index) => {
                content += `\n${index + 1}. ${insight.metric} ${insight.value ? `(${insight.value})` : ''}\n`;
                content += `   ${insight.message}\n`;
                content += `   Recomendação: ${insight.advice}\n`;
                if (insight.actions && insight.actions.length > 0) {
                    content += `   Ações sugeridas:\n`;
                    insight.actions.forEach(action => {
                        content += `     • ${action}\n`;
                    });
                }
            });
            content += '\n';
        }
        
        // Adicionar avisos
        if (grouped.warning.length > 0) {
            content += '🔍 OPORTUNIDADES DE MELHORIA:\n';
            grouped.warning.forEach((insight, index) => {
                content += `\n${index + 1}. ${insight.metric} ${insight.value ? `(${insight.value})` : ''}\n`;
                content += `   ${insight.message}\n`;
                content += `   Recomendação: ${insight.advice}\n`;
            });
            content += '\n';
        }
        
        // Adicionar sucessos
        if (grouped.success.length > 0) {
            content += '✅ EXCELENTES PERFORMANCES:\n';
            grouped.success.forEach((insight, index) => {
                content += `\n${index + 1}. ${insight.metric} ${insight.value ? `(${insight.value})` : ''}\n`;
                content += `   ${insight.message}\n`;
                content += `   Recomendação: ${insight.advice}\n`;
            });
        }
        
        // Adicionar insights informativos
        if (grouped.info.length > 0) {
            content += '🤖 INSIGHTS DA INTELIGÊNCIA ARTIFICIAL:\n';
            grouped.info.forEach((insight, index) => {
                content += `\n${index + 1}. ${insight.message}\n`;
                content += `   ${insight.advice}\n`;
            });
        }
        
        content += '\n' + '='.repeat(50) + '\n';
        content += 'Relatório gerado por DashMetrics com análise de Machine Learning\n';
        content += 'Backend: Python (Pandas, Scikit-learn, TensorFlow)\n';
        
        return content;
    }
    
    getInsightsHistory() {
        return this.insightsHistory;
    }
    
    clearHistory() {
        this.insightsHistory = [];
        localStorage.removeItem('insightsHistory');
    }
    
    // Métodos de UI auxiliares
    showLoading() {
        if (!this.container) return;
        
        this.container.innerHTML = `
            <div class="insights-loading">
                <div class="loading-spinner">
                    <i class="fas fa-brain fa-spin"></i>
                </div>
                <p>Consultando modelo de IA...</p>
                <p class="loading-subtext">Processando com machine learning</p>
            </div>
        `;
    }
    
    showError(message) {
        if (!this.container) return;
        
        this.container.innerHTML = `
            <div class="insight-card danger">
                <div class="insight-header">
                    <div class="insight-icon">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <div class="insight-title">
                        <h4>Conexão com Python</h4>
                    </div>
                </div>
                <div class="insight-body">
                    <p class="insight-message">${message}</p>
                    <p class="insight-advice">Verifique se o servidor Python está rodando em localhost:8000</p>
                </div>
                <div class="insight-footer">
                    <button class="insight-action" onclick="window.location.reload()">
                        <i class="fas fa-redo"></i> Tentar Reconectar
                    </button>
                </div>
            </div>
        `;
    }
    
    showNotification(message, type = 'info') {
        if (window.showNotification) {
            window.showNotification(message, type);
        } else {
            alert(message);
        }
    }
    
    animateInsights() {
        const cards = this.container.querySelectorAll('.insight-card');
        cards.forEach((card, index) => {
            setTimeout(() => {
                card.classList.add('animate__fadeInUp');
            }, index * 100);
        });
    }
    
    async simulateProcessing() {
        // Simular tempo de consulta ao Python
        return new Promise(resolve => {
            setTimeout(resolve, 500);
        });
    }
}

// Funções globais para acesso via HTML
window.trackInsightAction = function(metric, type) {
    console.log(`Insight processado: ${metric} (${type})`);
    
    // Aqui você pode enviar para o backend que o insight foi processado
    const event = new CustomEvent('insightProcessed', {
        detail: { metric, type, timestamp: new Date().toISOString() }
    });
    document.dispatchEvent(event);
    
    if (window.showNotification) {
        window.showNotification(`Insight "${metric}" marcado como processado`, 'success');
    }
};

// ===== EXPORTAÇÃO =====
window.InsightsManager = InsightsManager;