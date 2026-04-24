/**
 * NEUROWELL BACKEND - Assessment Routes
 * API endpoints for wellness assessment operations
 * Handles creating assessments and retrieving results
 */

const express = require('express');
const assessmentController = require('../controllers/assessmentController');
const { authenticate, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// POST /api/assessment - Create new assessment (optional auth)
router.post('/assessment', optionalAuth, assessmentController.createAssessment);

// GET /api/assessment/:id - Get assessment by ID
router.get('/assessment/:id', assessmentController.getAssessment);

// GET /api/assessment/history - Get user's assessment history (requires auth)
router.get('/assessment/history', authenticate, assessmentController.getAssessmentHistory);

// GET /api/assessment - Get all assessments (for admin/debugging)
router.get('/assessment', assessmentController.getAllAssessments);

module.exports = router;