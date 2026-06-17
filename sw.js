const CACHE_NAME = 'sungmanfc-cache-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/css/theme.css',
  '/css/main.css',
  '/css/components.css',
  '/js/data.js',
  '/js/community.js',
  '/js/app.js',
  '/assets/stadium_bg.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache and pre-caching assets');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') {
    return;
  }

  const url = new URL(event.request.url);
  const isLocalAsset = url.origin === self.location.origin && ASSETS_TO_CACHE.includes(url.pathname);

  if (event.request.mode === 'navigate' || isLocalAsset) {
    event.respondWith(
      caches.match(event.request)
        .then((cachedResponse) => {
          if (cachedResponse) {
            fetch(event.request).then((networkResponse) => {
              if (networkResponse && networkResponse.status === 200) {
                caches.open(CACHE_NAME).then((cache) => {
                  cache.put(event.request, networkResponse.clone())
                    .catch(err => console.error('Cache put failed:', err));
                });
              }
            }).catch(() => {});
            return cachedResponse;
          }
          return fetch(event.request);
        })
        .catch(() => fetch(event.request))
    );
  }
});
