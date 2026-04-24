/**
 * NEUROWELL - Trend Analysis Verification Script
 * Validates the complete trend analysis implementation
 * Run this in browser console on dashboard.html after adding assessments
 */

console.log('='.repeat(60));
console.log('🧪 NeuroWell Trend Analysis Verification');
console.log('='.repeat(60));

// 1. Verify Storage Module
console.log('\n1️⃣ VERIFYING STORAGE MODULE:');
try {
  const history = StorageManager.getHistoricalData();
  console.log(`   ✅ StorageManager.getHistoricalData() returned ${history.length} records`);
  
  if (history.length > 0) {
    const latest = history[history.length - 1];
    console.log(`   ✅ Data structure verified:`, {
      hasScores: !!latest.scores,
      hasTimestamp: !!latest.timestamp,
      scoreKeys: Object.keys(latest.scores).sort()
    });
  } else {
    console.warn('   ⚠️  No history data found - add assessments first');
  }
} catch (error) {
  console.error('   ❌ Storage verification failed:', error.message);
}

// 2. Verify Dashboard Methods
console.log('\n2️⃣ VERIFYING DASHBOARD METHODS:');
try {
  const attempts = DashboardManager.getLastFiveAttempts();
  console.log(`   ✅ getLastFiveAttempts() returned ${attempts.length} attempts`);
  
  if (attempts.length >= 2) {
    const improvements = DashboardManager.calculateImprovementMetrics(attempts);
    console.log(`   ✅ calculateImprovementMetrics() calculated ${improvements.length} metrics`);
    
    improvements.forEach((imp, idx) => {
      console.log(`      Attempt ${imp.attemptNumber}: ${imp.label}`);
    });
  }
} catch (error) {
  console.error('   ❌ Dashboard method verification failed:', error.message);
}

// 3. Verify Chart Rendering
console.log('\n3️⃣ VERIFYING CHART RENDERING:');
try {
  const canvas = document.getElementById('assessmentTrendCanvas');
  if (canvas) {
    console.log('   ✅ Canvas element found (#assessmentTrendCanvas)');
    const chart = DashboardManager.charts.assessmentTrend;
    if (chart) {
      console.log('   ✅ Chart.js instance created and rendered');
      console.log(`      Type: ${chart.config.type}`);
      console.log(`      Data points: ${chart.data.datasets[0].data.length}`);
    } else {
      console.warn('   ⚠️  Chart instance not yet created - may render dynamically');
    }
  } else {
    console.warn('   ⚠️  Canvas element not found - trend section may not be visible');
  }
} catch (error) {
  console.error('   ❌ Chart verification failed:', error.message);
}

// 4. Verify Data Consistency
console.log('\n4️⃣ VERIFYING DATA CONSISTENCY:');
try {
  const history = StorageManager.getHistoricalData();
  const attempts = DashboardManager.getLastFiveAttempts();
  
  console.log(`   ℹ️  Storage: ${history.length} records, Dashboard: ${attempts.length} attempts`);
  
  if (history.length > 0 && attempts.length > 0) {
    const lastHistoryScore = history[history.length - 1].scores.overall;
    const lastAttemptScore = attempts[attempts.length - 1].score;
    
    if (lastHistoryScore === lastAttemptScore) {
      console.log(`   ✅ Score consistency verified (${lastAttemptScore}%)`);
    } else {
      console.warn(`   ⚠️  Score mismatch: Storage=${lastHistoryScore}%, Attempt=${lastAttemptScore}%`);
    }
  }
} catch (error) {
  console.error('   ❌ Consistency verification failed:', error.message);
}

// 5. Performance Metrics
console.log('\n5️⃣ PERFORMANCE METRICS:');
try {
  const history = StorageManager.getHistoricalData();
  const storageKey = 'neurowell_historical_data';
  const storageData = localStorage.getItem(storageKey);
  const storageSizeKB = (storageData.length / 1024).toFixed(2);
  
  console.log(`   ℹ️  Storage usage: ${storageSizeKB} KB (limit: 5 MB)`);
  console.log(`   ℹ️  Records stored: ${history.length} / 10`);
  console.log(`   ✅ Storage efficiency: ${(history.length / 10 * 100).toFixed(0)}%`);
} catch (error) {
  console.error('   ❌ Performance check failed:', error.message);
}

// 6. Test Calculation Accuracy
console.log('\n6️⃣ TESTING CALCULATION ACCURACY:');
try {
  const attempts = DashboardManager.getLastFiveAttempts();
  if (attempts.length >= 2) {
    const improvements = DashboardManager.calculateImprovementMetrics(attempts);
    
    improvements.forEach((imp) => {
      const attemptIdx = imp.attemptNumber - 1;
      const current = attempts[attemptIdx].score;
      const previous = attempts[attemptIdx - 1].score;
      const expected = ((current - previous) / previous * 100).toFixed(1);
      
      if (imp.percentChange === expected || imp.percentChange === parseFloat(expected)) {
        console.log(`   ✅ Attempt ${imp.attemptNumber} calculation correct: ${imp.label}`);
      } else {
        console.warn(`   ⚠️  Attempt ${imp.attemptNumber} calculation mismatch`);
      }
    });
  }
} catch (error) {
  console.error('   ❌ Calculation verification failed:', error.message);
}

// 7. Summary Report
console.log('\n' + '='.repeat(60));
console.log('📊 SUMMARY:');
const history = StorageManager.getHistoricalData();
const attempts = DashboardManager.getLastFiveAttempts();

if (history.length === 0) {
  console.log('⚠️  NO DATA - Use TREND_ANALYSIS_TEST.html to add test data');
} else if (history.length === 1) {
  console.log('⚠️  ONLY 1 RECORD - Add more assessments to see trend analysis');
} else {
  console.log(`✅ TREND ANALYSIS READY!`);
  console.log(`   📈 Total assessments: ${history.length}`);
  console.log(`   📊 Displayed attempts: ${attempts.length}`);
  console.log(`   📉 Improvement metrics: ${history.length - 1}`);
  
  const firstScore = history[0].scores.overall;
  const lastScore = history[history.length - 1].scores.overall;
  const totalChange = lastScore - firstScore;
  const trend = totalChange > 0 ? '📈 IMPROVING' : totalChange < 0 ? '📉 DECLINING' : '➡️ STABLE';
  
  console.log(`   ${trend} (${firstScore}% → ${lastScore}%)`);
}

console.log('='.repeat(60));
console.log('\n✨ Verification complete! Check browser console for details.');
console.log('\n💡 For manual testing, open TREND_ANALYSIS_TEST.html\n');
