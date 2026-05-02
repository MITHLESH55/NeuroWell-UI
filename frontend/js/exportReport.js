/**
 * NEUROWELL - Export & Report Generation Module
 * Generates comprehensive wellness reports with all system data
 * Supports JSON export for full data backup and sharing
 * 
 * FEATURES:
 * - Complete wellness report with scores, insights, recommendations
 * - Goal and habit tracking data
 * - Gamification statistics
 * - Weekly/monthly trends
 * - JSON export for backup/sharing
 * - Downloadable reports
 */

const ReportManager = {
  /**
   * Generate comprehensive wellness report
   * Integrates data from all modules
   * @returns {object} Complete report data
   */
  generateWellnessReport: () => {
    try {
      const assessmentData = Utility.getAssessmentData();
      
      if (!assessmentData || !assessmentData.scores) {
        return { error: 'No wellness data. Please complete an assessment.' };
      }

      const scores = assessmentData.scores;
      const timestamp = assessmentData.timestamp || new Date().toISOString();

      // Compile all data
      const report = {
        metadata: {
          generated: new Date().toISOString(),
          version: '1.0',
          platform: 'NeuroWell Wellness Intelligence Platform'
        },
        
        // Core wellness scores
        wellness: {
          scores: scores,
          riskAssessment: RecommendationEngine.assessRisk(scores),
          focusAreas: RecommendationEngine.identifyFocusAreas(scores),
          timestamp: timestamp
        },

        // Recommendations
        recommendations: {
          suggestions: RecommendationEngine.generateSuggestions(scores),
          experts: RecommendationEngine.getExpertRecommendations(scores),
          actionItems: RecommendationEngine.generateActionItems(scores)
        },

        // Daily routine
        routine: RoutineGenerator.generateDailyRoutine(scores),

        // Goals tracking
        goals: {
          all: GoalTracker.getGoals(),
          statistics: GoalTracker.getStatistics(),
          completed: GoalTracker.getCompletedGoals(),
          active: GoalTracker.getActiveGoals()
        },

        // Habits tracking
        habits: {
          checkins: HabitsTracker.getCheckIns(),
          weekly: HabitsTracker.getWeeklySummary(),
          moodTrend: HabitsTracker.getMoodTrend(),
          completionStats: HabitsTracker.getCompletionStats(
            Utility.daysAgo(30).toISOString().split('T')[0],
            new Date().toISOString().split('T')[0]
          )
        },

        // Gamification
        gamification: {
          data: GamificationEngine.getGamificationData(),
          statistics: GamificationEngine.getStatistics(),
          levelProgress: GamificationEngine.getNextLevelProgress()
        },

        // Insights & alerts
        insights: {
          analysis: InsightsEngine.analyzeWellness(),
          alerts: AlertSystem.generateAlerts(scores)
        },

        // Summary
        summary: {
          mainProblemArea: RecommendationEngine.identifyFocusAreas(scores).primary,
          criticalAlerts: AlertSystem.getCriticalAlerts(scores).length,
          goalsCompleted: GoalTracker.getCompletedGoals().length,
          currentStreak: Object.values(HabitsTracker.getHabitsData()).length > 0 ? 'Active' : 'Inactive'
        }
      };

      return report;
    } catch (error) {
      console.error('❌ Error generating report:', error);
      return { error: 'Failed to generate report. Check console for details.' };
    }
  },
  
  /**
   * Get score status
   */
  getScoreStatus: (score) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Poor';
  },

  /**
   * Get score description
   */
  getScoreDescription: (score) => {
    if (score >= 80) return 'Your overall wellness is excellent. Keep up the great work!';
    if (score >= 60) return 'Your overall wellness is good. Continue with healthy habits.';
    if (score >= 40) return 'Your wellness is fair. Consider implementing recommended changes.';
    return 'Your wellness needs attention. Prioritize the recommended actions.';
  },

  /**
   * Get burnout risk level
   */
  getBurnoutRiskLevel: (scores) => {
    const avgScore = (scores.physical + scores.mental + scores.emotional) / 3;
    if (avgScore >= 70) return 'Low Risk';
    if (avgScore >= 50) return 'Moderate Risk';
    return 'High Risk';
  },

  /**
   * Get burnout recommendation
   */
  getBurnoutRecommendation: (scores) => {
    const avgScore = (scores.physical + scores.mental + scores.emotional) / 3;
    if (avgScore >= 70) {
      return 'Maintain current wellness practices. Regular check-ins recommended.';
    } else if (avgScore >= 50) {
      return 'Implement stress management techniques. Consider professional consultation.';
    } else {
      return 'Immediate action needed. Prioritize mental health support and rest.';
    }
  },

  /**
   * Get improvement suggestions
   */
  getImprovementSuggestions: (scores) => {
    const suggestions = [];
    
    if (scores.physical < 60) {
      suggestions.push('Increase physical activity to 30 minutes daily');
    }
    if (scores.mental < 60) {
      suggestions.push('Practice stress management techniques like meditation');
    }
    if (scores.emotional < 60) {
      suggestions.push('Improve work-life balance and social connections');
    }
    
    return suggestions;
  },

  /**
   * Get top recommendations
   */
  getTopRecommendations: (scores) => {
    const recommendations = [];

    if (scores.sleep < 60) {
      recommendations.push({
        category: 'Sleep',
        action: 'Maintain consistent sleep schedule',
        priority: 'High'
      });
    }
    
    if (scores.physical < 50) {
      recommendations.push({
        category: 'Fitness',
        action: 'Increase daily movement and exercise',
        priority: 'High'
      });
    }

    if (scores.mental < 50) {
      recommendations.push({
        category: 'Mental Health',
        action: 'Practice daily meditation or mindfulness',
        priority: 'High'
      });
    }

    return recommendations.slice(0, 5);
  },

  /**
   * Generate report summary
   */
  generateReportSummary: (scores, goalStats, trend) => {
    const avgScore = (scores.physical + scores.mental + scores.emotional) / 3;
    
    return {
      overallAssessment: `Based on your current wellness scores, you are performing at ${ReportManager.getScoreStatus(avgScore)} level.`,
      goalProgress: `You have completed ${goalStats.completed} out of ${goalStats.total} wellness goals with ${goalStats.averageProgress}% average progress.`,
      trend: `Your wellness trend is ${trend}.`,
      nextSteps: `${ReportManager.getImprovementSuggestions(scores).join('; ')}`,
      actionItems: [
        'Review and update wellness goals monthly',
        'Schedule regular check-ups and assessments',
        'Track progress with the goal tracking system',
        'Engage with educational content in the Knowledge Hub'
      ]
    };
  },

  // ===== EXPORT FUNCTIONS =====

  /**
   * Export report as JSON
   * VIVA: "JSON export allows data to be imported into other systems or analyzed externally"
   */
  exportAsJSON: () => {
    const report = ReportManager.generateWellnessReport();
    
    if (report.error) {
      alert(report.error);
      return;
    }

    const dataStr = JSON.stringify(report, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    ReportManager.downloadFile(dataBlob, 'neurowell-wellness-report.json');
  },

  /**
   * Export report as CSV
   * VIVA: "CSV export enables analysis in spreadsheet applications"
   */
  exportAsCSV: () => {
    const report = ReportManager.generateWellnessReport();
    
    if (report.error) {
      alert(report.error);
      return;
    }

    let csv = 'NeuroWell Wellness Report\n';
    csv += `Generated: ${new Date().toLocaleString()}\n\n`;

    // Wellness Scores
    csv += 'Wellness Scores\n';
    csv += 'Category,Score,Status\n';
    csv += `Overall,${report.wellnessScores.overall.score},${report.wellnessScores.overall.status}\n`;
    csv += `Physical,${report.wellnessScores.physical.score},${report.wellnessScores.physical.status}\n`;
    csv += `Mental,${report.wellnessScores.mental.score},${report.wellnessScores.mental.status}\n`;
    csv += `Emotional,${report.wellnessScores.emotional.score},${report.wellnessScores.emotional.status}\n\n`;

    // Goals
    csv += 'Goal Progress\n';
    csv += 'Goal Name,Progress %,Status,Current,Target\n';
    report.goalProgress.goals.forEach(goal => {
      csv += `${goal.name},${goal.progress}%,${goal.status},${goal.current},${goal.target}\n`;
    });

    csv += '\n\nBurnout Analysis\n';
    csv += `Risk Level,${report.burnoutAnalysis.riskLevel}\n`;
    csv += `Risk Score,${report.burnoutAnalysis.score}\n`;

    const dataBlob = new Blob([csv], { type: 'text/csv' });
    ReportManager.downloadFile(dataBlob, 'neurowell-wellness-report.csv');
  },

  /**
   * Export as plain text
   */
  exportAsText: () => {
    const report = ReportManager.generateWellnessReport();
    
    if (report.error) {
      alert(report.error);
      return;
    }

    let text = '=== NEUROWELL WELLNESS REPORT ===\n';
    text += `Generated: ${new Date().toLocaleString()}\n\n`;

    text += '--- WELLNESS SCORES ---\n';
    text += `Overall Score: ${report.wellnessScores.overall.score}/100 (${report.wellnessScores.overall.status})\n`;
    text += `Physical Score: ${report.wellnessScores.physical.score}/100\n`;
    text += `Mental Score: ${report.wellnessScores.mental.score}/100\n`;
    text += `Emotional Score: ${report.wellnessScores.emotional.score}/100\n\n`;

    text += '--- BURNOUT ANALYSIS ---\n';
    text += `Risk Level: ${report.burnoutAnalysis.riskLevel}\n`;
    text += `Recommendation: ${report.burnoutAnalysis.recommendation}\n\n`;

    text += '--- GOAL PROGRESS ---\n';
    text += `Completed: ${report.goalProgress.summary.completed}/${report.goalProgress.summary.total}\n`;
    text += `Average Progress: ${report.goalProgress.summary.averageProgress}%\n\n`;

    text += '--- RECOMMENDATIONS ---\n';
    report.recommendations.forEach(rec => {
      text += `• ${rec.category}: ${rec.action} (${rec.priority})\n`;
    });

    text += '\n--- SUMMARY ---\n';
    text += report.summary.overallAssessment + '\n';
    text += report.summary.goalProgress + '\n';
    text += report.summary.trend + '\n';

    const dataBlob = new Blob([text], { type: 'text/plain' });
    ReportManager.downloadFile(dataBlob, 'neurowell-wellness-report.txt');
  },

  /**
   * Download file utility
   */
  downloadFile: (blob, filename) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    console.log(`✓ Report exported: ${filename}`);
  },

  /**
   * Export comprehensive wellness report with all new systems
   * ENHANCED: Includes goals, habits, gamification, insights
   */
  exportEnhancedReport: () => {
    try {
      const report = ReportManager.generateWellnessReport();
      
      if (report.error) {
        Utility.showFeedback(report.error, 'error');
        return;
      }

      const jsonString = JSON.stringify(report, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      
      const date = new Date().toISOString().split('T')[0];
      ReportManager.downloadFile(blob, `neurowell-complete-report-${date}.json`);
      Utility.showFeedback('✓ Report exported successfully!', 'success', 3000);
    } catch (error) {
      console.error('❌ Export error:', error);
      Utility.showFeedback('Failed to export report', 'error');
    }
  },

  /**
   * Export monthly wellness summary
   */
  exportMonthlySummary: () => {
    try {
      const goals = GoalTracker.getGoals();
      const habits = HabitsTracker.getWeeklySummary();
      const gamification = GamificationEngine.getStatistics();
      const assessmentData = Utility.getAssessmentData();

      const summary = {
        period: 'Last 30 days',
        generated: new Date().toISOString(),
        goals: {
          completed: goals.filter(g => g.completed).length,
          total: goals.length,
          completionRate: GoalTracker.getOverallCompletion()
        },
        habits: habits,
        gamification: gamification,
        wellness: assessmentData ? assessmentData.scores : {}
      };

      const jsonString = JSON.stringify(summary, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const date = new Date().toISOString().split('T')[0];
      ReportManager.downloadFile(blob, `neurowell-monthly-summary-${date}.json`);
      Utility.showFeedback('✓ Monthly summary exported!', 'success');
    } catch (error) {
      console.error('❌ Export error:', error);
      Utility.showFeedback('Failed to export summary', 'error');
    }
  },

  /**
   * Export backup of all user data
   */
  exportDataBackup: () => {
    try {
      const backup = {
        timestamp: new Date().toISOString(),
        version: '1.0',
        assessment: StorageManager.getAssessmentResponses(),
        scores: StorageManager.getWellnessScore(),
        goals: GoalTracker.getGoals(),
        habits: HabitsTracker.getHabitsData(),
        checkins: HabitsTracker.getCheckIns(),
        gamification: GamificationEngine.getGamificationData(),
        streaks: JSON.parse(localStorage.getItem(CONSTANTS.STORAGE.STREAKS) || '{}')
      };

      const jsonString = JSON.stringify(backup, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const date = new Date().toISOString().split('T')[0];
      ReportManager.downloadFile(blob, `neurowell-backup-${date}.json`);
      Utility.showFeedback('✓ Data backup created!', 'success');
    } catch (error) {
      console.error('❌ Backup error:', error);
      Utility.showFeedback('Failed to create backup', 'error');
    }
  },

  /**
   * Import data from backup file
   */
  importDataBackup: (fileInput) => {
    try {
      const file = fileInput.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const backup = JSON.parse(e.target.result);
          
          // Restore all data
          if (backup.assessment) StorageManager.saveAssessmentResponses(backup.assessment);
          if (backup.goals) GoalTracker.saveGoals(backup.goals);
          if (backup.gamification) GamificationEngine.saveGamificationData(backup.gamification);
          if (backup.checkins) localStorage.setItem(CONSTANTS.STORAGE.CHECK_INS, JSON.stringify(backup.checkins));
          if (backup.streaks) localStorage.setItem(CONSTANTS.STORAGE.STREAKS, JSON.stringify(backup.streaks));

          Utility.showFeedback('✓ Data restored successfully! Please refresh the page.', 'success', 5000);
        } catch (error) {
          console.error('❌ Import parsing error:', error);
          Utility.showFeedback('Invalid backup file format', 'error');
        }
      };
      reader.readAsText(file);
    } catch (error) {
      console.error('❌ Import error:', error);
      Utility.showFeedback('Failed to import backup', 'error');
    }
  },

  // ===== UI RENDERING =====

  /**
   * Render export buttons
   */
  renderExportButtons: (containerId) => {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = `
      <div class="export-section">
        <h3>📥 Download Your Report</h3>
        <p>Export your wellness data in your preferred format:</p>
        
        <div class="export-buttons">
          <button class="btn btn-primary" onclick="ReportManager.exportAsJSON()">
            📄 Export as JSON
          </button>
          <button class="btn btn-secondary" onclick="ReportManager.exportAsCSV()">
            📊 Export as CSV
          </button>
          <button class="btn btn-secondary" onclick="ReportManager.exportAsText()">
            📝 Export as Text
          </button>
        </div>

        <div class="export-info">
          <p><strong>What's included:</strong></p>
          <ul>
            <li>Overall wellness scores</li>
            <li>Goal progress and completion status</li>
            <li>Burnout risk analysis</li>
            <li>Wellness trends</li>
            <li>Personalized recommendations</li>
            <li>Upcoming appointments</li>
          </ul>
        </div>
      </div>
    `;
  },

  /**
   * Show report preview
   */
  showReportPreview: () => {
    const report = ReportManager.generateWellnessReport();
    
    if (report.error) {
      alert(report.error);
      return;
    }

    const modal = document.createElement('div');
    modal.className = 'modal report-modal';
    modal.innerHTML = `
      <div class="modal-content report-preview">
        <div class="modal-header">
          <h2>📊 Wellness Report Preview</h2>
          <button class="btn-close" onclick="this.closest('.modal').remove()">✕</button>
        </div>

        <div class="modal-body report-body">
          <div class="report-section">
            <h3>Wellness Scores</h3>
            <div class="score-grid">
              <div class="score-item">
                <span class="score-label">Overall</span>
                <span class="score-value">${report.wellnessScores.overall.score}</span>
              </div>
              <div class="score-item">
                <span class="score-label">Physical</span>
                <span class="score-value">${report.wellnessScores.physical.score}</span>
              </div>
              <div class="score-item">
                <span class="score-label">Mental</span>
                <span class="score-value">${report.wellnessScores.mental.score}</span>
              </div>
              <div class="score-item">
                <span class="score-label">Emotional</span>
                <span class="score-value">${report.wellnessScores.emotional.score}</span>
              </div>
            </div>
          </div>

          <div class="report-section">
            <h3>Goal Progress</h3>
            <p>Completed: ${report.goalProgress.summary.completed}/${report.goalProgress.summary.total}</p>
            <p>Average Progress: ${report.goalProgress.summary.averageProgress}%</p>
          </div>

          <div class="report-section">
            <h3>Burnout Analysis</h3>
            <p>Risk Level: <strong>${report.burnoutAnalysis.riskLevel}</strong></p>
            <p>${report.burnoutAnalysis.recommendation}</p>
          </div>

          <div class="report-section">
            <h3>Key Recommendations</h3>
            <ul>
              ${report.recommendations.map(rec => `
                <li><strong>${rec.category}:</strong> ${rec.action}</li>
              `).join('')}
            </ul>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="ReportManager.exportAsJSON()">
            📄 Export JSON
          </button>
          <button class="btn btn-secondary" onclick="ReportManager.exportAsCSV()">
            📊 Export CSV
          </button>
          <button class="btn btn-primary" onclick="this.closest('.modal').remove()">
            Close
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    modal.style.display = 'flex';

    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.remove();
    });
  }
};
