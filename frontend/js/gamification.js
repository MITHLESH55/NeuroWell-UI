/**
 * NEUROWELL - Gamification System
 * Manages points, streaks, achievements, and badges for user engagement
 * Rewards consistent wellness habits and goal completion
 */

const GamificationEngine = {
  /**
   * Get all achievements available
   * @returns {array} Achievement definitions
   */
  getAchievements: () => {
    return [
      // Streak achievements
      {
        id: 'streak-7',
        name: '🔥 Week Warrior',
        description: 'Maintain a 7-day streak',
        icon: '🔥',
        points: 100,
        unlocked: false,
        category: 'Streaks',
        condition: 'streak',
        value: 7
      },
      {
        id: 'streak-30',
        name: '🌟 Month Master',
        description: 'Maintain a 30-day streak',
        icon: '🌟',
        points: 500,
        unlocked: false,
        category: 'Streaks',
        condition: 'streak',
        value: 30
      },
      {
        id: 'streak-100',
        name: '👑 Century Club',
        description: 'Achieve a 100-day streak',
        icon: '👑',
        points: 2000,
        unlocked: false,
        category: 'Streaks',
        condition: 'streak',
        value: 100
      },
      // Goal completion achievements
      {
        id: 'goal-1',
        name: '🎯 Goal Getter',
        description: 'Complete your first goal',
        icon: '🎯',
        points: 150,
        unlocked: false,
        category: 'Goals',
        condition: 'goals',
        value: 1
      },
      {
        id: 'goal-5',
        name: '🚀 Goal Crusher',
        description: 'Complete 5 goals',
        icon: '🚀',
        points: 500,
        unlocked: false,
        category: 'Goals',
        condition: 'goals',
        value: 5
      },
      {
        id: 'goal-10',
        name: '⭐ Goal Legend',
        description: 'Complete 10 goals',
        icon: '⭐',
        points: 1000,
        unlocked: false,
        category: 'Goals',
        condition: 'goals',
        value: 10
      },
      // Health score achievements
      {
        id: 'score-70',
        name: '💚 Wellness Guardian',
        description: 'Achieve 70+ overall wellness score',
        icon: '💚',
        points: 300,
        unlocked: false,
        category: 'Wellness',
        condition: 'score',
        value: 70
      },
      {
        id: 'score-80',
        name: '💜 Wellness Champion',
        description: 'Achieve 80+ overall wellness score',
        icon: '💜',
        points: 600,
        unlocked: false,
        category: 'Wellness',
        condition: 'score',
        value: 80
      },
      {
        id: 'score-90',
        name: '🏆 Wellness Elite',
        description: 'Achieve 90+ overall wellness score',
        icon: '🏆',
        points: 1000,
        unlocked: false,
        category: 'Wellness',
        condition: 'score',
        value: 90
      },
      // Habit achievements
      {
        id: 'habit-3',
        name: '💪 Habit Hero',
        description: 'Complete 3 different habits daily',
        icon: '💪',
        points: 200,
        unlocked: false,
        category: 'Habits',
        condition: 'habits',
        value: 3
      },
      {
        id: 'habit-5',
        name: '🎯 Habit Master',
        description: 'Complete 5 different habits daily',
        icon: '🎯',
        points: 400,
        unlocked: false,
        category: 'Habits',
        condition: 'habits',
        value: 5
      },
      // Consistency achievements
      {
        id: 'checkin-7',
        name: '📝 Tracker',
        description: 'Log check-ins for 7 consecutive days',
        icon: '📝',
        points: 150,
        unlocked: false,
        category: 'Consistency',
        condition: 'checkins',
        value: 7
      },
      {
        id: 'checkin-30',
        name: '📊 Data Master',
        description: 'Log check-ins for 30 consecutive days',
        icon: '📊',
        points: 600,
        unlocked: false,
        category: 'Consistency',
        condition: 'checkins',
        value: 30
      },
      // Special achievements
      {
        id: 'perfect-day',
        name: '✨ Perfect Day',
        description: 'Complete all habits in one day',
        icon: '✨',
        points: 250,
        unlocked: false,
        category: 'Special',
        condition: 'perfectDay',
        value: 1
      },
      {
        id: 'comeback',
        name: '💪 Comeback Kid',
        description: 'Return after a 7+ day break',
        icon: '💪',
        points: 300,
        unlocked: false,
        category: 'Special',
        condition: 'comeback',
        value: 7
      }
    ];
  },

  /**
   * Get user's gamification data
   * @returns {object} User's points, level, badges
   */
  getGamificationData: () => {
    try {
      const stored = localStorage.getItem(CONSTANTS.STORAGE.GAMIFICATION);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('❌ Error loading gamification data:', error);
    }

    return {
      totalPoints: 0,
      level: 1,
      unlockedAchievements: [],
      achievements: GamificationEngine.getAchievements(),
      createdAt: new Date().toISOString()
    };
  },

  /**
   * Save gamification data
   * @param {object} data - Gamification data
   * @returns {boolean} Success status
   */
  saveGamificationData: (data) => {
    try {
      localStorage.setItem(CONSTANTS.STORAGE.GAMIFICATION, JSON.stringify(data));
      console.log('✓ Gamification data saved');
      return true;
    } catch (error) {
      console.error('❌ Error saving gamification data:', error);
      return false;
    }
  },

  /**
   * Add points to user
   * @param {number} points - Points to add
   * @param {string} reason - Reason for points
   * @returns {object} Updated data
   */
  addPoints: (points = 0, reason = '') => {
    try {
      const data = GamificationEngine.getGamificationData();
      data.totalPoints += Math.max(0, points);
      data.level = GamificationEngine.calculateLevel(data.totalPoints);

      if (reason) {
        if (!data.pointsHistory) data.pointsHistory = [];
        data.pointsHistory.push({
          points,
          reason,
          date: new Date().toISOString()
        });
      }

      GamificationEngine.saveGamificationData(data);
      console.log(`⭐ ${points} points added: ${reason}`);
      return data;
    } catch (error) {
      console.error('❌ Error adding points:', error);
      return GamificationEngine.getGamificationData();
    }
  },

  /**
   * Calculate level from points
   * @param {number} totalPoints - Total points
   * @returns {number} Level (1-10)
   */
  calculateLevel: (totalPoints = 0) => {
    const levels = [0, 500, 1500, 3000, 5000, 7500, 10000, 13000, 16000, 20000];
    for (let i = levels.length - 1; i >= 0; i--) {
      if (totalPoints >= levels[i]) {
        return Math.min(i + 1, 10);
      }
    }
    return 1;
  },

  /**
   * Get progress to next level
   * @returns {object} {current, needed, percent}
   */
  getNextLevelProgress: () => {
    const data = GamificationEngine.getGamificationData();
    const levels = [0, 500, 1500, 3000, 5000, 7500, 10000, 13000, 16000, 20000];

    const currentLevelPoints = levels[Math.min(data.level - 1, levels.length - 1)];
    const nextLevelPoints = levels[Math.min(data.level, levels.length - 1)];

    const pointsTowardsCurrent = data.totalPoints - currentLevelPoints;
    const pointsNeededForNext = nextLevelPoints - currentLevelPoints;
    const percent = Math.round((pointsTowardsCurrent / pointsNeededForNext) * 100);

    return {
      current: data.level,
      next: Math.min(data.level + 1, 10),
      pointsCurrent: data.totalPoints,
      pointsNeeded: nextLevelPoints,
      pointsProgress: pointsTowardsCurrent,
      percent: Math.min(percent, 100)
    };
  },

  /**
   * Unlock achievement
   * @param {string} achievementId - Achievement ID
   * @returns {object|null} Unlocked achievement or null
   */
  unlockAchievement: (achievementId) => {
    try {
      const data = GamificationEngine.getGamificationData();
      const achievement = data.achievements.find(a => a.id === achievementId);

      if (!achievement) {
        console.warn(`⚠️  Achievement not found: ${achievementId}`);
        return null;
      }

      if (achievement.unlocked) {
        console.log(`ℹ️  Achievement already unlocked: ${achievementId}`);
        return achievement;
      }

      achievement.unlocked = true;
      achievement.unlockedDate = new Date().toISOString();

      if (!data.unlockedAchievements.includes(achievementId)) {
        data.unlockedAchievements.push(achievementId);
      }

      // Award points
      GamificationEngine.addPoints(achievement.points, `Achievement: ${achievement.name}`);

      // Save updated data
      GamificationEngine.saveGamificationData(data);

      console.log(`🏆 Achievement unlocked: ${achievement.name}`);
      return achievement;
    } catch (error) {
      console.error('❌ Error unlocking achievement:', error);
      return null;
    }
  },

  /**
   * Check and unlock achievements based on current state
   * @param {object} context - {scores, habitStats, goalsCompleted, checkinsLogged}
   * @returns {array} Newly unlocked achievements
   */
  checkAndUnlockAchievements: (context = {}) => {
    const data = GamificationEngine.getGamificationData();
    const newlyUnlocked = [];

    // Check each achievement condition
    data.achievements.forEach(achievement => {
      if (achievement.unlocked) return;

      let shouldUnlock = false;

      switch (achievement.condition) {
        case 'score':
          if (context.scores?.overall >= achievement.value) {
            shouldUnlock = true;
          }
          break;
        case 'streak':
          if (context.streaks && Object.values(context.streaks).some(s => s.current >= achievement.value)) {
            shouldUnlock = true;
          }
          break;
        case 'goals':
          if (context.goalsCompleted >= achievement.value) {
            shouldUnlock = true;
          }
          break;
        case 'habits':
          if (context.habitsCurrent >= achievement.value) {
            shouldUnlock = true;
          }
          break;
        case 'checkins':
          if (context.checkinsStreak >= achievement.value) {
            shouldUnlock = true;
          }
          break;
        case 'perfectDay':
          if (context.perfectDay) {
            shouldUnlock = true;
          }
          break;
        case 'comeback':
          if (context.comeback) {
            shouldUnlock = true;
          }
          break;
      }

      if (shouldUnlock) {
        const unlocked = GamificationEngine.unlockAchievement(achievement.id);
        if (unlocked) {
          newlyUnlocked.push(unlocked);
        }
      }
    });

    return newlyUnlocked;
  },

  /**
   * Get unlocked achievements
   * @returns {array} Unlocked achievements
   */
  getUnlockedAchievements: () => {
    const data = GamificationEngine.getGamificationData();
    return data.achievements.filter(a => a.unlocked);
  },

  /**
   * Get locked achievements
   * @returns {array} Locked achievements
   */
  getLockedAchievements: () => {
    const data = GamificationEngine.getGamificationData();
    return data.achievements.filter(a => !a.unlocked);
  },

  /**
   * Get achievements by category
   * @param {string} category - Category name
   * @returns {array} Achievements in category
   */
  getAchievementsByCategory: (category) => {
    const data = GamificationEngine.getGamificationData();
    return data.achievements.filter(a => a.category === category);
  },

  /**
   * Get achievement by ID
   * @param {string} achievementId - Achievement ID
   * @returns {object|null} Achievement or null
   */
  getAchievementById: (achievementId) => {
    const data = GamificationEngine.getGamificationData();
    return data.achievements.find(a => a.id === achievementId) || null;
  },

  /**
   * Reset all gamification data (careful!)
   * @returns {object} Reset data
   */
  resetGamificationData: () => {
    const data = {
      totalPoints: 0,
      level: 1,
      unlockedAchievements: [],
      achievements: GamificationEngine.getAchievements(),
      resetDate: new Date().toISOString()
    };

    GamificationEngine.saveGamificationData(data);
    return data;
  },

  /**
   * Get gamification statistics
   * @returns {object} Statistics
   */
  getStatistics: () => {
    const data = GamificationEngine.getGamificationData();
    const unlocked = data.achievements.filter(a => a.unlocked);
    const totalPointsPossible = data.achievements.reduce((sum, a) => sum + a.points, 0);

    return {
      totalPoints: data.totalPoints,
      level: data.level,
      totalAchievements: data.achievements.length,
      unlockedAchievements: unlocked.length,
      achievementRate: Math.round((unlocked.length / data.achievements.length) * 100),
      totalPointsPossible,
      pointsEarned: data.totalPoints,
      pointsRemaining: totalPointsPossible - data.totalPoints
    };
  }
};

// Export for module systems if needed
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GamificationEngine;
}
