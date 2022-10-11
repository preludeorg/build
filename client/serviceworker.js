let cacheName = 'operator';
let filesToCache = [
    '/index.html',
    '/static/css/app.css'
];

/* Start the service worker and cache the app's content */
self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(cacheName).then(function(cache) {
      return cache.addAll(filesToCache);
    })
  );
  console.log("---SW INSTALLED---")
});

/* Serve cached content when offline */
self.addEventListener('fetch', function(e) {
    console.log('[FETCH]', e.request.url)
  e.respondWith(
    caches.match(e.request).then(function(response) {
      return response || fetch(e.request);
    })
  );
});

self.addEventListener('activate', function(e) {
    self.clients.claim().then(() => console.log('CLAIMED'))
})