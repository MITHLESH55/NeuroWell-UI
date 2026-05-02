/**
 * NEUROWELL - Wellness Coach Chatbot
 * Context-aware rule-based coach. LLM API-ready (swap _llmAdapter).
 * Integrates with CIM (stress/mood) + Personalization (goals/plan).
 */

const WellnessCoach = (() => {

  // ── LLM Adapter (swap for OpenAI/Gemini) ──────────────────────────
  const _llmAdapter = {
    async complete(messages, context) {
      // Replace with: fetch('/api/chat', {method:'POST', body:JSON.stringify({messages, context})})
      return null; // null = use rule engine
    }
  };

  // ── Storage ────────────────────────────────────────────────────────
  const _store = {
    KEY: 'nw_chatbot_v1',
    get()  { try { return JSON.parse(localStorage.getItem(this.KEY) || '{"history":[]}'); } catch { return { history:[] }; } },
    set(d) { try { localStorage.setItem(this.KEY, JSON.stringify(d)); } catch {} }
  };

  // ── Intent Detection ───────────────────────────────────────────────
  const INTENTS = [
    { id:'stress',     patterns:['stress','anxious','anxiety','overwhelmed','tense','pressure','panic','worried'], weight:3 },
    { id:'sleep',      patterns:['sleep','tired','exhausted','insomnia','can\'t sleep','fatigued','rest'], weight:3 },
    { id:'motivation', patterns:['motivat','lazy','procrastinat','unmotivated','can\'t start','give up','quit'], weight:3 },
    { id:'sadness',    patterns:['sad','depressed','lonely','empty','hopeless','unhappy','down','low'], weight:3 },
    { id:'activity',   patterns:['exercise','workout','walk','run','gym','fitness','inactive','sedentary'], weight:2 },
    { id:'nutrition',  patterns:['eat','food','diet','nutrition','hungry','meal','drink','water'], weight:2 },
    { id:'goals',      patterns:['goal','target','progress','achieve','complete','challenge'], weight:2 },
    { id:'plan',       patterns:['plan','routine','schedule','today','task','todo'], weight:2 },
    { id:'mood',       patterns:['mood','feel','feeling','emotion','happy','joy'], weight:2 },
    { id:'greeting',   patterns:['hello','hi','hey','good morning','good evening','what\'s up','how are'], weight:1 },
    { id:'help',       patterns:['help','what can you do','how does','guide','explain'], weight:1 },
    { id:'thanks',     patterns:['thank','thanks','awesome','great','perfect','love it'], weight:1 },
  ];

  function _detectIntent(text) {
    const lower = text.toLowerCase();
    const scores = {};
    INTENTS.forEach(intent => {
      intent.patterns.forEach(p => {
        if (lower.includes(p)) scores[intent.id] = (scores[intent.id] || 0) + intent.weight;
      });
    });
    const sorted = Object.entries(scores).sort((a,b) => b[1]-a[1]);
    return sorted.length > 0 ? sorted[0][0] : 'unknown';
  }

  // ── Response Templates ─────────────────────────────────────────────
  function _buildResponse(intent, ctx) {
    const { mood, stress, sleep, activity, plan, goals, streak } = ctx;
    const moodLow   = mood && (mood.mood === 'Low' || mood.mood === 'Critical');
    const highStress= stress >= 7;
    const lowSleep  = sleep < 6.5;
    const lowAct    = activity <= 3;
    const streakMsg = streak > 0 ? ` You're on a ${streak}-day streak — keep it alive! 🔥` : '';

    const responses = {
      stress: highStress
        ? `I can see stress is really high right now (${stress}/10). Here's what I recommend immediately:\n\n1. **Box Breathing** — inhale 4 counts, hold 4, exhale 4, hold 4. Do 6 rounds.\n2. **Phone down** for 20 minutes — no social media.\n3. Step outside for 5 minutes of fresh air.\n\nYour daily plan already includes a stress task. Want me to show it?`
        : `Stress at ${stress}/10 is manageable! A few tips:\n\n• Try the Pomodoro technique: 25 min work → 5 min break\n• A short walk resets your cortisol levels quickly\n• Your meditation task in today's plan is worth prioritising.${streakMsg}`,

      sleep: lowSleep
        ? `Only ${sleep}h of sleep is affecting everything — mood, focus, stress resistance. Tonight:\n\n1. Start winding down at **9 PM** — dim lights, no screens\n2. Keep the room cool (~18°C)\n3. No caffeine after 2 PM today\n\nYour sleep goal is in your daily plan. Log it when you wake up!`
        : `Your sleep of ${sleep}h is ${sleep >= 7.5 ? 'excellent' : 'decent'}! To protect it:\n• Consistent bedtime (within 30 min, even weekends)\n• Morning sunlight within 1 hour of waking\n• Avoid heavy meals within 3 hours of bed`,

      motivation: `I hear you. Motivation follows action, not the other way around.${streakMsg}\n\nHere's what works:\n• **Start with the smallest task** on your plan — just 2 minutes\n• You've completed ${goals?.totalTasks || 0}+ tasks this week — that's real momentum\n• The feeling comes AFTER you start, not before\n\nWhat's one tiny thing you can do right now?`,

      sadness: moodLow
        ? `I'm here with you. Feeling low is valid — and it's temporary.\n\n💬 **Reach out** to one person you trust today — even a simple message helps.\n🙏 **Write 3 things** that went okay today (however small).\n🚶 **5-minute walk** outside — nature reduces cortisol measurably.\n\nYour mood history shows this has passed before. You've got this.`
        : `It's okay to have off days. Your emotional score is something we can improve together.\n\n• Check your daily plan — completing even one task builds a sense of control\n• Your gratitude task is the highest-leverage emotional boost available today`,

      activity: lowAct
        ? `Physical activity of ${activity}/10 is really low — and this affects your mental health directly. The good news: even a 10-minute walk produces measurable benefits.\n\n🚶 **Right now**: stand up and walk for 2 minutes.\n📅 **Today's plan** has an activity task — it's your most important one.\n⚡ You'll earn **+15 points** when you complete it!`
        : `Great that you're thinking about activity! Activity at ${activity}/10 is solid.\n\nTo level up: try pairing your existing routine with a new habit. What type of movement do you enjoy most?`,

      nutrition: `Nutrition is foundational to everything else:\n\n💧 Start every morning with 500ml of water before coffee\n🥗 Aim for protein at every meal — it stabilises blood sugar and reduces cravings\n🚫 Reduce processed food 80% of the time (not 100% — sustainability matters)\n\nAre you hitting your hydration goal in the app?`,

      goals: `Your current goals are tracked in your AI Coach dashboard!\n\n${streak > 0 ? `🔥 You're on a ${streak}-day streak — fantastic consistency!` : 'Starting a streak today?'}\n\nKey insight: the most impactful goal to focus on is usually the one with the lowest completion rate. Want me to help you pick?`,

      plan: `Your personalised daily plan is generated based on your sleep, stress, activity, and mood.\n\n📅 Head to the **AI Coach** section to see today's plan.\n✅ Each completed task earns you **+15 points**\n🏆 Complete the full plan for **+50 bonus points**\n\nWhich time slot are you in right now?`,

      mood: moodLow
        ? `Your mood check-in shows you're not feeling your best right now. That's okay.\n\n• The Emotional AI detected: **${mood?.mood || 'Low'} mood**\n• Stress Level: **${mood?.stressLevel || 'Moderate'}**\n\nSmallest possible win: name 3 things you can see right now. This grounds the nervous system immediately.`
        : `Your mood looks ${mood?.mood || 'neutral'} today! ${mood?.mood === 'Positive' ? '😊 Use this positive energy strategically — schedule your hardest task next.' : 'Maintaining emotional balance is a skill. Your daily plan has tasks that build emotional resilience.'}`,

      greeting: `Hey there! 👋 I'm your NeuroWell AI Coach.\n\nI can help you with:\n• 😰 **Stress** management\n• 😴 **Sleep** optimisation\n• 🎯 **Goal** tracking\n• 📅 **Daily plan** guidance\n• 💪 **Motivation** when you need it\n\n${streak > 0 ? `You're on a 🔥 ${streak}-day streak!` : 'Let\'s build your first streak!'} What can I help you with today?`,

      help: `I'm your context-aware wellness coach! Here's what I know about you:\n\n• **Sleep**: ${sleep}h last night\n• **Stress**: ${stress}/10\n• **Activity**: ${activity}/10\n• **Streak**: ${streak} days 🔥\n\nAsk me about stress, sleep, motivation, your goals, or today's plan. I use your real data to give personalised advice!`,

      thanks: `You're welcome! 🌟 Remember — every small step compounds. ${streak > 0 ? `Keep that ${streak}-day streak going!` : 'Tomorrow is a great day to start a streak!'}\n\nAnything else I can help with?`,

      unknown: `I'm not sure I caught that perfectly. I'm most helpful when you ask about:\n\n• 😰 Stress or anxiety\n• 😴 Sleep issues\n• 💪 Exercise or activity\n• 🎯 Your goals or progress\n• 📅 Today's wellness plan\n• 😔 Mood or motivation\n\nWhat's on your mind?`
    };

    return responses[intent] || responses.unknown;
  }

  // ── Suggested Replies ──────────────────────────────────────────────
  function _getSuggestions(intent, ctx) {
    const base = {
      stress:     ['Show me a breathing exercise','What\'s in my plan?','Help me relax'],
      sleep:      ['Tips for better sleep','Set my sleep goal','Why am I so tired?'],
      motivation: ['How do I start?','Show my streak','What task should I do?'],
      sadness:    ['Quick mood boost','How to feel better?','My mood history'],
      activity:   ['Suggest a workout','I just walked!','Log my steps'],
      goals:      ['Show my goals','How do I level up?','My progress today'],
      plan:       ['Show today\'s tasks','I completed a task!','What\'s next?'],
      greeting:   ['How\'s my wellness?','Show today\'s plan','What are my goals?'],
      unknown:    ['Help me with stress','How\'s my sleep?','Show my plan'],
    };
    return (base[intent] || base.unknown).slice(0, 3);
  }

  // ── Public API ─────────────────────────────────────────────────────
  return {

    /**
     * Generate a chatbot response.
     * @param {string} input - User message
     * @param {object} userData - { sleep, activity, stress, screenTime, streak }
     * @param {object} planData - { tasks[], mood }
     * @returns {{ response, intent, suggestions, typing }}
     */
    async chatbotResponse(input, userData = {}, planData = {}) {
      const ctx = {
        sleep:    userData.sleep    || 7,
        activity: userData.activity || 5,
        stress:   userData.stress   || 4,
        streak:   userData.streak   || 0,
        mood:     planData.mood     || null,
        goals:    planData.goals    || null,
        plan:     planData.tasks    || []
      };

      // Try LLM API first
      try {
        const messages = [{ role:'user', content: input }];
        const llmReply = await _llmAdapter.complete(messages, ctx);
        if (llmReply) {
          const intent = _detectIntent(input);
          return { response: llmReply, intent, suggestions: _getSuggestions(intent, ctx), source:'llm' };
        }
      } catch { /* fall through */ }

      // Rule-based response
      const intent    = _detectIntent(input);
      const response  = _buildResponse(intent, ctx);
      const suggestions = _getSuggestions(intent, ctx);

      // Save to history
      const data = _store.get();
      data.history = (data.history || []).slice(-49);
      data.history.push({
        role:'user', content: input, ts: new Date().toISOString()
      });
      data.history.push({
        role:'assistant', content: response, intent, ts: new Date().toISOString()
      });
      _store.set(data);

      return { response, intent, suggestions, source:'rule_engine' };
    },

    /** Get chat history */
    getHistory(n = 20) {
      return (_store.get().history || []).slice(-n);
    },

    /** Clear chat history */
    clearHistory() { _store.set({ history:[] }); },

    /** Get a proactive nudge based on user context */
    getProactiveNudge(userData) {
      const { sleep = 7, stress = 4, activity = 5, streak = 0 } = userData;
      if (stress >= 8)  return { msg:'🚨 Stress is very high. Box breathing exercise available →', intent:'stress' };
      if (sleep < 6)    return { msg:'😴 You\'re running on low sleep. Check your sleep task →', intent:'sleep' };
      if (activity <= 2)return { msg:'🚶 No movement logged today. A 5-min walk changes everything →', intent:'activity' };
      if (streak === 0) return { msg:'💪 Start a streak today! Complete any task to begin →', intent:'goals' };
      if (streak >= 7)  return { msg:`🔥 ${streak}-day streak! You're unstoppable. Keep going →`, intent:'goals' };
      return { msg:'👋 Your AI coach is here. How are you feeling today?', intent:'greeting' };
    }
  };
})();
