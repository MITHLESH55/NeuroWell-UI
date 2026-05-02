/**
 * NEUROWELL - Daily Check-in Manager
 * Handles saving, reading, and analysing daily mood/sleep/energy logs.
 * Storage key: neurowell_checkins  (array of log objects)
 */

const CheckinManager = {

  STORAGE_KEY: 'neurowell_checkins',

  // ── CRUD ──────────────────────────────────────────────────────────────────

  /** Return all stored check-ins, newest first. */
  getAll() {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.error('❌ CheckinManager.getAll:', e);
      return [];
    }
  },

  /** Save full array back to storage. */
  _save(logs) {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(logs));
      return true;
    } catch (e) {
      console.error('❌ CheckinManager._save:', e);
      return false;
    }
  },

  /**
   * Save a new check-in (or overwrite today's).
   * @param {{ mood:1-5, sleep:1-10, energy:1-10, notes:string }} data
   * @returns {object} Saved log entry
   */
  saveCheckin(data) {
    const logs   = this.getAll();
    const today  = this._dateKey(new Date());

    const entry = {
      id:        today,
      date:      new Date().toISOString(),
      dateLabel: new Date().toLocaleDateString('en-GB', { weekday:'short', day:'numeric', month:'short' }),
      mood:      Math.min(5, Math.max(1, Math.round(data.mood   || 3))),
      sleep:     Math.min(10, Math.max(1, Math.round(data.sleep  || 5))),
      energy:    Math.min(10, Math.max(1, Math.round(data.energy || 5))),
      notes:     (data.notes || '').trim().slice(0, 300),
      ts:        Date.now()
    };

    // Replace today's entry if it exists
    const existing = logs.findIndex(l => l.id === today);
    if (existing >= 0) { logs[existing] = entry; }
    else               { logs.unshift(entry); }

    // Keep last 90 days only
    const trimmed = logs.slice(0, 90);
    this._save(trimmed);
    console.log('✅ Check-in saved:', entry);

    // Award streak/points/badges
    if (typeof GamificationEngine !== 'undefined') {
      try { GamificationEngine.recordCheckin(entry); } catch (e) { console.warn('⚠️ Gamification error:', e); }
    }

    return entry;
  },

  /** Return today's check-in or null. */
  getTodayCheckin() {
    const today = this._dateKey(new Date());
    return this.getAll().find(l => l.id === today) || null;
  },

  /** Return last N days of check-ins. */
  getRecent(days = 7) {
    return this.getAll().slice(0, days);
  },

  // ── Insights engine ───────────────────────────────────────────────────────

  /**
   * Generate human-readable trend insight strings.
   * Compares last 7 days average vs previous 7 days average.
   * @returns {{ insights:string[], weekAvg:object, prevAvg:object }}
   */
  getInsights() {
    const all     = this.getAll();
    const week1   = all.slice(0, 7);   // most recent 7
    const week2   = all.slice(7, 14);  // previous 7

    if (week1.length === 0) {
      return { insights: ['Complete your first check-in to start seeing trend insights! 🌱'], weekAvg: null, prevAvg: null };
    }

    const avg = (arr, key) => arr.length ? +(arr.reduce((s, x) => s + (x[key] || 0), 0) / arr.length).toFixed(1) : null;

    const weekAvg = { mood: avg(week1,'mood'), sleep: avg(week1,'sleep'), energy: avg(week1,'energy') };
    const prevAvg = week2.length ? { mood: avg(week2,'mood'), sleep: avg(week2,'sleep'), energy: avg(week2,'energy') } : null;

    const insights = [];

    if (week1.length < 3) {
      insights.push('Keep checking in daily — you\'ll see trend insights after 3+ entries. 📈');
      return { insights, weekAvg, prevAvg };
    }

    if (!prevAvg) {
      // Only one week of data — give static observations
      if (weekAvg.mood   >= 4) insights.push('Your mood has been positive this week 😊');
      if (weekAvg.mood   <= 2) insights.push('Your mood has been low — consider reaching out for support 💛');
      if (weekAvg.sleep  >= 7) insights.push('Your sleep quality is good this week 🌙');
      if (weekAvg.sleep  <= 4) insights.push('Your sleep quality needs attention — try a fixed bedtime 😴');
      if (weekAvg.energy >= 7) insights.push('Your energy levels are strong this week ⚡');
      if (weekAvg.energy <= 4) insights.push('Your energy is low — check hydration and sleep habits 💧');
    } else {
      // Two weeks — compare trends
      const moodDiff   = weekAvg.mood   - prevAvg.mood;
      const sleepDiff  = weekAvg.sleep  - prevAvg.sleep;
      const energyDiff = weekAvg.energy - prevAvg.energy;

      if      (moodDiff   > 0.5)  insights.push(`Your mood improved this week by ${moodDiff.toFixed(1)} pts 😊`);
      else if (moodDiff   < -0.5) insights.push(`Your mood has dipped this week — try a daily gratitude practice 💛`);
      else                        insights.push('Your mood has been stable this week → ');

      if      (sleepDiff  > 0.5)  insights.push(`Your sleep quality is trending upward this week 🌙`);
      else if (sleepDiff  < -0.5) insights.push(`Your sleep quality declined this week — protect your wind-down time 😴`);
      else                        insights.push('Your sleep quality remained consistent this week.');

      if      (energyDiff > 0.5)  insights.push(`Your energy levels rose this week — keep it up! ⚡`);
      else if (energyDiff < -0.5) insights.push(`Your energy dropped this week — review sleep and nutrition habits 💧`);
      else                        insights.push('Your energy levels were steady this week.');

      // Stress inference: low mood + low energy = high stress
      if (weekAvg.mood <= 2.5 && weekAvg.energy <= 4) {
        insights.push('⚠️ Low mood + low energy may indicate elevated stress. Consider booking a check-in with a counselor.');
      }
      if (sleepDiff > 1 && moodDiff > 0.5) {
        insights.push('Better sleep is clearly improving your mood — keep the routine! 🌟');
      }
    }

    if (insights.length === 0) insights.push('No significant changes this week. Stay consistent! 💪');

    return { insights, weekAvg, prevAvg };
  },

  /**
   * Return chart-ready data for the last N days.
   * @param {number} days
   * @returns {{ labels:string[], mood:number[], sleep:number[], energy:number[] }}
   */
  getChartData(days = 7) {
    const logs = this.getRecent(days).reverse(); // oldest first for chart
    return {
      labels: logs.map(l => l.dateLabel),
      mood:   logs.map(l => l.mood),
      sleep:  logs.map(l => l.sleep),
      energy: logs.map(l => l.energy)
    };
  },

  // ── Helpers ───────────────────────────────────────────────────────────────

  _dateKey(date) {
    return date.toISOString().slice(0, 10); // YYYY-MM-DD
  }
};
