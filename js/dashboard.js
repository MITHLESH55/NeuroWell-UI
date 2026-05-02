/**
 * NEUROWELL - Dashboard Module
 * Displays wellness scores, charts, and performance metrics
 * Uses Chart.js for visualizations
 */

const DashboardManager = {
  charts: {},

  /**
   * Initialize dashboard
   */
  init: async () => {
    console.log('📊 Initializing Dashboard...');

    // Safely show loader
    try {
      if (typeof AppManager !== 'undefined' && AppManager.showLoader) {
        AppManager.showLoader('Loading Dashboard', 'Fetching your wellness data...');
      }
    } catch (_) {}

    try {
      // Render welcome section (safe even without auth)
      DashboardManager.renderWelcomeSection();

      let scoreReport = null;
      let isDemo = false;

      // 1. Try backend API
      try {
        if (typeof APIService !== 'undefined' && APIService.loadLatestAssessment) {
          scoreReport = await APIService.loadLatestAssessment();
        }
      } catch (apiErr) {
        console.warn('⚠️ Backend unavailable, falling back to localStorage:', apiErr.message);
      }

      // 2. Try localStorage via central utility
      if (!scoreReport) {
        const assessmentData = (typeof NeuroUtils !== 'undefined')
          ? NeuroUtils.getAssessmentData()
          : null;
        if (assessmentData) {
          scoreReport = assessmentData.scoreReport;
          isDemo = assessmentData.isDemo || false;
        }
      }

      // 3. No data at all — show actionable empty state
      if (!scoreReport) {
        DashboardManager.showNoDataView();
        try { if (typeof AppManager !== 'undefined') AppManager.hideLoader(); } catch (_) {}
        return;
      }

      // Show demo banner if running without real data
      if (isDemo && typeof NeuroUtils !== 'undefined') {
        NeuroUtils.showDemoBanner();
      }

      // Render each section in its own try-catch to prevent cascade failures
      const renderSteps = [
        ['CircularProgress',        () => DashboardManager.renderCircularProgress(scoreReport)],
        ['ScoreInsights',           () => DashboardManager.renderScoreInsights(scoreReport)],
        ['OverviewCards',           () => DashboardManager.renderOverviewCards(scoreReport)],
        ['IntelligentInsights',     () => DashboardManager.renderIntelligentInsights(scoreReport)],
        ['CategoryChart',           () => DashboardManager.renderCategoryChart(scoreReport)],
        ['BurnoutGaugeSpeedometer', () => DashboardManager.renderBurnoutGaugeSpeedometer(scoreReport)],
        ['WellnessProjection',      () => DashboardManager.renderWellnessProjection()],
        ['AssessmentTrendAnalysis', () => DashboardManager.renderAssessmentTrendAnalysis(scoreReport)],
        ['TrendChart',              () => DashboardManager.renderTrendChart(scoreReport)],
        ['CheckinWidget',           () => DashboardManager.renderCheckinWidget()],
      ];

      for (const [stepName, fn] of renderSteps) {
        try {
          fn();
        } catch (stepErr) {
          console.error(`❌ Dashboard render step [${stepName}] failed:`, stepErr);
        }
      }

      try { if (typeof AppManager !== 'undefined') AppManager.hideLoader(); } catch (_) {}
      console.log('✅ Dashboard Ready');

    } catch (fatalErr) {
      console.error('❌ Dashboard fatal error:', fatalErr);
      try { if (typeof AppManager !== 'undefined') AppManager.hideLoader(); } catch (_) {}

      if (typeof NeuroUtils !== 'undefined') {
        NeuroUtils.showUIError(
          'Something went wrong loading your dashboard. Please refresh the page or <a href="assessment.html" style="color:#a78bfa;">retake the assessment</a>.',
          'dashboardContainer',
          { type: 'error' }
        );
      } else {
        const container = document.getElementById('dashboardContainer');
        if (container) {
          container.innerHTML = `
            <div style="text-align:center;padding:3rem;color:#f1f5f9;">
              <div style="font-size:3rem;">⚠️</div>
              <h3 style="margin:1rem 0;">Dashboard temporarily unavailable</h3>
              <p>Please <a href="assessment.html" style="color:#a78bfa;">retake the assessment</a> or refresh the page.</p>
            </div>`;
        }
      }
    }
  },

  /**
   * Render welcome section with user greeting
   */
  renderWelcomeSection: () => {
    try {
      if (typeof AuthManager === 'undefined' || !AuthManager.getCurrentUser) return;
      const user = AuthManager.getCurrentUser();
      const header = document.querySelector('.page-header');
      if (header && user && user.fullName) {
        const greeting = `Welcome, ${user.fullName}! 👋`;
        header.innerHTML = `
          <h1>${greeting}</h1>
          <p>Track your wellness scores, trends, and burnout risk</p>
        `;
      }
    } catch (err) {
      console.error('❌ renderWelcomeSection failed:', err);
    }
  },

  /**
   * Show no data view
   */
  showNoDataView: () => {
    const container = document.getElementById('dashboardContainer');
    if (!container) return;

    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📊</div>
        <h3>No Assessment Data</h3>
        <p>Complete an assessment to see your wellness dashboard.</p>
        <a href="assessment.html" class="btn btn-primary">Start Assessment</a>
      </div>
    `;
  },

  /**
   * Render overview cards
   */
  renderOverviewCards: (report) => {
    const container = document.getElementById('overviewCards');
    if (!container) return;

    const { scores, statuses } = report;

    const cards = [
      {
        label: 'Overall Wellness',
        value: scores.overall,
        status: statuses.overall,
        icon: '🎯'
      },
      {
        label: 'Physical Health',
        value: scores.physical,
        status: statuses.physical,
        icon: '💪'
      },
      {
        label: 'Mental Health',
        value: scores.mental,
        status: statuses.mental,
        icon: '🧠'
      },
      {
        label: 'Emotional Wellness',
        value: scores.emotional,
        status: statuses.emotional,
        icon: '❤️'
      }
    ];

    let html = '<div class="grid grid-4">';

    cards.forEach(card => {
      html += `
        <div class="stat-card" data-animate>
          <div style="font-size: 2rem; margin-bottom: 0.5rem;">${card.icon}</div>
          <div class="stat-value" style="color: ${card.status.color}">
            ${card.value}%
          </div>
          <div class="stat-label">${card.label}</div>
          <div class="stat-change positive">${card.status.label}</div>
        </div>
      `;
    });

    html += '</div>';
    container.innerHTML = html;
  },

  /**
   * Render category breakdown
   */
  renderCategoryBreakdown: (report) => {
    const container = document.getElementById('categoryBreakdown');
    if (!container) return;

    const { scores, statuses } = report;
    const categories = [
      { name: 'Physical', score: scores.physical, status: statuses.physical },
      { name: 'Mental', score: scores.mental, status: statuses.mental },
      { name: 'Emotional', score: scores.emotional, status: statuses.emotional }
    ];

    let html = '<div class="category-breakdown">';

    categories.forEach(cat => {
      html += `
        <div class="category-item" data-animate>
          <div class="category-name">${cat.name}</div>
          <div class="category-score" style="color: ${cat.status.color}">
            ${cat.score}
          </div>
          <div class="category-progress">
            <div 
              class="category-progress-bar" 
              style="width: ${cat.score}%; background-color: ${cat.status.color};"
            ></div>
          </div>
          <small style="color: var(--text-tertiary);">${cat.status.label}</small>
        </div>
      `;
    });

    html += '</div>';
    container.innerHTML = html;
  },

  /**
   * Render burnout risk gauge
   */
  renderBurnoutGauge: (report) => {
    const container = document.getElementById('burnoutGauge');
    if (!container) return;

    const { burnoutRisk, burnoutStatus } = report;
    const riskLevel = burnoutRisk > 70 ? 'high' : burnoutRisk > 40 ? 'moderate' : 'low';

    let html = `
      <div class="burnout-gauge" data-animate>
        <h3 style="margin-bottom: 1rem;">Burnout Risk Assessment</h3>
        <div class="gauge-value ${riskLevel}">${burnoutRisk}%</div>
        <div class="gauge-label">${burnoutStatus.label}</div>
        <div class="gauge-bar">
          <div 
            class="gauge-fill ${riskLevel}" 
            style="width: ${burnoutRisk}%;"
          ></div>
        </div>
        <div style="margin-top: 1rem; font-size: 0.875rem; color: var(--text-secondary);">
          ${DashboardManager.getBurnoutMessage(burnoutRisk)}
        </div>
      </div>
    `;

    container.innerHTML = html;
  },

  /**
   * Render wellness projection cards
   */
  renderWellnessProjection: () => {
    try {
      let score = 50;
      if (typeof StorageManager !== 'undefined' && StorageManager.isAvailable()) {
        score = StorageManager.getWellnessScore()?.scores?.overall ?? 50;
      }

      const prediction = (typeof PredictionEngine !== 'undefined' && PredictionEngine.generatePrediction)
        ? PredictionEngine.generatePrediction(score)
        : { day7: Math.min(100, score + 3), day14: Math.min(100, score + 7), day30: Math.min(100, score + 12) };

      const day7  = document.getElementById('day7');
      const day14 = document.getElementById('day14');
      const day30 = document.getElementById('day30');

      if (day7)  day7.textContent  = `${prediction.day7}%`;
      if (day14) day14.textContent = `${prediction.day14}%`;
      if (day30) day30.textContent = `${prediction.day30}%`;
    } catch (err) {
      console.error('❌ renderWellnessProjection failed:', err);
    }
  },

  /**
   * Render circular progress indicator for overall wellness score
   */
  renderCircularProgress: (report) => {
    const canvas = document.getElementById('circularProgressCanvas');
    if (!canvas) return;

    const { scores } = report;
    const score = Math.round(scores.overall);
    const ctx = canvas.getContext('2d');
    
    // Set canvas size for proper resolution
    const width = canvas.offsetWidth || 200;
    const height = canvas.offsetHeight || 200;
    canvas.width = width * window.devicePixelRatio;
    canvas.height = height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(centerX, centerY) - 20;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw background circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 15;
    ctx.stroke();

    // Draw progress circle with gradient
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#667eea');
    gradient.addColorStop(1, '#764ba2');

    const startAngle = -Math.PI / 2;
    const endAngle = startAngle + (2 * Math.PI * score / 100);

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, startAngle, endAngle);
    ctx.strokeStyle = gradient;
    ctx.lineWidth = 15;
    ctx.lineCap = 'round';
    ctx.stroke();
  },

  /**
   * Render wellness score insights
   */
  renderScoreInsights: (report) => {
    const container = document.getElementById('scoreInsights');
    if (!container) return;

    const { scores, statuses, burnoutRisk, trend } = report;
    const score = Math.round(scores.overall);

    let html = `
      <div class="score-insight-item">
        <div class="insight-label">Overall Score</div>
        <div class="insight-value" style="color: ${statuses.overall.color};">
          ${score}% - ${statuses.overall.label}
        </div>
      </div>
      <div class="score-insight-item">
        <div class="insight-label">Burnout Risk</div>
        <div class="insight-value" style="color: ${burnoutRisk > 60 ? '#ef4444' : burnoutRisk > 40 ? '#f59e0b' : '#10b981'};">
          ${burnoutRisk}% - ${burnoutRisk > 70 ? 'High Risk' : burnoutRisk > 40 ? 'Moderate' : 'Low Risk'}
        </div>
      </div>
      <div class="score-insight-item">
        <div class="insight-label">Stress Trend</div>
        <div class="insight-value">
          ${trend.direction} ${trend.message}
        </div>
      </div>
      <div class="score-insight-item">
        <div class="insight-label">Last Updated</div>
        <div class="insight-value">
          ${new Date(report.lastUpdated).toLocaleDateString()}
        </div>
      </div>
    `;

    container.innerHTML = html;
  },

  /**
   * Render speedometer-style burnout gauge
   */
  renderBurnoutGaugeSpeedometer: (report) => {
    const canvas = document.getElementById('burnoutGaugeCanvas');
    const statusDiv = document.getElementById('burnoutStatus');
    
    if (!canvas || !statusDiv) return;

    const { burnoutRisk, burnoutStatus } = report;
    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    const width = canvas.offsetWidth || 180;
    const height = canvas.offsetHeight || 90;
    canvas.width = width * window.devicePixelRatio;
    canvas.height = height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    
    const centerX = width / 2;
    const centerY = height - 10;
    const radius = 70;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw gauge background (semi-circle)
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, Math.PI, 0, false);
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 12;
    ctx.stroke();

    // Determine color based on risk level
    let gaugeColor;
    if (burnoutRisk > 70) {
      gaugeColor = '#ef4444'; // Red
    } else if (burnoutRisk > 40) {
      gaugeColor = '#f59e0b'; // Orange
    } else {
      gaugeColor = '#10b981'; // Green
    }

    // Draw risk level arc
    const riskAngle = Math.PI * (1 - burnoutRisk / 100);
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, Math.PI, riskAngle, false);
    ctx.strokeStyle = gaugeColor;
    ctx.lineWidth = 12;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Draw needle
    const needleAngle = Math.PI * (1 - burnoutRisk / 100);
    const needleLength = radius - 10;
    const endX = centerX + Math.cos(needleAngle) * needleLength;
    const endY = centerY + Math.sin(needleAngle) * needleLength;

    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(endX, endY);
    ctx.strokeStyle = gaugeColor;
    ctx.lineWidth = 3;
    ctx.stroke();

    // Draw center circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, 8, 0, 2 * Math.PI);
    ctx.fillStyle = '#1e293b';
    ctx.fill();
    ctx.strokeStyle = gaugeColor;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Update status text
    statusDiv.innerHTML = `
      <div style="font-size: 1.5rem; font-weight: 700; color: ${gaugeColor};">
        ${burnoutRisk}%
      </div>
      <div style="font-size: 0.9rem; color: rgba(226, 232, 240, 0.78); margin-top: 0.5rem;">
        ${burnoutStatus.label}
      </div>
    `;
  },

  /**
   * Get burnout message
   */
  getBurnoutMessage: (risk) => {
    if (risk > 70) {
      return '🚨 CRITICAL: Immediate action required. Consider professional support.';
    } else if (risk > 50) {
      return '⚠️ HIGH: Implement stress management strategies immediately.';
    } else if (risk > 30) {
      return '⚡ MODERATE: Focus on wellness habits and balance.';
    } else {
      return '✅ LOW: Maintain current healthy habits.';
    }
  },

  /**
   * Render charts
   */
  renderCharts: (report) => {
    DashboardManager.renderCategoryChart(report);
    DashboardManager.renderTrendChart(report);
  },

  /**
   * Render category bar chart
   * Enhanced with gradients, better styling, and improved colors
   */
  renderCategoryChart: (report) => {
    // Direct canvas selection from HTML
    const canvas = document.getElementById('categoryChartCanvas');
    if (!canvas) {
      console.warn('⚠️ Category chart canvas element not found');
      return;
    }

    const { scores } = report;
    const ctx = canvas.getContext('2d');

    // Destroy existing chart if any
    if (DashboardManager.charts.category) {
      DashboardManager.charts.category.destroy();
    }

    // Check if Chart.js is available
    if (typeof Chart === 'undefined') {
      console.warn('⚠️ Chart.js not loaded');
      return;
    }

    // Create gradient backgrounds for each category
    const physicalGradient = ctx.createLinearGradient(0, 0, 0, 300);
    physicalGradient.addColorStop(0, 'rgba(102, 126, 234, 0.8)');
    physicalGradient.addColorStop(1, 'rgba(102, 126, 234, 0.2)');

    const mentalGradient = ctx.createLinearGradient(0, 0, 0, 300);
    mentalGradient.addColorStop(0, 'rgba(168, 85, 247, 0.8)');
    mentalGradient.addColorStop(1, 'rgba(168, 85, 247, 0.2)');

    const emotionalGradient = ctx.createLinearGradient(0, 0, 0, 300);
    emotionalGradient.addColorStop(0, 'rgba(244, 63, 94, 0.8)');
    emotionalGradient.addColorStop(1, 'rgba(244, 63, 94, 0.2)');

    DashboardManager.charts.category = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Physical', 'Mental', 'Emotional'],
        datasets: [{
          label: 'Wellness Score',
          data: [
            Math.round(scores.physical),
            Math.round(scores.mental),
            Math.round(scores.emotional)
          ],
          backgroundColor: [physicalGradient, mentalGradient, emotionalGradient],
          borderColor: ['#667eea', '#a855f7', '#f43f5e'],
          borderWidth: 2,
          borderRadius: 8,
          borderSkipped: false,
          hoverBackgroundColor: ['#667eea', '#a855f7', '#f43f5e'],
          hoverBorderWidth: 3
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'x',
        animation: {
          duration: 800,
          easing: 'easeInOutQuart'
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            ticks: {
              color: '#94a3b8',
              font: { size: 12, weight: '500' },
              callback: (value) => value + '%'
            },
            grid: {
              color: 'rgba(148, 163, 184, 0.1)',
              drawBorder: false
            }
          },
          x: {
            ticks: {
              color: '#cbd5e1',
              font: { size: 13, weight: '500' }
            },
            grid: {
              display: false,
              drawBorder: false
            }
          }
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: 'rgba(15, 23, 42, 0.95)',
            titleColor: '#f1f5f9',
            bodyColor: '#cbd5e1',
            borderColor: '#667eea',
            borderWidth: 1,
            padding: 12,
            displayColors: false,
            callbacks: {
              label: function(context) {
                return 'Score: ' + context.raw + '%';
              }
            }
          }
        }
      }
    });
  },

  /**
   * Render trend line chart
   * Shows wellness trajectory with historical data + AI predictions
   * Combines past assessments with 30-day forecast using smooth curve
   */
  renderTrendChart: (report) => {
    // Direct canvas selection from HTML
    const canvas = document.getElementById('trendChartCanvas');
    if (!canvas) {
      console.warn('⚠️ Trend chart canvas element not found');
      return;
    }

    const chartData = PredictionEngine.getTrajectoryChartData();
    
    // Fallback: Generate trend from current score if no history
    if (!chartData || !chartData.data || chartData.data.length === 0) {
      console.log('📊 No history found, generating baseline trend...');
      const currentScore = StorageManager.getWellnessScore()?.scores?.overall ?? 75;
      const fallbackData = {
        labels: ['Today', 'Day 7', 'Day 14', 'Day 30'],
        data: [
          currentScore,
          Math.min(100, currentScore + 5),
          Math.min(100, currentScore + 10),
          Math.min(100, currentScore + 15)
        ],
        historical: 1  // Mark first point as historical
      };
      DashboardManager.initTrendChart(canvas, fallbackData);
      return;
    }

    DashboardManager.initTrendChart(canvas, chartData);
  },

  /**
   * Helper: Initialize trend chart with enhanced gradients and animations
   * Separated for fallback support and code clarity
   */
  initTrendChart: (canvas, chartData) => {
    const ctx = canvas.getContext('2d');

    if (DashboardManager.charts.trend) {
      DashboardManager.charts.trend.destroy();
    }

    if (typeof Chart === 'undefined') {
      console.warn('⚠️ Chart.js library not loaded');
      return;
    }

    // Create gradient for the area under the line
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(102, 126, 234, 0.4)');
    gradient.addColorStop(1, 'rgba(102, 126, 234, 0.05)');

    DashboardManager.charts.trend = new Chart(ctx, {
      type: 'line',
      data: {
        labels: chartData.labels,
        datasets: [{
          label: 'Wellness Score',
          data: chartData.data,
          borderColor: '#667eea',
          backgroundColor: gradient,
          borderWidth: 3,
          fill: true,
          pointRadius: 6,
          pointBackgroundColor: '#667eea',
          pointBorderColor: '#1e293b',
          pointBorderWidth: 2,
          pointHoverRadius: 8,
          pointHoverBackgroundColor: '#764ba2',
          tension: 0.4,
          segment: {
            borderDash: (context) => {
              // Use dashed line for predictions if marked
              if (context.p0DataIndex >= (chartData.historical || 0) - 1) {
                return [5, 5];
              }
              return [];
            }
          }
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 1000,
          easing: 'easeInOutQuart'
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            ticks: {
              color: '#94a3b8',
              font: { size: 12, weight: '500' },
              callback: (value) => value + '%'
            },
            grid: {
              color: 'rgba(148, 163, 184, 0.1)',
              drawBorder: false
            }
          },
          x: {
            ticks: {
              color: '#94a3b8',
              font: { size: 12, weight: '500' }
            },
            grid: {
              display: false,
              drawBorder: false
            }
          }
        },
        plugins: {
          legend: {
            display: true,
            labels: {
              color: '#cbd5e1',
              usePointStyle: true,
              padding: 15,
              font: { size: 13, weight: '500' }
            }
          },
          tooltip: {
            backgroundColor: 'rgba(15, 23, 42, 0.95)',
            titleColor: '#f1f5f9',
            bodyColor: '#cbd5e1',
            borderColor: '#667eea',
            borderWidth: 1,
            cornerRadius: 6,
            padding: 12,
            displayColors: false,
            callbacks: {
              label: function(context) {
                return `Score: ${context.raw}%`;
              },
              afterLabel: function(context) {
                // Show prediction indicator for future data
                if (context.dataIndex >= (chartData.historical || context.dataset.data.length)) {
                  return '📊 AI Predicted';
                }
                return '';
              }
            }
          }
        }
      }
    });
    
    console.log('✅ Wellness Trend Chart rendered successfully');
  },

  /**
   * Get last 5 assessment attempts from history
   * @returns {array} Array of up to 5 historical attempts with scores
   */
  getLastFiveAttempts: () => {
    const history = StorageManager.getHistoricalData();
    if (!history || history.length === 0) {
      return [];
    }
    // Return last 5 attempts (or fewer if less than 5 exist)
    return history.slice(-5).map((attempt, idx) => {
      // Safely extract scores to support older data formats
      const scores = attempt.scores || attempt.categoryScores || {
        overall: attempt.score || 0,
        physical: attempt.score || 0,
        mental: attempt.score || 0,
        emotional: attempt.score || 0
      };

      return {
        attemptNumber: idx + 1,
        score: scores.overall || 0,
        physical: scores.physical || 0,
        mental: scores.mental || 0,
        emotional: scores.emotional || 0,
        timestamp: new Date(attempt.timestamp || Date.now()),
        date: new Date(attempt.timestamp || Date.now()).toLocaleDateString(),
        time: new Date(attempt.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
    });
  },

  /**
   * Calculate improvement metrics between consecutive attempts
   * @param {array} attempts - Array of attempts
   * @returns {array} Array of improvement indicators
   */
  calculateImprovementMetrics: (attempts) => {
    if (attempts.length < 2) {
      return [];
    }

    const metrics = [];
    for (let i = 1; i < attempts.length; i++) {
      const current = attempts[i].score;
      const previous = attempts[i - 1].score;
      const change = current - previous;
      const percentChange = ((change / previous) * 100).toFixed(1);

      metrics.push({
        attemptNumber: attempts[i].attemptNumber,
        change: change,
        percentChange: percentChange,
        direction: change > 0 ? '📈' : change < 0 ? '📉' : '→',
        label: change > 0 
          ? `+${percentChange}% improvement` 
          : change < 0 
            ? `${percentChange}% decline` 
            : 'Stable',
        color: change > 0 ? '#10b981' : change < 0 ? '#ef4444' : '#94a3b8'
      });
    }
    return metrics;
  },

  /**
   * Render assessment trend analysis with last 5 attempts
   * @param {object} report - Current score report
   */
  renderAssessmentTrendAnalysis: (report) => {
    const section = document.getElementById('trendAnalysisSection');
    if (!section) return;

    const attempts = DashboardManager.getLastFiveAttempts();
    
    // If less than 2 attempts, don't show trend analysis
    if (attempts.length < 2) {
      section.innerHTML = '';
      return;
    }

    const improvements = DashboardManager.calculateImprovementMetrics(attempts);

    // Build improvement indicators HTML
    let improvementHTML = '';
    improvements.forEach((metric, idx) => {
      const bgColor = metric.color === '#10b981' 
        ? 'rgba(16, 185, 129, 0.1)' 
        : metric.color === '#ef4444' 
          ? 'rgba(239, 68, 68, 0.1)' 
          : 'rgba(148, 163, 184, 0.1)';
      
      improvementHTML += `
        <div style="
          padding: 0.75rem 1rem;
          background: ${bgColor};
          border-left: 3px solid ${metric.color};
          border-radius: 0.375rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        ">
          <span style="color: rgba(226, 232, 240, 0.88);">
            <strong>Attempt ${metric.attemptNumber}:</strong> ${metric.direction}
          </span>
          <span style="color: ${metric.color}; font-weight: 600;">
            ${metric.label}
          </span>
        </div>
      `;
    });

    // Build section HTML
    section.innerHTML = `
      <div class="card" data-animate>
        <div class="card-header">
          <h3>📊 Assessment Trend (Last ${attempts.length} Attempts)</h3>
          <p style="margin-top: 0.5rem; color: rgba(226, 232, 240, 0.78); font-size: 0.9rem;">
            Track your progress over recent assessments with real-time improvement indicators
          </p>
        </div>
        <div class="card-body">
          <!-- Trend Chart -->
          <div style="height: 280px; margin-bottom: 2rem;">
            <canvas id="assessmentTrendCanvas" style="height: 100%;"></canvas>
          </div>

          <!-- Improvement Indicators -->
          <div style="display: grid; gap: 0.75rem;">
            ${improvementHTML}
          </div>

          <!-- Attempt Summary Grid -->
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem; margin-top: 1.5rem;">
            ${attempts.map(attempt => `
              <div style="
                background: var(--bg-tertiary);
                padding: 1rem;
                border-radius: 0.5rem;
                text-align: center;
                border: 1px solid rgba(148, 163, 184, 0.1);
              ">
                <div style="font-size: 0.85rem; color: var(--text-tertiary); margin-bottom: 0.5rem;">
                  Attempt ${attempt.attemptNumber}
                </div>
                <div style="font-size: 2rem; font-weight: 700; color: var(--primary-light);">
                  ${attempt.score}
                </div>
                <div style="font-size: 0.75rem; color: rgba(226, 232, 240, 0.6); margin-top: 0.5rem;">
                  ${attempt.date}<br/>${attempt.time}
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;

    // Initialize the trend chart
    setTimeout(() => {
      const canvas = document.getElementById('assessmentTrendCanvas');
      if (canvas) {
        DashboardManager.initAssessmentTrendChart(canvas, attempts, improvements);
      }
    }, 100);
  },

  /**
   * Initialize Chart.js for assessment trend
   * @param {HTMLCanvasElement} canvas - Canvas element
   * @param {array} attempts - Array of attempts
   * @param {array} improvements - Array of improvements
   */
  initAssessmentTrendChart: (canvas, attempts, improvements) => {
    const ctx = canvas.getContext('2d');

    // Destroy existing chart if present
    if (DashboardManager.charts.assessmentTrend) {
      DashboardManager.charts.assessmentTrend.destroy();
    }

    if (typeof Chart === 'undefined') {
      console.warn('⚠️ Chart.js library not loaded');
      return;
    }

    // Create gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, 'rgba(102, 126, 234, 0.4)');
    gradient.addColorStop(1, 'rgba(102, 126, 234, 0.05)');

    // Prepare chart data
    const labels = attempts.map(a => `Attempt ${a.attemptNumber}`);
    const data = attempts.map(a => a.score);

    // Create chart
    DashboardManager.charts.assessmentTrend = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Overall Score',
          data: data,
          borderColor: '#667eea',
          backgroundColor: gradient,
          borderWidth: 3,
          fill: true,
          pointRadius: 7,
          pointBackgroundColor: '#667eea',
          pointBorderColor: '#1e293b',
          pointBorderWidth: 2,
          pointHoverRadius: 9,
          pointHoverBackgroundColor: '#764ba2',
          tension: 0.4, // Smooth curve
          segment: {
            borderColor: (context) => {
              const idx = context.p0DataIndex;
              if (idx < improvements.length) {
                const improvement = improvements[idx];
                if (improvement.change > 0) return '#10b981';
                if (improvement.change < 0) return '#ef4444';
              }
              return '#667eea';
            },
            borderWidth: (context) => {
              const idx = context.p0DataIndex;
              if (idx < improvements.length) {
                return 3;
              }
              return 3;
            }
          }
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 800,
          easing: 'easeInOutQuart'
        },
        scales: {
          y: {
            beginAtZero: false,
            min: 0,
            max: 100,
            ticks: {
              color: '#94a3b8',
              font: { size: 11, weight: '500' },
              callback: (value) => value + '%'
            },
            grid: {
              color: 'rgba(148, 163, 184, 0.1)',
              drawBorder: false
            }
          },
          x: {
            ticks: {
              color: '#94a3b8',
              font: { size: 11, weight: '500' }
            },
            grid: {
              display: false,
              drawBorder: false
            }
          }
        },
        plugins: {
          legend: {
            display: true,
            labels: {
              color: '#cbd5e1',
              usePointStyle: true,
              padding: 12,
              font: { size: 12, weight: '500' }
            }
          },
          tooltip: {
            backgroundColor: 'rgba(15, 23, 42, 0.95)',
            titleColor: '#f1f5f9',
            bodyColor: '#cbd5e1',
            borderColor: '#667eea',
            borderWidth: 1,
            cornerRadius: 6,
            padding: 10,
            displayColors: false,
            callbacks: {
              label: function(context) {
                const score = context.raw;
                return `Score: ${score}%`;
              },
              afterLabel: function(context) {
                const idx = context.dataIndex;
                if (idx > 0 && idx - 1 < improvements.length) {
                  const improvement = improvements[idx - 1];
                  return improvement.label;
                }
                return '';
              }
            }
          }
        }
      }
    });

    console.log('✅ Assessment Trend Chart rendered successfully');
  },

  /**
   * Render goals tracking section
   * Displays user goals with progress bars and completion status
   * @param {object} report - Current score report
   */
  renderGoals: (report) => {
    const section = document.getElementById('goalsSection');
    if (!section) return;

    // Initialize goals if first time
    GoalManager.initializeGoals();

    // Calculate progress for all goals based on current scores
    const goals = GoalManager.calculateGoalProgress(report.scores);
    const activeGoals = goals.filter(g => g.isActive);

    if (activeGoals.length === 0) {
      section.innerHTML = '';
      return;
    }

    // Calculate overall progress
    const overallProgress = GoalManager.getOverallProgress();
    const completedCount = GoalManager.getCompletedCount();
    const totalCount = GoalManager.getTotalCount();

    // Build goals HTML
    let goalsHTML = '';
    activeGoals.forEach(goal => {
      const status = GoalManager.getGoalStatus(goal);
      const progressPercent = Math.min(100, goal.progress);
      const currentScore = goal.currentScore || 0;
      const targetScore = goal.targetScore;

      // Determine progress bar color
      let barColor = '#667eea';
      if (progressPercent >= 100) {
        barColor = '#10b981';
      } else if (progressPercent >= 50) {
        barColor = '#3b82f6';
      } else if (progressPercent > 0) {
        barColor = '#f59e0b';
      } else {
        barColor = '#94a3b8';
      }

      goalsHTML += `
        <div class="goal-card" style="
          background: var(--bg-secondary);
          border-left: 4px solid ${goal.color};
          padding: 1.25rem;
          border-radius: 0.5rem;
          margin-bottom: 1rem;
        ">
          <div style="
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 1rem;
          ">
            <div style="display: flex; gap: 0.75rem; align-items: flex-start; flex: 1;">
              <span style="font-size: 1.5rem;">${goal.icon}</span>
              <div>
                <h4 style="margin: 0 0 0.25rem 0; color: #f1f5f9;">${goal.name}</h4>
                <p style="margin: 0; font-size: 0.85rem; color: rgba(226, 232, 240, 0.7);">
                  ${goal.description}
                </p>
              </div>
            </div>
            <div style="
              background: ${status.color}22;
              color: ${status.color};
              padding: 0.375rem 0.75rem;
              border-radius: 9999px;
              font-size: 0.75rem;
              font-weight: 600;
              white-space: nowrap;
            ">
              ${status.label}
            </div>
          </div>

          <!-- Progress Bar -->
          <div style="margin-bottom: 0.75rem;">
            <div style="
              background: rgba(148, 163, 184, 0.1);
              height: 8px;
              border-radius: 9999px;
              overflow: hidden;
              margin-bottom: 0.5rem;
            ">
              <div style="
                background: ${barColor};
                height: 100%;
                width: ${progressPercent}%;
                border-radius: 9999px;
                transition: width 0.3s ease;
                box-shadow: 0 0 10px ${barColor}44;
              "></div>
            </div>
            <div style="
              display: flex;
              justify-content: space-between;
              font-size: 0.75rem;
              color: rgba(226, 232, 240, 0.7);
            ">
              <span>${progressPercent}% Complete</span>
              <span>${currentScore}/${targetScore}</span>
            </div>
          </div>

          <!-- Goal Details -->
          <div style="
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1rem;
            padding-top: 0.75rem;
            border-top: 1px solid rgba(148, 163, 184, 0.1);
          ">
            <div>
              <div style="font-size: 0.75rem; color: rgba(226, 232, 240, 0.6); margin-bottom: 0.25rem;">
                Current Score
              </div>
              <div style="font-size: 1.25rem; font-weight: 700; color: ${goal.color};">
                ${currentScore}
              </div>
            </div>
            <div>
              <div style="font-size: 0.75rem; color: rgba(226, 232, 240, 0.6); margin-bottom: 0.25rem;">
                Target Score
              </div>
              <div style="font-size: 1.25rem; font-weight: 700; color: #cbd5e1;">
                ${targetScore}
              </div>
            </div>
          </div>
        </div>
      `;
    });

    // Build section HTML
    section.innerHTML = `
      <div class="card" data-animate>
        <div class="card-header">
          <h3>🎯 Wellness Goals</h3>
          <p style="margin-top: 0.5rem; color: rgba(226, 232, 240, 0.78); font-size: 0.9rem;">
            Track your progress toward wellness objectives
          </p>
        </div>
        <div class="card-body">
          <!-- Overall Progress Summary -->
          <div style="
            background: var(--bg-tertiary);
            padding: 1rem;
            border-radius: 0.5rem;
            margin-bottom: 1.5rem;
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 1rem;
          ">
            <div style="text-align: center;">
              <div style="font-size: 2rem; font-weight: 700; color: var(--primary-light);">
                ${overallProgress}%
              </div>
              <div style="font-size: 0.75rem; color: rgba(226, 232, 240, 0.6); margin-top: 0.25rem;">
                Overall Progress
              </div>
            </div>
            <div style="text-align: center;">
              <div style="font-size: 2rem; font-weight: 700; color: #10b981;">
                ${completedCount}
              </div>
              <div style="font-size: 0.75rem; color: rgba(226, 232, 240, 0.6); margin-top: 0.25rem;">
                Completed
              </div>
            </div>
            <div style="text-align: center;">
              <div style="font-size: 2rem; font-weight: 700; color: #3b82f6;">
                ${totalCount}
              </div>
              <div style="font-size: 0.75rem; color: rgba(226, 232, 240, 0.6); margin-top: 0.25rem;">
                Total Goals
              </div>
            </div>
          </div>

          <!-- Individual Goals -->
          <div>
            ${goalsHTML}
          </div>
        </div>
      </div>
    `;

    console.log('✅ Goals section rendered successfully');
  },

  /**
   * Render additional metrics
   */
  renderMetrics: (report) => {
    const container = document.getElementById('metricsContainer');
    if (!container) return;

    const { trend, suggestions } = report;

    let html = '<div class="grid grid-2" style="margin-top: 2rem;">';

    // Stress trend
    html += `
      <div class="card" data-animate>
        <div class="card-header">
          <h3>Stress Trend</h3>
        </div>
        <div class="card-body">
          <div style="font-size: 2rem; margin: 1rem 0;">
            ${trend.direction}
          </div>
          <p>${trend.message}</p>
          <p style="font-size: 0.875rem; color: var(--text-tertiary);">
            Change: ${trend.change > 0 ? '+' : ''}${trend.change}
          </p>
        </div>
      </div>
    `;

    // Top suggestions
    html += `
      <div class="card" data-animate>
        <div class="card-header">
          <h3>Quick Improvements</h3>
        </div>
        <div class="card-body">
          ${suggestions.map((s, i) => `
            <div style="margin-bottom: 1rem;">
              <strong>${s.category}</strong>
              <p style="font-size: 0.875rem; margin-top: 0.25rem;">
                ${s.suggestion}
              </p>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    html += '</div>';
    container.innerHTML = html;
  },

  /**
   * Render recommendations
   */
  renderRecommendations: (report) => {
    const container = document.getElementById('recommendationsContainer');
    if (!container) return;

    try {
      if (typeof SmartRecommendationEngine === 'undefined') return;
      const scores = report && report.scores ? report.scores : null;
      if (!scores) return;

      const recs = SmartRecommendationEngine.generateRecommendations(scores);
      if (!recs) return;

      const categories = [
        { key: 'physical', label: 'Physical Health',    priority: 'MEDIUM' },
        { key: 'mental',   label: 'Mental Health',      priority: 'HIGH'   },
        { key: 'emotional', label: 'Emotional Wellness', priority: 'MEDIUM' }
      ];

      let html = '<div class="grid grid-2">';
      categories.forEach(cat => {
        const items = (recs[cat.key] || []).slice(0, 1);
        items.forEach(item => {
          html += `
            <div class="recommendation-card" data-animate>
              <div class="recommendation-header">
                <div>
                  <h4 class="recommendation-title">${cat.label}</h4>
                  <span class="recommendation-priority ${cat.priority.toLowerCase()}">${cat.priority}</span>
                </div>
              </div>
              <p style="margin-bottom: 1rem;">${item}</p>
              <a href="recommendations.html" class="btn btn-sm btn-primary">View Details</a>
            </div>`;
        });
      });
      html += '</div>';
      html += `<div style="text-align:center;margin-top:2rem;">
        <a href="recommendations.html" class="btn btn-primary">View All Recommendations →</a>
      </div>`;

      container.innerHTML = html;
    } catch (err) {
      console.error('❌ renderRecommendations failed:', err);
    }
  },

  /**
   * Render intelligent insight cards: Main Problem · Focus Area · Alerts · Highlights
   */
  renderIntelligentInsights: (scoreReport) => {
    const el = document.getElementById('intelligentInsightsSection');
    if (!el || typeof InsightsEngine === 'undefined') return;

    try {
      const raw    = scoreReport?.scores || scoreReport?.categoryScores || {};
      const data   = InsightsEngine.analyze(raw);
      if (!data) return;

      const { mainProblem: mp, focusArea: fa, alerts, highlights } = data;

      const urgencyBadge = (tier) => {
        const map = { CRITICAL:'#ef4444', HIGH:'#f97316', MEDIUM:'#f59e0b', LOW:'#10b981', EXCELLENT:'#6366f1' };
        const c   = map[tier] || '#94a3b8';
        return `<span style="background:${c}18;color:${c};border:1px solid ${c}33;padding:0.18rem 0.6rem;border-radius:99px;font-size:0.7rem;font-weight:700;">${tier}</span>`;
      };

      const chips = (areas) => (areas||[]).slice(0,3).map(a =>
        `<span style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.09);border-radius:99px;padding:0.15rem 0.55rem;font-size:0.72rem;color:rgba(226,232,240,0.55);">${a}</span>`
      ).join('');

      // Heading
      let html = `
        <div style="display:flex;align-items:center;gap:0.75rem;margin-bottom:1.25rem;flex-wrap:wrap;">
          <h2 class="section-heading" style="margin:0;">🧠 Intelligent Insights</h2>
          <span style="font-size:0.75rem;color:rgba(226,232,240,0.4);">Personalised analysis based on your scores</span>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:1.25rem;margin-bottom:1.25rem;">`;

      // Main Problem — full width
      html += `
        <div class="card" data-animate style="border-left:4px solid ${mp.color};grid-column:1/-1;">
          <div class="card-body">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:0.75rem;margin-bottom:0.75rem;">
              <div style="display:flex;align-items:center;gap:0.75rem;">
                <span style="font-size:2rem;line-height:1;">${mp.icon}</span>
                <div>
                  <div style="font-size:0.68rem;text-transform:uppercase;letter-spacing:0.07em;color:rgba(226,232,240,0.4);margin-bottom:0.2rem;">Main Problem Area</div>
                  <h3 style="margin:0;font-size:1.05rem;font-weight:700;color:${mp.color};">${mp.headline}</h3>
                </div>
              </div>
              <div style="display:flex;gap:0.5rem;align-items:center;flex-wrap:wrap;">
                ${urgencyBadge(mp.urgency)}
                <span style="font-size:1.4rem;font-weight:800;color:${mp.color};">${mp.score}%</span>
              </div>
            </div>
            <p style="font-size:0.875rem;color:rgba(226,232,240,0.75);line-height:1.6;margin-bottom:0.75rem;">${mp.body}</p>
            <div style="background:${mp.color}0D;border:1px solid ${mp.color}22;border-radius:10px;padding:0.65rem 0.9rem;font-size:0.82rem;color:rgba(226,232,240,0.8);margin-bottom:0.75rem;">
              <strong>→ Action:</strong> ${mp.action}
            </div>
            <div style="display:flex;flex-wrap:wrap;gap:0.4rem;">${chips(mp.areas)}</div>
          </div>
        </div>`;

      // Focus Area card
      html += `
        <div class="card" data-animate style="border-left:4px solid ${fa.color};">
          <div class="card-body">
            <div style="display:flex;align-items:center;gap:0.65rem;margin-bottom:0.65rem;">
              <span style="font-size:1.5rem;line-height:1;">${fa.icon}</span>
              <div>
                <div style="font-size:0.68rem;text-transform:uppercase;letter-spacing:0.07em;color:rgba(226,232,240,0.4);">This Week's Focus</div>
                <h4 style="margin:0;font-size:0.95rem;font-weight:700;color:#f1f5f9;">${fa.headline}</h4>
              </div>
            </div>
            <p style="font-size:0.84rem;color:rgba(226,232,240,0.7);line-height:1.55;margin-bottom:0.65rem;">${fa.body}</p>
            <div style="font-size:0.8rem;color:${fa.color};font-weight:600;">→ ${fa.action}</div>
            <div style="margin-top:0.75rem;display:flex;flex-wrap:wrap;gap:0.35rem;">${chips(fa.areas)}</div>
          </div>
        </div>`;

      // Critical Alerts card
      const alertsHtml = alerts.length > 0
        ? alerts.map(a => `
          <div style="background:${a.color}0D;border:1px solid ${a.color}25;border-radius:12px;padding:0.85rem 1rem;display:flex;gap:0.75rem;align-items:flex-start;">
            <span style="font-size:1.3rem;flex-shrink:0;line-height:1.2;">${a.icon}</span>
            <div>
              <div style="font-size:0.82rem;font-weight:700;color:${a.color};margin-bottom:0.25rem;">${a.title}</div>
              <div style="font-size:0.79rem;color:rgba(226,232,240,0.65);line-height:1.45;">${a.message}</div>
            </div>
          </div>`).join('')
        : `<div style="text-align:center;padding:1rem;color:rgba(226,232,240,0.35);font-size:0.85rem;">✅ No critical alerts — great work!</div>`;

      html += `
        <div class="card" data-animate style="border-left:4px solid #ef4444;">
          <div class="card-body">
            <div style="font-size:0.68rem;text-transform:uppercase;letter-spacing:0.07em;color:rgba(226,232,240,0.4);margin-bottom:0.85rem;">🚨 Critical Alerts</div>
            <div style="display:flex;flex-direction:column;gap:0.75rem;">${alertsHtml}</div>
          </div>
        </div>`;

      html += '</div>';

      // Positive Highlights — full width
      if (highlights.length > 0) {
        const hHtml = highlights.map(h => `
          <div style="background:${h.color}0A;border:1px solid ${h.color}22;border-radius:14px;padding:1rem 1.1rem;display:flex;gap:0.75rem;align-items:flex-start;flex:1;min-width:220px;">
            <span style="font-size:1.5rem;flex-shrink:0;line-height:1;">${h.icon}</span>
            <div>
              <div style="font-size:0.82rem;font-weight:700;color:${h.color};margin-bottom:0.25rem;">${h.title}</div>
              <div style="font-size:0.79rem;color:rgba(226,232,240,0.65);line-height:1.45;">${h.message}</div>
            </div>
          </div>`).join('');

        html += `
          <div class="card" data-animate style="border-left:4px solid #10b981;">
            <div class="card-body">
              <div style="font-size:0.68rem;text-transform:uppercase;letter-spacing:0.07em;color:rgba(226,232,240,0.4);margin-bottom:0.85rem;">✨ Positive Highlights</div>
              <div style="display:flex;flex-wrap:wrap;gap:1rem;">${hHtml}</div>
            </div>
          </div>`;
      }

      // ── Causal Correlations section ──────────────────────────────────────
      const correlations = data.correlations || [];
      if (correlations.length > 0) {
        const confColors = { 'Very High':'#ef4444', 'High':'#f97316', 'Moderate':'#f59e0b', 'Low':'#94a3b8' };

        const corrCards = correlations.map(c => {
          const confColor = confColors[c.confidence] || '#94a3b8';
          const checkinHTML = c.checkinNote
            ? `<div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:8px;padding:0.5rem 0.75rem;font-size:0.78rem;color:rgba(226,232,240,0.6);margin-top:0.5rem;font-style:italic;">
                📊 ${c.checkinNote}
              </div>` : '';

          return `
            <div class="card" data-animate style="border-left:4px solid ${c.color};">
              <div class="card-body">
                <!-- Header: cause → effect -->
                <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:0.5rem;margin-bottom:0.75rem;">
                  <div style="display:flex;align-items:center;gap:0.6rem;flex-wrap:wrap;">
                    <span style="font-size:1.3rem;line-height:1;">${c.icon}</span>
                    <div>
                      <div style="font-size:0.68rem;text-transform:uppercase;letter-spacing:0.06em;color:rgba(226,232,240,0.4);">Detected Relationship</div>
                      <div style="font-size:0.9rem;font-weight:700;color:#f1f5f9;margin-top:0.15rem;">
                        <span style="color:${c.color};">${c.cause}</span>
                        <span style="color:rgba(226,232,240,0.4);margin:0 0.35rem;">→</span>
                        <span>${c.effect}</span>
                      </div>
                    </div>
                  </div>
                  <div style="display:flex;flex-direction:column;align-items:flex-end;gap:0.3rem;">
                    <span style="background:${confColor}18;color:${confColor};border:1px solid ${confColor}33;padding:0.15rem 0.55rem;border-radius:99px;font-size:0.68rem;font-weight:700;white-space:nowrap;">${c.confidence} Confidence</span>
                    <span style="font-size:0.65rem;color:rgba(226,232,240,0.3);">${c.dataSource}</span>
                  </div>
                </div>

                <!-- Explanation -->
                <p style="font-size:0.835rem;color:rgba(226,232,240,0.72);line-height:1.6;margin-bottom:0.65rem;">${c.explanation}</p>

                <!-- Check-in data note -->
                ${checkinHTML}

                <!-- Fix -->
                <div style="background:${c.color}0D;border:1px solid ${c.color}22;border-radius:10px;padding:0.6rem 0.9rem;font-size:0.81rem;color:rgba(226,232,240,0.8);margin-top:0.75rem;">
                  <strong>→ Fix:</strong> ${c.fix}
                </div>
              </div>
            </div>`;
        }).join('');

        html += `
          <div style="margin-top:1.5rem;">
            <div style="display:flex;align-items:center;gap:0.75rem;margin-bottom:1rem;flex-wrap:wrap;">
              <h3 style="margin:0;font-size:1rem;font-weight:700;color:#f1f5f9;">🔗 Cause-Effect Relationships</h3>
              <span style="font-size:0.72rem;color:rgba(226,232,240,0.4);background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:99px;padding:0.15rem 0.6rem;">${correlations.length} detected · Rule-based analysis</span>
            </div>
            <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(340px,1fr));gap:1.25rem;">
              ${corrCards}
            </div>
          </div>`;
      } else {
        html += `
          <div style="margin-top:1.5rem;padding:1.25rem;background:rgba(16,185,129,0.05);border:1px solid rgba(16,185,129,0.15);border-radius:14px;text-align:center;">
            <span style="font-size:1.5rem;">✅</span>
            <p style="font-size:0.875rem;color:rgba(226,232,240,0.6);margin-top:0.5rem;">No harmful cause-effect patterns detected. Your wellness dimensions are in healthy balance.</p>
          </div>`;
      }

      el.innerHTML = html;

    } catch (err) {
      console.error('❌ renderIntelligentInsights failed:', err);
    }
  },

  /**
   * Render daily check-in status widget on the dashboard
   */
  renderCheckinWidget: () => {
    const el = document.getElementById('dashboardCheckinBody');
    if (!el || typeof CheckinManager === 'undefined') return;

    try {
      const MOODS = [
        { val:1, emoji:'😞', label:'Very Low',  color:'#ef4444' },
        { val:2, emoji:'😕', label:'Low',       color:'#f97316' },
        { val:3, emoji:'😐', label:'Neutral',   color:'#f59e0b' },
        { val:4, emoji:'🙂', label:'Good',      color:'#10b981' },
        { val:5, emoji:'😄', label:'Excellent', color:'#6366f1' }
      ];

      const today   = CheckinManager.getTodayCheckin();
      const { insights, weekAvg } = CheckinManager.getInsights();

      if (today) {
        const mood = MOODS[today.mood - 1] || MOODS[2];
        el.innerHTML = `
          <div style="display:grid;grid-template-columns:auto 1fr;gap:1.5rem;align-items:center;margin-bottom:1.25rem;flex-wrap:wrap;">
            <div style="text-align:center;">
              <div style="font-size:2.5rem;line-height:1;">${mood.emoji}</div>
              <div style="font-size:0.7rem;color:${mood.color};font-weight:700;margin-top:0.25rem;">${mood.label}</div>
            </div>
            <div>
              <div style="font-size:0.78rem;color:rgba(226,232,240,0.5);margin-bottom:0.5rem;">Today's log · ${today.dateLabel}</div>
              <div style="display:flex;gap:0.75rem;flex-wrap:wrap;">
                <span style="background:rgba(255,255,255,0.06);border-radius:8px;padding:0.25rem 0.6rem;font-size:0.8rem;color:rgba(226,232,240,0.75);">🌙 Sleep ${today.sleep}/10</span>
                <span style="background:rgba(255,255,255,0.06);border-radius:8px;padding:0.25rem 0.6rem;font-size:0.8rem;color:rgba(226,232,240,0.75);">⚡ Energy ${today.energy}/10</span>
              </div>
              ${today.notes ? `<p style="margin-top:0.6rem;font-size:0.8rem;color:rgba(226,232,240,0.5);font-style:italic;">"${today.notes.slice(0,80)}${today.notes.length>80?'…':''}"</p>` : ''}
            </div>
          </div>
          ${weekAvg ? `
          <div style="font-size:0.78rem;color:rgba(226,232,240,0.5);margin-bottom:0.5rem;text-transform:uppercase;letter-spacing:0.06em;font-weight:700;">This Week's Insight</div>
          <div style="font-size:0.875rem;color:rgba(226,232,240,0.75);background:rgba(255,255,255,0.04);border-radius:10px;padding:0.75rem 1rem;border-left:3px solid #10b981;">
            ${insights[0] || ''}
          </div>` : ''}`;
      } else {
        el.innerHTML = `
          <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:1rem;">
            <div>
              <p style="font-size:0.95rem;font-weight:600;color:#f1f5f9;margin-bottom:0.3rem;">You haven't logged today yet</p>
              <p style="font-size:0.835rem;color:rgba(226,232,240,0.55);">Daily check-ins take 30 seconds and reveal weekly trends.</p>
            </div>
            <a href="checkin.html" class="btn btn-primary" style="white-space:nowrap;">📝 Log Now</a>
          </div>`;
      }
    } catch (err) {
      console.error('❌ renderCheckinWidget failed:', err);
    }
  }
};

// Export functionality
const exportData = () => {
  console.log('📥 Exporting NeuroWell data...');

  try {
    // Collect all stored data
    const exportData = {
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      platform: 'NeuroWell Static Frontend',
      data: {
        assessmentResponses: StorageManager.getAssessmentResponses(),
        wellnessScore: StorageManager.getWellnessScore(),
        lastAssessmentDate: StorageManager.getLastAssessmentDate(),
        historicalData: StorageManager.getHistoricalData(),
        userPreferences: {
          // Add any user preferences if they exist
        }
      }
    };

    // Convert to JSON string
    const jsonString = JSON.stringify(exportData, null, 2);

    // Create blob
    const blob = new Blob([jsonString], { type: 'application/json' });

    // Create download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'neurowell-data.json';

    // Trigger download
    document.body.appendChild(link);
    link.click();

    // Clean up
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    console.log('✅ Data exported successfully');
    AppManager.showNotification('✅ Data exported successfully!', 'success');

  } catch (error) {
    console.error('❌ Export failed:', error);
    AppManager.showNotification('❌ Failed to export data: ' + error.message, 'error');
  }
};

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
  DashboardManager.init();

  // Set up export button listener
  const exportBtn = document.getElementById('exportBtn');
  if (exportBtn) {
    exportBtn.addEventListener('click', exportData);
  }
});
