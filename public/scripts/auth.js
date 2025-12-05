// ===== AUTHENTICATION MANAGER - INTEGRAÇÃO COM BACKEND PYTHON =====
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.isLoginMode = true;
        
        // Configurações da API - serão sobrescritas por config.js
        this.config = {
            API_BASE_URL: 'http://localhost:8000', // Default, será atualizado
            ENDPOINTS: {
                LOGIN: '/auth/token',            // CORRIGIDO: /auth/token em vez de /api/auth/login
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
            this.config.API_BASE_URL = config.API_BASE_URL;
        }
        if (config.ENDPOINTS) {
            this.config.ENDPOINTS = { ...this.config.ENDPOINTS, ...config.ENDPOINTS };
        }
    }

    async init() {
        console.log('🚀 Initializing AuthManager with Python Backend...');
        console.log(`📡 API Base URL: ${this.config.API_BASE_URL}`);
        
        this.setupLocalAuth();
    }

    setupLocalAuth() {
        console.log('🔐 Setting up authentication forms...');
        
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
                        // Token expirado, força logout
                        this.clearAuthData();
                        this.showAuthScreen();
                    }
                });
                
            } catch (e) {
                console.warn('⚠️ Invalid saved user data, clearing...');
                this.clearAuthData();
            }
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
        
        // Google Sign-In button (se existir)
        const googleBtn = document.getElementById('google-signin');
        if (googleBtn) {
            googleBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.loginWithGoogle();
            });
        }
        
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
        console.log('🔑 Autenticando com API Python...', email);
        
        try {
            // CORREÇÃO: FastAPI espera os dados como formulário (x-www-form-urlencoded), não JSON
            const formData = new URLSearchParams();
            formData.append('username', email); // FastAPI usa 'username' por padrão, mesmo sendo email
            formData.append('password', password);

            // CORREÇÃO: A rota correta definida no FastAPI é '/auth/token', não '/auth/login'
            const response = await fetch(`${this.config.API_BASE_URL}/auth/token`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/x-www-form-urlencoded' 
                },
                body: formData
            });

            if (!response.ok) {
                // Tenta ler a mensagem de erro do backend
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.detail || 'Falha na conexão ou credenciais inválidas');
            }

            const data = await response.json();
            
            // CORREÇÃO DE SEGURANÇA: Salvar apenas o token e dados não sensíveis
            this.currentUser = {
                email: email,
                name: email.split('@')[0] // Nome temporário baseado no email
            };
            
            this.token = data.access_token;
            
            // NUNCA salvar senhas no localStorage!
            localStorage.setItem('dashmaster_user', JSON.stringify(this.currentUser));
            localStorage.setItem('dashmaster_token', this.token);
            
            // Se houver refresh token, salvar também
            if (data.refresh_token) {
                localStorage.setItem('dashmaster_refresh_token', data.refresh_token);
            }
            
            console.log('✅ Login successful via Python API:', this.currentUser);
            
            // Update AppState
            window.AppState.currentUser = this.currentUser;
            window.AppState.token = this.token;
            
            // Show success and navigate
            if (window.showProjectManager) {
                window.showProjectManager();
            }
            
            if (window.showNotification) {
                window.showNotification('Login realizado com sucesso!', 'success');
            }
            
        } catch (error) {
            console.error('❌ Login error:', error);
            
            // Mensagem amigável se o servidor estiver desligado
            if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
                throw new Error('Não foi possível conectar ao servidor. Verifique se o Python está rodando.');
            }
            
            throw error;
        }
    }

    async register(email, password, name) {
        console.log('📝 Attempting to register with Python Backend:', { email, name });
        
        try {
            // Para registro, ainda usamos JSON
            const response = await fetch(`${this.config.API_BASE_URL}${this.config.ENDPOINTS.REGISTER}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email,
                    password: password,
                    name: name
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || errorData.message || 'Falha no registro');
            }

            const data = await response.json();
            
            if (data.status !== 'success') {
                throw new Error(data.message || 'Falha no registro');
            }
            
            // CORREÇÃO DE SEGURANÇA: Salvar apenas o token e dados não sensíveis
            this.currentUser = {
                id: data.user.id,
                email: data.user.email,
                name: data.user.name,
                created_at: data.user.created_at
            };
            
            this.token = data.access_token;
            
            // NUNCA salvar senhas no localStorage!
            localStorage.setItem('dashmaster_user', JSON.stringify(this.currentUser));
            localStorage.setItem('dashmaster_token', this.token);
            
            if (data.refresh_token) {
                localStorage.setItem('dashmaster_refresh_token', data.refresh_token);
            }
            
            console.log('✅ User registered successfully via Python API:', this.currentUser);
            
            // Update AppState
            window.AppState.currentUser = this.currentUser;
            window.AppState.token = this.token;
            
            // Show success and navigate
            if (window.showProjectManager) {
                window.showProjectManager();
            }
            
            if (window.showNotification) {
                window.showNotification('Conta criada com sucesso!', 'success');
            }
            
            // Switch back to login mode for next time
            this.isLoginMode = true;
            this.updateAuthUI();
            
        } catch (error) {
            console.error('❌ Registration error:', error);
            
            // Log adicional para debugging
            if (error.message.includes('NetworkError') || error.message.includes('Failed to fetch')) {
                throw new Error('Não foi possível conectar ao servidor. Verifique sua conexão.');
            }
            
            throw error;
        }
    }

    async loginWithGoogle() {
        try {
            // Primeiro, autentica com Google
            const googleUser = await this.googleSignIn();
            const idToken = googleUser.getAuthResponse().id_token;
            
            // Envia token para nosso backend
            const response = await fetch(`${this.config.API_BASE_URL}${this.config.ENDPOINTS.GOOGLE_AUTH}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token: idToken })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Falha na autenticação Google');
            }

            const data = await response.json();
            
            if (data.status !== 'success') {
                throw new Error(data.message || 'Falha na autenticação Google');
            }
            
            // Salva dados do usuário
            this.currentUser = data.user;
            this.token = data.access_token;
            
            localStorage.setItem('dashmaster_user', JSON.stringify(this.currentUser));
            localStorage.setItem('dashmaster_token', this.token);
            
            window.AppState.currentUser = this.currentUser;
            window.AppState.token = this.token;
            
            if (window.showProjectManager) {
                window.showProjectManager();
            }
            
        } catch (error) {
            console.error('❌ Google login error:', error);
            this.showAuthError('Falha na autenticação com Google');
        }
    }

    async googleSignIn() {
        return new Promise((resolve, reject) => {
            // Inicializa Google Auth se não estiver
            if (!window.gapi || !window.gapi.auth2) {
                reject(new Error('Google Auth não carregado'));
                return;
            }
            
            const auth2 = window.gapi.auth2.getAuthInstance();
            if (!auth2) {
                reject(new Error('Google Auth não inicializado'));
                return;
            }
            
            auth2.signIn().then(resolve).catch(reject);
        });
    }

    async validateToken() {
        if (!this.token) return false;
        
        try {
            // Verifica se token está próximo de expirar (opcional)
            // Pode implementar validação JWT no cliente ou chamar endpoint de validação
            const tokenData = JSON.parse(atob(this.token.split('.')[1]));
            const expirationTime = tokenData.exp * 1000; // Convert to milliseconds
            const currentTime = Date.now();
            
            // Token expirou?
            if (currentTime > expirationTime) {
                console.log('Token expirado, tentando refresh...');
                return await this.refreshToken();
            }
            
            // Token ainda válido (com 5 minutos de margem)
            return (expirationTime - currentTime) > (5 * 60 * 1000);
            
        } catch (error) {
            console.error('❌ Token validation error:', error);
            return false;
        }
    }

    async refreshToken() {
        try {
            const refreshToken = localStorage.getItem('dashmaster_refresh_token');
            if (!refreshToken) return false;
            
            const response = await fetch(`${this.config.API_BASE_URL}${this.config.ENDPOINTS.REFRESH_TOKEN}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify({ refresh_token: refreshToken })
            });

            if (!response.ok) {
                return false;
            }

            const data = await response.json();
            
            if (data.status === 'success') {
                this.token = data.access_token;
                localStorage.setItem('dashmaster_token', this.token);
                
                if (data.refresh_token) {
                    localStorage.setItem('dashmaster_refresh_token', data.refresh_token);
                }
                
                return true;
            }
            
            return false;
            
        } catch (error) {
            console.error('❌ Token refresh error:', error);
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
            
            // Clear local data - CORREÇÃO DE SEGURANÇA
            this.clearAuthData();
            
            // Clear AppState
            window.AppState.currentUser = null;
            window.AppState.token = null;
            
            // Redirect to login
            if (window.showAuthScreen) {
                window.showAuthScreen();
            } else {
                window.location.reload();
            }
            
            if (window.showNotification) {
                window.showNotification('Logout realizado com sucesso', 'info');
            }
            
        } catch (error) {
            console.error('❌ Error logging out:', error);
            
            // Mesmo com erro, limpa os dados locais
            this.clearAuthData();
            
            if (window.showNotification) {
                window.showNotification('Erro ao fazer logout', 'error');
            }
        }
    }

    clearAuthData() {
        // CORREÇÃO DE SEGURANÇA: Remove todos os dados de autenticação
        this.currentUser = null;
        this.token = null;
        
        localStorage.removeItem('dashmaster_user');
        localStorage.removeItem('dashmaster_token');
        localStorage.removeItem('dashmaster_refresh_token');
        
        // REMOVE COMPLETAMENTE os dados antigos e inseguros
        localStorage.removeItem('currentUser');
        localStorage.removeItem('users'); // ⚠️ Remove as senhas em texto plano!
        sessionStorage.clear();
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
// Espera o DOM estar carregado e as configurações disponíveis
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
});

// Export para módulos ES6 (se aplicável)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AuthManager;
}

console.log('✅ AuthManager loaded and ready for Python Backend integration');