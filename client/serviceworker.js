importScripts('js/db.js')

let cacheName = 'operator';
let filesToCache = [
    '/index.html',
    '/static/css/app.css'
];

/* Start the service worker and cache the app's content */
self.addEventListener('install', function(e) {
    console.log('----- SERVICE WORKER INSTALL ---')

    // Database.connect();

    e.waitUntil(
        caches.open(cacheName).then(function(cache) {
            return cache.addAll(filesToCache);
    }).catch(err => console.log(err))
  );
});

/* Serve cached content when offline */
self.addEventListener('fetch', function(e) {
    console.log('Handling fetch event for', e.request.url);
    e.respondWith(
        caches.match(e.request).then(function(response) {
            return response || fetch(e.request);
        })
    );
});

self.addEventListener('activate', function (e) {
    console.log('----- SERVICE WORKER ACTIVATE ---')
    // Database.doSomeThings();
    e.waitUntil(self.clients.claim().then(console.log('SW claimed client!')));
    // console.log('----- SW CLAIMED CLIENT ---')
})