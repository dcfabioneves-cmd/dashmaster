// ===== DASHMETRICS MAIN APPLICATION =====

// Estado global da aplicação
const AppState = {
    currentUser: null,
    currentProject: null,
    currentCategory: 'email',
    currentCharts: [],
    sheetData: {},
    aiInsights: {},
    dataCache: new Map(),
    theme: localStorage.getItem('theme') || 'light',
    isFullscreen: false,
    isPresentationMode: false,
    isLoading: false,
    lastUpdate: null,
    activeFilters: {
        dateRange: '30d',
        startDate: null,
        endDate: null,
        comparison: 'none'
    }
};

// DOM Elements
let DOM = {};

// Referências para os Managers
let authManager;
let projectManager;
let themeManager;
let dataManager;
let insightsManager;
let exportManager;
let chartManager;

// ===== FUNÇÕES PRINCIPAIS =====

/**
 * Inicializa a aplicação
 */
function initializeApp() {
    console.log('🚀 Inicializando DashMetrics v2.0.0 (Python Backend)');

    // 1. Mapear elementos do DOM
    mapDOMElements();

    // 2. Sincronizar referências dos Managers (Retry se necessário)
    if (!window.authManager) {
        console.warn('⚠️ AuthManager not ready, retrying in 100ms...');
        setTimeout(initializeApp, 100);
        return;
    }
    syncManagers();

    // 3. Verificar configurações
    if (!window.CONFIG) {
        console.warn('⚠️ Configuração global não carregada! Usando defaults.');
        loadDefaultConfig();
    }

    // 4. Verificar conexão
    checkConnection();
    setupNetworkListeners();

    // 5. Verificar autenticação
    checkAuthentication();

    // 6. Configurar datas e UI
    setDefaultDates();

    // 7. Adicionar estilos modais
    addModalStyles();

    console.log('✅ Aplicação inicializada com sucesso');
}

/**
 * Sincroniza referências dos Managers
 */
function syncManagers() {
    authManager = window.authManager;
    projectManager = window.projectManager;
    themeManager = window.themeManager;
    dataManager = window.dataManager;
    insightsManager = window.insightsManager;
    exportManager = window.exportManager;
    chartManager = window.chartManager;
}

/**
 * Carrega configuração padrão
 */
function loadDefaultConfig() {
    window.CONFIG = {
        API_BASE_URL: 'http://localhost:8000',
        ENDPOINTS: {
            LOGIN: '/api/auth/login',
            REGISTER: '/api/auth/register',
            GOOGLE_AUTH: '/api/auth/google',
            LOGOUT: '/api/auth/logout',
            PROFILE: '/api/auth/profile',
            REFRESH_TOKEN: '/api/auth/refresh',
            PROJECTS: '/api/projects',
            DATA: '/api/data'
        },
        CACHE_DURATION: 5 * 60 * 1000,
        MAX_FILE_SIZE: 10 * 1024 * 1024,
        DEFAULT_DATE_RANGE: '30d',
        CHART_ANIMATION_DURATION: 1000,
        AUTO_REFRESH_INTERVAL: 300000
    };
}

function mapDOMElements() {
    DOM = {
        authContainer: document.getElementById('auth-container'),
        projectManager: document.getElementById('project-manager'),
        dashboardHeader: document.getElementById('dashboard-header'),
        dashboardNav: document.getElementById('dashboard-nav'),
        dashboardContainer: document.getElementById('dashboard-container'),
        dashboardFooter: document.getElementById('dashboard-footer'),
        mainDashboard: document.getElementById('main-dashboard'),
        loadingSkeleton: document.getElementById('loading-skeleton')
    };

    console.log('✅ Elementos do DOM mapeados');
}

/**
 * Verifica estado de autenticação
 */
function checkAuthentication() {
    // Usa o AuthManager para verificar autenticação
    if (window.authManager && window.authManager.isAuthenticated()) {
        AppState.currentUser = window.authManager.getCurrentUser();
        updateUserUI();
        showProjectManager();
    } else {
        showAuthScreen();
    }
}

/**
 * Atualiza UI com informações do usuário
 */
function updateUserUI() {
    if (!AppState.currentUser) return;

    const userNameEl = document.getElementById('user-name');
    const userAvatarEl = document.getElementById('user-avatar');

    if (userNameEl) {
        userNameEl.textContent = AppState.currentUser.name || AppState.currentUser.email;
    }

    if (userAvatarEl) {
        userAvatarEl.textContent = (AppState.currentUser.name || 'U').charAt(0).toUpperCase();
    }
}

/**
 * Verifica conexão com internet
 */
async function checkConnection() {
    try {
        const response = await fetch('https://www.google.com', { mode: 'no-cors' });
        updateConnectionStatus(true);
    } catch (error) {
        updateConnectionStatus(false);
        showNotification('Sem conexão com a internet', 'warning');
    }
}

/**
 * Atualiza status da conexão
 */
function updateConnectionStatus(connected) {
    const statusEl = document.getElementById('connection-status');
    if (!statusEl) return;

    if (connected) {
        statusEl.innerHTML = '<i class="fas fa-wifi"></i> Online';
        statusEl.className = 'connected';
    } else {
        statusEl.innerHTML = '<i class="fas fa-wifi-slash"></i> Offline';
        statusEl.className = 'disconnected';
    }
}

/**
 * Configura listeners de rede
 */
function setupNetworkListeners() {
    window.addEventListener('online', () => {
        updateConnectionStatus(true);
        showNotification('Conexão restaurada', 'success');
        syncPendingData();
    });

    window.addEventListener('offline', () => {
        updateConnectionStatus(false);
        showNotification('Conexão perdida - Modo offline', 'warning');
    });
}

/**
 * Sincroniza dados pendentes
 */
function syncPendingData() {
    console.log('🔄 Sincronizando dados pendentes...');
    // Implementar lógica de sincronização offline
}

/**
 * Configura datas padrão
 */
function setDefaultDates() {
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);

    const startDateInput = document.getElementById('start-date');
    const endDateInput = document.getElementById('end-date');

    if (startDateInput) {
        startDateInput.value = formatDateForInput(thirtyDaysAgo);
        AppState.activeFilters.startDate = thirtyDaysAgo;
    }

    if (endDateInput) {
        endDateInput.value = formatDateForInput(today);
        AppState.activeFilters.endDate = today;
    }

    updateDateRangeDisplay();
}

/**
 * Atualiza display do intervalo de datas
 */
function updateDateRangeDisplay() {
    const dateRangeText = document.getElementById('date-range-text');
    if (!dateRangeText) return;

    if (AppState.activeFilters.startDate && AppState.activeFilters.endDate) {
        const start = formatDate(AppState.activeFilters.startDate);
        const end = formatDate(AppState.activeFilters.endDate);
        dateRangeText.textContent = `${start} - ${end}`;
    } else {
        dateRangeText.textContent = 'Selecione um período';
    }
}

/**
 * Inicia atualização automática
 */
function startAutoRefresh() {
    if (AppState.currentProject?.settings?.autoRefresh) {
        setInterval(() => {
            if (!AppState.isLoading && AppState.currentProject) {
                refreshData();
            }
        }, window.CONFIG.AUTO_REFRESH_INTERVAL || 300000);
    }
}

/**
 * Atualiza dados do dashboard
 */
async function refreshData() {
    if (!AppState.currentProject) return;

    try {
        showLoading();

        const newData = await dataManager.loadData(
            AppState.currentProject.spreadsheet_url || AppState.currentProject.spreadsheetUrl,
            AppState.currentProject.categories
        );

        AppState.sheetData = newData.data || {};
        AppState.aiInsights = newData.ai_insights || {};

        // Atualizar dashboard
        loadDashboard(AppState.currentCategory);

        // Atualizar timestamp
        updateLastUpdateTime();

        showNotification('Dados atualizados com sucesso', 'success');

    } catch (error) {
        console.error('❌ Erro ao atualizar dados:', error);
        showNotification('Erro ao atualizar dados: ' + error.message, 'error');
    } finally {
        hideLoading();
    }
}

/**
 * Atualiza timestamp da última atualização
 */
function updateLastUpdateTime() {
    const lastUpdateEl = document.getElementById('last-update');
    if (!lastUpdateEl) return;

    const now = new Date();
    AppState.lastUpdate = now;

    lastUpdateEl.textContent = now.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
    });
}

/**
 * Carrega dashboard com dados
 */
async function loadDashboard(category) {
    if (!AppState.currentProject) return;

    AppState.currentCategory = category;

    // Mostrar skeleton loading
    showSkeletonLoading();

    try {
        // Verificar se temos dados
        const categoryData = AppState.sheetData[category];

        if (!categoryData || categoryData.length === 0) {
            showNoDataMessage();
            return;
        }

        // Atualizar contador de dados
        updateDataPointsCount(categoryData);

        // Renderizar KPIs
        await renderKPICards(categoryData);

        // Gerar insights
        await generateInsights(categoryData);

        // Renderizar gráficos
        await renderCharts(categoryData);

        // Renderizar tabela de dados
        renderDataTable(categoryData);

        // Atualizar status
        updateStatusBar();

    } catch (error) {
        console.error('❌ Erro ao carregar dashboard:', error);
        showError('Erro ao carregar dashboard: ' + error.message);
    } finally {
        // Esconder skeleton loading
        hideSkeletonLoading();

        // Mostrar conteúdo principal
        showMainDashboard();
    }
}

/**
 * Renderiza cards de KPI
 */
async function renderKPICards(data) {
    const kpiContainer = document.getElementById('kpi-cards');
    if (!kpiContainer) return;

    // Limpar container
    kpiContainer.innerHTML = '';

    // Obter configurações de KPI para a categoria atual
    const kpiConfigs = getChartConfigsForCategory(AppState.currentCategory);
    if (!kpiConfigs) return;

    // Calcular KPIs principais (primeiros 4)
    const mainKPIs = kpiConfigs.slice(0, 4);

    mainKPIs.forEach((config, index) => {
        const kpiCard = createKPICard(config, data, index);
        kpiContainer.appendChild(kpiCard);
    });
}

/**
 * Cria card de KPI individual
 */
function createKPICard(config, data, index) {
    const card = document.createElement('div');
    card.className = 'kpi-card animate__animated animate__fadeIn';
    card.style.animationDelay = `${index * 0.1}s`;

    // Calcular valor e tendência
    const value = calculateKPIValue(data, config.dataKey);
    const trend = calculateTrend(data, config.dataKey);

    card.innerHTML = `
        <div class="kpi-card-inner">
            <div class="kpi-header">
                <h3 class="kpi-title">${config.title}</h3>
                <div class="kpi-trend ${trend.type}">
                    <i class="fas ${trend.icon}"></i>
                    <span>${trend.value}</span>
                </div>
            </div>
            <div class="kpi-value">${formatKPIValue(value, config.dataKey)}</div>
            <div class="kpi-progress">
                <div class="progress-bar" style="width: ${Math.min(value, 100)}%"></div>
            </div>
            <div class="kpi-footer">
                <span class="kpi-description">${getKPIDescription(config.dataKey)}</span>
                <button class="kpi-action" onclick="showKPIHistory('${config.dataKey}')">
                    <i class="fas fa-chart-line"></i>
                </button>
            </div>
        </div>
    `;

    return card;
}

/**
 * Calcula valor do KPI (Adaptado para Python/Pandas)
 */
function calculateKPIValue(data, dataKey) {
    if (!data || data.length === 0) return 0;

    const values = data
        .map(item => {
            let val = item[dataKey];

            if (val === undefined && item.data) {
                val = item.data[dataKey];
            }

            return parseFloat(val);
        })
        .filter(v => !isNaN(v));

    if (values.length === 0) return 0;

    const sum = values.reduce((a, b) => a + b, 0);
    return sum / values.length;
}

/**
 * Calcula tendência do KPI
 */
function calculateTrend(data, dataKey) {
    if (!data || data.length < 2) {
        return { type: 'neutral', value: '0%', icon: 'fa-minus' };
    }

    const recentData = data.slice(-3);
    const previousData = data.slice(-6, -3);

    const recentAvg = calculateKPIValue(recentData, dataKey);
    const previousAvg = calculateKPIValue(previousData, dataKey);

    if (previousAvg === 0) {
        return { type: 'neutral', value: '0%', icon: 'fa-minus' };
    }

    const change = ((recentAvg - previousAvg) / previousAvg) * 100;
    const absChange = Math.abs(change).toFixed(1);

    if (change > 5) {
        return { type: 'up', value: `+${absChange}%`, icon: 'fa-arrow-up' };
    } else if (change < -5) {
        return { type: 'down', value: `${absChange}%`, icon: 'fa-arrow-down' };
    } else {
        return { type: 'neutral', value: `${absChange}%`, icon: 'fa-minus' };
    }
}

/**
 * Formata valor do KPI
 */
function formatKPIValue(value, dataKey) {
    const numValue = parseFloat(value);

    if (isNaN(numValue)) return 'N/A';

    if (dataKey.includes('Taxa') || dataKey.includes('CTR') || dataKey.includes('%')) {
        return `${numValue.toFixed(1)}%`;
    } else if (dataKey.includes('$') || dataKey.includes('R$') || dataKey.includes('Custo')) {
        return `R$ ${numValue.toFixed(2)}`;
    } else if (dataKey.includes('ROAS')) {
        return `${numValue.toFixed(1)}x`;
    } else if (numValue >= 1000000) {
        return `${(numValue / 1000000).toFixed(1)}M`;
    } else if (numValue >= 1000) {
        return `${(numValue / 1000).toFixed(1)}K`;
    } else {
        return numValue.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 1 });
    }
}

/**
 * Gera insights inteligentes
 */
async function generateInsights(data) {
    if (!insightsManager || !data) return;

    try {
        await insightsManager.generateInsights(AppState.currentCategory, data);
    } catch (error) {
        console.error('❌ Erro ao gerar insights:', error);
    }
}

/**
 * Renderiza gráficos
 */
async function renderCharts(data) {
    const chartsGrid = document.getElementById('charts-grid');
    if (!chartsGrid) return;

    // Limpar gráficos existentes
    if (AppState.currentCharts && Array.isArray(AppState.currentCharts)) {
        AppState.currentCharts.forEach(chart => {
            if (chart && typeof chart.destroy === 'function') {
                chart.destroy();
            }
        });
    }
    AppState.currentCharts = [];

    // Limpar grid
    chartsGrid.innerHTML = '';

    // Obter configurações de gráficos
    const chartConfigs = getChartConfigsForCategory(AppState.currentCategory);
    if (!chartConfigs || chartConfigs.length === 0) {
        chartsGrid.innerHTML = '<div class="no-charts">Nenhum gráfico configurado</div>';
        return;
    }

    // Criar gráficos
    chartConfigs.forEach(async (config, index) => {
        const chartContainer = createChartContainer(config, index);
        chartsGrid.appendChild(chartContainer);

        // Criar gráfico
        const chart = await createChart(config, data, `chart-${AppState.currentCategory}-${index}`);
        if (chart) {
            AppState.currentCharts.push(chart);
        }
    });
}

/**
 * Cria container de gráfico
 */
function createChartContainer(config, index) {
    const container = document.createElement('div');
    container.className = 'chart-container animate__animated animate__fadeInUp';
    container.style.animationDelay = `${index * 0.1}s`;

    container.innerHTML = `
        <div class="chart-header">
            <h3 class="chart-title">${config.title}</h3>
            <div class="chart-controls">
                <button class="chart-control" onclick="toggleChartType('${config.id || index}')" title="Alterar tipo">
                    <i class="fas fa-exchange-alt"></i>
                </button>
                <button class="chart-control" onclick="downloadChart('${config.id || index}')" title="Download">
                    <i class="fas fa-download"></i>
                </button>
                <button class="chart-control" onclick="fullscreenChart('${config.id || index}')" title="Tela cheia">
                    <i class="fas fa-expand"></i>
                </button>
            </div>
        </div>
        <div class="chart-wrapper">
            <canvas id="chart-${AppState.currentCategory}-${index}"></canvas>
        </div>
        <div class="chart-footer">
            <div class="chart-stats">
                <span class="stat-item">
                    <i class="fas fa-chart-line"></i>
                    Média: <strong id="chart-avg-${index}">0</strong>
                </span>
                <span class="stat-item">
                    <i class="fas fa-arrow-up"></i>
                    Máx: <strong id="chart-max-${index}">0</strong>
                </span>
                <span class="stat-item">
                    <i class="fas fa-arrow-down"></i>
                    Mín: <strong id="chart-min-${index}">0</strong>
                </span>
            </div>
        </div>
    `;

    return container;
}

/**
 * Cria gráfico - função auxiliar
 */
async function createChart(config, data, canvasId) {
    if (!chartManager) return null;

    try {
        return await chartManager.createChart(canvasId, {
            type: config.type || 'line',
            data: prepareChartData(data, config),
            options: getChartOptions(config)
        });
    } catch (error) {
        console.error('❌ Erro ao criar gráfico:', error);
        return null;
    }
}

/**
 * Prepara dados para gráfico
 */
function prepareChartData(data, config) {
    if (!data || data.length === 0) {
        return { labels: [], datasets: [] };
    }

    const labels = data.map(item => item.mes || item.date || '');
    const values = data.map(item => {
        const val = item[config.dataKey] || (item.data && item.data[config.dataKey]);
        return parseFloat(val) || 0;
    });

    return {
        labels: labels,
        datasets: [{
            label: config.title,
            data: values,
            borderColor: config.type === 'line' ? '#1a73e8' : '#1a73e8',
            backgroundColor: config.type === 'bar' ? 'rgba(26, 115, 232, 0.5)' : 'transparent',
            borderWidth: config.type === 'line' ? 3 : 1,
            fill: config.type === 'line'
        }]
    };
}

/**
 * Obtém opções do gráfico
 */
function getChartOptions(config) {
    return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                mode: 'index',
                intersect: false
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(0, 0, 0, 0.05)'
                }
            },
            x: {
                grid: {
                    color: 'rgba(0, 0, 0, 0.05)'
                }
            }
        },
        animation: {
            duration: window.CONFIG.CHART_ANIMATION_DURATION || 1000
        }
    };
}

/**
 * Renderiza tabela de dados (Adaptado para estrutura plana do Python)
 */
function renderDataTable(data) {
    const tableSection = document.getElementById('data-table-section');
    const tableBody = document.getElementById('table-body');
    const tableHeaders = document.getElementById('table-headers');

    if (!tableSection || !tableBody || !tableHeaders) return;

    if (!data || data.length === 0) {
        tableSection.style.display = 'none';
        return;
    }

    tableSection.style.display = 'block';
    tableHeaders.innerHTML = '';
    tableBody.innerHTML = '';

    // Obter cabeçalhos dinamicamente do primeiro item
    const firstRow = data[0];
    const sourceObj = firstRow.data || firstRow;

    const headers = Object.keys(sourceObj).filter(k => k !== 'mes_ano' && k !== 'date' && k !== 'id');

    // 1. Cabeçalho de Mês/Data
    const monthHeader = document.createElement('th');
    monthHeader.textContent = 'Período';
    tableHeaders.appendChild(monthHeader);

    // 2. Outros cabeçalhos
    headers.forEach(header => {
        if (header !== 'Mês' && header !== 'mes') {
            const th = document.createElement('th');
            th.textContent = header.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            tableHeaders.appendChild(th);
        }
    });

    // Linhas
    data.forEach((row, rowIndex) => {
        const tr = document.createElement('tr');
        const rowSource = row.data || row;

        // Célula de Mês
        const monthCell = document.createElement('td');
        monthCell.textContent = row.mes || row.Mês || row.mes_ano || row.date || `Período ${rowIndex + 1}`;
        monthCell.className = 'month-cell';
        tr.appendChild(monthCell);

        // Células de Dados
        headers.forEach(header => {
            if (header !== 'Mês' && header !== 'mes') {
                const td = document.createElement('td');
                const value = rowSource[header];

                if (typeof value === 'number') {
                    let formatted = value.toFixed(1);
                    if (header.includes('taxa') || header.includes('rate') || header.includes('porcentagem')) formatted += '%';
                    else if (header.includes('valor') || header.includes('custo') || header.includes('reais')) formatted = 'R$ ' + formatted;

                    td.textContent = formatted;
                    td.className = 'number-cell';
                } else {
                    td.textContent = value || '-';
                }
                tr.appendChild(td);
            }
        });
        tableBody.appendChild(tr);
    });
}

/**
 * Atualiza barra de status
 */
function updateStatusBar() {
    const dataPointsEl = document.getElementById('data-points');
    const alertsCountEl = document.getElementById('alerts-count');

    if (dataPointsEl) {
        const currentData = AppState.sheetData[AppState.currentCategory] || [];
        dataPointsEl.textContent = currentData.length;
    }

    if (alertsCountEl) {
        const insights = document.querySelectorAll('.insight-card.danger, .insight-card.warning');
        const alertCount = insights.length;

        alertsCountEl.textContent = alertCount;
        alertsCountEl.className = alertCount > 0 ? 'has-alerts' : 'no-alerts';
    }
}

/**
 * Mostra tela de autenticação
 */
function showAuthScreen() {
    hideAllScreens();
    if (DOM.authContainer) {
        DOM.authContainer.style.display = 'flex';
    }
}

/**
 * Mostra gerenciador de projetos
 */
function showProjectManager() {
    hideAllScreens();
    if (DOM.projectManager) {
        DOM.projectManager.style.display = 'block';
    }

    // Carregar projetos
    if (projectManager && AppState.currentUser) {
        if (typeof projectManager.loadUserProjects === 'function') {
            projectManager.loadUserProjects();
        } else {
            console.warn('⚠️ ProjectManager não tem método loadUserProjects');
            loadProjectsFallback();
        }
    }
}

// Função fallback para carregar projetos
function loadProjectsFallback() {
    console.log('📁 Carregando projetos via fallback...');
    // Implementar lógica alternativa para carregar projetos
}

/**
 * Mostra dashboard
 */
function showDashboard() {
    hideAllScreens();
    if (DOM.dashboardHeader) DOM.dashboardHeader.style.display = 'block';
    if (DOM.dashboardNav) DOM.dashboardNav.style.display = 'block';
    if (DOM.dashboardContainer) DOM.dashboardContainer.style.display = 'block';
    if (DOM.dashboardFooter) DOM.dashboardFooter.style.display = 'block';
}

/**
 * Mostra skeleton loading
 */
function showSkeletonLoading() {
    if (DOM.loadingSkeleton) {
        DOM.loadingSkeleton.style.display = 'block';
    }
    if (DOM.mainDashboard) {
        DOM.mainDashboard.style.display = 'none';
    }
}

/**
 * Esconde skeleton loading
 */
function hideSkeletonLoading() {
    if (DOM.loadingSkeleton) {
        DOM.loadingSkeleton.style.display = 'none';
    }
}

/**
 * Mostra dashboard principal
 */
function showMainDashboard() {
    if (DOM.mainDashboard) {
        DOM.mainDashboard.style.display = 'block';
    }
}

/**
 * Esconde todas as telas
 */
function hideAllScreens() {
    if (DOM.authContainer) DOM.authContainer.style.display = 'none';
    if (DOM.projectManager) DOM.projectManager.style.display = 'none';
    if (DOM.dashboardHeader) DOM.dashboardHeader.style.display = 'none';
    if (DOM.dashboardNav) DOM.dashboardNav.style.display = 'none';
    if (DOM.dashboardContainer) DOM.dashboardContainer.style.display = 'none';
    if (DOM.dashboardFooter) DOM.dashboardFooter.style.display = 'none';
    if (DOM.mainDashboard) DOM.mainDashboard.style.display = 'none';
    if (DOM.loadingSkeleton) DOM.loadingSkeleton.style.display = 'none';
}

/**
 * Mostra mensagem de erro
 */
function showError(message) {
    const dashboard = document.getElementById('dashboard');
    if (!dashboard) return;

    dashboard.innerHTML = `
        <div class="error-state">
            <div class="error-icon">
                <i class="fas fa-exclamation-circle"></i>
            </div>
            <h3>Erro ao carregar dados</h3>
            <p>${message}</p>
            <button onclick="refreshData()" class="btn btn-primary">
                <i class="fas fa-redo"></i> Tentar Novamente
            </button>
        </div>
    `;
}

/**
 * Mostra mensagem de dados não encontrados
 */
function showNoDataMessage() {
    const dashboard = document.getElementById('dashboard');
    if (!dashboard) return;

    dashboard.innerHTML = `
        <div class="empty-state">
            <div class="empty-icon">
                <i class="fas fa-database"></i>
            </div>
            <h3>Nenhum dado encontrado</h3>
            <p>Verifique se a planilha contém dados para esta categoria</p>
            <button onclick="refreshData()" class="btn btn-primary">
                <i class="fas fa-redo"></i> Recarregar Dados
            </button>
        </div>
    `;
}

/**
 * Mostra loading
 */
function showLoading() {
    AppState.isLoading = true;
    document.body.classList.add('loading');
}

/**
 * Esconde loading
 */
function hideLoading() {
    AppState.isLoading = false;
    document.body.classList.remove('loading');
}

/**
 * Mostra notificação
 */
function showNotification(message, type = 'info') {
    const container = document.getElementById('notification-container');
    if (!container) return;

    const notification = document.createElement('div');
    notification.className = `notification notification-${type} animate__animated animate__slideInRight`;

    const icons = {
        success: 'fa-check-circle',
        error: 'fa-times-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };

    notification.innerHTML = `
        <div class="notification-icon">
            <i class="fas ${icons[type] || 'fa-info-circle'}"></i>
        </div>
        <div class="notification-content">${message}</div>
        <button class="notification-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;

    container.appendChild(notification);

    // Remover automaticamente após 5 segundos
    setTimeout(() => {
        if (notification.parentElement) {
            notification.classList.add('animate__slideOutRight');
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.remove();
                }
            }, 300);
        }
    }, 5000);
}

// ===== FUNÇÕES UTILITÁRIAS =====

/**
 * Formata data para input type="date"
 */
function formatDateForInput(date) {
    return date.toISOString().split('T')[0];
}

/**
 * Formata data para exibição
 */
function formatDate(date) {
    return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

/**
 * Formata valor para tabela
 */
function formatTableValue(value, header) {
    if (typeof value !== 'number') return value;

    if (header.includes('Taxa') || header.includes('CTR') || header.includes('%')) {
        return value.toFixed(1) + '%';
    } else if (header.includes('R$') || header.includes('Custo')) {
        return 'R$ ' + value.toFixed(2);
    } else if (value >= 1000000) {
        return (value / 1000000).toFixed(1) + 'M';
    } else if (value >= 1000) {
        return (value / 1000).toFixed(1) + 'K';
    } else {
        return value.toFixed(1);
    }
}

/**
 * Obtém descrição da métrica
 */
function getMetricDescription(metric) {
    const descriptions = {
        'Taxa de Abertura': 'Percentual de e-mails abertos',
        'Taxa de Cliques': 'Percentual de cliques nos e-mails',
        'CTR': 'Click-Through Rate - Taxa de cliques',
        'ROAS': 'Return on Ad Spend - Retorno sobre investimento',
        'CPC': 'Custo por Clique',
        'CPA': 'Custo por Aquisição',
    };

    return descriptions[metric] || metric;
}

/**
 * Obtém descrição do KPI
 */
function getKPIDescription(metric) {
    const descriptions = {
        'Taxa de Abertura': 'Eficácia do assunto do e-mail',
        'Taxa de Cliques': 'Engajamento com conteúdo',
        'Taxa de Conversão': 'Conversões geradas',
        'ROAS': 'Retorno sobre investimento em ads',
        'Alcance': 'Pessoas alcançadas',
        'Engajamento': 'Interações com conteúdo',
    };

    return descriptions[metric] || 'Métrica de performance';
}

/**
 * Obtém configurações de gráfico para categoria
 */
function getChartConfigsForCategory(category) {
    const configs = {
        'email': [
            { title: 'Taxa de Abertura', type: 'line', dataKey: 'taxa_abertura', id: 'email-open-rate' },
            { title: 'Taxa de Cliques', type: 'line', dataKey: 'taxa_cliques', id: 'email-click-rate' },
            { title: 'Taxa de Conversão', type: 'bar', dataKey: 'taxa_conversao', id: 'email-conversion-rate' },
            { title: 'Taxa de Rejeição', type: 'line', dataKey: 'taxa_rejeicao', id: 'email-bounce-rate' }
        ],
        'social': [
            { title: 'Engajamento', type: 'line', dataKey: 'engajamento', id: 'social-engagement' },
            { title: 'Alcance', type: 'bar', dataKey: 'alcance', id: 'social-reach' },
            { title: 'Seguidores', type: 'line', dataKey: 'seguidores', id: 'social-followers' },
            { title: 'Taxa ROAS', type: 'bar', dataKey: 'taxa_roas', id: 'social-roas' }
        ]
    };

    return configs[category] || [];
}

/**
 * Atualiza contador de pontos de dados
 */
function updateDataPointsCount(data) {
    const dataPointsEl = document.getElementById('data-points');
    if (dataPointsEl && data) {
        dataPointsEl.textContent = data.length;
    }
}

// ===== EVENT LISTENERS =====

// Event listeners globais
document.addEventListener('DOMContentLoaded', initializeApp);

// Prevenir comportamento padrão de forms
document.addEventListener('submit', function (e) {
    if (e.target.tagName === 'FORM') {
        e.preventDefault();
    }
});

// Atalhos de teclado
document.addEventListener('keydown', function (e) {
    // Ctrl + S para salvar
    if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        refreshData();
    }

    // F5 para atualizar
    if (e.key === 'F5') {
        e.preventDefault();
        refreshData();
    }

    // Esc para sair do modo tela cheia
    if (e.key === 'Escape' && AppState.isFullscreen) {
        exitFullscreen();
    }
});

// ===== EXPORTAÇÃO PARA ESCOPO GLOBAL =====

window.toggleChartType = function (chartId) {
    const chartIndex = parseInt(chartId);
    const chart = AppState.currentCharts[chartIndex];

    if (!chart) return;

    const newType = chart.config.type === 'line' ? 'bar' : 'line';
    chart.config.type = newType;
    chart.update();

    showNotification(`Gráfico alterado para ${newType === 'line' ? 'linha' : 'barras'}`);
};

window.downloadChart = function (chartId) {
    const chartIndex = parseInt(chartId);
    const chart = AppState.currentCharts[chartIndex];

    if (!chart) {
        showNotification('Gráfico não encontrado', 'error');
        return;
    }

    const link = document.createElement('a');
    link.download = `grafico-${AppState.currentCategory}-${chartIndex + 1}.png`;
    link.href = chart.canvas.toDataURL('image/png', 1.0);
    link.click();

    showNotification('Gráfico baixado com sucesso', 'success');
};

window.showKPIHistory = function (metric) {
    showNotification(`Histórico de ${metric} será exibido em breve`, 'info');
};

window.fullscreenChart = function (chartId) {
    const chartIndex = parseInt(chartId);
    const chart = AppState.currentCharts[chartIndex];

    if (!chart) return;

    const canvas = chart.canvas;
    if (canvas.requestFullscreen) {
        canvas.requestFullscreen();
    } else if (canvas.webkitRequestFullscreen) {
        canvas.webkitRequestFullscreen();
    }

    AppState.isFullscreen = true;
};

window.exitFullscreen = function () {
    if (document.exitFullscreen) {
        document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
    }

    AppState.isFullscreen = false;
};

/**
 * Adiciona estilos modais ao documento
 */
function addModalStyles() {
    const modalStyles = document.createElement('style');
    modalStyles.textContent = `
        /* ===== MODAL STYLES ===== */
        .modal {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            z-index: 2000;
            align-items: center;
            justify-content: center;
            backdrop-filter: blur(5px);
        }
        
        .modal-content {
            background: var(--card-bg);
            border-radius: 16px;
            width: 90%;
            max-width: 500px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            overflow: hidden;
            border: 1px solid var(--border-color);
        }
        
        .modal-header {
            padding: 20px 25px;
            background: var(--primary-color);
            color: white;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid rgba(255,255,255,0.1);
        }
        
        .modal-title {
            margin: 0;
            font-size: 1.3rem;
            font-weight: 600;
        }
        
        .close-btn {
            background: rgba(255,255,255,0.1);
            border: none;
            color: white;
            width: 36px;
            height: 36px;
            border-radius: 50%;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s;
        }
        
        .close-btn:hover {
            background: rgba(255,255,255,0.2);
            transform: rotate(90deg);
        }
        
        .modal-body {
            padding: 25px;
            max-height: 60vh;
            overflow-y: auto;
        }
        
        .modal-footer {
            padding: 20px 25px;
            border-top: 1px solid var(--border-color);
            display: flex;
            justify-content: flex-end;
            gap: 12px;
            background: var(--bg-secondary);
        }
        
        .modal-btn {
            padding: 10px 24px;
            border-radius: 8px;
            font-weight: 500;
        }
        
        .input-with-btn {
            display: flex;
            gap: 10px;
        }
        
        .categories-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
            gap: 12px;
            margin-top: 10px;
        }
        
        .category-option {
            cursor: pointer;
        }
        
        .category-option input[type="checkbox"] {
            display: none;
        }
        
        .cat-card {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 15px;
            background: var(--bg-secondary);
            border: 2px solid transparent;
            border-radius: 10px;
            transition: all 0.2s;
            text-align: center;
        }
        
        .cat-card i {
            font-size: 1.5rem;
            margin-bottom: 8px;
            color: var(--primary-color);
        }
        
        .category-option input[type="checkbox"]:checked + .cat-card {
            background: rgba(26, 115, 232, 0.1);
            border-color: var(--primary-color);
            transform: translateY(-2px);
        }
        
        .options-group {
            margin-top: 20px;
        }
        
        .checkbox-label {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 12px;
            cursor: pointer;
            font-size: 0.95rem;
        }
        
        .text-muted {
            color: var(--text-secondary);
            font-size: 0.85rem;
            display: block;
            margin-top: 5px;
        }
        
        .validation-error {
            background: rgba(234, 67, 53, 0.1);
            color: var(--danger-color);
            padding: 10px 15px;
            border-radius: 8px;
            margin-top: 10px;
            font-size: 0.9rem;
            display: flex;
            align-items: center;
            gap: 8px;
            animation: slideIn 0.3s ease;
        }
        
        .validation-success {
            background: rgba(52, 168, 83, 0.1);
            color: var(--success-color);
            padding: 10px 15px;
            border-radius: 8px;
            margin-top: 10px;
            font-size: 0.9rem;
            display: flex;
            align-items: center;
            gap: 8px;
            animation: slideIn 0.3s ease;
        }
        
        @keyframes slideIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
        }
    `;

    document.head.appendChild(modalStyles);
}

// ===== INICIALIZAÇÃO =====

// Garantir que a aplicação seja inicializada quando o DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}
