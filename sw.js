/**
 * NEUROWELL - Service Worker
 * Provides offline capability, asset caching, and background sync.
 * Strategy: Cache-First for static assets, Network-First for API calls.
 */

const SW_VERSION   = 'nw-v1.2.0';
const CACHE_STATIC = `${SW_VERSION}-static`;
const CACHE_PAGES  = `${SW_VERSION}-pages`;

// ── Assets to pre-cache on install ───────────────────────────────────
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/dashboard.html',
  '/assessment.html',
  '/intelligence-module/index.html',
  '/personalization/index.html',
  '/engagement/index.html',
  '/auth/login.html',
  '/auth/signup.html',
  '/css/main.css',
  '/css/intelligence.css',
  '/css/personalization.css',
  '/css/engagement.css',
  '/css/auth.css',
  '/js/utils.js',
  '/js/storage.js',
  '/js/scoring.js',
  '/js/insights.js',
  '/js/prediction.js',
  '/js/analysis.js',
  '/js/wellnessPredictionEngine.js',
  '/js/coreIntelligence.js',
  '/js/goalEngine.js',
  '/js/emotionAI.js',
  '/js/planGenerator.js',
  '/js/engagementGamification.js',
  '/js/communitySystem.js',
  '/js/wellnessCoach.js',
  '/js/firebaseService.js',
  '/js/alertSystem.js',
  '/js/recommendationEngine.js',
  '/data/constants.js',
  '/data/questions.js',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
];

// ── External CDN resources to cache ──────────────────────────────────
const PRECACHE_CDN = [
  'https://cdn.jsdelivr.net/npm/chart.js@3.9.1/dist/chart.min.js',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap',
];

// ── INSTALL: Pre-cache all static assets ─────────────────────────────
self.addEventListener('install', event => {
  console.log('[SW] Installing:', SW_VERSION);
  event.waitUntil(
    Promise.all([
      // Local assets
      caches.open(CACHE_STATIC).then(cache =>
        cache.addAll(PRECACHE_ASSETS.map(url => new Request(url, { cache: 'reload' })))
          .catch(err => console.warn('[SW] Pre-cache partial failure:', err))
      ),
      // CDN assets (best-effort — don't block install)
      caches.open(CACHE_STATIC).then(cache =>
        Promise.allSettled(PRECACHE_CDN.map(url => cache.add(url)))
      )
    ]).then(() => self.skipWaiting())
  );
});

// ── ACTIVATE: Remove stale caches ─────────────────────────────────────
self.addEventListener('activate', event => {
  console.log('[SW] Activating:', SW_VERSION);
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_STATIC && key !== CACHE_PAGES)
            .map(key => { console.log('[SW] Deleting stale cache:', key); return caches.delete(key); })
      )
    ).then(() => self.clients.claim())
  );
});

// ── FETCH: Routing strategy ────────────────────────────────────────────
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip: non-GET, chrome-extension, Firebase API calls
  if (request.method !== 'GET') return;
  if (url.protocol === 'chrome-extension:') return;
  if (url.hostname.includes('firebase') || url.hostname.includes('googleapis.com/firestore')) return;

  // Strategy 1: Cache-First for static assets (JS, CSS, fonts, images)
  if (_isStaticAsset(url)) {
    event.respondWith(_cacheFirst(request, CACHE_STATIC));
    return;
  }

  // Strategy 2: Network-First for HTML pages
  if (request.headers.get('Accept')?.includes('text/html')) {
    event.respondWith(_networkFirst(request, CACHE_PAGES));
    return;
  }

  // Strategy 3: Stale-While-Revalidate for everything else
  event.respondWith(_staleWhileRevalidate(request, CACHE_STATIC));
});

// ── Background Sync ───────────────────────────────────────────────────
self.addEventListener('sync', event => {
  if (event.tag === 'nw-sync-data') {
    event.waitUntil(_syncUserData());
  }
});

// ── Push Notifications ────────────────────────────────────────────────
self.addEventListener('push', event => {
  const data = event.data?.json() || { title: 'NeuroWell', body: 'New wellness insight available.' };
  event.waitUntil(
    self.registration.showNotification('NeuroWell — ' + data.title, {
      body:    data.body,
      icon:    '/icons/icon-192.png',
      badge:   '/icons/icon-72.png',
      tag:     'nw-push',
      vibrate: [200, 100, 200],
      data:    { url: data.url || '/dashboard.html' }
    })
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const url = event.notification.data?.url || '/dashboard.html';
  event.waitUntil(clients.openWindow(url));
});

// ── Cache Strategies ──────────────────────────────────────────────────

async function _cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return _offlineFallback(request);
  }
}

async function _networkFirst(request, cacheName) {
  try {
    const response = await fetch(request, { signal: AbortSignal.timeout(5000) });
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    return cached || _offlineFallback(request);
  }
}

async function _staleWhileRevalidate(request, cacheName) {
  const cached = await caches.match(request);
  const fetchPromise = fetch(request).then(response => {
    if (response.ok) {
      caches.open(cacheName).then(cache => cache.put(request, response.clone()));
    }
    return response;
  }).catch(() => null);
  return cached || await fetchPromise || _offlineFallback(request);
}

function _offlineFallback(request) {
  if (request.headers.get('Accept')?.includes('text/html')) {
    return caches.match('/index.html');
  }
  return new Response('Offline — NeuroWell is cached for offline use.', {
    status: 503, headers: { 'Content-Type': 'text/plain' }
  });
}

function _isStaticAsset(url) {
  return /\.(js|css|png|jpg|jpeg|svg|ico|woff2?|ttf|gif|webp)$/.test(url.pathname)
    || url.hostname.includes('fonts.googleapis.com')
    || url.hostname.includes('fonts.gstatic.com')
    || url.hostname.includes('cdn.jsdelivr.net')
    || url.hostname.includes('gstatic.com');
}

async function _syncUserData() {
  // Background sync stub — used when connectivity is restored
  // In production: flush localStorage queue to Firestore
  console.log('[SW] Background sync triggered');
}
