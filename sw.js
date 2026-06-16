const CACHE_NAME = 'live-notes-cache-v1';
const ASSETS_TO_CACHE = [
  '/live/',
  '/live',
  '/live.html',
  '/assets/ico/favicon.ico',
  '/assets/ico/192.png',
  '/assets/ico/512.png'
];

// Install Event
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] Pre-caching offline assets');
        // Use individual add with catch to prevent install failure on local dev server where /live/ doesn't exist
        return Promise.all(
          ASSETS_TO_CACHE.map(url => {
            return cache.add(url).catch(err => {
              console.warn('[Service Worker] Failed to cache asset:', url, err);
            });
          })
        );
      })
      .then(() => self.skipWaiting())
  );
});

// Activate Event
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('[Service Worker] Removing old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event (Network-First with Cache Fallback)
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  // Prevent caching non-http/https requests (like chrome-extension://, data:)
  const url = new URL(event.request.url);
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return;

  // Do not attempt to cache dynamic database/API calls
  const isDynamicAPI = url.hostname.includes('firebaseio.com') ||
                        url.hostname.includes('api.pexels.com') ||
                        url.hostname.includes('script.google.com');

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Cache successful GET responses (both basic same-origin and cors cross-origin requests like bootstrap)
        if (!isDynamicAPI && response && (response.status === 200 || response.status === 0)) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache).catch(err => {
              console.warn('[Service Worker] Cache put failed for:', event.request.url, err);
            });
          });
        }
        return response;
      })
      .catch(() => {
        // If fetch fails, try to return from cache
        return caches.match(event.request).then(cachedResponse => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // Return offline state if request is for the main page
          if (event.request.mode === 'navigate') {
            return caches.match('/live/') || caches.match('/live') || caches.match('/live.html');
          }
        });
      })
  );
});
