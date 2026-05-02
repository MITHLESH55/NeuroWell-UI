/**
 * NEUROWELL - Recommendation Engine
 * Generates personalized, dynamic recommendations based on wellness scores
 * Identifies problem areas and suggests appropriate experts
 * AI logic: pattern detection, severity assessment, personalized advice
 */

const RecommendationLogic = {
  /**
   * Generate comprehensive recommendations based on scores
   * @param {object} scores - {overall, physical, mental, emotional}
   * @returns {object} Recommendations with suggestions, risks, and experts
   */
  generateRecommendations: (scores = {}) => {
    const validated = Utility.validateScores(scores);

    return {
      suggestions: RecommendationLogic.generateSuggestions(validated),
      riskAssessment: RecommendationLogic.assessRisk(validated),
      expertRecommendations: RecommendationLogic.getExpertRecommendations(validated),
      actionItems: RecommendationLogic.generateActionItems(validated),
      focusAreas: RecommendationLogic.identifyFocusAreas(validated),
      timestamp: new Date().toISOString()
    };
  },

  /**
   * Generate personalized suggestions based on individual scores
   * @param {object} scores - Validated scores
   * @returns {array} Array of suggestion objects
   */
  generateSuggestions: (scores) => {
    const suggestions = [];

    // Physical Health Suggestions
    if (scores.physical < 50) {
      suggestions.push({
        category: 'Physical',
        severity: 'high',
        title: 'Critical: Physical Activity Deficit',
        description: 'Your physical health score is critically low. Increase daily movement and exercise.',
        actions: [
          'Start with 20-minute walks daily',
          'Add strength training 2-3 times per week',
          'Stretch for 5-10 minutes daily',
          'Stay hydrated throughout the day'
        ]
      });
    } else if (scores.physical < 70) {
      suggestions.push({
        category: 'Physical',
        severity: 'medium',
        title: 'Improve Physical Fitness',
        description: 'Your fitness level needs attention. Gradually increase activity intensity.',
        actions: [
          'Aim for 150 minutes of moderate activity weekly',
          'Include flexibility and balance exercises',
          'Monitor sleep quality and duration',
          'Consider sports or group activities'
        ]
      });
    } else {
      suggestions.push({
        category: 'Physical',
        severity: 'low',
        title: 'Maintain Physical Health',
        description: 'Great job! Keep maintaining your current fitness routine.',
        actions: [
          'Continue regular exercise habits',
          'Stay consistent with physical activity',
          'Focus on preventing injury and maintaining flexibility'
        ]
      });
    }

    // Mental Health Suggestions
    if (scores.mental < 50) {
      suggestions.push({
        category: 'Mental',
        severity: 'high',
        title: 'Critical: Mental Health Support Needed',
        description: 'Your mental wellbeing requires immediate attention. Consider professional support.',
        actions: [
          'Practice meditation (10-15 minutes daily)',
          'Limit screen time to 2 hours before bed',
          'Engage in journaling or reflection',
          'Maintain consistent sleep schedule'
        ]
      });
    } else if (scores.mental < 70) {
      suggestions.push({
        category: 'Mental',
        severity: 'medium',
        title: 'Strengthen Mental Resilience',
        description: 'Focus on stress management and mental clarity.',
        actions: [
          'Practice mindfulness meditation 15-20 minutes daily',
          'Take regular breaks from work',
          'Engage in hobbies and creative activities',
          'Build healthy work-life boundaries'
        ]
      });
    } else {
      suggestions.push({
        category: 'Mental',
        severity: 'low',
        title: 'Excellent Mental Wellbeing',
        description: 'Your mental health is in good shape. Maintain these positive habits.',
        actions: [
          'Continue stress management practices',
          'Support others with mental health awareness',
          'Keep work-life balance strong'
        ]
      });
    }

    // Emotional Wellness Suggestions
    if (scores.emotional < 50) {
      suggestions.push({
        category: 'Emotional',
        severity: 'high',
        title: 'Critical: Emotional Support Required',
        description: 'Your emotional wellbeing needs immediate care. Seek professional guidance.',
        actions: [
          'Connect with supportive friends and family',
          'Practice self-compassion and self-care',
          'Engage in activities that bring joy',
          'Consider therapy or counseling'
        ]
      });
    } else if (scores.emotional < 70) {
      suggestions.push({
        category: 'Emotional',
        severity: 'medium',
        title: 'Nurture Emotional Health',
        description: 'Invest in building stronger emotional connections.',
        actions: [
          'Spend quality time with loved ones',
          'Express emotions through art, music, or writing',
          'Practice gratitude daily',
          'Build a support network'
        ]
      });
    } else {
      suggestions.push({
        category: 'Emotional',
        severity: 'low',
        title: 'Strong Emotional Wellbeing',
        description: 'Your emotional health is thriving. Share positivity with others.',
        actions: [
          'Mentor others in emotional wellness',
          'Maintain strong relationships',
          'Continue self-care practices'
        ]
      });
    }

    return suggestions;
  },

  /**
   * Assess overall risk level and critical alerts
   * @param {object} scores - Validated scores
   * @returns {object} Risk assessment with alerts
   */
  assessRisk: (scores) => {
    const riskScores = {
      physical: Utility.getRiskLevel(scores.physical),
      mental: Utility.getRiskLevel(scores.mental),
      emotional: Utility.getRiskLevel(scores.emotional),
      overall: Utility.getRiskLevel(scores.overall)
    };

    const criticalAlerts = [];
    const warnings = [];

    // Physical alerts
    if (scores.physical < 40) {
      criticalAlerts.push('🚨 Severe fitness deficit - immediate intervention needed');
    } else if (scores.physical < 60) {
      warnings.push('⚠️  Low physical activity - increase daily movement');
    }

    // Mental alerts
    if (scores.mental < 40) {
      criticalAlerts.push('🚨 Severe stress/anxiety - seek professional support');
    } else if (scores.mental < 60) {
      warnings.push('⚠️  High stress levels - practice stress management');
    }

    // Emotional alerts
    if (scores.emotional < 40) {
      criticalAlerts.push('🚨 Emotional distress - reach out for support');
    } else if (scores.emotional < 60) {
      warnings.push('⚠️  Emotional instability - prioritize self-care');
    }

    // Correlation alerts
    if (scores.mental < 50 && scores.emotional < 50) {
      criticalAlerts.push('🚨 Mental-emotional connection: Combined stress and emotional strain');
    }

    if (scores.physical < 50 && scores.mental < 50) {
      warnings.push('⚠️  Physical-mental connection: Low activity linked to stress');
    }

    return {
      levels: riskScores,
      criticalAlerts,
      warnings,
      overallRisk: RecommendationLogic.calculateOverallRisk(scores)
    };
  },

  /**
   * Calculate overall risk percentage
   * @param {object} scores - Validated scores
   * @returns {number} Risk percentage (0-100)
   */
  calculateOverallRisk: (scores) => {
    const avgScore = (scores.physical + scores.mental + scores.emotional) / 3;
    return Math.round(100 - avgScore);
  },

  /**
   * Get expert recommendations based on lowest scores
   * @param {object} scores - Validated scores
   * @returns {array} Expert recommendations
   */
  getExpertRecommendations: (scores) => {
    const experts = [];

    // Physiotherapist recommendation
    if (scores.physical < 65) {
      experts.push({
        type: 'Physiotherapist',
        icon: '💪',
        title: 'Physical Health Specialist',
        description: 'Help improve fitness, correct posture, and prevent injuries',
        rationale: `Your physical health score is ${scores.physical}/100. A physiotherapist can create a personalized exercise program.`,
        consultButton: 'Consult Now',
        priority: scores.physical < 50 ? 'High' : 'Medium'
      });
    }

    // Psychologist recommendation
    if (scores.mental < 65) {
      experts.push({
        type: 'Psychologist',
        icon: '🧠',
        title: 'Mental Health Professional',
        description: 'Address stress, anxiety, and mental health concerns',
        rationale: `Your mental health score is ${scores.mental}/100. Professional support can help develop coping strategies.`,
        consultButton: 'Consult Now',
        priority: scores.mental < 50 ? 'High' : 'Medium'
      });
    }

    // Counselor recommendation
    if (scores.emotional < 65) {
      experts.push({
        type: 'Counselor',
        icon: '💭',
        title: 'Emotional Counselor',
        description: 'Develop emotional resilience and relationship skills',
        rationale: `Your emotional wellness score is ${scores.emotional}/100. Counseling can help build emotional strength.`,
        consultButton: 'Consult Now',
        priority: scores.emotional < 50 ? 'High' : 'Medium'
      });
    }

    // Nutritionist recommendation (secondary)
    if (scores.physical < 70 || scores.mental < 70) {
      experts.push({
        type: 'Nutritionist',
        icon: '🥗',
        title: 'Nutrition Specialist',
        description: 'Optimize diet for better health and energy',
        rationale: 'Proper nutrition supports both physical and mental wellbeing.',
        consultButton: 'Consult Now',
        priority: 'Medium'
      });
    }

    // Wellness Coach recommendation (general)
    if (scores.overall < 75) {
      experts.push({
        type: 'Wellness Coach',
        icon: '🎯',
        title: 'Life Coach / Wellness Coach',
        description: 'Develop sustainable healthy habits and goals',
        rationale: 'A wellness coach can help you create and maintain positive changes.',
        consultButton: 'Consult Now',
        priority: 'Low'
      });
    }

    return experts.length > 0 ? experts : [{
      type: 'Wellness Coach',
      icon: '🎯',
      title: 'Wellness Coach',
      description: 'Maintain and enhance your excellent wellness',
      rationale: 'Continue building on your strong foundation.',
      consultButton: 'Learn More',
      priority: 'Low'
    }];
  },

  /**
   * Generate specific action items based on scores
   * @param {object} scores - Validated scores
   * @returns {array} Action items with priorities
   */
  generateActionItems: (scores) => {
    const actions = [];

    // High priority actions
    if (scores.physical < 50) {
      actions.push({
        priority: 'high',
        category: 'Physical',
        action: 'Start a daily 20-30 minute exercise routine',
        timeframe: 'This week'
      });
    }

    if (scores.mental < 50) {
      actions.push({
        priority: 'high',
        category: 'Mental',
        action: 'Begin daily meditation or breathing exercises',
        timeframe: 'Today'
      });
    }

    if (scores.emotional < 50) {
      actions.push({
        priority: 'high',
        category: 'Emotional',
        action: 'Connect with a friend, family member, or therapist',
        timeframe: 'This week'
      });
    }

    // Medium priority actions
    if (scores.physical >= 50 && scores.physical < 70) {
      actions.push({
        priority: 'medium',
        category: 'Physical',
        action: 'Increase weekly exercise frequency by 1 session',
        timeframe: 'Next week'
      });
    }

    if (scores.mental >= 50 && scores.mental < 70) {
      actions.push({
        priority: 'medium',
        category: 'Mental',
        action: 'Practice stress management techniques daily',
        timeframe: 'This week'
      });
    }

    // Low priority actions (maintenance)
    if (scores.overall >= 70) {
      actions.push({
        priority: 'low',
        category: 'General',
        action: 'Document your wellness journey and share insights',
        timeframe: 'Ongoing'
      });
    }

    return actions;
  },

  /**
   * Identify focus areas from scores
   * @param {object} scores - Validated scores
   * @returns {object} Primary and secondary focus areas
   */
  identifyFocusAreas: (scores) => {
    const areas = [
      { name: 'Physical', score: scores.physical },
      { name: 'Mental', score: scores.mental },
      { name: 'Emotional', score: scores.emotional }
    ];

    areas.sort((a, b) => a.score - b.score);

    return {
      primary: areas[0]?.name || 'General Wellness',
      primaryScore: areas[0]?.score || 0,
      secondary: areas[1]?.name || 'Wellness',
      secondaryScore: areas[1]?.score || 0,
      tertiary: areas[2]?.name || 'Wellness',
      tertiaryScore: areas[2]?.score || 0
    };
  },

  /**
   * Get quick insight message
   * @param {object} scores - Validated scores
   * @returns {string} Personalized insight message
   */
  getInsightMessage: (scores) => {
    const focus = RecommendationLogic.identifyFocusAreas(scores);
    const risk = Utility.getRiskLevel(scores.overall);

    if (risk === 'high') {
      return `⚠️ Your ${focus.primary} wellness needs immediate attention. Let's create a recovery plan.`;
    } else if (risk === 'medium') {
      return `💡 Focus on improving ${focus.primary} wellness this week. Small steps lead to big changes.`;
    } else {
      return `✨ Great job! You're maintaining excellent wellness. Keep up these positive habits!`;
    }
  }
};

// Export for module systems if needed
if (typeof module !== 'undefined' && module.exports) {
  module.exports = RecommendationLogic;
}
