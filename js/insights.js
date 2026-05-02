/**
 * NEUROWELL - Intelligent Insights Engine
 * Analyses wellness scores and generates dynamic, personalised insights.
 * InsightsEngine.analyze(scores) → { mainProblem, focusArea, alerts[], highlights[] }
 */

const InsightsEngine = (() => {

  const CATS = {
    physical: {
      label: 'Physical Health',
      areas: ['sleep quality', 'physical activity', 'nutrition', 'energy levels'],
      quickAction: 'Start with a 20-minute walk today',
      icon: '💪', alertIcon: '🏃'
    },
    mental: {
      label: 'Mental Wellness',
      areas: ['stress management', 'cognitive load', 'work-life balance', 'mental clarity'],
      quickAction: 'Try a 10-minute guided meditation',
      icon: '🧠', alertIcon: '🧘'
    },
    emotional: {
      label: 'Emotional Wellbeing',
      areas: ['social connection', 'emotional regulation', 'resilience', 'self-compassion'],
      quickAction: 'Reach out to one person you trust today',
      icon: '❤️', alertIcon: '🤝'
    }
  };

  function _tier(score) {
    if (score < 30) return 'critical';
    if (score < 50) return 'low';
    if (score < 70) return 'moderate';
    if (score < 85) return 'good';
    return 'excellent';
  }

  function _tierColor(tier) {
    return { critical:'#ef4444', low:'#f97316', moderate:'#f59e0b', good:'#10b981', excellent:'#6366f1' }[tier] || '#94a3b8';
  }

  // ── Main Problem Area ────────────────────────────────────────────────────
  function _mainProblem(worst, s) {
    const meta  = CATS[worst.key];
    const tier  = _tier(worst.score);
    const color = _tierColor(tier);

    const headlines = {
      critical: `🚨 Critical Issue: ${meta.label}`,
      low:      `⚠️ Main Problem: ${meta.label}`,
      moderate: `📍 Primary Focus: ${meta.label}`,
      good:     `🎯 Optimisation Area: ${meta.label}`,
      excellent:`✅ All Areas Strong`
    };

    const bodies = {
      critical: `Your ${meta.label.toLowerCase()} score is critically low at ${worst.score}%. This is your highest-priority problem — even one small consistent habit here will produce outsized improvement.`,
      low:      `At ${worst.score}%, ${meta.label.toLowerCase()} is your weakest dimension. Targeted effort here delivers the greatest overall wellness return right now.`,
      moderate: `${meta.label} at ${worst.score}% is your lowest score. With consistent focus over the next 2–3 weeks, you can move this into the "Good" range.`,
      good:     `Your lowest score is ${meta.label.toLowerCase()} at ${worst.score}%, which is solid. Small optimisations here will push your overall wellness higher.`,
      excellent:`All three dimensions are in a healthy range. Your focus is now maintenance and preventing regression.`
    };

    const actions = {
      critical: `Immediate action: ${meta.quickAction}. Do this every day for 7 days.`,
      low:      `${meta.quickAction} — aim for 5 consecutive days.`,
      moderate: `${meta.quickAction} to build momentum.`,
      good:     `Refine your ${meta.areas[0]} routine for the best gains.`,
      excellent:`Continue your current habits and support others in their wellness journey.`
    };

    return {
      headline: headlines[tier],
      body:     bodies[tier],
      action:   actions[tier],
      score:    worst.score,
      category: meta.label,
      icon:     meta.icon,
      color,
      tier,
      urgency:  tier.toUpperCase(),
      areas:    meta.areas
    };
  }

  // ── Focus Area ───────────────────────────────────────────────────────────
  function _focusArea(second, worst) {
    const meta   = CATS[second.key];
    const score  = second.score;
    const tier   = _tier(score);
    const color  = score < 55 ? '#f59e0b' : '#3b82f6';
    const at_risk = score < 60;

    return {
      headline: `This Week's Focus: ${meta.label}`,
      body: at_risk
        ? `At ${score}%, your ${meta.label.toLowerCase()} is at risk of becoming the next critical problem. A small investment now prevents a larger crisis later.`
        : `${meta.label} at ${score}% is your second priority. Improving it by just 10 points would significantly boost your overall score.`,
      action: meta.quickAction,
      score,
      category: meta.label,
      icon:   meta.icon,
      color,
      tier,
      atRisk: at_risk,
      areas:  meta.areas
    };
  }

  // ── Critical Alerts ──────────────────────────────────────────────────────
  function _alerts(s, sorted) {
    const alerts = [];

    // Per-category severity alerts
    sorted.forEach(({ key, score }) => {
      const meta = CATS[key];
      if (score < 30) {
        alerts.push({ type:'critical', icon:'🚨', color:'#ef4444',
          title:`Critical ${meta.label} Alert`,
          message:`${meta.label} at ${score}% is in the critical zone. Please consider speaking with a professional.` });
      } else if (score < 40) {
        alerts.push({ type:'warning', icon:'⚠️', color:'#f97316',
          title:`${meta.label} Warning`,
          message:`${meta.label} at ${score}% is significantly below a healthy baseline. Make this your priority this week.` });
      }
    });

    // High burnout risk
    if (s.overall < 40) {
      alerts.push({ type:'critical', icon:'🔥', color:'#ef4444',
        title:'High Burnout Risk Detected',
        message:`Overall wellness of ${s.overall}% signals high burnout risk. Reduce your commitments and prioritise recovery immediately.` });
    } else if (s.overall < 55 && s.mental < 55 && s.physical < 55) {
      alerts.push({ type:'warning', icon:'⚡', color:'#f97316',
        title:'Approaching Burnout',
        message:'Low scores across all dimensions suggest burnout is approaching. Schedule meaningful rest this week.' });
    }

    // High stress: low mental + low emotional
    if (s.mental < 45 && s.emotional < 45) {
      alerts.push({ type:'warning', icon:'😰', color:'#f59e0b',
        title:'High Stress Detected',
        message:`Low mental (${s.mental}%) and emotional (${s.emotional}%) scores together signal elevated stress. A digital detox and social support today would help.` });
    }

    // Sleep proxy alert: physical very low + mental low
    if (s.physical < 45 && s.mental < 55) {
      alerts.push({ type:'warning', icon:'😴', color:'#a855f7',
        title:'Sleep Quality Alert',
        message:`Low physical and mental scores often indicate poor sleep. Fix your sleep schedule — it is the highest-leverage health change you can make.` });
    }

    // Imbalance alert
    const maxS = Math.max(s.physical, s.mental, s.emotional);
    const minS = Math.min(s.physical, s.mental, s.emotional);
    if (maxS - minS > 35) {
      const highKey = Object.keys(s).find(k => s[k] === maxS && CATS[k]);
      const lowKey  = Object.keys(s).find(k => s[k] === minS && CATS[k]);
      if (highKey && lowKey) {
        alerts.push({ type:'info', icon:'⚖️', color:'#3b82f6',
          title:'Significant Wellness Imbalance',
          message:`Your ${CATS[highKey]?.label} (${maxS}%) is far higher than your ${CATS[lowKey]?.label} (${minS}%). Rebalancing will improve your overall wellbeing more than optimising your strengths.` });
      }
    }

    return alerts;
  }

  // ── Positive Highlights ──────────────────────────────────────────────────
  function _highlights(s, best) {
    const highlights = [];
    const meta = CATS[best.key];

    if (best.score >= 80) {
      highlights.push({ icon:'⭐', color:'#10b981',
        title:`${meta.label} Is Your Strength`,
        message:`At ${best.score}%, ${meta.label.toLowerCase()} is excellent. Use this as your anchor while you build up the other areas.` });
    }

    if (s.overall >= 75) {
      highlights.push({ icon:'🌟', color:'#6366f1',
        title:'Strong Overall Wellness',
        message:`Your overall wellness of ${s.overall}% is well above average. You're in optimisation mode — small refinements make a big difference now.` });
    }

    if (s.physical >= 70 && s.mental >= 70 && s.emotional >= 70) {
      highlights.push({ icon:'🏆', color:'#f59e0b',
        title:'Balanced Wellness Achieved',
        message:'All three wellness dimensions are healthy. This balance is rare and produces exponentially better outcomes than a single high score.' });
    }

    // Gamification streak highlight
    try {
      if (typeof GamificationEngine !== 'undefined') {
        const gs = GamificationEngine.getState();
        if (gs.streak >= 7) {
          highlights.push({ icon:'🔥', color:'#f97316',
            title:`${gs.streak}-Day Check-in Streak!`,
            message:`You've checked in for ${gs.streak} consecutive days — this consistency is building measurable long-term wellness improvement.` });
        }
      }
    } catch(_) {}

    return highlights;
  }

  // ── Causal Correlation Engine ─────────────────────────────────────────────
  /**
   * Rule-based cause-effect detector.
   * Each rule has: id, condition(s,ci), cause, effect, explanation, fix, icon, color, confidence
   * ci = averaged check-in metrics { mood, sleep, energy } (may be null)
   */
  const CORRELATION_RULES = [
    {
      id: 'sleep_stress',
      icon: '😴→😰',
      color: '#a855f7',
      cause:  'Poor Sleep Quality',
      effect: 'Elevated Mental Stress',
      confidence: 'High',
      condition: (s, ci) => s.physical < 55 && s.mental < 55,
      explanation: (s, ci) =>
        `Your physical score (${s.physical}%) suggests disrupted sleep, which is directly driving your mental stress (${s.mental}%). Sleep deprivation raises cortisol by up to 37% and reduces prefrontal cortex function — making stress feel unmanageable even when external pressures are unchanged.`,
      fix: 'Fix your sleep before anything else. A consistent sleep/wake time — even on weekends — is the single highest-impact mental health intervention available without medication.',
      checkinNote: (ci) => ci && ci.sleep < 5 && ci.mood < 3
        ? `Your check-ins confirm this: on low-sleep nights (avg ${ci.sleep.toFixed(1)}/10) your mood consistently drops to ${ci.mood.toFixed(1)}/5.`
        : null
    },
    {
      id: 'stress_emotion',
      icon: '🧠→💔',
      color: '#ef4444',
      cause:  'Chronic Mental Stress',
      effect: 'Emotional Dysregulation',
      confidence: 'High',
      condition: (s, ci) => s.mental < 50 && s.emotional < 55,
      explanation: (s, ci) =>
        `Your mental wellness (${s.mental}%) and emotional score (${s.emotional}%) show a classic stress-emotion feedback loop. When cognitive load stays elevated, the brain's amygdala becomes hypersensitive — causing emotional reactions that feel disproportionate and social withdrawal that worsens isolation.`,
      fix: 'Reduce cognitive load first: one fewer commitment, 30-minute screen-free periods, and journaling to offload mental clutter. Emotional stability follows mental calm, not the other way around.',
      checkinNote: null
    },
    {
      id: 'screen_mental',
      icon: '📱→🧠',
      color: '#f97316',
      cause:  'High Cognitive Load / Screen Overexposure',
      effect: 'Poor Mental Clarity',
      confidence: 'Moderate',
      condition: (s, ci) => s.mental < 55 && s.physical >= 55,
      explanation: (s, ci) =>
        `Your physical health is relatively intact (${s.physical}%) but mental wellness lags at ${s.mental}%. This pattern is consistent with high screen time and cognitive overload: the body is fine, but the mind is depleted. Constant digital input prevents the brain's default-mode network from recovering between tasks.`,
      fix: 'Implement strict screen breaks: no screens 1 hour before bed, a 10-minute "input fast" every 90 minutes of work, and one screen-free meal per day.',
      checkinNote: (ci) => ci && ci.energy < 5 && ci.mood < 3
        ? `Your check-ins show low energy (${ci.energy.toFixed(1)}/10) despite physical activity — consistent with mental depletion rather than physical fatigue.`
        : null
    },
    {
      id: 'isolation_emotion',
      icon: '🤝→❤️',
      color: '#f43f5e',
      cause:  'Social Disconnection',
      effect: 'Low Emotional Wellbeing',
      confidence: 'Moderate',
      condition: (s, ci) => s.emotional < 50 && s.mental >= 50,
      explanation: (s, ci) =>
        `Your emotional score (${s.emotional}%) is low while mental wellness is comparatively stable (${s.mental}%). This profile points to social disconnection rather than pure stress. Human beings require a minimum of 3–5 meaningful interactions per week for baseline emotional regulation — below that, the brain shifts into a low-grade threat state.`,
      fix: 'Schedule one meaningful social interaction today — a call, walk, or coffee. Reduce passive social media (scrolling) and replace it with active communication. Quality over quantity.',
      checkinNote: null
    },
    {
      id: 'physical_cascade',
      icon: '💪→🧠→❤️',
      color: '#6366f1',
      cause:  'Physical Health Decline',
      effect: 'Mental & Emotional Cascade',
      confidence: 'High',
      condition: (s, ci) => s.physical < 45 && (s.mental < 60 || s.emotional < 60),
      explanation: (s, ci) =>
        `Your physical score (${s.physical}%) is critically low, and it is dragging down your mental (${s.mental}%) and emotional (${s.emotional}%) dimensions. Physical activity triggers neurogenesis and releases BDNF — the brain's growth hormone. Without it, mental and emotional capacity erode predictably over weeks.`,
      fix: 'A daily 20-minute walk at moderate pace is enough to reverse this cascade. It doesn\'t need to be intense. Start today, even 10 minutes counts.',
      checkinNote: (ci) => ci && ci.energy < 4
        ? `Your average energy level of ${ci.energy.toFixed(1)}/10 confirms physical depletion is affecting all other areas.`
        : null
    },
    {
      id: 'triple_lock',
      icon: '🔄',
      color: '#ef4444',
      cause:  'All-Dimension Low Cycle',
      effect: 'Compounding Wellness Decline',
      confidence: 'Very High',
      condition: (s, ci) => s.physical < 55 && s.mental < 55 && s.emotional < 55,
      explanation: (s, ci) =>
        `All three of your wellness dimensions are below 55%: physical (${s.physical}%), mental (${s.mental}%), emotional (${s.emotional}%). This creates a compounding loop — poor sleep (physical) → increased stress (mental) → social withdrawal (emotional) → worse sleep. Each dimension is simultaneously cause and effect.`,
      fix: 'Break one link: fix sleep first (it has cascading benefits on all three). Aim for 7–8 hours for 5 consecutive nights. Everything else improves from there.',
      checkinNote: (ci) => ci
        ? `Your check-ins show: mood avg ${ci.mood?.toFixed(1)||'-'}/5, sleep avg ${ci.sleep?.toFixed(1)||'-'}/10, energy avg ${ci.energy?.toFixed(1)||'-'}/10 — confirming all-dimension depletion.`
        : null
    },
    {
      id: 'high_achiever_burnout',
      icon: '💼→🧠',
      color: '#f59e0b',
      cause:  'Physical Strength Masking Mental Burnout',
      effect: 'High-Achiever Burnout Pattern',
      confidence: 'Moderate',
      condition: (s, ci) => s.physical >= 65 && s.mental < 50,
      explanation: (s, ci) =>
        `You have strong physical health (${s.physical}%) but significantly depleted mental wellness (${s.mental}%). This is the classic "high-achiever burnout" profile: the body is maintained but the mind is overloaded. People in this pattern often exercise to cope with stress without addressing the root cognitive load.`,
      fix: 'Physical exercise is good, but it cannot compensate for mental overload. Add a mental recovery practice: meditation, a strict work cutoff time, or a weekly review to reduce decisions.',
      checkinNote: null
    },
    {
      id: 'energy_sleep_link',
      icon: '⚡→😴',
      color: '#3b82f6',
      cause:  'Sleep Deprivation',
      effect: 'Chronic Low Energy',
      confidence: 'High',
      condition: (s, ci) => ci && ci.sleep < 5 && ci.energy < 5,
      explanation: (s, ci) =>
        `Your check-in data shows a direct link: average sleep quality of ${ci.sleep.toFixed(1)}/10 is producing average energy of ${ci.energy.toFixed(1)}/10. This isn't a motivation problem — it's a sleep debt problem. Each hour of lost sleep reduces next-day cognitive performance by approximately 25%.`,
      fix: 'Prioritise sleep quantity first (7–9 hours), then quality (dark, cool room, no screens 1 hour before bed). Do this for 5 nights before trying any other energy fix.',
      checkinNote: null
    },
    {
      id: 'mood_energy_link',
      icon: '😔→⚡',
      color: '#a855f7',
      cause:  'Low Mood',
      effect: 'Energy Depletion',
      confidence: 'Moderate',
      condition: (s, ci) => ci && ci.mood < 3 && ci.energy < 4.5,
      explanation: (s, ci) =>
        `Your check-ins show that low mood (avg ${ci.mood.toFixed(1)}/5) consistently accompanies low energy (avg ${ci.energy.toFixed(1)}/10). Depression and low mood are physically exhausting — they require more metabolic energy to maintain basic function, leaving less available for everything else.`,
      fix: 'Try "behavioural activation": do one small enjoyable activity each day regardless of how you feel. Energy and mood respond to action, not the other way around.',
      checkinNote: null
    }
  ];

  function _avg(arr, key) {
    if (!arr || !arr.length) return null;
    const vals = arr.map(x => x[key]).filter(v => typeof v === 'number');
    return vals.length ? vals.reduce((a,b)=>a+b,0)/vals.length : null;
  }

  function _detectCorrelations(s, recentCheckins) {
    const ci = recentCheckins && recentCheckins.length >= 3 ? {
      mood:   _avg(recentCheckins, 'mood'),
      sleep:  _avg(recentCheckins, 'sleep'),
      energy: _avg(recentCheckins, 'energy'),
      count:  recentCheckins.length
    } : null;

    const results = [];
    const seen    = new Set();

    CORRELATION_RULES.forEach(rule => {
      if (seen.has(rule.id)) return;
      try {
        if (rule.condition(s, ci)) {
          const checkinNote = typeof rule.checkinNote === 'function' ? rule.checkinNote(ci) : null;
          results.push({
            id:          rule.id,
            icon:        rule.icon,
            color:       rule.color,
            cause:       rule.cause,
            effect:      rule.effect,
            confidence:  rule.confidence,
            explanation: rule.explanation(s, ci),
            fix:         rule.fix,
            checkinNote: checkinNote || null,
            dataSource:  ci ? 'Score data + Check-in logs' : 'Assessment scores'
          });
          seen.add(rule.id);
        }
      } catch(e) { console.warn('Correlation rule error:', rule.id, e); }
    });

    // Sort by confidence weight
    const weight = { 'Very High':4, 'High':3, 'Moderate':2, 'Low':1 };
    return results.sort((a,b) => (weight[b.confidence]||0) - (weight[a.confidence]||0));
  }

  // ── Public API ────────────────────────────────────────────────────────────
  return {
    /**
     * @param {object} scores - { physical, mental, emotional, overall }
     * @param {array}  recentCheckins - from CheckinManager.getRecent(7) (optional)
     */
    analyze(scores, recentCheckins) {
      if (!scores || typeof scores !== 'object') return null;

      const s = {
        physical:  typeof scores.physical  === 'number' ? Math.max(0,Math.min(100,scores.physical))  : 50,
        mental:    typeof scores.mental    === 'number' ? Math.max(0,Math.min(100,scores.mental))    : 50,
        emotional: typeof scores.emotional === 'number' ? Math.max(0,Math.min(100,scores.emotional)) : 50
      };
      s.overall = typeof scores.overall === 'number' ? scores.overall
        : Math.round(s.physical*0.35 + s.mental*0.35 + s.emotional*0.30);

      const sorted = [
        { key:'physical',  score:s.physical  },
        { key:'mental',    score:s.mental    },
        { key:'emotional', score:s.emotional }
      ].sort((a,b) => a.score - b.score);

      // Fetch check-in data if not provided
      let checkins = recentCheckins;
      if (!checkins && typeof CheckinManager !== 'undefined') {
        try { checkins = CheckinManager.getRecent(7); } catch(_) {}
      }

      return {
        scores,
        mainProblem:   _mainProblem(sorted[0], s),
        focusArea:     _focusArea(sorted[1], sorted[0]),
        alerts:        _alerts(s, sorted),
        highlights:    _highlights(s, sorted[2]),
        correlations:  _detectCorrelations(s, checkins)
      };
    }
  };
})();
