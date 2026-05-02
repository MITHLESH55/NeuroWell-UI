/**
 * NEUROWELL - Wellness Prediction Engine v2
 * ─────────────────────────────────────────
 * Accepts direct metric inputs (sleep, screenTime, activity, stress)
 * and produces a structured risk prediction object.
 *
 * Architecture: Pure rule-based logic — each rule is a named, testable
 * function. The RULE_REGISTRY makes this trivially extensible for ML output.
 *
 * Key design principles:
 *   • No side-effects — pure functions only
 *   • Every rule is independently testable
 *   • Output schema is stable (safe for ML upgrade)
 *   • Confidence scores prepare for probabilistic ML output
 */

const WellnessPredictionEngine = (() => {

  // ─── Constants ────────────────────────────────────────────────────────────────

  /** Reference population benchmarks (for normalisation) */
  const BENCHMARKS = {
    sleep:      { ideal: 7.5, min: 6,  max: 9  },
    activity:   { ideal: 7,   min: 5,  max: 10 },
    stress:     { ideal: 3,   min: 0,  max: 10 },  // lower is better
    screenTime: { ideal: 3,   min: 0,  max: 16 }   // lower is better
  };

  /** Risk level definitions */
  const RISK_LEVELS = {
    CRITICAL: { label: 'Critical Risk',  color: '#ef4444', bg: 'rgba(239,68,68,0.12)',  icon: '🚨', score: 0  },
    HIGH:     { label: 'High Risk',      color: '#f97316', bg: 'rgba(249,115,22,0.12)', icon: '⚠️', score: 25 },
    MODERATE: { label: 'Moderate Risk',  color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', icon: '⚡', score: 50 },
    LOW:      { label: 'Low Risk',       color: '#10b981', bg: 'rgba(16,185,129,0.12)', icon: '✅', score: 75 },
    NONE:     { label: 'No Significant Risk', color: '#6366f1', bg: 'rgba(99,102,241,0.12)', icon: '🌟', score: 100 }
  };

  // ─── Normalisation helpers ────────────────────────────────────────────────────

  /**
   * Normalise a metric to a 0–100 scale.
   * For "higher-is-better" metrics (sleep, activity).
   * For "lower-is-better" metrics (stress, screenTime), invert.
   */
  function _normalise(value, benchmark, invert = false) {
    const range  = benchmark.max - benchmark.min;
    const raw    = Math.min(benchmark.max, Math.max(benchmark.min, value));
    const scaled = ((raw - benchmark.min) / range) * 100;
    return invert ? 100 - scaled : scaled;
  }

  /** Clamp to [0, 100] */
  const _clamp = (v) => Math.min(100, Math.max(0, Math.round(v)));

  // ─── Domain Score Calculators ─────────────────────────────────────────────────

  /**
   * Sleep Health Score (0–100).
   * Optimal 7–8 h, penalties for both extremes.
   */
  function _sleepScore(hours) {
    if (hours >= 7 && hours <= 8.5) return 100;
    if (hours >= 6 && hours < 7)   return 70 + (hours - 6) * 30;
    if (hours > 8.5 && hours <= 9.5) return 100 - (hours - 8.5) * 20;
    if (hours < 6)  return Math.max(0, 50 - (6 - hours) * 20);
    return Math.max(0, 80 - (hours - 9.5) * 25); // excessive sleep
  }

  /**
   * Physical Activity Score (0–100).
   * Scale: 1–10 self-reported level.
   */
  function _activityScore(level) {
    return _clamp(_normalise(level, BENCHMARKS.activity));
  }

  /**
   * Stress Score (0–100) — 100 = no stress, 0 = extreme stress.
   * Input: 1–10 self-reported stress.
   */
  function _stressScore(level) {
    return _clamp(_normalise(level, BENCHMARKS.stress, true));
  }

  /**
   * Screen Time Score (0–100) — 100 = minimal screens, 0 = excessive.
   * Input: hours per day.
   */
  function _screenScore(hours) {
    return _clamp(_normalise(hours, BENCHMARKS.screenTime, true));
  }

  // ─── Risk Rule Registry ───────────────────────────────────────────────────────
  // Each rule is independently testable. Add new rules here without touching callers.

  const RISK_RULES = [
    // ── Sleep risks ──────────────────────────────────────────────────
    {
      id:       'sleep_deprivation',
      label:    'Sleep Deprivation Risk',
      category: 'sleep',
      icon:     '😴',
      check:    ({ sleep }) => sleep < 6,
      severity: ({ sleep }) => sleep < 5 ? 'CRITICAL' : 'HIGH',
      message:  ({ sleep }) =>
        `Getting only ${sleep}h of sleep increases cortisol by up to 37% and significantly impairs cognitive function.`,
      advice: 'Prioritise 7–8 hours of sleep. Start with a consistent bedtime 30 minutes earlier than usual.'
    },
    {
      id:       'sleep_excess',
      label:    'Excessive Sleep Risk',
      category: 'sleep',
      icon:     '🛌',
      check:    ({ sleep }) => sleep > 9.5,
      severity: () => 'MODERATE',
      message:  ({ sleep }) =>
        `Sleeping ${sleep}h may indicate fatigue, depression, or thyroid issues. Over-sleeping reduces sleep drive for the next night.`,
      advice: 'Aim for 7–9 hours. A sleep schedule check with a specialist is advisable if this is chronic.'
    },

    // ── Stress risks ──────────────────────────────────────────────────
    {
      id:       'high_stress',
      label:    'High Stress Risk',
      category: 'stress',
      icon:     '😰',
      check:    ({ stress }) => stress >= 7,
      severity: ({ stress }) => stress >= 9 ? 'CRITICAL' : 'HIGH',
      message:  ({ stress }) =>
        `Stress level of ${stress}/10 is dangerously high. Chronic elevated cortisol damages cardiovascular, immune, and cognitive systems.`,
      advice: 'Implement immediate stress reduction: 10-min daily meditation, digital detox periods, and identify top stressors to reduce.'
    },
    {
      id:       'moderate_stress',
      label:    'Moderate Stress Risk',
      category: 'stress',
      icon:     '⚡',
      check:    ({ stress }) => stress >= 5 && stress < 7,
      severity: () => 'MODERATE',
      message:  ({ stress }) =>
        `Sustained stress at ${stress}/10 accumulates. Without intervention, moderate stress often escalates into burnout within 3–6 months.`,
      advice: 'Schedule regular recovery time. Try the 4-7-8 breathing technique when stress spikes occur.'
    },

    // ── Activity risks ────────────────────────────────────────────────
    {
      id:       'sedentary',
      label:    'Physical Inactivity Risk',
      category: 'activity',
      icon:     '🪑',
      check:    ({ activity }) => activity <= 3,
      severity: ({ activity }) => activity <= 1 ? 'HIGH' : 'MODERATE',
      message:  ({ activity }) =>
        `Physical activity of ${activity}/10 is very low. Sedentary behaviour is a top-5 risk factor for chronic disease, independent of other lifestyle factors.`,
      advice: 'Start with 10-minute walks. Even minimal movement (vs. zero) produces significant health benefits within 2 weeks.'
    },
    {
      id:       'low_activity',
      label:    'Low Fitness Risk',
      category: 'activity',
      icon:     '🏃',
      check:    ({ activity }) => activity > 3 && activity <= 5,
      severity: () => 'LOW',
      message:  ({ activity }) =>
        `Activity at ${activity}/10 is below the recommended level. Increasing this by just 2 points significantly reduces mental health risks.`,
      advice: 'Add a 20-minute walk 3× per week. Pair with your existing routine for habit anchoring.'
    },

    // ── Screen time risks ─────────────────────────────────────────────
    {
      id:       'high_screen_time',
      label:    'Digital Overexposure Risk',
      category: 'screenTime',
      icon:     '📱',
      check:    ({ screenTime }) => screenTime >= 8,
      severity: ({ screenTime }) => screenTime >= 12 ? 'HIGH' : 'MODERATE',
      message:  ({ screenTime }) =>
        `${screenTime}h of screen time disrupts melatonin production, strains the visual system, and fragments attention. Mental health impact is well-established.`,
      advice: 'Apply the 20-20-20 rule. No screens 1 hour before bed. Use app timers to enforce daily limits.'
    },
    {
      id:       'moderate_screen',
      label:    'Moderate Screen Exposure',
      category: 'screenTime',
      icon:     '💻',
      check:    ({ screenTime }) => screenTime >= 5 && screenTime < 8,
      severity: () => 'LOW',
      message:  ({ screenTime }) =>
        `${screenTime}h of screen time is approaching the threshold where cognitive fatigue accumulates.`,
      advice: 'Take 5-minute screen breaks every 60 minutes and avoid screens in the final 30 minutes before sleep.'
    },

    // ── Combined / compounding risks ──────────────────────────────────
    {
      id:       'stress_sleep_combo',
      label:    'Stress–Sleep Spiral Risk',
      category: 'compound',
      icon:     '😴→😰',
      check:    ({ sleep, stress }) => sleep < 7 && stress >= 6,
      severity: ({ sleep, stress }) => (sleep < 6 && stress >= 8) ? 'CRITICAL' : 'HIGH',
      message:  ({ sleep, stress }) =>
        `Poor sleep (${sleep}h) combined with high stress (${stress}/10) creates a dangerous feedback loop: sleep deprivation raises cortisol, which further disrupts sleep.`,
      advice: 'Fix sleep first — it has cascade benefits for stress. Start a consistent wind-down routine and reduce evening stimulation.'
    },
    {
      id:       'screen_stress_combo',
      label:    'Digital–Stress Compounding Risk',
      category: 'compound',
      icon:     '📱→🧠',
      check:    ({ screenTime, stress }) => screenTime >= 7 && stress >= 6,
      severity: () => 'MODERATE',
      message:  ({ screenTime, stress }) =>
        `High screen time (${screenTime}h) and elevated stress (${stress}/10) often form a dependency cycle: stress drives screen use, screens amplify cortisol.`,
      advice: 'Implement a daily digital sunset: no screens after 8 PM. Replace with a 15-minute outdoor walk.'
    },
    {
      id:       'inactivity_stress_combo',
      label:    'Sedentary Stress Amplification Risk',
      category: 'compound',
      icon:     '🪑→😰',
      check:    ({ activity, stress }) => activity <= 4 && stress >= 6,
      severity: () => 'MODERATE',
      message:  ({ activity, stress }) =>
        `Low physical activity (${activity}/10) removes your most effective stress buffer. Exercise is as effective as medication for anxiety in most cases.`,
      advice: 'A 20-min brisk walk lowers cortisol within hours. Schedule it as a non-negotiable daily appointment.'
    },
    {
      id:       'all_dimension_risk',
      label:    'All-Dimension Wellness Risk',
      category: 'compound',
      icon:     '🔄',
      check:    ({ sleep, activity, stress, screenTime }) =>
        sleep < 6.5 && activity <= 4 && stress >= 6 && screenTime >= 6,
      severity: () => 'CRITICAL',
      message:  () =>
        'All four wellness metrics are in concerning ranges simultaneously. This compounding pattern significantly elevates burnout and chronic disease risk.',
      advice: 'Focus on ONE change at a time: sleep is highest leverage. Achieve consistent 7-hour nights for 5 days, then layer the next habit.'
    }
  ];

  // ─── Wellness Score Calculator ────────────────────────────────────────────────

  /**
   * Calculate a composite wellness score from raw metrics.
   * Weighted: sleep (30%), activity (25%), stress (30%), screenTime (15%)
   *
   * @param {{ sleep, activity, stress, screenTime }} metrics
   * @returns {number} 0–100
   */
  function _calculateWellnessScore({ sleep, activity, stress, screenTime }) {
    const s  = _sleepScore(sleep)    * 0.30;
    const a  = _activityScore(activity) * 0.25;
    const st = _stressScore(stress)  * 0.30;
    const sc = _screenScore(screenTime) * 0.15;
    return _clamp(s + a + st + sc);
  }

  /**
   * Determine overall risk level from detected risks.
   */
  function _overallRiskLevel(risks) {
    const ORDER = ['CRITICAL', 'HIGH', 'MODERATE', 'LOW', 'NONE'];
    const highest = risks.reduce((acc, r) => {
      const ai = ORDER.indexOf(acc);
      const ri = ORDER.indexOf(r.severity);
      return ri < ai ? r.severity : acc;
    }, 'NONE');
    return highest;
  }

  // ─── Public API ───────────────────────────────────────────────────────────────
  return {
    RISK_LEVELS,
    RISK_RULES,

    /**
     * Run full wellness prediction from raw metric inputs.
     *
     * @param {{ sleep:number, activity:number, stress:number, screenTime:number }} metrics
     * @returns {PredictionResult}
     *
     * PredictionResult:
     *   { metrics, scores, overallScore, riskLevel, risks, topRisk,
     *     summary, recommendations, mlReady }
     */
    predict(metrics) {
      const { sleep = 7, activity = 5, stress = 4, screenTime = 4 } = metrics || {};

      // Domain scores
      const scores = {
        sleep:      _clamp(_sleepScore(sleep)),
        activity:   _clamp(_activityScore(activity)),
        stress:     _clamp(_stressScore(stress)),
        screenTime: _clamp(_screenScore(screenTime))
      };

      // Overall wellness score
      const overallScore = _calculateWellnessScore({ sleep, activity, stress, screenTime });

      // Run risk rules
      const risks = RISK_RULES
        .filter(rule => {
          try { return rule.check({ sleep, activity, stress, screenTime }); } catch { return false; }
        })
        .map(rule => ({
          id:       rule.id,
          label:    rule.label,
          category: rule.category,
          icon:     rule.icon,
          severity: rule.severity({ sleep, activity, stress, screenTime }),
          message:  rule.message({ sleep, activity, stress, screenTime }),
          advice:   rule.advice
        }))
        // Sort: CRITICAL → HIGH → MODERATE → LOW
        .sort((a, b) => ['CRITICAL','HIGH','MODERATE','LOW','NONE'].indexOf(a.severity)
                      - ['CRITICAL','HIGH','MODERATE','LOW','NONE'].indexOf(b.severity));

      // Overall risk level
      const riskLevelKey = _overallRiskLevel(risks);
      const riskLevel    = RISK_LEVELS[riskLevelKey] || RISK_LEVELS.NONE;
      const topRisk      = risks[0] || null;

      // Human-readable summary
      const summary = risks.length === 0
        ? 'Your wellness metrics look great! Keep up the excellent habits.'
        : topRisk
        ? `Primary concern: ${topRisk.label}. ${risks.length > 1 ? `${risks.length - 1} additional risk(s) detected.` : ''}`
        : 'Some wellness risks detected. Review recommendations below.';

      // Aggregated recommendations (unique advice, prioritised)
      const recommendations = risks.map(r => ({
        priority: r.severity,
        category: r.category,
        icon:     r.icon,
        advice:   r.advice
      }));

      // ML-ready feature vector (extend when integrating a model)
      const mlReady = {
        features: {
          sleep_hours:        sleep,
          activity_level:     activity,
          stress_level:       stress,
          screen_time_hours:  screenTime,
          sleep_score_norm:   scores.sleep / 100,
          activity_score_norm:scores.activity / 100,
          stress_score_norm:  scores.stress / 100,
          screen_score_norm:  scores.screenTime / 100,
          wellness_score_norm:overallScore / 100
        },
        labelHint: riskLevelKey,
        // When ML model is integrated, replace ruleBasedRisk with model output:
        ruleBasedRisk: riskLevelKey
      };

      return {
        metrics:      { sleep, activity, stress, screenTime },
        scores,
        overallScore,
        riskLevelKey,
        riskLevel,
        risks,
        topRisk,
        riskCount:    risks.length,
        summary,
        recommendations,
        generatedAt:  new Date().toISOString(),
        mlReady
      };
    },

    /**
     * Predict from stored check-in data (auto-fetch from StorageManager).
     * Falls back to demo values if no check-in data is available.
     *
     * @returns {PredictionResult}
     */
    predictFromStoredData() {
      let sleep = 7, activity = 5, stress = 5, screenTime = 4;

      // Try to pull from recent check-ins
      try {
        if (typeof CheckinManager !== 'undefined' && CheckinManager.getRecent) {
          const recent = CheckinManager.getRecent(3);
          if (recent && recent.length > 0) {
            const avg = (arr, key) => {
              const vals = arr.map(x => x[key]).filter(v => typeof v === 'number');
              return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
            };
            const moodAvg   = avg(recent, 'mood');
            const sleepAvg  = avg(recent, 'sleep');
            const energyAvg = avg(recent, 'energy');

            // Map check-in scale to prediction engine scale
            if (sleepAvg  !== null) sleep    = _clamp(sleepAvg  * 9 / 10, 0, 12);   // 0–10 → hours
            if (moodAvg   !== null) stress   = _clamp(6 - moodAvg, 0, 10);            // mood 1–5 → stress inverted
            if (energyAvg !== null) activity = _clamp(energyAvg, 0, 10);
          }
        }
      } catch (e) {
        console.warn('WellnessPredictionEngine: check-in fetch failed', e);
      }

      // Try wellness score for additional calibration
      try {
        if (typeof StorageManager !== 'undefined') {
          const ws = StorageManager.getWellnessScore();
          if (ws && ws.scores) {
            const mentalScore  = ws.scores.mental || 50;
            const physicalScore= ws.scores.physical || 50;
            // Calibrate stress from mental score (inverse)
            stress   = _clamp(Math.round((100 - mentalScore) / 10));
            activity = _clamp(Math.round(physicalScore / 10));
          }
        }
      } catch (e) {}

      return this.predict({ sleep, activity, stress, screenTime });
    },

    /**
     * Get a quick risk label for a given set of scores (used by dashboard cards).
     * @param {{ sleep, activity, stress, screenTime }} metrics
     * @returns {{ label:string, color:string, icon:string }}
     */
    getQuickRisk(metrics) {
      const result = this.predict(metrics);
      return {
        label: result.riskLevel.label,
        color: result.riskLevel.color,
        icon:  result.riskLevel.icon,
        score: result.overallScore
      };
    },

    /** Expose score calculators for unit testing */
    _internal: { _sleepScore, _activityScore, _stressScore, _screenScore, _calculateWellnessScore }
  };
})();
