/**
 * NEUROWELL - Adaptive Goal Engine
 * Manages user goals, tracks streaks, adjusts difficulty dynamically.
 * Storage-abstracted: swap _store adapter to use a backend API.
 *
 * Goal types supported: sleep | steps | meditation | hydration | exercise | stress
 */

const GoalEngine = (() => {

  // ── Storage Adapter (swap to API here) ──────────────────────────────────────
  const _store = {
    KEY: 'nw_goal_engine_v1',
    get()   { try { return JSON.parse(localStorage.getItem(this.KEY) || '{}'); } catch { return {}; } },
    set(d)  { try { localStorage.setItem(this.KEY, JSON.stringify(d)); return true; } catch { return false; } }
  };

  // ── Goal Catalogue ──────────────────────────────────────────────────────────
  const GOAL_CATALOGUE = {
    sleep: {
      label: 'Sleep Duration', unit: 'hours', icon: '🌙', category: 'physical',
      defaults: { target: 7.5, min: 5, max: 10, step: 0.5 },
      levels: [6, 6.5, 7, 7.5, 8, 8.5],
      measureHint: 'Hours slept last night'
    },
    steps: {
      label: 'Daily Steps', unit: 'steps', icon: '🚶', category: 'physical',
      defaults: { target: 5000, min: 1000, max: 15000, step: 500 },
      levels: [2000, 3000, 4000, 5000, 7000, 10000],
      measureHint: 'Steps walked today'
    },
    meditation: {
      label: 'Meditation', unit: 'mins', icon: '🧘', category: 'mental',
      defaults: { target: 10, min: 5, max: 60, step: 5 },
      levels: [5, 10, 15, 20, 30, 45],
      measureHint: 'Minutes meditated today'
    },
    hydration: {
      label: 'Water Intake', unit: 'glasses', icon: '💧', category: 'physical',
      defaults: { target: 8, min: 4, max: 16, step: 1 },
      levels: [4, 5, 6, 7, 8, 10, 12],
      measureHint: 'Glasses of water drunk'
    },
    exercise: {
      label: 'Exercise', unit: 'mins', icon: '💪', category: 'physical',
      defaults: { target: 20, min: 5, max: 90, step: 5 },
      levels: [5, 10, 20, 30, 45, 60],
      measureHint: 'Minutes of intentional exercise'
    },
    stress: {
      label: 'Stress Score', unit: '/10', icon: '😰', category: 'mental',
      defaults: { target: 4, min: 1, max: 9, step: 1 },
      levels: [7, 6, 5, 4, 3, 2],  // lower is better — inverted
      measureHint: 'Self-rated stress level (lower = better)',
      inverted: true
    }
  };

  // ── Helpers ─────────────────────────────────────────────────────────────────
  const _today = () => new Date().toISOString().slice(0, 10);
  const _clamp = (v, min, max) => Math.min(max, Math.max(min, v));
  const _pct   = (actual, target) => Math.round((actual / target) * 100);

  /** Get next value in the levels array (clamped) */
  function _shiftLevel(levels, current, direction) {
    const idx = levels.findIndex(l => l >= current);
    const pos = idx === -1 ? levels.length - 1 : idx;
    return levels[_clamp(pos + direction, 0, levels.length - 1)];
  }

  // ── Core adjustment logic ───────────────────────────────────────────────────
  /**
   * Adjust a goal's target based on completion rate and streak.
   * Pure function — no side-effects. Extendable for ML output.
   *
   * @param {{ goalType, target, completionRate, streak }} goal
   * @returns {{ newTarget, direction, message, confidence }}
   */
  function adjustGoal(goal) {
    const { goalType, target, completionRate, streak = 0 } = goal;
    const cat = GOAL_CATALOGUE[goalType];
    if (!cat) return null;

    const { min, max } = cat.defaults;
    const { levels, inverted } = cat;

    let direction = 0;   // -1 = easier, 0 = same, +1 = harder
    let message   = '';
    let confidence= 'High';

    // Decision rules
    if (completionRate < 40) {
      direction = -1;
      message   = "Let's make it easier — small wins build momentum. 🌱";
      confidence = 'High';
    } else if (completionRate < 60) {
      direction = streak >= 3 ? 0 : -1;
      message   = streak >= 3
        ? "Consistency counts! Keep this target a few more days. 💪"
        : "You're building the habit — let's stay at this level. 🎯";
      confidence = 'Moderate';
    } else if (completionRate >= 90 && streak >= 3) {
      direction = 1;
      message   = "Outstanding consistency! Time to level up your goal. 🚀";
      confidence = 'High';
    } else if (completionRate >= 90) {
      direction = 0;
      message   = "Great progress! Maintain this a few more days to unlock the next level. ⭐";
      confidence = 'Moderate';
    } else if (completionRate >= 70) {
      direction = 0;
      message   = "You're on track — keep the momentum going! 🏃";
      confidence = 'High';
    } else {
      direction = 0;
      message   = "Solid progress — consistency is the key to lasting change. 💫";
      confidence = 'Moderate';
    }

    // Compute new target from level array (or nudge if inverted)
    let newTarget = target;
    if (direction !== 0 && levels && levels.length > 1) {
      const shift = inverted ? -direction : direction;  // inverted goals: harder = lower value
      newTarget = _shiftLevel(levels, target, shift);
    }
    newTarget = _clamp(newTarget, min, max);

    return { newTarget, direction, message, confidence, prevTarget: target };
  }

  // ── Public API ───────────────────────────────────────────────────────────────
  return {
    GOAL_CATALOGUE,
    adjustGoal,

    /**
     * Initialize default goals for a new user.
     * @param {string[]} types - goal types to initialise (defaults to all)
     */
    initGoals(types = Object.keys(GOAL_CATALOGUE)) {
      const data  = _store.get();
      const today = _today();
      if (!data.goals) data.goals = {};

      types.forEach(type => {
        if (!data.goals[type]) {
          const cat = GOAL_CATALOGUE[type];
          data.goals[type] = {
            goalType:       type,
            target:         cat.defaults.target,
            streak:         0,
            longestStreak:  0,
            completionRate: 0,
            lastUpdated:    today,
            history:        []
          };
        }
      });
      _store.set(data);
      return data.goals;
    },

    /** Get all current goals */
    getGoals() {
      const data = _store.get();
      return data.goals || this.initGoals();
    },

    /** Get a single goal by type */
    getGoal(type) { return this.getGoals()[type] || null; },

    /**
     * Log actual performance for a goal and trigger adaptive adjustment.
     * @param {string} type - goal type
     * @param {number} actual - actual value achieved
     * @returns {{ goal, adjustment }} Updated goal + adjustment result
     */
    logCompletion(type, actual) {
      const data = _store.get();
      if (!data.goals) this.initGoals();
      data.goals = data.goals || {};

      const goal   = data.goals[type] || this.initGoals([type])[type];
      const cat    = GOAL_CATALOGUE[type];
      const today  = _today();

      // Calculate completion %
      const pct = cat.inverted
        ? Math.round(_clamp((goal.target - actual + 2) / goal.target * 100, 0, 100))
        : _pct(actual, goal.target);

      // Streak management
      const lastDate = goal.lastUpdated;
      const yesterday= new Date(Date.now() - 864e5).toISOString().slice(0, 10);
      let streak = goal.streak || 0;
      if (lastDate === yesterday && pct >= 70) { streak += 1; }
      else if (lastDate === today)             { /* same day, no change */ }
      else if (pct >= 70)                      { streak = 1; }
      else                                     { streak = 0; }

      // Run adaptive adjustment
      const adjustment = adjustGoal({ goalType: type, target: goal.target, completionRate: pct, streak });

      // Append history record
      const historyRecord = { date: today, actual, target: goal.target, pct, streak };
      const history = (goal.history || []).slice(-29); // keep 30 days
      history.push(historyRecord);

      // Update goal
      data.goals[type] = {
        ...goal,
        target:         adjustment ? adjustment.newTarget : goal.target,
        completionRate: pct,
        streak,
        longestStreak:  Math.max(goal.longestStreak || 0, streak),
        lastActual:     actual,
        lastUpdated:    today,
        history
      };

      _store.set(data);
      return { goal: data.goals[type], adjustment };
    },

    /**
     * Get week summary for a goal type.
     * @returns {{ avg, best, streak, trend }}
     */
    getWeekSummary(type) {
      const goal = this.getGoal(type);
      if (!goal || !goal.history || goal.history.length === 0) return null;
      const week = goal.history.slice(-7);
      const avg  = Math.round(week.reduce((a, r) => a + r.pct, 0) / week.length);
      const best = Math.max(...week.map(r => r.pct));
      const trend= week.length >= 2
        ? week[week.length-1].pct - week[0].pct
        : 0;
      return { avg, best, streak: goal.streak, trend };
    },

    /** Seed demo goals for first-time visitors */
    seedDemoGoals() {
      const data = _store.get();
      if (data.goals && Object.keys(data.goals).length > 0) return;
      this.initGoals();
      const g = _store.get();
      const demoState = {
        sleep:     { target: 7.5, streak: 4, completionRate: 82, lastActual: 7.2 },
        steps:     { target: 5000, streak: 2, completionRate: 63, lastActual: 3150 },
        meditation:{ target: 10,  streak: 0, completionRate: 30, lastActual: 3 },
        hydration: { target: 8,   streak: 5, completionRate: 88, lastActual: 7 },
        exercise:  { target: 20,  streak: 1, completionRate: 55, lastActual: 11 },
        stress:    { target: 4,   streak: 3, completionRate: 70, lastActual: 5 },
      };
      Object.entries(demoState).forEach(([k, v]) => {
        if (g.goals[k]) Object.assign(g.goals[k], v);
      });
      _store.set(g);
    },

    /** Clear all goal data */
    clearGoals() { const d = _store.get(); delete d.goals; _store.set(d); }
  };
})();
