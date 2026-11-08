// Version badal do taaki purana cache delete ho jaye
const CACHE_NAME = 'kids-teacher-v3'; 

// Kin files ko save karna hai (offline ke liye)
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './login.html',
    './age-select.html',
    './index-home.html',
    './welcome_bg.png',
    './manifest.json',
    './icons/icon-192.png',
    './icons/icon-512.png'
];

// Install hone par files save karo
self.addEventListener('install', (event) => {
    self.skipWaiting(); // Turant activate karo
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
});

// Purana cache delete karo
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
            );
        })
    );
    self.clients.claim(); // Sabhi open tabs ko update karo
});

// Internet na ho toh cache se dikhao, warna naya laao
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
                // Agar cache mein hai, toh background mein naya download karo
                fetch(event.request).then((networkResponse) => {
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, networkResponse);
                    });
                }).catch(() => {});
                return cachedResponse;
            }
            return fetch(event.request);
        })
    );
});
