/**
 * NEUROWELL - Recommendations Module
 * Generates personalized recommendations using rule-based AI logic
 * Matches user scores against RULES database and applies recommendations
 * Supports filtering by category and priority
 */

const RecommendationEngine = {
  /**
   * Generate personalized recommendations
   * @param {object} backendData - Optional backend assessment data
   * @returns {object} Recommendations grouped by category and priority
   */
  generateRecommendations: async (backendData = null) => {
    let scoreReport;

    if (backendData) {
      // Use backend data
      scoreReport = {
        scores: backendData.categoryScores,
        burnoutRisk: backendData.risk,
        burnoutStatus: backendData.risk > 70 ? 'HIGH' : backendData.risk > 40 ? 'MEDIUM' : 'LOW'
      };
    } else {
      // Try to load from backend
      try {
        const assessmentData = await APIService.loadLatestAssessment();
        if (assessmentData) {
          scoreReport = {
            scores: assessmentData.categoryScores,
            burnoutRisk: assessmentData.risk,
            burnoutStatus: assessmentData.risk > 70 ? 'HIGH' : assessmentData.risk > 40 ? 'MEDIUM' : 'LOW'
          };
        }
      } catch (error) {
        console.log('🔄 Backend unavailable, using local data');
      }

      // Fallback to local data
      if (!scoreReport) {
        scoreReport = ScoringEngine.getScoreReport();
        if (!scoreReport) return { error: 'No assessment data available' };
      }
    }

    const { scores, burnoutRisk } = scoreReport;

    // Evaluate all rules
    const applicableRules = RULES.evaluateRules ?
      RULES.evaluateRules(scores, burnoutRisk) :
      RecommendationEngine.evaluateRulesLocal(scores, burnoutRisk);

    // Group recommendations by category
    const grouped = {
      CRITICAL: [],
      HIGH: [],
      MEDIUM: [],
      LOW: []
    };

    applicableRules.forEach(rule => {
      grouped[rule.priority].push(rule);
    });

    // Limit recommendations to top 3-5 per priority
    Object.keys(grouped).forEach(priority => {
      grouped[priority] = grouped[priority].slice(0, 5);
    });

    return {
      scores: scores,
      burnoutRisk: burnoutRisk,
      burnoutStatus: scoreReport.burnoutStatus,
      recommendations: grouped,
      totalRecommendations: applicableRules.length,
      lastGenerated: new Date().toISOString()
    };
  },

  /**
   * Evaluate rules locally (fallback)
   * @param {object} scores - Wellness scores
   * @param {number} burnoutRisk - Burnout risk percentage
   * @returns {array} Applicable rules
   */
  evaluateRulesLocal: (scores, burnoutRisk) => {
    const applicableRules = [];
    
    for (const [key, rule] of Object.entries(RULES)) {
      let applies = false;
      
      if (key.includes('BURNOUT')) {
        applies = rule.condition(burnoutRisk);
      } else {
        applies = rule.condition(scores);
      }
      
      if (applies) {
        applicableRules.push({ key, ...rule });
      }
    }

    const priorityOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
    applicableRules.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
    
    return applicableRules;
  },

  /**
   * Get recommendations for specific category
   * @param {string} category - Category name
   * @returns {array} Recommendations for that category
   */
  getRecommendationsByCategory: (category) => {
    const allRecs = RecommendationEngine.generateRecommendations();
    if (allRecs.error) return [];

    const recs = [];
    Object.values(allRecs.recommendations).forEach(priorityRecs => {
      recs.push(...priorityRecs.filter(r => r.category === category));
    });

    return recs;
  },

  /**
   * Get actionable items from recommendations
   * @returns {array} Flattened list of actions to take
   */
  getActionItems: () => {
    const recs = RecommendationEngine.generateRecommendations();
    if (recs.error) return [];

    const actions = [];
    
    Object.values(recs.recommendations).forEach(priorityRecs => {
      priorityRecs.forEach(rec => {
        if (rec.actions) {
          rec.actions.forEach(action => {
            actions.push({
              title: action,
              category: rec.category,
              priority: rec.priority,
              ruleId: rec.id
            });
          });
        }
      });
    });

    return actions;
  },

  /**
   * Get quick wins (easy-to-implement recommendations)
   * @returns {array} Quick win recommendations
   */
  getQuickWins: () => {
    const recommendations = RecommendationEngine.generateRecommendations();
    if (recommendations.error) return [];

    const quickWins = [
      {
        title: '5-Minute Meditation',
        description: 'Start your day with a quick mindfulness exercise',
        impact: 'Reduces stress and improves focus',
        difficulty: 'Easy',
        timeRequired: '5 minutes',
        category: 'Mental Health'
      },
      {
        title: 'Hydration Habit',
        description: 'Drink a glass of water when you wake up',
        impact: 'Improves physical health and mental clarity',
        difficulty: 'Easy',
        timeRequired: '1 minute',
        category: 'Physical Health'
      },
      {
        title: '15-Minute Walk',
        description: 'Take a short walk during lunch break',
        impact: 'Boosts mood and energy levels',
        difficulty: 'Easy',
        timeRequired: '15 minutes',
        category: 'Physical Health'
      },
      {
        title: 'Digital Detox Hour',
        description: 'No screens one hour before bed',
        impact: 'Improves sleep quality significantly',
        difficulty: 'Medium',
        timeRequired: '1 hour',
        category: 'Physical Health'
      },
      {
        title: 'Gratitude Journal',
        description: 'Write 3 things you\'re grateful for daily',
        impact: 'Increases emotional wellbeing and positivity',
        difficulty: 'Easy',
        timeRequired: '5 minutes',
        category: 'Emotional Wellness'
      },
      {
        title: 'Social Connection',
        description: 'Reach out to a friend or family member',
        impact: 'Strengthens relationships and support network',
        difficulty: 'Easy',
        timeRequired: '15 minutes',
        category: 'Emotional Wellness'
      }
    ];

    return quickWins;
  },

  /**
   * Get personalized wellness plan
   * @param {number} durationDays - Plan duration in days (default: 30)
   * @returns {object} Structured wellness plan
   */
  generateWellnessPlan: (durationDays = 30) => {
    const recs = RecommendationEngine.generateRecommendations();
    if (recs.error) return null;

    const plan = {
      duration: `${durationDays} days`,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      goals: RecommendationEngine.extractGoals(recs),
      weeklyFocus: RecommendationEngine.generateWeeklyFocus(durationDays),
      dailyHabits: RecommendationEngine.getDailyHabits(),
      resources: RecommendationEngine.getResources(recs),
      checkpoints: RecommendationEngine.generateCheckpoints(durationDays),
      expectedOutcome: RecommendationEngine.getExpectedOutcome(recs)
    };

    return plan;
  },

  /**
   * Extract main goals from recommendations
   * @param {object} recs - Recommendations object
   * @returns {array} Goal statements
   */
  extractGoals: (recs) => {
    const goals = [];
    
    Object.values(recs.recommendations).slice(0, 3).forEach(priorityRecs => {
      priorityRecs.forEach(rec => {
        goals.push({
          title: rec.title,
          description: rec.recommendations[0],
          priority: rec.priority,
          category: rec.category
        });
      });
    });

    return goals.slice(0, 5);
  },

  /**
   * Generate weekly focus areas
   * @param {number} totalDays - Total days in plan
   * @returns {object} Weekly breakdown
   */
  generateWeeklyFocus: (totalDays) => {
    const weeks = Math.ceil(totalDays / 7);
    const focuses = [
      {
        week: 1,
        theme: 'Assessment & Foundation',
        focus: 'Establish baseline habits and routines'
      },
      {
        week: 2,
        theme: 'Sleep & Recovery',
        focus: 'Optimize sleep schedule and quality'
      },
      {
        week: 3,
        theme: 'Movement & Energy',
        focus: 'Increase physical activity gradually'
      },
      {
        week: 4,
        theme: 'Stress & Mindfulness',
        focus: 'Build resilience and stress management'
      }
    ];

    return focuses.slice(0, Math.min(weeks, focuses.length));
  },

  /**
   * Get daily habit recommendations
   * @returns {object} Daily routine structure
   */
  getDailyHabits: () => {
    return {
      morning: [
        '🌅 Wake at consistent time',
        '💧 Drink water',
        '🧘 5-min meditation',
        '📱 Check wellness progress'
      ],
      daytime: [
        '🚶 Move every hour',
        '🥗 Eat balanced meals',
        '☀️ Get sunlight exposure',
        '⏸️ Take breaks regularly'
      ],
      evening: [
        '🍽️ Dinner 2-3 hours before bed',
        '📵 No screens 1 hour before bed',
        '📓 Gratitude journaling',
        '😴 Sleep at consistent time'
      ]
    };
  },

  /**
   * Get helpful resources
   * @param {object} recs - Recommendations
   * @returns {array} Resources and tools
   */
  getResources: (recs) => {
    return [
      {
        name: 'Meditation Apps',
        examples: ['Headspace', 'Calm', 'Insight Timer'],
        category: 'Mental Health'
      },
      {
        name: 'Sleep Tracking',
        examples: ['Sleep Cycle', 'AutoSleep'],
        category: 'Physical Health'
      },
      {
        name: 'Fitness Trackers',
        examples: ['Fitbit', 'Apple Watch', 'Garmin'],
        category: 'Physical Health'
      },
      {
        name: 'Stress Management',
        examples: ['Wim Hof Method', 'Breathwrk'],
        category: 'Mental Health'
      },
      {
        name: 'Professional Support',
        examples: ['Therapist', 'Coach', 'Doctor'],
        category: 'All'
      }
    ];
  },

  /**
   * Generate progress checkpoints
   * @param {number} totalDays - Total days
   * @returns {array} Checkpoint dates and expectations
   */
  generateCheckpoints: (totalDays) => {
    const checkpoints = [];
    const intervals = [7, 14, 21, 30];

    intervals.forEach(days => {
      if (days <= totalDays) {
        checkpoints.push({
          day: days,
          date: new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          action: `Review progress and adjust habits - ${days}-day check-in`,
          expectedOutcome: `${Math.round(5 * (days / 7))}% improvement expected`
        });
      }
    });

    return checkpoints;
  },

  /**
   * Get expected outcomes
   * @param {object} recs - Recommendations
   * @returns {object} Projected improvements
   */
  getExpectedOutcome: (recs) => {
    const projection = PredictionEngine.simulateImprovementScenarios();
    
    if (!projection) {
      return {
        message: 'Continue following recommendations to see improvements',
        timeline: '30 days'
      };
    }

    return {
      current: Math.round(projection.current),
      projected: projection.scenarios[2].projection,
      improvement: projection.scenarios[2].projection - Math.round(projection.current),
      timeline: '60 days',
      message: projection.recommendation,
      confidence: '75%'
    };
  },

  /**
   * Format recommendations for display
   * @param {object} recommendation - Single recommendation
   * @returns {object} Formatted recommendation
   */
  formatRecommendation: (recommendation) => {
    return {
      id: recommendation.id,
      title: recommendation.title,
      category: recommendation.category,
      priority: recommendation.priority,
      priorityColor: 
        recommendation.priority === 'CRITICAL' ? '#ef4444' :
        recommendation.priority === 'HIGH' ? '#f59e0b' :
        recommendation.priority === 'MEDIUM' ? '#3b82f6' : '#10b981',
      description: recommendation.recommendations[0],
      recommendations: recommendation.recommendations,
      actions: recommendation.actions || []
    };
  },

  /**
   * Get recommendation HTML for display
   * @param {object} recommendation - Recommendation object
   * @returns {string} HTML string
   */
  getRecommendationHTML: (recommendation) => {
    const formatted = RecommendationEngine.formatRecommendation(recommendation);
    
    return `
      <div class="recommendation-card">
        <div class="recommendation-header">
          <div>
            <h3 class="recommendation-title">${formatted.title}</h3>
            <span class="recommendation-priority ${formatted.priority.toLowerCase()}">
              ${formatted.priority}
            </span>
          </div>
        </div>
        <ul class="recommendation-list">
          ${formatted.recommendations.map(rec => 
            `<li>${rec}</li>`
          ).join('')}
        </ul>
        <div class="recommendation-actions">
          ${formatted.actions.map(action => 
            `<button class="btn btn-sm btn-secondary">${action}</button>`
          ).join('')}
        </div>
      </div>
    `;
  }
};

/**
 * NEUROWELL - Recommendations Page Manager
 * Handles recommendations page display and interactions
 */
const RecommendationsPageManager = {
  /**
   * Initialize recommendations page
   */
  init: () => {
    console.log('💡 Initializing Recommendations Page...');

    const scoreReport = ScoringEngine.getScoreReport();
    if (!scoreReport) {
      RecommendationsPageManager.showNoDataView();
      return;
    }

    // Render sections
    RecommendationsPageManager.renderSummary(scoreReport);
    RecommendationsPageManager.renderRecommendations();
    RecommendationsPageManager.renderQuickWins();
    RecommendationsPageManager.renderWellnessPlan();
    RecommendationsPageManager.renderResources();
    RecommendationsPageManager.renderActionPlan();

    console.log('✅ Recommendations Page Ready');
  },

  /**
   * Show no data view
   */
  showNoDataView: () => {
    const container = document.getElementById('recommendationsContainer');
    if (!container) return;

    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">💡</div>
        <h3>No Recommendations Available</h3>
        <p>Complete an assessment first to get personalized recommendations.</p>
        <a href="assessment.html" class="btn btn-primary">Start Assessment</a>
      </div>
    `;
  },

  /**
   * Render summary section
   */
  renderSummary: (report) => {
    const container = document.getElementById('summarySection');
    if (!container) return;

    const { scores, burnoutStatus } = report;

    let html = `
      <div class="card" data-animate>
        <div class="card-header">
          <h2>Your Wellness Summary</h2>
        </div>
        <div class="card-body">
          <div class="grid grid-3" style="margin-bottom: 1.5rem;">
            <div style="text-align: center;">
              <div style="font-size: 3rem; font-weight: 700; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">
                ${scores.overall}%
              </div>
              <div style="color: var(--text-tertiary); margin-top: 0.5rem;">Overall Wellness</div>
            </div>
            <div style="text-align: center;">
              <div style="font-size: 2rem; color: var(--warning);">
                ${report.burnoutRisk}%
              </div>
              <div style="color: var(--text-tertiary); margin-top: 0.5rem;">Burnout Risk</div>
            </div>
            <div style="text-align: center;">
              <div style="font-size: 2rem; color: var(--success);">
                ${report.trend.direction}
              </div>
              <div style="color: var(--text-tertiary); margin-top: 0.5rem;">Stress Trend</div>
            </div>
          </div>
          <p style="color: var(--text-secondary); margin-bottom: 1rem;">
            ${report.trend.message}
          </p>
        </div>
      </div>
    `;

    container.innerHTML = html;
  },

  /**
   * Render recommendations
   */
  renderRecommendations: () => {
    const container = document.getElementById('recommendationsContent');
    if (!container) return;

    const recs = RecommendationEngine.generateRecommendations();
    if (recs.error) return;

    let html = '';

    // Render by priority
    const priorities = ['CRITICAL', 'HIGH', 'MEDIUM'];
    let recommendationCount = 0;

    priorities.forEach(priority => {
      const recsByPriority = recs.recommendations[priority] || [];
      
      if (recsByPriority.length > 0) {
        html += `<div style="margin-bottom: 2rem;">`;
        html += `<h3 style="margin-bottom: 1rem; color: ${
          priority === 'CRITICAL' ? '#ef4444' :
          priority === 'HIGH' ? '#f59e0b' : '#3b82f6'
        }">
          ${priority} PRIORITY${recsByPriority.length > 1 ? 'IES' : ''} (${recsByPriority.length})
        </h3>`;

        recsByPriority.forEach(rec => {
          html += RecommendationEngine.getRecommendationHTML(rec);
          recommendationCount++;
        });

        html += `</div>`;
      }
    });

    container.innerHTML = html;
  },

  /**
   * Render quick wins
   */
  renderQuickWins: () => {
    const container = document.getElementById('quickWinsSection');
    if (!container) return;

    const quickWins = RecommendationEngine.getQuickWins();

    let html = `
      <div class="card" data-animate>
        <div class="card-header">
          <h3>💪 Quick Wins (Start Today!)</h3>
        </div>
        <div class="card-body">
          <div class="grid grid-2">
    `;

    quickWins.slice(0, 6).forEach(win => {
      html += `
        <div style="padding: 1rem; background: var(--bg-tertiary); border-radius: var(--radius-lg);">
          <h4 style="margin-bottom: 0.5rem;">${win.title}</h4>
          <p style="font-size: 0.875rem; color: var(--text-secondary); margin-bottom: 0.5rem;">
            ${win.description}
          </p>
          <div style="font-size: 0.75rem; color: var(--text-tertiary);">
            ⏱️ ${win.timeRequired} | 📊 ${win.difficulty}
          </div>
        </div>
      `;
    });

    html += `
          </div>
        </div>
      </div>
    `;

    container.innerHTML = html;
  },

  /**
   * Render wellness plan
   */
  renderWellnessPlan: () => {
    const container = document.getElementById('wellnessPlanSection');
    if (!container) return;

    const plan = RecommendationEngine.generateWellnessPlan(30);
    if (!plan) return;

    let html = `
      <div class="card" data-animate>
        <div class="card-header">
          <h3>📋 Your 30-Day Wellness Plan</h3>
        </div>
        <div class="card-body">
          <div style="background: var(--bg-tertiary); padding: 1rem; border-radius: var(--radius-lg); margin-bottom: 1.5rem;">
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem;">
              <div>
                <div style="font-size: 0.875rem; color: var(--text-tertiary);">START DATE</div>
                <div style="font-weight: 700; color: var(--primary-light);">${plan.startDate}</div>
              </div>
              <div>
                <div style="font-size: 0.875rem; color: var(--text-tertiary);">END DATE</div>
                <div style="font-weight: 700; color: var(--success);">${plan.endDate}</div>
              </div>
              <div>
                <div style="font-size: 0.875rem; color: var(--text-tertiary);">DURATION</div>
                <div style="font-weight: 700;">${plan.duration}</div>
              </div>
            </div>
          </div>

          <h4 style="margin-bottom: 1rem;">Main Goals</h4>
          <div style="margin-bottom: 1.5rem;">
            ${plan.goals.map(goal => `
              <div style="padding: 0.75rem; background: var(--bg-tertiary); border-radius: var(--radius-md); margin-bottom: 0.5rem; border-left: 4px solid ${
                goal.priority === 'HIGH' ? '#f59e0b' : '#3b82f6'
              };">
                <strong>${goal.title}</strong>
                <p style="font-size: 0.875rem; margin-top: 0.25rem;">${goal.description}</p>
              </div>
            `).join('')}
          </div>

          <h4 style="margin-bottom: 1rem;">Daily Habits</h4>
          <div class="grid grid-3" style="gap: 1rem;">
            ${Object.entries(plan.dailyHabits).map(([time, habits]) => `
              <div>
                <h5 style="text-transform: capitalize; margin-bottom: 0.5rem; color: var(--primary-light);">
                  ${time === 'daytime' ? '☀️ Daytime' : time === 'morning' ? '🌅 Morning' : '🌙 Evening'}
                </h5>
                <ul style="list-style: none; padding: 0;">
                  ${habits.map(h => `<li style="margin-bottom: 0.25rem; font-size: 0.875rem;">✓ ${h}</li>`).join('')}
                </ul>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;

    container.innerHTML = html;
  },

  /**
   * Render resources
   */
  renderResources: () => {
    const container = document.getElementById('resourcesSection');
    if (!container) return;

    const resources = RecommendationEngine.getResources({});

    let html = `
      <div class="card" data-animate>
        <div class="card-header">
          <h3>📚 Helpful Resources</h3>
        </div>
        <div class="card-body">
          <div class="grid grid-2" style="gap: 1rem;">
    `;

    resources.forEach(resource => {
      html += `
        <div style="background: var(--bg-tertiary); padding: 1rem; border-radius: var(--radius-lg);">
          <h5 style="margin-bottom: 0.5rem;">${resource.name}</h5>
          <ul style="list-style: none; padding: 0;">
            ${resource.examples.map(ex => 
              `<li style="font-size: 0.875rem; color: var(--text-secondary); margin-bottom: 0.25rem;">
                • ${ex}
              </li>`
            ).join('')}
          </ul>
        </div>
      `;
    });

    html += `
          </div>
        </div>
      </div>
    `;

    container.innerHTML = html;
  },

  /**
   * Render action plan
   */
  renderActionPlan: () => {
    const container = document.getElementById('actionPlanSection');
    if (!container) return;

    const plan = RecommendationEngine.generateWellnessPlan(30);
    if (!plan) return;

    let html = `
      <div class="card" data-animate>
        <div class="card-header">
          <h3>✅ Progress Checkpoints</h3>
        </div>
        <div class="card-body">
    `;

    plan.checkpoints.forEach((checkpoint, index) => {
      html += `
        <div style="padding-bottom: 1rem; margin-bottom: 1rem; border-bottom: 1px solid var(--border-color);">
          <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 0.5rem;">
            <div style="
              width: 40px; 
              height: 40px; 
              background: var(--primary-gradient);
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-weight: 700;
            ">
              ${checkpoint.day}
            </div>
            <div>
              <div style="font-weight: 600;">${checkpoint.date}</div>
              <div style="font-size: 0.875rem; color: var(--text-tertiary);">Day ${checkpoint.day}</div>
            </div>
          </div>
          <p style="margin-left: 56px; font-size: 0.875rem;">
            ${checkpoint.action}
          </p>
          <p style="margin-left: 56px; font-size: 0.75rem; color: var(--success);">
            ${checkpoint.expectedOutcome}
          </p>
        </div>
      `;
    });

    html += `
        </div>
      </div>
    `;

    container.innerHTML = html;
  }
};

// Initialize when page loads
document.addEventListener('DOMContentLoaded', RecommendationsPageManager.init);
