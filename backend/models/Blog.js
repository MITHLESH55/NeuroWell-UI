const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },

  slug: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true
  },

  content: {
    type: String,
    required: [true, 'Content is required'],
    minlength: [100, 'Content must be at least 100 characters']
  },

  excerpt: {
    type: String,
    maxlength: [300, 'Excerpt cannot exceed 300 characters']
  },

  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: {
      values: [
        'sleep_health',
        'stress_management',
        'fitness_tips',
        'nutrition_guide',
        'mental_wellness',
        'work_life_balance',
        'mindfulness',
        'recovery_techniques'
      ],
      message: 'Invalid category'
    }
  },

  tags: [{
    type: String,
    trim: true,
    maxlength: [30, 'Tag cannot exceed 30 characters']
  }],

  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Author is required']
  },

  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },

  featured: {
    type: Boolean,
    default: false
  },

  readTime: {
    type: Number, // in minutes
    min: 1,
    max: 30
  },

  // SEO fields
  metaTitle: {
    type: String,
    maxlength: [60, 'Meta title cannot exceed 60 characters']
  },

  metaDescription: {
    type: String,
    maxlength: [160, 'Meta description cannot exceed 160 characters']
  },

  // Engagement metrics
  views: {
    type: Number,
    default: 0
  },

  likes: {
    type: Number,
    default: 0
  },

  // Related content
  relatedPosts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Blog'
  }],

  // Publication info
  publishedAt: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
blogSchema.index({ category: 1, status: 1 });
blogSchema.index({ author: 1 });
blogSchema.index({ slug: 1 });
blogSchema.index({ tags: 1 });
blogSchema.index({ featured: 1, publishedAt: -1 });
blogSchema.index({ publishedAt: -1 });
blogSchema.index({ title: 'text', content: 'text' }); // Full-text search

// Virtual for formatted published date
blogSchema.virtual('formattedPublishedDate').get(function() {
  return this.publishedAt ? this.publishedAt.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }) : null;
});

// Virtual for URL-friendly path
blogSchema.virtual('urlPath').get(function() {
  return `/blog/${this.slug}`;
});

// Pre-save middleware to generate slug
blogSchema.pre('save', async function(next) {
  try {
    if (this.isModified('title') || this.isNew) {
      // Generate base slug from title
      let baseSlug = this.title
        .toLowerCase()
        .replace(/[^a-zA-Z0-9\s]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim('-');

      // Ensure slug is not empty
      if (!baseSlug) {
        baseSlug = 'blog-post';
      }

      let slug = baseSlug;
      let counter = 1;

      // Check for uniqueness
      const Blog = this.constructor;
      let existingBlog;
      do {
        existingBlog = await Blog.findOne({ slug: slug });
        if (existingBlog && !existingBlog._id.equals(this._id)) {
          slug = `${baseSlug}-${counter}`;
          counter++;
        } else {
          break;
        }
      } while (existingBlog);

      this.slug = slug;
    }

    // Auto-generate excerpt if not provided
    if (this.isModified('content') && !this.excerpt) {
      // Strip HTML tags for excerpt
      const textContent = this.content.replace(/<[^>]*>/g, '');
      this.excerpt = textContent.substring(0, 200) + (textContent.length > 200 ? '...' : '');
    }

    // Auto-calculate read time (assuming 200 words per minute)
    if (this.isModified('content')) {
      const textContent = this.content.replace(/<[^>]*>/g, '');
      const wordCount = textContent.split(/\s+/).filter(word => word.length > 0).length;
      this.readTime = Math.max(1, Math.ceil(wordCount / 200));
    }

    // Set publishedAt when status changes to published
    if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
      this.publishedAt = new Date();
    }

    next();
  } catch (error) {
    next(error);
  }
});

// Static method to get published posts
blogSchema.statics.getPublished = function(options = {}) {
  const query = { status: 'published' };

  if (options.category) {
    query.category = options.category;
  }

  if (options.featured !== undefined) {
    query.featured = options.featured;
  }

  return this.find(query)
    .populate('author', 'name profile.avatar')
    .sort(options.sort || { publishedAt: -1 })
    .limit(options.limit || 10)
    .skip(options.skip || 0);
};

// Static method to get related posts
blogSchema.statics.getRelated = function(postId, category, limit = 3) {
  return this.find({
    _id: { $ne: postId },
    category: category,
    status: 'published'
  })
  .select('title slug excerpt category readTime publishedAt')
  .sort({ publishedAt: -1 })
  .limit(limit);
};

// Instance method to increment view count
blogSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save({ validateBeforeSave: false });
};

// Instance method to toggle like
blogSchema.methods.toggleLike = function(userId) {
  // This would need a separate Likes collection for proper implementation
  // For now, just increment/decrement
  this.likes += 1;
  return this.save({ validateBeforeSave: false });
};

module.exports = mongoose.model('Blog', blogSchema);