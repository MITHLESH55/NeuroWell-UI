/**
 * NEUROWELL - Community System (Social Layer)
 * Posts, likes, comments, leaderboard, progress sharing.
 * Backend-ready: swap _store for Firestore/REST API.
 */

const CommunitySystem = (() => {

  // ── Storage Adapter ─────────────────────────────────────────────
  const _store = {
    KEY: 'nw_community_v1',
    get()  { try { return JSON.parse(localStorage.getItem(this.KEY) || 'null') || { posts: [] }; } catch { return { posts: [] }; } },
    set(d) { try { localStorage.setItem(this.KEY, JSON.stringify(d)); } catch {} }
  };

  // ── Helpers ──────────────────────────────────────────────────────
  const _uid  = () => Math.random().toString(36).slice(2, 10);
  const _ts   = () => new Date().toISOString();
  const _now  = () => Date.now();
  const _fmt  = ts => {
    const diff = Math.floor((_now() - new Date(ts).getTime()) / 1000);
    if (diff < 60)    return 'Just now';
    if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  // ── Category Config ───────────────────────────────────────────────
  const CATEGORIES = {
    progress:   { label: 'Progress Share', icon: '📈', color: '#10b981' },
    goal:       { label: 'Goal Achieved',  icon: '🎯', color: '#6366f1' },
    tip:        { label: 'Wellness Tip',   icon: '💡', color: '#f59e0b' },
    challenge:  { label: 'Challenge Win',  icon: '⚡', color: '#ef4444' },
    motivation: { label: 'Motivation',     icon: '💪', color: '#a855f7' },
    question:   { label: 'Question',       icon: '🤔', color: '#3b82f6' },
  };

  // ── Seed Posts (shown when storage is empty) ──────────────────────
  const SEED_POSTS = [
    {
      id: 's1', user: 'Sarah K.', avatar: 'SK', category: 'progress', anonymous: false,
      message: 'Just completed my 7-day streak! 🔥 The meditation task really helped me manage stress this week. Keep going everyone!',
      likes: 24, likedBy: [], trending: true,
      comments: [
        { id: 'c1', user: 'Mike R.',  text: 'Amazing! Consistency is everything.',    ts: new Date(Date.now() - 3600000).toISOString() },
        { id: 'c2', user: 'Priya M.', text: "That's inspiring! I'm on day 3 🙌",     ts: new Date(Date.now() - 1800000).toISOString() }
      ],
      ts: new Date(Date.now() - 7200000).toISOString()
    },
    {
      id: 's2', user: 'Anonymous', avatar: 'AN', category: 'tip', anonymous: true,
      message: 'Pro tip: drinking 500ml of water right when you wake up completely changed my energy levels. Try it for a week!',
      likes: 18, likedBy: [], trending: true,
      comments: [
        { id: 'c3', user: 'James L.', text: "I've been doing this for months — it works!", ts: new Date(Date.now() - 600000).toISOString() }
      ],
      ts: new Date(Date.now() - 10800000).toISOString()
    },
    {
      id: 's3', user: 'Dr. Wellness', avatar: 'DW', category: 'motivation', anonymous: false,
      message: "Reminder: Your wellness journey is unique. Don't compare your Chapter 1 to someone else's Chapter 10. Progress, not perfection. 🌱",
      likes: 41, likedBy: [], comments: [], trending: false,
      ts: new Date(Date.now() - 86400000).toISOString()
    },
    {
      id: 's4', user: 'Alex T.', avatar: 'AT', category: 'goal', anonymous: false,
      message: 'Finally hit my sleep goal 5 days in a row! 😴✅ The digital sunset at 8 PM made all the difference. Who else struggles with this?',
      likes: 15, likedBy: [], trending: false,
      comments: [
        { id: 'c4', user: 'Maya S.', text: 'Same here! No phone before bed = game changer', ts: new Date(Date.now() - 900000).toISOString() }
      ],
      ts: new Date(Date.now() - 43200000).toISOString()
    },
    {
      id: 's5', user: 'Community Bot', avatar: 'NW', category: 'challenge', anonymous: false,
      message: '🏆 Weekly Community Challenge: Complete your full daily plan 3 days in a row this week! Everyone who does earns the "Consistent" badge.',
      likes: 33, likedBy: [], comments: [], trending: true,
      ts: new Date(Date.now() - 172800000).toISOString()
    },
  ];

  // ── Public API ────────────────────────────────────────────────────
  return {
    CATEGORIES,

    /** Get all posts, sorted by recency or trending score */
    getPosts(sortBy = 'recent') {
      const data  = _store.get();
      const posts = (data.posts && data.posts.length > 0) ? data.posts : SEED_POSTS;
      if (sortBy === 'trending') {
        return [...posts].sort((a, b) => (b.likes + (b.comments || []).length) - (a.likes + (a.comments || []).length));
      }
      return [...posts].sort((a, b) => new Date(b.ts) - new Date(a.ts));
    },

    /** Create a new post */
    createPost(message, category = 'progress', anonymous = false, username = 'You') {
      if (!message || message.trim().length < 3) return null;
      const data     = _store.get();
      if (!data.posts || data.posts.length === 0) data.posts = [...SEED_POSTS];
      const initials = anonymous ? 'AN' : username.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
      const post = {
        id:        _uid(),
        user:      anonymous ? 'Anonymous' : username,
        avatar:    initials,
        category,  anonymous,
        message:   message.trim().slice(0, 500),
        likes:     0, likedBy: [], comments: [],
        ts:        _ts(), trending: false
      };
      data.posts = [post, ...data.posts].slice(0, 100);
      _store.set(data);
      return post;
    },

    /** Toggle like on a post (local userId 'local_user') */
    toggleLike(postId, userId = 'local_user') {
      const data = _store.get();
      if (!data.posts || data.posts.length === 0) data.posts = [...SEED_POSTS];

      // Find in stored posts or copy from seed
      let post = data.posts.find(p => p.id === postId);
      if (!post) {
        const seed = SEED_POSTS.find(p => p.id === postId);
        if (!seed) return null;
        post = { ...seed, likedBy: [] };
        data.posts = [post, ...data.posts];
      }

      if (!post.likedBy) post.likedBy = [];
      const liked = post.likedBy.includes(userId);
      if (liked) {
        post.likes   = Math.max(0, post.likes - 1);
        post.likedBy = post.likedBy.filter(u => u !== userId);
      } else {
        post.likes += 1;
        post.likedBy.push(userId);
      }
      _store.set(data);
      return { liked: !liked, likes: post.likes };
    },

    /** Add a comment to a post */
    addComment(postId, text, username = 'You') {
      if (!text || !text.trim()) return null;
      const data = _store.get();
      if (!data.posts || data.posts.length === 0) data.posts = [...SEED_POSTS];

      let post = data.posts.find(p => p.id === postId);
      if (!post) {
        const seed = SEED_POSTS.find(p => p.id === postId);
        if (!seed) return null;
        post = { ...seed };
        data.posts = [post, ...data.posts];
      }

      const comment = { id: _uid(), user: username, text: text.trim().slice(0, 300), ts: _ts() };
      if (!post.comments) post.comments = [];
      post.comments.push(comment);
      _store.set(data);
      return comment;
    },

    /** Get leaderboard (mix of simulated + local data) */
    getLeaderboard() {
      let myPts = 285;
      try { myPts = JSON.parse(localStorage.getItem('nw_engagement_v2') || '{}').points || 285; } catch {}

      const entries = [
        { user: 'Sarah K.',     avatar: 'SK', points: 1250, level: 6, streak: 21 },
        { user: 'Dr. Wellness', avatar: 'DW', points: 980,  level: 5, streak: 15 },
        { user: 'Alex T.',      avatar: 'AT', points: 720,  level: 4, streak: 8  },
        { user: 'Maya S.',      avatar: 'MS', points: 580,  level: 4, streak: 6  },
        { user: 'You',          avatar: 'ME', points: myPts, level: 3, streak: 5, isMe: true },
        { user: 'James L.',     avatar: 'JL', points: 310,  level: 3, streak: 3  },
        { user: 'Priya M.',     avatar: 'PM', points: 195,  level: 2, streak: 2  },
      ];
      return entries
        .sort((a, b) => b.points - a.points)
        .map((e, i) => ({ ...e, rank: i + 1 }));
    },

    /** Share a progress snapshot as a community post */
    shareProgress(engagementState, username = 'You') {
      const { points = 0, level = 1, streak = 0 } = engagementState || {};
      const msg = `🎯 Just hit Level ${level} with ${points} wellness points! 🔥 ${streak}-day streak and counting. Loving the NeuroWell journey! #WellnessWins`;
      return this.createPost(msg, 'progress', false, username);
    },

    /** Format a timestamp for display */
    formatTime: _fmt
  };
})();
