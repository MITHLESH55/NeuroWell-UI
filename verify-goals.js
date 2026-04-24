/**
 * NEUROWELL - Goal Tracking Verification Script
 * Validates the complete goal tracking implementation
 * Run this in browser console on dashboard.html
 */

console.log('='.repeat(70));
console.log('🧪 NeuroWell Goal Tracking Verification');
console.log('='.repeat(70));

// 1. Verify GoalManager Module
console.log('\n1️⃣ VERIFYING GOALMANAGER MODULE:');
try {
  const methodsToCheck = [
    'initializeGoals',
    'getGoals',
    'saveGoals',
    'calculateGoalProgress',
    'getGoalStatus',
    'getActiveGoals',
    'getCompletedCount',
    'getTotalCount',
    'getOverallProgress',
    'getProgressTrend',
    'getGoalRecommendations',
    'updateGoalProgress',
    'resetGoal',
    'toggleGoalActive'
  ];

  let methodCount = 0;
  methodsToCheck.forEach(method => {
    if (typeof GoalManager[method] === 'function') {
      console.log(`   ✅ ${method}()`);
      methodCount++;
    } else {
      console.warn(`   ❌ ${method}() - NOT FOUND`);
    }
  });

  console.log(`\n   Summary: ${methodCount}/${methodsToCheck.length} methods verified`);
} catch (error) {
  console.error('   ❌ GoalManager verification failed:', error.message);
}

// 2. Verify Goal Data Structure
console.log('\n2️⃣ VERIFYING GOAL DATA STRUCTURE:');
try {
  const goals = GoalManager.getGoals();
  
  if (goals.length === 0) {
    console.warn('   ⚠️  No goals found - initializing...');
    GoalManager.initializeGoals();
    goals = GoalManager.getGoals();
  }

  if (goals.length > 0) {
    const sample = goals[0];
    const requiredFields = ['id', 'name', 'description', 'icon', 'category', 'targetScore', 'currentThreshold', 'baselineThreshold', 'color', 'progress', 'status', 'isActive'];
    
    let validCount = 0;
    requiredFields.forEach(field => {
      if (sample.hasOwnProperty(field)) {
        console.log(`   ✅ ${field}: ${sample[field]}`);
        validCount++;
      } else {
        console.warn(`   ❌ ${field} - MISSING`);
      }
    });

    console.log(`\n   Structure validity: ${validCount}/${requiredFields.length}`);
  }
} catch (error) {
  console.error('   ❌ Data structure verification failed:', error.message);
}

// 3. Verify Goal Constants
console.log('\n3️⃣ VERIFYING GOAL CONSTANTS:');
try {
  const goalDefs = Object.values(CONSTANTS.GOALS);
  console.log(`   Found ${goalDefs.length} goal definitions:`);
  
  goalDefs.forEach(def => {
    console.log(`   ✅ ${def.icon} ${def.name}:`);
    console.log(`      Category: ${def.category}`);
    console.log(`      Target: ${def.targetScore}, Baseline: ${def.baselineThreshold}`);
    console.log(`      Threshold: ${def.currentThreshold}`);
  });
} catch (error) {
  console.error('   ❌ Constants verification failed:', error.message);
}

// 4. Verify Goal Progress Calculation
console.log('\n4️⃣ VERIFYING GOAL PROGRESS CALCULATION:');
try {
  const testScores = {
    physical: 70,
    mental: 75,
    emotional: 72,
    overall: 72
  };

  console.log(`   Test scores: P=${testScores.physical}, M=${testScores.mental}, E=${testScores.emotional}`);
  
  const goals = GoalManager.calculateGoalProgress(testScores);
  
  goals.forEach(goal => {
    const status = GoalManager.getGoalStatus(goal);
    console.log(`\n   ${goal.icon} ${goal.name}:`);
    console.log(`      Progress: ${goal.progress}% (${status.label})`);
    console.log(`      Current: ${goal.currentScore}, Target: ${goal.targetScore}`);
    console.log(`      Status: ${goal.status}`);
  });
} catch (error) {
  console.error('   ❌ Progress calculation verification failed:', error.message);
}

// 5. Verify Overall Metrics
console.log('\n5️⃣ VERIFYING OVERALL METRICS:');
try {
  const overall = GoalManager.getOverallProgress();
  const completed = GoalManager.getCompletedCount();
  const total = GoalManager.getTotalCount();
  const active = GoalManager.getActiveGoals().length;

  console.log(`   ✅ Overall Progress: ${overall}%`);
  console.log(`   ✅ Completed Goals: ${completed}/${total}`);
  console.log(`   ✅ Active Goals: ${active}/${total}`);
} catch (error) {
  console.error('   ❌ Metrics verification failed:', error.message);
}

// 6. Verify Dashboard Integration
console.log('\n6️⃣ VERIFYING DASHBOARD INTEGRATION:');
try {
  const section = document.getElementById('goalsSection');
  if (section) {
    console.log('   ✅ Goals section element found (#goalsSection)');
    if (section.innerHTML.length > 0) {
      console.log('   ✅ Goals section has content');
      console.log(`   ✅ Content length: ${section.innerHTML.length} characters`);
    } else {
      console.warn('   ⚠️  Goals section is empty - may not have assessments');
    }
  } else {
    console.warn('   ⚠️  Goals section element not found');
  }
} catch (error) {
  console.error('   ❌ Dashboard integration verification failed:', error.message);
}

// 7. Verify Storage Integration
console.log('\n7️⃣ VERIFYING STORAGE INTEGRATION:');
try {
  const storageKey = CONSTANTS.STORAGE.GOALS;
  const stored = localStorage.getItem(storageKey);
  
  if (stored) {
    console.log(`   ✅ Goals stored in localStorage`);
    console.log(`   ✅ Storage key: ${storageKey}`);
    console.log(`   ✅ Data size: ${(stored.length / 1024).toFixed(2)} KB`);
  } else {
    console.warn('   ⚠️  No goals in localStorage');
  }
} catch (error) {
  console.error('   ❌ Storage verification failed:', error.message);
}

// 8. Verify Progress Trending
console.log('\n8️⃣ VERIFYING PROGRESS TRENDING:');
try {
  const history = StorageManager.getHistoricalData();
  
  if (history.length < 2) {
    console.warn(`   ⚠️  Need at least 2 assessments for trend (found ${history.length})`);
  } else {
    console.log(`   ✅ Found ${history.length} assessments for trending`);
    
    const goals = GoalManager.getGoals();
    goals.slice(0, 2).forEach(goal => {
      const trend = GoalManager.getProgressTrend(goal.id);
      console.log(`   ${goal.icon} ${goal.name}: ${trend.direction} ${trend.trend} (${trend.change > 0 ? '+' : ''}${trend.change}%)`);
    });
  }
} catch (error) {
  console.error('   ❌ Trending verification failed:', error.message);
}

// 9. Verify Recommendations Engine
console.log('\n9️⃣ VERIFYING RECOMMENDATIONS ENGINE:');
try {
  const history = StorageManager.getHistoricalData();
  
  if (history.length === 0) {
    console.warn('   ⚠️  No history for recommendations - add assessments first');
  } else {
    const latestScores = history[history.length - 1].scores;
    const recommendations = GoalManager.getGoalRecommendations(latestScores);
    
    console.log(`   ✅ Generated ${recommendations.length} recommendations`);
    recommendations.slice(0, 3).forEach(rec => {
      console.log(`   • ${rec.goalName}: Gap ${rec.gap} (Priority: ${rec.priority})`);
    });
  }
} catch (error) {
  console.error('   ❌ Recommendations verification failed:', error.message);
}

// 10. Summary Report
console.log('\n' + '='.repeat(70));
console.log('📊 SUMMARY:');
try {
  const goals = GoalManager.getGoals();
  const overall = GoalManager.getOverallProgress();
  const completed = GoalManager.getCompletedCount();
  
  if (goals.length === 0) {
    console.log('⚠️  NO GOALS - Use GOAL_TRACKING_TEST.html to initialize');
  } else {
    console.log(`✅ GOAL TRACKING OPERATIONAL!`);
    console.log(`   📋 Total Goals: ${goals.length}`);
    console.log(`   ✅ Completed: ${completed}`);
    console.log(`   📈 Overall Progress: ${overall}%`);
    console.log(`   🎯 Ready for dashboard display`);
  }
} catch (error) {
  console.error('❌ Summary failed:', error.message);
}

console.log('='.repeat(70));
console.log('\n✨ Verification complete! Check browser console for details.');
console.log('\n💡 For manual testing, open GOAL_TRACKING_TEST.html\n');
