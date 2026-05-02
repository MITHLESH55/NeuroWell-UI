/**
 * NEUROWELL - Gamification Engine
 * Manages streak counter, points, and achievement badges.
 * Storage key: neurowell_gamification
 *
 * Public API:
 *   GamificationEngine.recordCheckin(checkinEntry)  → { streak, points, newBadges[] }
 *   GamificationEngine.recordAssessment()           → { points, newBadges[] }
 *   GamificationEngine.getState()                   → full state object
 *   GamificationEngine.getAllBadges()               → badge definitions with earned flag
 */

const GamificationEngine = (() => {

  const KEY = 'neurowell_gamification';

  // ── Badge definitions ─────────────────────────────────────────────────────
  const BADGE_DEFS = [
    // Streak badges
    { id:'first_checkin',   emoji:'🌱', label:'First Step',         desc:'Completed your very first daily check-in.',                 cat:'Milestone' },
    { id:'streak_3',        emoji:'🔥', label:'On Fire',            desc:'Achieved a 3-day check-in streak.',                         cat:'Streak'    },
    { id:'streak_7',        emoji:'💪', label:'Week Warrior',       desc:'Maintained a 7-day check-in streak.',                       cat:'Streak'    },
    { id:'streak_14',       emoji:'⚡', label:'Fortnight Force',    desc:'Maintained a 14-day check-in streak.',                      cat:'Streak'    },
    { id:'streak_30',       emoji:'🏆', label:'Unstoppable',        desc:'Maintained a 30-day check-in streak.',                      cat:'Streak'    },
    // Points badges
    { id:'pts_50',          emoji:'⭐', label:'Rising Star',        desc:'Earned 50 wellness points.',                                cat:'Points'    },
    { id:'pts_200',         emoji:'💫', label:'Momentum Builder',   desc:'Earned 200 wellness points.',                               cat:'Points'    },
    { id:'pts_500',         emoji:'💎', label:'Wellness Champion',  desc:'Earned 500 wellness points.',                               cat:'Points'    },
    { id:'pts_1000',        emoji:'👑', label:'NeuroWell Legend',   desc:'Earned 1,000 wellness points.',                             cat:'Points'    },
    // Mood badges
    { id:'mood_positive',   emoji:'😊', label:'Positive Vibes',     desc:'Logged a great mood (4+) for 5 consecutive days.',          cat:'Wellness'  },
    { id:'mood_perfect',    emoji:'😄', label:'Peak Positivity',    desc:'Logged a perfect mood (5/5) for 3 consecutive days.',       cat:'Wellness'  },
    // Sleep badges
    { id:'sleep_champion',  emoji:'🌙', label:'Sleep Champion',     desc:'Logged sleep quality of 8+ for 5 days.',                    cat:'Wellness'  },
    // Energy badges
    { id:'energy_high',     emoji:'💡', label:'High Energy',        desc:'Logged energy level of 8+ for 5 days.',                     cat:'Wellness'  },
    // Assessment
    { id:'assessor',        emoji:'📋', label:'Self-Aware',         desc:'Completed your first wellness assessment.',                 cat:'Milestone' },
    // Perfect day
    { id:'perfect_day',     emoji:'🌟', label:'Perfect Day',        desc:'Logged mood 5, sleep 9+, and energy 9+ in one check-in.',   cat:'Milestone' },
    // Comeback
    { id:'comeback',        emoji:'🔄', label:'Comeback Kid',       desc:'Returned after missing 7+ days.',                          cat:'Milestone' },
    // Consistency
    { id:'consistent_10',   emoji:'🎯', label:'Consistent 10',      desc:'Completed 10 total check-ins.',                            cat:'Milestone' },
    { id:'consistent_30',   emoji:'🏅', label:'Consistent 30',      desc:'Completed 30 total check-ins.',                            cat:'Milestone' },
  ];

  // ── Points config ──────────────────────────────────────────────────────────
  const PTS = {
    checkin:        10,
    streakBonus3:   15,
    streakBonus7:   50,
    streakBonus14:  100,
    streakBonus30:  200,
    perfectMood:    5,
    highSleep:      5,
    highEnergy:     5,
    assessment:     25,
    perfectDay:     20,
    comeback:       10
  };

  // ── Private helpers ────────────────────────────────────────────────────────
  function _dateKey(d) { return (d || new Date()).toISOString().slice(0, 10); }

  function _defaultState() {
    return {
      streak:         0,
      longestStreak:  0,
      points:         0,
      totalCheckins:  0,
      lastCheckinDate:null,
      earnedBadges:   [],
      log:            []       // { action, points, date, note }
    };
  }

  function _load() {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? { ..._defaultState(), ...JSON.parse(raw) } : _defaultState();
    } catch { return _defaultState(); }
  }

  function _save(state) {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch(e) { console.error('❌ Gamification save:', e); }
  }

  function _addPoints(state, pts, note) {
    state.points += pts;
    state.log.unshift({ action: note, points: pts, date: _dateKey(), ts: Date.now() });
    if (state.log.length > 200) state.log.length = 200;
  }

  function _tryEarnBadge(state, badgeId) {
    if (state.earnedBadges.includes(badgeId)) return false;
    state.earnedBadges.push(badgeId);
    return true;
  }

  // ── Streak logic ───────────────────────────────────────────────────────────
  function _updateStreak(state, today) {
    const last = state.lastCheckinDate;
    if (!last) {
      state.streak = 1;
    } else {
      const lastDate  = new Date(last + 'T00:00:00');
      const todayDate = new Date(today + 'T00:00:00');
      const diffDays  = Math.round((todayDate - lastDate) / 86400000);

      if (diffDays === 0) {
        // Same day — no change
      } else if (diffDays === 1) {
        state.streak += 1;
      } else if (diffDays >= 7 && state.streak > 0) {
        // Comeback — missed 7+ days
        state.streak = 1;
        return 'comeback';
      } else {
        // Missed days — reset
        state.streak = 1;
      }
    }
    if (state.streak > state.longestStreak) state.longestStreak = state.streak;
    state.lastCheckinDate = today;
    return null;
  }

  // ── Badge evaluation after check-in ───────────────────────────────────────
  function _evaluateBadges(state, entry) {
    const newBadges = [];
    const earned    = (id) => { if (_tryEarnBadge(state, id)) newBadges.push(id); };

    // First check-in
    if (state.totalCheckins === 1) earned('first_checkin');

    // Total check-ins milestones
    if (state.totalCheckins >= 10) earned('consistent_10');
    if (state.totalCheckins >= 30) earned('consistent_30');

    // Streak milestones
    if (state.streak >= 3)  earned('streak_3');
    if (state.streak >= 7)  earned('streak_7');
    if (state.streak >= 14) earned('streak_14');
    if (state.streak >= 30) earned('streak_30');

    // Points milestones
    if (state.points >= 50)   earned('pts_50');
    if (state.points >= 200)  earned('pts_200');
    if (state.points >= 500)  earned('pts_500');
    if (state.points >= 1000) earned('pts_1000');

    // Entry-based badges
    if (entry) {
      if (entry.mood === 5 && entry.sleep >= 9 && entry.energy >= 9) earned('perfect_day');

      // Check recent logs for streak-based wellness badges
      try {
        const all = JSON.parse(localStorage.getItem('neurowell_checkins') || '[]');
        const last5  = all.slice(0, 5);
        const last3  = all.slice(0, 3);

        if (last5.length === 5 && last5.every(x => x.mood  >= 4)) earned('mood_positive');
        if (last3.length === 3 && last3.every(x => x.mood  === 5)) earned('mood_perfect');
        if (last5.length === 5 && last5.every(x => x.sleep >= 8)) earned('sleep_champion');
        if (last5.length === 5 && last5.every(x => x.energy>= 8)) earned('energy_high');
      } catch (_) {}
    }

    return newBadges;
  }

  // ── Public API ─────────────────────────────────────────────────────────────
  return {

    getState() { return _load(); },

    getAllBadges() {
      const state = _load();
      return BADGE_DEFS.map(b => ({
        ...b,
        earned:    state.earnedBadges.includes(b.id),
        earnedAt:  state.earnedBadges.includes(b.id) ? '✓' : null
      }));
    },

    /**
     * Record a completed check-in and update streak/points/badges.
     * @param {object} entry — from CheckinManager.saveCheckin()
     * @returns {{ streak, points, newBadges: string[], pointsEarned: number }}
     */
    recordCheckin(entry) {
      const state  = _load();
      const today  = _dateKey();

      // Prevent double-counting same day
      if (state.lastCheckinDate === today && state.totalCheckins > 0) {
        return { streak: state.streak, points: state.points, newBadges: [], pointsEarned: 0 };
      }

      state.totalCheckins = (state.totalCheckins || 0) + 1;
      let pointsEarned = 0;

      // Streak
      const event = _updateStreak(state, today);

      // Base points
      _addPoints(state, PTS.checkin, 'Daily check-in');
      pointsEarned += PTS.checkin;

      // Streak bonus points
      const bonusMap = { 3: PTS.streakBonus3, 7: PTS.streakBonus7, 14: PTS.streakBonus14, 30: PTS.streakBonus30 };
      if (bonusMap[state.streak]) {
        _addPoints(state, bonusMap[state.streak], `${state.streak}-day streak bonus`);
        pointsEarned += bonusMap[state.streak];
      }

      // Quality bonuses
      if (entry && entry.mood  === 5) { _addPoints(state, PTS.perfectMood,  'Perfect mood');   pointsEarned += PTS.perfectMood; }
      if (entry && entry.sleep >= 9)  { _addPoints(state, PTS.highSleep,    'Great sleep');    pointsEarned += PTS.highSleep; }
      if (entry && entry.energy>= 9)  { _addPoints(state, PTS.highEnergy,   'High energy');    pointsEarned += PTS.highEnergy; }
      if (entry && entry.mood === 5 && entry.sleep >= 9 && entry.energy >= 9) {
        _addPoints(state, PTS.perfectDay, 'Perfect day!');
        pointsEarned += PTS.perfectDay;
      }

      // Comeback bonus
      if (event === 'comeback') {
        _addPoints(state, PTS.comeback, 'Comeback bonus');
        pointsEarned += PTS.comeback;
      }

      // Evaluate badges
      const newBadges = _evaluateBadges(state, entry);

      _save(state);
      console.log(`✅ Gamification: streak=${state.streak}, pts=${state.points}, newBadges=${newBadges}`);

      return { streak: state.streak, points: state.points, newBadges, pointsEarned };
    },

    /** Call when a user completes an assessment. */
    recordAssessment() {
      const state = _load();
      _addPoints(state, PTS.assessment, 'Assessment completed');
      const newBadges = [];
      if (_tryEarnBadge(state, 'assessor')) newBadges.push('assessor');
      if (state.points >= 50)   { if (_tryEarnBadge(state, 'pts_50'))   newBadges.push('pts_50');   }
      if (state.points >= 200)  { if (_tryEarnBadge(state, 'pts_200'))  newBadges.push('pts_200');  }
      _save(state);
      return { points: state.points, newBadges, pointsEarned: PTS.assessment };
    },

    /** Force reset (dev/testing only). */
    _reset() { localStorage.removeItem(KEY); }
  };
})();
