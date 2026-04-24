// Quick test of goal tracking system
console.log('🧪 Testing Goal Tracking System...');

// Mock localStorage for testing
global.localStorage = {
  getItem: (key) => null,
  setItem: (key, value) => {},
  removeItem: (key) => {}
};

// Load constants
const constantsCode = require('fs').readFileSync('./data/constants.js', 'utf8');
eval(constantsCode.replace('const CONSTANTS', 'global.CONSTANTS'));

// Load goals module
const goalsCode = require('fs').readFileSync('./js/goals.js', 'utf8');
eval(goalsCode.replace('const GoalManager', 'global.GoalManager'));

// Test goal initialization
const goals = GoalManager.initializeGoals();
console.log(`✅ Initialized ${goals.length} goals`);

// Test progress calculation with mock data
const mockScores = { physical: 70, mental: 65, social: 75 };

const updatedGoals = GoalManager.calculateGoalProgress(mockScores);
console.log(`📊 Calculated progress for ${updatedGoals.length} goals`);

updatedGoals.forEach(goal => {
  const status = GoalManager.getGoalStatus(goal, goal.progress);
  console.log(`📊 ${goal.name}: ${goal.progress}% - ${status.label}`);
});

console.log('🎯 Goal tracking system is working!');