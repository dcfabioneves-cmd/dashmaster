// ===== UTILITY FUNCTIONS =====

/**
 * Formata um número para exibição
 * @param {number|string} num - Número a ser formatado
 * @param {string} [type='default'] - Tipo de formatação
 * @returns {string} Número formatado
 */
function formatNumber(num, type = 'default') {
    const n = parseFloat(num);

    if (isNaN(n)) {
        return 'N/A';
    }

    switch (type) {
        case 'percent':
            return `${n.toFixed(1)}%`;

        case 'currency':
            return `R$ ${n.toLocaleString('pt-BR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            })}`;

        case 'decimal':
            return n.toLocaleString('pt-BR', {
                minimumFractionDigits: 1,
                maximumFractionDigits: 2
            });

        case 'integer':
            return n.toLocaleString('pt-BR', {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            });

        case 'compact':
            if (Math.abs(n) >= 1000000000) {
                return `${(n / 1000000000).toFixed(1)}B`;
            }
            if (Math.abs(n) >= 1000000) {
                return `${(n / 1000000).toFixed(1)}M`;
            }
            if (Math.abs(n) >= 1000) {
                return `${(n / 1000).toFixed(1)}K`;
            }
            return n.toFixed(1);

        default:
            if (Math.abs(n) >= 1000000) {
                return `${(n / 1000000).toFixed(1)}M`;
            }
            if (Math.abs(n) >= 1000) {
                return `${(n / 1000).toFixed(1)}K`;
            }
            return n.toLocaleString('pt-BR', {
                minimumFractionDigits: 0,
                maximumFractionDigits: 1
            });
    }
}

/**
 * Formata uma data para exibição
 * @param {Date|string} date - Data a ser formatada
 * @param {string} [format='short'] - Formato desejado
 * @returns {string} Data formatada
 */
function formatDate(date, format = 'short') {
    if (!date) return 'N/A';

    const d = new Date(date);

    if (isNaN(d.getTime())) {
        return 'Data inválida';
    }

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

    return d.toLocaleDateString('pt-BR', options[format] || options.short);
}

/**
 * Formata uma data para input type="date"
 * @param {Date} date - Data a ser formatada
 * @returns {string} Data no formato YYYY-MM-DD
 */
function formatDateForInput(date) {
    if (!date) return '';

    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

/**
 * Calcula a diferença entre duas datas
 * @param {Date|string} date1 - Data inicial
 * @param {Date|string} date2 - Data final
 * @param {string} [unit='days'] - Unidade da diferença
 * @returns {number} Diferença na unidade especificada
 */
function dateDiff(date1, date2, unit = 'days') {
    const d1 = new Date(date1);
    const d2 = new Date(date2);

    const diffMs = Math.abs(d2 - d1);

    switch (unit) {
        case 'milliseconds':
            return diffMs;
        case 'seconds':
            return Math.floor(diffMs / 1000);
        case 'minutes':
            return Math.floor(diffMs / (1000 * 60));
        case 'hours':
            return Math.floor(diffMs / (1000 * 60 * 60));
        case 'days':
            return Math.floor(diffMs / (1000 * 60 * 60 * 24));
        case 'weeks':
            return Math.floor(diffMs / (1000 * 60 * 60 * 24 * 7));
        case 'months':
            return Math.floor(diffMs / (1000 * 60 * 60 * 24 * 30.44));
        case 'years':
            return Math.floor(diffMs / (1000 * 60 * 60 * 24 * 365.25));
        default:
            return diffMs;
    }
}

/**
 * Valida um e-mail
 * @param {string} email - E-mail a ser validado
 * @returns {boolean} True se o e-mail for válido
 */
function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

/**
 * Valida uma URL
 * @param {string} url - URL a ser validada
 * @returns {boolean} True se a URL for válida
 */
function isValidUrl(url) {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}

/**
 * Extrai o ID de uma planilha do Google Sheets da URL
 * @param {string} url - URL da planilha
 * @returns {string|null} ID da planilha ou null
 */
function extractSheetId(url) {
    const patterns = [
        /\/d\/([a-zA-Z0-9-_]+)/,
        /id=([a-zA-Z0-9-_]+)/,
        /\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/
    ];

    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match && match[1]) {
            return match[1];
        }
    }

    return null;
}

/**
 * Faz uma requisição com timeout
 * @param {string} url - URL da requisição
 * @param {Object} [options={}] - Opções do fetch
 * @param {number} [timeout=10000] - Timeout em milissegundos
 * @returns {Promise<Response>} Resposta da requisição
 */
async function fetchWithTimeout(url, options = {}, timeout = 10000) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal
        });

        clearTimeout(id);
        return response;
    } catch (error) {
        clearTimeout(id);
        throw error;
    }
}

/**
 * Faz uma requisição e retorna JSON com tratamento de erros
 * @param {string} url - URL da requisição
 * @param {Object} [options={}] - Opções do fetch
 * @returns {Promise<Object>} Dados em JSON
 */
async function fetchJSON(url, options = {}) {
    try {
        const response = await fetchWithTimeout(url, options);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        return { success: true, data };

    } catch (error) {
        console.error('Erro na requisição:', error);
        return {
            success: false,
            error: error.message,
            code: error.name === 'AbortError' ? 'TIMEOUT' : 'NETWORK_ERROR'
        };
    }
}

/**
 * Armazena dados no localStorage com expiração
 * @param {string} key - Chave do storage
 * @param {any} value - Valor a ser armazenado
 * @param {number} [ttl=3600000] - Tempo de vida em milissegundos (1 hora padrão)
 */
function setWithExpiry(key, value, ttl = 3600000) {
    const item = {
        value: value,
        expiry: Date.now() + ttl
    };

    try {
        localStorage.setItem(key, JSON.stringify(item));
    } catch (error) {
        console.warn('Erro ao salvar no localStorage:', error);
        // Limpa itens antigos se o storage estiver cheio
        if (error.name === 'QuotaExceededError') {
            clearExpiredItems();
            // Tenta novamente
            try {
                localStorage.setItem(key, JSON.stringify(item));
            } catch {
                // Se ainda falhar, usa sessionStorage
                sessionStorage.setItem(key, JSON.stringify(item));
            }
        }
    }
}

/**
 * Recupera dados do localStorage com expiração
 * @param {string} key - Chave do storage
 * @returns {any|null} Valor armazenado ou null se expirado
 */
function getWithExpiry(key) {
    try {
        const itemStr = localStorage.getItem(key);

        if (!itemStr) {
            return null;
        }

        const item = JSON.parse(itemStr);

        if (Date.now() > item.expiry) {
            localStorage.removeItem(key);
            return null;
        }

        return item.value;

    } catch (error) {
        console.warn('Erro ao ler do localStorage:', error);
        return null;
    }
}

/**
 * Limpa itens expirados do localStorage
 */
function clearExpiredItems() {
    const keys = Object.keys(localStorage);

    for (const key of keys) {
        try {
            const itemStr = localStorage.getItem(key);
            if (!itemStr) continue;

            const item = JSON.parse(itemStr);

            if (item.expiry && Date.now() > item.expiry) {
                localStorage.removeItem(key);
            }
        } catch {
            // Ignora itens que não são JSON válido
        }
    }
}

/**
 * Debounce function para otimizar eventos
 * @param {Function} func - Função a ser debounced
 * @param {number} wait - Tempo de espera em milissegundos
 * @returns {Function} Função debounced
 */
function debounce(func, wait) {
    let timeout;

    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };

        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Throttle function para limitar a frequência de execução
 * @param {Function} func - Função a ser throttled
 * @param {number} limit - Limite de tempo em milissegundos
 * @returns {Function} Função throttled
 */
function throttle(func, limit) {
    let inThrottle;

    return function executedFunction(...args) {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * Clona um objeto profundamente
 * @param {Object} obj - Objeto a ser clonado
 * @returns {Object} Clone do objeto
 */
function deepClone(obj) {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }

    if (obj instanceof Date) {
        return new Date(obj.getTime());
    }

    if (obj instanceof Array) {
        return obj.reduce((arr, item, i) => {
            arr[i] = deepClone(item);
            return arr;
        }, []);
    }

    if (typeof obj === 'object') {
        return Object.keys(obj).reduce((newObj, key) => {
            newObj[key] = deepClone(obj[key]);
            return newObj;
        }, {});
    }
}

/**
 * Mescla dois objetos profundamente
 * @param {Object} target - Objeto alvo
 * @param {Object} source - Objeto fonte
 * @returns {Object} Objeto mesclado
 */
function deepMerge(target, source) {
    const output = Object.assign({}, target);

    if (isObject(target) && isObject(source)) {
        Object.keys(source).forEach(key => {
            if (isObject(source[key])) {
                if (!(key in target)) {
                    Object.assign(output, { [key]: source[key] });
                } else {
                    output[key] = deepMerge(target[key], source[key]);
                }
            } else {
                Object.assign(output, { [key]: source[key] });
            }
        });
    }

    return output;
}

/**
 * Verifica se um valor é um objeto
 * @param {any} item - Valor a ser verificado
 * @returns {boolean} True se for um objeto
 */
function isObject(item) {
    return item && typeof item === 'object' && !Array.isArray(item);
}

/**
 * Formata bytes para tamanho legível
 * @param {number} bytes - Bytes a serem formatados
 * @param {number} [decimals=2] - Casas decimais
 * @returns {string} Tamanho formatado
 */
function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Gera um ID único
 * @param {number} [length=8] - Comprimento do ID
 * @returns {string} ID único
 */
function generateId(length = 8) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';

    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return result;
}

/**
 * Converte um objeto para query string
 * @param {Object} params - Parâmetros do objeto
 * @returns {string} Query string
 */
function objectToQueryString(params) {
    return Object.keys(params)
        .map(key => {
            const value = params[key];
            if (value === null || value === undefined) return '';
            return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
        })
        .filter(Boolean)
        .join('&');
}

/**
 * Parseia uma query string para objeto
 * @param {string} queryString - Query string
 * @returns {Object} Objeto com parâmetros
 */
function queryStringToObject(queryString) {
    return queryString
        .replace(/^\?/, '')
        .split('&')
        .reduce((params, param) => {
            const [key, value] = param.split('=');
            if (key) {
                params[decodeURIComponent(key)] = value ? decodeURIComponent(value) : '';
            }
            return params;
        }, {});
}

/**
 * Calcula a média de um array de números
 * @param {number[]} arr - Array de números
 * @returns {number} Média
 */
function calculateAverage(arr) {
    if (!arr || arr.length === 0) return 0;

    const validNumbers = arr.filter(n => typeof n === 'number' && !isNaN(n));
    if (validNumbers.length === 0) return 0;

    const sum = validNumbers.reduce((a, b) => a + b, 0);
    return sum / validNumbers.length;
}

/**
 * Calcula a mediana de um array de números
 * @param {number[]} arr - Array de números
 * @returns {number} Mediana
 */
function calculateMedian(arr) {
    if (!arr || arr.length === 0) return 0;

    const validNumbers = arr
        .filter(n => typeof n === 'number' && !isNaN(n))
        .sort((a, b) => a - b);

    if (validNumbers.length === 0) return 0;

    const middle = Math.floor(validNumbers.length / 2);

    if (validNumbers.length % 2 === 0) {
        return (validNumbers[middle - 1] + validNumbers[middle]) / 2;
    } else {
        return validNumbers[middle];
    }
}

/**
 * Calcula o desvio padrão de um array de números
 * @param {number[]} arr - Array de números
 * @returns {number} Desvio padrão
 */
function calculateStandardDeviation(arr) {
    if (!arr || arr.length === 0) return 0;

    const validNumbers = arr.filter(n => typeof n === 'number' && !isNaN(n));
    if (validNumbers.length < 2) return 0;

    const avg = calculateAverage(validNumbers);
    const squareDiffs = validNumbers.map(n => Math.pow(n - avg, 2));
    const avgSquareDiff = calculateAverage(squareDiffs);

    return Math.sqrt(avgSquareDiff);
}

/**
 * Formata uma duração em milissegundos para string legível
 * @param {number} ms - Milissegundos
 * @returns {string} Duração formatada
 */
function formatDuration(ms) {
    if (ms < 1000) return `${ms}ms`;

    const seconds = Math.floor(ms / 1000);
    if (seconds < 60) return `${seconds}s`;

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    if (minutes < 60) {
        return `${minutes}m ${remainingSeconds}s`;
    }

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (hours < 24) {
        return `${hours}h ${remainingMinutes}m`;
    }

    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;

    return `${days}d ${remainingHours}h`;
}

/**
 * Cria um atraso (sleep) assíncrono
 * @param {number} ms - Milissegundos para aguardar
 * @returns {Promise<void>} Promise que resolve após o delay
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Verifica se o dispositivo é móvel
 * @returns {boolean} True se for dispositivo móvel
 */
function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

/**
 * Verifica se o dispositivo tem touch
 * @returns {boolean} True se for dispositivo touch
 */
function isTouchDevice() {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

/**
 * Copia texto para a área de transferência
 * @param {string} text - Texto a ser copiado
 * @returns {Promise<boolean>} True se copiado com sucesso
 */
async function copyToClipboard(text) {
    try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(text);
            return true;
        } else {
            // Fallback para navegadores antigos
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.opacity = '0';
            document.body.appendChild(textArea);
            textArea.select();
            const success = document.execCommand('copy');
            document.body.removeChild(textArea);
            return success;
        }
    } catch (error) {
        console.error('Erro ao copiar para área de transferência:', error);
        return false;
    }
}

/**
 * Lê texto da área de transferência
 * @returns {Promise<string>} Texto lido
 */
async function readFromClipboard() {
    try {
        if (navigator.clipboard && navigator.clipboard.readText) {
            return await navigator.clipboard.readText();
        } else {
            throw new Error('Clipboard API não suportada');
        }
    } catch (error) {
        console.error('Erro ao ler da área de transferência:', error);
        return '';
    }
}

/**
 * Sanitiza um string HTML
 * @param {string} html - HTML a ser sanitizado
 * @returns {string} HTML sanitizado
 */
function sanitizeHTML(html) {
    const temp = document.createElement('div');
    temp.textContent = html;
    return temp.innerHTML;
}

/**
 * Cria um elemento DOM a partir de HTML
 * @param {string} html - HTML do elemento
 * @returns {HTMLElement} Elemento DOM
 */
function createElementFromHTML(html) {
    const template = document.createElement('template');
    template.innerHTML = html.trim();
    return template.content.firstElementChild;
}

/**
 * Adiciona um evento que será removido automaticamente
 * @param {HTMLElement} element - Elemento alvo
 * @param {string} event - Nome do evento
 * @param {Function} handler - Handler do evento
 * @returns {Function} Função para remover o evento
 */
function addAutoRemoveEventListener(element, event, handler) {
    element.addEventListener(event, handler);

    return () => {
        element.removeEventListener(event, handler);
    };
}

/**
 * Cria um elemento de tooltip
 * @param {HTMLElement} element - Elemento que terá o tooltip
 * @param {string} text - Texto do tooltip
 * @param {string} [position='top'] - Posição do tooltip
 */
function createTooltip(element, text, position = 'top') {
    const tooltip = document.createElement('div');
    tooltip.className = `tooltip tooltip-${position}`;
    tooltip.textContent = text;

    element.style.position = 'relative';

    const showTooltip = () => {
        element.appendChild(tooltip);
        tooltip.classList.add('show');
    };

    const hideTooltip = () => {
        if (tooltip.parentElement === element) {
            element.removeChild(tooltip);
        }
    };

    element.addEventListener('mouseenter', showTooltip);
    element.addEventListener('mouseleave', hideTooltip);
    element.addEventListener('focus', showTooltip);
    element.addEventListener('blur', hideTooltip);

    // Para touch devices
    element.addEventListener('touchstart', (e) => {
        e.preventDefault();
        showTooltip();

        // Esconde após 2 segundos
        setTimeout(hideTooltip, 2000);
    });
}

/**
 * Verifica se um elemento está visível na viewport
 * @param {HTMLElement} element - Elemento a ser verificado
 * @param {number} [offset=0] - Offset em pixels
 * @returns {boolean} True se o elemento estiver visível
 */
function isElementInViewport(element, offset = 0) {
    const rect = element.getBoundingClientRect();

    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) + offset &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth) + offset
    );
}

/**
 * Rola a página até um elemento
 * @param {HTMLElement} element - Elemento alvo
 * @param {Object} [options={}] - Opções do scroll
 */
function scrollToElement(element, options = {}) {
    const defaultOptions = {
        behavior: 'smooth',
        block: 'start',
        inline: 'nearest',
        offset: 0
    };

    const mergedOptions = { ...defaultOptions, ...options };

    const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
    const offsetPosition = elementPosition - mergedOptions.offset;

    window.scrollTo({
        top: offsetPosition,
        behavior: mergedOptions.behavior
    });
}

/**
 * Mede o tempo de execução de uma função
 * @param {Function} fn - Função a ser medida
 * @param {any[]} args - Argumentos da função
 * @returns {Object} Resultado e tempo de execução
 */
function measurePerformance(fn, ...args) {
    const start = performance.now();
    const result = fn(...args);
    const end = performance.now();

    return {
        result,
        executionTime: end - start
    };
}

/**
 * Exporta dados como arquivo
 * @param {string} data - Dados a serem exportados
 * @param {string} filename - Nome do arquivo
 * @param {string} type - Tipo MIME
 */
function exportAsFile(data, filename, type = 'text/plain') {
    const blob = new Blob([data], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');

    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

/**
 * Converte CSV para JSON
 * @param {string} csv - Dados CSV
 * @param {string} [delimiter=','] - Delimitador
 * @returns {Object[]} Array de objetos
 */
function csvToJSON(csv, delimiter = ',') {
    const lines = csv.split('\n');
    const result = [];
    const headers = lines[0].split(delimiter);

    for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;

        const obj = {};
        const currentline = lines[i].split(delimiter);

        for (let j = 0; j < headers.length; j++) {
            let value = currentline[j] || '';

            // Remove aspas se existirem
            value = value.replace(/^"|"$/g, '');

            // Tenta converter para número
            if (!isNaN(value) && value.trim() !== '') {
                obj[headers[j]] = parseFloat(value);
            } else {
                obj[headers[j]] = value;
            }
        }

        result.push(obj);
    }

    return result;
}

/**
 * Converte JSON para CSV
 * @param {Object[]} data - Array de objetos
 * @param {string} [delimiter=','] - Delimitador
 * @returns {string} Dados CSV
 */
function jsonToCSV(data, delimiter = ',') {
    if (!data || data.length === 0) return '';

    const headers = Object.keys(data[0]);
    const csvRows = [];

    // Headers
    csvRows.push(headers.join(delimiter));

    // Rows
    for (const row of data) {
        const values = headers.map(header => {
            const value = row[header];

            if (value === null || value === undefined) {
                return '';
            }

            // Adiciona aspas se o valor contiver o delimitador ou aspas
            const stringValue = String(value);
            if (stringValue.includes(delimiter) || stringValue.includes('"')) {
                return `"${stringValue.replace(/"/g, '""')}"`;
            }

            return stringValue;
        });

        csvRows.push(values.join(delimiter));
    }

    return csvRows.join('\n');
}

/**
 * Remove acentos de uma string
 * @param {string} str - String com acentos
 * @returns {string} String sem acentos
 */
function removeAccents(str) {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

/**
 * Formata CPF/CNPJ
 * @param {string} value - CPF/CNPJ sem formatação
 * @returns {string} CPF/CNPJ formatado
 */
function formatCpfCnpj(value) {
    const cleaned = value.replace(/\D/g, '');

    if (cleaned.length <= 11) {
        // CPF
        return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    } else {
        // CNPJ
        return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }
}

/**
 * Formata telefone
 * @param {string} value - Telefone sem formatação
 * @returns {string} Telefone formatado
 */
function formatPhone(value) {
    const cleaned = value.replace(/\D/g, '');

    if (cleaned.length === 11) {
        return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    } else if (cleaned.length === 10) {
        return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    } else {
        return cleaned;
    }
}

/**
 * Valida CPF
 * @param {string} cpf - CPF a ser validado
 * @returns {boolean} True se o CPF for válido
 */
function validateCPF(cpf) {
    cpf = cpf.replace(/\D/g, '');

    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
        return false;
    }

    let sum = 0;
    let remainder;

    for (let i = 1; i <= 9; i++) {
        sum += parseInt(cpf.substring(i - 1, i)) * (11 - i);
    }

    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.substring(9, 10))) return false;

    sum = 0;
    for (let i = 1; i <= 10; i++) {
        sum += parseInt(cpf.substring(i - 1, i)) * (12 - i);
    }

    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.substring(10, 11))) return false;

    return true;
}

/**
 * Valida CNPJ
 * @param {string} cnpj - CNPJ a ser validado
 * @returns {boolean} True se o CNPJ for válido
 */
function validateCNPJ(cnpj) {
    cnpj = cnpj.replace(/\D/g, '');

    if (cnpj.length !== 14 || /^(\d)\1{13}$/.test(cnpj)) {
        return false;
    }

    let size = cnpj.length - 2;
    let numbers = cnpj.substring(0, size);
    const digits = cnpj.substring(size);
    let sum = 0;
    let pos = size - 7;

    for (let i = size; i >= 1; i--) {
        sum += numbers.charAt(size - i) * pos--;
        if (pos < 2) pos = 9;
    }

    let result = sum % 11 < 2 ? 0 : 11 - sum % 11;
    if (result !== parseInt(digits.charAt(0))) return false;

    size = size + 1;
    numbers = cnpj.substring(0, size);
    sum = 0;
    pos = size - 7;

    for (let i = size; i >= 1; i--) {
        sum += numbers.charAt(size - i) * pos--;
        if (pos < 2) pos = 9;
    }

    result = sum % 11 < 2 ? 0 : 11 - sum % 11;
    if (result !== parseInt(digits.charAt(1))) return false;

    return true;
}

/**
 * Logger com níveis
 */
const logger = {
    levels: {
        DEBUG: 0,
        INFO: 1,
        WARN: 2,
        ERROR: 3
    },

    currentLevel: 1, // INFO por padrão

    setLevel(level) {
        this.currentLevel = level;
    },

    debug(...args) {
        if (this.currentLevel <= this.levels.DEBUG) {
            console.debug('[DEBUG]', ...args);
        }
    },

    info(...args) {
        if (this.currentLevel <= this.levels.INFO) {
            console.info('[INFO]', ...args);
        }
    },

    warn(...args) {
        if (this.currentLevel <= this.levels.WARN) {
            console.warn('[WARN]', ...args);
        }
    },

    error(...args) {
        if (this.currentLevel <= this.levels.ERROR) {
            console.error('[ERROR]', ...args);
        }
    }
};





/**
 * Retorna o nome legível da categoria
 * @param {string} category - Código da categoria
 * @returns {string} Nome legível
 */
function getCategoryName(category) {
    const categories = {
        'email': 'E-mail Marketing',
        'social': 'Redes Sociais',
        'seo': 'SEO',
        'ecommerce': 'E-commerce',
        'google-ads': 'Google Ads',
        'meta-ads': 'Meta Ads',
        'blog': 'Blog'
    };
    return categories[category] || category;
}
window.getCategoryName = getCategoryName;
