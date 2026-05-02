/**
 * NEUROWELL - Dynamic Plan Generator
 * Generates a prioritised, time-based daily wellness plan from user metrics + mood.
 * Modular rule registry — extend RULES array; no callers need to change.
 */

const PlanGenerator = (() => {

  // ── Time slot definitions ────────────────────────────────────────────────────
  const TIME_SLOTS = {
    EARLY_MORNING: { label: 'Early Morning', icon: '🌅', order: 0, hours: '5–7 AM' },
    MORNING:       { label: 'Morning',       icon: '☀️',  order: 1, hours: '7–9 AM' },
    MID_MORNING:   { label: 'Mid-Morning',   icon: '🌤️', order: 2, hours: '9–11 AM' },
    AFTERNOON:     { label: 'Afternoon',     icon: '🌞',  order: 3, hours: '12–2 PM' },
    LATE_AFTERNOON:{ label: 'Late Afternoon',icon: '🌇', order: 4, hours: '3–5 PM' },
    EVENING:       { label: 'Evening',       icon: '🌆',  order: 5, hours: '6–8 PM' },
    NIGHT:         { label: 'Night',         icon: '🌙',  order: 6, hours: '9–10 PM' },
  };

  // ── Priority levels ──────────────────────────────────────────────────────────
  const PRIORITY = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };

  // ── Task Rule Registry ───────────────────────────────────────────────────────
  // Each rule: condition(userData, mood) → boolean
  // task: { id, title, description, slot, duration, priority, icon, category, tags[] }
  const RULES = [

    // ── Sleep rules ──────────────────────────────────────────────────────────
    {
      condition: ({ sleep }) => sleep < 6,
      tasks: [
        { id:'sleep_wind_down', title:'Start Wind-Down Routine', description:'Dim lights, put phone away, and begin relaxing activities 60 minutes before your target bedtime.',
          slot:'EVENING', duration:'60 min', priority: PRIORITY.CRITICAL, icon:'🌙', category:'sleep',
          tags:['sleep','recovery'] }
      ]
    },
    {
      condition: ({ sleep }) => sleep < 7,
      tasks: [
        { id:'sleep_hygiene', title:'Prioritise Sleep Tonight', description:'Aim for 7 hours. Set an alarm for a consistent wake time tomorrow — regularity matters more than duration.',
          slot:'NIGHT', duration:'7 hrs target', priority: PRIORITY.HIGH, icon:'😴', category:'sleep',
          tags:['sleep'] }
      ]
    },
    {
      condition: ({ sleep }) => sleep >= 7.5,
      tasks: [
        { id:'sleep_protect', title:'Protect Your Sleep Schedule', description:'You slept well — preserve this by keeping your bedtime consistent (within 30 minutes) even on weekends.',
          slot:'NIGHT', duration:'Ongoing', priority: PRIORITY.LOW, icon:'🛡️', category:'sleep',
          tags:['sleep','maintenance'] }
      ]
    },

    // ── Stress rules ──────────────────────────────────────────────────────────
    {
      condition: ({ stress }) => stress >= 8,
      tasks: [
        { id:'stress_critical_breath', title:'Box Breathing — Now', description:'Inhale 4 counts, hold 4, exhale 4, hold 4. Repeat 6× . This activates the parasympathetic nervous system within 90 seconds.',
          slot:'MORNING', duration:'5 min', priority: PRIORITY.CRITICAL, icon:'🫁', category:'mental',
          tags:['stress','immediate'] },
        { id:'stress_critical_detox', title:'Digital Detox Block', description:'No screens for 2 hours this evening. Replace with a short walk, reading, or conversation.',
          slot:'EVENING', duration:'2 hrs', priority: PRIORITY.CRITICAL, icon:'📵', category:'mental',
          tags:['stress','digital'] }
      ]
    },
    {
      condition: ({ stress }) => stress >= 6,
      tasks: [
        { id:'stress_meditation', title:'10-Min Guided Meditation', description:'Use a breathwork or body-scan meditation. Research shows 10 min reduces salivary cortisol by ~15%.',
          slot:'AFTERNOON', duration:'10 min', priority: PRIORITY.HIGH, icon:'🧘', category:'mental',
          tags:['stress','meditation'] },
        { id:'stress_journal', title:'Evening Journal Dump', description:'Write 5 sentences: what happened, what stressed you, one win. Externalising thoughts reduces cognitive load measurably.',
          slot:'NIGHT', duration:'10 min', priority: PRIORITY.HIGH, icon:'📔', category:'mental',
          tags:['stress','reflection'] }
      ]
    },
    {
      condition: ({ stress }) => stress >= 4 && stress < 6,
      tasks: [
        { id:'stress_break', title:'Pomodoro Breaks', description:'Work 25 min, break 5 min — screen-free. Prevents stress accumulation across the work day.',
          slot:'MID_MORNING', duration:'Every 25 min', priority: PRIORITY.MEDIUM, icon:'⏱️', category:'mental',
          tags:['stress','productivity'] }
      ]
    },

    // ── Activity rules ────────────────────────────────────────────────────────
    {
      condition: ({ activity }) => activity <= 3,
      tasks: [
        { id:'activity_starter_walk', title:'10-Min Starter Walk', description:'A short walk outside resets your nervous system and produces BDNF — the brain\'s growth hormone. No gym needed.',
          slot:'MORNING', duration:'10 min', priority: PRIORITY.HIGH, icon:'🚶', category:'physical',
          tags:['activity','beginner'] },
        { id:'activity_desk_stretch', title:'Desk Stretch Break', description:'3 sets of neck rolls, shoulder shrugs, and standing hip flexor stretches — reduces sedentary metabolic risk.',
          slot:'AFTERNOON', duration:'5 min', priority: PRIORITY.MEDIUM, icon:'🤸', category:'physical',
          tags:['activity','office'] }
      ]
    },
    {
      condition: ({ activity }) => activity > 3 && activity <= 6,
      tasks: [
        { id:'activity_walk', title:'20-Min Brisk Walk', description:'20 minutes at conversational pace improves cardiovascular health and lowers stress hormones noticeably within 2 weeks.',
          slot:'MORNING', duration:'20 min', priority: PRIORITY.HIGH, icon:'🏃', category:'physical',
          tags:['activity','cardio'] }
      ]
    },
    {
      condition: ({ activity }) => activity >= 7,
      tasks: [
        { id:'activity_maintain', title:'Active Recovery Day', description:'Balance intense exercise with mobility work and stretching today. Overtraining without recovery reduces gains.',
          slot:'AFTERNOON', duration:'20 min', priority: PRIORITY.LOW, icon:'♻️', category:'physical',
          tags:['activity','recovery'] }
      ]
    },

    // ── Screen time rules ─────────────────────────────────────────────────────
    {
      condition: ({ screenTime }) => screenTime >= 8,
      tasks: [
        { id:'screen_sunset', title:'Digital Sunset at 8 PM', description:'No screens from 8 PM onwards. Blue-light interference with melatonin begins 2 hours before your bedtime.',
          slot:'EVENING', duration:'No screens', priority: PRIORITY.HIGH, icon:'🌅', category:'digital',
          tags:['screen','sleep'] }
      ]
    },

    // ── Mood-based rules ──────────────────────────────────────────────────────
    {
      condition: (d, mood) => mood && (mood.mood === 'Low' || mood.mood === 'Critical'),
      tasks: [
        { id:'mood_connect', title:'Reach Out to One Person', description:'Send a message to someone you trust — even "thinking of you." Human connection is the fastest route to emotional regulation.',
          slot:'AFTERNOON', duration:'10 min', priority: PRIORITY.CRITICAL, icon:'💬', category:'emotional',
          tags:['mood','social'] },
        { id:'mood_gratitude', title:'3 Specific Gratitudes', description:'Write 3 things you\'re specifically grateful for — "warm coffee this morning" beats "my life." Specificity drives the neurological effect.',
          slot:'MORNING', duration:'5 min', priority: PRIORITY.HIGH, icon:'🙏', category:'emotional',
          tags:['mood','gratitude'] }
      ]
    },
    {
      condition: (d, mood) => mood && mood.mood === 'Positive',
      tasks: [
        { id:'mood_momentum', title:'Use Positive Energy Strategically', description:'Schedule your most challenging task for the next 2 hours — positive emotional state boosts cognitive flexibility by up to 20%.',
          slot:'MORNING', duration:'Timing advice', priority: PRIORITY.MEDIUM, icon:'⚡', category:'productivity',
          tags:['mood','performance'] }
      ]
    },
    {
      condition: (d, mood) => mood && mood.stressLevel === 'High',
      tasks: [
        { id:'mood_nature', title:'5-Min Nature Exposure', description:'Step outside, look at the sky or trees. Even 5 minutes of nature exposure measurably reduces cortisol.',
          slot:'MID_MORNING', duration:'5 min', priority: PRIORITY.HIGH, icon:'🌿', category:'mental',
          tags:['mood','nature'] }
      ]
    },

    // ── Universal daily foundations ───────────────────────────────────────────
    {
      condition: () => true, // always included
      tasks: [
        { id:'hydration_morning', title:'Start with 500ml Water', description:'Rehydrating on waking ends 8 hours of fasting and kickstarts metabolism. Do this before coffee.',
          slot:'EARLY_MORNING', duration:'Immediate', priority: PRIORITY.HIGH, icon:'💧', category:'physical',
          tags:['hydration','morning'] },
        { id:'sunlight_morning', title:'Morning Sunlight Exposure', description:'10 minutes of outdoor light within 1 hour of waking sets your circadian clock — the single highest-leverage sleep intervention.',
          slot:'MORNING', duration:'10 min', priority: PRIORITY.HIGH, icon:'☀️', category:'physical',
          tags:['sleep','circadian','morning'] }
      ]
    }
  ];

  // ── Helpers ─────────────────────────────────────────────────────────────────
  function _dedupe(tasks) {
    const seen = new Set();
    return tasks.filter(t => { if (seen.has(t.id)) return false; seen.add(t.id); return true; });
  }

  // ── Public API ───────────────────────────────────────────────────────────────
  return {
    TIME_SLOTS,
    PRIORITY,

    /**
     * Generate a personalised daily plan.
     * @param {{ sleep, activity, stress, screenTime }} userData
     * @param {MoodResult|null} mood - from EmotionAI.detectMood()
     * @returns {DailyPlan[]} Sorted, deduped task array ready for UI rendering
     */
    generateDailyPlan(userData, mood = null) {
      const { sleep = 7, activity = 5, stress = 4, screenTime = 4 } = userData || {};
      const data = { sleep, activity, stress, screenTime };

      // Gather all matching tasks
      const allTasks = [];
      RULES.forEach(rule => {
        try {
          if (rule.condition(data, mood)) allTasks.push(...rule.tasks);
        } catch { /* skip broken rules */ }
      });

      // Deduplicate by id
      const unique = _dedupe(allTasks);

      // Attach slot metadata and sort: priority first, then time slot
      const plan = unique.map(task => ({
        ...task,
        slotMeta: TIME_SLOTS[task.slot] || TIME_SLOTS.MORNING,
        completed: false
      })).sort((a, b) =>
        a.priority !== b.priority
          ? a.priority - b.priority
          : (a.slotMeta?.order || 0) - (b.slotMeta?.order || 0)
      );

      return plan;
    },

    /**
     * Group a flat plan array by time slot for timeline rendering.
     * @param {DailyPlan[]} plan
     * @returns {{ slot, tasks }[]}
     */
    groupBySlot(plan) {
      const groups = {};
      plan.forEach(task => {
        const key = task.slot;
        if (!groups[key]) groups[key] = { slot: task.slotMeta, tasks: [] };
        groups[key].tasks.push(task);
      });
      // Return sorted by slot order
      return Object.values(groups).sort((a, b) => (a.slot?.order || 0) - (b.slot?.order || 0));
    },

    /**
     * Get quick-action suggestions (small, immediate wins).
     * @param {{ sleep, stress, activity }} userData
     * @returns {{ icon, text, action }[]}
     */
    getQuickActions(userData) {
      const { sleep = 7, stress = 4, activity = 5, screenTime = 4 } = userData || {};
      const actions = [];

      actions.push({ icon:'💧', text:'Drink a glass of water', action:'hydration' });
      if (stress >= 5) actions.push({ icon:'🫁', text:'4-7-8 breath: inhale 4, hold 7, exhale 8', action:'breathe' });
      if (activity <= 4) actions.push({ icon:'🚶', text:'Stand up and walk for 2 minutes', action:'movement' });
      if (sleep < 7)    actions.push({ icon:'📵', text:'Put your phone down 30 min earlier tonight', action:'sleep' });
      if (screenTime>=6)actions.push({ icon:'👁️', text:'Look 20 feet away for 20 seconds (20-20-20)', action:'screen' });
      actions.push({ icon:'🙏', text:'Name one thing you are grateful for right now', action:'gratitude' });
      if (stress >= 6)  actions.push({ icon:'🌿', text:'Step outside for 3 minutes of fresh air', action:'nature' });

      return actions.slice(0, 5); // top 5 most relevant
    },

    /**
     * Save a completed plan to localStorage.
     */
    savePlan(plan) {
      try {
        const today = new Date().toISOString().slice(0, 10);
        const stored= JSON.parse(localStorage.getItem('nw_daily_plans') || '{}');
        stored[today] = { date: today, generatedAt: new Date().toISOString(), tasks: plan };
        // Keep 14 days
        const keys = Object.keys(stored).sort();
        if (keys.length > 14) delete stored[keys[0]];
        localStorage.setItem('nw_daily_plans', JSON.stringify(stored));
        return true;
      } catch { return false; }
    },

    /** Get today's saved plan if available */
    getTodaysPlan() {
      try {
        const today  = new Date().toISOString().slice(0, 10);
        const stored = JSON.parse(localStorage.getItem('nw_daily_plans') || '{}');
        return stored[today] || null;
      } catch { return null; }
    },

    /** Mark a task as completed */
    markTaskComplete(taskId) {
      try {
        const today  = new Date().toISOString().slice(0, 10);
        const stored = JSON.parse(localStorage.getItem('nw_daily_plans') || '{}');
        if (stored[today] && stored[today].tasks) {
          const task = stored[today].tasks.find(t => t.id === taskId);
          if (task) { task.completed = true; task.completedAt = new Date().toISOString(); }
          localStorage.setItem('nw_daily_plans', JSON.stringify(stored));
        }
        return true;
      } catch { return false; }
    }
  };
})();
