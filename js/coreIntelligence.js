/**
 * NEUROWELL - Core Intelligence Module (CIM) Orchestrator
 * ────────────────────────────────────────────────────────
 * Single entry-point that runs the complete intelligence pipeline:
 *   1. Accept user input (sleep, screenTime, activity, stress)
 *   2. Compute wellness score
 *   3. Save to Digital Twin history
 *   4. Run prediction engine → risk assessment
 *   5. Run insights engine → smart insights
 *   6. Detect trend + project future
 *   7. Return unified CIMResult for UI rendering
 *
 * Dependencies (must be loaded before this file):
 *   utils.js, storage.js, scoring.js, analysis.js,
 *   wellnessPredictionEngine.js, insights.js, prediction.js
 */

const CoreIntelligenceModule = (() => {

  // ─── Internal score mapper ────────────────────────────────────────────────
  // Convert raw metric inputs to {physical, mental, emotional, overall} scores
  function _metricsToScores({ sleep, activity, stress, screenTime }) {
    // Sleep + Activity → Physical
    const sleepScore    = Math.min(100, Math.max(0, (sleep / 9) * 100));
    const activityScore = Math.min(100, Math.max(0, (activity / 10) * 100));
    const physical      = Math.round(sleepScore * 0.55 + activityScore * 0.45);

    // Stress + ScreenTime → Mental (inverted — lower stress/screen = higher score)
    const stressScore   = Math.min(100, Math.max(0, ((10 - stress) / 10) * 100));
    const screenScore   = Math.min(100, Math.max(0, ((12 - Math.min(12, screenTime)) / 12) * 100));
    const mental        = Math.round(stressScore * 0.65 + screenScore * 0.35);

    // Emotional estimated from stress + sleep balance
    const emotional = Math.round(
      stressScore * 0.50 +
      sleepScore  * 0.30 +
      activityScore * 0.20
    );

    const overall = Math.round(physical * 0.35 + mental * 0.35 + emotional * 0.30);

    return {
      physical:  Math.min(100, Math.max(0, physical)),
      mental:    Math.min(100, Math.max(0, mental)),
      emotional: Math.min(100, Math.max(0, emotional)),
      overall:   Math.min(100, Math.max(0, overall))
    };
  }

  // ─── Smart Insights Generator ─────────────────────────────────────────────
  // Generate rule-based insight messages from raw metrics
  function _generateSmartInsights({ sleep, activity, stress, screenTime }, scores) {
    const insights = [];

    // Sleep insights
    if (sleep < 6) {
      insights.push({
        type: 'warning', icon: '😴',
        title: 'Critical Sleep Deficit',
        message: `Only ${sleep}h of sleep. Your sleep is severely affecting your stress and cognitive performance.`,
        priority: 1
      });
    } else if (sleep < 7) {
      insights.push({
        type: 'info', icon: '🌙',
        title: 'Sleep Quality Alert',
        message: 'Your sleep is below optimal. This is likely affecting your stress levels and recovery.',
        priority: 2
      });
    }

    // Physical inactivity
    if (activity <= 3) {
      insights.push({
        type: 'warning', icon: '🪑',
        title: 'Physical Inactivity Detected',
        message: `Activity level of ${activity}/10 significantly limits your physical and mental recovery capacity.`,
        priority: 1
      });
    } else if (activity <= 5) {
      insights.push({
        type: 'info', icon: '🏃',
        title: 'Low Fitness Activity',
        message: 'Increasing your activity by even 2 points would meaningfully boost your mental health score.',
        priority: 3
      });
    }

    // Stress insights
    if (stress >= 8) {
      insights.push({
        type: 'warning', icon: '🚨',
        title: 'Critical Stress Level',
        message: `Stress at ${stress}/10 is dangerously high. Immediate intervention is strongly recommended.`,
        priority: 1
      });
    } else if (stress >= 6) {
      insights.push({
        type: 'warning', icon: '😰',
        title: 'High Stress Detected',
        message: `Stress at ${stress}/10 is elevated. Without action, this is likely to worsen over the coming weeks.`,
        priority: 2
      });
    }

    // Screen time
    if (screenTime >= 10) {
      insights.push({
        type: 'warning', icon: '📱',
        title: 'Excessive Screen Exposure',
        message: `${screenTime}h of screens per day is disrupting your melatonin, focus, and emotional regulation.`,
        priority: 2
      });
    } else if (screenTime >= 7) {
      insights.push({
        type: 'info', icon: '💻',
        title: 'High Screen Time',
        message: `${screenTime}h/day is approaching problematic levels. Apply the 20-20-20 rule and set a digital sunset.`,
        priority: 3
      });
    }

    // Compound pattern: sleep + stress
    if (sleep < 6.5 && stress >= 6) {
      insights.push({
        type: 'warning', icon: '🔄',
        title: 'Sleep–Stress Spiral Detected',
        message: 'Low sleep and high stress are amplifying each other. Breaking this cycle starts with consistent sleep.',
        priority: 1
      });
    }

    // Positive reinforcements
    if (sleep >= 7.5 && sleep <= 8.5) {
      insights.push({
        type: 'success', icon: '⭐',
        title: 'Excellent Sleep Duration',
        message: `${sleep}h of sleep is optimal. This is your strongest wellness pillar — protect it.`,
        priority: 4
      });
    }
    if (activity >= 8) {
      insights.push({
        type: 'success', icon: '💪',
        title: 'High Physical Activity',
        message: `Activity at ${activity}/10 is excellent. This significantly buffers your stress resilience.`,
        priority: 4
      });
    }
    if (stress <= 3) {
      insights.push({
        type: 'success', icon: '🧘',
        title: 'Well-Managed Stress',
        message: `Stress at ${stress}/10 is well-controlled. This is your biggest protective factor.`,
        priority: 4
      });
    }

    // Sort by priority (1 = most urgent)
    return insights.sort((a, b) => a.priority - b.priority);
  }

  // ─── Public API ───────────────────────────────────────────────────────────
  return {

    /**
     * Run the complete intelligence pipeline.
     *
     * @param {{ sleep:number, activity:number, stress:number, screenTime:number }} input
     * @returns {CIMResult} - Full intelligence report for UI rendering
     */
    run(input) {
      const { sleep = 7, activity = 5, stress = 4, screenTime = 4 } = input || {};
      const metrics = { sleep, activity, stress, screenTime };

      // 1. Compute composite wellness scores
      const scores = _metricsToScores(metrics);

      // 2. Run Wellness Prediction Engine
      let prediction = null;
      if (typeof WellnessPredictionEngine !== 'undefined') {
        try { prediction = WellnessPredictionEngine.predict(metrics); } catch (e) {
          console.warn('CIM: WellnessPredictionEngine failed', e);
        }
      }

      // 3. Save daily record to Digital Twin
      let savedToHistory = false;
      if (typeof AnalysisEngine !== 'undefined') {
        try {
          savedToHistory = AnalysisEngine.saveDailyRecord({
            score: scores.overall,
            scores,
            sleep, activity, stress, screenTime
          });
        } catch (e) { console.warn('CIM: AnalysisEngine.saveDailyRecord failed', e); }
      }

      // 4. Trend detection + future projection
      let trend = null, projection = null;
      if (typeof AnalysisEngine !== 'undefined') {
        try { trend      = AnalysisEngine.detectTrend(7);       } catch (e) {}
        try { projection = AnalysisEngine.projectFuture(30, 10); } catch (e) {}
      }

      // 5. Deep insights (InsightsEngine if available)
      let deepInsights = null;
      if (typeof InsightsEngine !== 'undefined') {
        try { deepInsights = InsightsEngine.analyze(scores); } catch (e) {
          console.warn('CIM: InsightsEngine failed', e);
        }
      }

      // 6. Smart insights (always available — rule-based)
      const smartInsights = _generateSmartInsights(metrics, scores);

      // 7. Historical summary stats
      let historySummary = null;
      if (typeof AnalysisEngine !== 'undefined') {
        try { historySummary = AnalysisEngine.getSummaryStats(); } catch (e) {}
      }

      // 8. Burnout risk (from existing ScoringEngine if available)
      let burnoutRisk = null;
      if (typeof ScoringEngine !== 'undefined') {
        try { burnoutRisk = ScoringEngine.calculateBurnoutRisk(scores); } catch (e) {}
      }
      if (burnoutRisk === null) {
        // Fallback formula
        burnoutRisk = Math.round(
          (100 - scores.mental)  * 0.50 +
          (100 - scores.physical)* 0.25 +
          (100 - scores.emotional)*0.25
        );
      }

      return {
        // Input
        metrics,

        // Scores
        scores,
        burnoutRisk,

        // Prediction
        prediction,

        // Trend + Projection
        trend,
        projection,

        // Insights
        smartInsights,
        deepInsights,

        // History
        savedToHistory,
        historySummary,

        // Meta
        generatedAt: new Date().toISOString(),
        version:     '2.0.0'
      };
    },

    /**
     * Load the latest stored state (for dashboard re-renders without re-input).
     * Pulls from Digital Twin history and re-runs the insight pipeline.
     *
     * @returns {CIMResult|null}
     */
    loadLatest() {
      try {
        if (typeof AnalysisEngine === 'undefined') return null;
        const recent = AnalysisEngine.getRecent(1);
        if (!recent || recent.length === 0) return null;

        const record  = recent[0];
        const metrics = {
          sleep:      record.sleep      || 7,
          activity:   record.activity   || 5,
          stress:     record.stress     || 4,
          screenTime: record.screenTime || 4
        };

        // Run pipeline from stored metrics
        const result = this.run(metrics);

        // Attach full history
        result.history = AnalysisEngine.getRecent(14);
        return result;
      } catch (e) {
        console.warn('CIM: loadLatest failed', e);
        return null;
      }
    },

    /**
     * Generate a demo/sample CIM result for first-time visitors.
     * @returns {CIMResult}
     */
    getDemoResult() {
      if (typeof AnalysisEngine !== 'undefined') {
        try { AnalysisEngine.seedSampleData(14); } catch (e) {}
      }

      const demoMetrics = { sleep: 6.2, activity: 4, stress: 7, screenTime: 8 };
      const result = this.run(demoMetrics);
      result.history  = typeof AnalysisEngine !== 'undefined'
        ? AnalysisEngine.getRecent(14) : [];
      result.isDemo   = true;
      return result;
    }
  };
})();
