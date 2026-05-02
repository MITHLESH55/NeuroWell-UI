/**
 * NEUROWELL - AI Risk Alert System
 * Monitors stored health trends and triggers severity-graded alerts.
 * Integrates with AnalysisEngine (Part 1) and WellnessPredictionEngine (Part 1).
 * Supports browser push notifications (future-ready).
 */

const AlertSystem = (() => {

  const _store = {
    KEY: 'nw_alerts_v1',
    get()  { try { return JSON.parse(localStorage.getItem(this.KEY) || '{"alerts":[],"dismissed":[]}'); } catch { return { alerts:[], dismissed:[] }; } },
    set(d) { try { localStorage.setItem(this.KEY, JSON.stringify(d)); } catch {} }
  };

  // ── Severity definitions ──────────────────────────────────────────
  const SEVERITY = {
    CRITICAL: { level:0, label:'Critical',  color:'#ef4444', bg:'rgba(239,68,68,0.1)',  border:'rgba(239,68,68,0.25)',  icon:'🚨' },
    HIGH:     { level:1, label:'High Risk', color:'#f97316', bg:'rgba(249,115,22,0.1)', border:'rgba(249,115,22,0.25)', icon:'⚠️' },
    MODERATE: { level:2, label:'Warning',   color:'#f59e0b', bg:'rgba(245,158,11,0.1)', border:'rgba(245,158,11,0.25)', icon:'⚡' },
    LOW:      { level:3, label:'Notice',    color:'#3b82f6', bg:'rgba(59,130,246,0.1)', border:'rgba(59,130,246,0.2)',  icon:'💡' },
    POSITIVE: { level:4, label:'Great Job', color:'#10b981', bg:'rgba(16,185,129,0.1)', border:'rgba(16,185,129,0.2)',  icon:'🌟' },
  };

  // ── Alert Rule Registry ───────────────────────────────────────────
  const ALERT_RULES = [

    // ── Trend-based rules ─────────────────────────────────────────
    {
      id: 'declining_trend_3d',
      check(history) {
        if (history.length < 3) return null;
        const last3 = history.slice(-3).map(r => r.score);
        const declining = last3[2] < last3[1] && last3[1] < last3[0] && (last3[0] - last3[2]) >= 8;
        if (!declining) return null;
        return {
          title:   'Declining Wellness Trend',
          message: `Your wellness score has dropped ${Math.round(last3[0] - last3[2])} points over the past 3 days. This pattern requires attention.`,
          advice:  'Focus on sleep quality tonight — it has the highest single-day impact on recovery.',
          severity:'HIGH', category:'trend'
        };
      }
    },
    {
      id: 'critical_score',
      check(history) {
        if (!history.length) return null;
        const latest = history[history.length - 1];
        if (latest.score > 35) return null;
        return {
          title:   'Critical Wellness Score',
          message: `Your wellness score of ${latest.score}/100 is critically low. Immediate action is strongly recommended.`,
          advice:  'Start with one change today: sleep before 10 PM and limit screens. Small steps compounding.',
          severity:'CRITICAL', category:'score'
        };
      }
    },
    {
      id: 'low_score_3d',
      check(history) {
        if (history.length < 3) return null;
        const last3 = history.slice(-3);
        const allLow = last3.every(r => r.score < 50);
        if (!allLow) return null;
        const avg = Math.round(last3.reduce((a, r) => a + r.score, 0) / 3);
        return {
          title:   'Persistent Low Wellness',
          message: `Average score of ${avg}/100 across 3 consecutive days. Chronic low wellness compounds health risks.`,
          advice:  'Book a recovery day. Prioritise sleep + hydration above all other goals this week.',
          severity:'HIGH', category:'score'
        };
      }
    },

    // ── Metric-specific rules ─────────────────────────────────────
    {
      id: 'stress_spike',
      check(history) {
        if (history.length < 2) return null;
        const recent = history.slice(-3).filter(r => typeof r.stress === 'number');
        if (recent.length < 2) return null;
        const avgStress = recent.reduce((a, r) => a + r.stress, 0) / recent.length;
        if (avgStress < 7) return null;
        return {
          title:   'Sustained High Stress Alert',
          message: `Average stress level of ${avgStress.toFixed(1)}/10 over recent days is physiologically harmful to your cardiovascular and immune systems.`,
          advice:  '10 minutes of box breathing daily reduces salivary cortisol by ~15%. Try it now.',
          severity: avgStress >= 8.5 ? 'CRITICAL' : 'HIGH', category:'stress'
        };
      }
    },
    {
      id: 'sleep_deficit',
      check(history) {
        if (history.length < 3) return null;
        const recent = history.slice(-3).filter(r => typeof r.sleep === 'number');
        if (recent.length < 2) return null;
        const avgSleep = recent.reduce((a, r) => a + r.sleep, 0) / recent.length;
        if (avgSleep >= 6.5) return null;
        return {
          title:   'Sleep Debt Accumulation',
          message: `Averaging ${avgSleep.toFixed(1)}h of sleep for ${recent.length} days. Sleep debt compounds rapidly and cannot be recovered in one night.`,
          advice:  'Move bedtime 30 minutes earlier each day this week. Consistency matters more than duration.',
          severity: avgSleep < 5.5 ? 'CRITICAL' : 'HIGH', category:'sleep'
        };
      }
    },
    {
      id: 'inactivity_streak',
      check(history) {
        if (history.length < 3) return null;
        const recent = history.slice(-4).filter(r => typeof r.activity === 'number');
        if (recent.length < 3) return null;
        const allSedentary = recent.every(r => r.activity <= 3);
        if (!allSedentary) return null;
        return {
          title:   'Extended Physical Inactivity',
          message: '3+ consecutive days of very low activity. Sedentary periods this long increase inflammation markers measurably.',
          advice:  'A 10-minute walk today is your single highest-leverage action. Start immediately.',
          severity:'MODERATE', category:'activity'
        };
      }
    },
    {
      id: 'burnout_risk',
      check(history) {
        if (history.length < 5) return null;
        const recent = history.slice(-5);
        const highStressDays  = recent.filter(r => (r.stress || 0) >= 7).length;
        const lowSleepDays    = recent.filter(r => (r.sleep  || 8) < 6.5).length;
        const lowActivityDays = recent.filter(r => (r.activity || 5) <= 3).length;
        const burnoutScore    = highStressDays + lowSleepDays + lowActivityDays;
        if (burnoutScore < 7) return null;
        return {
          title:   'Burnout Risk Pattern Detected',
          message: `High stress, low sleep, and low activity have co-occurred for multiple days. This is the clinical burnout precursor pattern.`,
          advice:  'Reduce obligations temporarily. Sleep is non-negotiable. Talk to someone — isolation amplifies burnout.',
          severity:'CRITICAL', category:'burnout'
        };
      }
    },

    // ── Positive alerts ───────────────────────────────────────────
    {
      id: 'improving_trend',
      check(history) {
        if (history.length < 5) return null;
        const last5 = history.slice(-5).map(r => r.score);
        const improving = last5[4] > last5[0] + 10 && last5[4] > last5[3];
        if (!improving) return null;
        return {
          title:   'Wellness Trend Improving!',
          message: `Your wellness score has risen ${Math.round(last5[4] - last5[0])} points over the past 5 days. Your habits are working!`,
          advice:  'Identify what changed this week and make it a permanent habit. Document it in your journal.',
          severity:'POSITIVE', category:'trend'
        };
      }
    },
    {
      id: 'high_score',
      check(history) {
        if (!history.length) return null;
        const latest = history[history.length - 1];
        if (latest.score < 80) return null;
        return {
          title:   'Excellent Wellness Score!',
          message: `Score of ${latest.score}/100 — you're in the top tier. These habits are building lasting resilience.`,
          advice:  'Now is the time to help others. Share your approach in the community.',
          severity:'POSITIVE', category:'score'
        };
      }
    },
  ];

  // ── Helpers ───────────────────────────────────────────────────────
  const _uid     = () => Math.random().toString(36).slice(2, 10);
  const _today   = () => new Date().toISOString().slice(0, 10);
  const _isDismissed = (data, id) => (data.dismissed || []).includes(id);

  // ── Public API ────────────────────────────────────────────────────
  return {
    SEVERITY,

    /**
     * Run all alert rules against stored history.
     * @param {DailyRecord[]} history - from AnalysisEngine.getAllRecords()
     * @returns {Alert[]} New alerts generated
     */
    detectRisk(history) {
      if (!history || history.length === 0) return [];
      const data       = _store.get();
      const newAlerts  = [];

      ALERT_RULES.forEach(rule => {
        // Each rule can only fire once per day
        const dayKey = `${rule.id}_${_today()}`;
        if (_isDismissed(data, dayKey)) return;

        try {
          const result = rule.check(history);
          if (!result) return;

          const alert = {
            id:        _uid(),
            ruleId:    rule.id,
            dayKey,
            title:     result.title,
            message:   result.message,
            advice:    result.advice,
            severity:  result.severity,
            category:  result.category,
            meta:      SEVERITY[result.severity] || SEVERITY.MODERATE,
            timestamp: new Date().toISOString(),
            read:      false
          };

          // Avoid duplicate rule+day combos in stored alerts
          const alreadyStored = (data.alerts || []).some(a => a.dayKey === dayKey);
          if (!alreadyStored) {
            newAlerts.push(alert);
            data.alerts = [alert, ...(data.alerts || [])].slice(0, 50);
          }
        } catch { /* skip broken rules */ }
      });

      if (newAlerts.length > 0) {
        _store.set(data);
        // Browser notification (if permission granted)
        newAlerts.filter(a => a.severity === 'CRITICAL' || a.severity === 'HIGH').forEach(a => {
          this._pushNotification(a.title, a.message);
        });
      }

      return newAlerts;
    },

    /** Get all stored alerts, optionally filtered */
    getAlerts({ unreadOnly = false, severity = null } = {}) {
      const data    = _store.get();
      let alerts    = data.alerts || [];
      if (unreadOnly)  alerts = alerts.filter(a => !a.read);
      if (severity)    alerts = alerts.filter(a => a.severity === severity);
      return alerts.sort((a, b) => (SEVERITY[a.severity]?.level || 99) - (SEVERITY[b.severity]?.level || 99));
    },

    /** Get unread count */
    getUnreadCount() {
      return ((_store.get().alerts || []).filter(a => !a.read)).length;
    },

    /** Mark alert as read */
    markRead(alertId) {
      const data  = _store.get();
      const alert = (data.alerts || []).find(a => a.id === alertId);
      if (alert) { alert.read = true; _store.set(data); }
    },

    /** Mark all as read */
    markAllRead() {
      const data = _store.get();
      (data.alerts || []).forEach(a => { a.read = true; });
      _store.set(data);
    },

    /** Dismiss a rule for today (won't re-fire until tomorrow) */
    dismissAlert(alertId) {
      const data  = _store.get();
      const alert = (data.alerts || []).find(a => a.id === alertId);
      if (alert) {
        alert.read = true;
        data.dismissed = [...(data.dismissed || []), alert.dayKey].slice(-100);
        data.alerts = data.alerts.filter(a => a.id !== alertId);
        _store.set(data);
      }
    },

    /** Clear all alerts */
    clearAll() { _store.set({ alerts:[], dismissed:[] }); },

    /** Request browser push notification permission */
    async requestNotificationPermission() {
      if (!('Notification' in window)) return 'unsupported';
      if (Notification.permission === 'granted') return 'granted';
      const perm = await Notification.requestPermission();
      return perm;
    },

    /** Send browser push notification */
    _pushNotification(title, body) {
      if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return;
      try {
        new Notification('NeuroWell — ' + title, {
          body: body.slice(0, 120),
          icon: '/icons/icon-192.png',
          badge:'/icons/icon-72.png',
          tag:  'neurowell-alert'
        });
      } catch { /* Notification API not available */ }
    },

    /**
     * Run a full risk scan — convenience method.
     * Fetches history from AnalysisEngine and runs all rules.
     * @returns {Alert[]}
     */
    runFullScan() {
      let history = [];
      if (typeof AnalysisEngine !== 'undefined') {
        try { history = AnalysisEngine.getAllRecords(); } catch {}
      }
      return this.detectRisk(history);
    },

    /** Get a brief summary for the notification badge */
    getSummary() {
      const alerts = this.getAlerts();
      const critical = alerts.filter(a => a.severity === 'CRITICAL').length;
      const high     = alerts.filter(a => a.severity === 'HIGH').length;
      const unread   = alerts.filter(a => !a.read).length;
      return { total: alerts.length, critical, high, unread,
        topSeverity: critical > 0 ? 'CRITICAL' : high > 0 ? 'HIGH' : alerts[0]?.severity || null };
    }
  };
})();
