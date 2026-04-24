/**
 * NEUROWELL BACKEND - Utility Helpers
 * Common utility functions used across the application
 * Validation, formatting, and data processing helpers
 */

class Helpers {
  /**
   * Validate assessment responses
   * @param {array} responses - Array of response objects
   * @returns {object} Validation result
   */
  static validateAssessmentResponses(responses) {
    const errors = [];

    if (!Array.isArray(responses)) {
      errors.push('Responses must be an array');
      return { isValid: false, errors };
    }

    if (responses.length === 0) {
      errors.push('At least one response is required');
      return { isValid: false, errors };
    }

    responses.forEach((response, index) => {
      if (!response.question_id) {
        errors.push(`Response ${index + 1}: question_id is required`);
      }

      if (typeof response.value !== 'number' || response.value < 1 || response.value > 5) {
        errors.push(`Response ${index + 1}: value must be a number between 1 and 5`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Format assessment data for response
   * @param {object} assessment - Assessment document
   * @returns {object} Formatted assessment data
   */
  static formatAssessmentResponse(assessment) {
    return {
      id: assessment._id,
      score: assessment.score,
      categoryScores: assessment.categoryScores,
      recommendations: assessment.recommendations,
      risk: assessment.risk,
      createdAt: assessment.createdAt,
      summary: assessment.getSummary()
    };
  }

  /**
   * Calculate percentage change between two values
   * @param {number} current - Current value
   * @param {number} previous - Previous value
   * @returns {number} Percentage change
   */
  static calculatePercentageChange(current, previous) {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  }

  /**
   * Get date range for historical data
   * @param {number} days - Number of days back
   * @returns {object} Date range object
   */
  static getDateRange(days) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return {
      start: startDate,
      end: endDate
    };
  }

  /**
   * Sanitize string input
   * @param {string} input - Input string
   * @returns {string} Sanitized string
   */
  static sanitizeString(input) {
    if (typeof input !== 'string') return '';
    return input.trim().replace(/[<>]/g, '');
  }

  /**
   * Generate unique ID
   * @param {string} prefix - ID prefix
   * @returns {string} Unique ID
   */
  static generateId(prefix = 'neuro') {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    return `${prefix}_${timestamp}_${random}`;
  }

  /**
   * Check if value is within range
   * @param {number} value - Value to check
   * @param {number} min - Minimum value
   * @param {number} max - Maximum value
   * @returns {boolean} Whether value is in range
   */
  static isInRange(value, min, max) {
    return typeof value === 'number' && value >= min && value <= max;
  }

  /**
   * Deep clone object
   * @param {object} obj - Object to clone
   * @returns {object} Cloned object
   */
  static deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  /**
   * Get environment variable with fallback
   * @param {string} key - Environment variable key
   * @param {*} fallback - Fallback value
   * @returns {*} Environment value or fallback
   */
  static getEnvVar(key, fallback = null) {
    const value = process.env[key];
    if (value === undefined || value === null) return fallback;
    return value;
  }
}

module.exports = Helpers;