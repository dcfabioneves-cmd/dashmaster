// ===== AUTHENTICATION MANAGER - INTEGRAÇÃO COM BACKEND PYTHON =====
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.isLoginMode = true;
        this.token = null;

        // Configurações da API
        // Configurações da API - Usa GLOBAL CONFIG ou fallback relativo seguro
        const globalConfig = window.AppConfig || window.CONFIG || {};

        this.config = {
            API_BASE_URL: globalConfig.API ? globalConfig.API.BASE_URL : '/api',
            ENDPOINTS: (globalConfig.API && globalConfig.API.ENDPOINTS) ? globalConfig.API.ENDPOINTS : {
                LOGIN: '/auth/token',
                REGISTER: '/auth/register',
                GOOGLE_AUTH: '/auth/google',
                LOGOUT: '/auth/logout',
                PROFILE: '/auth/profile',
                REFRESH_TOKEN: '/auth/refresh'
            }
        };

        // Initialize AppState if it doesn't exist
        if (!window.AppState) {
            window.AppState = {};
        }

        // Se config.js já estiver carregado, atualiza as configurações
        if (window.CONFIG) {
            this.updateConfig(window.CONFIG);
        }

        this.init();
    }

    updateConfig(config) {
        if (config.API_BASE_URL) {
            // Garante que não haja dupla barra
            this.config.API_BASE_URL = config.API_BASE_URL.replace(/\/$/, '');
        }
        if (config.ENDPOINTS) {
            this.config.ENDPOINTS = { ...this.config.ENDPOINTS, ...config.ENDPOINTS };
        }
    }

    async init() {
        console.log('🚀 Initializing AuthManager with Python Backend...');
        console.log('📡 API Configuration:', this.config);

        this.setupLocalAuth();
    }

    setupLocalAuth() {
        console.log('🔐 Setting up authentication forms...');

        // Load user token from localStorage
        const savedUser = localStorage.getItem('dashmaster_user');
        const savedToken = localStorage.getItem('dashmaster_token');

        if (savedUser && savedToken) {
            try {
                this.currentUser = JSON.parse(savedUser);
                this.token = savedToken;

                window.AppState.currentUser = this.currentUser;
                window.AppState.token = this.token;

                // Verifica se o token ainda é válido
                this.validateToken().then(isValid => {
                    if (isValid && window.showProjectManager) {
                        window.showProjectManager();
                    } else {
                        // Token expirado, força logout
                        this.clearAuthData();
                        this.showAuthScreen();
                    }
                });

            } catch (e) {
                console.warn('⚠️ Invalid saved user data, clearing...');
                this.clearAuthData();
            }
        } else {
            this.showAuthScreen();
        }

        // Setup local form events
        this.setupAuthForm();
    }

    setupAuthForm() {
        const authForm = document.getElementById('auth-form');
        const authSwitch = document.getElementById('auth-switch');

        if (!authForm || !authSwitch) {
            console.warn('⚠️ Auth form elements not found');
            return;
        }

        // Toggle between login and register
        authSwitch.addEventListener('click', (e) => {
            e.preventDefault();
            this.toggleAuthMode();
        });

        // Form submission
        authForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleAuthSubmit();
        });

        // Update initial UI
        this.updateAuthUI();
    }

    toggleAuthMode() {
        this.isLoginMode = !this.isLoginMode;
        this.updateAuthUI();
    }

    updateAuthUI() {
        const title = document.getElementById('auth-title');
        const subtitle = document.getElementById('auth-subtitle');
        const submitBtn = document.getElementById('auth-submit');
        const switchText = document.getElementById('auth-switch-text');
        const switchLink = document.getElementById('auth-switch');
        const nameField = document.getElementById('name-field');
        const confirmField = document.getElementById('confirm-password-field');

        if (!title || !submitBtn) return;

        if (this.isLoginMode) {
            title.textContent = 'Acesse sua conta';
            subtitle.textContent = 'Entre para gerenciar seus dashboards';
            submitBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Entrar';
            switchText.textContent = "Não tem uma conta?";
            switchLink.textContent = 'Cadastre-se';

            if (nameField) nameField.style.display = 'none';
            if (confirmField) confirmField.style.display = 'none';

        } else {
            title.textContent = 'Crie sua conta';
            subtitle.textContent = 'Cadastre-se para começar';
            submitBtn.innerHTML = '<i class="fas fa-user-plus"></i> Cadastrar';
            switchText.textContent = 'Já tem uma conta?';
            switchLink.textContent = 'Entrar';

            if (nameField) nameField.style.display = 'block';
            if (confirmField) confirmField.style.display = 'block';
        }
    }

    async handleAuthSubmit() {
        let submitBtn = null;
        let originalText = '';

        try {
            // Get form values
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;
            const name = document.getElementById('name')?.value.trim();
            const confirmPassword = document.getElementById('confirm-password')?.value;

            // Basic validations
            if (!email || !password) {
                this.showAuthError('Por favor, preencha todos os campos obrigatórios');
                return;
            }

            if (!this.isLoginMode) {
                if (!name) {
                    this.showAuthError('Por favor, digite seu nome');
                    return;
                }

                if (!confirmPassword) {
                    this.showAuthError('Por favor, confirme sua senha');
                    return;
                }

                if (password !== confirmPassword) {
                    this.showAuthError('As senhas não coincidem');
                    return;
                }

                if (password.length < 6) {
                    this.showAuthError('A senha deve ter pelo menos 6 caracteres');
                    return;
                }
            }

            // Show loading state
            submitBtn = document.getElementById('auth-submit');
            originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processando...';
            submitBtn.disabled = true;

            if (this.isLoginMode) {
                await this.login(email, password);
            } else {
                await this.register(email, password, name);
            }

        } catch (error) {
            console.error('❌ Authentication error:', error);
            this.showAuthError(error.message || 'Ocorreu um erro durante a autenticação');

        } finally {
            // Restore button state safely
            if (submitBtn) {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
        }
    }

    async login(email, password) {
        console.log('🔑 Tentando login...', email);

        try {
            // Formato correto para FastAPI OAuth2
            const formData = new URLSearchParams();
            formData.append('username', email);
            formData.append('password', password);

            // URL corrigida - usando endpoint correto
            const loginUrl = `${this.config.API_BASE_URL}${this.config.ENDPOINTS.LOGIN}`;
            console.log('🌐 Login URL:', loginUrl);

            const response = await fetch(loginUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Accept': 'application/json'
                },
                body: formData
            });

            console.log('📊 Response status:', response.status, response.statusText);

            if (!response.ok) {
                // Tenta ler a mensagem de erro do backend
                let errorMessage = 'Falha na conexão ou credenciais inválidas';
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.detail || errorData.message || errorMessage;
                    console.error('📝 Error details:', errorData);
                } catch (parseError) {
                    console.error('❌ Failed to parse error response:', parseError);
                }
                throw new Error(errorMessage);
            }

            const data = await response.json();
            console.log('✅ Login response:', data);

            if (!data.access_token) {
                throw new Error('Token de acesso não recebido do servidor');
            }

            // Buscar informações do usuário para salvar
            const userResponse = await fetch(`${this.config.API_BASE_URL}/auth/profile`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${data.access_token}`,
                    'Accept': 'application/json'
                }
            }).catch(() => null); // Se falhar, não é crítico

            if (userResponse && userResponse.ok) {
                const userData = await userResponse.json();
                this.currentUser = {
                    email: userData.email || email,
                    name: userData.full_name || email.split('@')[0],
                    ...userData
                };
            } else {
                // Se não conseguir buscar o perfil, cria objeto básico
                this.currentUser = {
                    email: email,
                    name: email.split('@')[0]
                };
            }

            this.token = data.access_token;

            // Salvar dados no localStorage
            localStorage.setItem('dashmaster_user', JSON.stringify(this.currentUser));
            localStorage.setItem('dashmaster_token', this.token);

            console.log('✅ Login successful:', this.currentUser);

            // Update AppState
            window.AppState.currentUser = this.currentUser;
            window.AppState.token = this.token;

            // Show success and navigate
            if (window.showProjectManager) {
                window.showProjectManager();
            } else {
                console.warn('⚠️ showProjectManager não está definido');
            }

            if (window.showNotification) {
                window.showNotification('Login realizado com sucesso!', 'success');
            }

        } catch (error) {
            console.error('❌ Login error:', error);

            // Mensagem amigável se o servidor estiver desligado
            if (error.message.includes('Failed to fetch') ||
                error.message.includes('NetworkError') ||
                error.message.includes('Failed to connect')) {
                throw new Error('Não foi possível conectar ao servidor. Verifique sua conexão.');
            }

            throw error;
        }
    }

    async register(email, password, name) {
        console.log('📝 Tentando registrar:', { email, name });

        try {
            // URL de registro
            const registerUrl = `${this.config.API_BASE_URL}${this.config.ENDPOINTS.REGISTER}`;
            console.log('🌐 Register URL:', registerUrl);

            const response = await fetch(registerUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    email: email,
                    password: password,
                    username: email, // Backend requer username, usamos email
                    full_name: name
                })
            });

            console.log('📊 Register response status:', response.status);

            if (!response.ok) {
                let errorMessage = 'Falha no registro';
                try {
                    const errorData = await response.json();

                    // Tratamento para erro de validação (422) do FastAPI
                    if (Array.isArray(errorData.detail)) {
                        errorMessage = errorData.detail.map(err => `${err.loc.join('.')}: ${err.msg}`).join('\n');
                    } else {
                        errorMessage = errorData.detail || errorData.message || errorMessage;
                    }

                    console.error('📝 Register error details:', errorData);
                } catch (parseError) {
                    console.error('❌ Failed to parse register error:', parseError);
                }
                throw new Error(errorMessage);
            }

            const data = await response.json();
            console.log('✅ Register response:', data);

            if (!data.message) {
                throw new Error('Resposta inválida do servidor');
            }

            // Registro bem sucedido, mostra mensagem e volta para tela de login
            if (window.showNotification) {
                window.showNotification('Conta criada com sucesso! Por favor, faça login.', 'success');
            }

            // Switch back to login mode
            this.isLoginMode = true;
            this.updateAuthUI();

            // Preenche automaticamente o email no formulário de login
            const emailInput = document.getElementById('email');
            if (emailInput) {
                emailInput.value = email;
            }

            // Limpa outros campos
            const passwordInput = document.getElementById('password');
            const nameInput = document.getElementById('name');
            const confirmInput = document.getElementById('confirm-password');

            if (passwordInput) passwordInput.value = '';
            if (nameInput) nameInput.value = '';
            if (confirmInput) confirmInput.value = '';

            // Foca no campo de senha para o usuário preencher
            if (passwordInput) {
                passwordInput.focus();
            }

        } catch (error) {
            console.error('❌ Registration error:', error);

            // Log adicional para debugging
            if (error.message.includes('NetworkError') ||
                error.message.includes('Failed to fetch') ||
                error.message.includes('Failed to connect')) {
                throw new Error('Não foi possível conectar ao servidor. Verifique sua conexão.');
            }

            throw error;
        }
    }

    async validateToken() {
        if (!this.token) return false;

        try {
            // Verifica se token está próximo de expirar
            const tokenParts = this.token.split('.');
            if (tokenParts.length !== 3) return false;

            const tokenData = JSON.parse(atob(tokenParts[1]));
            const expirationTime = tokenData.exp * 1000; // Convert to milliseconds
            const currentTime = Date.now();

            // Token expirou?
            if (currentTime > expirationTime) {
                console.log('Token expirado');
                return false;
            }

            // Token ainda válido (com 5 minutos de margem)
            return (expirationTime - currentTime) > (5 * 60 * 1000);

        } catch (error) {
            console.error('❌ Token validation error:', error);
            return false;
        }
    }

    getAuthHeaders() {
        const headers = {
            'Accept': 'application/json'
        };

        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        return headers;
    }

    showAuthError(message) {
        // Remove previous errors
        const existingError = document.querySelector('.auth-error');
        if (existingError) {
            existingError.remove();
        }

        // Create error element
        const errorEl = document.createElement('div');
        errorEl.className = 'auth-error animate__animated animate__shakeX';
        errorEl.innerHTML = `
            <i class="fas fa-exclamation-circle"></i>
            <span>${message}</span>
        `;

        // Insert before submit button
        const authForm = document.getElementById('auth-form');
        const submitBtn = document.getElementById('auth-submit');

        if (authForm && submitBtn) {
            authForm.insertBefore(errorEl, submitBtn);
        }

        // Remove automatically after 5 seconds
        setTimeout(() => {
            if (errorEl.parentElement) {
                errorEl.remove();
            }
        }, 5000);
    }

    async logout() {
        try {
            // Se possível, notifica o backend
            if (this.token) {
                try {
                    await fetch(`${this.config.API_BASE_URL}${this.config.ENDPOINTS.LOGOUT}`, {
                        method: 'POST',
                        headers: this.getAuthHeaders()
                    });
                } catch (apiError) {
                    console.warn('⚠️ Could not notify backend of logout:', apiError);
                }
            }

            // Clear local data
            this.clearAuthData();

            // Clear AppState
            window.AppState.currentUser = null;
            window.AppState.token = null;

            // Redirect to login
            this.showAuthScreen();

            if (window.showNotification) {
                window.showNotification('Logout realizado com sucesso', 'info');
            }

        } catch (error) {
            console.error('❌ Error logging out:', error);

            // Mesmo com erro, limpa os dados locais
            this.clearAuthData();
            this.showAuthScreen();
        }
    }

    clearAuthData() {
        this.currentUser = null;
        this.token = null;

        localStorage.removeItem('dashmaster_user');
        localStorage.removeItem('dashmaster_token');
        localStorage.removeItem('dashmaster_refresh_token');

        // Remove dados antigos
        localStorage.removeItem('currentUser');
        localStorage.removeItem('users');
    }

    showAuthScreen() {
        // Mostra a tela de autenticação
        const authContainer = document.getElementById('auth-container');
        const projectManager = document.getElementById('project-manager');
        const dashboard = document.getElementById('dashboard-container');

        if (authContainer) authContainer.style.display = 'flex';
        if (projectManager) projectManager.style.display = 'none';
        if (dashboard) dashboard.style.display = 'none';

        // Reset form
        this.isLoginMode = true;
        this.updateAuthUI();

        // Clear form fields
        const emailInput = document.getElementById('email');
        const passwordInput = document.getElementById('password');
        const nameInput = document.getElementById('name');
        const confirmInput = document.getElementById('confirm-password');

        if (emailInput) emailInput.value = '';
        if (passwordInput) passwordInput.value = '';
        if (nameInput) nameInput.value = '';
        if (confirmInput) confirmInput.value = '';

        // Foca no email
        if (emailInput) {
            setTimeout(() => emailInput.focus(), 100);
        }
    }

    // Helper methods
    isAuthenticated() {
        return !!this.currentUser && !!this.token;
    }

    getCurrentUser() {
        return this.currentUser;
    }

    getToken() {
        return this.token;
    }
}

// ===== INSTANCIAÇÃO E EXPORTAÇÃO =====
document.addEventListener('DOMContentLoaded', () => {
    // Cria instância global do AuthManager
    window.authManager = new AuthManager();

    // Se config.js for carregado após o AuthManager, atualiza as configurações
    if (window.CONFIG && window.authManager) {
        window.authManager.updateConfig(window.CONFIG);
    }

    // Expor métodos globais para compatibilidade
    window.showAuthScreen = () => window.authManager.showAuthScreen();
    window.isAuthenticated = () => window.authManager.isAuthenticated();
    window.logout = () => window.authManager.logout();
});

// Export para módulos ES6 (se aplicável)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AuthManager;
}

console.log('✅ AuthManager loaded and ready');
