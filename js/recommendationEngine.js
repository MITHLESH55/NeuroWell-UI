/**
 * NEUROWELL - Smart Recommendation Engine v2
 * Fully dynamic, rule-based engine. No static text in callers.
 * generateRecommendations(scores) → structured JSON
 */

const SmartRecommendationEngine = {

  // ── Score tiers ────────────────────────────────────────────────────────────
  TIERS: {
    critical:  { min:0,  max:29,  label:'Critical',        color:'#ef4444', bg:'rgba(239,68,68,0.12)',   emoji:'🚨' },
    low:       { min:30, max:49,  label:'Needs Attention', color:'#f97316', bg:'rgba(249,115,22,0.12)',  emoji:'⚠️' },
    moderate:  { min:50, max:69,  label:'Developing',      color:'#f59e0b', bg:'rgba(245,158,11,0.12)',  emoji:'📈' },
    good:      { min:70, max:84,  label:'Good',            color:'#10b981', bg:'rgba(16,185,129,0.12)',  emoji:'✅' },
    excellent: { min:85, max:100, label:'Excellent',       color:'#6366f1', bg:'rgba(99,102,241,0.12)',  emoji:'⭐' }
  },

  // ── Physical rules ─────────────────────────────────────────────────────────
  PHYSICAL_RULES: {
    critical: [
      { id:'p1', title:'5-Minute Starter Walks', description:'Rebuild your baseline with 3 very short walks daily. Even minimal movement reverses physical deconditioning within days.', priority:'CRITICAL', icon:'🦶', duration:'5 mins', frequency:'3× Daily', difficulty:'Very Easy', impact:'Foundation', tips:['Walk on flat surfaces','Go at a comfortable pace','Progress by 1 min each week'] },
      { id:'p2', title:'Fixed Sleep Schedule', description:'Set a consistent bedtime and wake time — even on weekends. Erratic sleep is the most damaging physical pattern you can break.', priority:'CRITICAL', icon:'🌙', duration:'7–9 hrs', frequency:'Nightly', difficulty:'Moderate', impact:'Very High', tips:['No screens 1 hr before bed','Keep bedroom cool (18°C)','Avoid caffeine after 2 PM'] },
      { id:'p3', title:'Morning Stretch Routine', description:'5 minutes of full-body stretching each morning improves circulation, reduces stiffness, and sets a physical-health intention for the day.', priority:'HIGH', icon:'🧘', duration:'5–10 mins', frequency:'Daily', difficulty:'Very Easy', impact:'High', tips:['Hold each stretch 20 sec','Target neck, back, and hips','Never stretch to pain'] }
    ],
    low: [
      { id:'p4', title:'20-Minute Daily Walk', description:'A brisk 20-minute walk daily measurably improves cardiovascular health and energy within 2 weeks. The single highest-ROI physical habit.', priority:'HIGH', icon:'🚶', duration:'20 mins', frequency:'Daily', difficulty:'Easy', impact:'High', tips:['Walk at conversational pace','Use a step counter','Change routes to stay motivated'] },
      { id:'p5', title:'Hydration Protocol', description:'Drink 2.5–3 L of water daily. Chronic mild dehydration causes fatigue, brain fog, and poor physical performance — all easily reversed.', priority:'HIGH', icon:'💧', duration:'All day', frequency:'Daily', difficulty:'Easy', impact:'High', tips:['Start with 500 ml on waking','Carry a water bottle','Set hourly phone reminders'] },
      { id:'p6', title:'Sleep Hygiene Basics', description:'Improve sleep quality through a consistent wind-down routine. 7–8 hours of quality sleep repairs muscle, regulates hormones, and resets energy.', priority:'MEDIUM', icon:'🛌', duration:'7–8 hrs', frequency:'Nightly', difficulty:'Moderate', impact:'Very High', tips:['No alcohol within 3 hrs of bed','Use white noise if needed','Dim lights 1 hr before sleep'] }
    ],
    moderate: [
      { id:'p7', title:'3× Weekly Cardio', description:'Structured cardio three times a week produces measurable fitness gains within 4 weeks. Pick an activity you enjoy — compliance beats perfection.', priority:'MEDIUM', icon:'🏃', duration:'30–45 mins', frequency:'3× Weekly', difficulty:'Moderate', impact:'High', tips:['Alternate activity types','Track heart rate zones','Rest at least 1 day between sessions'] },
      { id:'p8', title:'Balanced Nutrition Plan', description:'Structure meals around lean protein, complex carbs, and healthy fats. Reducing processed food 80% of the time produces dramatic physical improvements.', priority:'MEDIUM', icon:'🥗', duration:'Ongoing', frequency:'Daily', difficulty:'Moderate', impact:'High', tips:['Prep meals on Sundays','Include protein at every meal','Limit refined sugar to < 25 g/day'] },
      { id:'p9', title:'Bodyweight Strength Training', description:'Two sessions per week of push-ups, squats, and planks builds functional strength without any equipment.', priority:'LOW', icon:'💪', duration:'20–30 mins', frequency:'2× Weekly', difficulty:'Moderate', impact:'Medium', tips:['Master form before adding reps','Rest 60–90 sec between sets','Progress by adding 1 rep per week'] }
    ],
    good: [
      { id:'p10', title:'Periodised Training', description:'Alternate high-intensity and recovery weeks to break through fitness plateaus. Your body adapts to constant stimulus — variety drives progress.', priority:'LOW', icon:'📊', duration:'45–60 mins', frequency:'4× Weekly', difficulty:'Hard', impact:'Medium', tips:['Use RPE scale for intensity','Add intervals 1×/week','Track progressive overload'] },
      { id:'p11', title:'Advanced Sleep Optimisation', description:'Fine-tune your sleep environment: blackout curtains, 18°C room, and magnesium glycinate before bed to increase deep sleep duration.', priority:'LOW', icon:'💤', duration:'7.5–9 hrs', frequency:'Nightly', difficulty:'Easy', impact:'Medium', tips:['Use a sleep tracker app','Try 300 mg magnesium glycinate','Maintain a pre-sleep ritual'] }
    ],
    excellent: [
      { id:'p12', title:'Injury Prevention & Mobility', description:'Your physical health is excellent. Protect it with daily mobility work and foam rolling. Longevity is the goal now — not just performance.', priority:'LOW', icon:'🌟', duration:'15–20 mins', frequency:'Daily', difficulty:'Easy', impact:'Preventive', tips:['Prioritise mobility over flexibility','Book quarterly health check-ups','Try Pilates or yoga for longevity'] }
    ]
  },

  // ── Mental rules ───────────────────────────────────────────────────────────
  MENTAL_RULES: {
    critical: [
      { id:'m1', title:'5-4-3-2-1 Grounding', description:'Name 5 things you see, 4 you feel, 3 you hear, 2 you smell, 1 you taste. This immediately interrupts anxiety spirals by anchoring awareness to the present.', priority:'CRITICAL', icon:'🧠', duration:'5 mins', frequency:'When overwhelmed', difficulty:'Very Easy', impact:'Immediate', tips:['Do it silently at work','Practise before you need it','Share it with someone you trust'] },
      { id:'m2', title:'Evening Digital Detox', description:'Phone-free 7–9 PM every evening. Constant connectivity is the primary driver of modern mental exhaustion. Two hours offline restores a sense of control.', priority:'CRITICAL', icon:'📵', duration:'2 hrs', frequency:'Daily (Evening)', difficulty:'Moderate', impact:'Very High', tips:['Use app timers to enforce limits','Replace with a walk or book','Keep phone outside the bedroom'] },
      { id:'m3', title:'5-Minute Evening Journal', description:'Write 5 sentences: what happened, what stressed you, and one positive thing. Externalising thoughts reduces cognitive load measurably.', priority:'HIGH', icon:'📔', duration:'5–10 mins', frequency:'Daily', difficulty:'Easy', impact:'High', tips:['Don\'t edit — just write','Keep it private and honest','Focus on feelings, not events'] }
    ],
    low: [
      { id:'m4', title:'10-Min Guided Meditation', description:'Daily guided meditation lowers cortisol by 15–20% with 8 weeks of consistent practice. Start with free YouTube body-scan or breathwork sessions.', priority:'HIGH', icon:'🧘', duration:'10 mins', frequency:'Daily (Morning)', difficulty:'Easy', impact:'High', tips:['Same time each day for habit formation','Use headphones for immersion','Try Headspace, Calm, or YouTube'] },
      { id:'m5', title:'Pomodoro Work Breaks', description:'25 minutes focused work, 5 minutes completely off-screen. Prevents mental fatigue accumulation and sustains cognitive performance across the day.', priority:'HIGH', icon:'⏱️', duration:'5 min breaks', frequency:'Every 25 mins', difficulty:'Easy', impact:'High', tips:['Use a physical timer, not phone','Stand and stretch during breaks','Protect break time strictly'] },
      { id:'m6', title:'Limit News Consumption', description:'15 minutes of news in the morning only. Constant negative news exposure creates sustained low-grade anxiety throughout the day.', priority:'MEDIUM', icon:'📰', duration:'15 mins max', frequency:'Once Daily', difficulty:'Moderate', impact:'Medium', tips:['Unsubscribe from push notifications','Check news at a fixed time only','Replace with a podcast or audiobook'] }
    ],
    moderate: [
      { id:'m7', title:'Mindfulness Deepening', description:'Extend meditation to 15–20 minutes and explore Loving-Kindness (Metta) practice, which builds emotional resilience and reduces negative self-talk.', priority:'MEDIUM', icon:'🌿', duration:'15–20 mins', frequency:'Daily', difficulty:'Moderate', impact:'High', tips:['Try different styles to find your fit','Join a local mindfulness group','Practice mindful eating once/week'] },
      { id:'m8', title:'Work-Life Boundary Setting', description:'Hard stop at 6 PM. No work communication after hours. Boundaries are the most powerful, accessible mental health tool for professionals.', priority:'MEDIUM', icon:'🚧', duration:'After 6 PM', frequency:'Daily', difficulty:'Moderate', impact:'High', tips:['Communicate limits clearly to your team','Create a "shutdown ritual"','Don\'t check email from bed'] },
      { id:'m9', title:'Cognitive Reframing Journal', description:'For each problem you write, also write the most realistic positive interpretation. Trains your brain to seek solutions over threats.', priority:'LOW', icon:'🔄', duration:'10 mins', frequency:'3× Weekly', difficulty:'Moderate', impact:'Medium', tips:['Ask: "What would I say to a friend?"','Track recurring negative thought patterns','Challenge your first interpretation'] }
    ],
    good: [
      { id:'m10', title:'Advanced Breathwork', description:'Explore Wim Hof, box breathing, or Yoga Nidra. These practices build deep physiological stress resilience beyond standard meditation.', priority:'LOW', icon:'🏔️', duration:'20–30 mins', frequency:'Daily', difficulty:'Hard', impact:'Medium', tips:['Learn Wim Hof method online (free)','Try box breathing: 4-4-4-4','Practice on an empty stomach'] },
      { id:'m11', title:'Morning Ritual Stack', description:'10 min meditation + gratitude journal + cold shower. This combination primes the nervous system for high performance and emotional stability.', priority:'LOW', icon:'🌅', duration:'30–45 mins', frequency:'Daily (Morning)', difficulty:'Moderate', impact:'Medium', tips:['Start with just 2 components','Track daily mood scores','Protect the first 45 min of your day'] }
    ],
    excellent: [
      { id:'m12', title:'Sustain & Support Others', description:'Your mental wellness is excellent. Teaching techniques to others — coaching, sharing, or mentoring — amplifies your own mental resilience.', priority:'LOW', icon:'🌟', duration:'30 mins', frequency:'Weekly', difficulty:'Easy', impact:'Sustaining', tips:['Join a mindfulness community','Explore positive psychology books','Teach one technique to someone this week'] }
    ]
  },

  // ── Emotional rules ────────────────────────────────────────────────────────
  EMOTIONAL_RULES: {
    critical: [
      { id:'e1', title:'Reach Out Today', description:'Send a message to one trusted person — even "thinking of you." Human connection is the fastest route to emotional regulation when you\'re at a low point.', priority:'CRITICAL', icon:'💬', duration:'5 mins', frequency:'Daily', difficulty:'Easy', impact:'Immediate', tips:['It doesn\'t need to be about your struggles','A voice note counts','Accept help when it\'s offered'] },
      { id:'e2', title:'Expressive Writing', description:'Write about your feelings for 10 minutes without judgment. Three sessions of expressive writing measurably reduce emotional distress (proven in 50+ studies).', priority:'CRITICAL', icon:'📖', duration:'10 mins', frequency:'Daily', difficulty:'Easy', impact:'Very High', tips:['Write by hand — not on screen','No grammar or structure needed','Destroy the pages if privacy is a concern'] },
      { id:'e3', title:'Identify & Reduce Triggers', description:'Note 2–3 recurring situations that consistently damage your emotional state. Temporarily reduce exposure while you build coping strategies.', priority:'HIGH', icon:'🛡️', duration:'Awareness', frequency:'Ongoing', difficulty:'Hard', impact:'High', tips:['Keep a trigger log for 1 week','Share triggers with someone safe','Replace trigger situations gradually'] }
    ],
    low: [
      { id:'e4', title:'Daily Gratitude Practice', description:'Write 3 specific things you\'re grateful for each morning. Specificity matters: "warm coffee" beats "my life." Rewires the brain toward positive expectation within 3 weeks.', priority:'HIGH', icon:'🙏', duration:'5 mins', frequency:'Daily (Morning)', difficulty:'Very Easy', impact:'High', tips:['Be specific, not generic','Notice how your list evolves over weeks','Share one daily gratitude with someone'] },
      { id:'e5', title:'Weekly Social Connection', description:'Schedule one meaningful social interaction per week. Social connection is a primary predictor of long-term emotional health — more powerful than any supplement.', priority:'HIGH', icon:'🤝', duration:'1 hr', frequency:'Weekly', difficulty:'Easy', impact:'High', tips:['Put it in the calendar as a commitment','Be present — no phones','Alternate between different relationships'] },
      { id:'e6', title:'Self-Compassion Practice', description:'Replace inner self-criticism with what you\'d say to a dear friend in the same situation. Self-compassion is proven more effective than self-criticism for lasting change.', priority:'MEDIUM', icon:'❤️', duration:'Ongoing', frequency:'Daily awareness', difficulty:'Moderate', impact:'High', tips:['Notice the tone of your inner voice','Ask: "Would I say this to a friend?"','Read Kristin Neff\'s work on self-compassion'] }
    ],
    moderate: [
      { id:'e7', title:'Emotion Naming Practice', description:'Name your emotions precisely — "overwhelmed" is different from "anxious." Precision reduces intensity. Try the Feelings Wheel to expand your emotional vocabulary.', priority:'MEDIUM', icon:'🎭', duration:'Ongoing', frequency:'Daily awareness', difficulty:'Moderate', impact:'High', tips:['Download a Feelings Wheel chart','Name emotions in real-time','Journal your emotional vocabulary weekly'] },
      { id:'e8', title:'Build Your Support Network', description:'Actively nurture 3–5 relationships at varying depths. Diverse support prevents emotional fragility better than any single close relationship.', priority:'MEDIUM', icon:'🕸️', duration:'30 mins', frequency:'2× Weekly', difficulty:'Easy', impact:'Medium', tips:['Map your support network on paper','Send one unexpected "thinking of you" weekly','Join a group around shared interests'] },
      { id:'e9', title:'Scheduled Joy Activities', description:'Identify 2 activities that reliably lift your emotional state and schedule them as non-negotiable weekly appointments.', priority:'LOW', icon:'🎨', duration:'45–60 mins', frequency:'Weekly', difficulty:'Easy', impact:'Medium', tips:['Options: art, music, cooking, dance, sport','Do it even when you don\'t feel like it','Track mood before and after'] }
    ],
    good: [
      { id:'e10', title:'Deepen Relationship Quality', description:'Move from transactional to meaningful conversations. Ask "What\'s been on your mind lately?" instead of "How are you?" Depth of connection matters more than frequency.', priority:'LOW', icon:'💎', duration:'1–2 hrs', frequency:'Weekly', difficulty:'Moderate', impact:'Medium', tips:['Prepare thoughtful questions','Practise active, reflective listening','Share your own vulnerabilities to invite depth'] },
      { id:'e11', title:'Emotional Mastery', description:'Explore NVC (Non-Violent Communication), Stoic evening review journaling, or somatic practices to develop advanced emotional regulation skills.', priority:'LOW', icon:'🔮', duration:'20 mins', frequency:'3× Weekly', difficulty:'Hard', impact:'Medium', tips:['Read "Nonviolent Communication" by Rosenberg','Try a Stoic evening review journal','Consider therapy for growth, not crisis'] }
    ],
    excellent: [
      { id:'e12', title:'Emotional Leadership', description:'Your emotional health is excellent. Channel this into being a stabilising presence for others. Empathy and active listening for those around you amplifies your own wellness.', priority:'LOW', icon:'🌟', duration:'Ongoing', frequency:'Daily', difficulty:'Easy', impact:'Sustaining', tips:['Volunteer as a peer support listener','Share emotional health resources','Practise "holding space" for others'] }
    ]
  },

  // ── Expert profiles ────────────────────────────────────────────────────────
  _EXPERT_BASE: {
    physiotherapist: {
      id:'physiotherapist', title:'Physiotherapist',
      subtitle:'Physical Recovery & Movement',
      avatar:'🏥', icon:'fa-user-md',
      color:'#10b981', gradient:'linear-gradient(135deg,#10b981,#059669)',
      specialties:['Injury Recovery','Posture Correction','Sports Rehab','Pain Management'],
      approach:'Evidence-based physical assessment and personalised exercise therapy',
      session:'60-min initial assessment + weekly follow-ups',
      availability:'Mon–Sat · In-person & telehealth'
    },
    psychologist: {
      id:'psychologist', title:'Psychologist',
      subtitle:'Mental Health & Cognitive Wellness',
      avatar:'🧠', icon:'fa-brain',
      color:'#a855f7', gradient:'linear-gradient(135deg,#a855f7,#7c3aed)',
      specialties:['Stress & Anxiety','CBT & DBT','Burnout Recovery','Performance Psychology'],
      approach:'Cognitive-behavioural therapy, mindfulness-based stress reduction, and solution-focused coaching',
      session:'50-min therapy sessions · fortnightly or weekly',
      availability:'Mon–Fri · Video & in-person'
    },
    nutritionist: {
      id:'nutritionist', title:'Nutritionist',
      subtitle:'Diet Optimisation & Energy',
      avatar:'🥗', icon:'fa-apple-alt',
      color:'#f59e0b', gradient:'linear-gradient(135deg,#f59e0b,#d97706)',
      specialties:['Meal Planning','Energy Optimisation','Gut Health','Anti-Inflammatory Diet'],
      approach:'Personalised nutrition protocols based on your wellness scores and lifestyle',
      session:'45-min consultation + 2-week meal plan',
      availability:'Tue–Sat · Online & clinic'
    },
    counselor: {
      id:'counselor', title:'Wellness Counselor',
      subtitle:'Emotional Intelligence & Resilience',
      avatar:'💛', icon:'fa-hands-helping',
      color:'#f43f5e', gradient:'linear-gradient(135deg,#f43f5e,#e11d48)',
      specialties:['Emotional Regulation','Relationship Health','Resilience Building','Self-Compassion'],
      approach:'Integrative counseling combining positive psychology and somatic awareness',
      session:'50-min sessions · weekly or fortnightly',
      availability:'Mon–Sat · Video & in-person'
    },
    sleepSpecialist: {
      id:'sleepSpecialist', title:'Sleep Specialist',
      subtitle:'Restorative Sleep & Recovery',
      avatar:'🌙', icon:'fa-moon',
      color:'#6366f1', gradient:'linear-gradient(135deg,#6366f1,#4f46e5)',
      specialties:['Sleep Hygiene','Insomnia Treatment','Circadian Optimisation','Fatigue Management'],
      approach:'CBT-I (Cognitive Behavioural Therapy for Insomnia) and sleep architecture analysis',
      session:'60-min assessment + 4-week programme',
      availability:'Wed–Sun · Telehealth only'
    }
  },

  _EXPERT_DESC: {
    physiotherapist: { critical:'Your physical score is critically low. A physiotherapist will assess your state and build a safe personalised recovery programme.', low:'A physiotherapist can identify the root causes of your physical limitations and structure an improvement plan.', moderate:'Working with a physiotherapist accelerates progress and ensures your technique is safe and effective.', good:'Periodic check-ins optimise performance and prevent injury as you push your limits.', excellent:'An optional performance consultation helps maintain elite physical health.' },
    psychologist:    { critical:'Your mental health requires urgent professional attention. A psychologist provides evidence-based interventions for stress, anxiety, and burnout.', low:'A psychologist helps build structured coping strategies and cognitive tools to shift your mental trajectory.', moderate:'Regular sessions help break through persistent mental blocks and build more resilient thought patterns.', good:'A psychologist helps sustain your progress and develop advanced emotional regulation for peak performance.', excellent:'Optional periodic sessions support continued mental growth and life-transition clarity.' },
    counselor:       { critical:'Your emotional score is critical. A counselor provides a safe, confidential space to process your experiences and develop immediate coping strategies.', low:'A counselor helps you understand emotional patterns and build healthier self-regulation skills.', moderate:'Counseling consolidates your progress and builds deeper interpersonal and emotional skills.', good:'A counselor deepens emotional intelligence and helps navigate complex relationship dynamics.', excellent:'Optional sessions leverage your emotional strengths for leadership, relationships, and growth.' },
    nutritionist:    { critical:'Nutrition directly impacts physical and mental recovery. A nutritionist can create a personalised plan to support your healing.', low:'A structured nutrition plan from a specialist can dramatically accelerate your wellness improvements.', moderate:'Optimising your diet with professional guidance can break through current plateaus.', good:'Fine-tuned nutrition supports your high-performance goals and long-term health.', excellent:'Optional consultation to optimise sports nutrition or advanced dietary strategies.' },
    sleepSpecialist: { critical:'Severely disrupted sleep is a medical concern. A sleep specialist can diagnose and treat underlying issues driving your fatigue.', low:'A sleep specialist creates a personalised sleep improvement plan targeting your specific patterns.', moderate:'Professional sleep analysis can identify hidden disruptions preventing full recovery.', good:'Advanced sleep optimisation supports peak performance and cognitive clarity.', excellent:'Optional consultation to fine-tune your already excellent sleep quality.' }
  },

  _URGENCY: {
    critical:  { label:'Strongly Recommended', color:'#ef4444', priority:1 },
    low:       { label:'Recommended',           color:'#f97316', priority:2 },
    moderate:  { label:'Beneficial',            color:'#f59e0b', priority:3 },
    good:      { label:'Optional',              color:'#10b981', priority:4 },
    excellent: { label:'Maintenance',           color:'#6366f1', priority:5 }
  },

  _OVERALL_MSG: {
    critical:  'Your wellness needs immediate, consistent attention. Start with one small change today — momentum builds quickly.',
    low:       'You\'re at the beginning of your journey. Every positive step creates compound improvements. Be patient and consistent.',
    moderate:  'You\'re building solid foundations. With focused effort over the next 30 days you can move into the "Good" tier.',
    good:      'Great progress! You\'re in a healthy range. Small optimisations now will push you toward excellent long-term wellness.',
    excellent: 'Outstanding wellness. Your focus now is maintaining habits, preventing regression, and supporting those around you.'
  },

  // ── Public API ─────────────────────────────────────────────────────────────
  getTier(score) {
    if (score < 30) return 'critical';
    if (score < 50) return 'low';
    if (score < 70) return 'moderate';
    if (score < 85) return 'good';
    return 'excellent';
  },

  _buildExpert(id, score) {
    const tier   = this.getTier(score);
    const base   = this._EXPERT_BASE[id];
    const urg    = this._URGENCY[tier];
    const desc   = this._EXPERT_DESC[id]?.[tier] || base.subtitle;
    return {
      ...base,
      urgency:         urg.label,
      urgencyColor:    urg.color,
      urgencyPriority: urg.priority,
      description:     desc,
      score,
      tier
    };
  },

  generateRecommendations(scores) {
    if (!scores || typeof scores !== 'object') {
      console.error('❌ SmartRecommendationEngine: invalid scores', scores);
      return { physical:[], mental:[], emotional:[], doctors:[] };
    }

    const s = {
      physical:  typeof scores.physical  === 'number' ? Math.max(0, Math.min(100, scores.physical))  : 50,
      mental:    typeof scores.mental    === 'number' ? Math.max(0, Math.min(100, scores.mental))    : 50,
      emotional: typeof scores.emotional === 'number' ? Math.max(0, Math.min(100, scores.emotional)) : 50
    };
    s.overall = typeof scores.overall === 'number'
      ? scores.overall
      : Math.round(s.physical * 0.35 + s.mental * 0.35 + s.emotional * 0.30);

    const pt = this.getTier(s.physical);
    const mt = this.getTier(s.mental);
    const et = this.getTier(s.emotional);
    const ot = this.getTier(s.overall);

    const categories = {
      physical:  { score:s.physical,  tier:pt, name:'Physical Health',    icon:'💪', color:this.TIERS[pt].color, bg:this.TIERS[pt].bg, label:this.TIERS[pt].label, emoji:this.TIERS[pt].emoji, suggestions: this.PHYSICAL_RULES[pt]  || [] },
      mental:    { score:s.mental,    tier:mt, name:'Mental Health',      icon:'🧠', color:this.TIERS[mt].color, bg:this.TIERS[mt].bg, label:this.TIERS[mt].label, emoji:this.TIERS[mt].emoji, suggestions: this.MENTAL_RULES[mt]    || [] },
      emotional: { score:s.emotional, tier:et, name:'Emotional Wellness', icon:'❤️', color:this.TIERS[et].color, bg:this.TIERS[et].bg, label:this.TIERS[et].label, emoji:this.TIERS[et].emoji, suggestions: this.EMOTIONAL_RULES[et] || [] }
    };

    // Build experts — core 3 always shown, 2 conditional
    const experts = [
      this._buildExpert('physiotherapist', s.physical),
      this._buildExpert('psychologist',    s.mental),
      this._buildExpert('nutritionist',    s.physical)
    ];
    if (s.mental   < 50 || s.emotional < 55) experts.push(this._buildExpert('counselor',       s.emotional));
    if (s.physical < 50 || s.mental    < 45) experts.push(this._buildExpert('sleepSpecialist', Math.min(s.physical, s.mental)));
    experts.sort((a, b) => a.urgencyPriority - b.urgencyPriority);

    // Quick wins: easiest high-impact suggestions across all categories
    const all = [
      ...categories.physical.suggestions.map(x  => ({ ...x, category:'Physical'  })),
      ...categories.mental.suggestions.map(x    => ({ ...x, category:'Mental'    })),
      ...categories.emotional.suggestions.map(x => ({ ...x, category:'Emotional' }))
    ];
    const quickWins = all.filter(x => x.difficulty === 'Very Easy' || x.difficulty === 'Easy').slice(0, 3);

    return {
      generated:      new Date().toISOString(),
      scores:         s,
      overallTier:    ot,
      overallLabel:   this.TIERS[ot].label,
      overallColor:   this.TIERS[ot].color,
      overallMessage: this._OVERALL_MSG[ot],
      categories,
      experts,
      quickWins,
      // Legacy-compatible flat arrays
      physical:  categories.physical.suggestions,
      mental:    categories.mental.suggestions,
      emotional: categories.emotional.suggestions,
      doctors:   experts
    };
  }
};
