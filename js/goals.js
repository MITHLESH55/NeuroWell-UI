/**
 * NEUROWELL - Goal Tracking Module
 * Manages user goals, progress tracking, and achievement metrics
 * Integrates with scoring engine and storage system
 */

const GoalManager = {
  /**
   * Initialize user goals on first access
   * Creates default goals if none exist
   * @returns {object} Goals configuration
   */
  initializeGoals: () => {
    const existing = GoalManager.getGoals();
    if (existing && existing.length > 0) {
      return existing;
    }

    // Create default goals for new users
    const defaultGoals = Object.values(CONSTANTS.GOALS).map(goalDef => ({
      id: goalDef.id,
      name: goalDef.name,
      description: goalDef.description,
      icon: goalDef.icon,
      category: goalDef.category,
      targetScore: goalDef.targetScore,
      currentThreshold: goalDef.currentThreshold,
      baselineThreshold: goalDef.baselineThreshold,
      color: goalDef.color,
      createdAt: new Date().toISOString(),
      startingScore: null,
      progress: 0,
      status: 'in_progress',
      completedAt: null,
      isActive: true
    }));

    GoalManager.saveGoals(defaultGoals);
    return defaultGoals;
  },

  /**
   * Get all user goals
   * @returns {array} Array of goal objects
   */
  getGoals: () => {
    try {
      const data = localStorage.getItem(CONSTANTS.STORAGE.GOALS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('✗ Error retrieving goals:', error);
      return [];
    }
  },

  /**
   * Save goals to storage
   * @param {array} goals - Array of goal objects
   * @returns {boolean} Success status
   */
  saveGoals: (goals) => {
    try {
      localStorage.setItem(CONSTANTS.STORAGE.GOALS, JSON.stringify(goals));
      console.log('✓ Goals saved successfully');
      return true;
    } catch (error) {
      console.error('✗ Error saving goals:', error);
      return false;
    }
  },

  /**
   * Update a single goal's progress
   * @param {string} goalId - Goal identifier
   * @param {number} progress - Progress percentage (0-100)
   * @returns {boolean} Success status
   */
  updateGoalProgress: (goalId, progress) => {
    const goals = GoalManager.getGoals();
    const goal = goals.find(g => g.id === goalId);

    if (!goal) {
      console.warn(`⚠️ Goal not found: ${goalId}`);
      return false;
    }

    goal.progress = Math.min(100, Math.max(0, progress));
    goal.updatedAt = new Date().toISOString();

    // Mark as completed if progress reaches 100
    if (goal.progress >= 100 && goal.status !== 'completed') {
      goal.status = 'completed';
      goal.completedAt = new Date().toISOString();
    }

    return GoalManager.saveGoals(goals);
  },

  /**
   * Calculate goal progress based on current scores
   * @param {object} scores - Current scores {physical, mental, emotional, overall}
   * @returns {array} Updated goals with calculated progress
   */
  calculateGoalProgress: (scores) => {
    if (!scores) {
      console.warn('⚠️ No scores provided for goal calculation');
      return GoalManager.getGoals();
    }

    const goals = GoalManager.getGoals();

    goals.forEach(goal => {
      // Get the current score for this goal's category
      const currentCategoryScore = scores[goal.currentThreshold] || 0;
      const baselineScore = goal.baselineThreshold;
      const targetScore = goal.targetScore;

      // Calculate progress: (current - baseline) / (target - baseline)
      let progress;
      if (currentCategoryScore <= baselineScore) {
        progress = 0;
      } else if (currentCategoryScore >= targetScore) {
        progress = 100;
      } else {
        progress = Math.round(
          ((currentCategoryScore - baselineScore) / (targetScore - baselineScore)) * 100
        );
      }

      // Update goal progress
      goal.progress = Math.min(100, Math.max(0, progress));

      // Determine status
      if (progress >= 100) {
        goal.status = 'completed';
        if (!goal.completedAt) {
          goal.completedAt = new Date().toISOString();
        }
      } else if (progress >= 50) {
        goal.status = 'in_progress';
      } else if (progress > 0) {
        goal.status = 'started';
      } else {
        goal.status = 'not_started';
      }

      goal.currentScore = currentCategoryScore;
      goal.updatedAt = new Date().toISOString();
    });

    // Save updated goals
    GoalManager.saveGoals(goals);
    return goals;
  },

  /**
   * Get goal status information
   * @param {object} goal - Goal object
   * @returns {object} Status with label, color, icon
   */
  getGoalStatus: (goal) => {
    const statusMap = {
      completed: {
        label: 'Completed',
        color: '#10b981',
        icon: '✓',
        message: 'Goal achieved! Great job!'
      },
      in_progress: {
        label: 'In Progress',
        color: '#3b82f6',
        icon: '→',
        message: `${goal.progress}% complete`
      },
      started: {
        label: 'Started',
        color: '#f59e0b',
        icon: '↗',
        message: `${goal.progress}% complete`
      },
      not_started: {
        label: 'Not Started',
        color: '#94a3b8',
        icon: '•',
        message: 'Ready to begin'
      }
    };

    return statusMap[goal.status] || statusMap.not_started;
  },

  /**
   * Get all active goals
   * @returns {array} Array of active goal objects
   */
  getActiveGoals: () => {
    return GoalManager.getGoals().filter(goal => goal.isActive);
  },

  /**
   * Get completed goals count
   * @returns {number} Count of completed goals
   */
  getCompletedCount: () => {
    return GoalManager.getGoals().filter(goal => goal.status === 'completed').length;
  },

  /**
   * Get total goals count
   * @returns {number} Total number of goals
   */
  getTotalCount: () => {
    return GoalManager.getGoals().length;
  },

  /**
   * Get overall progress percentage
   * Calculates average progress across all active goals
   * @returns {number} Overall progress (0-100)
   */
  getOverallProgress: () => {
    const activeGoals = GoalManager.getActiveGoals();
    if (activeGoals.length === 0) return 0;

    const totalProgress = activeGoals.reduce((sum, goal) => sum + goal.progress, 0);
    return Math.round(totalProgress / activeGoals.length);
  },

  /**
   * Get progress trend for a goal
   * Compares current progress to previous assessment
   * @param {string} goalId - Goal identifier
   * @returns {object} Trend data with direction and change
   */
  getProgressTrend: (goalId) => {
    const history = StorageManager.getHistoricalData();
    const goals = GoalManager.getGoals();
    const goal = goals.find(g => g.id === goalId);

    if (!goal || history.length < 2) {
      return { trend: 'stable', direction: '→', change: 0 };
    }

    // Calculate current progress
    const latestAttempt = history[history.length - 1];
    const latestScores = latestAttempt.scores || latestAttempt.categoryScores || {};
    const currentCategoryScore = latestScores[goal.currentThreshold] || latestAttempt.score || 0;
    const currentProgress = Math.round(
      ((currentCategoryScore - goal.baselineThreshold) / (goal.targetScore - goal.baselineThreshold)) * 100
    );

    // Calculate previous progress
    const previousAttempt = history[history.length - 2];
    const previousScores = previousAttempt.scores || previousAttempt.categoryScores || {};
    const previousCategoryScore = previousScores[goal.currentThreshold] || previousAttempt.score || 0;
    const previousProgress = Math.round(
      ((previousCategoryScore - goal.baselineThreshold) / (goal.targetScore - goal.baselineThreshold)) * 100
    );

    const change = currentProgress - previousProgress;

    return {
      trend: change > 5 ? 'improving' : change < -5 ? 'declining' : 'stable',
      direction: change > 5 ? '↑' : change < -5 ? '↓' : '→',
      change: change,
      currentProgress: Math.min(100, Math.max(0, currentProgress)),
      previousProgress: Math.min(100, Math.max(0, previousProgress))
    };
  },

  /**
   * Reset a goal to not started
   * @param {string} goalId - Goal identifier
   * @returns {boolean} Success status
   */
  resetGoal: (goalId) => {
    const goals = GoalManager.getGoals();
    const goal = goals.find(g => g.id === goalId);

    if (!goal) return false;

    goal.progress = 0;
    goal.status = 'not_started';
    goal.completedAt = null;
    goal.updatedAt = new Date().toISOString();

    return GoalManager.saveGoals(goals);
  },

  /**
   * Toggle goal active status
   * @param {string} goalId - Goal identifier
   * @returns {boolean} New active status
   */
  toggleGoalActive: (goalId) => {
    const goals = GoalManager.getGoals();
    const goal = goals.find(g => g.id === goalId);

    if (!goal) return false;

    goal.isActive = !goal.isActive;
    goal.updatedAt = new Date().toISOString();

    GoalManager.saveGoals(goals);
    return goal.isActive;
  },

  /**
   * Get goal recommendations based on current scores
   * @param {object} scores - Current scores
   * @returns {array} Array of recommendation objects
   */
  getGoalRecommendations: (scores) => {
    const goals = GoalManager.calculateGoalProgress(scores);
    const recommendations = [];

    goals.forEach(goal => {
      const progressGap = goal.targetScore - (scores[goal.currentThreshold] || 0);
      const status = GoalManager.getGoalStatus(goal);

      if (progressGap > 0) {
        recommendations.push({
          goalId: goal.id,
          goalName: goal.name,
          currentScore: scores[goal.currentThreshold] || 0,
          targetScore: goal.targetScore,
          gap: progressGap,
          progress: goal.progress,
          priority: progressGap > 20 ? 'high' : progressGap > 10 ? 'medium' : 'low',
          message: `${goal.name}: Currently at ${scores[goal.currentThreshold] || 0}, target ${goal.targetScore}`
        });
      }
    });

    // Sort by gap (highest gap first)
    return recommendations.sort((a, b) => b.gap - a.gap);
  }
};
