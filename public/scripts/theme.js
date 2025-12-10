class ThemeManager {
    constructor() {
        this.init();
    }

    init() {
        // Enforce Light Mode explicitly on startup as requested
        this.setTheme('light');
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
window.toggleTheme = function () {
    if (window.themeManager) window.themeManager.toggleTheme();
};
