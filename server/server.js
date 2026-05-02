const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Basic health route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'NeuroWell API is running' });
});

const jwt = require('jsonwebtoken');
const User = require('./models/User');
const WellnessData = require('./models/WellnessData');

const JWT_SECRET = process.env.JWT_SECRET || 'neurowell_super_secret_key';

// Auth Middleware
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ success: false, message: 'No token provided' });

  // For testing purposes, accept mock-token and assign a guest user ID
  if (token === 'mock-token') {
    req.user = { id: '000000000000000000000000' };
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ success: false, message: 'User already exists' });

    user = await User.create({ name, email, password });
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });
    
    res.status(201).json({ success: true, token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });
    res.status(200).json({ success: true, token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Assessment Routes
app.post('/api/assessment', authMiddleware, async (req, res) => {
  try {
    console.log("Saving Assessment Data:", req.body);
    console.log("User:", req.user.id);
    
    const { sleepHours, stressLevel, activityLevel, mood } = req.body;
    
    // Calculate simple mock scores based on inputs
    const physical = Math.min(100, Math.max(0, (sleepHours * 10) + (activityLevel * 5)));
    const mental = Math.min(100, Math.max(0, 100 - (stressLevel * 10)));
    const emotional = mood === 'Happy' || mood === 'Energetic' ? 80 : mood === 'Neutral' ? 60 : 40;
    const overall = Math.round((physical + mental + emotional) / 3);

    const data = await WellnessData.create({
      user: req.user.id,
      date: new Date(),
      metrics: { sleepHours, stressLevel, activityLevel, mood },
      scores: { overall, physical, mental, emotional },
      burnoutRisk: Math.max(0, stressLevel * 10)
    });

    res.status(201).json({ success: true, data });
  } catch (error) {
    console.error("Error saving assessment:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/health-data', authMiddleware, async (req, res) => {
  try {
    const data = await WellnessData.find({ user: req.user.id }).sort({ date: -1 });
    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("Error fetching health data:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Database Connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/neurowell';

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    // Even if DB fails, start server for basic API testing
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT} (without DB)`);
    });
  });
