/**
 * NEUROWELL - Constants Configuration
 * Centralized constants for the entire application
 * Includes score ranges, categories, colors, and thresholds
 */

const CONSTANTS = {
  // Score Categories
  CATEGORIES: {
    PHYSICAL: 'Physical Health',
    MENTAL: 'Mental Health',
    EMOTIONAL: 'Emotional Wellness'
  },

  // Score Ranges (0-100)
  SCORE_RANGES: {
    EXCELLENT: { min: 80, max: 100, label: 'Excellent', color: '#10b981' },
    GOOD: { min: 60, max: 79, label: 'Good', color: '#3b82f6' },
    FAIR: { min: 40, max: 59, label: 'Fair', color: '#f59e0b' },
    POOR: { min: 0, max: 39, label: 'Poor', color: '#ef4444' }
  },

  // Burnout Risk Thresholds
  BURNOUT_RISK: {
    LOW: { min: 0, max: 30, label: 'Low Risk', color: '#10b981' },
    MODERATE: { min: 31, max: 60, label: 'Moderate Risk', color: '#f59e0b' },
    HIGH: { min: 61, max: 100, label: 'High Risk', color: '#ef4444' }
  },

  // Assessment Configuration
  ASSESSMENT: {
    TOTAL_QUESTIONS: 15,
    QUESTIONS_PER_STEP: 3,
    TOTAL_STEPS: 5
  },

  // Storage Keys
  STORAGE: {
    ASSESSMENT_RESPONSES: 'neurowell_assessment_responses',
    WELLNESS_SCORE: 'neurowell_wellness_score',
    LAST_ASSESSMENT_DATE: 'neurowell_last_assessment_date',
    HISTORICAL_DATA: 'neurowell_historical_data',
    SESSION: 'neurowell_session',
    USERS: 'neurowell_users',
    GOALS: 'neurowell_goals'
  },

  // Goal Definitions
  GOALS: {
    IMPROVE_SLEEP: {
      id: 'improve_sleep',
      name: 'Improve Sleep',
      description: 'Achieve better sleep quality and consistency',
      icon: '😴',
      category: 'Physical',
      targetScore: 75,
      currentThreshold: 'physical',
      baselineThreshold: 60,
      color: '#667eea'
    },
    REDUCE_STRESS: {
      id: 'reduce_stress',
      name: 'Reduce Stress',
      description: 'Lower stress levels and increase mental resilience',
      icon: '🧘',
      category: 'Mental',
      targetScore: 80,
      currentThreshold: 'mental',
      baselineThreshold: 50,
      color: '#764ba2'
    },
    INCREASE_ACTIVITY: {
      id: 'increase_activity',
      name: 'Increase Activity',
      description: 'Build better exercise and movement habits',
      icon: '🏃',
      category: 'Physical',
      targetScore: 85,
      currentThreshold: 'physical',
      baselineThreshold: 55,
      color: '#f59e0b'
    }
  },

  // Animation Timings
  ANIMATIONS: {
    FADE_IN: 300,
    SLIDE_IN: 400,
    TRANSITION: 200
  }
};

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CONSTANTS;
}
