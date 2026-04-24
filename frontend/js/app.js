/**
 * NEUROWELL - Main Application Module
 * Entry point for the application
 * Handles component loading, routing, and initialization
 */

const AppManager = {
  /**
   * Initialize the application
   * Load all components and set up event listeners
   */
  init: () => {
    console.log('🚀 NeuroWell Application Initializing...');
    
    // Check storage availability
    if (!StorageManager.isAvailable()) {
      console.warn('⚠️  localStorage not available - limited functionality');
    }

    // Load all reusable components
    AppManager.loadComponents();

    // Set up global event listeners
    AppManager.setupEventListeners();

    // Initialize page-specific functionality
    AppManager.initializePage();

    console.log('✅ NeuroWell Application Ready');
  },

  /**
   * Load reusable components into page
   */
  loadComponents: () => {
    // Load navbar
    const navPlaceholder = document.getElementById('navbar-container');
    if (navPlaceholder) {
      AppManager.loadComponent('components/navbar.html', navPlaceholder);
    }

    // Load footer
    const footerPlaceholder = document.getElementById('footer-container');
    if (footerPlaceholder) {
      AppManager.loadComponent('components/footer.html', footerPlaceholder);
    }

    // Load loader component (always needed)
    const loaderPlaceholder = document.getElementById('loader-container');
    if (loaderPlaceholder) {
      AppManager.loadComponent('components/loader.html', loaderPlaceholder);
    } else {
      // Add loader to body if no placeholder
      fetch('components/loader.html')
        .then(r => r.text())
        .then(html => {
          const temp = document.createElement('div');
          temp.innerHTML = html;
          document.body.appendChild(temp.firstElementChild);
        })
        .catch(e => console.error('Error loading loader component:', e));
    }
  },

  /**
   * Load HTML component via fetch
   * @param {string} path - Path to component
   * @param {element} target - Target container
   */
  loadComponent: (path, target) => {
    fetch(path)
      .then(response => response.text())
      .then(html => {
        target.innerHTML = html;
        // Re-evaluate scripts in loaded HTML
        const scripts = target.querySelectorAll('script');
        scripts.forEach(script => {
          const newScript = document.createElement('script');
          newScript.textContent = script.textContent;
          script.parentNode.replaceChild(newScript, script);
        });
      })
      .catch(error => console.error(`Error loading component ${path}:`, error));
  },

  /**
   * Set up global event listeners
   */
  setupEventListeners: () => {
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      // Ctrl+Shift+R: Reset assessment
      if (e.ctrlKey && e.shiftKey && e.key === 'R') {
        const resetBtn = document.getElementById('resetBtn');
        if (resetBtn) resetBtn.click();
      }
      // Escape: Close any modals
      if (e.key === 'Escape') {
        AppManager.closeAllModals();
      }
    });

    // Track page visibility for analytics
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        console.log('📱 App hidden');
      } else {
        console.log('👁️ App visible');
      }
    });
  },

  /**
   * Initialize page-specific functionality
   */
  initializePage: () => {
    const page = document.body.dataset.page || 
                 window.location.pathname.split('/').pop().replace('.html', '');

    console.log(`📄 Initializing ${page} page`);

    switch (page) {
      case 'index':
      case '':
        AppManager.initLandingPage();
        break;
      case 'assessment':
        AppManager.initAssessmentPage();
        break;
      case 'dashboard':
        AppManager.initDashboardPage();
        break;
      case 'recommendations':
        AppManager.initRecommendationsPage();
        break;
    }
  },

  /**
   * Initialize landing page
   */
  initLandingPage: () => {
    const ctaBtn = document.getElementById('ctaButton');
    if (ctaBtn) {
      ctaBtn.addEventListener('click', () => {
        // Check if assessment is complete
        if (StorageManager.hasCompletedAssessment()) {
          window.location.href = 'dashboard.html';
        } else {
          window.location.href = 'assessment.html';
        }
      });
    }

    // Animate hero elements on scroll
    AppManager.setupScrollAnimations();
  },

  /**
   * Initialize assessment page
   */
  initAssessmentPage: () => {
    console.log('🏥 Assessment page initialized');
    // Specific assessment logic handled in assessment.js
  },

  /**
   * Initialize dashboard page
   */
  initDashboardPage: () => {
    console.log('📊 Dashboard page initialized');
    // Specific dashboard logic handled in dashboard.js
  },

  /**
   * Initialize recommendations page
   */
  initRecommendationsPage: () => {
    console.log('💡 Recommendations page initialized');
    // Specific recommendations logic handled in recommendations.js
  },

  /**
   * Show loader
   * @param {string} title - Loader title
   * @param {string} message - Loader message
   */
  showLoader: (title = 'Processing...', message = 'Please wait') => {
    if (window.LoaderUtil) {
      LoaderUtil.show(title, message);
    }
  },

  /**
   * Hide loader
   */
  hideLoader: () => {
    if (window.LoaderUtil) {
      LoaderUtil.hide();
    }
  },

  /**
   * Show notification
   * @param {string} message - Message text
   * @param {string} type - Type: 'success', 'error', 'warning', 'info'
   * @param {number} duration - Duration in ms (0 = permanent)
   */
  showNotification: (message, type = 'info', duration = 3000) => {
    const notification = document.createElement('div');
    notification.className = `alert alert-${type} animate-slide-in-down`;
    notification.innerHTML = `
      <span>${message}</span>
      <button class="alert-close">✕</button>
    `;

    document.body.appendChild(notification);

    const closeBtn = notification.querySelector('.alert-close');
    closeBtn.addEventListener('click', () => notification.remove());

    if (duration > 0) {
      setTimeout(() => notification.remove(), duration);
    }
  },

  /**
   * Close all open modals
   */
  closeAllModals: () => {
    const modals = document.querySelectorAll('.modal-overlay.active');
    modals.forEach(modal => modal.classList.remove('active'));
  },

  /**
   * Navigate to page
   * @param {string} page - Page name (without .html)
   */
  navigateTo: (page) => {
    AppManager.showLoader('Loading page...');
    setTimeout(() => {
      window.location.href = `${page}.html`;
    }, 300);
  },

  /**
   * Set up scroll-triggered animations
   */
  setupScrollAnimations: () => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-slide-in-up');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    // Observe all elements with data-animate attribute
    document.querySelectorAll('[data-animate]').forEach(el => {
      observer.observe(el);
    });
  },

  /**
   * Format date for display
   * @param {string} dateString - ISO date string
   * @param {string} format - Format type
   * @returns {string} Formatted date
   */
  formatDate: (dateString, format = 'long') => {
    const date = new Date(dateString);
    
    switch (format) {
      case 'short':
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      case 'long':
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
      case 'time':
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      default:
        return date.toLocaleDateString();
    }
  },

  /**
   * Format number with separators
   * @param {number} num - Number to format
   * @returns {string} Formatted number
   */
  formatNumber: (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  },

  /**
   * Check if is mobile device
   * @returns {boolean} True if mobile
   */
  isMobile: () => {
    return window.innerWidth <= 768;
  },

  /**
   * Log analytics event
   * @param {string} event - Event name
   * @param {object} data - Event data
   */
  logEvent: (event, data = {}) => {
    console.log(`📊 Event: ${event}`, data);
    // In production, send to analytics service
  },

  /**
   * Debug: Log app state
   */
  logState: () => {
    console.group('🔍 NeuroWell App State');
    console.log('Storage Available:', StorageManager.isAvailable());
    console.log('Assessment Completed:', StorageManager.hasCompletedAssessment());
    console.log('Progress:', StorageManager.getAssessmentProgress());
    console.log('Responses:', StorageManager.getAssessmentResponses());
    console.log('Score:', StorageManager.getWellnessScore());
    console.log('History:', StorageManager.getHistoricalData());
    console.groupEnd();
  }
};

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', AppManager.init);
} else {
  AppManager.init();
}

// Graceful error handling
window.addEventListener('error', (event) => {
  console.error('❌ Application Error:', event.error);
  AppManager.showNotification('An error occurred. Please try again.', 'error', 5000);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('❌ Unhandled Promise Rejection:', event.reason);
});
