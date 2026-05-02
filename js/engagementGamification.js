/**
 * NEUROWELL - Engagement Gamification System
 * Points, levels, streaks, achievements, daily challenges.
 * Integrates with GoalEngine (Part 2) and CIM (Part 1).
 * Storage-abstracted: swap _store adapter for backend API.
 */

const EngagementGamification = (() => {

  // ── Storage Adapter ────────────────────────────────────────────────
  const _store = {
    KEY: 'nw_engagement_v2',
    get()  { try { return JSON.parse(localStorage.getItem(this.KEY) || 'null') || _defaults(); } catch { return _defaults(); } },
    set(d) { try { localStorage.setItem(this.KEY, JSON.stringify(d)); return true; } catch { return false; } }
  };

  function _defaults() {
    return {
      points: 0, level: 1, xpToNext: 100,
      streak: 0, longestStreak: 0,
      lastActiveDate: null,
      achievements: [],
      challengeHistory: [],
      pointsLog: [],
      totalTasksCompleted: 0,
      totalDaysActive: 0,
      createdAt: new Date().toISOString()
    };
  }

  const _today = () => new Date().toISOString().slice(0, 10);

  // ── Level Configuration ────────────────────────────────────────────
  const LEVELS = [
    { level:1,  title:'Beginner',      icon:'🌱', xpRequired:0,    xpToNext:100,  color:'#94a3b8' },
    { level:2,  title:'Explorer',      icon:'🌿', xpRequired:100,  xpToNext:150,  color:'#10b981' },
    { level:3,  title:'Achiever',      icon:'⭐', xpRequired:250,  xpToNext:200,  color:'#3b82f6' },
    { level:4,  title:'Warrior',       icon:'🔥', xpRequired:450,  xpToNext:250,  color:'#f59e0b' },
    { level:5,  title:'Champion',      icon:'💎', xpRequired:700,  xpToNext:350,  color:'#a855f7' },
    { level:6,  title:'Master',        icon:'🏆', xpRequired:1050, xpToNext:500,  color:'#ef4444' },
    { level:7,  title:'Grandmaster',   icon:'👑', xpRequired:1550, xpToNext:750,  color:'#f97316' },
    { level:8,  title:'Legend',        icon:'🌟', xpRequired:2300, xpToNext:1000, color:'#ec4899' },
  ];

  // ── Achievement Definitions ────────────────────────────────────────
  const ACHIEVEMENTS = [
    { id:'first_login',    icon:'👋', title:'Welcome!',           desc:'Started your wellness journey',              condition: d => d.totalDaysActive >= 1 },
    { id:'first_task',     icon:'✅', title:'First Step',         desc:'Completed your first task',                  condition: d => d.totalTasksCompleted >= 1 },
    { id:'streak_3',       icon:'🔥', title:'On Fire',            desc:'3-day activity streak',                      condition: d => d.streak >= 3 },
    { id:'streak_7',       icon:'🏅', title:'Week Warrior',       desc:'7-day consecutive streak',                   condition: d => d.streak >= 7 },
    { id:'streak_30',      icon:'💎', title:'Iron Will',          desc:'30-day streak — extraordinary!',             condition: d => d.streak >= 30 },
    { id:'pts_100',        icon:'💯', title:'Century Club',       desc:'Earned 100 points',                          condition: d => d.points >= 100 },
    { id:'pts_500',        icon:'🌟', title:'High Performer',     desc:'Earned 500 points',                          condition: d => d.points >= 500 },
    { id:'pts_1000',       icon:'🏆', title:'Elite Wellness',     desc:'Earned 1,000 points',                        condition: d => d.points >= 1000 },
    { id:'level_3',        icon:'⭐', title:'Achiever Unlocked',  desc:'Reached Level 3',                            condition: d => d.level >= 3 },
    { id:'level_5',        icon:'💎', title:'Champion Status',    desc:'Reached Level 5',                            condition: d => d.level >= 5 },
    { id:'tasks_10',       icon:'🎯', title:'Task Master',        desc:'Completed 10 tasks total',                   condition: d => d.totalTasksCompleted >= 10 },
    { id:'tasks_50',       icon:'🏋️', title:'Consistency King',   desc:'Completed 50 tasks total',                   condition: d => d.totalTasksCompleted >= 50 },
    { id:'challenge_done', icon:'⚡', title:'Challenge Accepted',  desc:'Completed a daily challenge',               condition: d => d.challengeHistory && d.challengeHistory.length >= 1 },
  ];

  // ── Point Values ───────────────────────────────────────────────────
  const POINT_VALUES = {
    task_completed:      15,
    plan_completed:      50,
    goal_logged:         20,
    daily_checkin:       10,
    mood_checkin:         8,
    streak_bonus_7:      25,
    streak_bonus_30:     75,
    challenge_complete:  40,
    post_shared:          5,
    comment_made:         3,
    assessment_done:     30,
  };

  // ── Daily Challenges Pool ──────────────────────────────────────────
  const CHALLENGE_POOL = [
    { id:'c1',  title:'Morning Mover',    desc:'Complete your morning activity task',    reward:40, icon:'🌅', category:'activity' },
    { id:'c2',  title:'Mindful Minute',   desc:'Do 10 min of meditation today',          reward:35, icon:'🧘', category:'mental' },
    { id:'c3',  title:'Hydration Hero',   desc:'Drink 8 glasses of water',               reward:30, icon:'💧', category:'physical' },
    { id:'c4',  title:'Digital Detox',    desc:'No screens for 2 hours this evening',    reward:45, icon:'📵', category:'digital' },
    { id:'c5',  title:'Sleep Champion',   desc:'Sleep before 10:30 PM tonight',          reward:40, icon:'🌙', category:'sleep' },
    { id:'c6',  title:'Step It Up',       desc:'Hit your step goal today',               reward:35, icon:'🚶', category:'activity' },
    { id:'c7',  title:'Gratitude Log',    desc:'Write 3 things you\'re grateful for',    reward:25, icon:'🙏', category:'emotional' },
    { id:'c8',  title:'Stress Buster',    desc:'Complete all stress-related plan tasks', reward:50, icon:'😌', category:'mental' },
    { id:'c9',  title:'Full Plan Day',    desc:'Complete every task in your daily plan', reward:75, icon:'🏆', category:'complete' },
    { id:'c10', title:'Community Star',   desc:'Share your progress with the community', reward:20, icon:'🤝', category:'social' },
    { id:'c11', title:'Early Bird',       desc:'Complete a morning task before 9 AM',    reward:30, icon:'☀️', category:'activity' },
    { id:'c12', title:'Reflection Mode',  desc:'Complete your evening journal entry',    reward:25, icon:'📔', category:'mental' },
  ];

  // ── Core Functions ─────────────────────────────────────────────────

  /** Calculate level from total points */
  function calculateLevel(points) {
    let lvl = LEVELS[0];
    for (const l of LEVELS) {
      if (points >= l.xpRequired) lvl = l;
      else break;
    }
    const nextLvl = LEVELS.find(l => l.xpRequired > points);
    const xpIntoLevel = points - lvl.xpRequired;
    const xpForLevel  = nextLvl ? nextLvl.xpRequired - lvl.xpRequired : lvl.xpToNext;
    return {
      ...lvl,
      progress: nextLvl ? Math.round((xpIntoLevel / xpForLevel) * 100) : 100,
      xpIntoLevel, xpForLevel,
      nextLevel: nextLvl || null
    };
  }

  /** Update daily streak */
  function updateStreak(data) {
    const today     = _today();
    const yesterday = new Date(Date.now() - 864e5).toISOString().slice(0, 10);
    const last      = data.lastActiveDate;

    if (last === today)      { /* already active today — no change */ }
    else if (last === yesterday) { data.streak += 1; data.totalDaysActive += 1; }
    else if (!last)              { data.streak = 1; data.totalDaysActive = 1; }
    else                         { data.streak = 1; data.totalDaysActive += 1; } // reset

    data.longestStreak = Math.max(data.longestStreak || 0, data.streak);
    data.lastActiveDate = today;
    return data;
  }

  /** Add points and trigger level/achievement checks */
  function addPoints(action, data) {
    const pts = POINT_VALUES[action] || 10;
    data.points += pts;

    // Streak bonuses
    if (data.streak === 7)  data.points += POINT_VALUES.streak_bonus_7;
    if (data.streak === 30) data.points += POINT_VALUES.streak_bonus_30;

    // Log entry
    data.pointsLog = (data.pointsLog || []).slice(-49);
    data.pointsLog.push({ action, pts, date: _today(), ts: Date.now() });

    return pts;
  }

  /** Check and unlock new achievements */
  function unlockAchievements(data) {
    const newlyUnlocked = [];
    ACHIEVEMENTS.forEach(ach => {
      if (!data.achievements.includes(ach.id)) {
        try {
          if (ach.condition(data)) {
            data.achievements.push(ach.id);
            newlyUnlocked.push(ach);
          }
        } catch { /* skip */ }
      }
    });
    return newlyUnlocked;
  }

  /** Get today's daily challenge (deterministic by date) */
  function getDailyChallenge() {
    const today = _today();
    const idx   = today.split('-').reduce((a, b) => a + parseInt(b), 0) % CHALLENGE_POOL.length;
    const data  = _store.get();
    const done  = (data.challengeHistory || []).includes(today);
    return { ...CHALLENGE_POOL[idx], completed: done, date: today };
  }

  // ── Public API ─────────────────────────────────────────────────────
  return {
    LEVELS, ACHIEVEMENTS, POINT_VALUES, CHALLENGE_POOL,
    calculateLevel, updateStreak, addPoints, unlockAchievements, getDailyChallenge,

    /** Get current engagement state */
    getState() { return _store.get(); },

    /** Record an action: update streak, add points, check achievements */
    recordAction(action) {
      let data      = _store.get();
      data          = updateStreak(data);
      const earned  = addPoints(action, data);
      const levelInfo = calculateLevel(data.points);
      data.level    = levelInfo.level;
      if (action === 'task_completed') data.totalTasksCompleted = (data.totalTasksCompleted || 0) + 1;
      const newAchs = unlockAchievements(data);
      _store.set(data);
      return { earned, newAchs, state: data, levelInfo };
    },

    /** Complete the daily challenge */
    completeChallenge() {
      const today = _today();
      const data  = _store.get();
      if ((data.challengeHistory || []).includes(today)) return null;
      data.challengeHistory = (data.challengeHistory || []);
      data.challengeHistory.push(today);
      const result = this.recordAction('challenge_complete');
      _store.set(_store.get()); // ensure state flushed after recordAction
      return result;
    },

    /** Get all achievement definitions with earned status */
    getAllAchievements() {
      const data = _store.get();
      return ACHIEVEMENTS.map(a => ({ ...a, earned: data.achievements.includes(a.id) }));
    },

    /** Get recent point log */
    getRecentPoints(n = 10) {
      return (_store.get().pointsLog || []).slice(-n).reverse();
    },

    /** Seed demo state for first-time visitors */
    seedDemo() {
      if (_store.get().totalDaysActive > 0) return;
      const demo = {
        points: 285, level: 3, xpToNext: 100,
        streak: 5, longestStreak: 12,
        lastActiveDate: _today(),
        achievements: ['first_login','first_task','streak_3','pts_100','tasks_10','challenge_done'],
        challengeHistory: [],
        pointsLog: [
          { action:'task_completed',  pts:15, date:_today() },
          { action:'daily_checkin',   pts:10, date:_today() },
          { action:'goal_logged',     pts:20, date:_today() },
        ],
        totalTasksCompleted: 18,
        totalDaysActive: 9,
        createdAt: new Date(Date.now() - 9*864e5).toISOString()
      };
      _store.set(demo);
    },

    clearState() { _store.set(_defaults()); }
  };
})();
