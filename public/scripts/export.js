// ===== EXPORT MANAGER =====

class ExportManager {
    constructor() {
        this.pdf = null;
        this.exportQueue = [];
        this.isExporting = false;
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.loadExportHistory();
    }
    
    setupEventListeners() {
        // PDF Export
        const pdfBtn = document.getElementById('download-pdf');
        if (pdfBtn) {
            pdfBtn.addEventListener('click', () => {
                this.exportAsPDF();
            });
        }
        
        // PNG Export
        const pngBtn = document.getElementById('download-png');
        if (pngBtn) {
            pngBtn.addEventListener('click', () => {
                this.exportChartsAsPNG();
            });
        }
        
        // Excel Export
        const excelBtn = document.getElementById('download-excel');
        if (excelBtn) {
            excelBtn.addEventListener('click', () => {
                this.exportAsExcel();
            });
        }
        
        // CSV Export
        const csvBtn = document.getElementById('export-table');
        if (csvBtn) {
            csvBtn.addEventListener('click', () => {
                this.exportTableAsCSV();
            });
        }
        
        // Share Buttons
        const shareWhatsApp = document.getElementById('share-whatsapp');
        const shareEmail = document.getElementById('share-email');
        const shareLink = document.getElementById('share-link');
        
        if (shareWhatsApp) {
            shareWhatsApp.addEventListener('click', () => {
                this.shareViaWhatsApp();
            });
        }
        
        if (shareEmail) {
            shareEmail.addEventListener('click', () => {
                this.shareViaEmail();
            });
        }
        
        if (shareLink) {
            shareLink.addEventListener('click', () => {
                this.shareViaLink();
            });
        }
        
        // Presentation Mode
        const presentationBtn = document.getElementById('presentation-mode');
        const slideshowBtn = document.getElementById('slideshow-mode');
        
        if (presentationBtn) {
            presentationBtn.addEventListener('click', () => {
                this.startPresentationMode();
            });
        }
        
        if (slideshowBtn) {
            slideshowBtn.addEventListener('click', () => {
                this.startSlideshow();
            });
        }
    }
    
    async exportAsPDF() {
        try {
            this.showLoading('Gerando PDF...');
            
            // Inicializar PDF
            this.pdf = new jspdf.jsPDF({
                orientation: 'landscape',
                unit: 'mm',
                format: 'a4'
            });
            
            const pageWidth = this.pdf.internal.pageSize.getWidth();
            const pageHeight = this.pdf.internal.pageSize.getHeight();
            
            // Adicionar capa
            await this.addCoverPage();
            
            // Adicionar resumo executivo
            await this.addExecutiveSummary();
            
            // Adicionar KPIs
            await this.addKPIsToPDF();
            
            // Adicionar insights
            await this.addInsightsToPDF();
            
            // Adicionar gráficos
            await this.addChartsToPDF();
            
            // Adicionar tabela de dados
            await this.addDataTableToPDF();
            
            // Adicionar conclusão
            await this.addConclusionPage();
            
            // Salvar PDF
            const fileName = this.generateFileName('pdf');
            this.pdf.save(fileName);
            
            this.logExport('pdf', fileName);
            this.showNotification('PDF gerado com sucesso!', 'success');
            
        } catch (error) {
            console.error('Erro ao gerar PDF:', error);
            this.showNotification('Erro ao gerar PDF', 'error');
        } finally {
            this.hideLoading();
            this.pdf = null;
        }
    }
    
    async addCoverPage() {
        const project = window.AppState?.currentProject;
        const category = window.AppState?.currentCategory;
        
        // Configurações
        this.pdf.setFontSize(24);
        this.pdf.setTextColor(26, 115, 232);
        this.pdf.text('Dashboard de Marketing', 20, 40);
        
        this.pdf.setFontSize(18);
        this.pdf.setTextColor(60, 64, 67);
        this.pdf.text(project?.name || 'Relatório de Performance', 20, 60);
        
        this.pdf.setFontSize(14);
        this.pdf.text(`Categoria: ${this.getCategoryName(category)}`, 20, 80);
        
        // Data
        const date = new Date().toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
        
        this.pdf.text(`Data: ${date}`, 20, 95);
        
        // Logo ou ícone
        this.pdf.setFontSize(48);
        this.pdf.text('📊', 240, 50);
        
        // Linha divisória
        this.pdf.setDrawColor(200, 200, 200);
        this.pdf.line(20, 110, 280, 110);
    }
    
    async addExecutiveSummary() {
        this.pdf.addPage();
        
        this.pdf.setFontSize(18);
        this.pdf.setTextColor(26, 115, 232);
        this.pdf.text('Resumo Executivo', 20, 30);
        
        this.pdf.setFontSize(11);
        this.pdf.setTextColor(60, 64, 67);
        
        // Resumo baseado nos insights do Python
        const aiInsights = window.AppState?.aiInsights;
        if (aiInsights) {
            const category = window.AppState?.currentCategory;
            const categoryInsights = aiInsights[category];
            
            let summaryText = `Este relatório apresenta a análise das métricas de ${this.getCategoryName(category)}. `;
            
            if (categoryInsights && categoryInsights.anomalies) {
                const criticalCount = categoryInsights.anomalies.filter(a => 
                    a.severity === 'critical' || a.severity === 'high'
                ).length;
                
                const warningCount = categoryInsights.anomalies.filter(a => 
                    a.severity === 'medium' || a.severity === 'low'
                ).length;
                
                if (criticalCount > 0) {
                    summaryText += `Foram identificadas ${criticalCount} anomalias críticas que requerem atenção imediata. `;
                }
                
                if (warningCount > 0) {
                    summaryText += `Existem ${warningCount} oportunidades de melhoria identificadas. `;
                }
                
                if (criticalCount === 0 && warningCount === 0) {
                    summaryText += 'Nenhuma anomalia significativa foi detectada pelo sistema de IA. ';
                }
            } else {
                summaryText += 'A análise por machine learning foi realizada com sucesso. ';
            }
            
            summaryText += 'Recomenda-se a análise detalhada dos gráficos e insights para tomada de decisão.';
            
            // Adicionar texto formatado
            const lines = this.pdf.splitTextToSize(summaryText, 250);
            this.pdf.text(lines, 20, 50);
        }
        
        // Adicionar métricas chave
        this.pdf.setFontSize(14);
        this.pdf.text('Métricas Principais:', 20, 120);
        
        this.pdf.setFontSize(11);
        // Aqui você pode adicionar as métricas mais importantes
    }
    
    async addKPIsToPDF() {
        const kpiContainer = document.getElementById('kpi-cards');
        if (!kpiContainer) return;
        
        this.pdf.addPage();
        this.pdf.setFontSize(18);
        this.pdf.text('Indicadores de Performance (KPIs)', 20, 30);
        
        try {
            const canvas = await html2canvas(kpiContainer, {
                backgroundColor: '#ffffff',
                scale: 2,
                logging: false
            });
            
            const imgData = canvas.toDataURL('image/png');
            this.pdf.addImage(imgData, 'PNG', 20, 40, 260, 60);
            
        } catch (error) {
            console.error('Erro ao capturar KPIs:', error);
        }
    }
    
    async addInsightsToPDF() {
        const insightsContainer = document.getElementById('insights-container');
        if (!insightsContainer) return;
        
        this.pdf.addPage();
        this.pdf.setFontSize(18);
        this.pdf.text('Diagnósticos e Insights', 20, 30);
        
        try {
            const canvas = await html2canvas(insightsContainer, {
                backgroundColor: '#ffffff',
                scale: 2,
                logging: false
            });
            
            const imgData = canvas.toDataURL('image/png');
            this.pdf.addImage(imgData, 'PNG', 20, 40, 260, 120);
            
        } catch (error) {
            console.error('Erro ao capturar insights:', error);
        }
    }
    
    async addChartsToPDF() {
        const chartsGrid = document.getElementById('charts-grid');
        if (!chartsGrid) return;
        
        this.pdf.addPage();
        this.pdf.setFontSize(18);
        this.pdf.text('Visualizações e Gráficos', 20, 30);
        
        const chartContainers = chartsGrid.querySelectorAll('.chart-container');
        
        for (let i = 0; i < chartContainers.length; i++) {
            if (i > 0 && i % 2 === 0) {
                this.pdf.addPage();
            }
            
            try {
                const canvas = await html2canvas(chartContainers[i], {
                    backgroundColor: '#ffffff',
                    scale: 2,
                    logging: false
                });
                
                const imgData = canvas.toDataURL('image/png');
                const xPosition = (i % 2 === 0) ? 20 : 150;
                const yPosition = 40 + Math.floor(i / 2) * 90;
                
                this.pdf.addImage(imgData, 'PNG', xPosition, yPosition, 120, 80);
                
            } catch (error) {
                console.error(`Erro ao capturar gráfico ${i}:`, error);
            }
        }
    }
    
    async addDataTableToPDF() {
        const tableSection = document.getElementById('data-table-section');
        if (!tableSection || tableSection.style.display === 'none') return;
        
        this.pdf.addPage();
        this.pdf.setFontSize(18);
        this.pdf.text('Dados Detalhados', 20, 30);
        
        try {
            const canvas = await html2canvas(tableSection, {
                backgroundColor: '#ffffff',
                scale: 2,
                logging: false
            });
            
            const imgData = canvas.toDataURL('image/png');
            this.pdf.addImage(imgData, 'PNG', 20, 40, 260, 120);
            
        } catch (error) {
            console.error('Erro ao capturar tabela:', error);
        }
    }
    
    async addConclusionPage() {
        this.pdf.addPage();
        
        this.pdf.setFontSize(18);
        this.pdf.setTextColor(26, 115, 232);
        this.pdf.text('Conclusão e Próximos Passos', 20, 30);
        
        this.pdf.setFontSize(11);
        this.pdf.setTextColor(60, 64, 67);
        
        const conclusionText = `
Este relatório foi gerado automaticamente pelo DashMetrics com análise de machine learning.
Os insights foram produzidos por modelos de inteligência artificial executados no backend Python.

Recomenda-se a revisão periódica das métricas e a implementação 
das ações recomendadas nos insights.

Para mais informações ou suporte técnico, entre em contato 
através do suporte@dashmetrics.com.
        `.trim();
        
        const lines = this.pdf.splitTextToSize(conclusionText, 250);
        this.pdf.text(lines, 20, 50);
        
        // Assinatura
        this.pdf.setFontSize(10);
        this.pdf.setTextColor(128, 128, 128);
        this.pdf.text('Relatório gerado em: ' + new Date().toLocaleString('pt-BR'), 20, 150);
        this.pdf.text('DashMetrics © 2024 - Backend Python com Machine Learning', 20, 160);
    }
    
    async exportChartsAsPNG() {
        try {
            this.showLoading('Exportando gráficos...');
            
            const chartManager = window.chartManager;
            if (!chartManager) {
                throw new Error('Gerenciador de gráficos não encontrado');
            }
            
            const images = chartManager.exportAllChartsAsImages('png', 1.0);
            
            if (images.length === 0) {
                this.showNotification('Nenhum gráfico disponível para exportação', 'warning');
                return;
            }
            
            // Criar ZIP com todos os gráficos
            if (typeof JSZip !== 'undefined') {
                await this.createChartsZip(images);
            } else {
                // Baixar gráficos individualmente
                images.forEach((image, index) => {
                    setTimeout(() => {
                        image.download();
                    }, index * 500);
                });
                
                this.showNotification(`${images.length} gráficos serão baixados`, 'info');
            }
            
            this.logExport('png', `${images.length} gráficos`);
            
        } catch (error) {
            console.error('Erro ao exportar gráficos:', error);
            this.showNotification('Erro ao exportar gráficos', 'error');
        } finally {
            this.hideLoading();
        }
    }
    
    async createChartsZip(images) {
        const zip = new JSZip();
        const folder = zip.folder('graficos');
        
        images.forEach((image, index) => {
            // Converter data URL para blob
            const base64Data = image.dataUrl.split(',')[1];
            folder.file(`${image.id}.png`, base64Data, { base64: true });
        });
        
        // Adicionar README
        const readme = this.createChartsReadme(images);
        folder.file('README.txt', readme);
        
        // Gerar ZIP
        const content = await zip.generateAsync({ type: 'blob' });
        const url = URL.createObjectURL(content);
        const a = document.createElement('a');
        
        a.href = url;
        a.download = `graficos-${new Date().toISOString().split('T')[0]}.zip`;
        a.click();
        
        URL.revokeObjectURL(url);
        
        this.showNotification('Gráficos exportados em ZIP', 'success');
    }
    
    createChartsReadme(images) {
        const category = window.AppState?.currentCategory;
        const date = new Date().toLocaleDateString('pt-BR');
        
        let readme = `ARQUIVOS DE GRÁFICOS - DashMetrics\n`;
        readme += `===================================\n\n`;
        readme += `Categoria: ${this.getCategoryName(category)}\n`;
        readme += `Data de exportação: ${date}\n`;
        readme += `Total de gráficos: ${images.length}\n\n`;
        readme += `LISTA DE ARQUIVOS:\n`;
        
        images.forEach((image, index) => {
            readme += `${index + 1}. ${image.id}.png\n`;
        });
        
        readme += `\nEstes gráficos foram gerados automaticamente pelo DashMetrics.\n`;
        readme += `Backend Python com análise de machine learning.\n`;
        readme += `Para mais informações: https://dashmetrics.com\n`;
        
        return readme;
    }
    
    async exportAsExcel() {
        try {
            this.showLoading('Gerando Excel...');
            
            const category = window.AppState?.currentCategory;
            const data = window.AppState?.sheetData?.[category];
            
            if (!data || data.length === 0) {
                throw new Error('Nenhum dado disponível para exportação');
            }
            
            // Criar workbook
            const wb = XLSX.utils.book_new();
            
            // Dados principais
            const wsData = this.formatDataForExcel(data);
            const ws = XLSX.utils.json_to_sheet(wsData);
            XLSX.utils.book_append_sheet(wb, ws, 'Dados');
            
            // Resumo
            const summaryWs = this.createSummarySheet(data);
            XLSX.utils.book_append_sheet(wb, summaryWs, 'Resumo');
            
            // Insights (nova aba)
            const insightsWs = this.createInsightsSheet();
            if (insightsWs) {
                XLSX.utils.book_append_sheet(wb, insightsWs, 'Insights');
            }
            
            // Gerar arquivo
            const fileName = this.generateFileName('xlsx');
            XLSX.writeFile(wb, fileName);
            
            this.logExport('excel', fileName);
            this.showNotification('Excel gerado com sucesso!', 'success');
            
        } catch (error) {
            console.error('Erro ao gerar Excel:', error);
            this.showNotification('Erro ao gerar Excel', 'error');
        } finally {
            this.hideLoading();
        }
    }
    
    formatDataForExcel(data) {
        if (!data || data.length === 0) return [];
        
        const formattedData = [];
        
        data.forEach((row, index) => {
            // Tenta pegar o mês/data de várias chaves possíveis
            const period = row.mes || row.Mês || row.mes_ano || row.date || `Mês ${index + 1}`;
            
            const formattedRow = {
                'Período': period
            };
            
            // Define a fonte dos dados (raiz ou .data)
            const source = row.data || row;

            Object.entries(source).forEach(([key, value]) => {
                // Ignora chaves de data duplicadas na iteração
                if (['mes', 'Mês', 'mes_ano', 'data', 'date'].includes(key)) return;

                // Formata chave (snake_case para Texto Bonito)
                const label = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                
                formattedRow[label] = typeof value === 'number' ? value : parseFloat(value) || 0;
            });
            
            formattedData.push(formattedRow);
        });
        
        return formattedData;
    }
    
    createSummarySheet(data) {
        const summaryData = [];
        if (!data || data.length === 0) return XLSX.utils.json_to_sheet([]);

        const firstRow = data[0];
        const source = firstRow.data || firstRow;
        const metrics = Object.keys(source).filter(k => !['mes', 'Mês', 'mes_ano', 'data', 'date'].includes(k));

        metrics.forEach(metric => {
            const values = data.map(row => {
                const src = row.data || row;
                return parseFloat(src[metric]) || 0;
            });

            const avg = values.reduce((a, b) => a + b, 0) / values.length;
            const max = Math.max(...values);
            const min = Math.min(...values);
            const lastValue = values[values.length - 1];
            const firstValue = values[0];
            const trend = lastValue - firstValue;
            const trendPercent = firstValue !== 0 ? ((trend / firstValue) * 100) : 0;

            const label = metric.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            
            summaryData.push({
                'Métrica': label,
                'Média': avg.toFixed(2),
                'Máximo': max.toFixed(2),
                'Mínimo': min.toFixed(2),
                'Último Valor': lastValue.toFixed(2),
                'Tendência (abs)': trend.toFixed(2),
                'Tendência (%)': trendPercent.toFixed(1) + '%',
                'Descrição': this.getMetricDescription(metric)
            });
        });
        
        return XLSX.utils.json_to_sheet(summaryData);
    }
    
    createInsightsSheet() {
        const aiInsights = window.AppState?.aiInsights;
        const category = window.AppState?.currentCategory;
        
        if (!aiInsights || !aiInsights[category]) {
            return null;
        }
        
        const insightsData = [];
        const categoryInsights = aiInsights[category];
        
        // Adicionar anomalias
        if (categoryInsights.anomalies && categoryInsights.anomalies.length > 0) {
            categoryInsights.anomalies.forEach(anomaly => {
                insightsData.push({
                    'Tipo': 'Anomalia',
                    'Severidade': anomaly.severity || 'medium',
                    'Métrica': anomaly.metric || '',
                    'Valor': anomaly.value || '',
                    'Mensagem': anomaly.message || '',
                    'Recomendação': anomaly.advice || '',
                    'Timestamp': anomaly.timestamp || new Date().toISOString()
                });
            });
        }
        
        // Adicionar previsões
        if (categoryInsights.predictions && categoryInsights.predictions.length > 0) {
            categoryInsights.predictions.forEach(prediction => {
                insightsData.push({
                    'Tipo': 'Previsão',
                    'Métrica': prediction.metric || '',
                    'Próximo Período': prediction.next_value || '',
                    'Tendência': prediction.trend || '',
                    'Confiança': prediction.confidence ? prediction.confidence + '%' : '',
                    'Mensagem': prediction.message || '',
                    'Recomendação': prediction.advice || ''
                });
            });
        }
        
        // Adicionar insights gerais
        if (categoryInsights.general_insights && categoryInsights.general_insights.length > 0) {
            categoryInsights.general_insights.forEach(insight => {
                insightsData.push({
                    'Tipo': 'Insight',
                    'Mensagem': insight.message || insight.insight || '',
                    'Implicação': insight.implication || '',
                    'Ações': insight.actions ? insight.actions.join('; ') : '',
                    'Fonte': 'Machine Learning'
                });
            });
        }
        
        if (insightsData.length === 0) {
            insightsData.push({
                'Tipo': 'Informação',
                'Mensagem': 'Nenhum insight disponível para esta categoria',
                'Timestamp': new Date().toISOString()
            });
        }
        
        return XLSX.utils.json_to_sheet(insightsData);
    }
    
    async exportTableAsCSV() {
        try {
            const table = document.getElementById('data-table');
            if (!table) {
                throw new Error('Tabela de dados não encontrada');
            }
            
            const csv = [];
            const rows = table.querySelectorAll('tr');
            
            rows.forEach(row => {
                const rowData = [];
                const cells = row.querySelectorAll('th, td');
                
                cells.forEach(cell => {
                    let text = cell.textContent.trim();
                    
                    // Lidar com vírgulas (CSV)
                    if (text.includes(',') || text.includes('"')) {
                        text = `"${text.replace(/"/g, '""')}"`;
                    }
                    
                    rowData.push(text);
                });
                
                csv.push(rowData.join(','));
            });
            
            const csvContent = csv.join('\n');
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            
            a.href = url;
            a.download = this.generateFileName('csv');
            a.click();
            
            URL.revokeObjectURL(url);
            
            this.logExport('csv', 'tabela de dados');
            this.showNotification('CSV exportado com sucesso!', 'success');
            
        } catch (error) {
            console.error('Erro ao exportar CSV:', error);
            this.showNotification('Erro ao exportar CSV', 'error');
        }
    }
    
    shareViaWhatsApp() {
        const project = window.AppState?.currentProject;
        const category = window.AppState?.currentCategory;
        
        const text = `Confira meu dashboard de ${this.getCategoryName(category)} - ${project?.name || 'Dashboard'}\n`;
        const url = encodeURIComponent(window.location.href);
        
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}%0A%0A${url}`, '_blank');
    }
    
    shareViaEmail() {
        const project = window.AppState?.currentProject;
        const category = window.AppState?.currentCategory;
        const date = new Date().toLocaleDateString('pt-BR');
        
        const subject = encodeURIComponent(`Dashboard de ${this.getCategoryName(category)} - ${date}`);
        const body = encodeURIComponent(`
Olá,

Segue o link para o dashboard de ${this.getCategoryName(category)}:
${window.location.href}

Projeto: ${project?.name || 'Dashboard'}
Data: ${date}
Análise: Machine Learning (Python backend)

Atenciosamente,
${window.AppState?.currentUser?.name || 'Usuário DashMetrics'}
        `.trim());
        
        window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
    }
    
    shareViaLink() {
        const url = window.location.href;
        
        // Copiar para área de transferência
        navigator.clipboard.writeText(url).then(() => {
            this.showNotification('Link copiado para a área de transferência!', 'success');
        }).catch(() => {
            // Fallback para navegadores antigos
            const textArea = document.createElement('textarea');
            textArea.value = url;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            this.showNotification('Link copiado!', 'success');
        });
    }
    
    startPresentationMode() {
        document.body.classList.add('presentation-mode');
        
        // Esconder elementos não essenciais
        document.querySelectorAll('.no-print').forEach(el => {
            el.style.display = 'none';
        });
        
        // Mostrar controles de apresentação
        this.showPresentationControls();
        
        // Entrar em tela cheia
        if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen();
        }
        
        this.showNotification('Modo apresentação ativado', 'info');
    }
    
    showPresentationControls() {
        const controls = document.createElement('div');
        controls.className = 'presentation-controls';
        controls.innerHTML = `
            <button onclick="exportManager.exitPresentationMode()" class="presentation-btn">
                <i class="fas fa-times"></i> Sair
            </button>
            <button onclick="exportManager.prevSlide()" class="presentation-btn">
                <i class="fas fa-chevron-left"></i> Anterior
            </button>
            <button onclick="exportManager.nextSlide()" class="presentation-btn">
                <i class="fas fa-chevron-right"></i> Próximo
            </button>
            <span class="slide-counter">Slide 1/<span id="total-slides">1</span></span>
        `;
        
        document.body.appendChild(controls);
    }
    
    exitPresentationMode() {
        document.body.classList.remove('presentation-mode');
        
        // Mostrar elementos novamente
        document.querySelectorAll('.no-print').forEach(el => {
            el.style.display = '';
        });
        
        // Remover controles
        const controls = document.querySelector('.presentation-controls');
        if (controls) {
            controls.remove();
        }
        
        // Sair da tela cheia
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
        
        this.showNotification('Modo apresentação desativado', 'info');
    }
    
    startSlideshow() {
        this.startPresentationMode();
        
        // Configurar slideshow automático
        this.currentSlide = 0;
        this.slides = document.querySelectorAll('.chart-container');
        this.totalSlides = this.slides.length;
        
        // Atualizar contador
        const counter = document.getElementById('total-slides');
        if (counter) {
            counter.textContent = this.totalSlides;
        }
        
        // Iniciar transição automática
        this.slideshowInterval = setInterval(() => {
            this.nextSlide();
        }, 10000); // 10 segundos por slide
        
        this.showNotification('Slideshow iniciado - 10s por slide', 'info');
    }
    
    nextSlide() {
        if (this.slides && this.slides.length > 0) {
            // Esconder slide atual
            if (this.currentSlide < this.slides.length) {
                this.slides[this.currentSlide].style.display = 'none';
            }
            
            // Avançar
            this.currentSlide = (this.currentSlide + 1) % this.slides.length;
            
            // Mostrar próximo slide
            this.slides[this.currentSlide].style.display = 'block';
            
            // Atualizar contador
            this.updateSlideCounter();
        }
    }
    
    prevSlide() {
        if (this.slides && this.slides.length > 0) {
            // Esconder slide atual
            if (this.currentSlide < this.slides.length) {
                this.slides[this.currentSlide].style.display = 'none';
            }
            
            // Retroceder
            this.currentSlide = (this.currentSlide - 1 + this.slides.length) % this.slides.length;
            
            // Mostrar slide anterior
            this.slides[this.currentSlide].style.display = 'block';
            
            // Atualizar contador
            this.updateSlideCounter();
        }
    }
    
    updateSlideCounter() {
        const counter = document.querySelector('.slide-counter');
        if (counter) {
            counter.textContent = `Slide ${this.currentSlide + 1}/${this.totalSlides}`;
        }
    }
    
    // Métodos auxiliares
    generateFileName(extension) {
        const project = window.AppState?.currentProject;
        const category = window.AppState?.currentCategory;
        const date = new Date().toISOString().split('T')[0];
        
        let name = 'dashboard';
        if (project?.name) {
            name = project.name.toLowerCase().replace(/\s+/g, '-');
        }
        
        if (category) {
            name += `-${category}`;
        }
        
        return `${name}-${date}.${extension}`;
    }
    
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
    
    getMetricDescription(metric) {
        const descriptions = {
            'taxa_abertura': 'Percentual de e-mails abertos',
            'taxa_cliques': 'Percentual de cliques nos e-mails',
            'taxa_conversao': 'Taxa de conversão',
            'taxa_rejeicao': 'Taxa de rejeição de e-mails',
            'ctr': 'Click-Through Rate',
            'roas': 'Return on Ad Spend',
            'cpc': 'Custo por Clique',
            'cpa': 'Custo por Aquisição',
            'cac': 'Custo de Aquisição por Cliente',
            'cvr': 'Taxa de Conversão',
            'engajamento': 'Taxa de engajamento',
            'alcance': 'Número de pessoas alcançadas',
            'seguidores': 'Número de seguidores'
        };
        return descriptions[metric] || metric;
    }
    
    logExport(type, details) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            type,
            details,
            user: window.AppState?.currentUser?.email,
            project: window.AppState?.currentProject?.name,
            category: window.AppState?.currentCategory
        };
        
        this.exportQueue.push(logEntry);
        
        // Salvar no localStorage
        const history = JSON.parse(localStorage.getItem('exportHistory') || '[]');
        history.push(logEntry);
        localStorage.setItem('exportHistory', JSON.stringify(history.slice(-50))); // Manter últimos 50
        
        // Em produção, enviaria para o backend
        console.log('📤 Export realizado:', logEntry);
    }
    
    loadExportHistory() {
        const history = JSON.parse(localStorage.getItem('exportHistory') || '[]');
        console.log('📊 Histórico de exportações:', history);
        return history;
    }
    
    showLoading(message) {
        this.isExporting = true;
        
        const loadingEl = document.createElement('div');
        loadingEl.className = 'export-loading';
        loadingEl.innerHTML = `
            <div class="loading-content">
                <i class="fas fa-spinner fa-spin"></i>
                <p>${message}</p>
            </div>
        `;
        
        loadingEl.id = 'export-loading';
        document.body.appendChild(loadingEl);
    }
    
    hideLoading() {
        this.isExporting = false;
        
        const loadingEl = document.getElementById('export-loading');
        if (loadingEl) {
            loadingEl.remove();
        }
    }
    
    showNotification(message, type) {
        if (window.showNotification) {
            window.showNotification(message, type);
        } else {
            alert(message);
        }
    }
}

// ===== EXPORTAÇÃO =====
window.ExportManager = ExportManager;