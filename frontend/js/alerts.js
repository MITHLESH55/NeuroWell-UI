/**
 * NEUROWELL - Alert System
 * Manages dynamic alerts and risk indicators
 * Uses color-coded risk levels: Green (Low), Yellow (Medium), Red (High)
 */

const AlertSystem = {
  /**
   * Generate alerts from current wellness state
   * @param {object} scores - Wellness scores
   * @param {object} insights - Insights data
   * @returns {object} Comprehensive alert system data
   */
  generateAlerts: (scores = {}, insights = {}) => {
    const validated = Utility.validateScores(scores);

    return {
      criticalAlerts: AlertSystem.getCriticalAlerts(validated),
      warnings: AlertSystem.getWarnings(validated),
      notices: AlertSystem.getNotices(validated),
      riskIndicators: AlertSystem.calculateRiskIndicators(validated),
      actionItems: AlertSystem.getActionItems(validated),
      timestamp: new Date().toISOString()
    };
  },

  /**
   * Get critical alerts (Red/High severity)
   * @param {object} scores - Validated scores
   * @returns {array} Critical alerts
   */
  getCriticalAlerts: (scores = {}) => {
    const alerts = [];

    // Overall wellness critical
    if (scores.overall < 40) {
      alerts.push({
        id: 'alert-overall-critical',
        severity: 'critical',
        level: 'red',
        emoji: '🚨',
        icon: '⚠️',
        title: 'Critical Wellness Alert',
        message: 'Your overall wellness score is critically low. Immediate action required.',
        details: `Current score: ${scores.overall}/100. Seek professional support immediately.`,
        action: 'Contact a healthcare provider',
        priority: 1,
        visible: true
      });
    }

    // Physical health critical
    if (scores.physical < 35) {
      alerts.push({
        id: 'alert-physical-critical',
        severity: 'critical',
        level: 'red',
        emoji: '💪',
        icon: '⚠️',
        title: 'Physical Health Crisis',
        message: 'Your physical health score is dangerously low.',
        details: `Score: ${scores.physical}/100. Consult a physician urgently.`,
        action: 'Contact a physiotherapist or doctor',
        priority: 2,
        visible: true
      });
    }

    // Mental health critical
    if (scores.mental < 35) {
      alerts.push({
        id: 'alert-mental-critical',
        severity: 'critical',
        level: 'red',
        emoji: '🧠',
        icon: '⚠️',
        title: 'Mental Health Emergency',
        message: 'Your mental health score indicates severe stress or distress.',
        details: `Score: ${scores.mental}/100. Professional mental health support is essential.`,
        action: 'Contact a psychologist or counselor',
        priority: 3,
        visible: true
      });
    }

    // Emotional wellness critical
    if (scores.emotional < 35) {
      alerts.push({
        id: 'alert-emotional-critical',
        severity: 'critical',
        level: 'red',
        emoji: '💭',
        icon: '⚠️',
        title: 'Emotional Distress Alert',
        message: 'Your emotional wellness is in critical condition.',
        details: `Score: ${scores.emotional}/100. Reach out for emotional support.`,
        action: 'Seek counselor or therapist support',
        priority: 4,
        visible: true
      });
    }

    return alerts;
  },

  /**
   * Get warning alerts (Yellow/Medium severity)
   * @param {object} scores - Validated scores
   * @returns {array} Warning alerts
   */
  getWarnings: (scores = {}) => {
    const warnings = [];

    // Overall wellness warning
    if (scores.overall >= 40 && scores.overall < 60) {
      warnings.push({
        id: 'warn-overall-low',
        severity: 'warning',
        level: 'yellow',
        emoji: '⚠️',
        icon: '⚡',
        title: 'Low Overall Wellness',
        message: 'Your wellness is below optimal. Improvement is recommended.',
        details: `Score: ${scores.overall}/100. Focus on weakest areas.`,
        action: 'Develop improvement plan',
        priority: 5,
        visible: true
      });
    }

    // Physical fitness warning
    if (scores.physical >= 40 && scores.physical < 60) {
      warnings.push({
        id: 'warn-physical-low',
        severity: 'warning',
        level: 'yellow',
        emoji: '🏃',
        icon: '📊',
        title: 'Low Physical Fitness',
        message: 'Increase physical activity and exercise regularly.',
        details: `Score: ${scores.physical}/100. Aim for 150 minutes weekly activity.`,
        action: 'Start an exercise routine',
        priority: 6,
        visible: true
      });
    }

    // Mental health warning
    if (scores.mental >= 40 && scores.mental < 60) {
      warnings.push({
        id: 'warn-mental-stress',
        severity: 'warning',
        level: 'yellow',
        emoji: '🧘',
        icon: '📊',
        title: 'Elevated Stress Levels',
        message: 'Your mental health shows signs of stress. Practice stress management.',
        details: `Score: ${scores.mental}/100. Daily meditation helps.`,
        action: 'Practice mindfulness daily',
        priority: 7,
        visible: true
      });
    }

    // Emotional stability warning
    if (scores.emotional >= 40 && scores.emotional < 60) {
      warnings.push({
        id: 'warn-emotional-instability',
        severity: 'warning',
        level: 'yellow',
        emoji: '💬',
        icon: '📊',
        title: 'Emotional Stability Concern',
        message: 'Focus on building emotional resilience.',
        details: `Score: ${scores.emotional}/100. Social support helps.`,
        action: 'Connect with loved ones',
        priority: 8,
        visible: true
      });
    }

    // Multiple areas of concern
    const lowAreas = Object.entries(scores)
      .filter(([k, v]) => k !== 'overall' && v < 60)
      .map(([k]) => k);

    if (lowAreas.length >= 2) {
      warnings.push({
        id: 'warn-multiple-concerns',
        severity: 'warning',
        level: 'yellow',
        emoji: '🔄',
        icon: '📊',
        title: 'Multiple Areas Need Attention',
        message: `${lowAreas.join(', ')} all need improvement.`,
        details: 'Focus on one area at a time for sustained progress.',
        action: 'Create targeted improvement plan',
        priority: 9,
        visible: true
      });
    }

    return warnings;
  },

  /**
   * Get notice alerts (Green/Low severity)
   * @param {object} scores - Validated scores
   * @returns {array} Notice alerts
   */
  getNotices: (scores = {}) => {
    const notices = [];

    // All areas strong
    if (scores.physical >= 70 && scores.mental >= 70 && scores.emotional >= 70) {
      notices.push({
        id: 'notice-excellent',
        severity: 'info',
        level: 'green',
        emoji: '✨',
        icon: '👍',
        title: 'Excellent Overall Wellness',
        message: 'You\'re doing great! Maintain these positive habits.',
        details: 'Your wellness is at optimal levels across all categories.',
        action: 'Keep up the great work!',
        priority: 10,
        visible: true
      });
    }

    // Good overall wellness
    if (scores.overall >= 70) {
      notices.push({
        id: 'notice-good',
        severity: 'info',
        level: 'green',
        emoji: '💚',
        icon: '👍',
        title: 'Good Wellness Status',
        message: 'Your wellness is in good shape!',
        details: `Overall score: ${scores.overall}/100. Consistency is key.`,
        action: 'Continue your current habits',
        priority: 11,
        visible: true
      });
    }

    // Recent improvement
    if (scores.overall >= 60) {
      notices.push({
        id: 'notice-improving',
        severity: 'info',
        level: 'green',
        emoji: '📈',
        icon: '👍',
        title: 'Positive Progress',
        message: 'You\'re making good improvements!',
        details: 'Stay committed to your wellness goals.',
        action: 'Continue building momentum',
        priority: 12,
        visible: true
      });
    }

    return notices;
  },

  /**
   * Calculate risk indicators for dashboard display
   * @param {object} scores - Validated scores
   * @returns {object} Risk indicators by category
   */
  calculateRiskIndicators: (scores = {}) => {
    const getIndicator = (score) => {
      if (score >= 70) return { level: 'low', color: '#10b981', text: 'Good' };
      if (score >= 50) return { level: 'medium', color: '#f59e0b', text: 'Caution' };
      return { level: 'high', color: '#ef4444', text: 'Alert' };
    };

    return {
      overall: {
        score: scores.overall,
        ...getIndicator(scores.overall)
      },
      physical: {
        score: scores.physical,
        ...getIndicator(scores.physical)
      },
      mental: {
        score: scores.mental,
        ...getIndicator(scores.mental)
      },
      emotional: {
        score: scores.emotional,
        ...getIndicator(scores.emotional)
      }
    };
  },

  /**
   * Get actionable items from alerts
   * @param {object} scores - Validated scores
   * @returns {array} Action items
   */
  getActionItems: (scores = {}) => {
    const actions = [];

    // Highest priority first
    const sorted = [
      { category: 'Physical', score: scores.physical },
      { category: 'Mental', score: scores.mental },
      { category: 'Emotional', score: scores.emotional }
    ].sort((a, b) => a.score - b.score);

    sorted.forEach((item, index) => {
      if (item.score < 70) {
        actions.push({
          priority: index + 1,
          category: item.category,
          score: item.score,
          action: AlertSystem.getActionForCategory(item.category, item.score),
          severity: item.score < 50 ? 'high' : 'medium'
        });
      }
    });

    return actions;
  },

  /**
   * Get specific action based on category and score
   * @param {string} category - Health category
   * @param {number} score - Score value
   * @returns {string} Recommended action
   */
  getActionForCategory: (category, score) => {
    const actions = {
      Physical: {
        high: 'Start with 20-minute daily walks and gradually increase intensity',
        medium: 'Add one more exercise session per week'
      },
      Mental: {
        high: 'Practice 15-minute daily meditation and reduce screen time',
        medium: 'Implement stress management techniques'
      },
      Emotional: {
        high: 'Reach out to friends/family or consider counseling',
        medium: 'Dedicate time to activities that bring joy'
      }
    };

    const severity = score < 50 ? 'high' : 'medium';
    return actions[category]?.[severity] || 'Focus on improvement';
  },

  /**
   * Display alert on UI
   * @param {object} alert - Alert object
   * @returns {boolean} Success status
   */
  displayAlert: (alert = {}) => {
    try {
      console.log(`[${alert.level.toUpperCase()}] ${alert.title}: ${alert.message}`);
      Utility.showFeedback(alert.message, alert.level);
      return true;
    } catch (error) {
      console.error('Error displaying alert:', error);
      return false;
    }
  },

  /**
   * Dismiss alert
   * @param {string} alertId - Alert ID
   * @returns {boolean} Success status
   */
  dismissAlert: (alertId) => {
    try {
      let dismissed = JSON.parse(localStorage.getItem('dismissedAlerts') || '[]');
      if (!dismissed.includes(alertId)) {
        dismissed.push(alertId);
        localStorage.setItem('dismissedAlerts', JSON.stringify(dismissed));
      }
      return true;
    } catch (error) {
      console.error('Error dismissing alert:', error);
      return false;
    }
  },

  /**
   * Get non-dismissed alerts
   * @param {array} alerts - All alerts
   * @returns {array} Visible alerts
   */
  getVisibleAlerts: (alerts = []) => {
    try {
      const dismissed = JSON.parse(localStorage.getItem('dismissedAlerts') || '[]');
      return alerts.filter(a => !dismissed.includes(a.id));
    } catch (error) {
      return alerts;
    }
  },

  /**
   * Reset all alerts
   * @returns {boolean} Success status
   */
  resetAlerts: () => {
    try {
      localStorage.removeItem('dismissedAlerts');
      return true;
    } catch (error) {
      console.error('Error resetting alerts:', error);
      return false;
    }
  }
};

// Export for module systems if needed
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AlertSystem;
}
