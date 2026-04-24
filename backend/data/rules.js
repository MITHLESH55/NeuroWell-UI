/**
 * NEUROWELL BACKEND - Recommendation Rules Engine
 * Rule-based AI logic for generating personalized recommendations
 * Rules are evaluated based on wellness scores and burnout risk
 * Each rule has conditions, priority, and actionable recommendations
 */

const RULES = {
  // Physical Health Rules
  PHYSICAL_SLEEP_DEFICIT: {
    id: 'phys_sleep_01',
    category: 'Physical Health',
    priority: 'HIGH',
    condition: (scores) => scores.physical < 50,
    title: 'Sleep Optimization',
    recommendations: [
      'Establish a consistent sleep schedule - go to bed and wake up at the same time daily',
      'Create a sleep-friendly environment: dark, cool (65-68°F), and quiet',
      'Avoid screens 1 hour before bedtime to reduce blue light exposure',
      'Practice the 10-3-2-1-0 rule: no caffeine 10 hrs before bed, no work 3 hrs, no food 2 hrs, no liquids 1 hr, no alarm 0 min',
      'Try progressive muscle relaxation or guided meditation before sleep'
    ],
    actions: ['Track Sleep', 'Set Bedtime Alarm', 'View Sleep Tips']
  },

  PHYSICAL_EXERCISE_NEEDED: {
    id: 'phys_exercise_01',
    category: 'Physical Health',
    priority: 'HIGH',
    condition: (scores) => scores.physical < 45,
    title: 'Exercise Program',
    recommendations: [
      'Start with 30 minutes of moderate exercise (brisk walking, cycling, swimming) 5 days a week',
      'Mix cardio with strength training 2-3 times weekly',
      'Exercise in the morning for better mood and energy throughout the day',
      'Find an activity you enjoy to maintain consistency',
      'Consider outdoor exercise for vitamin D and mental health benefits'
    ],
    actions: ['Create Workout Plan', 'Find Gym', 'Join Exercise Group']
  },

  PHYSICAL_NUTRITION_IMPROVEMENT: {
    id: 'phys_nutrition_01',
    category: 'Physical Health',
    priority: 'MEDIUM',
    condition: (scores) => scores.physical < 60,
    title: 'Nutrition Enhancement',
    recommendations: [
      'Increase intake of whole grains, lean proteins, and colorful vegetables',
      'Reduce processed foods and added sugars - aim for natural meals',
      'Stay hydrated: drink at least 8 glasses of water daily',
      'Plan meals in advance to avoid impulsive unhealthy choices',
      'Consider consulting a nutritionist for personalized dietary guidance'
    ],
    actions: ['View Meal Plans', 'Find Nutritionist', 'Track Diet']
  },

  // Mental Health Rules
  MENTAL_STRESS_HIGH: {
    id: 'mental_stress_01',
    category: 'Mental Health',
    priority: 'CRITICAL',
    condition: (scores) => scores.mental < 40,
    title: 'Stress Management',
    recommendations: [
      'Practice daily meditation or mindfulness for 10-15 minutes',
      'Use the 4-7-8 breathing technique: inhale 4 counts, hold 7, exhale 8',
      'Schedule regular breaks throughout your day (5 min every hour)',
      'Consider professional counseling or therapy support',
      'Reduce caffeine and alcohol intake, which exacerbate stress'
    ],
    actions: ['Meditation Guide', 'Book Therapist', 'Stress Quiz']
  },

  MENTAL_FOCUS_IMPROVEMENT: {
    id: 'mental_focus_01',
    category: 'Mental Health',
    priority: 'MEDIUM',
    condition: (scores) => scores.mental < 55,
    title: 'Focus & Productivity',
    recommendations: [
      'Use the Pomodoro Technique: 25 min work, 5 min break, repeat 4 times then longer break',
      'Eliminate distractions: silence notifications, use focus apps, create dedicated workspace',
      'Work on high-priority tasks during peak energy hours',
      'Take short walks or stretch during breaks to refresh mental clarity',
      'Practice single-tasking instead of multitasking'
    ],
    actions: ['Pomodoro Timer', 'Focus Apps', 'Workspace Setup']
  },

  MENTAL_MINDFULNESS_NEEDED: {
    id: 'mental_mindfulness_01',
    category: 'Mental Health',
    priority: 'MEDIUM',
    condition: (scores) => scores.mental < 65,
    title: 'Mindfulness Practice',
    recommendations: [
      'Start a daily mindfulness practice with apps like Headspace or Calm',
      'Practice body scans to increase body awareness and reduce tension',
      'Keep a journal to track thoughts and emotions',
      'Engage in mindful eating - focus on taste, texture, and fullness cues',
      'Practice mindful listening in conversations with others'
    ],
    actions: ['Meditation App', 'Journal Prompts', 'Breathing Exercises']
  },

  // Work-Life Balance Rules
  WORKLIFE_IMBALANCE: {
    id: 'wb_imbalance_01',
    category: 'Mental Health',
    priority: 'HIGH',
    condition: (scores) => scores.mental < 50,
    title: 'Work-Life Balance',
    recommendations: [
      'Set clear work hours and stick to them - turn off work notifications after hours',
      'Schedule personal time and recreational activities just like work meetings',
      'Take all your vacation days - use them to fully disconnect',
      'Practice saying "no" to non-essential commitments',
      'Spend quality time with loved ones daily'
    ],
    actions: ['Set Work Hours', 'Plan Vacation', 'Hobby Finder']
  },

  // Emotional Wellness Rules
  EMOTIONAL_SUPPORT_NEEDED: {
    id: 'emot_support_01',
    category: 'Emotional Wellness',
    priority: 'HIGH',
    condition: (scores) => scores.emotional < 45,
    title: 'Emotional Support',
    recommendations: [
      'Reach out to trusted friends or family members to share your feelings',
      'Consider professional therapy or counseling for deeper emotional work',
      'Join support groups related to your concerns',
      'Practice self-compassion - treat yourself with kindness and understanding',
      'Engage in activities that bring joy and meaning to your life'
    ],
    actions: ['Find Therapist', 'Support Groups', 'Self-Care Ideas']
  },

  EMOTIONAL_CONFIDENCE_BOOST: {
    id: 'emot_confidence_01',
    category: 'Emotional Wellness',
    priority: 'MEDIUM',
    condition: (scores) => scores.emotional < 60,
    title: 'Build Confidence',
    recommendations: [
      'Set and achieve small goals regularly to build self-efficacy',
      'Challenge negative self-talk with positive affirmations',
      'Remember past successes and how you overcame challenges',
      'Develop a growth mindset - view challenges as learning opportunities',
      'Invest in personal development and skill-building'
    ],
    actions: ['Goal Setting', 'Affirmations', 'Skill Courses']
  },

  // Burnout Prevention Rules
  BURNOUT_RISK_HIGH: {
    id: 'burnout_risk_01',
    category: 'CRITICAL',
    priority: 'CRITICAL',
    condition: (burnoutRisk) => burnoutRisk > 70,
    title: 'Burnout Prevention',
    recommendations: [
      'URGENT: Consider taking time off work for recovery and reflection',
      'Schedule regular check-ins with a healthcare professional',
      'Implement ALL of the above recommendations - this is critical for your wellbeing',
      'Reduce workload if possible - delegate non-essential tasks',
      'Build a support network and actively seek help'
    ],
    actions: ['Emergency Support', 'Time Off Plan', 'Crisis Hotline']
  },

  BURNOUT_RISK_MODERATE: {
    id: 'burnout_risk_02',
    category: 'Preventive',
    priority: 'HIGH',
    condition: (burnoutRisk) => burnoutRisk >= 40 && burnoutRisk <= 70,
    title: 'Burnout Prevention',
    recommendations: [
      'Implement stress management techniques immediately',
      'Review and improve work-life balance',
      'Schedule regular recovery time',
      'Build healthy coping mechanisms',
      'Plan wellness activities throughout the week'
    ],
    actions: ['Wellness Plan', 'Recovery Schedule', 'Support Resources']
  },

  // Excellence Maintenance Rules
  WELLNESS_EXCELLENT: {
    id: 'wellness_excellent_01',
    category: 'Maintenance',
    priority: 'MEDIUM',
    condition: (scores) => scores.overall >= 80,
    title: 'Maintain Wellness Peak',
    recommendations: [
      'Continue your current healthy habits and routines',
      'Share your wellness practices with others to help your community',
      'Set new wellness goals to challenge yourself',
      'Practice gratitude daily to maintain positive mindset',
      'Schedule regular check-ins to sustain your excellent wellbeing'
    ],
    actions: ['Share Story', 'Advanced Goals', 'Community', 'Schedule Check-in']
  }
};

/**
 * Evaluate which rules apply based on scores
 * @param {object} scores - { physical, mental, emotional, overall }
 * @param {number} burnoutRisk - 0-100 burnout risk percentage
 * @returns {array} Array of applicable rules sorted by priority
 */
function evaluateRules(scores, burnoutRisk) {
  const applicableRules = [];

  // Check all rules
  for (const [key, rule] of Object.entries(RULES)) {
    let applies = false;

    if (key.includes('BURNOUT')) {
      applies = rule.condition(burnoutRisk);
    } else {
      applies = rule.condition(scores);
    }

    if (applies) {
      applicableRules.push({ key, ...rule });
    }
  }

  // Sort by priority: CRITICAL > HIGH > MEDIUM > LOW
  const priorityOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
  applicableRules.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  return applicableRules;
}

module.exports = { RULES, evaluateRules };