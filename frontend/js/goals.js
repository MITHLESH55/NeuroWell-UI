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
    const latestScores = history[history.length - 1].scores;
    const currentCategoryScore = latestScores[goal.currentThreshold];
    const currentProgress = Math.round(
      ((currentCategoryScore - goal.baselineThreshold) / (goal.targetScore - goal.baselineThreshold)) * 100
    );

    // Calculate previous progress
    const previousScores = history[history.length - 2].scores;
    const previousCategoryScore = previousScores[goal.currentThreshold];
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
  },

  /**
   * Get goals filtered by category
   * @param {string} category - Category name (Physical, Mental, Emotional)
   * @returns {array} Filtered goals
   */
  getGoalsByCategory: (category) => {
    return GoalManager.getGoals().filter(g => g.category === category);
  },

  /**
   * Get goal by ID
   * @param {string} goalId - Goal identifier
   * @returns {object|null} Goal object or null
   */
  getGoalById: (goalId) => {
    return GoalManager.getGoals().find(g => g.id === goalId) || null;
  },

  /**
   * Calculate days to goal completion (estimate)
   * @param {string} goalId - Goal identifier
   * @returns {object} Completion estimate data
   */
  estimateGoalCompletion: (goalId) => {
    const history = StorageManager.getHistoricalData();
    const goal = GoalManager.getGoalById(goalId);

    if (!goal || history.length < 2) {
      return { daysEstimate: null, trend: 'insufficient_data', message: 'Not enough data for estimation' };
    }

    // Get progress over time
    const firstScores = history[0].scores;
    const lastScores = history[history.length - 1].scores;

    const firstScore = firstScores[goal.currentThreshold] || 0;
    const lastScore = lastScores[goal.currentThreshold] || 0;
    const progression = lastScore - firstScore;

    if (progression <= 0) {
      return { daysEstimate: null, trend: 'stalled', message: 'No progress detected' };
    }

    // Calculate days between first and last assessment
    const firstTime = new Date(history[0].timestamp);
    const lastTime = new Date(history[history.length - 1].timestamp);
    const daysPassed = (lastTime - firstTime) / (1000 * 60 * 60 * 24);

    // Estimate rate and days to target
    const pointsPerDay = progression / daysPassed;
    const pointsRemaining = goal.targetScore - lastScore;
    const daysEstimate = Math.ceil(pointsRemaining / pointsPerDay);

    return {
      daysEstimate: Math.max(0, daysEstimate),
      trend: daysEstimate > 0 ? 'on_track' : 'already_reached',
      currentScore: lastScore,
      progressionRate: pointsPerDay.toFixed(2),
      pointsRemaining: Math.max(0, pointsRemaining),
      message: daysEstimate > 0 ? `Estimated ${daysEstimate} days to completion` : 'Goal reached!'
    };
  },

  /**
   * Get high-priority goals (at least 3% gap to target)
   * @returns {array} Goals with significant progress gap
   */
  getHighPriorityGoals: () => {
    return GoalManager.getGoals().filter(goal => {
      const gap = goal.targetScore - (goal.currentScore || 0);
      return gap > Math.ceil(goal.targetScore * 0.3); // More than 30% away from target
    });
  },

  /**
   * Get goal success rate (percentage of completed vs active)
   * @returns {number} Success rate percentage
   */
  getSuccessRate: () => {
    const active = GoalManager.getActiveGoals();
    if (active.length === 0) return 0;
    
    const completed = active.filter(g => g.status === 'completed').length;
    return Math.round((completed / active.length) * 100);
  },

  /**
   * Export goals data as JSON
   * @returns {object} Exportable goals data
   */
  exportGoals: () => {
    try {
      return {
        goals: GoalManager.getGoals(),
        summary: {
          total: GoalManager.getTotalCount(),
          active: GoalManager.getActiveGoals().length,
          completed: GoalManager.getCompletedCount(),
          overallProgress: GoalManager.getOverallProgress(),
          successRate: GoalManager.getSuccessRate()
        },
        exportDate: new Date().toISOString()
      };
    } catch (error) {
      console.error('✗ Error exporting goals:', error);
      return null;
    }
  },

  /**
   * Import goals from external data
   * @param {object} data - Goals data to import
   * @returns {boolean} Success status
   */
  importGoals: (data) => {
    try {
      if (data && data.goals && Array.isArray(data.goals)) {
        GoalManager.saveGoals(data.goals);
        console.log('✓ Goals imported successfully');
        return true;
      } else {
        console.warn('⚠️ Invalid goals data format');
        return false;
      }
    } catch (error) {
      console.error('✗ Error importing goals:', error);
      return false;
    }
  },

  // ===== UI RENDERING METHODS =====

  /**
   * Render all goal cards on goals page
   * VIVA: "We render each goal as a card showing progress bar, status, and recommendations"
   */
  renderGoalCards: () => {
    const container = document.getElementById('goalsContainer');
    if (!container) return;

    const goals = GoalManager.initializeGoals();
    const wellnessData = StorageManager.getWellnessScore();

    // Update progress based on current scores
    if (wellnessData) {
      GoalManager.calculateGoalProgress(wellnessData.scores);
    }

    const updatedGoals = GoalManager.getGoals();
    const stats = {
      total: updatedGoals.length,
      completed: updatedGoals.filter(g => g.status === 'completed').length,
      inProgress: updatedGoals.filter(g => g.status === 'in_progress').length,
      average: GoalManager.getOverallProgress()
    };

    let html = `
      <div class="goals-page">
        <div class="goals-header">
          <h1>🎯 Wellness Goals</h1>
          <p class="subtitle">Track your progress towards health and wellness objectives</p>
          
          <div class="goals-stats">
            <div class="stat-card">
              <div class="stat-value">${stats.average}%</div>
              <div class="stat-label">Average Progress</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${stats.completed}/${stats.total}</div>
              <div class="stat-label">Goals Completed</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${stats.inProgress}</div>
              <div class="stat-label">In Progress</div>
            </div>
          </div>
        </div>

        <div class="goals-grid">
    `;

    updatedGoals.forEach((goal, index) => {
      const status = GoalManager.getGoalStatus(goal);
      const trend = GoalManager.getProgressTrend(goal.id);
      const completion = GoalManager.estimateGoalCompletion(goal.id);
      const recommendations = GoalManager.getGoalRecommendations(wellnessData?.scores || {});
      const goalRecs = recommendations.filter(r => r.goalId === goal.id);

      html += `
        <div class="goal-card goal-status-${goal.status}" style="animation: fadeIn 0.3s ease-in-out ${index * 0.05}s both;">
          <div class="card-header">
            <span class="goal-icon">${goal.icon}</span>
            <div class="card-title-section">
              <h3 class="goal-title">${goal.name}</h3>
              <p class="goal-description">${goal.description}</p>
            </div>
            <span class="status-badge status-${goal.status}">${status.label}</span>
          </div>

          <div class="card-content">
            <!-- Progress Section -->
            <div class="progress-section">
              <div class="progress-label">
                <span>Progress: ${goal.progress}%</span>
                <span class="progress-trend trend-${trend.trend}">
                  ${trend.direction} ${Math.abs(trend.change)}%
                </span>
              </div>
              <div class="progress-bar-container">
                <div class="progress-bar">
                  <div class="progress-fill" style="width: ${goal.progress}%; background: ${status.color};"></div>
                </div>
              </div>
              <div class="progress-info">
                <span class="current">Current: ${goal.currentScore || 0}</span>
                <span class="target">Target: ${goal.targetScore}</span>
              </div>
            </div>

            <!-- Status Message -->
            <div class="status-message status-${goal.status}">
              ${status.icon} ${status.message}
            </div>

            <!-- Completion Estimate -->
            ${completion.daysEstimate ? `
              <div class="completion-estimate">
                <span class="estimate-label">Estimated completion:</span>
                <span class="estimate-days">${completion.daysEstimate} days</span>
              </div>
            ` : ''}

            <!-- Recommendations -->
            ${goalRecs.length > 0 ? `
              <div class="recommendations">
                <h4>Recommendations:</h4>
                <ul>
                  ${goalRecs.slice(0, 3).map(rec => `
                    <li>✓ ${rec.message}</li>
                  `).join('')}
                </ul>
              </div>
            ` : ''}
          </div>

          <div class="card-actions">
            <button class="btn btn-sm btn-secondary" onclick="GoalManager.showGoalDetails('${goal.id}')">
              📊 Details
            </button>
            <button class="btn btn-sm btn-secondary" onclick="GoalManager.resetGoal('${goal.id}'); location.reload();">
              🔄 Reset
            </button>
          </div>
        </div>
      `;
    });

    html += `</div></div>`;
    container.innerHTML = html;

    console.log('✓ Goal cards rendered');
  },

  /**
   * Render goal widget for dashboard (mini view)
   */
  renderGoalWidget: () => {
    const widget = document.getElementById('goalWidget');
    if (!widget) return;

    const stats = {
      average: GoalManager.getOverallProgress(),
      completed: GoalManager.getCompletedCount(),
      total: GoalManager.getTotalCount()
    };

    const goals = GoalManager.getActiveGoals().slice(0, 2);

    widget.innerHTML = `
      <div class="widget">
        <div class="widget-header">
          <h3>Goal Progress</h3>
          <a href="goals.html" class="widget-link">View All →</a>
        </div>
        <div class="widget-stats">
          <div class="widget-stat">
            <span class="stat-value">${stats.average}%</span>
            <span class="stat-label">Average</span>
          </div>
          <div class="widget-stat">
            <span class="stat-value">${stats.completed}/${stats.total}</span>
            <span class="stat-label">Completed</span>
          </div>
        </div>
        ${goals.length > 0 ? `
          <div class="widget-goals">
            ${goals.map(goal => `
              <div class="mini-goal">
                <span>${goal.icon} ${goal.name}</span>
                <div class="mini-progress">
                  <div class="mini-fill" style="width: ${goal.progress}%"></div>
                </div>
              </div>
            `).join('')}
          </div>
        ` : ''}
      </div>
    `;
  },

  /**
   * Show detailed goal analytics modal
   */
  showGoalDetails: (goalId) => {
    const goal = GoalManager.getGoalById(goalId);
    if (!goal) return;

    const status = GoalManager.getGoalStatus(goal);
    const trend = GoalManager.getProgressTrend(goalId);
    const completion = GoalManager.estimateGoalCompletion(goalId);

    const modal = document.createElement('div');
    modal.className = 'modal goal-modal';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h2>${goal.icon} ${goal.name}</h2>
          <button class="btn-close" onclick="this.closest('.modal').remove()">✕</button>
        </div>

        <div class="modal-body">
          <div class="details-grid">
            <div class="detail-box">
              <div class="detail-label">Current Score</div>
              <div class="detail-value">${goal.currentScore || 0}</div>
            </div>
            <div class="detail-box">
              <div class="detail-label">Target Score</div>
              <div class="detail-value">${goal.targetScore}</div>
            </div>
            <div class="detail-box">
              <div class="detail-label">Progress</div>
              <div class="detail-value">${goal.progress}%</div>
            </div>
            <div class="detail-box">
              <div class="detail-label">Status</div>
              <div class="detail-value status-${goal.status}">${status.label}</div>
            </div>
            <div class="detail-box">
              <div class="detail-label">Trend</div>
              <div class="detail-value trend-${trend.trend}">${trend.direction} ${Math.abs(trend.change)}%</div>
            </div>
            <div class="detail-box">
              <div class="detail-label">Est. Completion</div>
              <div class="detail-value">${completion.daysEstimate || 'N/A'} days</div>
            </div>
          </div>

          <div class="recommendations-section">
            <h3>Recommendations for ${goal.name}</h3>
            <ul class="recommendations-list">
              ${GoalManager.getGoalRecommendations(StorageManager.getWellnessScore()?.scores || {})
                .filter(r => r.goalId === goalId)
                .slice(0, 4)
                .map(rec => `<li>${rec.message}</li>`)
                .join('')}
            </ul>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-primary" onclick="this.closest('.modal').remove()">Close</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    modal.style.display = 'flex';

    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.remove();
    });
  }
};
