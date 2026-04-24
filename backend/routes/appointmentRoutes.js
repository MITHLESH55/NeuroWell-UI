const express = require('express');
const appointmentController = require('../controllers/appointmentController');
const { authenticate } = require('../middleware/auth');
const { body, query, param } = require('express-validator');

const router = express.Router();

// All appointment routes require authentication
router.use(authenticate);

// POST /api/appointments - Create new appointment
router.post('/', [
  body('date')
    .isISO8601()
    .withMessage('Valid date is required')
    .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error('Appointment date must be in the future');
      }
      return true;
    }),
  body('time')
    .isIn(['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'])
    .withMessage('Invalid time slot'),
  body('type')
    .isIn(['mental_health', 'fitness_coaching', 'nutrition_consultation', 'stress_management', 'wellness_check'])
    .withMessage('Invalid appointment type'),
  body('notes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters')
], appointmentController.createAppointment);

// GET /api/appointments - Get user's appointments
router.get('/', [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('status')
    .optional()
    .isIn(['pending', 'confirmed', 'completed', 'cancelled'])
    .withMessage('Invalid status')
], appointmentController.getUserAppointments);

// GET /api/appointments/availability - Get available time slots
router.get('/availability', [
  query('date')
    .isISO8601()
    .withMessage('Valid date is required')
], appointmentController.getAvailability);

// GET /api/appointments/:id - Get specific appointment
router.get('/:id', [
  param('id')
    .isMongoId()
    .withMessage('Invalid appointment ID')
], appointmentController.getAppointment);

// PUT /api/appointments/:id - Update appointment
router.put('/:id', [
  param('id')
    .isMongoId()
    .withMessage('Invalid appointment ID'),
  body('date')
    .optional()
    .isISO8601()
    .withMessage('Valid date is required'),
  body('time')
    .optional()
    .isIn(['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'])
    .withMessage('Invalid time slot'),
  body('type')
    .optional()
    .isIn(['mental_health', 'fitness_coaching', 'nutrition_consultation', 'stress_management', 'wellness_check'])
    .withMessage('Invalid appointment type'),
  body('notes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters')
], appointmentController.updateAppointment);

// DELETE /api/appointments/:id - Cancel appointment
router.delete('/:id', [
  param('id')
    .isMongoId()
    .withMessage('Invalid appointment ID')
], appointmentController.cancelAppointment);

module.exports = router;