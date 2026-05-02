/**
 * NEUROWELL - Recommendations Page Renderer v2
 * Consumes SmartRecommendationEngine.generateRecommendations(scores)
 * Renders professional glassmorphism card layout — fully dynamic.
 */

document.addEventListener('DOMContentLoaded', () => {
  initRecommendations();
});

// ─────────────────────────────────────────────────────────────────────────────
// Bootstrap
// ─────────────────────────────────────────────────────────────────────────────
function initRecommendations() {
  const container = document.getElementById('recommendationsContainer');
  if (!container) return;

  try {
    let scores = null;
    let isDemo = false;

    // 1. Try StorageManager → wellness score
    if (typeof StorageManager !== 'undefined' && StorageManager.isAvailable()) {
      const saved = StorageManager.getWellnessScore();
      if (saved && saved.scores) {
        const raw = saved.scores;
        const candidate = raw.categoryScores || raw.scores || raw;
        if (candidate && typeof candidate.physical === 'number') scores = candidate;
      }
    }

    // 2. Try ScoringEngine report
    if (!scores && typeof ScoringEngine !== 'undefined') {
      try {
        const report = ScoringEngine.getScoreReport();
        if (report && report.scores && typeof report.scores.physical === 'number') {
          scores = report.scores;
        }
      } catch (e) { console.warn('⚠️ ScoringEngine fallback failed:', e.message); }
    }

    // 3. Demo mode
    if (!scores) {
      if (typeof NeuroUtils !== 'undefined') {
        scores  = NeuroUtils.getDemoData().scores;
        isDemo  = true;
        NeuroUtils.showDemoBanner();
      } else {
        showEmptyState(container);
        return;
      }
    }

    const recs = SmartRecommendationEngine.generateRecommendations(scores);

    renderHeroInsight(recs);
    renderQuickWins(recs.quickWins);
    renderCategories(recs.categories);
    renderExperts(recs.experts);

    if (isDemo) console.info('ℹ️ Recommendations rendered in demo mode.');
  } catch (err) {
    console.error('❌ Recommendations page error:', err);
    showEmptyState(container);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Section 1 — Hero Insight Banner
// ─────────────────────────────────────────────────────────────────────────────
function renderHeroInsight(recs) {
  const el = document.getElementById('riskInsightsSection');
  if (!el) return;
  try {
    const { overallColor, overallLabel, overallMessage, scores } = recs;

    const bars = [
      { label:'Physical',  score: scores.physical,  color:'#667eea' },
      { label:'Mental',    score: scores.mental,    color:'#a855f7' },
      { label:'Emotional', score: scores.emotional, color:'#f43f5e' }
    ].map(b => `
      <div style="margin-bottom:1rem;">
        <div style="display:flex;justify-content:space-between;font-size:0.8rem;color:rgba(226,232,240,0.7);margin-bottom:0.35rem;">
          <span>${b.label}</span><span style="color:${b.color};font-weight:600;">${b.score}%</span>
        </div>
        <div style="background:rgba(255,255,255,0.06);border-radius:99px;height:7px;overflow:hidden;">
          <div style="width:${b.score}%;height:100%;background:${b.color};border-radius:99px;transition:width 0.8s ease;"></div>
        </div>
      </div>`).join('');

    el.innerHTML = `
      <div class="card" data-animate style="border-left:4px solid ${overallColor};">
        <div class="card-body">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:2rem;align-items:center;flex-wrap:wrap;">
            <div>
              <div style="font-size:0.75rem;text-transform:uppercase;letter-spacing:0.08em;color:rgba(226,232,240,0.5);margin-bottom:0.5rem;">Overall Wellness</div>
              <div style="font-size:3.5rem;font-weight:800;color:${overallColor};line-height:1;">${scores.overall}%</div>
              <div style="margin-top:0.5rem;font-size:1rem;font-weight:600;color:${overallColor};">${overallLabel}</div>
              <p style="margin-top:1rem;color:rgba(226,232,240,0.75);font-size:0.9rem;line-height:1.6;">${overallMessage}</p>
            </div>
            <div>${bars}</div>
          </div>
        </div>
      </div>`;
  } catch (e) { console.error('❌ renderHeroInsight:', e); }
}

// ─────────────────────────────────────────────────────────────────────────────
// Section 2 — Quick Wins
// ─────────────────────────────────────────────────────────────────────────────
function renderQuickWins(quickWins) {
  const el = document.getElementById('quickWinsSection');
  if (!el || !quickWins || quickWins.length === 0) return;
  try {
    const cards = quickWins.map(w => `
      <div style="
        background:rgba(16,185,129,0.06);border:1px solid rgba(16,185,129,0.2);
        border-radius:14px;padding:1.25rem;display:flex;gap:1rem;align-items:flex-start;">
        <div style="font-size:1.75rem;line-height:1;">${w.icon}</div>
        <div>
          <div style="font-size:0.7rem;text-transform:uppercase;letter-spacing:0.06em;color:#10b981;font-weight:700;margin-bottom:0.25rem;">
            ${w.category} · ${w.frequency}
          </div>
          <div style="font-size:0.975rem;font-weight:600;color:#f1f5f9;margin-bottom:0.35rem;">${w.title}</div>
          <div style="font-size:0.825rem;color:rgba(226,232,240,0.65);">${w.duration} · ${w.difficulty}</div>
        </div>
      </div>`).join('');

    el.innerHTML = `
      <h2 class="section-heading">⚡ Quick Wins — Start Today</h2>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:1rem;">${cards}</div>`;
  } catch (e) { console.error('❌ renderQuickWins:', e); }
}

// ─────────────────────────────────────────────────────────────────────────────
// Section 3 — Category Recommendations
// ─────────────────────────────────────────────────────────────────────────────
function renderCategories(categories) {
  const el = document.getElementById('personalizedRecsSection');
  if (!el) return;
  try {
    const priorityColors = { CRITICAL:'#ef4444', HIGH:'#f97316', MEDIUM:'#f59e0b', LOW:'#10b981' };

    const categoryHTML = Object.values(categories).map(cat => {
      const cards = cat.suggestions.map(s => {
        const pc = priorityColors[s.priority] || '#94a3b8';
        const tips = (s.tips || []).map(t => `
          <li style="display:flex;align-items:flex-start;gap:0.5rem;margin-bottom:0.4rem;color:rgba(226,232,240,0.65);font-size:0.8rem;">
            <span style="color:${cat.color};margin-top:2px;">›</span><span>${t}</span>
          </li>`).join('');

        return `
          <div style="
            background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);
            border-radius:16px;padding:1.5rem;transition:transform 0.25s,border-color 0.25s;
            border-left:3px solid ${pc};"
            onmouseenter="this.style.transform='translateY(-3px)';this.style.borderColor='${pc}'"
            onmouseleave="this.style.transform='';this.style.borderColor='rgba(255,255,255,0.07)'">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:0.75rem;gap:0.5rem;">
              <div style="display:flex;align-items:center;gap:0.6rem;">
                <span style="font-size:1.5rem;">${s.icon}</span>
                <h4 style="margin:0;font-size:1rem;font-weight:700;color:#f1f5f9;">${s.title}</h4>
              </div>
              <span style="
                background:${pc}18;color:${pc};border:1px solid ${pc}33;
                padding:0.2rem 0.65rem;border-radius:99px;font-size:0.7rem;font-weight:700;
                white-space:nowrap;flex-shrink:0;">${s.priority}</span>
            </div>
            <p style="font-size:0.875rem;color:rgba(226,232,240,0.75);line-height:1.6;margin-bottom:1rem;">${s.description}</p>
            <div style="display:flex;flex-wrap:wrap;gap:0.5rem;margin-bottom:1rem;">
              ${[['⏱',s.duration],['🔁',s.frequency],['📊',s.impact],['💡',s.difficulty]].map(([ico,val])=>`
                <span style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);border-radius:99px;padding:0.2rem 0.65rem;font-size:0.75rem;color:rgba(226,232,240,0.7);">${ico} ${val}</span>`).join('')}
            </div>
            ${tips ? `<ul style="list-style:none;padding:0;margin:0;border-top:1px solid rgba(255,255,255,0.06);padding-top:0.75rem;">${tips}</ul>` : ''}
          </div>`;
      }).join('');

      return `
        <div style="margin-bottom:2.5rem;">
          <div style="display:flex;align-items:center;gap:0.75rem;margin-bottom:1.25rem;flex-wrap:wrap;">
            <span style="font-size:1.5rem;">${cat.icon}</span>
            <h3 style="margin:0;font-size:1.2rem;font-weight:700;color:#f1f5f9;">${cat.name}</h3>
            <span style="background:${cat.bg};color:${cat.color};border:1px solid ${cat.color}33;padding:0.25rem 0.8rem;border-radius:99px;font-size:0.75rem;font-weight:700;">
              ${cat.emoji} ${cat.score}% · ${cat.label}
            </span>
          </div>
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:1.25rem;">${cards}</div>
        </div>`;
    }).join('');

    el.innerHTML = `
      <h2 class="section-heading">🎯 Personalised Recommendations</h2>
      ${categoryHTML}`;
  } catch (e) { console.error('❌ renderCategories:', e); }
}

// ─────────────────────────────────────────────────────────────────────────────
// Section 4 — Expert Doctor Cards (Enhanced)
// ─────────────────────────────────────────────────────────────────────────────
function renderExperts(experts) {
  const el = document.getElementById('expertSuggestionsSection');
  if (!el || !experts || experts.length === 0) return;
  try {
    const urgencyMeta = {
      'Strongly Recommended': { icon:'🚨', pulse:true  },
      'Recommended':           { icon:'⚠️', pulse:false },
      'Beneficial':            { icon:'📈', pulse:false },
      'Optional':              { icon:'✅', pulse:false },
      'Maintenance':           { icon:'⭐', pulse:false }
    };

    const cards = experts.map((doc, idx) => {
      const safeId  = (doc.id || 'expert').replace(/[^a-z0-9]/gi, '-');
      const color   = doc.color  || '#667eea';
      const grad    = doc.gradient || `linear-gradient(135deg,${color},${color}cc)`;
      const uMeta   = urgencyMeta[doc.urgency] || { icon:'💡', pulse:false };
      const pulse   = uMeta.pulse ? 'animation:pulse-ring 2s infinite;' : '';

      const specialtyChips = (doc.specialties || []).map(s =>
        `<span style="background:${color}12;border:1px solid ${color}28;color:${color};border-radius:99px;padding:0.18rem 0.6rem;font-size:0.7rem;font-weight:600;">${s}</span>`
      ).join('');

      const metaRows = [
        doc.approach     && { icon:'💬', label:'Approach',     val: doc.approach     },
        doc.session      && { icon:'📅', label:'Session',      val: doc.session      },
        doc.availability && { icon:'🕐', label:'Availability', val: doc.availability }
      ].filter(Boolean).map(r =>
        `<div style="display:flex;gap:0.6rem;align-items:flex-start;padding:0.5rem 0;border-bottom:1px solid rgba(255,255,255,0.05);">
          <span style="font-size:0.9rem;flex-shrink:0;margin-top:1px;">${r.icon}</span>
          <div>
            <div style="font-size:0.65rem;text-transform:uppercase;letter-spacing:0.06em;color:rgba(226,232,240,0.4);margin-bottom:0.1rem;">${r.label}</div>
            <div style="font-size:0.8rem;color:rgba(226,232,240,0.72);line-height:1.4;">${r.val}</div>
          </div>
        </div>`
      ).join('');

      return `
        <div class="card" data-animate id="expert-card-${safeId}"
          style="transition:transform 0.25s,border-color 0.25s,box-shadow 0.25s;border-top:3px solid ${color};"
          onmouseenter="this.style.transform='translateY(-5px)';this.style.boxShadow='0 16px 40px ${color}22';"
          onmouseleave="this.style.transform='';this.style.boxShadow='';">
          <div class="card-body" style="padding:1.5rem;">

            <!-- Header: avatar + name + urgency -->
            <div style="display:flex;gap:1.1rem;align-items:flex-start;margin-bottom:1.25rem;">
              <!-- Avatar ring -->
              <div style="position:relative;flex-shrink:0;">
                <div style="width:64px;height:64px;border-radius:50%;background:${grad};
                  display:flex;align-items:center;justify-content:center;font-size:1.8rem;
                  box-shadow:0 0 0 4px ${color}22,0 4px 16px ${color}33;${pulse}">
                  ${doc.avatar}
                </div>
                ${uMeta.pulse ? `<span style="position:absolute;bottom:2px;right:2px;width:14px;height:14px;border-radius:50%;background:#ef4444;border:2px solid #0f172a;animation:blink 1.5s infinite;"></span>` : ''}
              </div>

              <!-- Name, subtitle, urgency -->
              <div style="flex:1;min-width:0;">
                <div style="display:flex;flex-wrap:wrap;justify-content:space-between;align-items:flex-start;gap:0.5rem;margin-bottom:0.3rem;">
                  <div>
                    <h4 style="margin:0;font-size:1.05rem;font-weight:700;color:#f1f5f9;">${doc.title}</h4>
                    <div style="font-size:0.78rem;color:rgba(226,232,240,0.5);margin-top:0.15rem;">${doc.subtitle}</div>
                  </div>
                  <span style="background:${doc.urgencyColor}18;color:${doc.urgencyColor};
                    border:1px solid ${doc.urgencyColor}33;border-radius:99px;
                    padding:0.2rem 0.65rem;font-size:0.68rem;font-weight:700;
                    white-space:nowrap;flex-shrink:0;display:flex;align-items:center;gap:0.3rem;">
                    ${uMeta.icon} ${doc.urgency}
                  </span>
                </div>
                <!-- Score bar -->
                <div style="margin-top:0.5rem;">
                  <div style="display:flex;justify-content:space-between;font-size:0.7rem;color:rgba(226,232,240,0.4);margin-bottom:0.25rem;">
                    <span>Relevance Score</span>
                    <span style="color:${doc.urgencyColor};font-weight:700;">${100 - (doc.score||50)}% need</span>
                  </div>
                  <div style="background:rgba(255,255,255,0.06);border-radius:99px;height:5px;overflow:hidden;">
                    <div style="width:${100-(doc.score||50)}%;height:100%;background:${grad};border-radius:99px;transition:width 1s ease;"></div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Description -->
            <p style="font-size:0.865rem;color:rgba(226,232,240,0.75);line-height:1.6;margin-bottom:1rem;">${doc.description}</p>

            <!-- Specialty chips -->
            <div style="display:flex;flex-wrap:wrap;gap:0.4rem;margin-bottom:1rem;">${specialtyChips}</div>

            <!-- Meta rows: approach, session, availability -->
            <div style="margin-bottom:1.25rem;border-top:1px solid rgba(255,255,255,0.06);padding-top:0.25rem;">
              ${metaRows}
            </div>

            <!-- Consult Now button -->
            <button
              id="consult-${safeId}"
              onclick="handleConsultClick('${doc.title.replace(/'/g,"\\'")}')"
              style="width:100%;padding:0.8rem;border-radius:10px;border:none;cursor:pointer;
                background:${grad};color:#fff;font-weight:700;font-size:0.9rem;
                transition:opacity 0.2s,transform 0.2s;letter-spacing:0.02em;
                display:flex;align-items:center;justify-content:center;gap:0.5rem;"
              onmouseenter="this.style.opacity='0.88';this.style.transform='scale(1.01)'"
              onmouseleave="this.style.opacity='1';this.style.transform=''">
              📅 Consult Now
            </button>

          </div>
        </div>`;
    }).join('');

    el.innerHTML = `
      <h2 class="section-heading">🩺 Expert Consultations</h2>
      <p style="color:rgba(226,232,240,0.55);font-size:0.875rem;margin:-0.5rem 0 1.5rem;">Specialists selected based on your wellness scores — sorted by priority.</p>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:1.5rem;">
        ${cards}
      </div>`;

    // Add keyframe styles for pulse animation if not present
    if (!document.getElementById('expert-keyframes')) {
      const style = document.createElement('style');
      style.id    = 'expert-keyframes';
      style.textContent = `
        @keyframes pulse-ring {
          0%   { box-shadow:0 0 0 4px rgba(239,68,68,0.2),0 4px 16px rgba(239,68,68,0.2); }
          50%  { box-shadow:0 0 0 8px rgba(239,68,68,0.05),0 4px 16px rgba(239,68,68,0.3); }
          100% { box-shadow:0 0 0 4px rgba(239,68,68,0.2),0 4px 16px rgba(239,68,68,0.2); }
        }
        @keyframes blink {
          0%,100% { opacity:1; } 50% { opacity:0; }
        }`;
      document.head.appendChild(style);
    }

  } catch (e) { console.error('❌ renderExperts:', e); }
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
function handleConsultClick(doctorTitle) {
  if (typeof NeuroUtils !== 'undefined') {
    NeuroUtils.showToast(`Appointment booking with ${doctorTitle} coming soon! 📅`, 'info', 3500);
  } else {
    console.info(`ℹ️ Consultation requested: ${doctorTitle}`);
  }
}

function showEmptyState(container) {
  container.innerHTML = `
    <div class="empty-state">
      <div class="empty-state-icon">📋</div>
      <h3>No Assessment Data Found</h3>
      <p>Complete a wellness assessment to receive your personalised recommendations.</p>
      <div style="display:flex;gap:1rem;justify-content:center;flex-wrap:wrap;margin-top:1.5rem;">
        <a href="assessment.html" class="btn btn-primary">Start Assessment</a>
        <a href="dashboard.html" class="btn btn-secondary">← Back to Dashboard</a>
      </div>
    </div>`;
}
