/**
 * NEUROWELL - Daily Routine Generator
 * generateRoutine(scores) → structured daily plan personalised per wellness tier.
 * Exported as window.RoutineEngine for use in routine.html and dashboard.
 */

const RoutineEngine = (() => {

  // ── Personas (composite of all three scores) ─────────────────────────────
  const PERSONAS = [
    { id:'recovering',   label:'Recovery Mode',        emoji:'🌱', color:'#ef4444', desc:'Your scores indicate your body and mind need structured recovery. This routine prioritises gentle habits and consistent rest.',          condition: s => s.overall < 40 },
    { id:'rebuilding',   label:'Rebuilding Momentum',  emoji:'🔄', color:'#f97316', desc:'You\'re in a rebuilding phase. This routine balances light activity, mental calm, and emotional connection.',                           condition: s => s.overall < 55 },
    { id:'developing',   label:'Developing Strength',  emoji:'📈', color:'#f59e0b', desc:'You\'re making real progress. This routine builds consistency across physical, mental, and emotional dimensions.',                      condition: s => s.overall < 70 },
    { id:'performing',   label:'High Performer',        emoji:'⚡', color:'#10b981', desc:'Your wellness is strong. This routine optimises performance, maintains energy, and deepens your high-functioning habits.',              condition: s => s.overall < 85 },
    { id:'thriving',     label:'Thriving',              emoji:'🌟', color:'#6366f1', desc:'Excellent wellness. This routine sustains elite habits, deepens practices, and positions you to support those around you.',             condition: s => s.overall >= 85 }
  ];

  // ── Activity library (keyed for reuse) ───────────────────────────────────
  const ACT = {
    // Morning rituals
    meditation5:   { title:'5-Min Breath Meditation',    icon:'🧘', cat:'mental',   dur:'5 min',  color:'#a855f7', tips:['Sit upright','Focus only on breath','Use a timer so you don\'t watch the clock'] },
    meditation10:  { title:'10-Min Guided Meditation',   icon:'🧘', cat:'mental',   dur:'10 min', color:'#a855f7', tips:['Use Headspace or a free YouTube session','Headphones improve focus','Same spot every day builds the habit'] },
    meditation20:  { title:'20-Min Mindfulness Session', icon:'🧘', cat:'mental',   dur:'20 min', color:'#a855f7', tips:['Try Loving-Kindness (Metta) style','No phone in the room','Journal 1 insight after'] },
    coldShower:    { title:'Cold Shower Start',          icon:'🚿', cat:'physical', dur:'5 min',  color:'#3b82f6', tips:['End your hot shower with 30 sec cold','Increases alertness and dopamine','Build to 2 min over weeks'] },
    gratitude:     { title:'Gratitude Journal (3 items)',icon:'🙏', cat:'emotional', dur:'5 min', color:'#f43f5e', tips:['Be specific — "warm coffee" not "life"','Handwrite, don\'t type','Share one item with someone weekly'] },
    stretching:    { title:'Full-Body Stretch',          icon:'🤸', cat:'physical', dur:'10 min', color:'#10b981', tips:['Hold each stretch 20 sec','Focus on neck, shoulders, hips','Never bounce the stretch'] },
    walk20:        { title:'20-Min Brisk Walk',          icon:'🚶', cat:'physical', dur:'20 min', color:'#10b981', tips:['Walk at conversational pace','Leave phone on silent','Count steps if motivated'] },
    walk30:        { title:'30-Min Energising Walk',     icon:'🏃', cat:'physical', dur:'30 min', color:'#10b981', tips:['Try a new route for mental freshness','Listen to a podcast or music','Walk before breakfast for fat-burning benefit'] },
    hydrate:       { title:'Hydration Reset (500ml)',    icon:'💧', cat:'physical', dur:'2 min',  color:'#06b6d4', tips:['Drink before coffee or tea','Room-temperature water is gentler','Add a lemon slice for taste'] },
    healthyBreakfast:{ title:'Nourishing Breakfast',    icon:'🥗', cat:'physical', dur:'20 min', color:'#f59e0b', tips:['Protein + complex carbs + healthy fat','Avoid ultra-processed cereals','Eat slowly and without screens'] },
    // Work blocks
    deepWork90:    { title:'90-Min Deep Work Block',     icon:'💻', cat:'mental',   dur:'90 min', color:'#667eea', tips:['Phone on DND','Single task only — no tabs','Use noise-cancelling headphones'] },
    deepWork60:    { title:'60-Min Focused Work Block',  icon:'💻', cat:'mental',   dur:'60 min', color:'#667eea', tips:['One clear goal per block','Close email and Slack','Take a full break after'] },
    pomodoro:      { title:'Pomodoro Work Session',      icon:'⏱️',  cat:'mental',   dur:'25 min', color:'#667eea', tips:['25 min work, 5 min off','3–4 rounds then a 20-min break','Physical timer beats phone timer'] },
    // Breaks
    microBreak:    { title:'Screen-Free Micro-Break',    icon:'🪟', cat:'mental',   dur:'5 min',  color:'#94a3b8', tips:['Look 20m away for 20 sec (20-20-20 rule)','Stand and move','No social media — look out a window'] },
    lunchBreak:    { title:'Mindful Lunch Break',        icon:'🥘', cat:'emotional', dur:'45 min',color:'#f59e0b', tips:['Eat away from your desk','Chew slowly — 20 bites per mouthful','A short walk after aids digestion'] },
    powerNap:      { title:'15-Min Power Nap',           icon:'😴', cat:'mental',   dur:'15 min', color:'#94a3b8', tips:['Set alarm for exactly 15 min','Dark room or eye mask','No longer or you\'ll wake groggy'] },
    // Afternoon
    lightWork:     { title:'Admin & Low-Priority Tasks', icon:'📋', cat:'mental',   dur:'60 min', color:'#64748b', tips:['Use the afternoon energy dip for low-stakes work','Reply to messages in batches','Avoid creative work after 3 PM if possible'] },
    afternoonWalk: { title:'Afternoon Refresh Walk',     icon:'🌤️',  cat:'physical', dur:'15 min', color:'#10b981', tips:['Even 15 min breaks the afternoon slump','Walk without headphones for mental rest','Encourages colleagues to join you'] },
    // Evening physical
    exercise30:    { title:'30-Min Exercise Session',    icon:'💪', cat:'physical', dur:'30 min', color:'#10b981', tips:['Cardio or strength — your choice','High-intensity 3× per week max','Always warm up for 5 min'] },
    yoga:          { title:'30-Min Yoga or Pilates',     icon:'🧘', cat:'physical', dur:'30 min', color:'#a855f7', tips:['Yin yoga works well in evenings','Follow a YouTube class if you\'re new','Focus on breath synchronisation'] },
    gentleStretch: { title:'15-Min Gentle Evening Stretch',icon:'🤸',cat:'physical',dur:'15 min',color:'#10b981', tips:['Reduces muscle soreness from the day','Candlelight or dim light helps relaxation','Play calm music'] },
    // Evening mental
    digitalDetox:  { title:'Digital Detox (No Screens)', icon:'📵', cat:'mental',   dur:'60 min', color:'#a855f7', tips:['7–9 PM is the optimal window','Replace with a book, walk, or conversation','Use app timers to enforce this'] },
    reading:       { title:'30-Min Reading',             icon:'📚', cat:'mental',   dur:'30 min', color:'#667eea', tips:['Physical books over e-books before bed','Non-fiction or fiction — both reduce stress','No business books — let the brain decompress'] },
    // Evening emotional
    socialTime:    { title:'Meaningful Social Connection',icon:'🤝',cat:'emotional', dur:'45 min',color:'#f43f5e', tips:['Present — no phones','Ask one deeper question than usual','Quality over duration'] },
    familyTime:    { title:'Quality Family / Friend Time',icon:'👨‍👩‍👧',cat:'emotional',dur:'60 min',color:'#f43f5e', tips:['Put devices away','Cook or eat together','Share one good thing from your day'] },
    // Wind-down
    eveningJournal:{ title:'Evening Journal (5-10 min)', icon:'📓', cat:'mental',   dur:'10 min', color:'#a855f7', tips:['What happened, what stressed you, one positive thing','Handwrite — pen to paper processes emotions better','No editing — just write'] },
    sleepPrep:     { title:'Sleep Preparation Routine',  icon:'🌙', cat:'physical', dur:'20 min', color:'#1e40af', tips:['Dim all lights','No screens — use blue-light glasses if needed','Room temperature: 18°C / 65°F'] },
    sleep:         { title:'Sleep (7–9 hours)',           icon:'💤', cat:'physical', dur:'7–9 hrs', color:'#1e293b', tips:['Consistent time is more important than duration','No alarm scrolling — get up immediately','Track with a wearable if curious'] }
  };

  // ── Helper: pick activity by condition ───────────────────────────────────
  function pick(conditions, fallback) {
    for (const [cond, act] of conditions) {
      if (cond) return act;
    }
    return fallback;
  }

  // ── Core routine builder ──────────────────────────────────────────────────
  function generateRoutine(scores) {
    if (!scores || typeof scores !== 'object') {
      console.error('❌ RoutineEngine.generateRoutine: invalid scores');
      return null;
    }

    const s = {
      physical:  typeof scores.physical  === 'number' ? Math.max(0, Math.min(100, scores.physical))  : 50,
      mental:    typeof scores.mental    === 'number' ? Math.max(0, Math.min(100, scores.mental))    : 50,
      emotional: typeof scores.emotional === 'number' ? Math.max(0, Math.min(100, scores.emotional)) : 50
    };
    s.overall = typeof scores.overall === 'number'
      ? scores.overall
      : Math.round(s.physical * 0.35 + s.mental * 0.35 + s.emotional * 0.30);

    const persona = PERSONAS.find(p => p.condition(s)) || PERSONAS[PERSONAS.length - 1];

    // ── Morning block ─────────────────────────────────────────────────────
    const morningMeditation = pick([
      [s.mental < 40,  ACT.meditation5],
      [s.mental < 60,  ACT.meditation10],
      [s.mental >= 60, ACT.meditation20]
    ], ACT.meditation10);

    const morningMovement = pick([
      [s.physical < 40,  ACT.stretching],
      [s.physical < 65,  ACT.walk20],
      [s.physical >= 65, ACT.walk30]
    ], ACT.walk20);

    const morningShower = s.overall >= 70 ? ACT.coldShower : null;

    // ── Work blocks ───────────────────────────────────────────────────────
    const amWorkBlock = pick([
      [s.mental < 45, ACT.pomodoro],
      [s.mental < 70, ACT.deepWork60],
      [s.mental >= 70, ACT.deepWork90]
    ], ACT.deepWork60);

    const pmWorkBlock = pick([
      [s.mental < 50, ACT.pomodoro],
      [s.mental >= 50, ACT.lightWork]
    ], ACT.lightWork);

    // ── Afternoon extras ──────────────────────────────────────────────────
    const afternoonExtra = pick([
      [s.mental < 50,   ACT.powerNap],
      [s.physical < 50, ACT.afternoonWalk],
      [true,            ACT.afternoonWalk]
    ], ACT.afternoonWalk);

    // ── Evening physical ──────────────────────────────────────────────────
    const eveningPhysical = pick([
      [s.physical < 40,  ACT.gentleStretch],
      [s.physical < 60,  ACT.yoga],
      [s.physical >= 60, ACT.exercise30]
    ], ACT.exercise30);

    // ── Evening mental ────────────────────────────────────────────────────
    const eveningMental = pick([
      [s.mental < 50,   ACT.digitalDetox],
      [s.mental >= 50,  ACT.reading]
    ], ACT.reading);

    // ── Evening social ────────────────────────────────────────────────────
    const eveningEmotional = pick([
      [s.emotional < 50,  ACT.socialTime],
      [s.emotional >= 50, ACT.familyTime]
    ], ACT.familyTime);

    // ── Assemble timeline ─────────────────────────────────────────────────
    const rawBlocks = [
      { time:'5:30 AM', period:'Morning',   reason:'Start the day with calm and hydration.',                         act: ACT.hydrate },
      { time:'5:35 AM', period:'Morning',   reason: s.mental < 60 ? 'Low mental score → begin with mindfulness to reduce morning anxiety.' : 'Primes the nervous system for focus and clarity.', act: morningMeditation },
      { time:'6:00 AM', period:'Morning',   reason:'Gratitude shifts your emotional baseline for the entire day.',   act: ACT.gratitude },
      morningShower ? { time:'6:05 AM', period:'Morning', reason:'Cold exposure increases alertness, dopamine, and immune resilience.', act: morningShower } : null,
      { time:'6:30 AM', period:'Morning',   reason: s.physical < 50 ? 'Low physical score → morning movement is your highest-impact habit.' : 'Morning movement maximises energy and metabolism all day.', act: morningMovement },
      { time:'7:30 AM', period:'Morning',   reason:'Fuel your brain and body before the first work session.',        act: ACT.healthyBreakfast },
      { time:'8:30 AM', period:'Morning',   reason: s.mental < 50 ? 'Your best cognitive window — Pomodoro blocks prevent mental overload.' : 'Deep work in the morning leverages peak cognitive performance.', act: amWorkBlock },
      { time:'10:30 AM', period:'Morning',  reason:'Protect your eyes and mental clarity with a screen-free pause.', act: ACT.microBreak },
      { time:'10:35 AM', period:'Morning',  reason:'Continue focused output before the afternoon energy dip.',       act: { ...amWorkBlock, title: amWorkBlock.title + ' (2nd Block)' } },
      { time:'12:15 PM', period:'Afternoon',reason: s.emotional < 50 ? 'Shared meals restore emotional wellbeing — eat with someone if possible.' : 'A proper lunch break resets energy and prevents burnout.', act: ACT.lunchBreak },
      { time:'1:00 PM', period:'Afternoon', reason: afternoonExtra === ACT.powerNap ? 'Low mental score → a 15-min nap restores cognitive performance by 34%.' : 'A short walk breaks the post-lunch energy dip.', act: afternoonExtra },
      { time:'1:30 PM', period:'Afternoon', reason:'Use the afternoon for admin, emails, and lower-priority tasks.', act: pmWorkBlock },
      { time:'3:00 PM', period:'Afternoon', reason:'A hydration and micro-movement break prevents the 3 PM slump.',  act: ACT.microBreak },
      { time:'3:05 PM', period:'Afternoon', reason:'Final focused session before evening transition.',               act: { ...amWorkBlock, title: 'Final Work Block', dur: '45 min' } },
      { time:'6:00 PM', period:'Evening',   reason: s.physical < 40 ? 'Low physical score → consistent evening movement is non-negotiable for recovery.' : 'Evening exercise releases endorphins and reduces work stress.', act: eveningPhysical },
      { time:'7:00 PM', period:'Evening',   reason: s.emotional < 50 ? 'Low emotional score → prioritise face-to-face connection this evening.' : 'Quality time with loved ones restores emotional reserves.', act: eveningEmotional },
      { time:'8:00 PM', period:'Evening',   reason: s.mental < 50 ? 'Low mental score → removing screens for 2 hours is the most impactful change you can make.' : 'Evening reading signals your brain to wind down.', act: eveningMental },
      { time:'9:00 PM', period:'Night',     reason:'Externalising the day\'s thoughts prevents them from disrupting sleep.',act: ACT.eveningJournal },
      { time:'9:15 PM', period:'Night',     reason:'A consistent sleep ritual trains your body to wind down on schedule.', act: ACT.sleepPrep },
      { time:'10:00 PM',period:'Night',     reason:'7–9 hours of quality sleep is the single most impactful wellness habit.', act: ACT.sleep }
    ].filter(Boolean); // remove null blocks

    // Assign period colors
    const periodColors = { Morning:'#f59e0b', Afternoon:'#3b82f6', Evening:'#a855f7', Night:'#1e293b' };

    const blocks = rawBlocks.map((b, idx) => ({
      id:        idx,
      time:      b.time,
      period:    b.period,
      periodColor: periodColors[b.period] || '#667eea',
      title:     b.act.title,
      icon:      b.act.icon,
      category:  b.act.cat,
      duration:  b.act.dur,
      color:     b.act.color,
      reason:    b.reason,
      tips:      b.act.tips || []
    }));

    // Estimated wellness impact score (0-100)
    const adherenceBonus = s.overall < 50 ? 15 : s.overall < 70 ? 10 : 7;
    const projectedScore = Math.min(100, Math.round(s.overall + adherenceBonus));

    return {
      generated:      new Date().toISOString(),
      scores:         s,
      persona,
      blocks,
      projectedScore,
      totalActivities: blocks.length,
      totalMins: blocks.reduce((acc, b) => {
        const n = parseInt(b.duration);
        return acc + (isNaN(n) ? 0 : n);
      }, 0)
    };
  }

  return { generateRoutine };
})();
