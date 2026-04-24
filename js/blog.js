/**
 * NeuroWell Blog/Knowledge Hub Frontend
 * Handles blog post display, search, filtering, and reading
 */

class BlogManager {
    constructor() {
        this.currentPage = 1;
        this.pageSize = 12;
        this.currentCategory = '';
        this.currentSort = 'publishedAt';
        this.searchQuery = '';
        this.isLoading = false;
        this.hasMore = true;

        this.init();
    }

    init() {
        this.bindEvents();
        this.loadInitialData();
    }

    bindEvents() {
        // Search functionality
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', this.debounce(this.handleSearch.bind(this), 500));
        }

        // Category filter
        const categoryFilter = document.getElementById('categoryFilter');
        if (categoryFilter) {
            categoryFilter.addEventListener('change', this.handleCategoryFilter.bind(this));
        }

        // Sort filter
        const sortFilter = document.getElementById('sortFilter');
        if (sortFilter) {
            sortFilter.addEventListener('change', this.handleSortFilter.bind(this));
        }

        // Load more button
        const loadMoreBtn = document.getElementById('loadMoreBtn');
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', this.loadMoreArticles.bind(this));
        }

        // Article modal
        const modal = document.getElementById('articleModal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target.classList.contains('modal') || e.target.classList.contains('modal-close')) {
                    this.closeArticleModal();
                }
            });
        }

        // Newsletter signup
        const newsletterForm = document.querySelector('.newsletter-form');
        if (newsletterForm) {
            newsletterForm.addEventListener('submit', this.handleNewsletterSignup.bind(this));
        }
    }

    async loadInitialData() {
        try {
            await Promise.all([
                this.loadFeaturedArticles(),
                this.loadCategories(),
                this.loadArticles()
            ]);
        } catch (error) {
            console.error('Error loading initial data:', error);
            this.showError('Failed to load blog content. Please try again later.');
        }
    }

    async loadFeaturedArticles() {
        try {
            const response = await fetch('/api/blogs/featured?limit=3');
            const data = await response.json();

            if (data.success) {
                this.renderFeaturedArticles(data.data.blogs);
            }
        } catch (error) {
            console.error('Error loading featured articles:', error);
        }
    }

    async loadCategories() {
        try {
            const response = await fetch('/api/blogs/categories');
            const data = await response.json();

            if (data.success) {
                this.renderCategories(data.data.categories);
                this.populateCategoryFilter(data.data.categories);
            }
        } catch (error) {
            console.error('Error loading categories:', error);
        }
    }

    async loadArticles(reset = true) {
        if (this.isLoading) return;

        this.isLoading = true;
        this.showLoading(true);

        if (reset) {
            this.currentPage = 1;
            this.hasMore = true;
        }

        try {
            const params = new URLSearchParams({
                page: this.currentPage,
                limit: this.pageSize,
                sort: this.currentSort
            });

            if (this.currentCategory) {
                params.append('category', this.currentCategory);
            }

            if (this.searchQuery) {
                params.append('search', this.searchQuery);
            }

            const response = await fetch(`/api/blogs?${params}`);
            const data = await response.json();

            if (data.success) {
                if (reset) {
                    this.renderArticles(data.data.blogs);
                } else {
                    this.appendArticles(data.data.blogs);
                }

                this.hasMore = data.data.blogs.length === this.pageSize;
                this.currentPage++;

                this.updateLoadMoreButton();
            }
        } catch (error) {
            console.error('Error loading articles:', error);
            this.showError('Failed to load articles. Please try again.');
        } finally {
            this.isLoading = false;
            this.showLoading(false);
        }
    }

    async loadMoreArticles() {
        if (!this.hasMore || this.isLoading) return;
        await this.loadArticles(false);
    }

    async loadArticleBySlug(slug) {
        try {
            const response = await fetch(`/api/blogs/${slug}`);
            const data = await response.json();

            if (data.success) {
                this.showArticleModal(data.data.blog);
            } else {
                this.showError('Article not found');
            }
        } catch (error) {
            console.error('Error loading article:', error);
            this.showError('Failed to load article');
        }
    }

    renderFeaturedArticles(articles) {
        const container = document.getElementById('featuredArticles');
        if (!container) return;

        container.innerHTML = articles.map(article => `
            <article class="article-card featured-card" data-slug="${article.slug}">
                <div class="article-image">
                    <div class="article-category">${this.formatCategory(article.category)}</div>
                    <div class="article-meta">
                        <span><i class="far fa-clock"></i> ${article.readTime} min read</span>
                        <span><i class="far fa-eye"></i> ${article.views}</span>
                    </div>
                </div>
                <div class="article-content">
                    <h3 class="article-title">${article.title}</h3>
                    <p class="article-excerpt">${article.excerpt}</p>
                    <div class="article-footer">
                        <div class="article-tags">
                            ${article.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                        </div>
                        <div class="article-date">${article.formattedPublishedDate}</div>
                    </div>
                </div>
            </article>
        `).join('');

        // Add click handlers
        container.querySelectorAll('.article-card').forEach(card => {
            card.addEventListener('click', () => {
                const slug = card.dataset.slug;
                this.loadArticleBySlug(slug);
            });
        });
    }

    renderCategories(categories) {
        const container = document.getElementById('categoriesGrid');
        if (!container) return;

        container.innerHTML = categories.map(category => `
            <div class="category-card" data-category="${category.id}">
                <div class="category-icon">
                    <i class="fas ${this.getCategoryIcon(category.id)}"></i>
                </div>
                <h3 class="category-title">${category.name}</h3>
                <p class="category-count">${category.count} articles</p>
            </div>
        `).join('');

        // Add click handlers
        container.querySelectorAll('.category-card').forEach(card => {
            card.addEventListener('click', () => {
                const category = card.dataset.category;
                this.handleCategoryClick(category);
            });
        });
    }

    renderArticles(articles) {
        const container = document.getElementById('articlesGrid');
        if (!container) return;

        container.innerHTML = articles.map(article => `
            <article class="article-card" data-slug="${article.slug}">
                <div class="article-header">
                    <div class="article-category">${this.formatCategory(article.category)}</div>
                    <div class="article-meta">
                        <span><i class="far fa-clock"></i> ${article.readTime} min read</span>
                        <span><i class="far fa-eye"></i> ${article.views}</span>
                    </div>
                </div>
                <div class="article-content">
                    <h3 class="article-title">${article.title}</h3>
                    <p class="article-excerpt">${article.excerpt}</p>
                    <div class="article-footer">
                        <div class="article-tags">
                            ${article.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                        </div>
                        <div class="article-date">${article.formattedPublishedDate}</div>
                    </div>
                </div>
            </article>
        `).join('');

        // Add click handlers
        container.querySelectorAll('.article-card').forEach(card => {
            card.addEventListener('click', () => {
                const slug = card.dataset.slug;
                this.loadArticleBySlug(slug);
            });
        });
    }

    appendArticles(articles) {
        const container = document.getElementById('articlesGrid');
        if (!container) return;

        const fragment = document.createDocumentFragment();
        articles.forEach(article => {
            const articleElement = document.createElement('article');
            articleElement.className = 'article-card';
            articleElement.dataset.slug = article.slug;
            articleElement.innerHTML = `
                <div class="article-header">
                    <div class="article-category">${this.formatCategory(article.category)}</div>
                    <div class="article-meta">
                        <span><i class="far fa-clock"></i> ${article.readTime} min read</span>
                        <span><i class="far fa-eye"></i> ${article.views}</span>
                    </div>
                </div>
                <div class="article-content">
                    <h3 class="article-title">${article.title}</h3>
                    <p class="article-excerpt">${article.excerpt}</p>
                    <div class="article-footer">
                        <div class="article-tags">
                            ${article.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                        </div>
                        <div class="article-date">${article.formattedPublishedDate}</div>
                    </div>
                </div>
            `;

            articleElement.addEventListener('click', () => {
                this.loadArticleBySlug(article.slug);
            });

            fragment.appendChild(articleElement);
        });

        container.appendChild(fragment);
    }

    populateCategoryFilter(categories) {
        const filter = document.getElementById('categoryFilter');
        if (!filter) return;

        const options = categories.map(category =>
            `<option value="${category.id}">${category.name}</option>`
        ).join('');

        filter.innerHTML = '<option value="">All Categories</option>' + options;
    }

    showArticleModal(article) {
        const modal = document.getElementById('articleModal');
        const content = document.getElementById('articleContent');

        if (!modal || !content) return;

        content.innerHTML = `
            <div class="article-full">
                <div class="article-full-header">
                    <div class="article-category">${this.formatCategory(article.category)}</div>
                    <h1 class="article-full-title">${article.title}</h1>
                    <div class="article-full-meta">
                        <span><i class="far fa-clock"></i> ${article.readTime} min read</span>
                        <span><i class="far fa-eye"></i> ${article.views + 1} views</span>
                        <span><i class="far fa-calendar"></i> ${article.formattedPublishedDate}</span>
                    </div>
                    <div class="article-tags">
                        ${article.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                    </div>
                </div>
                <div class="article-full-content">
                    ${article.content}
                </div>
                <div class="article-full-footer">
                    <div class="article-author">
                        <div class="author-info">
                            <h4>Written by</h4>
                            <p>${article.author.name}</p>
                        </div>
                    </div>
                    <div class="article-actions">
                        <button class="btn btn-outline like-btn">
                            <i class="far fa-heart"></i> ${article.likes}
                        </button>
                        <button class="btn btn-outline share-btn">
                            <i class="fas fa-share"></i> Share
                        </button>
                    </div>
                </div>
            </div>
        `;

        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }

    closeArticleModal() {
        const modal = document.getElementById('articleModal');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    }

    handleSearch(event) {
        this.searchQuery = event.target.value.trim();
        this.loadArticles(true);
    }

    handleCategoryFilter(event) {
        this.currentCategory = event.target.value;
        this.loadArticles(true);
    }

    handleSortFilter(event) {
        this.currentSort = event.target.value;
        this.loadArticles(true);
    }

    handleCategoryClick(category) {
        this.currentCategory = category;
        document.getElementById('categoryFilter').value = category;
        this.loadArticles(true);

        // Scroll to articles section
        document.querySelector('.articles-section').scrollIntoView({
            behavior: 'smooth'
        });
    }

    updateLoadMoreButton() {
        const container = document.getElementById('loadMoreContainer');
        const button = document.getElementById('loadMoreBtn');

        if (!container || !button) return;

        if (this.hasMore) {
            container.style.display = 'block';
            button.disabled = false;
            button.textContent = 'Load More Articles';
        } else {
            container.style.display = 'none';
        }
    }

    async handleNewsletterSignup(event) {
        event.preventDefault();
        const email = event.target.querySelector('.newsletter-input').value;

        // For now, just show a success message
        // In a real implementation, this would send to backend
        alert('Thank you for subscribing! We\'ll keep you updated with the latest wellness insights.');
        event.target.querySelector('.newsletter-input').value = '';
    }

    showLoading(show) {
        const button = document.getElementById('loadMoreBtn');
        if (button) {
            button.disabled = show;
            button.textContent = show ? 'Loading...' : 'Load More Articles';
        }
    }

    showError(message) {
        // Simple error display - could be enhanced with a toast system
        alert(message);
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    formatCategory(category) {
        const labels = {
            'sleep_health': 'Sleep Health',
            'stress_management': 'Stress Management',
            'fitness_tips': 'Fitness Tips',
            'nutrition_guide': 'Nutrition Guide',
            'mental_wellness': 'Mental Wellness',
            'work_life_balance': 'Work-Life Balance',
            'mindfulness': 'Mindfulness',
            'recovery_techniques': 'Recovery Techniques'
        };
        return labels[category] || category;
    }

    getCategoryIcon(category) {
        const icons = {
            'sleep_health': 'fa-moon',
            'stress_management': 'fa-brain',
            'fitness_tips': 'fa-dumbbell',
            'nutrition_guide': 'fa-utensils',
            'mental_wellness': 'fa-heart',
            'work_life_balance': 'fa-balance-scale',
            'mindfulness': 'fa-om',
            'recovery_techniques': 'fa-plus'
        };
        return icons[category] || 'fa-book';
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new BlogManager();
});