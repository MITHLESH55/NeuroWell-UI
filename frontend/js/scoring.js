/**
 * NEUROWELL - Scoring Module
 * Implements weighted scoring logic for wellness assessment
 * Calculates overall score (0-100) and category breakdown
 * Uses formulas based on question weights and impact (positive/negative)
 */

const ScoringEngine = {
  /**
   * Calculate wellness scores from assessment responses
   * @param {array} responses - Array of {question_id, value} responses
   * @returns {object} Scores object with overall, physical, mental, emotional
   */
  calculateScores: (responses) => {
    if (!responses || responses.length === 0) {
      return {
        overall: 0,
        physical: 0,
        mental: 0,
        emotional: 0
      };
    }

    // Initialize score accumulators
    let physicalScore = 0;
    let physicalWeight = 0;
    let mentalScore = 0;
    let mentalWeight = 0;
    let emotionalScore = 0;
    let emotionalWeight = 0;

    // Process each response
    responses.forEach(response => {
      const question = QUESTIONS.find(q => q.id === response.question_id);
      
      if (!question) return; // Skip if question not found

      const value = response.value; // Scale 1-5
      const weight = question.weight;
      const impact = question.impact;

      // Apply impact direction (positive questions use value as-is, negative invert)
      let scoredValue = value;
      if (impact === 'negative') {
        // For negative impact questions, invert: 1→5, 2→4, 3→3, 4→2, 5→1
        scoredValue = 6 - value;
      }

      // Normalize to 0-100 scale: (scoredValue / 5) * 100
      const normalizedScore = (scoredValue / 5) * 100;

      // Apply weight and accumulate by category
      switch (question.category) {
        case 'Physical Health':
        case 'Physical':
          physicalScore += normalizedScore * weight;
          physicalWeight += weight;
          break;
        case 'Mental Health':
        case 'Mental':
          mentalScore += normalizedScore * weight;
          mentalWeight += weight;
          break;
        case 'Emotional Wellness':
        case 'Emotional':
          emotionalScore += normalizedScore * weight;
          emotionalWeight += weight;
          break;
      }
    });

    // Calculate weighted averages
    const physical = physicalWeight > 0 ? Math.round(physicalScore / physicalWeight) : 0;
    const mental = mentalWeight > 0 ? Math.round(mentalScore / mentalWeight) : 0;
    const emotional = emotionalWeight > 0 ? Math.round(emotionalScore / emotionalWeight) : 0;

    // Calculate overall score (weighted average of three categories)
    const overall = Math.round((physical * 0.35 + mental * 0.35 + emotional * 0.30));

    return {
      overall: Math.min(100, Math.max(0, overall)),
      physical: Math.min(100, Math.max(0, physical)),
      mental: Math.min(100, Math.max(0, mental)),
      emotional: Math.min(100, Math.max(0, emotional))
    };
  },

  /**
   * Get score status/label
   * @param {number} score - Score value (0-100)
   * @returns {object} Status object with label and color
   */
  getScoreStatus: (score) => {
    for (const [key, range] of Object.entries(CONSTANTS.SCORE_RANGES)) {
      if (score >= range.min && score <= range.max) {
        return {
          key: key,
          label: range.label,
          color: range.color,
          score: score,
          percentage: score
        };
      }
    }
    return CONSTANTS.SCORE_RANGES.POOR;
  },

  /**
   * Get all score statuses
   * @param {object} scores - Scores object
   * @returns {object} Map of category statuses
   */
  getAllScoreStatuses: (scores) => {
    return {
      overall: ScoringEngine.getScoreStatus(scores.overall),
      physical: ScoringEngine.getScoreStatus(scores.physical),
      mental: ScoringEngine.getScoreStatus(scores.mental),
      emotional: ScoringEngine.getScoreStatus(scores.emotional)
    };
  },

  /**
   * Calculate burnout risk percentage
   * @param {object} scores - Scores object
   * @returns {number} Burnout risk percentage (0-100)
   */
  calculateBurnoutRisk: (scores) => {
    // Burnout risk is inverse of mental wellness
    // Higher mental score = lower burnout risk
    // Formula: burnoutRisk = 100 - (mental * weight) - (physical * weight) + stressWeight
    
    // Mental health has highest impact on burnout
    const mentalFactor = 100 - scores.mental; // 0-100, higher = higher burnout
    const physicalFactor = 100 - scores.physical; // 0-100, higher = higher burnout
    const emotionalFactor = 100 - scores.emotional; // 0-100, higher = higher burnout

    // Calculate burnout risk with weights
    const burnoutRisk = Math.round(
      (mentalFactor * 0.5 + physicalFactor * 0.25 + emotionalFactor * 0.25)
    );

    return Math.min(100, Math.max(0, burnoutRisk));
  },

  /**
   * Get burnout risk status
   * @param {number} burnoutRisk - Burnout risk percentage
   * @returns {object} Risk status object
   */
  getBurnoutRiskStatus: (burnoutRisk) => {
    for (const [key, range] of Object.entries(CONSTANTS.BURNOUT_RISK)) {
      if (burnoutRisk >= range.min && burnoutRisk <= range.max) {
        return {
          key: key,
          label: range.label,
          color: range.color,
          risk: burnoutRisk,
          percentage: burnoutRisk
        };
      }
    }
    return CONSTANTS.BURNOUT_RISK.HIGH;
  },

  /**
   * Calculate stress trend from historical data
   * @returns {object} Trend analysis with direction and change
   */
  calculateStressTrend: () => {
    const history = StorageManager.getHistoricalData();
    
    if (history.length < 2) {
      return {
        trend: 'stable',
        direction: '→',
        change: 0,
        message: 'Not enough data for trend analysis'
      };
    }

    const latest = history[history.length - 1];
    const previous = history[history.length - 2];
    
    const latestStress = 100 - latest.scores.mental;
    const previousStress = 100 - previous.scores.mental;
    const change = latestStress - previousStress;

    let trend = 'stable';
    let direction = '→';

    if (Math.abs(change) < 5) {
      trend = 'stable';
      direction = '→';
    } else if (change > 5) {
      trend = 'increasing';
      direction = '↑';
    } else if (change < -5) {
      trend = 'decreasing';
      direction = '↓';
    }

    return {
      trend: trend,
      direction: direction,
      change: Math.round(change * 10) / 10,
      previousStress: Math.round(previousStress),
      currentStress: Math.round(latestStress),
      message: trend === 'increasing' 
        ? 'Stress levels are increasing - consider wellness interventions'
        : trend === 'decreasing'
        ? 'Great! Stress levels are improving'
        : 'Stress levels are stable'
    };
  },

  /**
   * Generate score improvement suggestions
   * @param {object} scores - Current scores
   * @param {object} previousScores - Previous scores (optional)
   * @returns {array} Array of suggestion objects
   */
  generateSuggestions: (scores, previousScores = null) => {
    const suggestions = [];
    const threshold = 60; // Focus on categories below this

    if (scores.physical < threshold) {
      const improvement = previousScores 
        ? scores.physical - previousScores.physical 
        : 0;
      suggestions.push({
        category: 'Physical Health',
        score: scores.physical,
        improvement: improvement,
        priority: scores.physical < 40 ? 'HIGH' : 'MEDIUM',
        suggestion: 'Focus on improving sleep, exercise, and nutrition habits.'
      });
    }

    if (scores.mental < threshold) {
      const improvement = previousScores 
        ? scores.mental - previousScores.mental 
        : 0;
      suggestions.push({
        category: 'Mental Health',
        score: scores.mental,
        improvement: improvement,
        priority: scores.mental < 40 ? 'CRITICAL' : 'HIGH',
        suggestion: 'Implement stress management and work-life balance strategies.'
      });
    }

    if (scores.emotional < threshold) {
      const improvement = previousScores 
        ? scores.emotional - previousScores.emotional 
        : 0;
      suggestions.push({
        category: 'Emotional Wellness',
        score: scores.emotional,
        improvement: improvement,
        priority: scores.emotional < 40 ? 'HIGH' : 'MEDIUM',
        suggestion: 'Build emotional resilience through relationships and self-care.'
      });
    }

    return suggestions.sort((a, b) => a.score - b.score);
  },

  /**
   * Format score for display
   * @param {number} score - Score value
   * @param {string} format - Format type: 'percentage', 'number', 'icon'
   * @returns {string} Formatted score
   */
  formatScore: (score, format = 'percentage') => {
    switch (format) {
      case 'percentage':
        return `${score}%`;
      case 'number':
        return score.toString();
      case 'icon':
        if (score >= 80) return '⭐⭐⭐⭐⭐';
        if (score >= 60) return '⭐⭐⭐⭐';
        if (score >= 40) return '⭐⭐⭐';
        return '⭐⭐';
      default:
        return score.toString();
    }
  },

  /**
   * Get comprehensive score report
   * @returns {object} Complete score report
   */
  getScoreReport: () => {
    const responses = StorageManager.getAssessmentResponses();
    if (!responses) return null;

    const scores = ScoringEngine.calculateScores(responses.responses);
    const statuses = ScoringEngine.getAllScoreStatuses(scores);
    const burnoutRisk = ScoringEngine.calculateBurnoutRisk(scores);
    const burnoutStatus = ScoringEngine.getBurnoutRiskStatus(burnoutRisk);
    const trend = ScoringEngine.calculateStressTrend();
    const suggestions = ScoringEngine.generateSuggestions(scores);

    return {
      scores: scores,
      statuses: statuses,
      burnoutRisk: burnoutRisk,
      burnoutStatus: burnoutStatus,
      trend: trend,
      suggestions: suggestions,
      lastUpdated: responses.timestamp,
      nextRecommendedDate: new Date(new Date(responses.timestamp).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString()
    };
  }
};
