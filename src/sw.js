// PWA Service Worker - Offline-first architecture

const CACHE_NAME = 'psy-looper-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/css/looper.css',
  '/src/looper-device.js',
  '/src/slice-engine.js',
  '/src/analyzer.js',
  '/src/generator.js',
  '/worklets/looper-engine.js',
  '/worklets/fx-processor.js'
];

// Install event - cache assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch event - network-first strategy
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Clone the response
        const responseToCache = response.clone();
        
        // Cache the fetched response
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        
        return response;
      })
      .catch(() => {
        // Fall back to cache
        return caches.match(event.request);
      })
  );
});
