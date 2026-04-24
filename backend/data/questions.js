/**
 * NEUROWELL BACKEND - Assessment Questions
 * 15 questions divided into 5 steps (3 per step)
 * Questions cover Physical, Mental, and Emotional wellness dimensions
 * Each question has a scale 1-5 (poor to excellent)
 */

const QUESTIONS = [
  // STEP 1: Physical Health Basics (Questions 1-3)
  {
    id: 1,
    step: 1,
    category: 'Physical Health',
    question: 'How many hours of quality sleep did you get last night?',
    type: 'scale',
    scale: { min: 1, max: 5, minLabel: 'Poor (< 5 hrs)', maxLabel: 'Excellent (8+ hrs)' },
    weight: 2.0,
    impact: 'positive'
  },
  {
    id: 2,
    step: 1,
    category: 'Physical Health',
    question: 'How often do you exercise per week?',
    type: 'scale',
    scale: { min: 1, max: 5, minLabel: 'Never', maxLabel: '5+ times' },
    weight: 1.8,
    impact: 'positive'
  },
  {
    id: 3,
    step: 1,
    category: 'Physical Health',
    question: 'Rate your overall nutrition and eating habits',
    type: 'scale',
    scale: { min: 1, max: 5, minLabel: 'Poor', maxLabel: 'Excellent' },
    weight: 1.5,
    impact: 'positive'
  },

  // STEP 2: Mental Health & Stress (Questions 4-6)
  {
    id: 4,
    step: 2,
    category: 'Mental Health',
    question: 'How would you rate your current stress level?',
    type: 'scale',
    scale: { min: 1, max: 5, minLabel: 'Extremely High', maxLabel: 'Very Low' },
    weight: 2.2,
    impact: 'negative'
  },
  {
    id: 5,
    step: 2,
    category: 'Mental Health',
    question: 'How often do you practice mindfulness or meditation?',
    type: 'scale',
    scale: { min: 1, max: 5, minLabel: 'Never', maxLabel: 'Daily' },
    weight: 1.7,
    impact: 'positive'
  },
  {
    id: 6,
    step: 2,
    category: 'Mental Health',
    question: 'Rate your focus and productivity levels',
    type: 'scale',
    scale: { min: 1, max: 5, minLabel: 'Very Poor', maxLabel: 'Excellent' },
    weight: 1.6,
    impact: 'positive'
  },

  // STEP 3: Work-Life Balance (Questions 7-9)
  {
    id: 7,
    step: 3,
    category: 'Mental Health',
    question: 'How many hours per day do you work/study?',
    type: 'scale',
    scale: { min: 1, max: 5, minLabel: '12+ hrs', maxLabel: '8 hrs or less' },
    weight: 1.9,
    impact: 'positive'
  },
  {
    id: 8,
    step: 3,
    category: 'Mental Health',
    question: 'How satisfied are you with your work-life balance?',
    type: 'scale',
    scale: { min: 1, max: 5, minLabel: 'Very Unsatisfied', maxLabel: 'Very Satisfied' },
    weight: 2.0,
    impact: 'positive'
  },
  {
    id: 9,
    step: 3,
    category: 'Mental Health',
    question: 'How often do you take breaks during work?',
    type: 'scale',
    scale: { min: 1, max: 5, minLabel: 'Never', maxLabel: 'Frequently' },
    weight: 1.7,
    impact: 'positive'
  },

  // STEP 4: Emotional Wellness (Questions 10-12)
  {
    id: 10,
    step: 4,
    category: 'Emotional Wellness',
    question: 'Rate your overall mood and emotional state',
    type: 'scale',
    scale: { min: 1, max: 5, minLabel: 'Very Poor', maxLabel: 'Excellent' },
    weight: 2.1,
    impact: 'positive'
  },
  {
    id: 11,
    step: 4,
    category: 'Emotional Wellness',
    question: 'How confident do you feel about your future?',
    type: 'scale',
    scale: { min: 1, max: 5, minLabel: 'Not Confident', maxLabel: 'Very Confident' },
    weight: 1.8,
    impact: 'positive'
  },
  {
    id: 12,
    step: 4,
    category: 'Emotional Wellness',
    question: 'How satisfied are you with your relationships?',
    type: 'scale',
    scale: { min: 1, max: 5, minLabel: 'Unsatisfied', maxLabel: 'Very Satisfied' },
    weight: 1.9,
    impact: 'positive'
  },

  // STEP 5: Lifestyle & Habits (Questions 13-15)
  {
    id: 13,
    step: 5,
    category: 'Physical Health',
    question: 'How often do you engage in recreational activities you enjoy?',
    type: 'scale',
    scale: { min: 1, max: 5, minLabel: 'Rarely', maxLabel: 'Regularly' },
    weight: 1.6,
    impact: 'positive'
  },
  {
    id: 14,
    step: 5,
    category: 'Physical Health',
    question: 'Rate your caffeine and substance consumption habits',
    type: 'scale',
    scale: { min: 1, max: 5, minLabel: 'Excessive', maxLabel: 'Minimal/Healthy' },
    weight: 1.5,
    impact: 'positive'
  },
  {
    id: 15,
    step: 5,
    category: 'Emotional Wellness',
    question: 'How often do you engage in social connections?',
    type: 'scale',
    scale: { min: 1, max: 5, minLabel: 'Rarely', maxLabel: 'Frequently' },
    weight: 1.8,
    impact: 'positive'
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

module.exports = { QUESTIONS, getQuestionsByStep, getQuestionsByCategory };