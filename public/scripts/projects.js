// ===== PROJECT MANAGER =====

class ProjectManager {
    constructor() {
        this.currentProject = null;
        this.projects = [];
        this.filteredProjects = [];
        this.currentFilter = 'all';
        this.searchTerm = '';
        this.init();
        window.projectManager = this; // Expose globally for onclick handlers
    }

    init() {
        this.loadUserProjects();
        this.setupEventListeners();
    }

    /**
     * Buscar projetos do usuário na API
     */
    async loadUserProjects() {
        console.log('📂 Buscando projetos na API...');
        try {
            const currentUser = window.AppState?.currentUser;
            if (!currentUser) {
                this.projects = [];
                this.applyFilters();
                return;
            }

            const headers = window.authManager?.getAuthHeaders();
            if (!headers) {
                console.error('Erro: Cabeçalhos de autenticação não disponíveis');
                this.projects = [];
                this.applyFilters();
                return;
            }

            const response = await fetch(`${window.AppConfig.API.BASE_URL}/projects`, {
                headers
            });

            if (response.status === 401) {
                console.warn('⚠️ Sessão expirada (401). Redirecionando para login...');
                if (window.authManager) window.authManager.logout();
                return;
            }

            if (response.ok) {
                this.projects = await response.json();
                console.log(`✅ ${this.projects.length} projetos carregados`);
            } else {
                console.error('❌ Erro ao carregar projetos da API:', response.status);
                this.projects = [];
            }
        } catch (error) {
            console.error('❌ Erro ao carregar projetos:', error);
            this.projects = [];
        } finally {
            this.applyFilters();
        }
    }

    /**
     * Salvar projetos na API
     */
    async saveProjects() {
        try {
            // Para projetos existentes, atualizar via API
            // Nota: Em uma implementação real, você precisaria de um endpoint específico
            // para atualizar múltiplos projetos ou fazer um loop individual
            console.warn('saveProjects() - Método não implementado para API');
            console.log('Salvando projetos seria feito individualmente via PUT/PATCH');
        } catch (error) {
            console.error('❌ Erro ao salvar projetos:', error);
        }
    }

    setupEventListeners() {
        // Novo Projeto
        const newProjectBtn = document.getElementById('new-project-btn');
        const emptyNewProjectBtn = document.getElementById('empty-new-project');

        if (newProjectBtn) {
            newProjectBtn.addEventListener('click', () => this.showNewProjectModal());
        }

        if (emptyNewProjectBtn) {
            emptyNewProjectBtn.addEventListener('click', () => this.showNewProjectModal());
        }

        // Fechar Modal
        const closeModalBtn = document.getElementById('close-new-project');
        const cancelModalBtn = document.getElementById('cancel-new-project');

        if (closeModalBtn) {
            closeModalBtn.addEventListener('click', () => this.hideNewProjectModal());
        }

        if (cancelModalBtn) {
            cancelModalBtn.addEventListener('click', () => this.hideNewProjectModal());
        }

        // Criar Projeto (Submit)
        const createProjectBtn = document.getElementById('create-project');
        if (createProjectBtn) {
            createProjectBtn.addEventListener('click', () => this.createProject());
        }

        // Validação de URL
        const validateUrlBtn = document.getElementById('validate-url');
        if (validateUrlBtn) {
            validateUrlBtn.addEventListener('click', () => this.validateSpreadsheetUrl());
        }

        // Busca
        const searchInput = document.getElementById('project-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchTerm = e.target.value.toLowerCase();
                this.applyFilters();
            });
        }

        // Filtros (Abas)
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const filter = e.target.getAttribute('data-filter');
                this.setFilter(filter);
            });
        });

        // Ordenação
        const sortBtn = document.getElementById('sort-projects');
        if (sortBtn) {
            sortBtn.addEventListener('click', () => this.toggleSort());
        }
    }

    showNewProjectModal() {
        const modal = document.getElementById('new-project-modal');
        if (modal) {
            modal.style.display = 'flex';
            const nameInput = document.getElementById('project-name');
            if (nameInput) nameInput.focus();
        }
    }

    hideNewProjectModal() {
        const modal = document.getElementById('new-project-modal');
        if (modal) {
            modal.style.display = 'none';

            // Limpar formulário
            const nameInput = document.getElementById('project-name');
            const urlInput = document.getElementById('spreadsheet-url');

            if (nameInput) nameInput.value = '';
            if (urlInput) urlInput.value = '';

            // Desmarcar todas as categorias
            document.querySelectorAll('.category-checkbox').forEach(cb => {
                cb.checked = false;
            });

            this.removeUrlValidationMessages();
        }
    }

    async validateSpreadsheetUrl() {
        const urlInput = document.getElementById('spreadsheet-url');
        if (!urlInput) return;

        const url = urlInput.value.trim();

        if (!url) {
            this.showUrlValidationError('Por favor, insira uma URL');
            return;
        }

        // Padrões de URL do Google Sheets
        const patterns = [
            /https:\/\/docs\.google\.com\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/,
            /https:\/\/docs\.google\.com\/spreadsheets\/u\/\d+\/d\/([a-zA-Z0-9-_]+)/
        ];

        let isValid = false;
        let sheetId = null;

        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match) {
                isValid = true;
                sheetId = match[1];
                break;
            }
        }

        if (!isValid) {
            this.showUrlValidationError('URL do Google Sheets inválida');
            return;
        }

        // Mostrar validação em progresso
        const validateBtn = document.getElementById('validate-url');
        const originalText = validateBtn ? validateBtn.innerHTML : 'Validar';
        if (validateBtn) {
            validateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Validando...';
            validateBtn.disabled = true;
        }

        try {
            // Nota: Em um ambiente real sem backend, o CORS pode bloquear o fetch direto.
            // Para fins de demonstração, assumimos sucesso se a URL tiver o formato correto.
            await new Promise(resolve => setTimeout(resolve, 1000));

            this.showUrlValidationSuccess('URL válida! Formato reconhecido.');

        } catch (error) {
            console.warn('Não foi possível verificar a planilha:', error);
            this.showUrlValidationSuccess('URL válida (verificação offline).');
        } finally {
            if (validateBtn) {
                validateBtn.innerHTML = originalText;
                validateBtn.disabled = false;
            }
        }
    }

    showUrlValidationError(message) {
        this.removeUrlValidationMessages();

        const urlGroup = document.querySelector('.url-input-group');
        if (!urlGroup) return;

        const errorEl = document.createElement('div');
        errorEl.className = 'validation-error';
        errorEl.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;

        urlGroup.parentNode.insertBefore(errorEl, urlGroup.nextSibling);
    }

    showUrlValidationSuccess(message) {
        this.removeUrlValidationMessages();

        const urlGroup = document.querySelector('.url-input-group');
        if (!urlGroup) return;

        const successEl = document.createElement('div');
        successEl.className = 'validation-success';
        successEl.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;

        urlGroup.parentNode.insertBefore(successEl, urlGroup.nextSibling);
    }

    removeUrlValidationMessages() {
        document.querySelectorAll('.validation-error, .validation-success').forEach(el => {
            el.remove();
        });
    }

    async createProject() {
        const nameInput = document.getElementById('project-name');
        const urlInput = document.getElementById('spreadsheet-url');

        if (!nameInput || !urlInput) {
            console.error('❌ Erro: Elementos do formulário não encontrados (project-name ou spreadsheet-url)');
            alert('Erro interno: Formulário incompleto. Recarregue a página.');
            return;
        }

        console.log('🚀 Criando projeto:', nameInput.value);

        const name = nameInput.value.trim();
        const spreadsheetUrl = urlInput.value.trim();

        // Validações
        if (!name) {
            this.showModalError('Por favor, informe um nome para o projeto');
            return;
        }

        if (!spreadsheetUrl) {
            this.showModalError('Por favor, informe a URL da planilha');
            return;
        }

        // Verificar categorias selecionadas
        const selectedCategories = [];
        document.querySelectorAll('.category-checkbox:checked').forEach(cb => {
            selectedCategories.push(cb.value);
        });

        if (selectedCategories.length === 0) {
            this.showModalError('Selecione pelo menos uma categoria de KPI');
            return;
        }

        // Obter configurações adicionais
        const autoRefreshCheck = document.getElementById('auto-refresh');
        const emailReportsCheck = document.getElementById('email-reports');

        const autoRefresh = autoRefreshCheck ? autoRefreshCheck.checked : false;
        const emailReports = emailReportsCheck ? emailReportsCheck.checked : false;

        // Mostrar loading
        const createBtn = document.getElementById('create-project');
        const originalText = createBtn ? createBtn.innerHTML : 'Criar';
        if (createBtn) {
            createBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Criando...';
            createBtn.disabled = true;
        }

        try {
            // Preparar payload para a API
            const payload = {
                name,
                spreadsheet_url: spreadsheetUrl,
                categories: selectedCategories,
                settings: {
                    auto_refresh: autoRefresh,
                    email_reports: emailReports,
                    theme: 'light',
                    notifications: true
                }
            };

            // Criar projeto na API
            const headers = window.authManager?.getAuthHeaders();
            if (!headers) {
                throw new Error('Autenticação não disponível');
            }

            const response = await fetch(`${window.AppConfig.API.BASE_URL}/projects`, {
                method: 'POST',
                headers: {
                    ...headers,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Erro ${response.status} ao criar projeto`);
            }

            const newProject = await response.json();

            // Adicionar aos projetos locais
            this.projects.push(newProject);

            // Fechar modal
            this.hideNewProjectModal();

            // Atualizar lista
            this.applyFilters();

            // Abrir o projeto
            this.openProject(newProject);

            if (window.showNotification) {
                window.showNotification(`Projeto "${name}" criado com sucesso!`, 'success');
            }

        } catch (error) {
            console.error('Erro ao criar projeto:', error);
            this.showModalError(error.message || 'Erro ao criar projeto. Tente novamente.');
        } finally {
            if (createBtn) {
                createBtn.innerHTML = originalText;
                createBtn.disabled = false;
            }
        }
    }

    showModalError(message) {
        this.removeModalErrors();

        const modalBody = document.querySelector('.modal-body');
        if (!modalBody) {
            alert(message);
            return;
        }

        const errorEl = document.createElement('div');
        errorEl.className = 'modal-error animate__animated animate__shakeX';
        errorEl.innerHTML = `
            <i class="fas fa-exclamation-circle"></i>
            <span>${message}</span>
        `;

        modalBody.insertBefore(errorEl, modalBody.firstChild);

        setTimeout(() => {
            if (errorEl.parentElement) {
                errorEl.remove();
            }
        }, 5000);
    }

    removeModalErrors() {
        document.querySelectorAll('.modal-error').forEach(el => {
            el.remove();
        });
    }

    applyFilters() {
        let filtered = [...this.projects];

        // Aplicar filtro de status
        if (this.currentFilter === 'active') {
            filtered = filtered.filter(p => p.is_active && !p.is_archived);
        } else if (this.currentFilter === 'archived') {
            filtered = filtered.filter(p => p.is_archived);
        }

        // Aplicar busca
        if (this.searchTerm) {
            filtered = filtered.filter(p =>
                p.name.toLowerCase().includes(this.searchTerm) ||
                p.categories.some(cat => cat.toLowerCase().includes(this.searchTerm))
            );
        }

        this.filteredProjects = filtered;
        this.renderProjects();
        this.updateStats();
    }

    setFilter(filter) {
        this.currentFilter = filter;

        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('data-filter') === filter) {
                btn.classList.add('active');
            }
        });

        this.applyFilters();
    }

    toggleSort() {
        const sortBtn = document.getElementById('sort-projects');
        if (!sortBtn) return;

        const currentSort = sortBtn.getAttribute('data-sort') || 'date';

        if (currentSort === 'date') {
            // Ordenar por nome
            this.filteredProjects.sort((a, b) =>
                a.name.localeCompare(b.name, 'pt-BR', { sensitivity: 'base' })
            );
            sortBtn.innerHTML = '<i class="fas fa-sort-alpha-down"></i> Nome';
            sortBtn.setAttribute('data-sort', 'name');
        } else {
            // Ordenar por data (mais recente primeiro)
            this.filteredProjects.sort((a, b) =>
                new Date(b.updated_at) - new Date(a.updated_at)
            );
            sortBtn.innerHTML = '<i class="fas fa-sort-amount-down"></i> Data';
            sortBtn.setAttribute('data-sort', 'date');
        }

        this.renderProjects();
    }

    renderProjects() {
        const projectsGrid = document.getElementById('projects-grid');
        const emptyState = document.querySelector('.empty-projects'); // Ajustado seletor

        if (!projectsGrid) return;

        if (this.filteredProjects.length === 0) {
            projectsGrid.innerHTML = ''; // Limpa grid
            if (emptyState) emptyState.style.display = 'block';

            // Se houver um container específico de "não encontrado" dentro da grid, mostramos ele
            // Caso contrário, deixamos o emptyState padrão do HTML
            return;
        }

        if (emptyState) emptyState.style.display = 'none';

        // Renderizar projetos
        projectsGrid.innerHTML = this.filteredProjects.map((project, index) => `
            <div class="project-card animate__animated animate__fadeIn" 
                 style="animation-delay: ${index * 50}ms"
                 data-project-id="${project.id}">
                
                <div class="project-card-header">
                    <div class="project-card-title-group">
                        <h3 class="project-card-title">${project.name}</h3>
                        ${project.is_archived ?
                '<span class="project-badge archived">Arquivado</span>' :
                project.is_active ?
                    '<span class="project-badge active">Ativo</span>' :
                    '<span class="project-badge inactive">Inativo</span>'
            }
                    </div>
                    <div class="project-card-actions">
                        <button class="project-card-action" onclick="window.projectManager.openProjectById('${project.id}')" 
                                title="Abrir Dashboard">
                            <i class="fas fa-chart-bar"></i>
                        </button>
                        <button class="project-card-action" onclick="window.projectManager.toggleArchive('${project.id}')"
                                title="${project.is_archived ? 'Desarquivar' : 'Arquivar'}">
                            <i class="fas ${project.is_archived ? 'fa-folder-open' : 'fa-archive'}"></i>
                        </button>
                        <button class="project-card-action danger" onclick="window.projectManager.deleteProject('${project.id}')"
                                title="Excluir">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                
                <div class="project-card-categories">
                    ${project.categories.slice(0, 3).map(cat => `
                        <span class="category-tag" style="background: ${this.getCategoryColor(cat)}">
                            <i class="${this.getCategoryIcon(cat)}"></i>
                            ${this.getCategoryName(cat)}
                        </span>
                    `).join('')}
                    ${project.categories.length > 3 ? `<span class="category-tag">+${project.categories.length - 3}</span>` : ''}
                </div>
                
                <div class="project-card-description">
                    <p>${this.generateProjectDescription(project)}</p>
                </div>
                
                <div class="project-card-footer">
                    <div class="project-card-dates">
                        <span class="date-item">
                            <i class="fas fa-sync"></i>
                            ${this.formatDate(project.updated_at)}
                        </span>
                    </div>
                    <button class="project-card-btn" onclick="window.projectManager.openProjectById('${project.id}')">
                        <i class="fas fa-arrow-right"></i> Abrir
                    </button>
                </div>
            </div>
        `).join('');
    }

    updateStats() {
        const totalEl = document.getElementById('total-projects');
        const activeEl = document.getElementById('active-projects');

        if (totalEl) {
            totalEl.textContent = this.projects.length;
        }

        if (activeEl) {
            const activeCount = this.projects.filter(p => p.is_active && !p.is_archived).length;
            activeEl.textContent = activeCount;
        }
    }

    generateProjectDescription(project) {
        return `Dashboard com ${project.categories.length} categoria(s) monitorada(s).`;
    }

    // Método auxiliar para abrir projeto via ID (usado no HTML onclick)
    openProjectById(projectId) {
        const project = this.projects.find(p => p.id === projectId);
        if (project) {
            this.openProject(project);
        }
    }

    async openProject(project) {
        if (!project) return;

        console.log(`🚀 Abrindo projeto: ${project.name}`);

        // --- CORREÇÃO: Garante que stats existe antes de usar ---
        if (!project.stats) {
            project.stats = {
                views: 0,
                exports: 0,
                last_data_update: null
            };
        }
        // -------------------------------------------------------

        try {
            // Atualizar estatísticas de visualização na API
            const headers = window.authManager?.getAuthHeaders();
            if (headers) {
                // Aqui você pode fazer um PATCH para atualizar as views
                // Exemplo: await fetch(`${window.AppConfig.API.BASE_URL}/projects/${project.id}/view`, { method: 'POST', headers });

                // Por enquanto, atualizamos localmente
                project.stats.views = (project.stats.views || 0) + 1;
                project.last_accessed = new Date().toISOString();
            }

        } catch (error) {
            console.warn('Não foi possível atualizar estatísticas:', error);
        }

        // Definir como projeto atual globalmente
        this.currentProject = project;
        if (window.AppState) {
            window.AppState.currentProject = project;
        }

        // Atualizar UI do dashboard
        this.updateDashboardUI(project);

        // Mostrar dashboard
        if (window.showDashboard) {
            window.showDashboard();
        }

        // Carregar dados (chamar refreshData do main.js)
        if (window.refreshData) {
            window.refreshData();
        }
    }

    updateDashboardUI(project) {
        // Atualizar título do projeto no header
        const projectTitleEl = document.getElementById('project-title');

        if (projectTitleEl) {
            projectTitleEl.textContent = project.name;
        }

        // Atualizar navegação com categorias do projeto
        this.updateNavigation(project.categories);
    }

    updateNavigation(categories) {
        const navContainer = document.querySelector('.nav-categories');
        if (!navContainer) return;

        navContainer.innerHTML = '';

        categories.forEach((category, index) => {
            const btn = document.createElement('button');
            btn.className = `nav-category ${index === 0 ? 'active' : ''}`;
            btn.setAttribute('data-category', category);
            btn.onclick = () => {
                // Remove active de todos
                document.querySelectorAll('.nav-category').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                // Carrega dashboard
                if (window.loadDashboard) {
                    window.loadDashboard(category);
                }
            };

            btn.innerHTML = `
                <i class="${this.getCategoryIcon(category)}"></i>
                <span>${this.getCategoryName(category)}</span>
            `;

            navContainer.appendChild(btn);
        });

        // Carregar a primeira categoria automaticamente
        if (categories.length > 0 && window.loadDashboard) {
            window.loadDashboard(categories[0]);
        }
    }

    async toggleArchive(projectId) {
        const project = this.projects.find(p => p.id === projectId);
        if (!project) return;

        try {
            const headers = window.authManager?.getAuthHeaders();
            if (!headers) {
                throw new Error('Autenticação não disponível');
            }

            // Fazer requisição para arquivar/desarquivar
            const response = await fetch(`${window.AppConfig.API.BASE_URL}/projects/${projectId}`, {
                method: 'PATCH',
                headers: {
                    ...headers,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    is_archived: !project.is_archived
                })
            });

            if (!response.ok) {
                throw new Error(`Erro ${response.status} ao atualizar projeto`);
            }

            // Atualizar localmente
            project.is_archived = !project.is_archived;
            project.updated_at = new Date().toISOString();

            this.applyFilters();

            const action = project.is_archived ? 'arquivado' : 'desarquivado';
            if (window.showNotification) {
                window.showNotification(`Projeto ${action} com sucesso`, 'success');
            }

        } catch (error) {
            console.error('Erro ao arquivar projeto:', error);
            if (window.showNotification) {
                window.showNotification('Erro ao arquivar projeto', 'error');
            }
        }
    }

    async deleteProject(projectId) {
        if (!confirm('Tem certeza que deseja excluir este projeto? Esta ação não pode ser desfeita.')) {
            return;
        }

        try {
            const headers = window.authManager?.getAuthHeaders();
            if (!headers) {
                throw new Error('Autenticação não disponível');
            }

            const response = await fetch(`${window.AppConfig.API.BASE_URL}/projects/${projectId}`, {
                method: 'DELETE',
                headers
            });

            if (!response.ok) {
                throw new Error(`Erro ${response.status} ao excluir projeto`);
            }

            // Remover da lista local
            const projectIndex = this.projects.findIndex(p => p.id === projectId);
            if (projectIndex !== -1) {
                const projectName = this.projects[projectIndex].name;
                this.projects.splice(projectIndex, 1);

                // Se o projeto excluído era o atual, limpar
                if (this.currentProject?.id === projectId) {
                    this.currentProject = null;
                    if (window.AppState) window.AppState.currentProject = null;
                }

                this.applyFilters();

                if (window.showNotification) {
                    window.showNotification(`Projeto "${projectName}" excluído`, 'info');
                }
            }

        } catch (error) {
            console.error('Erro ao excluir projeto:', error);
            if (window.showNotification) {
                window.showNotification('Erro ao excluir projeto', 'error');
            }
        }
    }

    // Métodos utilitários
    getCategoryName(category) {
        const names = {
            'email': 'E-mail Marketing',
            'social': 'Redes Sociais',
            'seo': 'SEO',
            'ecommerce': 'E-commerce',
            'google-ads': 'Google Ads',
            'meta-ads': 'Meta Ads',
            'blog': 'Blog'
        };
        return names[category] || category;
    }

    getCategoryIcon(category) {
        const icons = {
            'email': 'fas fa-envelope',
            'social': 'fas fa-share-alt',
            'seo': 'fas fa-search',
            'ecommerce': 'fas fa-shopping-cart',
            'google-ads': 'fab fa-google',
            'meta-ads': 'fab fa-facebook',
            'blog': 'fas fa-blog'
        };
        return icons[category] || 'fas fa-chart-bar';
    }

    getCategoryColor(category) {
        const colors = {
            'email': 'rgba(26, 115, 232, 0.1)',
            'social': 'rgba(66, 133, 244, 0.1)',
            'seo': 'rgba(52, 168, 83, 0.1)',
            'ecommerce': 'rgba(249, 171, 0, 0.1)',
            'google-ads': 'rgba(234, 67, 53, 0.1)',
            'meta-ads': 'rgba(59, 89, 152, 0.1)',
            'blog': 'rgba(156, 39, 176, 0.1)'
        };
        return colors[category] || 'rgba(158, 158, 158, 0.1)';
    }

    formatDate(dateString) {
        if (!dateString) return '--/--/----';
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }
}


// ===== EXPORTAÇÃO =====
window.ProjectManager = ProjectManager;

// Instanciar o ProjectManager quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    if (!window.projectManager) {
        window.projectManager = new ProjectManager();
        console.log('✅ ProjectManager instanciado via projects.js');
    }
});

// Funções globais auxiliares que podem ser chamadas pelo HTML
window.createNewProject = function () {
    if (window.projectManager) {
        window.projectManager.showNewProjectModal();
    } else {
        console.error('ProjectManager não encontrado!');
        // Tentar recuperar ou instanciar de emergência
        if (window.ProjectManager) {
            window.projectManager = new window.ProjectManager();
            window.projectManager.showNewProjectModal();
        }
    }
};
