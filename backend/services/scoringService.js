/**
 * NEUROWELL BACKEND - Scoring Service
 * Implements weighted scoring logic for wellness assessment
 * Calculates overall score (0-100) and category breakdown
 * Uses formulas based on question weights and impact (positive/negative)
 */

// Import questions data
const { QUESTIONS } = require('../data/questions');

class ScoringService {
  /**
   * Calculate wellness scores from assessment responses
   * @param {array} responses - Array of {question_id, value} responses
   * @returns {object} Scores object with overall, physical, mental, emotional
   */
  static calculateScores(responses) {
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
      const question = QUESTIONS.find(q => q.id === parseInt(response.question_id));

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
          physicalScore += normalizedScore * weight;
          physicalWeight += weight;
          break;
        case 'Mental Health':
          mentalScore += normalizedScore * weight;
          mentalWeight += weight;
          break;
        case 'Emotional Wellness':
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
  }

  /**
   * Get score status/label
   * @param {number} score - Score value (0-100)
   * @returns {object} Status object with label and color
   */
  static getScoreStatus(score) {
    if (score >= 80) return { label: 'Excellent', color: 'success' };
    if (score >= 60) return { label: 'Good', color: 'info' };
    if (score >= 40) return { label: 'Fair', color: 'warning' };
    return { label: 'Poor', color: 'danger' };
  }

  /**
   * Calculate burnout risk based on scores
   * @param {object} scores - Category scores
   * @returns {number} Burnout risk percentage (0-100)
   */
  static calculateBurnoutRisk(scores) {
    // Simple formula: inverse of average wellness score
    const averageScore = (scores.physical + scores.mental + scores.emotional) / 3;
    const risk = 100 - averageScore;

    return Math.min(100, Math.max(0, Math.round(risk)));
  }

  /**
   * Get comprehensive score report
   * @param {array} responses - Assessment responses
   * @returns {object} Complete score report
   */
  static getScoreReport(responses) {
    const scores = this.calculateScores(responses);
    const burnoutRisk = this.calculateBurnoutRisk(scores);
    const status = this.getScoreStatus(scores.overall);

    return {
      scores,
      status,
      burnoutRisk,
      timestamp: new Date().toISOString(),
      version: '1.0'
    };
  }
}

module.exports = ScoringService;