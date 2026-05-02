const mongoose = require('mongoose');

const wellnessDataSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, default: Date.now },
  metrics: {
    sleepHours: { type: Number, required: true },
    stressLevel: { type: Number, required: true, min: 1, max: 10 },
    activityLevel: { type: Number, required: true, min: 1, max: 10 },
    mood: { type: String, enum: ['Happy', 'Neutral', 'Sad', 'Stressed', 'Energetic'], required: true }
  },
  scores: {
    overall: { type: Number },
    physical: { type: Number },
    mental: { type: Number },
    emotional: { type: Number }
  },
  aiInsights: [{ type: String }],
  burnoutRisk: { type: Number }
});

module.exports = mongoose.model('WellnessData', wellnessDataSchema);
