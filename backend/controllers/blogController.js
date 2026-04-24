const Blog = require('../models/Blog');
const { body, query, param, validationResult } = require('express-validator');

/**
 * Get all published blog posts
 * GET /api/blogs
 */
const getBlogs = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    const filter = { status: 'published' };

    // Optional category filter
    if (req.query.category) {
      filter.category = req.query.category;
    }

    // Optional featured filter
    if (req.query.featured === 'true') {
      filter.featured = true;
    }

    // Search functionality
    if (req.query.search) {
      filter.$text = { $search: req.query.search };
    }

    const blogs = await Blog.find(filter)
      .populate('author', 'name profile.avatar')
      .select('title slug excerpt category tags readTime views likes publishedAt formattedPublishedDate')
      .sort(req.query.sort || { publishedAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Blog.countDocuments(filter);

    res.json({
      success: true,
      message: 'Blog posts retrieved successfully',
      data: {
        blogs: blogs.map(blog => ({
          id: blog._id,
          title: blog.title,
          slug: blog.slug,
          excerpt: blog.excerpt,
          category: blog.category,
          tags: blog.tags,
          readTime: blog.readTime,
          views: blog.views,
          likes: blog.likes,
          publishedAt: blog.publishedAt,
          formattedPublishedDate: blog.formattedPublishedDate,
          author: blog.author
        }))
      },
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get blogs error:', error);
    next(error);
  }
};

/**
 * Get blog post by slug
 * GET /api/blogs/:slug
 */
const getBlogBySlug = async (req, res, next) => {
  try {
    const blog = await Blog.findOne({
      slug: req.params.slug,
      status: 'published'
    })
    .populate('author', 'name profile.avatar profile.bio')
    .populate('relatedPosts', 'title slug excerpt category readTime');

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found'
      });
    }

    // Increment view count
    await blog.incrementViews();

    res.json({
      success: true,
      data: {
        blog: {
          id: blog._id,
          title: blog.title,
          slug: blog.slug,
          content: blog.content,
          excerpt: blog.excerpt,
          category: blog.category,
          tags: blog.tags,
          readTime: blog.readTime,
          views: blog.views + 1, // Include the current view
          likes: blog.likes,
          publishedAt: blog.publishedAt,
          formattedPublishedDate: blog.formattedPublishedDate,
          metaTitle: blog.metaTitle,
          metaDescription: blog.metaDescription,
          author: blog.author,
          relatedPosts: blog.relatedPosts
        }
      }
    });

  } catch (error) {
    console.error('Get blog by slug error:', error);
    next(error);
  }
};

/**
 * Get blog categories
 * GET /api/blogs/categories
 */
const getCategories = async (req, res, next) => {
  try {
    const categories = await Blog.aggregate([
      { $match: { status: 'published' } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const categoryLabels = {
      'sleep_health': 'Sleep Health',
      'stress_management': 'Stress Management',
      'fitness_tips': 'Fitness Tips',
      'nutrition_guide': 'Nutrition Guide',
      'mental_wellness': 'Mental Wellness',
      'work_life_balance': 'Work-Life Balance',
      'mindfulness': 'Mindfulness',
      'recovery_techniques': 'Recovery Techniques'
    };

    const formattedCategories = categories.map(cat => ({
      id: cat._id,
      name: categoryLabels[cat._id] || cat._id,
      count: cat.count
    }));

    res.json({
      success: true,
      data: {
        categories: formattedCategories
      }
    });

  } catch (error) {
    console.error('Get categories error:', error);
    next(error);
  }
};

/**
 * Get featured blog posts
 * GET /api/blogs/featured
 */
const getFeaturedBlogs = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 6;

    const blogs = await Blog.find({
      status: 'published',
      featured: true
    })
    .populate('author', 'name profile.avatar')
    .select('title slug excerpt category tags readTime views likes publishedAt formattedPublishedDate')
    .sort({ publishedAt: -1 })
    .limit(limit);

    res.json({
      success: true,
      message: 'Featured blog posts retrieved successfully',
      data: {
        blogs: blogs.map(blog => ({
          id: blog._id,
          title: blog.title,
          slug: blog.slug,
          excerpt: blog.excerpt,
          category: blog.category,
          tags: blog.tags,
          readTime: blog.readTime,
          views: blog.views,
          likes: blog.likes,
          publishedAt: blog.publishedAt,
          formattedPublishedDate: blog.formattedPublishedDate,
          author: blog.author
        }))
      }
    });

  } catch (error) {
    console.error('Get featured blogs error:', error);
    next(error);
  }
};

/**
 * Create new blog post (Admin only)
 * POST /api/blogs
 */
const createBlog = async (req, res, next) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { title, content, category, tags, excerpt, featured, metaTitle, metaDescription } = req.body;

    const blog = await Blog.create({
      title,
      content,
      category,
      tags: tags || [],
      excerpt,
      featured: featured || false,
      metaTitle,
      metaDescription,
      author: req.user._id
    });

    res.status(201).json({
      success: true,
      message: 'Blog post created successfully',
      data: {
        blog: {
          id: blog._id,
          title: blog.title,
          slug: blog.slug,
          status: blog.status,
          createdAt: blog.createdAt
        }
      }
    });

  } catch (error) {
    console.error('Create blog error:', error);
    next(error);
  }
};

/**
 * Update blog post (Admin only)
 * PUT /api/blogs/:id
 */
const updateBlog = async (req, res, next) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found'
      });
    }

    // Update allowed fields
    const allowedFields = ['title', 'content', 'category', 'tags', 'excerpt', 'featured', 'status', 'metaTitle', 'metaDescription'];
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        blog[field] = req.body[field];
      }
    });

    await blog.save();

    res.json({
      success: true,
      message: 'Blog post updated successfully',
      data: {
        blog: {
          id: blog._id,
          title: blog.title,
          slug: blog.slug,
          status: blog.status,
          updatedAt: blog.updatedAt
        }
      }
    });

  } catch (error) {
    console.error('Update blog error:', error);
    next(error);
  }
};

/**
 * Delete blog post (Admin only)
 * DELETE /api/blogs/:id
 */
const deleteBlog = async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found'
      });
    }

    await blog.remove();

    res.json({
      success: true,
      message: 'Blog post deleted successfully'
    });

  } catch (error) {
    console.error('Delete blog error:', error);
    next(error);
  }
};

module.exports = {
  getBlogs,
  getBlogBySlug,
  getCategories,
  getFeaturedBlogs,
  createBlog,
  updateBlog,
  deleteBlog
};