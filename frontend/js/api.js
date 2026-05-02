/**
 * NEUROWELL - API Service Module
 * Handles communication with the NeuroWell backend API
 * Provides methods for assessment submission and retrieval
 */

const APIService = {
  // ✅ Explicitly set absolute backend URL
  BASE_URL: 'http://127.0.0.1:8000',

  /**
   * Generic fetch wrapper with error handling
   */
  async request(endpoint, options = {}) {
    const url = endpoint.startsWith('http') ? endpoint : `${this.BASE_URL}${endpoint}`;
    
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      };

      console.log(`🌐 API REQUEST: ${config.method || 'GET'} ${url}`);
      if (config.body) {
        console.log('📦 Request Data:', JSON.parse(config.body));
      }

      const response = await fetch(url, config);
      
      // Try to parse JSON response
      let data;
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const text = await response.text();
        data = { message: text };
      }
      
      console.log(`📥 API RESPONSE [${response.status}]:`, data);
      
      if (!response.ok) {
        throw new Error(data.detail || data.message || `HTTP Error ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('❌ API CONNECTION ERROR:', error);
      
      if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
        const msg = 'Unable to connect to the server. Please ensure the backend is running at http://127.0.0.1:8000';
        alert(msg); // Add alert for immediate visibility
        throw new Error(msg);
      }
      
      throw error;
    }
  },

  /**
   * Auth: Register
   */
  async register(userData) {
    return await this.request('/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  },

  /**
   * Auth: Login
   */
  async login(credentials) {
    return await this.request('/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
  },

  /**
   * Submit assessment
   */
  async submitAssessment(responses, userId = null) {
    const payload = { responses, userId, timestamp: new Date().toISOString() };
    const result = await this.request('/submit-assessment', {
      method: 'POST',
      body: JSON.stringify(payload)
    });

    if (result.success && result.id) {
      localStorage.setItem('assessmentId', result.id);
    }
    return result;
  },

  /**
   * Get user data
   */
  async getUserData(userId) {
    return await this.request(`/get-user-data/${userId}`);
  },

  /**
   * Health check
   */
  async checkHealth() {
    try {
      const response = await fetch(`${this.BASE_URL}/health`);
      const data = await response.json();
      return data.status === 'OK';
    } catch (e) {
      return false;
    }
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