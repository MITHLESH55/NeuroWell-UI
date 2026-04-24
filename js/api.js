/**
 * NEUROWELL - API Service Module
 * Handles communication with the NeuroWell backend API
 * Provides methods for assessment submission and retrieval
 */

const APIService = {
  BASE_URL: 'http://localhost:3000/api',

  /**
   * Generic fetch wrapper with error handling
   * @param {string} endpoint - API endpoint
   * @param {object} options - Fetch options
   * @returns {Promise<object>} Response data
   */
  async request(endpoint, options = {}) {
    try {
      const url = `${this.BASE_URL}${endpoint}`;
      const config = {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      };

      console.log(`🌐 API Request: ${config.method || 'GET'} ${url}`, config);

      const response = await fetch(url, config);
      console.log(`🌐 API Response status: ${response.status} ${response.statusText}`);

      const data = await response.json();
      console.log(`🌐 API Response data:`, data);

      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      if (!data.success) {
        throw new Error(data.message || 'API request failed');
      }

      console.log('✅ API Response success');
      return data;

    } catch (error) {
      console.error('❌ API Error:', error);
      throw error;
    }
  },

  /**
   * Submit assessment to backend
   * @param {Array} responses - Array of assessment responses
   * @param {string} userId - Optional user identifier
   * @returns {Promise<object>} Assessment result
   */
  async submitAssessment(responses, userId = null) {
    console.log('📤 APIService.submitAssessment called with:', { responses, userId });
    const payload = { responses };
    if (userId) payload.userId = userId;
    console.log('📦 Payload:', payload);

    const result = await this.request('/assessment', {
      method: 'POST',
      body: JSON.stringify(payload)
    });

    console.log('📥 APIService.submitAssessment result:', result);

    // Store the assessment ID locally for future retrieval
    if (result.data && result.data.id) {
      localStorage.setItem('assessmentId', result.data.id);
    }

    return result.data;
  },

  /**
   * Get assessment by ID
   * @param {string} assessmentId - Assessment ID
   * @returns {Promise<object>} Assessment data
   */
  async getAssessment(assessmentId) {
    const result = await this.request(`/assessment/${assessmentId}`);
    return result.data;
  },

  /**
   * Get stored assessment ID from localStorage
   * @returns {string|null} Assessment ID or null
   */
  getStoredAssessmentId() {
    return localStorage.getItem('assessmentId');
  },

  /**
   * Load latest assessment data
   * @returns {Promise<object|null>} Assessment data or null
   */
  async loadLatestAssessment() {
    const assessmentId = this.getStoredAssessmentId();
    if (!assessmentId) {
      console.log('📝 No stored assessment ID found');
      return null;
    }

    try {
      const data = await this.getAssessment(assessmentId);
      console.log('📊 Loaded assessment from backend:', data);
      return data;
    } catch (error) {
      console.error('❌ Failed to load assessment:', error);
      // Clear invalid assessment ID
      localStorage.removeItem('assessmentId');
      return null;
    }
  },

  /**
   * Check if backend is available
   * @returns {Promise<boolean>} Backend availability
   */
  async checkHealth() {
    try {
      console.log('🔍 Checking backend health...');
      const response = await fetch(`${this.BASE_URL.replace('/api', '')}/health`);
      console.log(`🔍 Health check response status: ${response.status}`);
      const data = await response.json();
      console.log(`🔍 Health check data:`, data);
      const isHealthy = data.status === 'OK';
      console.log(`🔍 Backend health: ${isHealthy ? '✅ Available' : '❌ Unavailable'}`);
      return isHealthy;
    } catch (error) {
      console.error('❌ Backend health check failed:', error);
      return false;
    }
  },

  /**
   * Fallback to localStorage if backend is unavailable
   * @param {Array} responses - Assessment responses
   * @returns {object} Local calculation result
   */
  async fallbackToLocal(responses) {
    console.log('🔄 Backend unavailable, using local calculation');

    // Calculate scores locally
    const scores = ScoringEngine.calculateScores(responses);

    // Calculate burnout risk locally
    const risk = ScoringEngine.calculateBurnoutRisk(scores);

    // Recommendations are now generated on-the-fly in the recommendations page.
    return {
      id: 'local-' + Date.now(),
      score: scores.overall,
      categoryScores: scores,
      scores: scores, // Ensure compatibility with new recommendation engine
      risk: risk,
      isLocalFallback: true
    };
  }
};

// Initialize API service on page load
document.addEventListener('DOMContentLoaded', async () => {
  console.log('🔗 Initializing API Service...');

  // Check backend availability
  const isBackendAvailable = await APIService.checkHealth();
  if (isBackendAvailable) {
    console.log('✅ Backend API available');
  } else {
    console.log('⚠️ Backend API unavailable, will use local fallback');
  }
});