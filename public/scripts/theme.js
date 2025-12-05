class ThemeManager {
    constructor() {
        this.init();
    }

    init() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        this.setTheme(savedTheme);
    }

    setTheme(themeName) {
        document.documentElement.setAttribute('data-theme', themeName);
        localStorage.setItem('theme', themeName);
        window.AppState.theme = themeName;
    }

    toggleTheme() {
        const current = localStorage.getItem('theme') || 'light';
        const next = current === 'light' ? 'dark' : 'light';
        this.setTheme(next);
    }
}
// Tornar global para usar no onclick do HTML
window.toggleTheme = function() {
    if (window.themeManager) window.themeManager.toggleTheme();
};