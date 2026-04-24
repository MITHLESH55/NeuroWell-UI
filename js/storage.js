/**
 * NEUROWELL - Storage Module
 * Handles localStorage operations for assessment responses and scores
 * Provides methods for saving, retrieving, and managing user data
 * All data persists across browser sessions
 */

const StorageManager = {
  /**
   * Save assessment responses
   * @param {array} responses - Array of responses with question_id and value
   * @returns {boolean} Success status
   */
  saveAssessmentResponses: (responses) => {
    try {
      const data = {
        responses: responses,
        timestamp: new Date().toISOString(),
        version: '1.0'
      };
      localStorage.setItem(CONSTANTS.STORAGE.ASSESSMENT_RESPONSES, JSON.stringify(data));
      console.log('✓ Assessment responses saved');
      return true;
    } catch (error) {
      console.error('✗ Error saving assessment responses:', error);
      return false;
    }
  },

  /**
   * Get assessment responses
   * @returns {object} Stored responses or empty object
   */
  getAssessmentResponses: () => {
    try {
      const data = localStorage.getItem(CONSTANTS.STORAGE.ASSESSMENT_RESPONSES);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('✗ Error retrieving assessment responses:', error);
      return null;
    }
  },

  /**
   * Save wellness score
   * @param {object} scoreData - Object containing overall, physical, mental, emotional scores
   * @returns {boolean} Success status
   */
  saveWellnessScore: (scoreData) => {
    try {
      const data = {
        scores: scoreData,
        timestamp: new Date().toISOString()
      };
      localStorage.setItem(CONSTANTS.STORAGE.WELLNESS_SCORE, JSON.stringify(data));
      console.log('✓ Wellness score saved');
      return true;
    } catch (error) {
      console.error('✗ Error saving wellness score:', error);
      return false;
    }
  },

  /**
   * Get wellness score
   * @returns {object} Stored score data or null
   */
  getWellnessScore: () => {
    try {
      const data = localStorage.getItem(CONSTANTS.STORAGE.WELLNESS_SCORE);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('✗ Error retrieving wellness score:', error);
      return null;
    }
  },

  /**
   * Save historical data for trend analysis
   * @param {object} historyData - Historical score data
   * @returns {boolean} Success status
   */
  saveHistoricalData: (historyData) => {
    try {
      const existing = StorageManager.getHistoricalData() || [];
      existing.push({
        ...historyData,
        timestamp: new Date().toISOString()
      });
      
      // Keep only last 12 records (approximately one year of monthly data)
      if (existing.length > 12) {
        existing.shift();
      }
      
      localStorage.setItem(CONSTANTS.STORAGE.HISTORICAL_DATA, JSON.stringify(existing));
      console.log('✓ Historical data saved');
      return true;
    } catch (error) {
      console.error('✗ Error saving historical data:', error);
      return false;
    }
  },

  /**
   * Get historical data
   * @returns {array} Array of historical score records
   */
  getHistoricalData: () => {
    try {
      const data = localStorage.getItem(CONSTANTS.STORAGE.HISTORICAL_DATA);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('✗ Error retrieving historical data:', error);
      return [];
    }
  },

  /**
   * Save last assessment date
   * @returns {boolean} Success status
   */
  saveLastAssessmentDate: () => {
    try {
      localStorage.setItem(
        CONSTANTS.STORAGE.LAST_ASSESSMENT_DATE,
        new Date().toISOString()
      );
      console.log('✓ Last assessment date saved');
      return true;
    } catch (error) {
      console.error('✗ Error saving assessment date:', error);
      return false;
    }
  },

  /**
   * Get last assessment date
   * @returns {string|null} ISO date string or null
   */
  getLastAssessmentDate: () => {
    try {
      return localStorage.getItem(CONSTANTS.STORAGE.LAST_ASSESSMENT_DATE);
    } catch (error) {
      console.error('✗ Error retrieving assessment date:', error);
      return null;
    }
  },

  /**
   * Check if user has completed assessment
   * @returns {boolean} True if assessment is complete
   */
  hasCompletedAssessment: () => {
    const responses = StorageManager.getAssessmentResponses();
    return responses && responses.responses && responses.responses.length === CONSTANTS.ASSESSMENT.TOTAL_QUESTIONS;
  },

  /**
   * Get assessment progress
   * @returns {object} Progress data with completed count and percentage
   */
  getAssessmentProgress: () => {
    const responses = StorageManager.getAssessmentResponses();
    const completed = responses ? responses.responses.length : 0;
    const total = CONSTANTS.ASSESSMENT.TOTAL_QUESTIONS;
    
    return {
      completed: completed,
      total: total,
      percentage: Math.round((completed / total) * 100)
    };
  },

  /**
   * Clear all stored data
   * @returns {boolean} Success status
   */
  clearAllData: () => {
    try {
      localStorage.removeItem(CONSTANTS.STORAGE.ASSESSMENT_RESPONSES);
      localStorage.removeItem(CONSTANTS.STORAGE.WELLNESS_SCORE);
      localStorage.removeItem(CONSTANTS.STORAGE.LAST_ASSESSMENT_DATE);
      localStorage.removeItem(CONSTANTS.STORAGE.HISTORICAL_DATA);
      console.log('✓ All data cleared');
      return true;
    } catch (error) {
      console.error('✗ Error clearing data:', error);
      return false;
    }
  },

  /**
   * Export all data as JSON (for backup/analysis)
   * @returns {object} Complete user data
   */
  exportData: () => {
    try {
      return {
        assessmentResponses: StorageManager.getAssessmentResponses(),
        wellnessScore: StorageManager.getWellnessScore(),
        historicalData: StorageManager.getHistoricalData(),
        lastAssessmentDate: StorageManager.getLastAssessmentDate(),
        exportDate: new Date().toISOString()
      };
    } catch (error) {
      console.error('✗ Error exporting data:', error);
      return null;
    }
  },

  /**
   * Get response value for a specific question
   * @param {number} questionId - Question ID
   * @returns {number|null} Response value or null
   */
  getResponseForQuestion: (questionId) => {
    const data = StorageManager.getAssessmentResponses();
    if (!data || !data.responses) return null;
    
    const response = data.responses.find(r => r.question_id === questionId);
    return response ? response.value : null;
  },

  /**
   * Check storage availability
   * @returns {boolean} True if localStorage is available and working
   */
  isAvailable: () => {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      console.error('✗ localStorage not available:', e);
      return false;
    }
  }
};

// Log storage availability on load
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    if (!StorageManager.isAvailable()) {
      console.warn('⚠ localStorage not available - data will not persist');
    }
  });
}
