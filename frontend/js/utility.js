/**
 * NEUROWELL - Utility Module
 * Core safety functions for data handling, validation, and safe operations
 * Prevents runtime crashes with comprehensive error handling
 */

const Utility = {
  /**
   * Safely fetch assessment data from localStorage
   * @returns {object|null} Assessment data with responses and scores, or null
   */
  getAssessmentData: () => {
    try {
      // Get stored responses
      const storedResponses = localStorage.getItem(CONSTANTS.STORAGE.ASSESSMENT_RESPONSES);
      const storedScores = localStorage.getItem(CONSTANTS.STORAGE.WELLNESS_SCORE);

      if (!storedResponses || !storedScores) {
        console.warn('⚠️  No assessment data found in localStorage');
        return null;
      }

      // Parse with error handling
      const responsesData = JSON.parse(storedResponses);
      const scoresData = JSON.parse(storedScores);

      return {
        responses: responsesData.responses || [],
        scores: scoresData.scores || {},
        timestamp: scoresData.timestamp || new Date().toISOString(),
        hasData: true
      };
    } catch (error) {
      console.error('❌ Error parsing assessment data:', error);
      return null;
    }
  },

  /**
   * Get assessment data or handle missing data gracefully
   * @param {object} options - {enableDemo: boolean, redirectUrl: string}
   * @returns {object} Assessment data or demo data
   */
  getAssessmentDataSafe: (options = {}) => {
    const { enableDemo = true, redirectUrl = 'assessment.html' } = options;

    const data = Utility.getAssessmentData();

    if (data && data.hasData) {
      return data;
    }

    // No data found - handle based on options
    if (enableDemo && typeof DemoManager !== 'undefined') {
      console.log('📋 Enabling Demo Mode due to missing data');
      DemoManager.initializeDemo();
      return Utility.getAssessmentData() || { scores: {}, responses: [], isDemoMode: true };
    }

    // Option to redirect if demo is disabled
    if (redirectUrl) {
      console.log(`🔀 Redirecting to ${redirectUrl}`);
      window.location.href = redirectUrl;
      return null;
    }

    return { scores: {}, responses: [], hasData: false };
  },

  /**
   * Safe validation of scores object
   * @param {object} scores - Scores to validate
   * @returns {object} Validated scores with defaults
   */
  validateScores: (scores = {}) => {
    return {
      overall: Math.max(0, Math.min(100, parseInt(scores.overall) || 0)),
      physical: Math.max(0, Math.min(100, parseInt(scores.physical) || 0)),
      mental: Math.max(0, Math.min(100, parseInt(scores.mental) || 0)),
      emotional: Math.max(0, Math.min(100, parseInt(scores.emotional) || 0))
    };
  },

  /**
   * Safe DOM element access
   * @param {string} elementId - Element ID
   * @returns {HTMLElement|null} Element or null
   */
  getElement: (elementId) => {
    try {
      const element = document.getElementById(elementId);
      if (!element) {
        console.warn(`⚠️  Element not found: ${elementId}`);
        return null;
      }
      return element;
    } catch (error) {
      console.error(`❌ Error accessing element ${elementId}:`, error);
      return null;
    }
  },

  /**
   * Safe text content update (prevents XSS)
   * @param {string} elementId - Target element ID
   * @param {string} text - Text to set
   * @returns {boolean} Success status
   */
  setTextContent: (elementId, text = '') => {
    try {
      const element = Utility.getElement(elementId);
      if (!element) return false;
      element.textContent = String(text);
      return true;
    } catch (error) {
      console.error(`❌ Error setting text for ${elementId}:`, error);
      return false;
    }
  },

  /**
   * Safe HTML content update with sanitization
   * @param {string} elementId - Target element ID
   * @param {string} html - HTML to set
   * @param {boolean} allowHTML - Whether to allow HTML (default: false)
   * @returns {boolean} Success status
   */
  setHTMLContent: (elementId, html = '', allowHTML = false) => {
    try {
      const element = Utility.getElement(elementId);
      if (!element) return false;

      if (allowHTML) {
        element.innerHTML = html;
      } else {
        element.textContent = html;
      }
      return true;
    } catch (error) {
      console.error(`❌ Error setting HTML for ${elementId}:`, error);
      return false;
    }
  },

  /**
   * Show feedback to user (replaces alert)
   * @param {string} message - Message to display
   * @param {string} type - Type: 'success', 'error', 'warning', 'info'
   * @param {number} duration - Display duration in ms (0 = permanent)
   */
  showFeedback: (message, type = 'info', duration = 3000) => {
    console.log(`[${type.toUpperCase()}] ${message}`);

    // Try to show on page if feedback container exists
    try {
      const container = Utility.getElement('feedback-container');
      if (container) {
        const feedback = document.createElement('div');
        feedback.className = `feedback feedback-${type}`;
        feedback.textContent = message;
        feedback.setAttribute('role', 'alert');

        container.appendChild(feedback);

        if (duration > 0) {
          setTimeout(() => {
            feedback.remove();
          }, duration);
        }
      }
    } catch (error) {
      console.error('Error showing feedback:', error);
    }
  },

  /**
   * Get risk level based on score
   * @param {number} score - Score 0-100
   * @returns {string} Risk level: 'low', 'medium', 'high'
   */
  getRiskLevel: (score = 0) => {
    if (score >= 70) return 'low';
    if (score >= 50) return 'medium';
    return 'high';
  },

  /**
   * Get risk level color
   * @param {string} riskLevel - Risk level
   * @returns {string} Color code
   */
  getRiskColor: (riskLevel = 'medium') => {
    const colors = {
      low: '#10b981',    // Green
      medium: '#f59e0b', // Yellow/Amber
      high: '#ef4444'    // Red
    };
    return colors[riskLevel] || colors.medium;
  },

  /**
   * Format percentage display
   * @param {number} value - Value to format
   * @param {number} decimals - Decimal places
   * @returns {string} Formatted percentage
   */
  formatPercent: (value = 0, decimals = 0) => {
    const num = parseFloat(value) || 0;
    return `${num.toFixed(decimals)}%`;
  },

  /**
   * Calculate progress percentage
   * @param {number} current - Current value
   * @param {number} target - Target value
   * @returns {number} Progress percentage (0-100)
   */
  calculateProgress: (current = 0, target = 100) => {
    if (target === 0) return 0;
    return Math.round((current / target) * 100);
  },

  /**
   * Get time period of day
   * @returns {string} 'morning', 'afternoon', or 'evening'
   */
  getTimePeriod: () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 18) return 'afternoon';
    return 'evening';
  },

  /**
   * Format date for display
   * @param {Date|string} date - Date to format
   * @returns {string} Formatted date
   */
  formatDate: (date = new Date()) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  },

  /**
   * Get date N days ago
   * @param {number} days - Number of days in past
   * @returns {Date} Date object
   */
  daysAgo: (days = 0) => {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date;
  },

  /**
   * Deep clone object safely
   * @param {object} obj - Object to clone
   * @returns {object} Cloned object
   */
  deepClone: (obj) => {
    try {
      return JSON.parse(JSON.stringify(obj));
    } catch (error) {
      console.error('❌ Error cloning object:', error);
      return obj;
    }
  },

  /**
   * Merge objects safely (shallow merge)
   * @param {...object} objects - Objects to merge
   * @returns {object} Merged object
   */
  mergeObjects: (...objects) => {
    return objects.reduce((acc, obj) => {
      if (typeof obj === 'object' && obj !== null) {
        return { ...acc, ...obj };
      }
      return acc;
    }, {});
  },

  /**
   * Check if value is empty
   * @param {*} value - Value to check
   * @returns {boolean} True if empty
   */
  isEmpty: (value) => {
    if (value === null || value === undefined) return true;
    if (typeof value === 'string') return value.trim().length === 0;
    if (Array.isArray(value)) return value.length === 0;
    if (typeof value === 'object') return Object.keys(value).length === 0;
    return false;
  },

  /**
   * Create debounced function
   * @param {function} func - Function to debounce
   * @param {number} wait - Wait time in ms
   * @returns {function} Debounced function
   */
  debounce: (func, wait = 300) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  /**
   * Create throttled function
   * @param {function} func - Function to throttle
   * @param {number} limit - Time limit in ms
   * @returns {function} Throttled function
   */
  throttle: (func, limit = 300) => {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }
};

// Export for module systems if needed
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Utility;
}
