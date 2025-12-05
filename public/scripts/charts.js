// ===== CHART MANAGER - INTEGRAÇÃO COM BACKEND PYTHON =====

class ChartManager {
    constructor() {
        this.charts = new Map();
        this.currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        this.chartColors = this.getChartColors();
        this.init();
        
        // Dicionário para mapeamento de métricas
        this.metricMappings = this.createMetricMappings();
    }
    
    init() {
        this.setupThemeListener();
        this.setupResizeListener();
    }
    
    createMetricMappings() {
        return {
            // Email Marketing
            'taxa_abertura': 'Taxa de Abertura',
            'taxa_cliques': 'Taxa de Cliques',
            'taxa_conversao': 'Taxa de Conversão',
            'taxa_rejeicao': 'Taxa de Rejeição',
            'taxa_bounce': 'Taxa de Bounce',
            
            // Social Media
            'alcance': 'Alcance',
            'engajamento': 'Engajamento',
            'crescimento_seguidores': 'Crescimento Seguidores',
            'ctr': 'CTR',
            'roas': 'ROAS',
            
            // SEO
            'crescimento_trafego': 'Crescimento do Tráfego',
            'ctr_seo': 'CTR SEO',
            'conversoes': 'Conversões',
            'receita': 'Receita',
            
            // E-commerce
            'taxa_conversao_cvr': 'Taxa de Conversão (CVR)',
            'ticket_medio': 'Ticket Médio',
            'cac': 'CAC',
            
            // Google Ads
            'ctr_google': 'CTR GOOGLE',
            'cpc_google': 'CPC GOOGLE',
            'conversoes_google': 'Conversões GOOGLE',
            'roas_google': 'ROAS GOOGLE',
            
            // Meta Ads
            'cpm': 'CPM',
            'ctr_meta': 'CTR',
            'conversoes_meta': 'Conversões',
            'roas_meta': 'ROAS',
            
            // Blog
            'sessoes': 'Sessões',
            'page_views': 'Page Views',
            'tempo_medio_pagina': 'Tempo Médio na Página',
            'leads_convertidos': 'Leads Convertidos'
        };
    }
    
    getChartColors() {
        return {
            light: {
                primary: '#1a73e8',
                secondary: '#34a853',
                tertiary: '#fbbc04',
                quaternary: '#ea4335',
                quinary: '#4285f4',
                grid: '#e0e0e0',
                text: '#202124',
                background: '#ffffff'
            },
            dark: {
                primary: '#8ab4f8',
                secondary: '#81c995',
                tertiary: '#fdd663',
                quaternary: '#f28b82',
                quinary: '#aecbfa',
                grid: '#5f6368',
                text: '#e8eaed',
                background: '#202124'
            }
        };
    }
    
    setupThemeListener() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'data-theme') {
                    this.currentTheme = document.documentElement.getAttribute('data-theme');
                    this.updateAllChartsTheme();
                }
            });
        });
        
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['data-theme']
        });
    }
    
    setupResizeListener() {
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.resizeAllCharts();
            }, 250);
        });
    }
    
    /**
     * Método principal para criar gráficos com dados do backend Python
     */
    createChartFromBackendData(canvasId, chartConfig, backendData) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) {
            console.error(`Canvas não encontrado: ${canvasId}`);
            return null;
        }
        
        // Destruir gráfico existente
        const existingChart = this.charts.get(canvasId);
        if (existingChart) {
            existingChart.destroy();
        }
        
        // Preparar dados do gráfico
        const chartData = this.prepareChartDataFromBackend(backendData, chartConfig);
        
        // Obter opções do gráfico
        const options = this.getChartOptions(chartConfig);
        
        // Criar gráfico
        const chart = new Chart(canvas.getContext('2d'), {
            type: chartConfig.type || 'line',
            data: chartData,
            options: options,
            plugins: [ChartDataLabels]
        });
        
        // Armazenar referência
        this.charts.set(canvasId, chart);
        
        return chart;
    }
    
    /**
     * Prepara dados do backend Python para o Chart.js
     * O backend pode retornar dados em diferentes formatos
     */
    prepareChartDataFromBackend(backendData, chartConfig) {
        const colors = this.chartColors[this.currentTheme];
        const datasetColor = this.getDatasetColor(chartConfig.id, chartConfig.type || 'line');
        
        let labels = [];
        let values = [];
        let backgroundColors = [];
        let borderColors = [];
        
        // Verificar diferentes formatos de dados do backend
        if (Array.isArray(backendData)) {
            // Formato: [{periodo: "2024-01", valor: 100}, ...]
            backendData.forEach((item, index) => {
                const { label, value } = this.extractLabelAndValue(item, chartConfig, index);
                labels.push(label);
                values.push(value);
                
                if (chartConfig.type === 'bar') {
                    backgroundColors.push(this.getBarColor(value, chartConfig));
                    borderColors.push(datasetColor.border);
                } else {
                    backgroundColors.push(datasetColor.background);
                    borderColors.push(datasetColor.border);
                }
            });
        } else if (backendData.labels && backendData.datasets) {
            // Formato já estruturado para Chart.js
            return backendData;
        } else if (backendData.data && Array.isArray(backendData.data)) {
            // Formato: {data: [{...}], metadata: {...}}
            backendData.data.forEach((item, index) => {
                const { label, value } = this.extractLabelAndValue(item, chartConfig, index);
                labels.push(label);
                values.push(value);
                
                if (chartConfig.type === 'bar') {
                    backgroundColors.push(this.getBarColor(value, chartConfig));
                    borderColors.push(datasetColor.border);
                } else {
                    backgroundColors.push(datasetColor.background);
                    borderColors.push(datasetColor.border);
                }
            });
        } else {
            console.warn('Formato de dados não reconhecido:', backendData);
            // Criar dados de fallback
            labels = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'];
            values = [0, 0, 0, 0, 0, 0];
            backgroundColors = labels.map(() => datasetColor.background);
            borderColors = labels.map(() => datasetColor.border);
        }
        
        return {
            labels: labels,
            datasets: [{
                label: chartConfig.title || chartConfig.dataKey,
                data: values,
                backgroundColor: chartConfig.type === 'bar' ? backgroundColors : datasetColor.background,
                borderColor: datasetColor.border,
                borderWidth: chartConfig.type === 'line' ? 3 : 1,
                tension: chartConfig.type === 'line' ? 0.4 : 0,
                fill: chartConfig.type === 'line',
                pointBackgroundColor: datasetColor.border,
                pointBorderColor: colors.background,
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6
            }]
        };
    }
    
    /**
     * Extrai label e valor de um item de dados do backend
     * Suporta múltiplos formatos de dados
     */
    extractLabelAndValue(item, chartConfig, index) {
        let label = '';
        let value = 0;
        
        // Método 1: Dados estruturados do Python (snake_case ou camelCase)
        const possibleKeys = this.getPossibleKeys(chartConfig.dataKey);
        
        // Procurar a chave correta no item
        for (const key of possibleKeys) {
            if (item[key] !== undefined && item[key] !== null) {
                value = parseFloat(item[key]) || 0;
                break;
            }
        }
        
        // Método 2: Valor direto em campo específico
        if (value === 0 && item.value !== undefined) {
            value = parseFloat(item.value) || 0;
        }
        
        // Método 3: Dentro de objeto 'data'
        if (value === 0 && item.data && item.data[chartConfig.dataKey] !== undefined) {
            value = parseFloat(item.data[chartConfig.dataKey]) || 0;
        }
        
        // Extrair label
        if (item.periodo) {
            label = item.periodo;
        } else if (item.mes) {
            label = item.mes;
        } else if (item.date) {
            label = this.formatDateLabel(item.date);
        } else if (item.label) {
            label = item.label;
        } else {
            label = `Mês ${index + 1}`;
        }
        
        return { label, value };
    }
    
    /**
     * Gera possíveis chaves para busca de métricas
     * Suporta snake_case do Python e camelCase do frontend
     */
    getPossibleKeys(dataKey) {
        const keys = [dataKey];
        
        // Converter para snake_case (padrão Python)
        const snakeCase = dataKey
            .replace(/([A-Z])/g, '_$1')
            .toLowerCase()
            .replace(/ /g, '_')
            .replace(/__/g, '_');
        
        if (snakeCase !== dataKey.toLowerCase()) {
            keys.push(snakeCase);
        }
        
        // Adicionar mapeamento reverso do dicionário
        for (const [pythonKey, frontendKey] of Object.entries(this.metricMappings)) {
            if (frontendKey === dataKey) {
                keys.push(pythonKey);
            }
        }
        
        // Adicionar variações sem espaços
        const noSpaces = dataKey.replace(/ /g, '');
        keys.push(noSpaces);
        keys.push(noSpaces.toLowerCase());
        
        return [...new Set(keys)]; // Remover duplicados
    }
    
    formatDateLabel(dateString) {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('pt-BR', {
                month: 'short',
                year: 'numeric'
            });
        } catch (error) {
            return dateString;
        }
    }
    
    getDatasetColor(chartId, type) {
        const colors = this.chartColors[this.currentTheme];
        
        // Mapeamento baseado no tipo de gráfico
        const colorIndex = Math.abs(this.hashString(chartId)) % 5;
        const colorKeys = ['primary', 'secondary', 'tertiary', 'quaternary', 'quinary'];
        const selectedColor = colors[colorKeys[colorIndex]] || colors.primary;
        
        return {
            background: type === 'line' ? this.hexToRgba(selectedColor, 0.1) : this.hexToRgba(selectedColor, 0.7),
            border: selectedColor
        };
    }
    
    getBarColor(value, config) {
        const colors = this.chartColors[this.currentTheme];
        
        // Cores baseadas em thresholds
        if (config.unit === '%') {
            if (value < 20) return this.hexToRgba(colors.quaternary, 0.7);
            if (value < 50) return this.hexToRgba(colors.tertiary, 0.7);
            return this.hexToRgba(colors.secondary, 0.7);
        }
        
        if (config.unit === 'R$') {
            // Para valores monetários, usar gradiente baseado no valor
            const maxValue = config.max || 10000;
            const normalized = Math.min(value / maxValue, 1);
            
            if (normalized < 0.3) return this.hexToRgba(colors.quaternary, 0.7);
            if (normalized < 0.7) return this.hexToRgba(colors.tertiary, 0.7);
            return this.hexToRgba(colors.secondary, 0.7);
        }
        
        return this.hexToRgba(colors.primary, 0.7);
    }
    
    getChartOptions(chartConfig) {
        const colors = this.chartColors[this.currentTheme];
        
        const options = {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                duration: 1000,
                easing: 'easeInOutQuart'
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        color: colors.text,
                        font: {
                            family: '-apple-system, BlinkMacSystemFont, sans-serif',
                            size: 12
                        },
                        padding: 20,
                        usePointStyle: true
                    }
                },
                tooltip: {
                    backgroundColor: colors.background,
                    titleColor: colors.text,
                    bodyColor: colors.text,
                    borderColor: colors.grid,
                    borderWidth: 1,
                    cornerRadius: 6,
                    padding: 12,
                    displayColors: true,
                    callbacks: {
                        label: (context) => {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            
                            let value = context.parsed.y;
                            
                            // Formatar baseado na unidade
                            if (chartConfig.unit === '%') {
                                label += `${value.toFixed(1)}%`;
                            } else if (chartConfig.unit === 'R$') {
                                label += `R$ ${value.toFixed(2)}`;
                            } else if (chartConfig.unit === 'x') {
                                label += `${value.toFixed(1)}x`;
                            } else if (chartConfig.unit === 'min') {
                                label += `${value.toFixed(1)} min`;
                            } else {
                                label += value.toLocaleString('pt-BR');
                            }
                            
                            return label;
                        }
                    }
                },
                datalabels: {
                    display: chartConfig.type === 'bar',
                    anchor: 'end',
                    align: 'top',
                    color: colors.text,
                    font: {
                        weight: 'bold',
                        size: 11
                    },
                    formatter: (value) => {
                        if (chartConfig.unit === '%') return `${value.toFixed(1)}%`;
                        if (chartConfig.unit === 'R$') return `R$ ${value.toFixed(0)}`;
                        if (chartConfig.unit === 'x') return `${value.toFixed(1)}x`;
                        if (chartConfig.unit === 'min') return `${value.toFixed(0)}m`;
                        
                        if (value >= 1000) return `${(value/1000).toFixed(0)}K`;
                        return value.toFixed(0);
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        color: colors.grid,
                        drawBorder: false
                    },
                    ticks: {
                        color: colors.text,
                        font: {
                            size: 11
                        },
                        maxRotation: 45
                    }
                },
                y: {
                    beginAtZero: true,
                    grid: {
                        color: colors.grid,
                        drawBorder: false
                    },
                    ticks: {
                        color: colors.text,
                        font: {
                            size: 11
                        },
                        callback: (value) => {
                            if (chartConfig.unit === '%') return `${value}%`;
                            if (chartConfig.unit === 'R$') return `R$ ${value}`;
                            if (chartConfig.unit === 'x') return `${value}x`;
                            
                            if (value >= 1000000) return `${(value/1000000).toFixed(1)}M`;
                            if (value >= 1000) return `${(value/1000).toFixed(0)}K`;
                            return value;
                        }
                    }
                }
            },
            interaction: {
                intersect: false,
                mode: 'index'
            },
            elements: {
                line: {
                    cubicInterpolationMode: 'monotone'
                }
            }
        };
        
        return options;
    }
    
    /**
     * Cria múltiplos gráficos a partir de dados do backend
     */
    createChartsFromBackend(canvasConfigs, backendData) {
        const charts = {};
        
        canvasConfigs.forEach(config => {
            const chartId = config.id;
            const canvas = document.getElementById(chartId);
            
            if (canvas) {
                // Encontrar dados correspondentes no backend
                const chartData = this.findChartDataInBackend(backendData, config);
                
                if (chartData) {
                    const chart = this.createChartFromBackendData(chartId, {
                        ...config,
                        dataKey: config.metricKey || config.dataKey
                    }, chartData);
                    
                    if (chart) {
                        charts[chartId] = chart;
                    }
                }
            }
        });
        
        return charts;
    }
    
    /**
     * Busca dados específicos para um gráfico nos dados do backend
     */
    findChartDataInBackend(backendData, config) {
        if (!backendData || !config) return null;
        
        // Verificar diferentes estruturas de dados
        if (backendData[config.category]) {
            // Estrutura: { "email": {...}, "social": {...} }
            return backendData[config.category];
        }
        
        if (backendData.metrics && backendData.metrics[config.dataKey]) {
            // Estrutura: { metrics: { "Taxa de Abertura": [...] } }
            return backendData.metrics[config.dataKey];
        }
        
        if (backendData.data && backendData.data[config.dataKey]) {
            // Estrutura: { data: { "Taxa de Abertura": [...] } }
            return backendData.data[config.dataKey];
        }
        
        // Procurar em array de métricas
        if (Array.isArray(backendData)) {
            const metric = backendData.find(item => 
                item.metric === config.dataKey || 
                item.name === config.dataKey ||
                item.key === config.dataKey
            );
            
            if (metric && metric.data) {
                return metric.data;
            }
        }
        
        return null;
    }
    
    /**
     * Atualiza gráficos existentes com novos dados do backend
     */
    updateChartsWithBackendData(backendData) {
        this.charts.forEach((chart, canvasId) => {
            // Tentar encontrar configuração do gráfico
            const config = this.getChartConfigFromId(canvasId);
            
            if (config) {
                const newData = this.findChartDataInBackend(backendData, config);
                
                if (newData) {
                    const chartData = this.prepareChartDataFromBackend(newData, config);
                    
                    // Atualizar dados do gráfico
                    chart.data.labels = chartData.labels;
                    chart.data.datasets[0].data = chartData.datasets[0].data;
                    
                    // Atualizar cores se necessário
                    if (config.type === 'bar') {
                        chart.data.datasets[0].backgroundColor = chartData.datasets[0].data.map(
                            value => this.getBarColor(value, config)
                        );
                    }
                    
                    chart.update('none'); // Atualizar sem animação
                }
            }
        });
    }
    
    /**
     * Cria gráfico avançado com múltiplas métricas (do backend Python)
     */
    createMultiMetricChart(canvasId, chartConfig, backendData) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return null;
        
        // Destruir gráfico existente
        this.destroyChart(canvasId);
        
        // Preparar dados para múltiplas métricas
        const datasets = [];
        const colors = this.chartColors[this.currentTheme];
        const colorKeys = ['primary', 'secondary', 'tertiary', 'quaternary', 'quinary'];
        
        // Verificar se backendData contém múltiplas métricas
        const metricsData = backendData.metrics || backendData.data || backendData;
        
        if (metricsData && typeof metricsData === 'object') {
            let metricIndex = 0;
            let labels = null;
            
            for (const [metricName, metricValues] of Object.entries(metricsData)) {
                if (Array.isArray(metricValues)) {
                    // Primeira métrica define os labels
                    if (metricIndex === 0) {
                        labels = metricValues.map(item => {
                            if (typeof item === 'object' && item.periodo) {
                                return item.periodo;
                            }
                            return `Mês ${metricIndex + 1}`;
                        });
                    }
                    
                    // Extrair valores
                    const values = metricValues.map(item => {
                        if (typeof item === 'object' && item.value !== undefined) {
                            return parseFloat(item.value) || 0;
                        }
                        return parseFloat(item) || 0;
                    });
                    
                    const color = colors[colorKeys[metricIndex % colorKeys.length]];
                    
                    datasets.push({
                        label: this.metricMappings[metricName] || metricName,
                        data: values,
                        borderColor: color,
                        backgroundColor: this.hexToRgba(color, 0.1),
                        borderWidth: 2,
                        tension: 0.4,
                        fill: false,
                        pointRadius: 3
                    });
                    
                    metricIndex++;
                }
            }
            
            if (labels && datasets.length > 0) {
                const chartData = { labels, datasets };
                const options = this.getChartOptions(chartConfig);
                
                const chart = new Chart(canvas.getContext('2d'), {
                    type: chartConfig.type || 'line',
                    data: chartData,
                    options: options
                });
                
                this.charts.set(canvasId, chart);
                return chart;
            }
        }
        
        return null;
    }
    
    /**
     * Cria gráfico de previsões (dados do machine learning do Python)
     */
    createPredictionChart(canvasId, predictionData) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return null;
        
        this.destroyChart(canvasId);
        
        const colors = this.chartColors[this.currentTheme];
        
        // Estrutura esperada do Python:
        // {
        //   historical: [{periodo: "2024-01", value: 100}, ...],
        //   predictions: [{periodo: "2024-07", value: 120, confidence: 0.8}, ...],
        //   confidence_intervals: [{lower: 110, upper: 130}, ...]
        // }
        
        const historicalLabels = predictionData.historical?.map(item => item.periodo) || [];
        const historicalValues = predictionData.historical?.map(item => item.value) || [];
        
        const predictionLabels = predictionData.predictions?.map(item => item.periodo) || [];
        const predictionValues = predictionData.predictions?.map(item => item.value) || [];
        
        const allLabels = [...historicalLabels, ...predictionLabels];
        
        const chartData = {
            labels: allLabels,
            datasets: [
                {
                    label: 'Dados Históricos',
                    data: [...historicalValues, ...Array(predictionValues.length).fill(null)],
                    borderColor: colors.primary,
                    backgroundColor: 'transparent',
                    borderWidth: 3,
                    tension: 0.4,
                    pointRadius: 4
                },
                {
                    label: 'Previsões',
                    data: [...Array(historicalValues.length).fill(null), ...predictionValues],
                    borderColor: colors.secondary,
                    backgroundColor: 'transparent',
                    borderWidth: 3,
                    borderDash: [5, 5],
                    tension: 0.4,
                    pointRadius: 4
                }
            ]
        };
        
        // Adicionar intervalo de confiança se disponível
        if (predictionData.confidence_intervals) {
            const lowerBounds = predictionData.confidence_intervals.map(ci => ci.lower);
            const upperBounds = predictionData.confidence_intervals.map(ci => ci.upper);
            
            chartData.datasets.push({
                label: 'Intervalo de Confiança',
                data: [...Array(historicalValues.length).fill(null), ...upperBounds],
                borderColor: 'transparent',
                backgroundColor: this.hexToRgba(colors.secondary, 0.2),
                fill: '-1',
                tension: 0,
                pointRadius: 0
            });
            
            chartData.datasets.push({
                label: '',
                data: [...Array(historicalValues.length).fill(null), ...lowerBounds],
                borderColor: 'transparent',
                backgroundColor: this.hexToRgba(colors.secondary, 0.2),
                tension: 0,
                pointRadius: 0
            });
        }
        
        const options = {
            ...this.getChartOptions({ type: 'line', unit: '%' }),
            plugins: {
                ...this.getChartOptions({ type: 'line', unit: '%' }).plugins,
                annotation: {
                    annotations: {
                        line1: {
                            type: 'line',
                            xMin: historicalValues.length - 0.5,
                            xMax: historicalValues.length - 0.5,
                            borderColor: colors.text,
                            borderWidth: 2,
                            borderDash: [3, 3],
                            label: {
                                content: 'Início das Previsões',
                                display: true,
                                position: 'start'
                            }
                        }
                    }
                }
            }
        };
        
        const chart = new Chart(canvas.getContext('2d'), {
            type: 'line',
            data: chartData,
            options: options
        });
        
        this.charts.set(canvasId, chart);
        return chart;
    }
    
    /**
     * Cria gráfico de análise de sentimento (dados do NLP do Python)
     */
    createSentimentChart(canvasId, sentimentData) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return null;
        
        this.destroyChart(canvasId);
        
        // Estrutura esperada do Python:
        // {
        //   sentiment_distribution: {positive: 60, neutral: 30, negative: 10},
        //   average_score: 0.75,
        //   timeline: [{date: "2024-01", score: 0.8}, ...]
        // }
        
        const colors = this.chartColors[this.currentTheme];
        
        // Gráfico de distribuição (doughnut)
        if (sentimentData.sentiment_distribution) {
            const distribution = sentimentData.sentiment_distribution;
            
            const chartData = {
                labels: ['Positivo', 'Neutro', 'Negativo'],
                datasets: [{
                    data: [distribution.positive, distribution.neutral, distribution.negative],
                    backgroundColor: [
                        this.hexToRgba(colors.secondary, 0.7),
                        this.hexToRgba(colors.tertiary, 0.7),
                        this.hexToRgba(colors.quaternary, 0.7)
                    ],
                    borderColor: [
                        colors.secondary,
                        colors.tertiary,
                        colors.quaternary
                    ],
                    borderWidth: 2
                }]
            };
            
            const options = {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                return `${context.label}: ${context.raw}%`;
                            }
                        }
                    }
                }
            };
            
            const chart = new Chart(canvas.getContext('2d'), {
                type: 'doughnut',
                data: chartData,
                options: options
            });
            
            this.charts.set(canvasId, chart);
            return chart;
        }
        
        return null;
    }
    
    // ===== MÉTODOS UTILITÁRIOS =====
    
    updateAllChartsTheme() {
        this.charts.forEach((chart, canvasId) => {
            this.updateChartTheme(chart, canvasId);
        });
    }
    
    updateChartTheme(chart, canvasId) {
        const colors = this.chartColors[this.currentTheme];
        
        if (chart.options.plugins.legend && chart.options.plugins.legend.labels) {
            chart.options.plugins.legend.labels.color = colors.text;
        }
        
        if (chart.options.scales.x) {
            chart.options.scales.x.grid.color = colors.grid;
            chart.options.scales.x.ticks.color = colors.text;
        }
        
        if (chart.options.scales.y) {
            chart.options.scales.y.grid.color = colors.grid;
            chart.options.scales.y.ticks.color = colors.text;
        }
        
        if (chart.options.plugins.tooltip) {
            chart.options.plugins.tooltip.backgroundColor = colors.background;
            chart.options.plugins.tooltip.titleColor = colors.text;
            chart.options.plugins.tooltip.bodyColor = colors.text;
            chart.options.plugins.tooltip.borderColor = colors.grid;
        }
        
        chart.update();
    }
    
    resizeAllCharts() {
        this.charts.forEach(chart => {
            chart.resize();
        });
    }
    
    destroyChart(canvasId) {
        const chart = this.charts.get(canvasId);
        if (chart) {
            chart.destroy();
            this.charts.delete(canvasId);
        }
    }
    
    destroyAllCharts() {
        this.charts.forEach(chart => {
            chart.destroy();
        });
        this.charts.clear();
    }
    
    getChartConfigFromId(canvasId) {
        // Extrair informações do ID do canvas
        try {
            const parts = canvasId.split('-');
            if (parts.length < 3) return null;
            
            const category = parts[1];
            const metricKey = parts.slice(2).join('-');
            
            // Tentar encontrar configuração correspondente
            // Esta lógica pode ser adaptada conforme necessário
            return {
                id: canvasId,
                category: category,
                dataKey: this.convertToMetricName(metricKey),
                type: canvasId.includes('line') ? 'line' : 'bar'
            };
        } catch (error) {
            console.error('Erro ao extrair configuração do gráfico:', error);
            return null;
        }
    }
    
    convertToMetricName(key) {
        // Converter snake_case ou kebab-case para nome legível
        return key
            .replace(/[-_]/g, ' ')
            .replace(/\b\w/g, l => l.toUpperCase())
            .trim();
    }
    
    hexToRgba(hex, alpha = 1) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
    
    hashString(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash;
    }
    
    // ===== MÉTODOS DE EXPORTAÇÃO =====
    
    exportChartAsImage(canvasId, format = 'png', quality = 1.0) {
        const chart = this.charts.get(canvasId);
        if (!chart) {
            throw new Error('Gráfico não encontrado');
        }
        
        const canvas = chart.canvas;
        const dataUrl = canvas.toDataURL(`image/${format}`, quality);
        
        return {
            dataUrl,
            width: canvas.width,
            height: canvas.height,
            download: (filename = `grafico-${canvasId}.${format}`) => {
                const link = document.createElement('a');
                link.download = filename;
                link.href = dataUrl;
                link.click();
            }
        };
    }
    
    // ===== MÉTODOS DE DEPURAÇÃO =====
    
    logChartData(canvasId) {
        const chart = this.charts.get(canvasId);
        if (!chart) {
            console.warn(`Gráfico ${canvasId} não encontrado`);
            return;
        }
        
        console.log(`Dados do gráfico ${canvasId}:`, {
            labels: chart.data.labels,
            datasets: chart.data.datasets.map(ds => ({
                label: ds.label,
                data: ds.data
            }))
        });
    }
}

// ===== EXPORTAÇÃO =====
window.ChartManager = ChartManager;

// Helper para inicialização
document.addEventListener('DOMContentLoaded', () => {
    window.chartManager = new ChartManager();
    console.log('✅ ChartManager inicializado com suporte a Backend Python');
});