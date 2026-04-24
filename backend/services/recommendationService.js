/**
 * NEUROWELL BACKEND - Recommendation Service
 * Rule-based AI logic for generating personalized recommendations
 * Evaluates rules based on wellness scores and burnout risk
 * Returns prioritized recommendations with actions
 */

const { evaluateRules } = require('../data/rules');

class RecommendationService {
  /**
   * Generate personalized recommendations based on scores
   * @param {object} scores - Wellness scores {overall, physical, mental, emotional}
   * @param {number} burnoutRisk - Burnout risk percentage
   * @returns {array} Array of applicable recommendations
   */
  static generateRecommendations(scores, burnoutRisk) {
    try {
      // Evaluate which rules apply
      const applicableRules = evaluateRules(scores, burnoutRisk);

      // Transform rules to recommendation format
      const recommendations = applicableRules.map(rule => ({
        id: rule.id,
        category: rule.category,
        priority: rule.priority,
        title: rule.title,
        recommendations: rule.recommendations,
        actions: rule.actions
      }));

      // Limit to top 5 recommendations to avoid overwhelming users
      return recommendations.slice(0, 5);

    } catch (error) {
      console.error('Error generating recommendations:', error);
      return [];
    }
  }

  /**
   * Get quick wins - easy, immediate actions
   * @returns {array} Array of quick win suggestions
   */
  static getQuickWins() {
    return [
      {
        title: 'Take a 5-minute break',
        description: 'Step away from your screen, stretch, and breathe deeply',
        time: '5 min',
        difficulty: 'Easy'
      },
      {
        title: 'Drink a glass of water',
        description: 'Stay hydrated to improve focus and energy levels',
        time: '1 min',
        difficulty: 'Easy'
      },
      {
        title: 'Practice deep breathing',
        description: 'Try the 4-7-8 technique: inhale 4, hold 7, exhale 8',
        time: '2 min',
        difficulty: 'Easy'
      },
      {
        title: 'Stand up and stretch',
        description: 'Improve circulation and reduce physical tension',
        time: '3 min',
        difficulty: 'Easy'
      },
      {
        title: 'Write down 3 things you\'re grateful for',
        description: 'Boost mood and perspective with gratitude practice',
        time: '2 min',
        difficulty: 'Easy'
      },
      {
        title: 'Call a friend or loved one',
        description: 'Social connection improves emotional wellbeing',
        time: '10 min',
        difficulty: 'Medium'
      }
    ];
  }

  /**
   * Generate a 30-day wellness plan
   * @param {object} scores - Wellness scores
   * @returns {object} Structured 30-day plan
   */
  static generateWellnessPlan(scores) {
    const plan = {
      goals: this._generateGoals(scores),
      dailyHabits: {
        morning: this._generateMorningHabits(scores),
        daytime: this._generateDaytimeHabits(scores),
        evening: this._generateEveningHabits(scores)
      },
      checkpoints: this._generateCheckpoints(),
      duration: 30,
      startDate: new Date().toISOString().split('T')[0]
    };

    return plan;
  }

  /**
   * Generate personalized goals based on scores
   * @param {object} scores - Wellness scores
   * @returns {array} Array of goals
   */
  static _generateGoals(scores) {
    const goals = [];

    if (scores.physical < 60) {
      goals.push({
        category: 'Physical',
        target: 'Improve physical wellness score by 20 points',
        timeframe: '30 days',
        actions: ['Exercise 3x/week', 'Improve sleep quality', 'Better nutrition']
      });
    }

    if (scores.mental < 60) {
      goals.push({
        category: 'Mental',
        target: 'Reduce stress and improve mental clarity',
        timeframe: '30 days',
        actions: ['Daily meditation', 'Regular breaks', 'Work-life balance']
      });
    }

    if (scores.emotional < 60) {
      goals.push({
        category: 'Emotional',
        target: 'Enhance emotional wellbeing and confidence',
        timeframe: '30 days',
        actions: ['Social connections', 'Gratitude practice', 'Self-care activities']
      });
    }

    return goals;
  }

  /**
   * Generate morning habits
   * @param {object} scores - Wellness scores
   * @returns {array} Morning habit suggestions
   */
  static _generateMorningHabits(scores) {
    const habits = ['Drink water', 'Light stretching'];

    if (scores.mental < 70) {
      habits.push('5-minute meditation');
    }

    if (scores.physical < 70) {
      habits.push('Plan healthy breakfast');
    }

    return habits;
  }

  /**
   * Generate daytime habits
   * @param {object} scores - Wellness scores
   * @returns {array} Daytime habit suggestions
   */
  static _generateDaytimeHabits(scores) {
    const habits = ['Take regular breaks'];

    if (scores.mental < 70) {
      habits.push('Deep breathing exercises');
    }

    if (scores.physical < 70) {
      habits.push('Healthy snacks');
    }

    if (scores.emotional < 70) {
      habits.push('Positive affirmations');
    }

    return habits;
  }

  /**
   * Generate evening habits
   * @param {object} scores - Wellness scores
   * @returns {array} Evening habit suggestions
   */
  static _generateEveningHabits(scores) {
    const habits = ['Wind down routine'];

    if (scores.physical < 70) {
      habits.push('Prepare for better sleep');
    }

    if (scores.emotional < 70) {
      habits.push('Gratitude journaling');
    }

    return habits;
  }

  /**
   * Generate progress checkpoints
   * @returns {array} Checkpoint schedule
   */
  static _generateCheckpoints() {
    return [
      { day: 7, action: 'Review first week progress and adjust habits' },
      { day: 14, action: 'Retake assessment to measure improvement' },
      { day: 21, action: 'Evaluate goals and celebrate small wins' },
      { day: 30, action: 'Complete final assessment and plan next phase' }
    ];
  }
}

module.exports = RecommendationService;