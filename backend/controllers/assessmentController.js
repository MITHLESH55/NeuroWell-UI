/**
 * NEUROWELL BACKEND - Assessment Controller
 * Handles HTTP requests for assessment operations
 * Processes responses, calculates scores, generates recommendations
 */

const Assessment = require('../models/Assessment');
const ScoringService = require('../services/scoringService');
const RecommendationService = require('../services/recommendationService');
const PredictionService = require('../services/predictionService');
const Helpers = require('../utils/helpers');

/**
 * Create new assessment
 * POST /api/assessment
 */
const createAssessment = async (req, res, next) => {
  try {
    const { responses, userId } = req.body;

    // Validate input
    const validation = Helpers.validateAssessmentResponses(responses);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid assessment responses',
        errors: validation.errors,
        timestamp: new Date().toISOString()
      });
    }

    // Calculate scores
    const scores = ScoringService.calculateScores(responses);

    // Calculate burnout risk
    const risk = ScoringService.calculateBurnoutRisk(scores);

    // Generate recommendations
    const recommendations = RecommendationService.generateRecommendations(scores, risk);

    // Create assessment document
    const assessment = new Assessment({
      responses,
      score: scores.overall,
      categoryScores: {
        physical: scores.physical,
        mental: scores.mental,
        emotional: scores.emotional
      },
      recommendations,
      risk,
      userId: req.user ? req.user._id : (userId || null)
    });

    // Save to database
    const savedAssessment = await assessment.save();

    // Return response
    res.status(201).json({
      success: true,
      message: 'Assessment created successfully',
      data: Helpers.formatAssessmentResponse(savedAssessment),
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Get assessment by ID
 * GET /api/assessment/:id
 */
const getAssessment = async (req, res, next) => {
  try {
    const { id } = req.params;

    const assessment = await Assessment.findById(id);

    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: 'Assessment not found',
        timestamp: new Date().toISOString()
      });
    }

    // Get historical data for predictions (last 12 assessments)
    const history = await Assessment.find({
      userId: assessment.userId,
      _id: { $ne: assessment._id }
    })
    .sort({ createdAt: -1 })
    .limit(12)
    .select('score categoryScores createdAt');

    // Generate predictions
    const predictions = PredictionService.predict30DayTrajectory(
      assessment.categoryScores,
      history
    );

    // Generate risk analysis
    const riskAnalysis = PredictionService.calculateAdvancedBurnoutMetrics(
      assessment.categoryScores,
      history
    );

    // Generate wellness plan
    const wellnessPlan = RecommendationService.generateWellnessPlan(assessment.categoryScores);

    // Return comprehensive response
    res.status(200).json({
      success: true,
      data: {
        ...Helpers.formatAssessmentResponse(assessment),
        predictions,
        riskAnalysis,
        wellnessPlan,
        quickWins: RecommendationService.getQuickWins()
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Get all assessments (admin/debugging)
 * GET /api/assessment
 */
const getAllAssessments = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const assessments = await Assessment.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('score categoryScores recommendations risk createdAt');

    const total = await Assessment.countDocuments();

    res.status(200).json({
      success: true,
      data: assessments.map(assessment => Helpers.formatAssessmentResponse(assessment)),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Get user's assessment history
 * GET /api/assessment/history
 */
const getAssessmentHistory = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const assessments = await Assessment.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('score categoryScores recommendations risk createdAt');

    const total = await Assessment.countDocuments({ userId: req.user._id });

    // Calculate trends
    const trends = await calculateAssessmentTrends(req.user._id);

    res.status(200).json({
      success: true,
      message: 'Assessment history retrieved successfully',
      data: {
        assessments: assessments.map(assessment => Helpers.formatAssessmentResponse(assessment)),
        trends,
        summary: {
          totalAssessments: total,
          averageScore: trends.averageScore,
          latestScore: assessments.length > 0 ? assessments[0].score : null
        }
      },
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Calculate assessment trends for user
 * @param {string} userId - User ID
 * @returns {object} Trends data
 */
const calculateAssessmentTrends = async (userId) => {
  try {
    const assessments = await Assessment.find({ userId })
      .sort({ createdAt: 1 })
      .select('score categoryScores risk createdAt');

    if (assessments.length === 0) {
      return {
        averageScore: 0,
        scoreTrend: 'stable',
        riskTrend: 'stable',
        totalAssessments: 0
      };
    }

    const scores = assessments.map(a => a.score);
    const risks = assessments.map(a => a.risk);

    const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;

    // Calculate trends
    const scoreTrend = calculateTrend(scores);
    const riskTrend = calculateTrend(risks);

    return {
      averageScore: Math.round(averageScore),
      scoreTrend,
      riskTrend,
      totalAssessments: assessments.length,
      firstAssessment: assessments[0].createdAt,
      latestAssessment: assessments[assessments.length - 1].createdAt
    };

  } catch (error) {
    console.error('Error calculating trends:', error);
    return {
      averageScore: 0,
      scoreTrend: 'stable',
      riskTrend: 'stable',
      totalAssessments: 0
    };
  }
};

/**
 * Calculate trend direction
 * @param {Array} values - Array of numeric values
 * @returns {string} Trend direction
 */
const calculateTrend = (values) => {
  if (values.length < 2) return 'stable';

  const recent = values.slice(-3); // Last 3 assessments
  const earlier = values.slice(-6, -3); // Previous 3 assessments

  if (earlier.length === 0) return 'stable';

  const recentAvg = recent.reduce((sum, val) => sum + val, 0) / recent.length;
  const earlierAvg = earlier.reduce((sum, val) => sum + val, 0) / earlier.length;

  const difference = recentAvg - earlierAvg;

  if (Math.abs(difference) < 5) return 'stable';
  return difference > 0 ? 'improving' : 'declining';
};

module.exports = {
  createAssessment,
  getAssessment,
  getAllAssessments,
  getAssessmentHistory
};