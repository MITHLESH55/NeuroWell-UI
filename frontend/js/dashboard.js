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
  init: () => {
    console.log('📊 Initializing Dashboard...');

    // Load score data
    const scoreReport = ScoringEngine.getScoreReport();
    if (!scoreReport) {
      DashboardManager.showNoDataView();
      return;
    }

    // Render dashboard sections
    DashboardManager.renderOverviewCards(scoreReport);
    DashboardManager.renderCategoryBreakdown(scoreReport);
    DashboardManager.renderBurnoutGauge(scoreReport);
    DashboardManager.renderAssessmentTrendAnalysis(scoreReport);
    DashboardManager.renderGoals(scoreReport);
    DashboardManager.renderCharts(scoreReport);
    DashboardManager.renderMetrics(scoreReport);
    DashboardManager.renderRecommendations(scoreReport);

    console.log('✅ Dashboard Ready');
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
   * Visualizes wellness scores across three key categories
   * Uses bar chart for easy comparison with dark theme colors
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

    DashboardManager.charts.category = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Physical', 'Mental', 'Emotional'],
        datasets: [{
          label: 'Wellness Score',
          data: [scores.physical, scores.mental, scores.emotional],
          backgroundColor: [
            '#667eea',
            '#764ba2',
            '#f59e0b'
          ],
          borderRadius: 8,
          borderSkipped: false
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'x',
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            ticks: {
              color: '#94a3b8',
              font: { size: 12 }
            },
            grid: {
              color: '#334155'
            }
          },
          x: {
            ticks: {
              color: '#94a3b8',
              font: { size: 12 }
            },
            grid: {
              display: false
            }
          }
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: '#1e293b',
            titleColor: '#f1f5f9',
            bodyColor: '#cbd5e1',
            borderColor: '#334155',
            borderWidth: 1,
            callbacks: {
              label: function(context) {
                return context.raw + '%';
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
   * Helper: Initialize trend chart with data
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

    DashboardManager.charts.trend = new Chart(ctx, {
      type: 'line',
      data: {
        labels: chartData.labels,
        datasets: [{
          label: 'Wellness Score (%)',
          data: chartData.data,
          borderColor: '#667eea',
          backgroundColor: 'rgba(102, 126, 234, 0.15)',
          borderWidth: 3,
          fill: true,
          pointRadius: 5,
          pointBackgroundColor: '#667eea',
          pointBorderColor: '#1e293b',
          pointBorderWidth: 2,
          pointHoverRadius: 7,
          tension: 0.4  // Smooth curve for professional look
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            ticks: {
              color: '#94a3b8',
              font: { size: 12 }
            },
            grid: {
              color: '#334155'
            }
          },
          x: {
            ticks: {
              color: '#94a3b8',
              font: { size: 12 }
            },
            grid: {
              display: false
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
            backgroundColor: '#1e293b',
            titleColor: '#f1f5f9',
            bodyColor: '#cbd5e1',
            borderColor: '#334155',
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
    return history.slice(-5).map((attempt, idx) => ({
      attemptNumber: idx + 1,
      score: attempt.scores.overall,
      physical: attempt.scores.physical,
      mental: attempt.scores.mental,
      emotional: attempt.scores.emotional,
      timestamp: new Date(attempt.timestamp),
      date: new Date(attempt.timestamp).toLocaleDateString(),
      time: new Date(attempt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }));
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
      
      // Calculate percentage change safely (avoid division by zero)
      let percentChange = 0;
      if (previous !== 0) {
        percentChange = ((change / previous) * 100).toFixed(1);
      } else if (change !== 0) {
        // If previous was 0 and current is not, show as infinite improvement
        percentChange = change > 0 ? '∞' : '-∞';
      }

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

    const recs = RecommendationEngine.generateRecommendations();
    if (recs.error) return;

    let html = '<div class="grid grid-2">';

    // Get top recommendations from each priority
    const topRecs = [];
    Object.values(recs.recommendations).forEach(priorityRecs => {
      topRecs.push(...priorityRecs.slice(0, 2));
    });

    topRecs.slice(0, 4).forEach(rec => {
      html += `
        <div class="recommendation-card" data-animate>
          <div class="recommendation-header">
            <div>
              <h4 class="recommendation-title">${rec.title}</h4>
              <span class="recommendation-priority ${rec.priority.toLowerCase()}">
                ${rec.priority}
              </span>
            </div>
          </div>
          <p style="margin-bottom: 1rem;">${rec.recommendations[0]}</p>
          <a href="recommendations.html" class="btn btn-sm btn-primary">
            View Details
          </a>
        </div>
      `;
    });

    html += '</div>';
    html += `
      <div style="text-align: center; margin-top: 2rem;">
        <a href="recommendations.html" class="btn btn-primary">
          View All Recommendations →
        </a>
      </div>
    `;

    container.innerHTML = html;
  }
};

// Initialize when page loads
document.addEventListener('DOMContentLoaded', DashboardManager.init);
