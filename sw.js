const CACHE_NAME = 'imagenie-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  // Add other critical assets here if they are not dynamically loaded 
  // or if you want them to be available offline immediately.
  // For ESM modules loaded from esm.sh, browser caching and service worker
  // interaction can be complex. For now, we focus on app shell.
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .catch(err => {
        console.error('Failed to open cache or add URLs:', err);
      })
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

self.addEventListener('fetch', event => {
  // For navigation requests, try network first, then cache.
  // For other requests, try cache first, then network.
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => caches.match(event.request))
        .catch(() => caches.match('/index.html')) // Fallback for SPA
    );
  } else {
     event.respondWith(
      caches.match(event.request)
        .then(response => {
          // Cache hit - return response
          if (response) {
            return response;
          }
          // Not in cache - fetch from network
          return fetch(event.request).then(
            networkResponse => {
              // Check if we received a valid response
              if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                // Don't cache opaque responses (e.g. from CDNs without CORS) unless necessary
                // and if we know it's safe. For esm.sh, it should be fine if they set CORS headers.
                return networkResponse;
              }

              // IMPORTANT: Clone the response. A response is a stream
              // and because we want the browser to consume the response
              // as well as the cache consuming the response, we need
              // to clone it so we have two streams.
              const responseToCache = networkResponse.clone();

              // Only cache GET requests
              if (event.request.method === 'GET') {
                caches.open(CACHE_NAME)
                  .then(cache => {
                    cache.put(event.request, responseToCache);
                  });
              }
              return networkResponse;
            }
          ).catch(error => {
            console.error('Fetching failed:', error);
            // Optionally, return a fallback offline page or resource here
            // For instance, if it's an image, return a placeholder.
            // if (event.request.destination === 'image') {
            //   return caches.match('/assets/offline-placeholder.png');
            // }
            // throw error; // Re-throw if you don't have a fallback
          });
        })
    );
  }
});
