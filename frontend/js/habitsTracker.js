/**
 * NEUROWELL - Daily Check-in & Habits Tracker
 * Tracks daily mood, sleep, energy and monitors habit streaks
 * Includes achievement tracking and historical data
 */

const HabitsTracker = {
  /**
   * Get default habits
   * @returns {array} Default habits to track
   */
  getDefaultHabits: () => {
    return [
      {
        id: 'exercise',
        name: 'Exercise',
        description: 'Completed physical exercise',
        category: 'Physical',
        icon: '🏃',
        color: '#ef4444',
        dailyGoal: 30, // minutes
        unit: 'minutes'
      },
      {
        id: 'meditation',
        name: 'Meditation',
        description: 'Completed meditation session',
        category: 'Mental',
        icon: '🧘',
        color: '#8b5cf6',
        dailyGoal: 15,
        unit: 'minutes'
      },
      {
        id: 'sleep',
        name: 'Sleep',
        description: 'Got sufficient sleep',
        category: 'Sleep',
        icon: '😴',
        color: '#3b82f6',
        dailyGoal: 8,
        unit: 'hours'
      },
      {
        id: 'hydration',
        name: 'Hydration',
        description: 'Drank enough water',
        category: 'Physical',
        icon: '💧',
        color: '#06b6d4',
        dailyGoal: 8,
        unit: 'glasses'
      },
      {
        id: 'reading',
        name: 'Reading',
        description: 'Read for mental growth',
        category: 'Mental',
        icon: '📚',
        color: '#ec4899',
        dailyGoal: 20,
        unit: 'minutes'
      }
    ];
  },

  /**
   * Log today's check-in data
   * @param {object} checkInData - {mood, sleep, energy, date}
   * @returns {boolean} Success status
   */
  logCheckIn: (checkInData) => {
    try {
      let checkIns = HabitsTracker.getCheckIns();
      const today = new Date().toISOString().split('T')[0];

      // Remove existing check-in for today if present
      checkIns = checkIns.filter(c => c.date !== today);

      const entry = {
        date: today,
        mood: Math.max(1, Math.min(10, parseInt(checkInData.mood) || 5)),
        sleep: Math.max(0, Math.min(24, parseFloat(checkInData.sleep) || 7)),
        energy: Math.max(1, Math.min(10, parseInt(checkInData.energy) || 5)),
        timestamp: new Date().toISOString(),
        notes: String(checkInData.notes || '').slice(0, 500)
      };

      checkIns.push(entry);
      localStorage.setItem(CONSTANTS.STORAGE.CHECK_INS, JSON.stringify(checkIns));
      console.log('✓ Check-in logged');
      return true;
    } catch (error) {
      console.error('❌ Error logging check-in:', error);
      return false;
    }
  },

  /**
   * Get all check-ins
   * @returns {array} All check-in records
   */
  getCheckIns: () => {
    try {
      const stored = localStorage.getItem(CONSTANTS.STORAGE.CHECK_INS);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('❌ Error loading check-ins:', error);
      return [];
    }
  },

  /**
   * Get today's check-in
   * @returns {object|null} Today's check-in or null
   */
  getTodayCheckIn: () => {
    const today = new Date().toISOString().split('T')[0];
    const checkIns = HabitsTracker.getCheckIns();
    return checkIns.find(c => c.date === today) || null;
  },

  /**
   * Get check-in for specific date
   * @param {string} date - Date in YYYY-MM-DD format
   * @returns {object|null} Check-in or null
   */
  getCheckInByDate: (date) => {
    const checkIns = HabitsTracker.getCheckIns();
    return checkIns.find(c => c.date === date) || null;
  },

  /**
   * Get check-ins for date range
   * @param {string} startDate - Start date YYYY-MM-DD
   * @param {string} endDate - End date YYYY-MM-DD
   * @returns {array} Check-ins in range
   */
  getCheckInRange: (startDate, endDate) => {
    const checkIns = HabitsTracker.getCheckIns();
    return checkIns.filter(c => c.date >= startDate && c.date <= endDate);
  },

  /**
   * Log habit completion
   * @param {string} habitId - Habit ID
   * @param {number} amount - Amount completed (default: 1)
   * @returns {boolean} Success status
   */
  logHabit: (habitId, amount = 1) => {
    try {
      let habits = HabitsTracker.getHabitsData();
      const today = new Date().toISOString().split('T')[0];

      if (!habits[today]) {
        habits[today] = {};
      }

      const current = habits[today][habitId] || 0;
      habits[today][habitId] = current + amount;

      localStorage.setItem(CONSTANTS.STORAGE.HABITS, JSON.stringify(habits));

      // Update streak
      HabitsTracker.updateStreak(habitId);
      console.log(`✓ Habit logged: ${habitId}`);
      return true;
    } catch (error) {
      console.error('❌ Error logging habit:', error);
      return false;
    }
  },

  /**
   * Get habits raw data
   * @returns {object} Habits data by date
   */
  getHabitsData: () => {
    try {
      const stored = localStorage.getItem(CONSTANTS.STORAGE.HABITS);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('❌ Error loading habits data:', error);
      return {};
    }
  },

  /**
   * Get habit completion for today
   * @param {string} habitId - Habit ID
   * @returns {number} Amount completed today
   */
  getHabitToday: (habitId) => {
    const today = new Date().toISOString().split('T')[0];
    const habits = HabitsTracker.getHabitsData();
    return habits[today]?.[habitId] || 0;
  },

  /**
   * Get habit streak
   * @param {string} habitId - Habit ID
   * @returns {object} Streak info {current, longest, broken}
   */
  getStreak: (habitId) => {
    try {
      const streaks = JSON.parse(localStorage.getItem(CONSTANTS.STORAGE.STREAKS) || '{}');
      return streaks[habitId] || { current: 0, longest: 0, broken: false, lastDate: null };
    } catch (error) {
      console.error('❌ Error getting streak:', error);
      return { current: 0, longest: 0, broken: false };
    }
  },

  /**
   * Update streak for habit
   * @param {string} habitId - Habit ID
   * @returns {object} Updated streak
   */
  updateStreak: (habitId) => {
    try {
      const streaks = JSON.parse(localStorage.getItem(CONSTANTS.STORAGE.STREAKS) || '{}');
      const today = new Date().toISOString().split('T')[0];
      const streak = streaks[habitId] || { current: 0, longest: 0, broken: false, lastDate: null };

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      if (streak.lastDate === today) {
        // Already logged today
        return streak;
      }

      if (streak.lastDate === yesterdayStr) {
        // Streak continues
        streak.current += 1;
        streak.longest = Math.max(streak.longest, streak.current);
      } else if (streak.lastDate !== today) {
        // Streak broken (new day without completing yesterday or starting fresh)
        if (streak.lastDate && streak.lastDate !== yesterdayStr) {
          streak.current = 1;
          streak.broken = true;
        } else {
          streak.current = 1;
        }
      }

      streak.lastDate = today;
      streaks[habitId] = streak;

      localStorage.setItem(CONSTANTS.STORAGE.STREAKS, JSON.stringify(streaks));
      console.log(`🔥 Streak updated: ${habitId} - ${streak.current} days`);
      return streak;
    } catch (error) {
      console.error('❌ Error updating streak:', error);
      return { current: 0, longest: 0, broken: false };
    }
  },

  /**
   * Reset all streaks (call when day is missed)
   * @returns {object} Updated streaks
   */
  resetStreaks: () => {
    try {
      const streaks = JSON.parse(localStorage.getItem(CONSTANTS.STORAGE.STREAKS) || '{}');
      const today = new Date().toISOString().split('T')[0];

      Object.keys(streaks).forEach(habitId => {
        const streak = streaks[habitId];
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        if (streak.lastDate !== today && streak.lastDate !== yesterdayStr) {
          streak.current = 0;
          streak.broken = true;
        }
      });

      localStorage.setItem(CONSTANTS.STORAGE.STREAKS, JSON.stringify(streaks));
      return streaks;
    } catch (error) {
      console.error('❌ Error resetting streaks:', error);
      return {};
    }
  },

  /**
   * Check if habit is completed today
   * @param {string} habitId - Habit ID
   * @returns {boolean} Completion status
   */
  isHabitCompletedToday: (habitId) => {
    const today = new Date().toISOString().split('T')[0];
    const habits = HabitsTracker.getHabitsData();
    return habits[today]?.[habitId] > 0 || false;
  },

  /**
   * Get completion stats for date range
   * @param {string} startDate - Start date YYYY-MM-DD
   * @param {string} endDate - End date YYYY-MM-DD
   * @returns {object} Completion statistics
   */
  getCompletionStats: (startDate, endDate) => {
    const habits = HabitsTracker.getHabitsData();
    const defaultHabits = HabitsTracker.getDefaultHabits();
    const stats = {};

    defaultHabits.forEach(habit => {
      stats[habit.id] = { completed: 0, missed: 0, rate: 0 };
    });

    let dayCount = 0;
    const current = new Date(startDate);
    const end = new Date(endDate);

    while (current <= end) {
      dayCount++;
      const dateStr = current.toISOString().split('T')[0];

      defaultHabits.forEach(habit => {
        if (habits[dateStr]?.[habit.id] > 0) {
          stats[habit.id].completed++;
        } else {
          stats[habit.id].missed++;
        }
      });

      current.setDate(current.getDate() + 1);
    }

    // Calculate completion rates
    Object.keys(stats).forEach(habitId => {
      const total = stats[habitId].completed + stats[habitId].missed;
      stats[habitId].rate = total > 0 ? Math.round((stats[habitId].completed / total) * 100) : 0;
      stats[habitId].daysTracked = dayCount;
    });

    return stats;
  },

  /**
   * Get mood trend (past 7 days)
   * @returns {array} Mood data
   */
  getMoodTrend: () => {
    const checkIns = HabitsTracker.getCheckIns();
    const trend = [];

    for (let i = 6; i >= 0; i--) {
      const date = Utility.daysAgo(i);
      const dateStr = date.toISOString().split('T')[0];
      const checkIn = checkIns.find(c => c.date === dateStr);

      trend.push({
        date: dateStr,
        displayDate: Utility.formatDate(date),
        mood: checkIn?.mood || null,
        sleep: checkIn?.sleep || null,
        energy: checkIn?.energy || null
      });
    }

    return trend;
  },

  /**
   * Get weekly summary
   * @returns {object} Weekly statistics
   */
  getWeeklySummary: () => {
    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    const startDate = weekAgo.toISOString().split('T')[0];
    const endDate = today.toISOString().split('T')[0];

    const checkIns = HabitsTracker.getCheckInRange(startDate, endDate);
    const habitStats = HabitsTracker.getCompletionStats(startDate, endDate);

    const avgMood = checkIns.length > 0
      ? Math.round(checkIns.reduce((sum, c) => sum + c.mood, 0) / checkIns.length)
      : 0;

    const avgEnergy = checkIns.length > 0
      ? Math.round(checkIns.reduce((sum, c) => sum + c.energy, 0) / checkIns.length)
      : 0;

    const avgSleep = checkIns.length > 0
      ? (checkIns.reduce((sum, c) => sum + c.sleep, 0) / checkIns.length).toFixed(1)
      : 0;

    return {
      period: `${startDate} to ${endDate}`,
      checkInsLogged: checkIns.length,
      averageMood: avgMood,
      averageEnergy: avgEnergy,
      averageSleep: parseFloat(avgSleep),
      habitStats,
      bestDay: checkIns.length > 0 ? checkIns.reduce((best, c) => (c.mood > best.mood ? c : best)).date : null
    };
  },

  /**
   * Reset habits for new day
   * @returns {boolean} Success status
   */
  resetDailyHabits: () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      let habits = HabitsTracker.getHabitsData();

      if (!habits[today]) {
        habits[today] = {};
      }

      localStorage.setItem(CONSTANTS.STORAGE.HABITS, JSON.stringify(habits));
      return true;
    } catch (error) {
      console.error('❌ Error resetting daily habits:', error);
      return false;
    }
  }
};

// Export for module systems if needed
if (typeof module !== 'undefined' && module.exports) {
  module.exports = HabitsTracker;
}
