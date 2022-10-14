// import {Api} from './static/js/api.js';
importScripts(
    'static/js/db.js',
)

let cacheName = 'operator';
let filesToCache = [
    '/index.html',
    '/static/css/app.css'
];

/* Start the service worker and cache the app's content */
self.addEventListener('install', function(e) {
    Database.connect();
    e.waitUntil(
        caches.open(cacheName).then(function(cache) {
            return cache.addAll(filesToCache);
    }).catch(err => console.log(err))
  );
});

self.addEventListener('activate', function (e) {
    e.waitUntil(self.clients.claim());

    // Api.ttp.manifest().then(manifest => {
    //         console.log(manifest)
    //         });
})


self.addEventListener('fetch', function(e) {
    e.respondWith((async () => {
        const url = new URL(e.request.url);
        if (url.pathname.startsWith('/dcf')) {
            return fetchDCF(e.request, url.pathname);
        }
        if (url.pathname.startsWith('/manifest')) {
            return fetchManifest(e.request, url.pathname);
        }

        const cachedMatch = await caches.match(e.request);
        if (cachedMatch) return cachedMatch;

        console.log('[FETCH] went to server:', url.pathname);
        return fetch(e.request);
    })());
});

async function fetchDCF(request, path) {
    switch (request.method) {
        case 'GET':
            return Database.get(path).then((value) => {
                console.log('[FETCH/GET] responding from cache:', value);
                return new Response(JSON.stringify(value));
            }).catch((err) => {
                console.log('[FETCH/GET] not in cache. Going to server:', path);
                return fetch(request);
            })
        case 'POST':
            return fetch(request.clone()).then((async (resp) => {
                let dcf = {
                    key: path,
                    code: (await request.json()).code
                }
                Database.set(dcf);
                console.log('[FETCH/POST] wrote to server then cache:', path);
                return resp;
            }));
        case 'DELETE':
            return fetch(request).then(resp => {
                Database.delete(path)
                console.log('[FETCH/DELETE] deleted from server and cache:', path);
                return resp;
            });
    }
}

async function fetchManifest(request, path) {
    switch (request.method) {
        case 'GET':
            if (path === '/manifest') {
                return Database.getObjects('/manifest/0', '/manifest/z').then((objs) => {
                    console.log('[FETCH/GET] responding from cache:', objs);
                    return new Response(JSON.stringify(objs));
                }).catch((err) => {
                    console.log('[FETCH/GET] not in cache. Going to server:', path);
                    return fetch(request);
                })
            }

            return Database.get(path).then((ttp) => {
                let id = path.split('/')[2];
                return Database.getKeys(`/dcf/${id}_0`, `/dcf/${id}_z`).then((keys) => {
                    ttp.dcf = keys.map(k => k.split('/').pop());
                    console.log('[FETCH/GET] responding from cache:', ttp);
                    return new Response(JSON.stringify(ttp));
                })
            }).catch((err) => {
                console.log('[FETCH/GET] not in cache. Going to server:', path);
                return fetch(request);
            })
        case 'PUT':
            // SOmething weird happening -not sure if my code, but after PUTing a new ttp, the GETs think the id is undefined
            return fetch(request.clone()).then((async (resp) => {
                let dcf = await request.json();
                console.log(dcf)
                let ttp = {
                    key : `${path}/${dcf.id}`,
                    id : dcf.id,
                    name : dcf.name,
                    tags : dcf.tags,
                }
                await Database.set(ttp);
                console.log('[FETCH/PUT] wrote to server then cache:', resp);
                return resp;
            }));
        case 'DELETE':
            return fetch(request).then(resp => {
                Database.delete(path)
                console.log('[FETCH/DELETE] deleted from server and cache:', path);
                return resp;
            });
    }
}
