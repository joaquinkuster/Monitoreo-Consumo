class ThemeManager {
    constructor() {
        this.currentTheme = localStorage.getItem('theme') || 'light';
        this.init();
    }

    init() {
        this.applyTheme(this.currentTheme);
        this.setupEventListeners();
        this.addThemeTransition();
    }

    applyTheme(theme) {
        // Agregar clase de transición suave
        document.documentElement.classList.add('theme-transitioning');
        
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        this.currentTheme = theme;
        
        const toggle = document.getElementById('themeToggle');
        if (toggle) {
            toggle.checked = theme === 'dark';
        }
        
        // Remover clase después de la transición
        setTimeout(() => {
            document.documentElement.classList.remove('theme-transitioning');
        }, 300);
    }

    toggleTheme() {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme(newTheme);
        this.showThemeToast(newTheme);
    }

    showThemeToast(theme) {
        const toast = document.createElement('div');
        toast.className = `toast ${theme === 'dark' ? 'info' : 'success'}`;
        toast.innerHTML = `
            <div class="toast-content">
                <i class="fas fa-${theme === 'dark' ? 'moon' : 'sun'}"></i>
                <span>Modo ${theme === 'dark' ? 'oscuro' : 'claro'} activado</span>
            </div>
            <button class="toast-close" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        const container = document.getElementById('toastContainer');
        if (container) {
            container.appendChild(toast);
            setTimeout(() => toast.remove(), 3000);
        }
    }

    addThemeTransition() {
        const style = document.createElement('style');
        style.textContent = `
            .theme-transitioning * {
                transition: background-color 0.3s ease, 
                          color 0.3s ease, 
                          border-color 0.3s ease,
                          box-shadow 0.3s ease !important;
            }
        `;
        document.head.appendChild(style);
    }

    setupEventListeners() {
        const toggle = document.getElementById('themeToggle');
        if (toggle) {
            toggle.addEventListener('change', () => this.toggleTheme());
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.themeManager = new ThemeManager();
});