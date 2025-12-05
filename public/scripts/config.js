// ===== CONFIGURAÇÕES DA APLICAÇÃO - INTEGRAÇÃO COM BACKEND PYTHON =====

/**
 * Configurações principais do DashMetrics com Python Backend
 */
const AppConfig = {
    // Versão da aplicação
    VERSION: '2.0.0', // Nova versão com backend Python
    
    // Ambiente
    ENVIRONMENT: 'development', // development, staging, production
    
    // URLs da API - CORREÇÃO: Agora aponta para Python Backend
    API: {
        // CORREÇÃO: Adicionado /api no final para garantir compatibilidade com as rotas do Python
        BASE_URL: 'http://localhost:8000/api', // Backend Python FastAPI
        TIMEOUT: 30000 // 30 segundos
    },
    
    // Configurações de cache
    CACHE: {
        DURATION: {
            SHORT: 5 * 60 * 1000,      // 5 minutos
            MEDIUM: 30 * 60 * 1000,    // 30 minutos
            LONG: 24 * 60 * 60 * 1000  // 24 horas
        },
        MAX_ITEMS: 1000
    },
    
    // Configurações de timeout
    TIMEOUT: {
        API_REQUEST: 30000,    // 30 segundos
        IMAGE_LOAD: 10000      // 10 segundos
    },
    
    // Configurações de paginação
    PAGINATION: {
        DEFAULT_PAGE_SIZE: 50,
        MAX_PAGE_SIZE: 200
    },
    
    // Configurações de gráficos
    CHARTS: {
        COLORS: {
            primary: '#1a73e8',
            secondary: '#34a853',
            tertiary: '#fbbc04',
            quaternary: '#ea4335',
            quinary: '#4285f4'
        },
        ANIMATION_DURATION: 1000,
        RESPONSIVE_BREAKPOINTS: [400, 600, 800, 1000]
    },
    
    // Configurações de exportação
    EXPORT: {
        PDF: {
            PAGE_SIZE: 'A4',
            ORIENTATION: 'landscape',
            MARGINS: 20
        },
        IMAGE: {
            QUALITY: 0.9,
            FORMAT: 'png'
        }
    },
    
    // Configurações de notificações
    NOTIFICATIONS: {
        AUTO_HIDE_DELAY: 5000,
        MAX_VISIBLE: 3
    },
    
    // Limites da aplicação
    LIMITS: {
        MAX_FILE_SIZE: 10 * 1024 * 1024,      // 10MB
        MAX_PROJECTS_PER_USER: 50,
        MAX_SHEETS_PER_PROJECT: 10,
        MAX_DATA_POINTS: 10000
    },
    
    // Recursos experimentais (feature flags)
    FEATURES: {
        AI_INSIGHTS: true,           // Usa machine learning do Python
        REAL_TIME_UPDATES: true,     // WebSocket com backend Python
        COLLABORATION: false,
        API_INTEGRATIONS: false,
        CUSTOM_THEMES: true,
        SENTIMENT_ANALYSIS: true,    // NLP do Python
        PREDICTIVE_ANALYTICS: true   // Previsões do Python
    }
};

/**
 * Configurações de categorias e métricas
 */
const MetricsConfig = {
    CATEGORIES: {
        email: {
            name: 'E-mail Marketing',
            icon: 'fas fa-envelope',
            color: '#1a73e8',
            metrics: [
                'Taxa de Abertura',
                'Taxa de Cliques',
                'Taxa de Conversão',
                'Taxa de Rejeição',
                'Taxa de Cancelamento',
                'Taxa de Bounce'
            ]
        },
        social: {
            name: 'Redes Sociais',
            icon: 'fas fa-share-alt',
            color: '#4285f4',
            metrics: [
                'Alcance',
                'Engajamento',
                'Crescimento Seguidores',
                'Taxa CTR',
                'Taxa CPC',
                'Taxa CPM',
                'Taxa CPV',
                'Taxa ROAS'
            ]
        },
        seo: {
            name: 'SEO',
            icon: 'fas fa-search',
            color: '#34a853',
            metrics: [
                'Crescimento do Tráfego',
                'CTR SEO',
                'Posicionamento Médio',
                'Autoridade',
                'Backlinks',
                'Ticket médio / Conversão',
                'Conversões',
                'Receita'
            ]
        },
        ecommerce: {
            name: 'E-commerce',
            icon: 'fas fa-shopping-cart',
            color: '#fbbc04',
            metrics: [
                'Taxa de Conversão (CVR)',
                'Ticket Médio',
                'Custo de Aquisição por Cliente',
                'Retenção',
                'Taxa de Abandono do Carrinho',
                'Taxa de Cancelamento',
                'Tempo Médio de Entrega',
                'ROAS'
            ]
        },
        'google-ads': {
            name: 'Google Ads',
            icon: 'fab fa-google',
            color: '#ea4335',
            metrics: [
                'CTR GOOGLE',
                'CPC GOOGLE',
                'CONVERSÕES GOOGLE',
                'CPA GOOGLE',
                'ROAS GOOGLE'
            ]
        },
        'meta-ads': {
            name: 'Meta Ads',
            icon: 'fab fa-facebook',
            color: '#1877f2',
            metrics: [
                'CPM',
                'CTR',
                'CPC',
                'Frequência',
                'Conversões',
                'CPA',
                'ROAS'
            ]
        },
        blog: {
            name: 'Blog',
            icon: 'fas fa-blog',
            color: '#8e24aa',
            metrics: [
                'Sessões',
                'Page Views',
                'Tempo Médio na Página (min)',
                'Leads Convertidos',
                'Taxa de Rejeição'
            ]
        }
    },
    
    // Thresholds para insights
    THRESHOLDS: {
        EXCELLENT: 80,
        GOOD: 60,
        FAIR: 40,
        POOR: 20,
        CRITICAL: 10
    },
    
    // Unidades de medida
    UNITS: {
        PERCENTAGE: '%',
        CURRENCY: 'R$',
        RATIO: 'x',
        TIME: 'min',
        COUNT: ''
    }
};

/**
 * Configurações de temas
 */
const ThemeConfig = {
    LIGHT: {
        '--bg-primary': '#ffffff',
        '--bg-secondary': '#f8f9fa',
        '--bg-tertiary': '#f1f3f4',
        '--text-primary': '#202124',
        '--text-secondary': '#5f6368',
        '--text-tertiary': '#80868b',
        '--border-color': '#dadce0',
        '--border-hover': '#c0c0c0',
        '--card-bg': '#ffffff',
        '--card-shadow': '0 1px 3px rgba(60,64,67,0.3), 0 4px 8px rgba(60,64,67,0.15)',
        '--card-shadow-hover': '0 2px 6px rgba(60,64,67,0.3), 0 8px 16px rgba(60,64,67,0.15)',
        '--primary-color': '#1a73e8',
        '--primary-light': '#e8f0fe',
        '--secondary-color': '#34a853',
        '--danger-color': '#ea4335',
        '--warning-color': '#fbbc04',
        '--info-color': '#4285f4',
        '--success-color': '#0f9d58',
        '--success-light': '#e6f4ea'
    },
    
    DARK: {
        '--bg-primary': '#202124',
        '--bg-secondary': '#292a2d',
        '--bg-tertiary': '#3c4043',
        '--text-primary': '#ffffffff',
        '--text-secondary': '#ffffffff',
        '--text-tertiary': '#ffffffff',
        '--border-color': '#5f6368',
        '--border-hover': '#80868b',
        '--card-bg': '#292a2d',
        '--card-shadow': '0 1px 3px rgba(0,0,0,0.5), 0 4px 8px rgba(0,0,0,0.3)',
        '--card-shadow-hover': '0 2px 6px rgba(0,0,0,0.5), 0 8px 16px rgba(0,0,0,0.4)',
        '--primary-color': '#8ab4f8',
        '--primary-light': '#1e3a5f',
        '--secondary-color': '#81c995',
        '--danger-color': '#f28b82',
        '--warning-color': '#fdd663',
        '--info-color': '#aecbfa',
        '--success-color': '#81c995',
        '--success-light': '#1e3e2f'
    },
    
    // Temas customizados podem ser adicionados aqui
    BLUE: {
        '--bg-primary': '#f0f8ff',
        '--bg-secondary': '#e1f5fe',
        '--bg-tertiary': '#b3e5fc',
        '--text-primary': '#01579b',
        '--text-secondary': '#0277bd',
        '--text-tertiary': '#0288d1',
        '--border-color': '#4fc3f7',
        '--border-hover': '#29b6f6',
        '--card-bg': '#ffffff',
        '--card-shadow': '0 1px 3px rgba(3, 169, 244, 0.3), 0 4px 8px rgba(3, 169, 244, 0.15)',
        '--primary-color': '#0288d1',
        '--primary-light': '#e1f5fe',
        '--secondary-color': '#00bcd4',
        '--danger-color': '#f44336',
        '--warning-color': '#ff9800',
        '--info-color': '#03a9f4',
        '--success-color': '#4caf50',
        '--success-light': '#e8f5e9'
    }
};

/**
 * Configurações de localização
 */
const LocaleConfig = {
    DEFAULT: 'pt-BR',
    
    SUPPORTED: ['pt-BR', 'en-US', 'es-ES'],
    
    TRANSLATIONS: {
        'pt-BR': {
            // Auth
            'login': 'Entrar',
            'register': 'Cadastrar',
            'email': 'E-mail',
            'password': 'Senha',
            'confirm_password': 'Confirmar senha',
            'name': 'Nome',
            'remember_me': 'Lembrar-me',
            'forgot_password': 'Esqueci a senha',
            
            // Projects
            'projects': 'Projetos',
            'create_project': 'Criar Projeto',
            'project_name': 'Nome do Projeto',
            'categories': 'Categorias',
            'spreadsheet_url': 'URL da Planilha',
            'spreadsheet_id': 'ID da Planilha',
            
            // Dashboard
            'dashboard': 'Dashboard',
            'filters': 'Filtros',
            'apply_filters': 'Aplicar Filtros',
            'load_data': 'Carregar Dados',
            'export': 'Exportar',
            'share': 'Compartilhar',
            'presentation': 'Apresentação',
            'refresh': 'Atualizar',
            
            // Insights
            'insights': 'Insights',
            'analysis': 'Análise',
            'recommendations': 'Recomendações',
            'critical': 'Crítico',
            'warning': 'Aviso',
            'success': 'Sucesso',
            'ai_insights': 'Insights de IA',
            'predictions': 'Previsões',
            
            // Common
            'save': 'Salvar',
            'cancel': 'Cancelar',
            'delete': 'Excluir',
            'edit': 'Editar',
            'view': 'Visualizar',
            'loading': 'Carregando...',
            'error': 'Erro',
            'success': 'Sucesso',
            'warning': 'Atenção',
            'close': 'Fechar'
        },
        
        'en-US': {
            // Auth
            'login': 'Login',
            'register': 'Register',
            'email': 'Email',
            'password': 'Password',
            'confirm_password': 'Confirm password',
            'name': 'Name',
            'remember_me': 'Remember me',
            'forgot_password': 'Forgot password',
            
            // Projects
            'projects': 'Projects',
            'create_project': 'Create Project',
            'project_name': 'Project Name',
            'categories': 'Categories',
            'spreadsheet_url': 'Spreadsheet URL',
            'spreadsheet_id': 'Spreadsheet ID',
            
            // Dashboard
            'dashboard': 'Dashboard',
            'filters': 'Filters',
            'apply_filters': 'Apply Filters',
            'load_data': 'Load Data',
            'export': 'Export',
            'share': 'Share',
            'presentation': 'Presentation',
            'refresh': 'Refresh',
            
            // Insights
            'insights': 'Insights',
            'analysis': 'Analysis',
            'recommendations': 'Recommendations',
            'critical': 'Critical',
            'warning': 'Warning',
            'success': 'Success',
            'ai_insights': 'AI Insights',
            'predictions': 'Predictions',
            
            // Common
            'save': 'Save',
            'cancel': 'Cancel',
            'delete': 'Delete',
            'edit': 'Edit',
            'view': 'View',
            'loading': 'Loading...',
            'error': 'Error',
            'success': 'Success',
            'warning': 'Warning',
            'close': 'Close'
        }
    }
};

/**
 * Configurações de erros
 */
const ErrorConfig = {
    CODES: {
        // Auth errors
        AUTH_INVALID_EMAIL: 'auth/invalid-email',
        AUTH_USER_DISABLED: 'auth/user-disabled',
        AUTH_USER_NOT_FOUND: 'auth/user-not-found',
        AUTH_WRONG_PASSWORD: 'auth/wrong-password',
        AUTH_TOO_MANY_REQUESTS: 'auth/too-many-requests',
        AUTH_NETWORK_ERROR: 'auth/network-error',
        AUTH_TOKEN_EXPIRED: 'auth/token-expired',
        AUTH_TOKEN_INVALID: 'auth/token-invalid',
        
        // API errors
        API_CONNECTION_ERROR: 'api/connection-error',
        API_TIMEOUT: 'api/timeout',
        API_SERVER_ERROR: 'api/server-error',
        
        // Data errors
        DATA_FETCH_FAILED: 'data/fetch-failed',
        DATA_PARSE_ERROR: 'data/parse-error',
        DATA_VALIDATION_ERROR: 'data/validation-error',
        DATA_NOT_FOUND: 'data/not-found',
        
        // Google Sheets errors
        SHEETS_INVALID_URL: 'sheets/invalid-url',
        SHEETS_ACCESS_DENIED: 'sheets/access-denied',
        SHEETS_NOT_FOUND: 'sheets/not-found',
        SHEETS_PARSE_ERROR: 'sheets/parse-error',
        
        // Export errors
        EXPORT_GENERATION_FAILED: 'export/generation-failed',
        EXPORT_NO_DATA: 'export/no-data',
        EXPORT_SIZE_LIMIT: 'export/size-limit'
    },
    
    MESSAGES: {
        'pt-BR': {
            'auth/invalid-email': 'E-mail inválido.',
            'auth/user-disabled': 'Esta conta foi desativada.',
            'auth/user-not-found': 'Usuário não encontrado.',
            'auth/wrong-password': 'Senha incorreta.',
            'auth/too-many-requests': 'Muitas tentativas. Tente novamente mais tarde.',
            'auth/network-error': 'Erro de conexão. Verifique sua internet.',
            'auth/token-expired': 'Sessão expirada. Faça login novamente.',
            'auth/token-invalid': 'Token inválido. Faça login novamente.',
            
            'api/connection-error': 'Não foi possível conectar ao servidor.',
            'api/timeout': 'Tempo de conexão esgotado.',
            'api/server-error': 'Erro interno do servidor.',
            
            'data/fetch-failed': 'Erro ao carregar dados.',
            'data/parse-error': 'Erro ao processar dados.',
            'data/validation-error': 'Dados inválidos.',
            'data/not-found': 'Nenhum dado encontrado.',
            
            'sheets/invalid-url': 'URL da planilha inválida.',
            'sheets/access-denied': 'Acesso à planilha negado.',
            'sheets/not-found': 'Planilha não encontrada.',
            'sheets/parse-error': 'Erro ao ler planilha.',
            
            'export/generation-failed': 'Erro ao gerar arquivo.',
            'export/no-data': 'Nenhum dado para exportar.',
            'export/size-limit': 'Arquivo muito grande para exportar.',
            
            'default': 'Ocorreu um erro. Tente novamente.'
        },
        
        'en-US': {
            'auth/invalid-email': 'Invalid email address.',
            'auth/user-disabled': 'This account has been disabled.',
            'auth/user-not-found': 'User not found.',
            'auth/wrong-password': 'Wrong password.',
            'auth/too-many-requests': 'Too many attempts. Try again later.',
            'auth/network-error': 'Network error. Check your connection.',
            'auth/token-expired': 'Session expired. Please login again.',
            'auth/token-invalid': 'Invalid token. Please login again.',
            
            'api/connection-error': 'Could not connect to server.',
            'api/timeout': 'Connection timeout.',
            'api/server-error': 'Internal server error.',
            
            'data/fetch-failed': 'Failed to load data.',
            'data/parse-error': 'Error processing data.',
            'data/validation-error': 'Invalid data.',
            'data/not-found': 'No data found.',
            
            'sheets/invalid-url': 'Invalid spreadsheet URL.',
            'sheets/access-denied': 'Access to spreadsheet denied.',
            'sheets/not-found': 'Spreadsheet not found.',
            'sheets/parse-error': 'Error reading spreadsheet.',
            
            'export/generation-failed': 'Error generating file.',
            'export/no-data': 'No data to export.',
            'export/size-limit': 'File too large to export.',
            
            'default': 'An error occurred. Please try again.'
        }
    }
};

/**
 * Configurações de performance
 */
const PerformanceConfig = {
    // Níveis de log
    LOG_LEVEL: AppConfig.ENVIRONMENT === 'production' ? 'ERROR' : 'DEBUG',
    
    // Métricas a serem coletadas
    METRICS: {
        PAGE_LOAD: true,
        API_RESPONSE_TIME: true,
        CHART_RENDER_TIME: true,
        USER_INTERACTIONS: true
    },
    
    // Limites de performance
    THRESHOLDS: {
        PAGE_LOAD: 3000,       // 3 segundos
        API_RESPONSE: 2000,    // 2 segundos
        CHART_RENDER: 1000     // 1 segundo
    }
};

/**
 * Configurações de segurança
 */
const SecurityConfig = {
    // Headers para requisições - CORREÇÃO: Agora com autenticação JWT
    HEADERS: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
    
    // Configurações de JWT
    JWT: {
        EXPIRY: 24 * 60 * 60, // 24 horas em segundos
        REFRESH_THRESHOLD: 15 * 60, // 15 minutos em segundos
        STORAGE_KEY: 'dashmaster_token',
        REFRESH_STORAGE_KEY: 'dashmaster_refresh_token'
    },
    
    // Validações de entrada
    VALIDATION: {
        PASSWORD_MIN_LENGTH: 6,
        PASSWORD_REQUIREMENTS: {
            UPPERCASE: false,    // Não obrigatório para simplicidade
            LOWERCASE: true,
            NUMBERS: false,      // Não obrigatório para simplicidade
            SPECIAL_CHARS: false
        },
        EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        NAME_MIN_LENGTH: 2,
        NAME_MAX_LENGTH: 100
    },
    
    // Configurações de CSRF (se necessário)
    CSRF: {
        ENABLED: false,
        HEADER_NAME: 'X-CSRF-Token'
    }
};

/**
 * Configurações da API Python
 */
const ApiConfig = {
    // Endpoints atualizados para corresponder ao Python Backend
    ENDPOINTS: {
        AUTH: {
            LOGIN: '/auth/token',           // CORREÇÃO: Endpoint correto para FastAPI OAuth2
            REGISTER: '/auth/register',     // Endpoint para registro
            LOGOUT: '/auth/logout',         // Endpoint para logout
            REFRESH: '/auth/refresh',       // Endpoint para refresh token
            PROFILE: '/auth/profile',       // Endpoint para perfil
            GOOGLE: '/auth/google'          // Endpoint para autenticação Google
        },
        PROJECTS: { 
            LIST: '/projects',              // Endpoint simplificado
            CREATE: '/projects',            // Mesmo endpoint para criação
            GET: '/projects/{id}',          // Endpoint com parâmetro
            UPDATE: '/projects/{id}',       // Atualização
            DELETE: '/projects/{id}'        // Exclusão
        },
        DASHBOARD: { 
            DATA: '/process-data'           // Simplificado para bater com o dashboard_router.py
        },
        EXPORT: { 
            PDF: '/export/pdf', 
            EXCEL: '/export/excel', 
            CSV: '/export/csv' 
        },
        ANALYTICS: {
            SENTIMENT: '/analytics/sentiment',
            TRENDS: '/analytics/trends',
            FORECAST: '/analytics/forecast'
        }
    },
    
    // Parâmetros padrão
    PARAMS: {
        PERIODS: ['day', 'week', 'month', 'quarter', 'year'],
        DEFAULT_PERIOD: 'month',
        CHART_TYPES: ['line', 'bar', 'pie', 'doughnut', 'radar']
    },
    
    // WebSocket para atualizações em tempo real
    WEBSOCKET: {
        ENABLED: true,
        URL: 'ws://localhost:8000/ws', // Ou wss:// em produção
        RECONNECT_DELAY: 3000
    }
};

/**
 * Funções auxiliares de configuração
 */
class ConfigManager {
    constructor() {
        this.config = AppConfig;
        this.metrics = MetricsConfig;
        this.themes = ThemeConfig;
        this.locale = LocaleConfig;
        this.errors = ErrorConfig;
        this.performance = PerformanceConfig;
        this.security = SecurityConfig;
        this.api = ApiConfig; // Certifique-se de atribuir isso
        
        this.currentLocale = this.getBrowserLocale();
        this.currentTheme = this.getSavedTheme();
        this.currentEnvironment = this.getEnvironment();
    }
    
    /**
     * Obtém a localização do navegador
     */
    getBrowserLocale() {
        const browserLocale = navigator.language || navigator.userLanguage;
        const supportedLocales = this.locale.SUPPORTED;
        
        // Verifica se a localização do navegador é suportada
        if (supportedLocales.includes(browserLocale)) {
            return browserLocale;
        }
        
        // Tenta encontrar uma correspondência aproximada (ex: pt-BR para pt)
        const language = browserLocale.split('-')[0];
        const matchingLocale = supportedLocales.find(loc => loc.startsWith(language));
        
        return matchingLocale || this.locale.DEFAULT;
    }
    
    /**
     * Obtém o tema salvo
     */
    getSavedTheme() {
        const savedTheme = localStorage.getItem('theme');
        return savedTheme || 'light';
    }
    
    /**
     * Obtém configurações baseadas no ambiente
     */
    getEnvironment() {
        const env = this.config.ENVIRONMENT;
        
        // CORREÇÃO: Adicionado /api na URL de desenvolvimento
        const envConfigs = {
            development: {
                debug: true,
                apiUrl: 'http://localhost:8000/api', // CORREÇÃO: Com /api no final
                logLevel: 'DEBUG'
            },
            staging: {
                debug: true,
                apiUrl: 'https://staging-api.dashmetrics.com/api',
                logLevel: 'INFO'
            },
            production: {
                debug: false,
                apiUrl: 'https://api.dashmetrics.com/api',
                logLevel: 'ERROR'
            }
        };
        
        return envConfigs[env] || envConfigs.development;
    }
    
    /**
     * Obtém URL completa da API
     */
    getApiUrl(endpoint = '') {
        // Remove barra final da base se existir
        const baseUrl = (this.currentEnvironment.apiUrl || this.config.API.BASE_URL).replace(/\/$/, '');
        // Garante barra inicial no endpoint
        const end = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
        return `${baseUrl}${end}`;
    }
    
    /**
     * Obtém uma tradução
     */
    t(key, locale = null) {
        const loc = locale || this.currentLocale;
        const translations = this.locale.TRANSLATIONS[loc];
        
        if (translations && translations[key]) {
            return translations[key];
        }
        
        // Fallback para inglês
        const englishTranslations = this.locale.TRANSLATIONS['en-US'];
        if (englishTranslations && englishTranslations[key]) {
            return englishTranslations[key];
        }
        
        return key;
    }
    
    /**
     * Obtém uma mensagem de erro
     */
    getErrorMessage(code, locale = null) {
        const loc = locale || this.currentLocale;
        const messages = this.errors.MESSAGES[loc];
        
        if (messages && messages[code]) {
            return messages[code];
        }
        
        return messages ? messages['default'] : 'An error occurred';
    }
    
    /**
     * Aplica um tema
     */
    applyTheme(themeName) {
        const theme = this.themes[themeName.toUpperCase()];
        
        if (!theme) {
            console.warn(`Tema ${themeName} não encontrado`);
            return;
        }
        
        // Aplica as variáveis CSS
        Object.entries(theme).forEach(([property, value]) => {
            document.documentElement.style.setProperty(property, value);
        });
        
        // Salva a preferência
        localStorage.setItem('theme', themeName);
        this.currentTheme = themeName;
        
        // Dispara evento de mudança de tema
        document.documentElement.setAttribute('data-theme', themeName);
        window.dispatchEvent(new CustomEvent('themechange', { detail: { theme: themeName } }));
    }
    
    /**
     * Obtém configuração de categoria
     */
    getCategoryConfig(category) {
        return this.metrics.CATEGORIES[category] || {
            name: category,
            icon: 'fas fa-chart-bar',
            color: '#666666'
        };
    }
    
    /**
     * Verifica se uma feature está habilitada
     */
    isFeatureEnabled(feature) {
        return this.config.FEATURES[feature] || false;
    }
    
    /**
     * Obtém configurações de ambiente
     */
    isDevelopment() {
        return this.config.ENVIRONMENT === 'development';
    }
    
    isProduction() {
        return this.config.ENVIRONMENT === 'production';
    }
    
    isStaging() {
        return this.config.ENVIRONMENT === 'staging';
    }
    
    /**
     * Logging baseado no ambiente
     */
    log(level, ...args) {
        const levels = {
            DEBUG: 0,
            INFO: 1,
            WARN: 2,
            ERROR: 3
        };
        
        const currentLevel = levels[this.performance.LOG_LEVEL] || 1;
        const messageLevel = levels[level] || 0;
        
        if (messageLevel >= currentLevel) {
            const timestamp = new Date().toISOString();
            const prefix = `[${timestamp}] [${level}]`;
            
            switch (level) {
                case 'DEBUG':
                    console.debug(prefix, ...args);
                    break;
                case 'INFO':
                    console.info(prefix, ...args);
                    break;
                case 'WARN':
                    console.warn(prefix, ...args);
                    break;
                case 'ERROR':
                    console.error(prefix, ...args);
                    break;
                default:
                    console.log(prefix, ...args);
            }
        }
    }
    
    /**
     * Valida uma URL de planilha do Google
     * CORREÇÃO: Agora apenas validação básica, o backend Python fará o processamento
     */
    validateGoogleSheetsUrl(url) {
        if (!url) return { valid: false, error: 'URL não informada' };
        
        const patterns = [
            /^https:\/\/docs\.google\.com\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/,
            /^https:\/\/docs\.google\.com\/spreadsheets\/u\/\d+\/d\/([a-zA-Z0-9-_]+)/
        ];
        
        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match) {
                return {
                    valid: true,
                    sheetId: match[1],
                    url: url
                };
            }
        }
        
        // Também aceita apenas o ID da planilha
        const idPattern = /^[a-zA-Z0-9-_]+$/;
        if (idPattern.test(url)) {
            return {
                valid: true,
                sheetId: url,
                url: `https://docs.google.com/spreadsheets/d/${url}`
            };
        }
        
        return { valid: false, error: 'URL ou ID do Google Sheets inválido' };
    }
    
    /**
     * Formata número baseado na localização
     */
    formatNumber(number, type = 'default') {
        const locale = this.currentLocale;
        
        const options = {
            percent: {
                style: 'percent',
                minimumFractionDigits: 1,
                maximumFractionDigits: 1
            },
            currency: {
                style: 'currency',
                currency: locale === 'pt-BR' ? 'BRL' : 'USD',
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            },
            decimal: {
                minimumFractionDigits: 1,
                maximumFractionDigits: 2
            },
            integer: {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            },
            default: {
                minimumFractionDigits: 0,
                maximumFractionDigits: 1
            }
        };
        
        const formatOptions = options[type] || options.default;
        
        try {
            return new Intl.NumberFormat(locale, formatOptions).format(number);
        } catch (error) {
            return number.toString();
        }
    }
    
    /**
     * Formata data baseado na localização
     */
    formatDate(date, format = 'short') {
        const locale = this.currentLocale;
        
        const options = {
            short: {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            },
            medium: {
                day: '2-digit',
                month: 'long',
                year: 'numeric'
            },
            long: {
                weekday: 'long',
                day: '2-digit',
                month: 'long',
                year: 'numeric'
            },
            time: {
                hour: '2-digit',
                minute: '2-digit'
            },
            datetime: {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }
        };
        
        const formatOptions = options[format] || options.short;
        
        try {
            return new Date(date).toLocaleDateString(locale, formatOptions);
        } catch (error) {
            return date;
        }
    }
    
    /**
     * Obtém headers de autenticação
     */
    getAuthHeaders() {
        const token = localStorage.getItem(this.security.JWT.STORAGE_KEY);
        const headers = {
            ...this.security.HEADERS
        };
        
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        return headers;
    }
    
    /**
     * Verifica se o usuário está autenticado
     */
    isAuthenticated() {
        const token = localStorage.getItem(this.security.JWT.STORAGE_KEY);
        const user = localStorage.getItem('dashmaster_user');
        
        return !!(token && user);
    }
    
    /**
     * Obtém dados do usuário atual
     */
    getCurrentUser() {
        try {
            const userData = localStorage.getItem('dashmaster_user');
            return userData ? JSON.parse(userData) : null;
        } catch (error) {
            console.error('Error parsing user data:', error);
            return null;
        }
    }
    
    /**
     * Limpa dados de autenticação
     */
    clearAuthData() {
        localStorage.removeItem(this.security.JWT.STORAGE_KEY);
        localStorage.removeItem(this.security.JWT.REFRESH_STORAGE_KEY);
        localStorage.removeItem('dashmaster_user');
    }
    
    /**
     * Constrói URL da API com parâmetros
     */
    buildApiUrl(endpoint, params = {}) {
        let url = this.getApiUrl(endpoint);
        
        // Substitui placeholders como {id}
        Object.keys(params).forEach(key => {
            if (url.includes(`{${key}}`)) {
                url = url.replace(`{${key}}`, params[key]);
            }
        });
        
        // Adiciona query parameters
        const queryParams = {};
        Object.keys(params).forEach(key => {
            if (!url.includes(`{${key}}`)) {
                queryParams[key] = params[key];
            }
        });
        
        if (Object.keys(queryParams).length > 0) {
            const queryString = new URLSearchParams(queryParams).toString();
            url += `?${queryString}`;
        }
        
        return url;
    }
}

// ===== EXPORTAÇÃO =====
// Cria instância global do gerenciador de configurações
window.Config = new ConfigManager();

// Torna as configurações disponíveis globalmente
window.AppConfig = AppConfig;
window.MetricsConfig = MetricsConfig;
window.ThemeConfig = ThemeConfig;
window.LocaleConfig = LocaleConfig;
window.ErrorConfig = ErrorConfig;
window.PerformanceConfig = PerformanceConfig;
window.SecurityConfig = SecurityConfig;
window.ApiConfig = ApiConfig;

// Alias para compatibilidade
window.CONFIG = window.AppConfig;

console.log('✅ Config loaded correctly.');