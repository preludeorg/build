let cacheName = 'operator';
let filesToCache = [
    '/static/templates/index.html',
    '/static/css/style.css',
    '/static/js/main.js'
];

/* Start the service worker and cache the app's content */
self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(cacheName).then(function(cache) {
      return cache.addAll(filesToCache);
    })
  );
});

/* Serve cached content when offline */
self.addEventListener('fetch', function(e) {
  e.respondWith(
    caches.match(e.request).then(function(response) {
      return response || fetch(e.request);
    })
  );
});