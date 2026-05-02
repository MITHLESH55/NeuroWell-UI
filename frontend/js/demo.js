/**
 * NEUROWELL - Demo Mode Module
 * Provides sample data for presentation and fallback when no assessment exists
 * Seamlessly initializes demo mode without breaking functionality
 */

const DemoManager = {
  DEMO_FLAG: 'neurowell_demo_mode',
  
  /**
   * Generate sample assessment responses
   * Creates realistic responses for all 15 questions
   */
  generateSampleResponses: () => {
    // Based on QUESTIONS array structure - 15 questions total
    // Responses are on scale 1-5
    return [
      { question_id: 1, value: 4 },   // Sleep quality - good
      { question_id: 2, value: 3 },   // Physical activity - moderate
      { question_id: 3, value: 4 },   // Energy levels - good
      { question_id: 4, value: 3 },   // Stress levels - moderate (negative impact)
      { question_id: 5, value: 4 },   // Work-life balance - good
      { question_id: 6, value: 3 },   // Anxiety/worry - moderate (negative impact)
      { question_id: 7, value: 4 },   // Focus/concentration - good
      { question_id: 8, value: 3 },   // Social connections - moderate
      { question_id: 9, value: 4 },   // Emotional stability - good
      { question_id: 10, value: 3 },  // Life satisfaction - moderate
      { question_id: 11, value: 4 },  // Health behaviors - good
      { question_id: 12, value: 3 },  // Mental fatigue - moderate (negative impact)
      { question_id: 13, value: 4 },  // Nutrition - good
      { question_id: 14, value: 3 },  // Mindfulness - moderate
      { question_id: 15, value: 4 }   // Overall wellbeing - good
    ];
  },

  /**
   * Generate sample wellness scores (calculated from responses)
   */
  generateSampleScores: () => {
    return {
      overall: 72,
      physical: 75,
      mental: 68,
      emotional: 74
    };
  },

  /**
   * Generate sample historical data (trend analysis)
   * Creates 7 days of progressive improvement
   */
  generateSampleHistory: () => {
    const history = [];
    const baseDate = new Date();
    
    // Generate 7 days of data showing positive trend
    const trends = [
      { overall: 58, physical: 60, mental: 55, emotional: 60 },
      { overall: 62, physical: 64, mental: 59, emotional: 64 },
      { overall: 65, physical: 67, mental: 62, emotional: 67 },
      { overall: 68, physical: 70, mental: 65, emotional: 70 },
      { overall: 70, physical: 72, mental: 67, emotional: 72 },
      { overall: 71, physical: 74, mental: 68, emotional: 73 },
      { overall: 72, physical: 75, mental: 68, emotional: 74 }
    ];

    trends.forEach((trend, index) => {
      const date = new Date(baseDate);
      date.setDate(date.getDate() - (6 - index));
      
      history.push({
        scores: trend,
        timestamp: date.toISOString()
      });
    });

    return history;
  },

  /**
   * Initialize demo mode with sample data
   */
  initializeDemo: () => {
    try {
      // Mark as demo mode
      localStorage.setItem(DemoManager.DEMO_FLAG, 'true');
      
      // Generate and save sample data
      const responses = DemoManager.generateSampleResponses();
      const scores = DemoManager.generateSampleScores();
      const history = DemoManager.generateSampleHistory();
      
      // Save to storage using StorageManager
      StorageManager.saveAssessmentResponses(responses);
      StorageManager.saveWellnessScore(scores);
      StorageManager.saveLastAssessmentDate();
      
      // Save historical data
      localStorage.setItem(
        CONSTANTS.STORAGE.HISTORICAL_DATA,
        JSON.stringify(history)
      );
      
      console.log('✅ Demo mode initialized with sample data');
      return true;
    } catch (error) {
      console.error('❌ Error initializing demo mode:', error);
      return false;
    }
  },

  /**
   * Check if currently in demo mode
   */
  isDemo: () => {
    return localStorage.getItem(DemoManager.DEMO_FLAG) === 'true';
  },

  /**
   * Check if localStorage is empty (no real user data)
   */
  isStorageEmpty: () => {
    const hasResponses = localStorage.getItem(CONSTANTS.STORAGE.ASSESSMENT_RESPONSES);
    const hasScore = localStorage.getItem(CONSTANTS.STORAGE.WELLNESS_SCORE);
    const hasHistory = localStorage.getItem(CONSTANTS.STORAGE.HISTORICAL_DATA);
    
    return !hasResponses && !hasScore && !hasHistory;
  },

  /**
   * Initialize demo mode if needed (no existing data)
   * Called during app initialization
   */
  autoInitIfNeeded: () => {
    // Check if we have a demo flag already set (avoid re-initializing)
    if (localStorage.getItem(DemoManager.DEMO_FLAG)) {
      return; // Already in demo mode
    }

    // Check if storage is empty (no user data)
    if (DemoManager.isStorageEmpty()) {
      DemoManager.initializeDemo();
    }
  },

  /**
   * Exit demo mode and clear demo data
   */
  exitDemo: () => {
    try {
      localStorage.removeItem(DemoManager.DEMO_FLAG);
      // Note: Don't clear actual data here - let user do that intentionally
      console.log('✅ Demo mode exited');
      return true;
    } catch (error) {
      console.error('❌ Error exiting demo mode:', error);
      return false;
    }
  },

  /**
   * Get demo mode badge HTML
   */
  getBadgeHTML: () => {
    if (!DemoManager.isDemo()) {
      return '';
    }
    return `<span class="demo-badge" title="Running in demo mode with sample data">📋 Demo</span>`;
  }
};

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DemoManager;
}
