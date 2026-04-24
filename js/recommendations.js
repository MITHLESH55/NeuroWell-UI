/**
 * NEUROWELL - Recommendations Page Logic
 * Fetches data from localStorage and dynamically renders the UI.
 * Uses only client-side logic.
 */

document.addEventListener('DOMContentLoaded', () => {
  initRecommendations();
});

function initRecommendations() {
  const container = document.getElementById('recommendationsContainer');
  if (!container) return;

  // 1. Fetch data from localStorage
  const scoreData = StorageManager.getWellnessScore();
  
  if (!scoreData || !scoreData.scores) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📋</div>
        <h3>No Assessment Data</h3>
        <p>Complete an assessment to see personalized recommendations.</p>
        <a href="assessment.html" class="btn btn-primary">Start Assessment</a>
      </div>
    `;
    return;
  }

  const scoreEnvelope = scoreData.scores || scoreData;
  const scores = scoreEnvelope.categoryScores || scoreEnvelope.scores || scoreEnvelope;

  // 2. Call recommendation engine
  const recs = SmartRecommendationEngine.generateRecommendations(scores);

  // 3. Dynamically render UI
  renderRiskInsights(scores);
  renderPersonalizedRecommendations(scores, recs);
  renderExpertSuggestions(recs.doctors);
}

function getBadgeHTML(score) {
  if (score < 40) return `<span class="badge badge-low">LOW</span>`;
  if (score <= 70) return `<span class="badge badge-medium">MODERATE</span>`;
  return `<span class="badge badge-high">HIGH</span>`;
}

function getScoreColorClass(score) {
  if (score < 40) return 'text-low';
  if (score <= 70) return 'text-medium';
  return 'text-high';
}

function renderRiskInsights(scores) {
  const section = document.getElementById('riskInsightsSection');
  if (!section) return;

  const overallScore = scores.overall || Math.round((scores.physical + scores.mental + scores.emotional) / 3);
  let riskLevel = 'Low Risk';
  let riskColor = 'var(--success)';
  if (overallScore < 40) {
    riskLevel = 'High Risk';
    riskColor = '#ef4444'; // Red
  } else if (overallScore <= 70) {
    riskLevel = 'Moderate Risk';
    riskColor = '#f59e0b'; // Yellow
  }

  section.innerHTML = `
    <div class="card" data-animate>
      <div class="card-header">
        <h3>⚠️ Risk Insights</h3>
      </div>
      <div class="card-body">
        <div style="margin-bottom: 1rem;">
          <div style="font-size: 0.875rem; color: var(--text-tertiary); text-transform: uppercase;">Overall Wellness</div>
          <div style="font-size: 2.5rem; font-weight: 700; color: ${riskColor};">
            ${overallScore}%
          </div>
          <div style="margin-top: 0.5rem; font-weight: 600; color: ${riskColor};">${riskLevel}</div>
        </div>
        <p style="color: var(--text-secondary);">
          Your current overall wellness indicates a <strong>${riskLevel.toLowerCase()}</strong> for burnout. Focus on the personalized recommendations below to improve or maintain your well-being.
        </p>
      </div>
    </div>
  `;
}

function renderPersonalizedRecommendations(scores, recs) {
  const section = document.getElementById('personalizedRecsSection');
  if (!section) return;

  const categories = [
    { key: 'physical', label: 'Physical Health', score: scores.physical, icon: 'fa-heartbeat' },
    { key: 'mental', label: 'Mental Health', score: scores.mental, icon: 'fa-brain' },
    { key: 'emotional', label: 'Emotional Health', score: scores.emotional, icon: 'fa-smile' }
  ];

  let html = `<div class="grid grid-3" style="gap: 1.5rem;">`;

  categories.forEach(cat => {
    const listItems = recs[cat.key].map(item => `
      <li style="margin-bottom: 0.75rem; display: flex; align-items: flex-start; gap: 0.5rem;">
        <i class="fas fa-check-circle" style="color: var(--primary-light); margin-top: 0.2rem;"></i>
        <span>${item}</span>
      </li>
    `).join('');

    html += `
      <div class="card recommendation-card" data-animate style="display: flex; flex-direction: column;">
        <div class="card-header" style="border-bottom: 1px solid var(--border-color); padding-bottom: 1rem; margin-bottom: 1rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
            <h3 style="display: flex; align-items: center; gap: 0.5rem;">
              <i class="fas ${cat.icon} ${getScoreColorClass(cat.score)}"></i> ${cat.label}
            </h3>
            ${getBadgeHTML(cat.score)}
          </div>
          <div style="font-size: 1.5rem; font-weight: 700; margin-top: 0.5rem;" class="${getScoreColorClass(cat.score)}">
            ${cat.score}%
          </div>
        </div>
        <div class="card-body" style="flex: 1;">
          <ul style="list-style: none; padding: 0; margin: 0; color: var(--text-secondary);">
            ${listItems}
          </ul>
        </div>
      </div>
    `;
  });

  html += `</div>`;
  section.innerHTML = html;
}

function renderExpertSuggestions(doctors) {
  const section = document.getElementById('expertSuggestionsSection');
  if (!section) return;

  if (!doctors || doctors.length === 0) {
    section.innerHTML = `<p style="color: var(--text-tertiary);">No experts required at this time. Keep up the good work!</p>`;
    return;
  }

  let html = `<div class="grid grid-2" style="gap: 1.5rem;">`;

  doctors.forEach(doc => {
    html += `
      <div class="card doctor-card" data-animate style="transition: transform 0.3s ease, border-color 0.3s ease;">
        <div class="card-body" style="display: flex; align-items: flex-start; gap: 1.5rem;">
          <div style="
            width: 60px; height: 60px; 
            background: rgba(139, 92, 246, 0.1); 
            border-radius: 50%; 
            display: flex; align-items: center; justify-content: center; 
            font-size: 1.5rem; color: var(--primary-light);
            flex-shrink: 0;
          ">
            <i class="fas ${doc.icon}"></i>
          </div>
          <div style="flex: 1;">
            <div style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: flex-start; gap: 0.5rem; margin-bottom: 0.5rem;">
              <h4 style="margin: 0; font-size: 1.1rem; line-height: 1.3;">${doc.title}</h4>
              <span style="font-size: 0.75rem; background: var(--bg-tertiary); padding: 0.2rem 0.6rem; border-radius: 99px; color: var(--text-tertiary); white-space: nowrap; flex-shrink: 0;">
                ${doc.category}
              </span>
            </div>
            <p style="font-size: 0.875rem; color: var(--text-secondary); margin-bottom: 1rem; line-height: 1.4;">
              ${doc.description}
            </p>
            <button class="btn btn-sm btn-primary" onclick="alert('Booking appointment with ${doc.title}...')">
              Consult Now
            </button>
          </div>
        </div>
      </div>
    `;
  });

  html += `</div>`;
  section.innerHTML = html;
}
