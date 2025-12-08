// ===== AUTHENTICATION MANAGER - INTEGRAÇÃO COM BACKEND PYTHON =====
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.isLoginMode = true;
        
        // Configurações da API
        this.config = {
            // CORREÇÃO 1: Definir o padrão CORRETO com /api
            API_BASE_URL: 'http://localhost:8000/api', 
            ENDPOINTS: {
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
        
        // Tenta carregar configurações globais
        if (window.CONFIG || window.AppConfig) {
            this.updateConfig(window.CONFIG || window.AppConfig);
        }
        
        this.init();
    }
    
    updateConfig(config) {
        // CORREÇÃO 2: A estrutura do config.js é config.API.BASE_URL, não config.API_BASE_URL direto
        if (config && config.API && config.API.BASE_URL) {
            this.config.API_BASE_URL = config.API.BASE_URL;
            console.log('✅ AuthManager: Configuração atualizada via config.js:', this.config.API_BASE_URL);
        }
    }

    async init() {
        console.log('🚀 Initializing AuthManager with Python Backend...');
        this.setupLocalAuth();
    }

    setupLocalAuth() {
        // Load user token from localStorage (SEM SENHAS!)
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
                        this.clearAuthData();
                        this.showAuthScreen();
                    }
                });
                
            } catch (e) {
                console.warn('⚠️ Invalid saved user data, clearing...');
                this.clearAuthData();
            }
        }
        
        this.setupAuthForm();
    }

    setupAuthForm() {
        const authForm = document.getElementById('auth-form');
        const authSwitch = document.getElementById('auth-switch');
        
        if (!authForm || !authSwitch) return;
        
        authSwitch.addEventListener('click', (e) => {
            e.preventDefault();
            this.toggleAuthMode();
        });
        
        authForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleAuthSubmit();
        });
        
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
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;
            const name = document.getElementById('name')?.value.trim();
            const confirmPassword = document.getElementById('confirm-password')?.value;
            
            if (!email || !password) {
                this.showAuthError('Por favor, preencha todos os campos obrigatórios');
                return;
            }
            
            if (!this.isLoginMode) {
                if (password !== confirmPassword) {
                    this.showAuthError('As senhas não coincidem');
                    return;
                }
            }
            
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
            if (submitBtn) {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
        }
    }

    async login(email, password) {
        // Garante que não há barra duplicada ao concatenar
        const baseUrl = this.config.API_BASE_URL.replace(/\/$/, '');
        const loginUrl = `${baseUrl}/auth/token`;
        
        console.log(`🔑 Login URL: ${loginUrl}`);
        
        try {
            const formData = new URLSearchParams();
            formData.append('username', email);
            formData.append('password', password);

            const response = await fetch(loginUrl, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/x-www-form-urlencoded' 
                },
                body: formData
            });

            if (!response.ok) {
                if (response.status === 405) {
                    throw new Error(`Erro de Configuração: Rota incorreta (${loginUrl}). Verifique o config.js.`);
                }
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.detail || 'Credenciais inválidas');
            }

            const data = await response.json();
            
            this.currentUser = { email: email, name: email.split('@')[0] };
            this.token = data.access_token;
            
            localStorage.setItem('dashmaster_user', JSON.stringify(this.currentUser));
            localStorage.setItem('dashmaster_token', this.token);
            
            window.AppState.currentUser = this.currentUser;
            window.AppState.token = this.token;
            
            if (window.showProjectManager) window.showProjectManager();
            if (window.showNotification) window.showNotification('Login realizado!', 'success');
            
        } catch (error) {
            console.error('❌ Login error:', error);
            if (error.message.includes('Failed to fetch')) {
                throw new Error('Não foi possível conectar ao servidor Python (localhost:8000). Ele está rodando?');
            }
            throw error;
        }
    }

    async register(email, password, name) {
        const baseUrl = this.config.API_BASE_URL.replace(/\/$/, '');
        const registerUrl = `${baseUrl}/auth/register`;

        try {
            const response = await fetch(registerUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email, password: password, full_name: name })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Falha no registro');
            }

            // Login automático após registro
            await this.login(email, password);
            
        } catch (error) {
            console.error('❌ Registration error:', error);
            throw error;
        }
    }

    async validateToken() {
        if (!this.token) return false;
        try {
            const tokenData = JSON.parse(atob(this.token.split('.')[1]));
            return (tokenData.exp * 1000) > Date.now();
        } catch (e) {
            return false;
        }
    }

    getAuthHeaders() {
        return {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json'
        };
    }

    showAuthError(message) {
        const authForm = document.getElementById('auth-form');
        const submitBtn = document.getElementById('auth-submit');
        
        // Remove erro anterior
        const oldError = document.querySelector('.auth-error');
        if (oldError) oldError.remove();

        const errorEl = document.createElement('div');
        errorEl.className = 'auth-error animate__animated animate__shakeX';
        errorEl.innerHTML = `<i class="fas fa-exclamation-circle"></i> <span>${message}</span>`;
        
        if (authForm && submitBtn) {
            authForm.insertBefore(errorEl, submitBtn);
        }
        
        setTimeout(() => { if (errorEl.parentElement) errorEl.remove(); }, 5000);
    }

    async logout() {
        this.clearAuthData();
        window.location.reload();
    }

    clearAuthData() {
        this.currentUser = null;
        this.token = null;
        localStorage.removeItem('dashmaster_user');
        localStorage.removeItem('dashmaster_token');
        localStorage.removeItem('currentUser'); // Limpeza legado
        
        if (window.showAuthScreen) window.showAuthScreen();
    }

    isAuthenticated() {
        return !!this.token;
    }
}

// Instanciação
document.addEventListener('DOMContentLoaded', () => {
    window.authManager = new AuthManager();
});
