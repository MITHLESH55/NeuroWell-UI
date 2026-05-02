/**
 * NEUROWELL - Emotion AI Engine
 * Detects mood from text input or quick-select, maintains mood history.
 * Architecture-ready for NLP API integration (swap _nlpAdapter).
 */

const EmotionAI = (() => {

  // ── NLP Adapter (swap for real API) ─────────────────────────────────────────
  // To integrate e.g. HuggingFace Inference API, replace _nlpAdapter.analyze()
  const _nlpAdapter = {
    async analyze(text) {
      // Stub: returns null → falls back to rule engine
      // Replace with: const res = await fetch(NLP_API_URL, {method:'POST', body: JSON.stringify({text})});
      return null;
    }
  };

  // ── Keyword Dictionaries ────────────────────────────────────────────────────
  const LEXICON = {
    // Positive
    joyful:    { words: ['happy','great','amazing','wonderful','excellent','fantastic','love','joyful','excited','thrilled','blessed','grateful','thankful','euphoric','bliss'], score: 4, mood:'Positive', stress:'Low' },
    good:      { words: ['good','fine','ok','okay','decent','alright','content','pleasant','cheerful','calm','relaxed','peaceful','refreshed','rested'], score: 3, mood:'Good', stress:'Low' },
    // Neutral
    neutral:   { words: ['neutral','normal','average','usual','so-so','meh','moderate','mixed'], score: 2, mood:'Neutral', stress:'Moderate' },
    // Negative (mild)
    tired:     { words: ['tired','exhausted','sleepy','drained','groggy','fatigued','lethargic','sluggish','worn','depleted'], score: 1, mood:'Low', stress:'Moderate' },
    sad:       { words: ['sad','unhappy','down','blue','melancholy','low','gloomy','disappointed','upset','disheartened'], score: 1, mood:'Low', stress:'Moderate' },
    // Negative (high stress)
    stressed:  { words: ['stressed','anxious','worried','nervous','overwhelmed','panic','tense','pressure','burden','frantic','burnt','burnout'], score: 0, mood:'Low', stress:'High' },
    angry:     { words: ['angry','frustrated','annoyed','irritated','furious','mad','rage','aggravated','hostile'], score: 0, mood:'Low', stress:'High' },
    depressed: { words: ['depressed','hopeless','empty','numb','worthless','miserable','desperate','helpless','lost','broken'], score: 0, mood:'Critical', stress:'Critical' }
  };

  // Intensity modifiers
  const AMPLIFIERS  = ['very','extremely','really','so','super','incredibly','terribly','deeply'];
  const DIMINISHERS = ['a bit','slightly','a little','kind of','sort of','somewhat'];
  const NEGATORS    = ['not','no','never','don\'t','doesn\'t','isn\'t','wasn\'t','hardly'];

  // ── Storage ─────────────────────────────────────────────────────────────────
  const _store = {
    KEY: 'nw_emotion_ai_v1',
    get()  { try { return JSON.parse(localStorage.getItem(this.KEY) || '{"history":[]}'); } catch { return { history: [] }; } },
    set(d) { try { localStorage.setItem(this.KEY, JSON.stringify(d)); } catch {} }
  };

  // ── Internal: keyword rule engine ───────────────────────────────────────────
  function _ruleBasedAnalysis(text) {
    const lower   = text.toLowerCase();
    const words   = lower.match(/\b[\w']+\b/g) || [];
    let totalScore = 0, matchCount = 0;
    let dominantGroup = null, maxMatches = 0;

    // Build token window for context
    const checkModifier = (word, wordIdx) => {
      // Look back 2 words for modifiers
      const prev = words.slice(Math.max(0, wordIdx - 2), wordIdx).join(' ');
      const hasNeg = NEGATORS.some(n => prev.includes(n));
      const hasAmp = AMPLIFIERS.some(a => prev.includes(a));
      const hasDim = DIMINISHERS.some(d => lower.includes(d + ' ' + word));
      return { hasNeg, hasAmp, hasDim };
    };

    Object.entries(LEXICON).forEach(([groupName, group]) => {
      let groupHits = 0;
      group.words.forEach(keyword => {
        const idx = words.indexOf(keyword);
        if (idx === -1) return;
        const { hasNeg, hasAmp, hasDim } = checkModifier(keyword, idx);
        let s = group.score;
        if (hasNeg) s = 4 - s; // negate: "not stressed" flips toward positive
        if (hasAmp) s = Math.max(0, s - 1);  // amplifier makes extremes stronger
        if (hasDim) s = Math.min(4, s + 0.5);// diminisher softens
        totalScore += s; matchCount++; groupHits++;
      });
      if (groupHits > maxMatches) { maxMatches = groupHits; dominantGroup = group; }
    });

    if (matchCount === 0) return null; // no keywords found

    const avgScore = totalScore / matchCount;
    const dominant = dominantGroup || LEXICON.neutral;
    const mood       = avgScore >= 3 ? 'Positive' : avgScore >= 2 ? 'Neutral' : avgScore >= 1 ? 'Low' : avgScore >= 0.5 ? 'Low' : 'Critical';
    const stressLevel= avgScore >= 3 ? 'Low' : avgScore >= 2 ? 'Low' : avgScore >= 1 ? 'Moderate' : 'High';

    return {
      mood, stressLevel,
      rawScore:    Math.round(avgScore * 25), // 0–100
      confidence:  Math.min(1, matchCount / 3),
      keywordsFound: matchCount,
      dominantTheme: dominant.mood
    };
  }

  // ── Emoji / quick-select mapping ─────────────────────────────────────────────
  const QUICK_MAP = {
    '😊': { mood: 'Positive', stressLevel: 'Low',      rawScore: 85, label: 'Happy' },
    '😌': { mood: 'Good',     stressLevel: 'Low',      rawScore: 70, label: 'Calm' },
    '😐': { mood: 'Neutral',  stressLevel: 'Moderate', rawScore: 50, label: 'Neutral' },
    '😕': { mood: 'Low',      stressLevel: 'Moderate', rawScore: 35, label: 'Sad' },
    '😞': { mood: 'Low',      stressLevel: 'High',     rawScore: 20, label: 'Stressed' },
    '😤': { mood: 'Low',      stressLevel: 'High',     rawScore: 15, label: 'Frustrated' },
    '😴': { mood: 'Low',      stressLevel: 'Moderate', rawScore: 30, label: 'Tired' },
  };

  // ── Public API ───────────────────────────────────────────────────────────────
  return {
    LEXICON,
    QUICK_MAP,

    /**
     * Detect mood from free-text input.
     * Architecture hook: try NLP API first, fall back to rule engine.
     *
     * @param {string} text
     * @returns {MoodResult} { mood, stressLevel, rawScore, confidence, keywordsFound, label }
     */
    async detectMood(text) {
      if (!text || typeof text !== 'string' || text.trim().length === 0) {
        return { mood: 'Neutral', stressLevel: 'Moderate', rawScore: 50, confidence: 0, label: 'Unknown', source: 'default' };
      }

      // Try NLP API (returns null if not configured)
      try {
        const apiResult = await _nlpAdapter.analyze(text);
        if (apiResult) { return { ...apiResult, source: 'nlp_api' }; }
      } catch { /* fall through */ }

      // Rule-based fallback
      const ruleResult = _ruleBasedAnalysis(text);
      if (ruleResult) { return { ...ruleResult, source: 'rule_engine', label: ruleResult.mood }; }

      // Default if no keywords matched
      return { mood: 'Neutral', stressLevel: 'Moderate', rawScore: 50, confidence: 0, label: 'Neutral', source: 'default' };
    },

    /**
     * Detect mood from emoji/quick-select.
     * @param {string} emoji - One of the keys in QUICK_MAP
     * @returns {MoodResult}
     */
    detectFromEmoji(emoji) {
      const mapped = QUICK_MAP[emoji];
      if (!mapped) return { mood: 'Neutral', stressLevel: 'Moderate', rawScore: 50, label: 'Neutral', source: 'emoji' };
      return { ...mapped, confidence: 1, source: 'emoji' };
    },

    /**
     * Save a mood record to history.
     * @param {MoodResult} result
     * @param {string} inputText - original input (optional)
     */
    saveMood(result, inputText = '') {
      const data    = _store.get();
      const record  = {
        date:       new Date().toISOString().slice(0, 10),
        timestamp:  new Date().toISOString(),
        mood:       result.mood,
        stressLevel:result.stressLevel,
        rawScore:   result.rawScore,
        label:      result.label || result.mood,
        source:     result.source || 'unknown',
        inputText:  inputText.slice(0, 200) // cap stored text
      };
      data.history = (data.history || []).slice(-29);
      data.history.push(record);
      data.latest = record;
      _store.set(data);
      return record;
    },

    /** Get mood history (last N days) */
    getHistory(n = 7) {
      const data = _store.get();
      return (data.history || []).slice(-n);
    },

    /** Get the most recent mood entry */
    getLatest() {
      return _store.get().latest || null;
    },

    /** Get mood trend over past N days */
    getMoodTrend(n = 7) {
      const history = this.getHistory(n);
      if (history.length < 2) return { direction: 'Stable', change: 0 };
      const avg = arr => arr.reduce((a, b) => a + b, 0) / arr.length;
      const firstHalf  = history.slice(0, Math.floor(history.length / 2)).map(r => r.rawScore);
      const secondHalf = history.slice(Math.floor(history.length / 2)).map(r => r.rawScore);
      const change     = Math.round(avg(secondHalf) - avg(firstHalf));
      return { direction: change > 5 ? 'Improving' : change < -5 ? 'Declining' : 'Stable', change };
    },

    /** Get average mood score for the past N days */
    getAvgScore(n = 7) {
      const history = this.getHistory(n);
      if (!history.length) return 50;
      return Math.round(history.reduce((a, r) => a + r.rawScore, 0) / history.length);
    },

    /** Map numeric score to colour */
    scoreToColor(score) {
      if (score >= 70) return '#10b981';
      if (score >= 50) return '#6366f1';
      if (score >= 30) return '#f59e0b';
      return '#ef4444';
    },

    /** Seed demo mood history */
    seedDemoHistory() {
      const data = _store.get();
      if (data.history && data.history.length > 0) return;
      const moods = ['Good','Neutral','Low','Good','Positive','Neutral','Good'];
      const scores= [68, 52, 30, 71, 85, 50, 65];
      const stress= ['Low','Moderate','High','Low','Low','Moderate','Low'];
      const hist  = moods.map((mood, i) => {
        const d = new Date(); d.setDate(d.getDate() - (6 - i));
        return { date: d.toISOString().slice(0,10), timestamp: d.toISOString(),
                 mood, stressLevel: stress[i], rawScore: scores[i], label: mood, source: 'demo' };
      });
      _store.set({ history: hist, latest: hist[hist.length - 1] });
    },

    clearHistory() { _store.set({ history: [] }); }
  };
})();
