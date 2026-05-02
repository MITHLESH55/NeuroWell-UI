/**
 * NEUROWELL - Daily Routine Generator
 * Creates personalized daily schedules based on wellness scores
 * Generates morning, afternoon, and evening tasks with logic-driven recommendations
 */

const RoutineGenerator = {
  /**
   * Generate complete daily routine
   * @param {object} scores - Wellness scores {physical, mental, emotional}
   * @returns {object} Daily routine with all time periods
   */
  generateDailyRoutine: (scores = {}) => {
    const validated = Utility.validateScores(scores);

    return {
      date: new Date().toISOString().split('T')[0],
      dayPeriod: Utility.getTimePeriod(),
      morning: RoutineGenerator.generateMorningRoutine(validated),
      afternoon: RoutineGenerator.generateAfternoonRoutine(validated),
      evening: RoutineGenerator.generateEveningRoutine(validated),
      tips: RoutineGenerator.generateRoutineTips(validated),
      estimatedTime: RoutineGenerator.calculateTotalTime(validated),
      timestamp: new Date().toISOString()
    };
  },

  /**
   * Generate morning routine (6 AM - 12 PM)
   * @param {object} scores - Validated scores
   * @returns {array} Morning tasks
   */
  generateMorningRoutine: (scores) => {
    const tasks = [];

    // Wake-up routine
    tasks.push({
      time: '06:00 - 06:30',
      duration: 30,
      activity: 'Wake-up & Hydration',
      description: 'Drink water and stretch gently',
      difficulty: 'Easy',
      icon: '💧'
    });

    // Meditation based on mental score
    if (scores.mental < 60) {
      tasks.push({
        time: '06:30 - 06:45',
        duration: 15,
        activity: 'Mindfulness Meditation',
        description: 'Guided meditation to calm mind and reduce stress',
        difficulty: 'Medium',
        icon: '🧘'
      });
    } else {
      tasks.push({
        time: '06:30 - 06:45',
        duration: 15,
        activity: 'Light Yoga',
        description: 'Gentle stretching and breathing exercises',
        difficulty: 'Easy',
        icon: '🤸'
      });
    }

    // Physical exercise based on physical score
    if (scores.physical < 50) {
      tasks.push({
        time: '06:45 - 07:15',
        duration: 30,
        activity: 'Light Walking',
        description: 'Easy 20-minute walk at comfortable pace',
        difficulty: 'Easy',
        icon: '🚶'
      });
    } else if (scores.physical < 70) {
      tasks.push({
        time: '06:45 - 07:20',
        duration: 35,
        activity: 'Morning Cardio',
        description: 'Jogging, cycling, or brisk walking',
        difficulty: 'Medium',
        icon: '🏃'
      });
    } else {
      tasks.push({
        time: '06:45 - 07:30',
        duration: 45,
        activity: 'Strength Training',
        description: 'Weight training or bodyweight exercises',
        difficulty: 'Hard',
        icon: '💪'
      });
    }

    // Breakfast
    tasks.push({
      time: '07:30 - 08:00',
      duration: 30,
      activity: 'Nutritious Breakfast',
      description: 'Eat balanced meal with protein, whole grains, and fruits',
      difficulty: 'Easy',
      icon: '🥣'
    });

    // Shower & Prepare
    tasks.push({
      time: '08:00 - 08:30',
      duration: 30,
      activity: 'Shower & Personal Care',
      description: 'Refresh and prepare for the day',
      difficulty: 'Easy',
      icon: '🚿'
    });

    // Mental preparation
    if (scores.mental < 60 || scores.emotional < 60) {
      tasks.push({
        time: '08:30 - 08:45',
        duration: 15,
        activity: 'Journaling & Intention Setting',
        description: 'Write daily goals and positive affirmations',
        difficulty: 'Medium',
        icon: '📔'
      });
    } else {
      tasks.push({
        time: '08:30 - 08:45',
        duration: 15,
        activity: 'Goal Review',
        description: 'Review daily objectives and priorities',
        difficulty: 'Easy',
        icon: '✅'
      });
    }

    return tasks;
  },

  /**
   * Generate afternoon routine (12 PM - 6 PM)
   * @param {object} scores - Validated scores
   * @returns {array} Afternoon tasks
   */
  generateAfternoonRoutine: (scores) => {
    const tasks = [];

    // Lunch break
    tasks.push({
      time: '12:00 - 12:30',
      duration: 30,
      activity: 'Lunch Break',
      description: 'Eat balanced meal away from desk',
      difficulty: 'Easy',
      icon: '🍽️'
    });

    // Midday movement based on physical score
    if (scores.physical < 60) {
      tasks.push({
        time: '12:30 - 01:00',
        duration: 30,
        activity: 'Walking Break',
        description: 'Short walk outside or indoors to refresh',
        difficulty: 'Easy',
        icon: '🌿'
      });
    } else {
      tasks.push({
        time: '12:30 - 01:00',
        duration: 30,
        activity: 'Active Recreation',
        description: 'Sports, dancing, or active hobby',
        difficulty: 'Medium',
        icon: '⚽'
      });
    }

    // Work/Study block
    tasks.push({
      time: '01:00 - 03:00',
      duration: 120,
      activity: 'Focused Work/Study',
      description: 'Productive work with short breaks every 45 minutes',
      difficulty: 'Medium',
      icon: '💼'
    });

    // Mindful break based on mental score
    if (scores.mental < 60) {
      tasks.push({
        time: '03:00 - 03:20',
        duration: 20,
        activity: 'Mindfulness Break',
        description: 'Meditation or breathing exercises to reset focus',
        difficulty: 'Easy',
        icon: '🧘'
      });
    } else {
      tasks.push({
        time: '03:00 - 03:15',
        duration: 15,
        activity: 'Movement Break',
        description: 'Stretching and light movement',
        difficulty: 'Easy',
        icon: '🤸'
      });
    }

    // Afternoon snack & hydration
    tasks.push({
      time: '03:15 - 03:30',
      duration: 15,
      activity: 'Healthy Snack & Water',
      description: 'Fruits, nuts, or light snack with hydration',
      difficulty: 'Easy',
      icon: '🍎'
    });

    // Productive task continuation
    tasks.push({
      time: '03:30 - 05:00',
      duration: 90,
      activity: 'Creative/Priority Work',
      description: 'High-value tasks when mind is fresh',
      difficulty: 'Hard',
      icon: '🎯'
    });

    // Social connection based on emotional score
    if (scores.emotional < 60) {
      tasks.push({
        time: '05:00 - 05:30',
        duration: 30,
        activity: 'Connect with Someone',
        description: 'Call or chat with friend or family member',
        difficulty: 'Easy',
        icon: '👥'
      });
    } else {
      tasks.push({
        time: '05:00 - 05:20',
        duration: 20,
        activity: 'Reflection Time',
        description: 'Quiet time to process the day',
        difficulty: 'Easy',
        icon: '🤔'
      });
    }

    return tasks;
  },

  /**
   * Generate evening routine (6 PM - 11 PM)
   * @param {object} scores - Validated scores
   * @returns {array} Evening tasks
   */
  generateEveningRoutine: (scores) => {
    const tasks = [];

    // Evening meal
    tasks.push({
      time: '06:00 - 06:30',
      duration: 30,
      activity: 'Dinner',
      description: 'Healthy dinner with balanced nutrients',
      difficulty: 'Easy',
      icon: '🍲'
    });

    // Family/Social time based on emotional score
    if (scores.emotional < 65) {
      tasks.push({
        time: '06:30 - 07:30',
        duration: 60,
        activity: 'Quality Family Time',
        description: 'Engage with loved ones, share experiences',
        difficulty: 'Medium',
        icon: '👨‍👩‍👧‍👦'
      });
    } else {
      tasks.push({
        time: '06:30 - 07:00',
        duration: 30,
        activity: 'Social Connection',
        description: 'Time with family or close friends',
        difficulty: 'Easy',
        icon: '💬'
      });
    }

    // Hobby/Recreation based on mental score
    if (scores.mental < 60) {
      tasks.push({
        time: '07:00 - 08:00',
        duration: 60,
        activity: 'Relaxing Hobby',
        description: 'Creative activity: art, music, reading, gaming',
        difficulty: 'Easy',
        icon: '🎨'
      });
    } else {
      tasks.push({
        time: '07:00 - 07:45',
        duration: 45,
        activity: 'Fun Activity',
        description: 'Hobby or entertainment of choice',
        difficulty: 'Easy',
        icon: '🎮'
      });
    }

    // Screen wind-down
    tasks.push({
      time: '08:00 - 08:15',
      duration: 15,
      activity: 'Screen Time Reduction',
      description: 'Gradually reduce screen brightness and usage',
      difficulty: 'Easy',
      icon: '📱'
    });

    // Preparation for next day
    tasks.push({
      time: '08:15 - 08:30',
      duration: 15,
      activity: 'Next Day Planning',
      description: 'Prepare clothes, review tomorrow\'s schedule',
      difficulty: 'Easy',
      icon: '📋'
    });

    // Evening relaxation routine
    if (scores.mental < 60 || scores.emotional < 60) {
      tasks.push({
        time: '08:30 - 09:00',
        duration: 30,
        activity: 'Guided Relaxation',
        description: 'Meditation, breathing, or relaxation audio',
        difficulty: 'Easy',
        icon: '🎧'
      });
    } else {
      tasks.push({
        time: '08:30 - 08:45',
        duration: 15,
        activity: 'Light Stretching',
        description: 'Gentle stretches to prepare body for sleep',
        difficulty: 'Easy',
        icon: '🤸'
      });
    }

    // Bedtime routine
    tasks.push({
      time: '09:00 - 09:30',
      duration: 30,
      activity: 'Bedtime Routine',
      description: 'Hygiene, lights off, sleep preparation',
      difficulty: 'Easy',
      icon: '😴'
    });

    // Target sleep
    tasks.push({
      time: '09:30 - 06:00',
      duration: 480,
      activity: 'Sleep (8 hours)',
      description: 'Quality sleep for recovery and rejuvenation',
      difficulty: 'Easy',
      icon: '💤'
    });

    return tasks;
  },

  /**
   * Generate routine tips specific to user
   * @param {object} scores - Validated scores
   * @returns {array} Tips and recommendations
   */
  generateRoutineTips: (scores) => {
    const tips = [];

    if (scores.physical < 50) {
      tips.push({
        emoji: '💪',
        title: 'Start Small with Exercise',
        tip: 'Begin with 20-minute walks and gradually increase intensity. Consistency matters more than intensity.'
      });
    }

    if (scores.mental < 50) {
      tips.push({
        emoji: '🧘',
        title: 'Meditation is Essential',
        tip: 'Even 10 minutes of daily meditation can reduce stress significantly. Use guided meditation apps if needed.'
      });
    }

    if (scores.emotional < 50) {
      tips.push({
        emoji: '👥',
        title: 'Build Your Support Network',
        tip: 'Connect with friends and family daily. Social support is crucial for emotional wellness.'
      });
    }

    tips.push({
      emoji: '💧',
      title: 'Hydration is Key',
      tip: 'Drink at least 8 glasses of water daily. Dehydration affects physical and mental performance.'
    });

    tips.push({
      emoji: '😴',
      title: 'Consistent Sleep Schedule',
      tip: 'Go to bed and wake at the same time daily. This regulates your circadian rhythm.'
    });

    if (scores.overall < 70) {
      tips.push({
        emoji: '🎯',
        title: 'Focus on One Area First',
        tip: 'Choose your lowest-scoring area and dedicate 2 weeks to improvement before adding new habits.'
      });
    } else {
      tips.push({
        emoji: '✨',
        title: 'Maintain Your Momentum',
        tip: 'You\'re doing great! Focus on consistency and gradually enhance your routine.'
      });
    }

    return tips;
  },

  /**
   * Calculate total time commitment for routine
   * @param {object} scores - Validated scores
   * @returns {object} Time breakdown
   */
  calculateTotalTime: (scores) => {
    const morning = RoutineGenerator.generateMorningRoutine(scores);
    const afternoon = RoutineGenerator.generateAfternoonRoutine(scores);
    const evening = RoutineGenerator.generateEveningRoutine(scores);

    const morningTotal = morning.reduce((sum, task) => sum + task.duration, 0);
    const afternoonTotal = afternoon.reduce((sum, task) => sum + task.duration, 0);
    const eveningTotal = evening.reduce((sum, task) => sum + task.duration, 0);

    const totalMinutes = morningTotal + afternoonTotal + eveningTotal;

    return {
      morning: morningTotal,
      afternoon: afternoonTotal,
      evening: eveningTotal,
      total: totalMinutes,
      totalHours: (totalMinutes / 60).toFixed(1)
    };
  },

  /**
   * Get routine for specific period
   * @param {string} period - 'morning', 'afternoon', or 'evening'
   * @param {object} scores - Validated scores
   * @returns {array} Tasks for that period
   */
  getRoutineByPeriod: (period = 'morning', scores = {}) => {
    const validated = Utility.validateScores(scores);

    switch (period.toLowerCase()) {
      case 'morning':
        return RoutineGenerator.generateMorningRoutine(validated);
      case 'afternoon':
        return RoutineGenerator.generateAfternoonRoutine(validated);
      case 'evening':
        return RoutineGenerator.generateEveningRoutine(validated);
      default:
        return [];
    }
  },

  /**
   * Format time range for display
   * @param {string} timeRange - Time range like "06:00 - 06:30"
   * @returns {object} {start, end, duration}
   */
  parseTimeRange: (timeRange = '') => {
    const [start, end] = timeRange.split(' - ');
    return { start: start?.trim(), end: end?.trim() };
  }
};

// Export for module systems if needed
if (typeof module !== 'undefined' && module.exports) {
  module.exports = RoutineGenerator;
}
