/**
 * NEUROWELL - Goal Tracking System
 * Manages wellness goals with progress tracking, localStorage persistence
 * Supports multiple goal types: sleep, stress, activity, and custom
 */

const GoalTracker = {
  /**
   * Initialize default goals
   * @returns {array} Default goals
   */
  getDefaultGoals: () => {
    return [
      {
        id: 'sleep-goal',
        title: 'Improve Sleep',
        description: 'Get 7-8 hours of quality sleep',
        category: 'Sleep',
        target: 56,  // 8 hours * 7 days
        current: 0,
        unit: 'hours/week',
        icon: '😴',
        color: '#3b82f6',
        startDate: new Date().toISOString(),
        dueDate: Utility.daysAgo(-30).toISOString(),
        priority: 'high',
        completed: false
      },
      {
        id: 'stress-goal',
        title: 'Reduce Stress',
        description: 'Practice meditation and stress management',
        category: 'Mental',
        target: 210,  // 30 minutes * 7 days
        current: 0,
        unit: 'minutes/week',
        icon: '🧘',
        color: '#8b5cf6',
        startDate: new Date().toISOString(),
        dueDate: Utility.daysAgo(-30).toISOString(),
        priority: 'high',
        completed: false
      },
      {
        id: 'activity-goal',
        title: 'Increase Activity',
        description: 'Get 150 minutes of moderate exercise weekly',
        category: 'Physical',
        target: 150,
        current: 0,
        unit: 'minutes/week',
        icon: '🏃',
        color: '#ef4444',
        startDate: new Date().toISOString(),
        dueDate: Utility.daysAgo(-30).toISOString(),
        priority: 'high',
        completed: false
      }
    ];
  },

  /**
   * Load goals from localStorage
   * @returns {array} Stored goals or defaults
   */
  loadGoals: () => {
    try {
      const stored = localStorage.getItem(CONSTANTS.STORAGE.GOALS);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('❌ Error loading goals:', error);
    }
    return GoalTracker.getDefaultGoals();
  },

  /**
   * Save goals to localStorage
   * @param {array} goals - Goals to save
   * @returns {boolean} Success status
   */
  saveGoals: (goals) => {
    try {
      localStorage.setItem(CONSTANTS.STORAGE.GOALS, JSON.stringify(goals));
      console.log('✓ Goals saved');
      return true;
    } catch (error) {
      console.error('❌ Error saving goals:', error);
      return false;
    }
  },

  /**
   * Get all goals
   * @returns {array} All stored goals
   */
  getGoals: () => {
    return GoalTracker.loadGoals();
  },

  /**
   * Get goal by ID
   * @param {string} goalId - Goal ID
   * @returns {object|null} Goal or null
   */
  getGoalById: (goalId) => {
    const goals = GoalTracker.getGoals();
    return goals.find(g => g.id === goalId) || null;
  },

  /**
   * Create new goal
   * @param {object} goalData - Goal data
   * @returns {object|null} Created goal
   */
  createGoal: (goalData) => {
    try {
      const goal = {
        id: `goal-${Date.now()}`,
        title: goalData.title || 'New Goal',
        description: goalData.description || '',
        category: goalData.category || 'General',
        target: goalData.target || 100,
        current: 0,
        unit: goalData.unit || '',
        icon: goalData.icon || '🎯',
        color: goalData.color || '#6366f1',
        startDate: new Date().toISOString(),
        dueDate: goalData.dueDate || Utility.daysAgo(-30).toISOString(),
        priority: goalData.priority || 'medium',
        completed: false,
        createdAt: new Date().toISOString()
      };

      const goals = GoalTracker.getGoals();
      goals.push(goal);
      GoalTracker.saveGoals(goals);

      return goal;
    } catch (error) {
      console.error('❌ Error creating goal:', error);
      return null;
    }
  },

  /**
   * Update goal progress
   * @param {string} goalId - Goal ID
   * @param {number} progress - Progress amount to add
   * @returns {object|null} Updated goal
   */
  updateProgress: (goalId, progress = 0) => {
    try {
      const goals = GoalTracker.getGoals();
      const goal = goals.find(g => g.id === goalId);

      if (!goal) return null;

      goal.current = Math.min(goal.current + progress, goal.target);
      goal.lastUpdated = new Date().toISOString();

      if (goal.current >= goal.target) {
        goal.completed = true;
        goal.completedDate = new Date().toISOString();
      }

      GoalTracker.saveGoals(goals);
      return goal;
    } catch (error) {
      console.error('❌ Error updating progress:', error);
      return null;
    }
  },

  /**
   * Set goal progress to specific value
   * @param {string} goalId - Goal ID
   * @param {number} value - Progress value
   * @returns {object|null} Updated goal
   */
  setProgress: (goalId, value = 0) => {
    try {
      const goals = GoalTracker.getGoals();
      const goal = goals.find(g => g.id === goalId);

      if (!goal) return null;

      goal.current = Math.max(0, Math.min(value, goal.target));
      goal.lastUpdated = new Date().toISOString();

      if (goal.current >= goal.target) {
        goal.completed = true;
        goal.completedDate = new Date().toISOString();
      }

      GoalTracker.saveGoals(goals);
      return goal;
    } catch (error) {
      console.error('❌ Error setting progress:', error);
      return null;
    }
  },

  /**
   * Calculate goal progress percentage
   * @param {string} goalId - Goal ID
   * @returns {number} Progress percentage (0-100)
   */
  getProgressPercent: (goalId) => {
    const goal = GoalTracker.getGoalById(goalId);
    if (!goal) return 0;
    return Utility.calculateProgress(goal.current, goal.target);
  },

  /**
   * Get all completed goals
   * @returns {array} Completed goals
   */
  getCompletedGoals: () => {
    return GoalTracker.getGoals().filter(g => g.completed);
  },

  /**
   * Get active goals (not completed)
   * @returns {array} Active goals
   */
  getActiveGoals: () => {
    return GoalTracker.getGoals().filter(g => !g.completed);
  },

  /**
   * Delete goal
   * @param {string} goalId - Goal ID
   * @returns {boolean} Success status
   */
  deleteGoal: (goalId) => {
    try {
      let goals = GoalTracker.getGoals();
      goals = goals.filter(g => g.id !== goalId);
      GoalTracker.saveGoals(goals);
      return true;
    } catch (error) {
      console.error('❌ Error deleting goal:', error);
      return false;
    }
  },

  /**
   * Reset goal progress
   * @param {string} goalId - Goal ID
   * @returns {object|null} Reset goal
   */
  resetGoal: (goalId) => {
    try {
      const goals = GoalTracker.getGoals();
      const goal = goals.find(g => g.id === goalId);

      if (!goal) return null;

      goal.current = 0;
      goal.completed = false;
      goal.completedDate = null;
      goal.resetDate = new Date().toISOString();

      GoalTracker.saveGoals(goals);
      return goal;
    } catch (error) {
      console.error('❌ Error resetting goal:', error);
      return null;
    }
  },

  /**
   * Get goals by category
   * @param {string} category - Category name
   * @returns {array} Goals in category
   */
  getGoalsByCategory: (category) => {
    return GoalTracker.getGoals().filter(g => g.category === category);
  },

  /**
   * Get goals by priority
   * @param {string} priority - Priority level
   * @returns {array} Goals with priority
   */
  getGoalsByPriority: (priority) => {
    return GoalTracker.getGoals().filter(g => g.priority === priority);
  },

  /**
   * Calculate overall goal completion
   * @returns {number} Percentage of all goals completed
   */
  getOverallCompletion: () => {
    const goals = GoalTracker.getGoals();
    if (goals.length === 0) return 0;

    const completed = goals.filter(g => g.completed).length;
    return Math.round((completed / goals.length) * 100);
  },

  /**
   * Get goals due this week
   * @returns {array} Goals due within 7 days
   */
  getGoalsDueThisWeek: () => {
    const today = new Date();
    const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

    return GoalTracker.getGoals().filter(g => {
      if (g.completed) return false;
      const dueDate = new Date(g.dueDate);
      return dueDate >= today && dueDate <= weekFromNow;
    });
  },

  /**
   * Get overdue goals
   * @returns {array} Goals that are past due date
   */
  getOverdueGoals: () => {
    const today = new Date();
    return GoalTracker.getGoals().filter(g => {
      if (g.completed) return false;
      const dueDate = new Date(g.dueDate);
      return dueDate < today;
    });
  },

  /**
   * Get goal recommendations based on scores
   * @param {object} scores - Wellness scores
   * @returns {array} Recommended goals
   */
  getRecommendedGoals: (scores = {}) => {
    const validated = Utility.validateScores(scores);
    const recommended = [];

    if (validated.physical < 70) {
      recommended.push({
        title: 'Daily Exercise',
        description: 'Exercise 30 minutes daily',
        target: 210,
        unit: 'minutes/week'
      });
    }

    if (validated.mental < 70) {
      recommended.push({
        title: 'Meditation Practice',
        description: 'Meditate 15 minutes daily',
        target: 105,
        unit: 'minutes/week'
      });
    }

    if (validated.emotional < 70) {
      recommended.push({
        title: 'Social Connection',
        description: 'Connect with friends 3+ times weekly',
        target: 3,
        unit: 'times/week'
      });
    }

    return recommended;
  },

  /**
   * Get goal statistics
   * @returns {object} Statistics object
   */
  getStatistics: () => {
    const goals = GoalTracker.getGoals();
    const completed = goals.filter(g => g.completed);
    const active = goals.filter(g => !g.completed);
    const overdue = GoalTracker.getOverdueGoals();

    const avgProgress = goals.length > 0
      ? Math.round(goals.reduce((sum, g) => sum + GoalTracker.getProgressPercent(g.id), 0) / goals.length)
      : 0;

    return {
      total: goals.length,
      completed: completed.length,
      active: active.length,
      overdue: overdue.length,
      completionRate: GoalTracker.getOverallCompletion(),
      averageProgress: avgProgress,
      successRate: goals.length > 0 ? Math.round((completed.length / goals.length) * 100) : 0
    };
  }
};

// Export for module systems if needed
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GoalTracker;
}
