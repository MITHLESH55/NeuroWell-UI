/**
 * NEUROWELL - Blog & Knowledge Hub Module
 * Manages wellness articles and content for user education
 * 
 * ARCHITECTURE:
 * - BlogManager: Central manager for blog operations
 * - Articles stored locally with categories and metadata
 * - Search and filtering functionality
 * - Reading time and engagement tracking
 * 
 * FEATURES:
 * - Professional wellness articles
 * - Category organization (stress, sleep, nutrition, etc.)
 * - Read more expandable content
 * - Article cards with featured images
 * - Search functionality
 * - Read progress tracking
 * 
 * VIVA READY:
 * - Content-driven knowledge hub
 * - Organized by wellness categories
 * - Professional typography and layout
 */

const BlogManager = {
  
  // ===== ARTICLES DATABASE =====
  ARTICLES: [
    {
      id: 'sleep_quality',
      title: '10 Proven Ways to Improve Sleep Quality',
      category: 'Sleep',
      author: 'Dr. Sarah Mitchell',
      date: '2026-04-15',
      readTime: 5,
      featured: true,
      icon: '😴',
      summary: 'Learn science-backed techniques to enhance your sleep quality and wake up refreshed.',
      content: `
        <h2>10 Proven Ways to Improve Sleep Quality</h2>
        
        <p>Quality sleep is one of the pillars of wellness. Here are 10 evidence-based strategies to enhance your sleep:</p>
        
        <h3>1. Maintain a Consistent Sleep Schedule</h3>
        <p>Going to bed and waking up at the same time daily helps regulate your body's internal clock. This consistency strengthens your circadian rhythm, making it easier to fall asleep and wake up naturally.</p>
        
        <h3>2. Create an Ideal Sleep Environment</h3>
        <p>Your bedroom should be cool (around 65-68°F), dark, and quiet. Consider using blackout curtains, a white noise machine, or comfortable bedding to optimize your sleep space.</p>
        
        <h3>3. Limit Screen Time Before Bed</h3>
        <p>Blue light from phones and computers suppresses melatonin production. Try to avoid screens 1-2 hours before bedtime, or use blue light filters.</p>
        
        <h3>4. Practice Relaxation Techniques</h3>
        <p>Deep breathing, progressive muscle relaxation, or meditation can calm your nervous system and prepare your body for sleep.</p>
        
        <h3>5. Avoid Caffeine and Heavy Meals</h3>
        <p>Caffeine can stay in your system for 5-6 hours. Avoid it after 2 PM. Similarly, eat your last substantial meal 2-3 hours before bed.</p>
        
        <h3>6. Exercise Regularly</h3>
        <p>Physical activity promotes better sleep, but avoid intense exercise close to bedtime. Morning or afternoon workouts are ideal.</p>
        
        <h3>7. Manage Stress and Anxiety</h3>
        <p>Stress keeps you awake. Practice stress management techniques like journaling, meditation, or therapy to reduce sleep disruption.</p>
        
        <h3>8. Limit Naps</h3>
        <p>While short naps (20-30 minutes) can be refreshing, longer naps can interfere with nighttime sleep quality.</p>
        
        <h3>9. Consider Natural Supplements</h3>
        <p>Melatonin, magnesium, and valerian root may help. Always consult with a healthcare provider before starting supplements.</p>
        
        <h3>10. Get Morning Sunlight</h3>
        <p>Exposure to natural light in the morning helps regulate your circadian rhythm and improves nighttime sleep quality.</p>
        
        <p><strong>Remember:</strong> Good sleep is a journey. Implement these strategies gradually and give them time to work. If sleep problems persist, consult a sleep specialist.</p>
      `
    },
    {
      id: 'stress_management',
      title: 'Stress Management: Techniques That Actually Work',
      category: 'Stress',
      author: 'Dr. James Chen',
      date: '2026-04-10',
      readTime: 7,
      featured: true,
      icon: '🧘',
      summary: 'Discover effective stress management techniques backed by research to improve your mental health.',
      content: `
        <h2>Stress Management: Techniques That Actually Work</h2>
        
        <p>Chronic stress affects your physical and mental health. Here are proven techniques to manage stress effectively:</p>
        
        <h3>Understanding Your Stress Response</h3>
        <p>Your body's stress response is natural, but chronic activation leads to health issues. Learning to manage this response is crucial.</p>
        
        <h3>1. Mindfulness Meditation</h3>
        <p>Spending 10-20 minutes daily on meditation can reduce stress hormones and improve emotional regulation.</p>
        
        <h3>2. Progressive Muscle Relaxation</h3>
        <p>Systematically tense and relax muscle groups to release physical tension accumulated from stress.</p>
        
        <h3>3. Box Breathing</h3>
        <p>Breathe in for 4 counts, hold for 4, exhale for 4, hold for 4. This technique activates your parasympathetic nervous system.</p>
        
        <h3>4. Regular Exercise</h3>
        <p>Physical activity releases endorphins and reduces cortisol levels. Aim for 30 minutes of moderate exercise daily.</p>
        
        <h3>5. Social Connection</h3>
        <p>Talking with friends and family provides emotional support and helps process stress.</p>
        
        <h3>6. Time in Nature</h3>
        <p>Nature exposure reduces stress hormones and promotes calm. Spend time outdoors regularly.</p>
        
        <h3>7. Journaling</h3>
        <p>Writing about your stressors helps organize thoughts and identify solutions.</p>
        
        <p><strong>Pro Tip:</strong> Combine multiple techniques for best results. What works for one person may differ for another.</p>
      `
    },
    {
      id: 'nutrition_tips',
      title: 'Nutrition for Wellness: Eat Your Way to Better Health',
      category: 'Nutrition',
      author: 'Dr. Emily Rodriguez',
      date: '2026-04-05',
      readTime: 6,
      featured: true,
      icon: '🥗',
      summary: 'Explore evidence-based nutrition principles to support your overall wellness journey.',
      content: `
        <h2>Nutrition for Wellness: Eat Your Way to Better Health</h2>
        
        <p>What you eat directly impacts your physical and mental health. Here's how to make nutritious choices:</p>
        
        <h3>The Fundamentals of Healthy Eating</h3>
        <p>A balanced diet includes lean proteins, whole grains, healthy fats, and plenty of fruits and vegetables.</p>
        
        <h3>1. Prioritize Whole Foods</h3>
        <p>Whole foods provide nutrients and fiber. Minimize processed foods high in sugar and unhealthy fats.</p>
        
        <h3>2. Stay Hydrated</h3>
        <p>Drink at least 8 glasses of water daily. Proper hydration supports all bodily functions.</p>
        
        <h3>3. Protein for Recovery</h3>
        <p>Include lean proteins at each meal to support muscle recovery and maintain stable blood sugar.</p>
        
        <h3>4. Healthy Fats</h3>
        <p>Omega-3 fatty acids from fish, nuts, and seeds support brain health and reduce inflammation.</p>
        
        <h3>5. Limit Sugar and Salt</h3>
        <p>High sugar and sodium intake increases risk of chronic diseases. Read labels and cook at home.</p>
        
        <h3>6. Colorful Variety</h3>
        <p>Different colored foods provide different nutrients. Aim for a rainbow on your plate.</p>
        
        <p><strong>Remember:</strong> Nutrition is individual. Consider consulting a nutritionist for personalized advice.</p>
      `
    },
    {
      id: 'exercise_benefits',
      title: 'The Science Behind Exercise Benefits',
      category: 'Fitness',
      author: 'Coach Michael Torres',
      date: '2026-03-28',
      readTime: 5,
      featured: false,
      icon: '💪',
      summary: 'Understand how regular exercise impacts your physical and mental health.',
      content: `
        <h2>The Science Behind Exercise Benefits</h2>
        
        <p>Exercise is medicine for your body and mind. Here's what science tells us:</p>
        
        <h3>Physical Benefits</h3>
        <p>Regular exercise improves cardiovascular health, builds muscle, increases flexibility, and enhances endurance.</p>
        
        <h3>Mental Health Benefits</h3>
        <p>Exercise releases endorphins, reduces anxiety, improves mood, and enhances cognitive function.</p>
        
        <h3>Types of Exercise</h3>
        <p>Combine cardio, strength training, and flexibility work for comprehensive fitness.</p>
        
        <p><strong>Start slowly and build gradually.</strong> Consistency matters more than intensity.</p>
      `
    },
    {
      id: 'mindfulness_intro',
      title: 'Mindfulness 101: A Beginner\'s Guide',
      category: 'Mindfulness',
      author: 'Dr. Lisa Park',
      date: '2026-03-20',
      readTime: 4,
      featured: false,
      icon: '🧠',
      summary: 'Introduction to mindfulness and how it can transform your daily life.',
      content: `
        <h2>Mindfulness 101: A Beginner's Guide</h2>
        
        <p>Mindfulness is the practice of being present in the moment without judgment.</p>
        
        <h3>Why Practice Mindfulness?</h3>
        <p>Mindfulness reduces stress, improves focus, enhances emotional regulation, and promotes overall well-being.</p>
        
        <h3>Getting Started</h3>
        <p>Start with 5 minutes daily. Focus on your breath and gently bring your attention back when your mind wanders.</p>
        
        <p><strong>Mindfulness is a skill.</strong> Like any skill, it improves with practice.</p>
      `
    },
    {
      id: 'work_life_balance',
      title: 'Work-Life Balance: Stop Burnout Before It Starts',
      category: 'Stress',
      author: 'Dr. Angela Wright',
      date: '2026-03-15',
      readTime: 6,
      featured: false,
      icon: '⚖️',
      summary: 'Learn strategies to maintain healthy work-life balance and prevent burnout.',
      content: `
        <h2>Work-Life Balance: Stop Burnout Before It Starts</h2>
        
        <p>Burnout is real, and prevention is easier than recovery. Here's how to maintain balance:</p>
        
        <h3>Set Clear Boundaries</h3>
        <p>Establish work hours and stick to them. Avoid checking emails outside work time.</p>
        
        <h3>Prioritize Self-Care</h3>
        <p>Invest time in activities that recharge you: hobbies, exercise, time with loved ones.</p>
        
        <h3>Delegate and Ask for Help</h3>
        <p>You don't have to do everything. Delegate tasks and ask for support when needed.</p>
        
        <p><strong>Remember:</strong> Taking care of yourself isn't selfish; it's essential for sustainable performance.</p>
      `
    }
  ],

  // ===== CATEGORIES =====
  CATEGORIES: [
    { id: 'sleep', name: 'Sleep', icon: '😴', color: '#667eea' },
    { id: 'stress', name: 'Stress', icon: '🧘', color: '#764ba2' },
    { id: 'nutrition', name: 'Nutrition', icon: '🥗', color: '#10b981' },
    { id: 'fitness', name: 'Fitness', icon: '💪', color: '#f59e0b' },
    { id: 'mindfulness', name: 'Mindfulness', icon: '🧠', color: '#3b82f6' }
  ],

  STORAGE_KEY: 'neurowell_blog_progress',

  // ===== INITIALIZATION =====

  init: () => {
    console.log('📚 Initializing Blog & Knowledge Hub System...');
    console.log(`✅ Blog System Ready (${BlogManager.ARTICLES.length} articles loaded)`);
  },

  // ===== ARTICLE RETRIEVAL =====

  /**
   * Get all articles
   */
  getAllArticles: () => {
    return BlogManager.ARTICLES;
  },

  /**
   * Get article by ID
   */
  getArticle: (articleId) => {
    return BlogManager.ARTICLES.find(a => a.id === articleId);
  },

  /**
   * Get articles by category
   * VIVA: "We filter articles by category to help users find relevant content"
   */
  getArticlesByCategory: (categoryId) => {
    return BlogManager.ARTICLES.filter(a => 
      a.category.toLowerCase() === categoryId.toLowerCase()
    );
  },

  /**
   * Get featured articles
   */
  getFeaturedArticles: () => {
    return BlogManager.ARTICLES.filter(a => a.featured).slice(0, 3);
  },

  /**
   * Search articles
   */
  searchArticles: (query) => {
    const lowerQuery = query.toLowerCase();
    return BlogManager.ARTICLES.filter(a =>
      a.title.toLowerCase().includes(lowerQuery) ||
      a.summary.toLowerCase().includes(lowerQuery) ||
      a.category.toLowerCase().includes(lowerQuery)
    );
  },

  // ===== READING PROGRESS =====

  /**
   * Mark article as read
   */
  markAsRead: (articleId) => {
    try {
      let progress = JSON.parse(localStorage.getItem(BlogManager.STORAGE_KEY)) || {};
      if (!progress.readArticles) progress.readArticles = [];
      
      if (!progress.readArticles.includes(articleId)) {
        progress.readArticles.push(articleId);
        localStorage.setItem(BlogManager.STORAGE_KEY, JSON.stringify(progress));
      }
      return true;
    } catch (error) {
      console.error('Error marking article as read:', error);
      return false;
    }
  },

  /**
   * Check if article is read
   */
  isArticleRead: (articleId) => {
    try {
      const progress = JSON.parse(localStorage.getItem(BlogManager.STORAGE_KEY)) || {};
      return progress.readArticles?.includes(articleId) || false;
    } catch {
      return false;
    }
  },

  /**
   * Get reading statistics
   */
  getReadingStats: () => {
    try {
      const progress = JSON.parse(localStorage.getItem(BlogManager.STORAGE_KEY)) || {};
      const readArticles = progress.readArticles || [];
      
      return {
        totalRead: readArticles.length,
        totalAvailable: BlogManager.ARTICLES.length,
        percentage: Math.round((readArticles.length / BlogManager.ARTICLES.length) * 100)
      };
    } catch {
      return { totalRead: 0, totalAvailable: BlogManager.ARTICLES.length, percentage: 0 };
    }
  },

  // ===== UI RENDERING =====

  /**
   * Render featured articles section
   */
  renderFeaturedArticles: (containerId) => {
    const container = document.getElementById(containerId);
    if (!container) return;

    const featured = BlogManager.getFeaturedArticles();

    container.innerHTML = `
      <div class="featured-section">
        <h2>📚 Featured Articles</h2>
        <div class="featured-grid">
          ${featured.map((article, index) => `
            <div class="featured-card" style="animation: fadeIn 0.4s ease-in-out ${index * 0.1}s both;">
              <div class="featured-icon">${article.icon}</div>
              <h3>${article.title}</h3>
              <p>${article.summary}</p>
              <button class="btn btn-sm btn-secondary" onclick="
                BlogManager.markAsRead('${article.id}');
                BlogManager.showArticleDetail('${article.id}');
              ">Read More →</button>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  },

  /**
   * Render blog page
   */
  renderBlogPage: (containerId) => {
    const container = document.getElementById(containerId);
    if (!container) return;

    const stats = BlogManager.getReadingStats();
    const allArticles = BlogManager.getAllArticles();

    container.innerHTML = `
      <div class="blog-page">
        <div class="blog-header">
          <h1>📚 Knowledge Hub</h1>
          <p class="subtitle">Wellness education and expert insights</p>
          
          <div class="reading-stats">
            <div class="stat">
              <span class="stat-value">${stats.totalRead}</span>
              <span class="stat-label">Articles Read</span>
            </div>
            <div class="stat">
              <span class="stat-value">${stats.percentage}%</span>
              <span class="stat-label">Progress</span>
            </div>
            <div class="stat">
              <span class="stat-value">${stats.totalAvailable}</span>
              <span class="stat-label">Total Articles</span>
            </div>
          </div>
        </div>

        <!-- Search Bar -->
        <div class="search-section">
          <input 
            type="text" 
            id="searchInput" 
            class="search-input" 
            placeholder="Search articles..."
            onkeyup="BlogManager.handleSearch(this.value)"
          >
        </div>

        <!-- Categories Filter -->
        <div class="categories-section">
          <h3>Categories</h3>
          <div class="categories-list">
            <button class="category-btn active" onclick="BlogManager.filterByCategory(null)">
              All Articles
            </button>
            ${BlogManager.CATEGORIES.map(cat => `
              <button class="category-btn" onclick="BlogManager.filterByCategory('${cat.id}')">
                ${cat.icon} ${cat.name}
              </button>
            `).join('')}
          </div>
        </div>

        <!-- Articles Grid -->
        <div id="articlesContainer" class="articles-grid">
          ${allArticles.map((article, index) => `
            <article class="article-card" style="animation: fadeIn 0.3s ease-in-out ${index * 0.05}s both;">
              <div class="article-icon">${article.icon}</div>
              <div class="article-header">
                <span class="article-category">${article.category}</span>
                ${BlogManager.isArticleRead(article.id) ? '<span class="read-badge">✓ Read</span>' : ''}
              </div>
              <h3>${article.title}</h3>
              <p>${article.summary}</p>
              <div class="article-meta">
                <span class="author">By ${article.author}</span>
                <span class="read-time">⏱ ${article.readTime} min read</span>
              </div>
              <button class="btn btn-sm btn-secondary" onclick="
                BlogManager.markAsRead('${article.id}');
                BlogManager.showArticleDetail('${article.id}');
              ">Read Article</button>
            </article>
          `).join('')}
        </div>
      </div>
    `;

    // Attach event listeners
    document.getElementById('searchInput')?.addEventListener('input', (e) => {
      BlogManager.handleSearch(e.target.value);
    });
  },

  /**
   * Handle search
   */
  handleSearch: (query) => {
    if (!query) {
      BlogManager.renderBlogPage('blogContainer');
      return;
    }

    const results = BlogManager.searchArticles(query);
    const container = document.getElementById('articlesContainer');
    if (!container) return;

    container.innerHTML = results.length === 0 
      ? `<div class="no-results">No articles found matching "${query}"</div>`
      : results.map((article, index) => `
        <article class="article-card" style="animation: fadeIn 0.3s ease-in-out ${index * 0.05}s both;">
          <div class="article-icon">${article.icon}</div>
          <div class="article-header">
            <span class="article-category">${article.category}</span>
            ${BlogManager.isArticleRead(article.id) ? '<span class="read-badge">✓ Read</span>' : ''}
          </div>
          <h3>${article.title}</h3>
          <p>${article.summary}</p>
          <div class="article-meta">
            <span class="author">By ${article.author}</span>
            <span class="read-time">⏱ ${article.readTime} min read</span>
          </div>
          <button class="btn btn-sm btn-secondary" onclick="
            BlogManager.markAsRead('${article.id}');
            BlogManager.showArticleDetail('${article.id}');
          ">Read Article</button>
        </article>
      `).join('');
  },

  /**
   * Filter by category
   */
  filterByCategory: (categoryId) => {
    const container = document.getElementById('articlesContainer');
    if (!container) return;

    const articles = categoryId 
      ? BlogManager.getArticlesByCategory(categoryId)
      : BlogManager.getAllArticles();

    container.innerHTML = articles.map((article, index) => `
      <article class="article-card" style="animation: fadeIn 0.3s ease-in-out ${index * 0.05}s both;">
        <div class="article-icon">${article.icon}</div>
        <div class="article-header">
          <span class="article-category">${article.category}</span>
          ${BlogManager.isArticleRead(article.id) ? '<span class="read-badge">✓ Read</span>' : ''}
        </div>
        <h3>${article.title}</h3>
        <p>${article.summary}</p>
        <div class="article-meta">
          <span class="author">By ${article.author}</span>
          <span class="read-time">⏱ ${article.readTime} min read</span>
        </div>
        <button class="btn btn-sm btn-secondary" onclick="
          BlogManager.markAsRead('${article.id}');
          BlogManager.showArticleDetail('${article.id}');
        ">Read Article</button>
      </article>
    `).join('');

    // Update active category button
    document.querySelectorAll('.category-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    event.target.classList.add('active');
  },

  /**
   * Show article detail modal
   */
  showArticleDetail: (articleId) => {
    const article = BlogManager.getArticle(articleId);
    if (!article) return;

    const modal = document.createElement('div');
    modal.className = 'modal article-modal';
    modal.innerHTML = `
      <div class="modal-content article-detail">
        <div class="modal-header">
          <h1>${article.icon} ${article.title}</h1>
          <button class="btn-close" onclick="this.closest('.modal').remove()">✕</button>
        </div>

        <div class="article-info">
          <span class="category-tag">${article.category}</span>
          <span class="author-info">By ${article.author}</span>
          <span class="date-info">${new Date(article.date).toLocaleDateString()}</span>
          <span class="read-time-info">⏱ ${article.readTime} min read</span>
        </div>

        <div class="article-content">
          ${article.content}
        </div>

        <div class="modal-footer">
          <button class="btn btn-primary" onclick="this.closest('.modal').remove()">Close</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    modal.style.display = 'flex';

    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.remove();
    });

    // Mark as read
    BlogManager.markAsRead(articleId);
  }
};

// Auto-initialize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', BlogManager.init);
} else {
  BlogManager.init();
}
