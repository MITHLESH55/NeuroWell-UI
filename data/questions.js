/**
 * NEUROWELL - Assessment Questions
 * 15 questions divided into 5 steps
 * Each question now stores user-friendly slider labels in options
 */

const QUESTIONS = [
  // STEP 1: Physical Wellness
  {
    id: 1,
    step: 1,
    category: 'Physical',
    question: 'How many hours of quality sleep did you get last night?',
    type: 'scale',
    weight: 2.0,
    impact: 'positive',
    options: [
      { label: '< 5 hours', value: 1 },
      { label: '5–6 hours', value: 2 },
      { label: '6–7 hours', value: 3 },
      { label: '7–8 hours', value: 4 },
      { label: '8+ hours', value: 5 }
    ]
  },
  {
    id: 2,
    step: 1,
    category: 'Physical',
    question: 'How often do you exercise per week?',
    type: 'scale',
    weight: 1.8,
    impact: 'positive',
    options: [
      { label: 'Never', value: 1 },
      { label: 'Rarely', value: 2 },
      { label: 'Sometimes', value: 3 },
      { label: 'Often', value: 4 },
      { label: 'Daily', value: 5 }
    ]
  },
  {
    id: 3,
    step: 1,
    category: 'Physical',
    question: 'Rate your overall nutrition and eating habits',
    type: 'scale',
    weight: 1.5,
    impact: 'positive',
    options: [
      { label: 'Poor', value: 1 },
      { label: 'Average', value: 2 },
      { label: 'Good', value: 3 },
      { label: 'Very Good', value: 4 },
      { label: 'Excellent', value: 5 }
    ]
  },

  // STEP 2: Mental Wellness
  {
    id: 4,
    step: 2,
    category: 'Mental',
    question: 'How would you rate your current stress level?',
    type: 'scale',
    weight: 2.2,
    impact: 'negative',
    options: [
      { label: 'Very Low', value: 1 },
      { label: 'Low', value: 2 },
      { label: 'Moderate', value: 3 },
      { label: 'High', value: 4 },
      { label: 'Very High', value: 5 }
    ]
  },
  {
    id: 5,
    step: 2,
    category: 'Mental',
    question: 'How often do you practice mindfulness or meditation?',
    type: 'scale',
    weight: 1.7,
    impact: 'positive',
    options: [
      { label: 'Never', value: 1 },
      { label: 'Rarely', value: 2 },
      { label: 'Sometimes', value: 3 },
      { label: 'Often', value: 4 },
      { label: 'Daily', value: 5 }
    ]
  },
  {
    id: 6,
    step: 2,
    category: 'Mental',
    question: 'Rate your focus and productivity levels',
    type: 'scale',
    weight: 1.6,
    impact: 'positive',
    options: [
      { label: 'Very Low', value: 1 },
      { label: 'Low', value: 2 },
      { label: 'Moderate', value: 3 },
      { label: 'High', value: 4 },
      { label: 'Very High', value: 5 }
    ]
  },

  // STEP 3: Work-Life Balance
  {
    id: 7,
    step: 3,
    category: 'Mental',
    question: 'How many hours per day do you work or study?',
    type: 'scale',
    weight: 1.9,
    impact: 'positive',
    options: [
      { label: '< 5 hours', value: 1 },
      { label: '5–6 hours', value: 2 },
      { label: '6–7 hours', value: 3 },
      { label: '7–8 hours', value: 4 },
      { label: '8+ hours', value: 5 }
    ]
  },
  {
    id: 8,
    step: 3,
    category: 'Mental',
    question: 'How satisfied are you with your work-life balance?',
    type: 'scale',
    weight: 2.0,
    impact: 'positive',
    options: [
      { label: 'Very Bad', value: 1 },
      { label: 'Bad', value: 2 },
      { label: 'Neutral', value: 3 },
      { label: 'Good', value: 4 },
      { label: 'Great', value: 5 }
    ]
  },
  {
    id: 9,
    step: 3,
    category: 'Mental',
    question: 'How often do you take breaks during the work day?',
    type: 'scale',
    weight: 1.7,
    impact: 'positive',
    options: [
      { label: 'Never', value: 1 },
      { label: 'Rarely', value: 2 },
      { label: 'Sometimes', value: 3 },
      { label: 'Often', value: 4 },
      { label: 'Daily', value: 5 }
    ]
  },

  // STEP 4: Emotional Wellness
  {
    id: 10,
    step: 4,
    category: 'Emotional',
    question: 'Rate your overall mood and emotional state',
    type: 'scale',
    weight: 2.1,
    impact: 'positive',
    options: [
      { label: 'Very Bad', value: 1 },
      { label: 'Bad', value: 2 },
      { label: 'Neutral', value: 3 },
      { label: 'Good', value: 4 },
      { label: 'Great', value: 5 }
    ]
  },
  {
    id: 11,
    step: 4,
    category: 'Emotional',
    question: 'How confident do you feel about your future?',
    type: 'scale',
    weight: 1.8,
    impact: 'positive',
    options: [
      { label: 'Very Low', value: 1 },
      { label: 'Low', value: 2 },
      { label: 'Moderate', value: 3 },
      { label: 'High', value: 4 },
      { label: 'Very High', value: 5 }
    ]
  },
  {
    id: 12,
    step: 4,
    category: 'Emotional',
    question: 'How satisfied are you with your relationships?',
    type: 'scale',
    weight: 1.9,
    impact: 'positive',
    options: [
      { label: 'Poor', value: 1 },
      { label: 'Average', value: 2 },
      { label: 'Good', value: 3 },
      { label: 'Very Good', value: 4 },
      { label: 'Excellent', value: 5 }
    ]
  },

  // STEP 5: Lifestyle & Habits
  {
    id: 13,
    step: 5,
    category: 'Physical',
    question: 'How often do you engage in recreational activities you enjoy?',
    type: 'scale',
    weight: 1.6,
    impact: 'positive',
    options: [
      { label: 'Rarely', value: 1 },
      { label: 'Sometimes', value: 2 },
      { label: 'Occasionally', value: 3 },
      { label: 'Often', value: 4 },
      { label: 'Daily', value: 5 }
    ]
  },
  {
    id: 14,
    step: 5,
    category: 'Physical',
    question: 'Rate your caffeine and substance consumption habits',
    type: 'scale',
    weight: 1.5,
    impact: 'positive',
    options: [
      { label: 'Poor', value: 1 },
      { label: 'Average', value: 2 },
      { label: 'Good', value: 3 },
      { label: 'Very Good', value: 4 },
      { label: 'Excellent', value: 5 }
    ]
  },
  {
    id: 15,
    step: 5,
    category: 'Emotional',
    question: 'How often do you engage in social connections?',
    type: 'scale',
    weight: 1.8,
    impact: 'positive',
    options: [
      { label: 'Rarely', value: 1 },
      { label: 'Sometimes', value: 2 },
      { label: 'Occasionally', value: 3 },
      { label: 'Often', value: 4 },
      { label: 'Daily', value: 5 }
    ]
  }
];

// Helper function to get questions by step
function getQuestionsByStep(step) {
  return QUESTIONS.filter(q => q.step === step);
}

// Helper function to get questions by category
function getQuestionsByCategory(category) {
  return QUESTIONS.filter(q => q.category === category);
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { QUESTIONS, getQuestionsByStep, getQuestionsByCategory };
}
