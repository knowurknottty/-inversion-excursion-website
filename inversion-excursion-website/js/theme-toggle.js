/**
 * Theme Toggle Module
 * Handles dark/light mode switching with system preference detection
 */

(function() {
  'use strict';

  const STORAGE_KEY = 'ie-theme-preference';
  const THEME_ATTRIBUTE = 'data-theme';
  
  // Theme states
  const themes = {
    DARK: 'dark',
    LIGHT: 'light',
    SYSTEM: 'system'
  };

  /**
   * Get the current theme preference
   * @returns {string} The current theme
   */
  function getStoredTheme() {
    try {
      return localStorage.getItem(STORAGE_KEY) || themes.SYSTEM;
    } catch (e) {
      return themes.SYSTEM;
    }
  }

  /**
   * Save theme preference to localStorage
   * @param {string} theme - Theme to save
   */
  function storeTheme(theme) {
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch (e) {
      console.warn('Unable to save theme preference');
    }
  }

  /**
   * Apply theme to document
   * @param {string} theme - Theme to apply
   */
  function applyTheme(theme) {
    const root = document.documentElement;
    
    if (theme === themes.SYSTEM) {
      root.removeAttribute(THEME_ATTRIBUTE);
    } else {
      root.setAttribute(THEME_ATTRIBUTE, theme);
    }
  }

  /**
   * Get effective theme (resolved from system preference if needed)
   * @param {string} theme - Stored theme preference
   * @returns {string} The effective theme (dark or light)
   */
  function getEffectiveTheme(theme) {
    if (theme !== themes.SYSTEM) {
      return theme;
    }
    
    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return themes.DARK;
    }
    return themes.LIGHT;
  }

  /**
   * Create theme toggle UI
   * @returns {HTMLElement} The toggle element
   */
  function createToggle() {
    const toggle = document.createElement('button');
    toggle.className = 'theme-toggle';
    toggle.setAttribute('aria-label', 'Toggle dark/light mode');
    toggle.setAttribute('aria-pressed', 'false');
    toggle.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
      <span class="theme-toggle-text">Theme</span>
    `;
    return toggle;
  }

  /**
   * Update toggle UI based on current theme
   * @param {HTMLElement} toggle - The toggle button
   * @param {string} theme - Current theme
   */
  function updateToggleUI(toggle, theme) {
    const effectiveTheme = getEffectiveTheme(theme);
    const icon = toggle.querySelector('svg');
    const text = toggle.querySelector('.theme-toggle-text');
    
    if (effectiveTheme === themes.DARK) {
      // Moon icon for dark mode
      icon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />';
      text.textContent = 'Dark';
      toggle.setAttribute('aria-pressed', 'true');
    } else {
      // Sun icon for light mode
      icon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />';
      text.textContent = 'Light';
      toggle.setAttribute('aria-pressed', 'false');
    }
  }

  /**
   * Initialize theme toggle
   */
  function init() {
    // Apply stored theme immediately to prevent flash
    const storedTheme = getStoredTheme();
    applyTheme(storedTheme);

    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', setup);
    } else {
      setup();
    }

    function setup() {
      // Find or create toggle button
      let toggle = document.querySelector('.theme-toggle');
      
      if (!toggle) {
        // Try to find sidebar footer to append toggle
        const sidebarFooter = document.querySelector('.sidebar-footer');
        if (sidebarFooter) {
          toggle = createToggle();
          sidebarFooter.appendChild(toggle);
        }
      }

      if (toggle) {
        // Set initial state
        updateToggleUI(toggle, storedTheme);

        // Handle click
        toggle.addEventListener('click', function() {
          const currentTheme = getStoredTheme();
          let newTheme;

          // Cycle: system -> dark -> light -> system
          if (currentTheme === themes.SYSTEM) {
            newTheme = themes.DARK;
          } else if (currentTheme === themes.DARK) {
            newTheme = themes.LIGHT;
          } else {
            newTheme = themes.SYSTEM;
          }

          applyTheme(newTheme);
          storeTheme(newTheme);
          updateToggleUI(toggle, newTheme);

          // Dispatch custom event
          window.dispatchEvent(new CustomEvent('themechange', {
            detail: { theme: newTheme }
          }));
        });
      }

      // Listen for system preference changes
      if (window.matchMedia) {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        
        // Modern API
        if (mediaQuery.addEventListener) {
          mediaQuery.addEventListener('change', function(e) {
            const stored = getStoredTheme();
            if (stored === themes.SYSTEM && toggle) {
              updateToggleUI(toggle, themes.SYSTEM);
            }
          });
        } else {
          // Legacy API
          mediaQuery.addListener(function(e) {
            const stored = getStoredTheme();
            if (stored === themes.SYSTEM && toggle) {
              updateToggleUI(toggle, themes.SYSTEM);
            }
          });
        }
      }
    }
  }

  // Expose API
  window.ThemeToggle = {
    init: init,
    setTheme: function(theme) {
      applyTheme(theme);
      storeTheme(theme);
    },
    getTheme: getStoredTheme,
    themes: themes
  };

  // Auto-initialize
  init();
})();
