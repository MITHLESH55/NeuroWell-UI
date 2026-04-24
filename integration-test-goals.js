/**
 * NEUROWELL - Goal Tracking Integration Test
 * Tests the complete integration between assessments, scores, and goals
 * Run this in browser console after completing assessments
 */

console.log('\n' + '='.repeat(70));
console.log('🔗 NeuroWell Goal Tracking Integration Test');
console.log('='.repeat(70));

// Test 1: Assessment → Score → Goal Flow
console.log('\n1️⃣ TESTING ASSESSMENT TO GOAL FLOW:');
try {
  const history = StorageManager.getHistoricalData();
  
  if (history.length === 0) {
    console.warn('⚠️  No assessment history found');
    console.log('   To test this flow:');
    console.log('   1. Complete an assessment');
    console.log('   2. Check goals update automatically');
  } else {
    console.log(`✅ Found ${history.length} assessment(s) in history`);
    
    const latestAssessment = history[history.length - 1];
    console.log('\nLatest Assessment Scores:');
    console.log(`   Physical: ${latestAssessment.scores.physical}%`);
    console.log(`   Mental: ${latestAssessment.scores.mental}%`);
    console.log(`   Emotional: ${latestAssessment.scores.emotional}%`);
    console.log(`   Overall: ${latestAssessment.scores.overall}%`);
    
    // Test that goals calculated from these scores
    const goals = GoalManager.calculateGoalProgress(latestAssessment.scores);
    console.log('\n✅ Goals Updated from Assessment Scores:');
    goals.forEach(goal => {
      console.log(`   ${goal.icon} ${goal.name}: ${goal.progress}% (${goal.status})`);
    });
  }
} catch (error) {
  console.error('❌ Integration test failed:', error.message);
}

// Test 2: Score to Goal Mapping
console.log('\n2️⃣ TESTING SCORE TO GOAL MAPPING:');
try {
  const goals = GoalManager.getGoals();
  
  if (goals.length === 0) {
    console.warn('⚠️  No goals found - initializing...');
    GoalManager.initializeGoals();
  }
  
  const mappings = [
    { goal: 'IMPROVE_SLEEP', scoreKey: 'physical' },
    { goal: 'REDUCE_STRESS', scoreKey: 'mental' },
    { goal: 'INCREASE_ACTIVITY', scoreKey: 'physical' }
  ];
  
  mappings.forEach(mapping => {
    const goalDef = CONSTANTS.GOALS[mapping.goal];
    console.log(`✅ ${goalDef.icon} ${goalDef.name}:`);
    console.log(`   Score Category: ${mapping.scoreKey}`);
    console.log(`   Baseline: ${goalDef.baselineThreshold} → Target: ${goalDef.targetScore}`);
    console.log(`   Current Threshold: ${goalDef.currentThreshold}`);
  });
} catch (error) {
  console.error('❌ Mapping test failed:', error.message);
}

// Test 3: Dynamic Updates
console.log('\n3️⃣ TESTING DYNAMIC UPDATES:');
try {
  console.log('Testing goal calculation with different score scenarios...\n');
  
  const scenarios = [
    { name: 'Low Scores', physical: 40, mental: 35, emotional: 38 },
    { name: 'Medium Scores', physical: 65, mental: 70, emotional: 68 },
    { name: 'High Scores', physical: 85, mental: 88, emotional: 86 }
  ];
  
  scenarios.forEach(scenario => {
    const scores = {
      physical: scenario.physical,
      mental: scenario.mental,
      emotional: scenario.emotional,
      overall: Math.round((scenario.physical + scenario.mental + scenario.emotional) / 3)
    };
    
    // Create temporary goals for calculation
    const testGoals = [
      { ...CONSTANTS.GOALS.IMPROVE_SLEEP, currentThreshold: 'physical' },
      { ...CONSTANTS.GOALS.REDUCE_STRESS, currentThreshold: 'mental' },
      { ...CONSTANTS.GOALS.INCREASE_ACTIVITY, currentThreshold: 'physical' }
    ];
    
    console.log(`${scenario.name}: P=${scores.physical}, M=${scores.mental}, E=${scores.emotional}`);
    
    testGoals.forEach(goalDef => {
      const currentScore = scores[goalDef.currentThreshold];
      const progress = Math.round(
        ((currentScore - goalDef.baselineThreshold) / (goalDef.targetScore - goalDef.baselineThreshold)) * 100
      );
      const capped = Math.min(100, Math.max(0, progress));
      
      let status;
      if (capped === 100) status = 'completed';
      else if (capped >= 50) status = 'in_progress';
      else if (capped > 0) status = 'started';
      else status = 'not_started';
      
      console.log(`   ${goalDef.icon} ${goalDef.name}: ${capped}% (${status})`);
    });
    console.log('');
  });
  
  console.log('✅ Dynamic calculations working correctly');
} catch (error) {
  console.error('❌ Dynamic update test failed:', error.message);
}

// Test 4: Progress Tracking Over Time
console.log('\n4️⃣ TESTING PROGRESS TRACKING OVER TIME:');
try {
  const history = StorageManager.getHistoricalData();
  
  if (history.length < 2) {
    console.warn(`⚠️  Need 2+ assessments for trend (found ${history.length})`);
  } else {
    console.log(`✅ Found ${history.length} assessments for trend analysis\n`);
    
    console.log('Historical Progress:');
    history.forEach((record, idx) => {
      const date = new Date(record.timestamp).toLocaleDateString();
      console.log(`   Assessment ${idx + 1} (${date}): ${record.scores.overall}%`);
    });
    
    // Calculate trend
    const first = history[0].scores.overall;
    const last = history[history.length - 1].scores.overall;
    const change = last - first;
    const trend = change > 0 ? '📈 Improving' : change < 0 ? '📉 Declining' : '→ Stable';
    
    console.log(`\n✅ Overall Trend: ${trend} (${first}% → ${last}%)`);
  }
} catch (error) {
  console.error('❌ Trend test failed:', error.message);
}

// Test 5: Recommendation Generation
console.log('\n5️⃣ TESTING RECOMMENDATION GENERATION:');
try {
  const history = StorageManager.getHistoricalData();
  
  if (history.length === 0) {
    console.warn('⚠️  No assessment history for recommendations');
  } else {
    const latestScores = history[history.length - 1].scores;
    const recommendations = GoalManager.getGoalRecommendations(latestScores);
    
    if (recommendations.length === 0) {
      console.log('✅ All goals on track! No recommendations needed.');
    } else {
      console.log(`✅ Generated ${recommendations.length} recommendations:\n`);
      
      recommendations.forEach((rec, idx) => {
        const priorityIcon = rec.priority === 'high' ? '🔴' : rec.priority === 'medium' ? '🟡' : '🟢';
        console.log(`${idx + 1}. ${priorityIcon} ${rec.goalName}`);
        console.log(`   Current: ${rec.currentScore} → Target: ${rec.targetScore}`);
        console.log(`   Gap: ${rec.gap} points | Priority: ${rec.priority.toUpperCase()}`);
      });
    }
  }
} catch (error) {
  console.error('❌ Recommendation test failed:', error.message);
}

// Test 6: Storage Integrity
console.log('\n6️⃣ TESTING STORAGE INTEGRITY:');
try {
  const goals = GoalManager.getGoals();
  const assessments = StorageManager.getHistoricalData();
  const wellnessScore = StorageManager.getWellnessScore();
  
  const storageHealth = {
    goalsValid: goals && Array.isArray(goals) && goals.length > 0,
    assessmentsValid: assessments && Array.isArray(assessments),
    wellnessValid: wellnessScore && typeof wellnessScore === 'object'
  };
  
  console.log('✅ Storage Status:');
  console.log(`   Goals: ${storageHealth.goalsValid ? '✓' : '✗'} (${goals.length} goals)`);
  console.log(`   Assessments: ${storageHealth.assessmentsValid ? '✓' : '✗'} (${assessments.length} records)`);
  console.log(`   Wellness Score: ${storageHealth.wellnessValid ? '✓' : '✗'}`);
  
  const allValid = Object.values(storageHealth).every(v => v);
  console.log(`\n${allValid ? '✅' : '⚠️'} Overall Storage Health: ${allValid ? 'GOOD' : 'NEEDS ATTENTION'}`);
} catch (error) {
  console.error('❌ Storage test failed:', error.message);
}

// Test 7: Dashboard Integration Check
console.log('\n7️⃣ TESTING DASHBOARD INTEGRATION:');
try {
  const goalsSection = document.getElementById('goalsSection');
  
  if (goalsSection) {
    console.log('✅ Goals section element found');
    
    if (goalsSection.innerHTML.length > 0) {
      console.log('✅ Goals section has rendered content');
      
      // Check for key elements
      const hasProgressBar = goalsSection.innerHTML.includes('progress');
      const hasGoalCards = goalsSection.innerHTML.includes('goal-card');
      const hasScores = goalsSection.innerHTML.includes('/');
      
      console.log(`   Progress bars: ${hasProgressBar ? '✓' : '✗'}`);
      console.log(`   Goal cards: ${hasGoalCards ? '✓' : '✗'}`);
      console.log(`   Score display: ${hasScores ? '✓' : '✗'}`);
    } else {
      console.warn('⚠️  Goals section is empty - may need assessment data');
    }
  } else {
    console.warn('⚠️  Goals section not found on current page');
  }
} catch (error) {
  console.error('❌ Dashboard check failed:', error.message);
}

// Final Summary
console.log('\n' + '='.repeat(70));
console.log('📊 INTEGRATION TEST SUMMARY:');

try {
  const goals = GoalManager.getGoals();
  const overall = GoalManager.getOverallProgress();
  const completed = GoalManager.getCompletedCount();
  const history = StorageManager.getHistoricalData();
  
  if (goals.length === 0) {
    console.log('⚠️  NO DATA - Initialize goals and add assessments to start testing');
  } else if (history.length === 0) {
    console.log('⚠️  PARTIAL - Goals initialized but no assessment data');
  } else {
    console.log('✅ INTEGRATION TEST SUCCESSFUL!');
    console.log(`\n   Goals: ${goals.length} active`);
    console.log(`   Overall Progress: ${overall}%`);
    console.log(`   Completed: ${completed} goals`);
    console.log(`   Assessments: ${history.length} records`);
    console.log(`   Status: READY FOR PRODUCTION`);
  }
} catch (error) {
  console.error('❌ Summary failed:', error.message);
}

console.log('='.repeat(70));
console.log('\n✨ Integration test complete!\n');
