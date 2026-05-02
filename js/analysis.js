/**
 * NEUROWELL - Analysis Engine (Digital Twin)
 * Health History System — stores, retrieves, and analyses wellness records.
 * Implements trend detection (Improving / Declining / Stable) and future projection.
 *
 * Storage key schema (future-backend-ready):
 *   'nw_digital_twin_history' → Array<DailyRecord>
 *
 * DailyRecord: { id, date, score, sleep, activity, stress, screenTime,
 *                  scores:{physical, mental, emotional, overall}, timestamp }
 *
 * Designed so localStorage can be swapped for an HTTP API by replacing
 * the _storage adapter at the bottom of this file.
 */

const AnalysisEngine = (() => {

  // ─── Storage Adapter ────────────────────────────────────────────────────────
  // Swap this object to point at a REST API without touching any other code.
  const _storage = {
    KEY: 'nw_digital_twin_history',

    getAll() {
      try {
        const raw = localStorage.getItem(this.KEY);
        return raw ? JSON.parse(raw) : [];
      } catch (e) {
        console.warn('AnalysisEngine: storage read error', e);
        return [];
      }
    },

    saveAll(records) {
      try {
        localStorage.setItem(this.KEY, JSON.stringify(records));
        return true;
      } catch (e) {
        console.warn('AnalysisEngine: storage write error', e);
        return false;
      }
    }
  };

  // ─── Helpers ─────────────────────────────────────────────────────────────────

  /** ISO date string for today (YYYY-MM-DD) */
  const _today = () => new Date().toISOString().slice(0, 10);

  /** Simple linear regression → {slope, intercept} */
  function _linearRegression(values) {
    const n = values.length;
    if (n < 2) return { slope: 0, intercept: values[0] || 0 };
    const xs = values.map((_, i) => i);
    const xMean = (n - 1) / 2;
    const yMean = values.reduce((a, b) => a + b, 0) / n;
    let num = 0, den = 0;
    xs.forEach((x, i) => {
      num += (x - xMean) * (values[i] - yMean);
      den += (x - xMean) ** 2;
    });
    const slope     = den !== 0 ? num / den : 0;
    const intercept = yMean - slope * xMean;
    return { slope, intercept };
  }

  /** Clamp a number between min and max */
  const _clamp = (v, min = 0, max = 100) => Math.min(max, Math.max(min, v));

  // ─── Public API ───────────────────────────────────────────────────────────────
  return {

    /**
     * Save a wellness record for today.
     * If a record already exists for today, it is REPLACED (idempotent).
     *
     * @param {object} data - { score, sleep, activity, stress, screenTime, scores? }
     * @returns {boolean} success
     */
    saveDailyRecord(data) {
      if (!data || typeof data.score !== 'number') {
        console.warn('AnalysisEngine.saveDailyRecord: invalid data', data);
        return false;
      }

      const records  = _storage.getAll();
      const date     = _today();
      const existing = records.findIndex(r => r.date === date);

      const record = {
        id:         date,
        date,
        timestamp:  new Date().toISOString(),
        score:      _clamp(Math.round(data.score)),
        sleep:      typeof data.sleep      === 'number' ? _clamp(data.sleep,      0, 12) : null,
        activity:   typeof data.activity   === 'number' ? _clamp(data.activity,   0, 10) : null,
        stress:     typeof data.stress     === 'number' ? _clamp(data.stress,     0, 10) : null,
        screenTime: typeof data.screenTime === 'number' ? _clamp(data.screenTime, 0, 24) : null,
        scores:     data.scores || { overall: data.score }
      };

      if (existing !== -1) {
        records[existing] = record;
      } else {
        records.push(record);
        // Keep last 90 records (≈ 3 months of daily data)
        if (records.length > 90) records.shift();
      }

      return _storage.saveAll(records);
    },

    /**
     * Retrieve all stored daily records, sorted chronologically.
     * @returns {DailyRecord[]}
     */
    getAllRecords() {
      return _storage.getAll().sort((a, b) => a.date.localeCompare(b.date));
    },

    /**
     * Retrieve the last N records.
     * @param {number} n
     * @returns {DailyRecord[]}
     */
    getRecent(n = 10) {
      const all = this.getAllRecords();
      return all.slice(-n);
    },

    /**
     * Trend Detection — analyses the last `window` records.
     * Returns: { direction: 'Improving'|'Declining'|'Stable', velocity, confidence, description }
     *
     * @param {number} window - Number of records to analyse (default 7)
     * @returns {TrendResult}
     */
    detectTrend(window = 7) {
      const records = this.getRecent(window);

      if (records.length < 2) {
        return {
          direction:   'Stable',
          velocity:    0,
          confidence:  'Low',
          emoji:       '→',
          color:       '#94a3b8',
          description: 'Not enough data to detect a trend. Keep logging daily!',
          records:     records.length
        };
      }

      const scores = records.map(r => r.score);
      const { slope } = _linearRegression(scores);

      // Points per day threshold for classification
      const IMPROVING_THRESHOLD = 0.5;
      const DECLINING_THRESHOLD = -0.5;

      // Confidence based on data points
      const confidence =
        records.length >= 7 ? 'High' :
        records.length >= 4 ? 'Moderate' : 'Low';

      let direction, emoji, color;

      if (slope >= IMPROVING_THRESHOLD) {
        direction = 'Improving';
        emoji     = '↗';
        color     = '#10b981';
      } else if (slope <= DECLINING_THRESHOLD) {
        direction = 'Declining';
        emoji     = '↘';
        color     = '#ef4444';
      } else {
        direction = 'Stable';
        emoji     = '→';
        color     = '#f59e0b';
      }

      const absSlope   = Math.abs(slope).toFixed(2);
      const description = direction === 'Improving'
        ? `Your wellness is improving at +${absSlope} pts/day over the last ${records.length} days.`
        : direction === 'Declining'
        ? `Your wellness is declining at ${absSlope} pts/day. Action is recommended.`
        : `Your wellness is stable (±${absSlope} pts/day). Consistent habits are key.`;

      return { direction, velocity: slope, confidence, emoji, color, description, records: records.length };
    },

    /**
     * Future Projection — projects wellness score N days into the future.
     * Uses linear regression on recent data + regression-to-mean dampening.
     *
     * @param {number} days - Projection horizon (default 30)
     * @param {number} window - Historical window for regression (default 10)
     * @returns {ProjectionResult}
     */
    projectFuture(days = 30, window = 10) {
      const records = this.getRecent(window);
      const MEAN    = 65; // wellness population mean for dampening

      if (records.length < 2) {
        // No data — flat projection at 50
        const current = records[0]?.score || 50;
        const points  = Array.from({ length: days + 1 }, (_, i) => ({
          day:   i,
          date:  new Date(Date.now() + i * 864e5).toISOString().slice(0, 10),
          score: current
        }));
        return { current, points, trend: 'Stable', confidence: 'Very Low' };
      }

      const scores = records.map(r => r.score);
      const { slope, intercept } = _linearRegression(scores);
      const current = scores[scores.length - 1];

      // Dampening: regression-to-mean reduces extrapolation error
      const DAMP = 0.85;

      const points = Array.from({ length: days + 1 }, (_, day) => {
        const raw       = intercept + slope * (scores.length - 1 + day);
        const damped    = raw + DAMP * day * (MEAN - raw) / Math.max(days, 1);
        const projected = _clamp(Math.round(damped));
        return {
          day,
          date:  new Date(Date.now() + day * 864e5).toISOString().slice(0, 10),
          score: projected
        };
      });

      const day30Score = points[Math.min(days, 30)]?.score || current;
      const trend      = day30Score > current + 3 ? 'Improving' : day30Score < current - 3 ? 'Declining' : 'Stable';
      const confidence = records.length >= 7 ? 'High' : records.length >= 4 ? 'Moderate' : 'Low';

      return { current, points, trend, confidence, day7: points[7]?.score, day14: points[14]?.score, day30: day30Score };
    },

    /**
     * Category Trend — analyses trend for a specific score dimension.
     * @param {'physical'|'mental'|'emotional'|'overall'} category
     * @param {number} window
     */
    getCategoryTrend(category = 'overall', window = 7) {
      const records = this.getRecent(window).filter(r => r.scores && typeof r.scores[category] === 'number');
      if (records.length < 2) return null;

      const values   = records.map(r => r.scores[category]);
      const { slope } = _linearRegression(values);
      const last      = values[values.length - 1];
      const first     = values[0];
      const change    = Math.round(last - first);

      return {
        category,
        current:  last,
        change,
        slope:    Math.round(slope * 100) / 100,
        direction: slope > 0.3 ? 'Improving' : slope < -0.3 ? 'Declining' : 'Stable'
      };
    },

    /**
     * Seed sample history data for demo/testing purposes.
     * Only seeds if no existing data.
     * @param {number} days - Number of days to seed (default 14)
     */
    seedSampleData(days = 14) {
      if (_storage.getAll().length > 0) return;

      const today    = new Date();
      const baseScore = 52;
      const records  = [];

      for (let i = days - 1; i >= 0; i--) {
        const d     = new Date(today);
        d.setDate(d.getDate() - i);
        const date  = d.toISOString().slice(0, 10);

        // Simulate gradual improvement with noise
        const progress = (days - 1 - i) / (days - 1);
        const noise    = (Math.random() - 0.5) * 8;
        const overall  = _clamp(Math.round(baseScore + progress * 15 + noise));
        const physical = _clamp(Math.round(overall + (Math.random() - 0.5) * 12));
        const mental   = _clamp(Math.round(overall - 5 + (Math.random() - 0.5) * 10));
        const emotional= _clamp(Math.round(overall + 3 + (Math.random() - 0.5) * 10));

        records.push({
          id:         date,
          date,
          timestamp:  d.toISOString(),
          score:      overall,
          sleep:      +(5.5 + Math.random() * 2.5).toFixed(1),
          activity:   Math.round(3 + Math.random() * 5),
          stress:     Math.round(4 + Math.random() * 4),
          screenTime: +(4 + Math.random() * 4).toFixed(1),
          scores:     { overall, physical, mental, emotional }
        });
      }

      _storage.saveAll(records);
      console.info(`✅ AnalysisEngine: seeded ${records.length} sample records`);
    },

    /**
     * Clear all stored records. Returns true on success.
     */
    clearHistory() {
      return _storage.saveAll([]);
    },

    /**
     * Export all records as a plain JSON object (for download/backup).
     */
    exportData() {
      return {
        exportedAt: new Date().toISOString(),
        records:    this.getAllRecords(),
        summary:    this.getSummaryStats()
      };
    },

    /**
     * Compute summary statistics across all records.
     * @returns {SummaryStats}
     */
    getSummaryStats() {
      const records = this.getAllRecords();
      if (records.length === 0) return null;

      const scores  = records.map(r => r.score);
      const avg     = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
      const max     = Math.max(...scores);
      const min     = Math.min(...scores);
      const latest  = scores[scores.length - 1];
      const change  = scores.length >= 2 ? latest - scores[scores.length - 2] : 0;

      return {
        totalRecords: records.length,
        average:      avg,
        best:         max,
        lowest:       min,
        latest,
        latestChange: change,
        dateRange: {
          from: records[0].date,
          to:   records[records.length - 1].date
        }
      };
    }
  };
})();
