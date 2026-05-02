/**
 * NEUROWELL - Smart Insights Engine
 * Detects patterns and correlations in wellness data
 * Provides cause-effect explanations for health trends
 */

const InsightsEngine = {
  /**
   * Analyze all wellness data and generate insights
   * @returns {object} Comprehensive insights
   */
  analyzeWellness: () => {
    const checkIns = HabitsTracker.getCheckIns();
    const recentWeek = HabitsTracker.getCheckInRange(
      Utility.daysAgo(7).toISOString().split('T')[0],
      new Date().toISOString().split('T')[0]
    );

    return {
      patterns: InsightsEngine.detectPatterns(recentWeek),
      correlations: InsightsEngine.findCorrelations(recentWeek),
      trends: InsightsEngine.analyzeTrends(recentWeek),
      alerts: InsightsEngine.generateAlerts(recentWeek),
      recommendations: InsightsEngine.generateInsightRecommendations(recentWeek),
      timestamp: new Date().toISOString()
    };
  },

  /**
   * Detect patterns in check-in data
   * @param {array} checkIns - Check-in data
   * @returns {array} Detected patterns
   */
  detectPatterns: (checkIns = []) => {
    const patterns = [];

    if (checkIns.length < 2) return patterns;

    // Pattern: Low mood at specific times
    const moodsByTime = {};
    checkIns.forEach(c => {
      const hour = new Date(c.timestamp).getHours();
      const period = hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';
      if (!moodsByTime[period]) moodsByTime[period] = [];
      moodsByTime[period].push(c.mood);
    });

    Object.entries(moodsByTime).forEach(([period, moods]) => {
      const avgMood = moods.reduce((a, b) => a + b) / moods.length;
      if (avgMood < 5) {
        patterns.push({
          type: 'low-mood-pattern',
          period: period,
          severity: avgMood < 3 ? 'high' : 'medium',
          insight: `Your mood tends to be lower in the ${period}`,
          avgScore: Math.round(avgMood * 10) / 10
        });
      }
    });

    // Pattern: Low energy consistently
    const energyAvg = checkIns.reduce((sum, c) => sum + c.energy, 0) / checkIns.length;
    if (energyAvg < 5) {
      patterns.push({
        type: 'low-energy-pattern',
        severity: energyAvg < 3 ? 'high' : 'medium',
        insight: 'You consistently report low energy levels',
        avgScore: Math.round(energyAvg * 10) / 10,
        suggestion: 'Consider improving sleep and exercise habits'
      });
    }

    // Pattern: Insufficient sleep
    const sleepAvg = checkIns.reduce((sum, c) => sum + c.sleep, 0) / checkIns.length;
    if (sleepAvg < 6) {
      patterns.push({
        type: 'poor-sleep-pattern',
        severity: sleepAvg < 5 ? 'high' : 'medium',
        insight: `You\'re averaging only ${sleepAvg.toFixed(1)} hours of sleep`,
        avgScore: sleepAvg.toFixed(1),
        suggestion: 'Aim for 7-8 hours nightly for optimal health'
      });
    }

    return patterns;
  },

  /**
   * Find correlations between variables
   * @param {array} checkIns - Check-in data
   * @returns {array} Correlations found
   */
  findCorrelations: (checkIns = []) => {
    const correlations = [];

    if (checkIns.length < 3) return correlations;

    // Sleep ↔ Mood correlation
    const sleepMoodCorr = InsightsEngine.calculateCorrelation(
      checkIns.map(c => c.sleep),
      checkIns.map(c => c.mood)
    );

    if (Math.abs(sleepMoodCorr) > 0.5) {
      correlations.push({
        type: 'sleep-mood',
        variables: ['Sleep', 'Mood'],
        correlation: sleepMoodCorr.toFixed(2),
        strength: Math.abs(sleepMoodCorr) > 0.7 ? 'Strong' : 'Moderate',
        icon: '😴↔️😊',
        insight: sleepMoodCorr > 0
          ? 'Better sleep leads to better mood - prioritize sleep!'
          : 'Low sleep is associated with poor mood',
        actionable: true
      });
    }

    // Sleep ↔ Energy correlation
    const sleepEnergyCorr = InsightsEngine.calculateCorrelation(
      checkIns.map(c => c.sleep),
      checkIns.map(c => c.energy)
    );

    if (Math.abs(sleepEnergyCorr) > 0.5) {
      correlations.push({
        type: 'sleep-energy',
        variables: ['Sleep', 'Energy'],
        correlation: sleepEnergyCorr.toFixed(2),
        strength: Math.abs(sleepEnergyCorr) > 0.7 ? 'Strong' : 'Moderate',
        icon: '😴↔️⚡',
        insight: sleepEnergyCorr > 0
          ? 'More sleep = more energy throughout the day'
          : 'Insufficient sleep drains your energy',
        actionable: true
      });
    }

    // Mood ↔ Energy correlation
    const moodEnergyCorr = InsightsEngine.calculateCorrelation(
      checkIns.map(c => c.mood),
      checkIns.map(c => c.energy)
    );

    if (Math.abs(moodEnergyCorr) > 0.6) {
      correlations.push({
        type: 'mood-energy',
        variables: ['Mood', 'Energy'],
        correlation: moodEnergyCorr.toFixed(2),
        strength: Math.abs(moodEnergyCorr) > 0.8 ? 'Strong' : 'Moderate',
        icon: '😊↔️⚡',
        insight: moodEnergyCorr > 0
          ? 'Positive mood and energy levels move together'
          : 'Low mood is linked to low energy',
        actionable: true
      });
    }

    return correlations;
  },

  /**
   * Calculate Pearson correlation coefficient
   * @param {array} x - First variable
   * @param {array} y - Second variable
   * @returns {number} Correlation coefficient (-1 to 1)
   */
  calculateCorrelation: (x = [], y = []) => {
    if (x.length < 2 || x.length !== y.length) return 0;

    const n = x.length;
    const meanX = x.reduce((a, b) => a + b) / n;
    const meanY = y.reduce((a, b) => a + b) / n;

    let numerator = 0;
    let sumX2 = 0;
    let sumY2 = 0;

    for (let i = 0; i < n; i++) {
      const dx = x[i] - meanX;
      const dy = y[i] - meanY;
      numerator += dx * dy;
      sumX2 += dx * dx;
      sumY2 += dy * dy;
    }

    const denominator = Math.sqrt(sumX2 * sumY2);
    return denominator === 0 ? 0 : numerator / denominator;
  },

  /**
   * Analyze trends over time
   * @param {array} checkIns - Check-in data
   * @returns {array} Trend analysis
   */
  analyzeTrends: (checkIns = []) => {
    const trends = [];

    if (checkIns.length < 2) return trends;

    // Sort by date
    const sorted = [...checkIns].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    // Mood trend
    const moodStart = sorted[0].mood;
    const moodEnd = sorted[sorted.length - 1].mood;
    const moodChange = moodEnd - moodStart;

    trends.push({
      metric: 'Mood',
      icon: '😊',
      startValue: moodStart,
      endValue: moodEnd,
      change: moodChange,
      direction: moodChange > 0 ? 'improving' : moodChange < 0 ? 'declining' : 'stable',
      percent: moodChange !== 0 ? Math.round((moodChange / moodStart) * 100) : 0,
      interpretation: moodChange > 0
        ? '📈 Your mood is improving - keep up the good work!'
        : moodChange < 0
          ? '📉 Your mood seems to be declining - consider self-care'
          : '➡️ Your mood has been stable'
    });

    // Energy trend
    const energyStart = sorted[0].energy;
    const energyEnd = sorted[sorted.length - 1].energy;
    const energyChange = energyEnd - energyStart;

    trends.push({
      metric: 'Energy',
      icon: '⚡',
      startValue: energyStart,
      endValue: energyEnd,
      change: energyChange,
      direction: energyChange > 0 ? 'improving' : energyChange < 0 ? 'declining' : 'stable',
      percent: energyChange !== 0 ? Math.round((energyChange / energyStart) * 100) : 0,
      interpretation: energyChange > 0
        ? '📈 Your energy levels are on the rise!'
        : energyChange < 0
          ? '📉 You might need more rest or better nutrition'
          : '➡️ Your energy has been consistent'
    });

    // Sleep trend
    const sleepStart = sorted[0].sleep;
    const sleepEnd = sorted[sorted.length - 1].sleep;
    const sleepChange = sleepEnd - sleepStart;

    trends.push({
      metric: 'Sleep',
      icon: '😴',
      startValue: sleepStart.toFixed(1),
      endValue: sleepEnd.toFixed(1),
      change: sleepChange.toFixed(1),
      direction: sleepChange > 0.5 ? 'improving' : sleepChange < -0.5 ? 'declining' : 'stable',
      percent: sleepChange !== 0 ? Math.round((sleepChange / sleepStart) * 100) : 0,
      interpretation: sleepChange > 0.5
        ? '📈 Your sleep duration is improving'
        : sleepChange < -0.5
          ? '📉 You\'re getting less sleep than before'
          : '➡️ Your sleep pattern has been consistent'
    });

    return trends;
  },

  /**
   * Generate alerts based on insights
   * @param {array} checkIns - Check-in data
   * @returns {array} Alerts
   */
  generateAlerts: (checkIns = []) => {
    const alerts = [];

    if (checkIns.length === 0) return alerts;

    const recent = checkIns[checkIns.length - 1];

    // Critical mood alert
    if (recent.mood < 3) {
      alerts.push({
        severity: 'critical',
        emoji: '🚨',
        title: 'Low Mood Detected',
        message: 'Your mood seems very low today. Consider reaching out to someone or practicing self-care.',
        action: 'Reach out to support'
      });
    } else if (recent.mood < 5) {
      alerts.push({
        severity: 'warning',
        emoji: '⚠️',
        title: 'Mood Below Average',
        message: 'Your mood is lower than usual. Try some relaxation techniques.',
        action: 'Practice mindfulness'
      });
    }

    // Sleep deficit alert
    if (recent.sleep < 5) {
      alerts.push({
        severity: 'critical',
        emoji: '😴',
        title: 'Severe Sleep Deficit',
        message: 'You\'re getting critically low sleep. Aim for 7-8 hours tonight.',
        action: 'Prioritize sleep'
      });
    } else if (recent.sleep < 6) {
      alerts.push({
        severity: 'warning',
        emoji: '😴',
        title: 'Insufficient Sleep',
        message: 'You\'re not getting enough sleep. This affects your health.',
        action: 'Extend sleep time'
      });
    }

    // Low energy alert
    if (recent.energy < 3) {
      alerts.push({
        severity: 'warning',
        emoji: '⚡',
        title: 'Very Low Energy',
        message: 'Your energy is critically low. Consider rest or checking in with yourself.',
        action: 'Take a break'
      });
    }

    // Pattern-based alerts
    const avgMood = checkIns.reduce((sum, c) => sum + c.mood, 0) / checkIns.length;
    if (avgMood < 4 && checkIns.length >= 3) {
      alerts.push({
        severity: 'warning',
        emoji: '📊',
        title: 'Consistent Low Mood Pattern',
        message: 'Your average mood this week has been low. Consider professional support.',
        action: 'Seek support'
      });
    }

    return alerts;
  },

  /**
   * Generate actionable insight recommendations
   * @param {array} checkIns - Check-in data
   * @returns {array} Recommendations
   */
  generateInsightRecommendations: (checkIns = []) => {
    const recommendations = [];

    if (checkIns.length === 0) return recommendations;

    // Based on sleep-mood correlation
    const sleepMoodCorr = InsightsEngine.calculateCorrelation(
      checkIns.map(c => c.sleep),
      checkIns.map(c => c.mood)
    );

    if (sleepMoodCorr > 0.5) {
      recommendations.push({
        priority: 'high',
        title: '😴 Prioritize Sleep for Better Mood',
        description: 'Your data shows a strong connection between sleep quality and mood. Getting 7-8 hours nightly could significantly improve your emotional wellbeing.',
        icon: '🛏️'
      });
    }

    // Based on low energy
    const avgEnergy = checkIns.reduce((sum, c) => sum + c.energy, 0) / checkIns.length;
    if (avgEnergy < 5) {
      recommendations.push({
        priority: 'high',
        title: '⚡ Boost Your Energy Levels',
        description: 'Your energy is consistently low. Try: regular exercise, eating nutrient-rich foods, staying hydrated, and maintaining a sleep schedule.',
        icon: '🏃'
      });
    }

    // Based on mood patterns
    const avgMood = checkIns.reduce((sum, c) => sum + c.mood, 0) / checkIns.length;
    if (avgMood < 5) {
      recommendations.push({
        priority: 'high',
        title: '😊 Improve Your Emotional Wellbeing',
        description: 'Consider practicing: daily gratitude, meditation, spending time in nature, connecting with loved ones, and seeking professional support if needed.',
        icon: '🧘'
      });
    }

    // General wellness recommendation
    recommendations.push({
      priority: 'medium',
      title: '✨ Build Consistent Habits',
      description: 'The data shows consistency is key. Focus on maintaining regular sleep, exercise, and check-in routines for better results.',
      icon: '📅'
    });

    return recommendations;
  },

  /**
   * Get insight summary message
   * @returns {string} Summary message
   */
  getInsightSummary: () => {
    const insights = InsightsEngine.analyzeWellness();
    
    if (insights.patterns.length === 0) {
      return 'Keep logging your data to unlock personalized insights!';
    }

    const topPattern = insights.patterns[0];
    const topCorrelation = insights.correlations[0];

    let summary = `📊 Key Insight: ${topPattern.insight}`;

    if (topCorrelation) {
      summary += ` Also, ${topCorrelation.insight}`;
    }

    return summary;
  }
};

// Export for module systems if needed
if (typeof module !== 'undefined' && module.exports) {
  module.exports = InsightsEngine;
}
