/**
 * NEUROWELL - Prediction Module
 * Predicts burnout risk, stress trends, and wellness trajectory
 * Uses formula-based logic on current and historical data
 * No ML - purely statistical analysis
 */

const PredictionEngine = {
  /**
   * Predict 30-day wellness trajectory
   * @returns {object} Prediction data with chart points
   */
  predict30DayTrajectory: () => {
    const currentScore = StorageManager.getWellnessScore();
    const history = StorageManager.getHistoricalData();
    
    if (!currentScore) {
      return { error: 'No assessment data available' };
    }

    const scores = currentScore.scores;
    const predictions = [];

    // Calculate trend velocity from historical data
    let velocity = 0;
    if (history.length >= 2) {
      const recent = history[history.length - 1];
      const previous = history[history.length - 2];
      velocity = (recent.scores.overall - previous.scores.overall) / 
                 ((new Date(recent.timestamp) - new Date(previous.timestamp)) / (1000 * 60 * 60 * 24));
    }

    // Generate 30-day predictions (daily for display)
    for (let day = 0; day <= 30; day++) {
      const predictedScore = Math.min(
        100,
        Math.max(0, scores.overall + (velocity * day * 0.7)) // 0.7 smoothing factor
      );

      predictions.push({
        day: day,
        date: new Date(Date.now() + day * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        score: Math.round(predictedScore)
      });
    }

    return {
      current: scores.overall,
      predictions: predictions,
      trend: velocity > 2 ? 'improving' : velocity < -2 ? 'declining' : 'stable',
      predictedScore30Days: Math.round(predictions[30].score)
    };
  },

  /**
   * Calculate advanced burnout risk metrics
   * @returns {object} Detailed burnout analysis
   */
  calculateAdvancedBurnoutMetrics: () => {
    const currentScore = StorageManager.getWellnessScore();
    const history = StorageManager.getHistoricalData();
    
    if (!currentScore) {
      return null;
    }

    const scores = currentScore.scores;
    const burnoutRisk = ScoringEngine.calculateBurnoutRisk(scores);

    // Calculate consistency (standard deviation of recent scores)
    let consistency = 0;
    if (history.length > 1) {
      const recentScores = history.slice(-4).map(h => h.scores.overall);
      const mean = recentScores.reduce((a, b) => a + b) / recentScores.length;
      const squaredDifferences = recentScores.map(score => Math.pow(score - mean, 2));
      const variance = squaredDifferences.reduce((a, b) => a + b) / recentScores.length;
      consistency = Math.sqrt(variance);
    }

    // Calculate recovery potential (ability to improve)
    const recoveryPotential = Math.min(100, Math.max(0, 
      scores.physical + scores.mental + scores.emotional 
      - 3 * burnoutRisk / 100
    )) / 3;

    // Risk factors summary
    const riskFactors = [];
    if (scores.mental < 40) riskFactors.push('High stress levels');
    if (scores.physical < 40) riskFactors.push('Poor physical health');
    if (scores.emotional < 40) riskFactors.push('Emotional distress');
    if (burnoutRisk > 70) riskFactors.push('Critical burnout risk');

    // Protective factors
    const protectiveFactors = [];
    if (scores.emotional > 70) protectiveFactors.push('Strong emotional resilience');
    if (scores.physical > 70) protectiveFactors.push('Good physical health');
    if (scores.mental > 70) protectiveFactors.push('Healthy stress management');

    return {
      burnoutRisk: burnoutRisk,
      consistency: Math.round(consistency * 10) / 10,
      recoveryPotential: Math.round(recoveryPotential),
      riskFactors: riskFactors,
      protectiveFactors: protectiveFactors,
      riskLevel: burnoutRisk > 70 ? 'CRITICAL' : burnoutRisk > 50 ? 'HIGH' : burnoutRisk > 30 ? 'MODERATE' : 'LOW',
      recommendation: PredictionEngine.getRiskRecommendation(burnoutRisk, riskFactors)
    };
  },

  /**
   * Get personalized risk recommendation
   * @param {number} burnoutRisk - Risk percentage
   * @param {array} riskFactors - List of risk factors
   * @returns {string} Recommendation text
   */
  getRiskRecommendation: (burnoutRisk, riskFactors) => {
    if (burnoutRisk > 70) {
      return 'URGENT: Consider seeking professional support immediately. Take time off if possible.';
    } else if (burnoutRisk > 50) {
      return 'Your burnout risk is elevated. Implement stress management immediately and monitor closely.';
    } else if (burnoutRisk > 30) {
      return 'You show signs of moderate burnout risk. Increase wellness activities and work-life balance.';
    } else {
      return 'Your burnout risk is manageable. Continue healthy habits and regular monitoring.';
    }
  },

  /**
   * Predict weekly wellness score
   * @returns {object} Weekly prediction with confidence
   */
  predictWeeklyWellness: () => {
    const trajectory = PredictionEngine.predict30DayTrajectory();
    if (trajectory.error) return trajectory;

    return {
      thisWeek: {
        average: Math.round(trajectory.predictions.slice(0, 7).reduce((a, b) => a + b.score, 0) / 7),
        trend: trajectory.trend,
        confidence: 85
      },
      nextWeek: {
        average: Math.round(trajectory.predictions.slice(7, 14).reduce((a, b) => a + b.score, 0) / 7),
        trend: trajectory.trend,
        confidence: 75
      },
      twoWeeks: {
        average: Math.round(trajectory.predictions.slice(14, 21).reduce((a, b) => a + b.score, 0) / 7),
        trend: trajectory.trend,
        confidence: 60
      }
    };
  },

  /**
   * Get early warning signals
   * @returns {object} Warning indicators
   */
  getEarlyWarningSignals: () => {
    const currentScore = StorageManager.getWellnessScore();
    const history = StorageManager.getHistoricalData();
    
    const warnings = {
      signals: [],
      severityLevel: 'LOW',
      actionRequired: false
    };

    if (!currentScore) return warnings;

    const scores = currentScore.scores;

    // Check for rapid decline
    if (history.length >= 2) {
      const recent = history[history.length - 1];
      const previous = history[history.length - 2];
      const decline = previous.scores.overall - recent.scores.overall;

      if (decline > 20) {
        warnings.signals.push({
          type: 'RAPID_DECLINE',
          message: `Wellness score dropped ${decline} points since last assessment`,
          severity: 'HIGH'
        });
        warnings.actionRequired = true;
      }
    }

    // Check for critical category scores
    if (scores.mental < 30) {
      warnings.signals.push({
        type: 'CRITICAL_MENTAL_HEALTH',
        message: 'Mental health score critically low - seek professional help',
        severity: 'CRITICAL'
      });
      warnings.actionRequired = true;
      warnings.severityLevel = 'CRITICAL';
    }

    if (scores.physical < 30) {
      warnings.signals.push({
        type: 'CRITICAL_PHYSICAL_HEALTH',
        message: 'Physical health critically impacted - address sleep and exercise',
        severity: 'HIGH'
      });
      warnings.actionRequired = true;
    }

    if (scores.emotional < 30) {
      warnings.signals.push({
        type: 'CRITICAL_EMOTIONAL_STATE',
        message: 'Emotional wellbeing at risk - reach out for support',
        severity: 'HIGH'
      });
      warnings.actionRequired = true;
    }

    // Check for sustained low scores
    if (scores.overall < 40) {
      warnings.signals.push({
        type: 'SUSTAINED_LOW_WELLNESS',
        message: 'Overall wellness is low - consider comprehensive intervention',
        severity: 'HIGH'
      });
      warnings.actionRequired = true;
    }

    // Update severity level if not already critical
    if (warnings.severityLevel !== 'CRITICAL') {
      warnings.severityLevel = warnings.signals.some(s => s.severity === 'HIGH') ? 'HIGH' : 'MEDIUM';
    }

    return warnings;
  },

  /**
   * Simulate future scenarios
   * @param {object} interventions - Hypothetical improvements {physical, mental, emotional}
   * @returns {object} Projected improvement scenarios
   */
  simulateImprovementScenarios: (interventions = {}) => {
    const currentScore = StorageManager.getWellnessScore();
    if (!currentScore) return null;

    const current = currentScore.scores;

    // Scenario 1: No change
    const scenario1 = {
      name: 'No Change',
      projection: current.overall,
      timeframe: '30 days'
    };

    // Scenario 2: Moderate improvements
    const scenario2 = {
      name: 'Moderate Improvements',
      scores: {
        physical: Math.min(100, current.physical + (interventions.physical || 5)),
        mental: Math.min(100, current.mental + (interventions.mental || 8)),
        emotional: Math.min(100, current.emotional + (interventions.emotional || 5))
      },
      timeframe: '30 days',
      projection: Math.round(
        (Math.min(100, current.physical + 5) * 0.35 +
         Math.min(100, current.mental + 8) * 0.35 +
         Math.min(100, current.emotional + 5) * 0.30)
      )
    };

    // Scenario 3: Aggressive improvements
    const scenario3 = {
      name: 'Aggressive Wellness Program',
      scores: {
        physical: Math.min(100, current.physical + (interventions.physical || 15)),
        mental: Math.min(100, current.mental + (interventions.mental || 20)),
        emotional: Math.min(100, current.emotional + (interventions.emotional || 15))
      },
      timeframe: '60 days',
      projection: Math.round(
        (Math.min(100, current.physical + 15) * 0.35 +
         Math.min(100, current.mental + 20) * 0.35 +
         Math.min(100, current.emotional + 15) * 0.30)
      )
    };

    return {
      current: current.overall,
      scenarios: [scenario1, scenario2, scenario3],
      recommendation: scenario3.projection - current.overall > 15 
        ? 'Consider an aggressive wellness program for significant improvement'
        : 'Implement moderate improvements for sustainable growth'
    };
  },

  /**
   * Get wellness trajectory chart data
   * @returns {object} Chart-ready data
   */
  getTrajectoryChartData: () => {
    const trajectory = PredictionEngine.predict30DayTrajectory();
    const history = StorageManager.getHistoricalData();

    if (trajectory.error) return null;

    // Combine historical and predicted data
    const chartData = {
      historical: history.map((h, idx) => ({
        label: `${idx + 1}`,
        value: h.scores.overall,
        date: new Date(h.timestamp).toLocaleDateString()
      })),
      predicted: trajectory.predictions.map(p => ({
        label: `Day ${p.day}`,
        value: p.score,
        date: p.date,
        isPredicted: true
      }))
    };

    return {
      labels: [...chartData.historical, ...chartData.predicted].map(d => d.date),
      data: [...chartData.historical, ...chartData.predicted].map(d => d.value),
      historical: chartData.historical.length,
      predicted: chartData.predicted.length
    };
  }
};
