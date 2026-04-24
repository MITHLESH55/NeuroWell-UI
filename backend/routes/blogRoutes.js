const express = require('express');
const blogController = require('../controllers/blogController');
const { authenticate, authorizeAdmin, optionalAuth } = require('../middleware/auth');
const { body, query, param } = require('express-validator');

const router = express.Router();

// Public routes
router.get('/', [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50'),
  query('category')
    .optional()
    .isIn(['sleep_health', 'stress_management', 'fitness_tips', 'nutrition_guide', 'mental_wellness', 'work_life_balance', 'mindfulness', 'recovery_techniques'])
    .withMessage('Invalid category'),
  query('featured')
    .optional()
    .isIn(['true', 'false'])
    .withMessage('Featured must be true or false'),
  query('search')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('Search term must be between 2 and 100 characters'),
  query('sort')
    .optional()
    .isIn(['publishedAt', '-publishedAt', 'views', '-views', 'likes', '-likes'])
    .withMessage('Invalid sort option')
], blogController.getBlogs);

router.get('/categories', blogController.getCategories);

router.get('/featured', [
  query('limit')
    .optional()
    .isInt({ min: 1, max: 20 })
    .withMessage('Limit must be between 1 and 20')
], blogController.getFeaturedBlogs);

router.get('/:slug', blogController.getBlogBySlug);

// Admin routes
router.use(authenticate);
router.use(authorizeAdmin);

router.post('/', [
  body('title')
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Title must be between 5 and 100 characters'),
  body('content')
    .isLength({ min: 100 })
    .withMessage('Content must be at least 100 characters'),
  body('category')
    .isIn(['sleep_health', 'stress_management', 'fitness_tips', 'nutrition_guide', 'mental_wellness', 'work_life_balance', 'mindfulness', 'recovery_techniques'])
    .withMessage('Invalid category'),
  body('tags')
    .optional()
    .isArray({ max: 10 })
    .withMessage('Maximum 10 tags allowed'),
  body('tags.*')
    .optional()
    .isLength({ min: 2, max: 30 })
    .withMessage('Each tag must be between 2 and 30 characters'),
  body('excerpt')
    .optional()
    .isLength({ max: 300 })
    .withMessage('Excerpt cannot exceed 300 characters'),
  body('featured')
    .optional()
    .isBoolean()
    .withMessage('Featured must be a boolean'),
  body('metaTitle')
    .optional()
    .isLength({ max: 60 })
    .withMessage('Meta title cannot exceed 60 characters'),
  body('metaDescription')
    .optional()
    .isLength({ max: 160 })
    .withMessage('Meta description cannot exceed 160 characters')
], blogController.createBlog);

router.put('/:id', [
  param('id')
    .isMongoId()
    .withMessage('Invalid blog ID'),
  body('title')
    .optional()
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Title must be between 5 and 100 characters'),
  body('content')
    .optional()
    .isLength({ min: 100 })
    .withMessage('Content must be at least 100 characters'),
  body('category')
    .optional()
    .isIn(['sleep_health', 'stress_management', 'fitness_tips', 'nutrition_guide', 'mental_wellness', 'work_life_balance', 'mindfulness', 'recovery_techniques'])
    .withMessage('Invalid category'),
  body('tags')
    .optional()
    .isArray({ max: 10 })
    .withMessage('Maximum 10 tags allowed'),
  body('tags.*')
    .optional()
    .isLength({ min: 2, max: 30 })
    .withMessage('Each tag must be between 2 and 30 characters'),
  body('excerpt')
    .optional()
    .isLength({ max: 300 })
    .withMessage('Excerpt cannot exceed 300 characters'),
  body('featured')
    .optional()
    .isBoolean()
    .withMessage('Featured must be a boolean'),
  body('status')
    .optional()
    .isIn(['draft', 'published', 'archived'])
    .withMessage('Invalid status'),
  body('metaTitle')
    .optional()
    .isLength({ max: 60 })
    .withMessage('Meta title cannot exceed 60 characters'),
  body('metaDescription')
    .optional()
    .isLength({ max: 160 })
    .withMessage('Meta description cannot exceed 160 characters')
], blogController.updateBlog);

router.delete('/:id', [
  param('id')
    .isMongoId()
    .withMessage('Invalid blog ID')
], blogController.deleteBlog);

module.exports = router;