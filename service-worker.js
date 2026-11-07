const CACHE_NAME = 'kids-teacher-v82';   // version badha di

const ASSETS = [
    './',
    './index.html',
    './manifest.json',
    './login.html',
    './age-select.html',
    './index-home.html',
    './welcome_bg.png',
    './icons/icon-192.png',
    './icons/icon-512.png'
];

// Install - sab files cache me daal do
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return Promise.all(
                ASSETS.map(asset =>
                    cache.add(asset).catch(error => {
                        console.warn('Cache failed:', asset, error);
                    })
                )
            );
        }).then(() => self.skipWaiting())
    );
});

// Activate - purane cache delete
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames
                    .filter(name => name.startsWith('kids-teacher-') && name !== CACHE_NAME)
                    .map(name => caches.delete(name))
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch Strategy
self.addEventListener('fetch', event => {
    if (event.request.method !== 'GET') return;

    const url = new URL(event.request.url);

    // Images, icons, fonts etc. → Cache First (fast loading)
    const isStaticAsset = 
        url.pathname.match(/\.(png|jpg|jpeg|webp|svg|gif|ico|css|js|woff2?|ttf)$/i) ||
        ASSETS.some(asset => url.pathname.endsWith(asset.replace('./', '')));

    if (isStaticAsset) {
        event.respondWith(
            caches.match(event.request).then(cachedResponse => {
                if (cachedResponse) {
                    return cachedResponse;   // Instant from cache
                }

                // Cache me nahi hai to network se lao aur cache karo
                return fetch(event.request).then(networkResponse => {
                    if (networkResponse && networkResponse.status === 200) {
                        const copy = networkResponse.clone();
                        caches.open(CACHE_NAME).then(cache => {
                            cache.put(event.request, copy);
                        });
                    }
                    return networkResponse;
                }).catch(() => {
                    // Offline + cache miss
                    return new Response('Offline', { status: 503 });
                });
            })
        );
        return;
    }

    // HTML / Navigation → Network First
    event.respondWith(
        fetch(event.request)
            .then(response => {
                if (response && response.status === 200) {
                    const copy = response.clone();
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, copy);
                    });
                }
                return response;
            })
            .catch(() => {
                return caches.match(event.request).then(cachedResponse => {
                    if (cachedResponse) return cachedResponse;

                    // Offline navigation fallback
                    if (event.request.mode === 'navigate') {
                        return caches.match('./index.html');
                    }
                });
            })
    );
});
