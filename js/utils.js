/**
 * NEUROWELL - Utility Module v2
 * Centralised helpers: safe data access, demo mode, error handling, UI feedback.
 * Must be loaded FIRST on every page before any other NeuroWell script.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Demo Mode Controller
// Manages demo state, sample data seeding, and banner lifecycle.
// ─────────────────────────────────────────────────────────────────────────────
const DemoMode = (() => {
  const FLAG_KEY = '_nw_demo_active';
  let _active = false;

  return {
    isActive:   () => _active,
    activate:   () => { _active = true; },
    deactivate: () => { _active = false; },

    /** Seed demo check-ins into localStorage so DailyCheckin page also works */
    seedDemoCheckins() {
      try {
        if (localStorage.getItem('neurowell_checkins')) return; // don't overwrite real data
        const today = new Date();
        const logs = [];
        for (let i = 6; i >= 0; i--) {
          const d = new Date(today);
          d.setDate(d.getDate() - i);
          logs.push({
            id:        d.toISOString().slice(0,10),
            date:      d.toISOString(),
            dateLabel: d.toLocaleDateString('en-GB',{weekday:'short',day:'numeric',month:'short'}),
            mood:      [3,4,3,4,3,4,4][i],
            sleep:     [6,7,6,7,6,7,8][i],
            energy:    [5,6,5,6,6,7,7][i],
            notes:     i === 0 ? 'Demo mode sample entry' : '',
            ts:        d.getTime()
          });
        }
        localStorage.setItem('neurowell_checkins', JSON.stringify(logs));
        console.info('ℹ️ Demo check-ins seeded');
      } catch(e) {}
    },

    /** Seed demo gamification state */
    seedDemoGamification() {
      try {
        if (localStorage.getItem('neurowell_gamification')) return;
        const state = {
          streak: 4, longestStreak: 7, points: 85, totalCheckins: 7,
          lastCheckinDate: new Date().toISOString().slice(0,10),
          earnedBadges: ['first_checkin', 'streak_3', 'pts_50'],
          log: [
            { action:'Daily check-in', points:10, date: new Date().toISOString().slice(0,10), ts: Date.now() },
            { action:'3-day streak bonus', points:15, date: new Date().toISOString().slice(0,10), ts: Date.now()-1 }
          ]
        };
        localStorage.setItem('neurowell_gamification', JSON.stringify(state));
        console.info('ℹ️ Demo gamification seeded');
      } catch(e) {}
    },

    /** Activate full demo mode: seed all subsystems */
    activateFull() {
      this.activate();
      this.seedDemoCheckins();
      this.seedDemoGamification();
    }
  };
})();


// ─────────────────────────────────────────────────────────────────────────────
// NeuroUtils — main utility surface
// ─────────────────────────────────────────────────────────────────────────────
const NeuroUtils = {

  // ── Data retrieval ──────────────────────────────────────────────────────────

  /**
   * Safely fetch and parse assessment data.
   * Tries: ScoringEngine → StorageManager → explicit demo mode.
   * @param {boolean} allowDemo - If true, falls back to demo instead of returning null
   * @returns {{ scoreReport, scores, isDemo } | null}
   */
  getAssessmentData(allowDemo = true) {
    try {
      // 1. Try ScoringEngine (live computed report)
      if (typeof ScoringEngine !== 'undefined' && ScoringEngine.getScoreReport) {
        try {
          const report = ScoringEngine.getScoreReport();
          if (report && report.scores && typeof report.scores.overall === 'number') {
            return { scoreReport: report, scores: report.scores, isDemo: false };
          }
        } catch (e) { console.warn('⚠️ ScoringEngine error:', e.message); }
      }

      // 2. Try StorageManager (saved wellness score)
      if (typeof StorageManager !== 'undefined') {
        try {
          const saved = StorageManager.getWellnessScore();
          if (saved && saved.scores) {
            const actualReport = saved.scores.statuses ? saved.scores : saved;
            const s = actualReport.scores || actualReport.categoryScores || actualReport;
            if (s && typeof s.physical === 'number') {
              return { scoreReport: actualReport, scores: s, isDemo: false };
            }
          }
        } catch (e) { console.warn('⚠️ StorageManager error:', e.message); }
      }

      // 3. Raw localStorage fallback
      try {
        const raw = localStorage.getItem('neurowell_wellness_score');
        if (raw) {
          const parsed = JSON.parse(raw);
          const actualReport = (parsed && parsed.scores && parsed.scores.statuses) ? parsed.scores : parsed;
          const s = actualReport?.scores?.categoryScores || actualReport?.scores || actualReport;
          if (s && typeof s.physical === 'number') {
            return { scoreReport: actualReport, scores: s, isDemo: false };
          }
        }
      } catch (e) {}

      // 4. Demo fallback
      if (allowDemo) {
        console.info('ℹ️ No assessment data — activating Demo Mode.');
        return this.getDemoData();
      }

      return null;
    } catch (err) {
      console.error('❌ getAssessmentData() threw:', err);
      return allowDemo ? this.getDemoData() : null;
    }
  },

  /**
   * Generate rich, realistic demo data.
   * Also seeds check-in and gamification localStorage so all pages work.
   * @returns {{ scoreReport, scores, isDemo: true }}
   */
  getDemoData() {
    DemoMode.activateFull();

    const scores = { overall: 58, physical: 52, mental: 48, emotional: 62 };

    const scoreReport = {
      scores,
      categoryScores: scores,
      statuses: {
        overall:   { label:'Fair',     color:'#f59e0b' },
        physical:  { label:'Fair',     color:'#f59e0b' },
        mental:    { label:'Needs Attention', color:'#f97316' },
        emotional: { label:'Fair',     color:'#f59e0b' }
      },
      burnoutRisk: 55,
      burnoutStatus: { label:'Moderate Risk', color:'#f59e0b' },
      trend: { direction:'↑', message:'Starting to improve', change: 2 },
      suggestions: [
        { category:'Mental Health',   suggestion:'Practice 10 minutes of daily mindfulness to reduce stress.' },
        { category:'Physical Health', suggestion:'Aim for 7–8 hours of quality sleep each night.' },
        { category:'Emotional',       suggestion:'Schedule one social interaction this week.' }
      ],
      historicalData: (() => {
        const data = [];
        for (let i = 4; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i * 7);
          data.push({
            date:    d.toISOString(),
            overall: 50 + (4-i) * 2,
            scores:  { physical: 46+(4-i)*2, mental: 42+(4-i)*2, emotional: 56+(4-i)*2 }
          });
        }
        return data;
      })(),
      lastUpdated: new Date().toISOString()
    };

    return { scoreReport, scores, isDemo: true };
  },


  // ── Demo banner ─────────────────────────────────────────────────────────────

  /**
   * Show a sticky, dismissible Demo Mode banner with rich UI.
   * Calling multiple times is safe — only one banner rendered.
   */
  showDemoBanner() {
    if (document.getElementById('nw-demo-banner')) return;

    // Inject animation styles once
    if (!document.getElementById('nw-demo-styles')) {
      const s = document.createElement('style');
      s.id = 'nw-demo-styles';
      s.textContent = `
        #nw-demo-banner {
          background: linear-gradient(90deg, #f59e0b 0%, #ef4444 50%, #a855f7 100%);
          background-size: 200% 100%;
          animation: nwDemoBannerGrad 4s linear infinite;
          color: #fff;
          padding: 0.7rem 3rem 0.7rem 1rem;
          font-size: 0.875rem;
          font-weight: 600;
          position: sticky;
          top: 0;
          z-index: 9999;
          width: 100%;
          box-sizing: border-box;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          letter-spacing: 0.01em;
          box-shadow: 0 2px 12px rgba(245,158,11,0.4);
        }
        @keyframes nwDemoBannerGrad {
          0%   { background-position: 0% 0%; }
          100% { background-position: 200% 0%; }
        }
        #nw-demo-dismiss {
          position: absolute;
          right: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          background: rgba(255,255,255,0.2);
          border: none;
          color: #fff;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          cursor: pointer;
          font-size: 0.75rem;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s;
          flex-shrink: 0;
          font-weight: 700;
        }
        #nw-demo-dismiss:hover { background: rgba(255,255,255,0.35); }
        #nw-demo-badge {
          background: rgba(0,0,0,0.2);
          border-radius: 99px;
          padding: 0.15rem 0.6rem;
          font-size: 0.72rem;
          font-weight: 800;
          letter-spacing: 0.07em;
          text-transform: uppercase;
          flex-shrink: 0;
        }
      `;
      document.head.appendChild(s);
    }

    const banner = document.createElement('div');
    banner.id = 'nw-demo-banner';
    banner.setAttribute('role', 'status');
    banner.innerHTML = `
      <span id="nw-demo-badge">🎭 DEMO</span>
      <span>
        Viewing sample data — scores are not real.
        <a href="assessment.html"
          style="color:#fff;text-decoration:underline;font-weight:700;margin-left:0.4rem;">
          Take the assessment
        </a> for your actual results.
      </span>
      <button id="nw-demo-dismiss" title="Dismiss" onclick="this.parentElement.remove()">✕</button>`;

    document.body.insertBefore(banner, document.body.firstChild);
    console.info('ℹ️ Demo Mode banner shown.');
  },


  // ── Toast notifications ─────────────────────────────────────────────────────

  /**
   * Show a toast notification — replaces all alert() calls.
   * @param {string}  message
   * @param {'success'|'error'|'info'|'warning'} type
   * @param {number}  duration ms before auto-dismiss
   */
  showToast(message, type = 'info', duration = 3500) {
    const existing = document.getElementById('nw-toast');
    if (existing) existing.remove();

    if (!document.getElementById('nw-toast-styles')) {
      const s = document.createElement('style');
      s.id = 'nw-toast-styles';
      s.textContent = `
        @keyframes nwSlideIn  { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes nwSlideOut { from{opacity:1;transform:translateY(0)}  to{opacity:0;transform:translateY(12px)} }
        #nw-toast { animation: nwSlideIn 0.3s ease; }
      `;
      document.head.appendChild(s);
    }

    const palette = {
      success: { bg:'#10b981', icon:'✅' },
      error:   { bg:'#ef4444', icon:'❌' },
      info:    { bg:'#667eea', icon:'ℹ️'  },
      warning: { bg:'#f59e0b', icon:'⚠️' }
    };
    const p = palette[type] || palette.info;

    const toast = document.createElement('div');
    toast.id = 'nw-toast';
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'polite');
    toast.style.cssText = `
      position:fixed; bottom:1.5rem; right:1.5rem;
      background:${p.bg}; color:#fff;
      padding:0.875rem 1.5rem; border-radius:10px;
      font-size:0.925rem; font-weight:500;
      max-width:360px; z-index:99999;
      box-shadow:0 8px 24px rgba(0,0,0,0.35);
      display:flex; align-items:center; gap:0.625rem;
      cursor:pointer;
    `;
    toast.innerHTML = `<span>${p.icon}</span><span>${message}</span>`;
    toast.onclick = () => toast.remove();
    document.body.appendChild(toast);

    setTimeout(() => {
      if (!toast.parentElement) return;
      toast.style.animation = 'nwSlideOut 0.3s ease forwards';
      setTimeout(() => toast.remove(), 320);
    }, duration);
  },


  // ── UI error state ──────────────────────────────────────────────────────────

  /**
   * Render a styled, non-blocking error banner inside a container element.
   * @param {string} message
   * @param {string} containerId
   * @param {{ type?:'error'|'warning'|'info', redirect?:string }} options
   */
  showUIError(message, containerId = 'dashboardContainer', options = {}) {
    console.error('❌ UI Error:', message);
    const { type = 'error', redirect = null } = options;

    const palette = {
      error:   { bg:'rgba(239,68,68,0.1)',   border:'#ef4444', icon:'🚫' },
      warning: { bg:'rgba(245,158,11,0.1)',  border:'#f59e0b', icon:'⚠️' },
      info:    { bg:'rgba(102,126,234,0.1)', border:'#667eea', icon:'ℹ️' }
    };
    const p = palette[type] || palette.error;

    const html = `
      <div role="alert" style="
        background:${p.bg}; border:1px solid ${p.border};
        border-radius:14px; padding:2.5rem;
        margin:2rem auto; max-width:520px; text-align:center; color:#f1f5f9;">
        <div style="font-size:2.5rem;margin-bottom:0.75rem;">${p.icon}</div>
        <p style="font-size:1rem;line-height:1.6;margin:0 0 1.25rem;">${message}</p>
        <div style="display:flex;gap:1rem;justify-content:center;flex-wrap:wrap;">
          ${redirect ? `<a href="${redirect}" class="btn btn-primary">Start Assessment →</a>` : ''}
          <a href="dashboard.html" class="btn btn-secondary">← Dashboard</a>
        </div>
      </div>`;

    const container = document.getElementById(containerId);
    if (container) {
      container.innerHTML = html;
    } else {
      const wrap = document.createElement('div');
      wrap.innerHTML = html;
      document.body.insertBefore(wrap, document.body.firstChild);
    }
  }
};



