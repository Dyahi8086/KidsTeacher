const CACHE_NAME = 'kids-teacher-v31'; // Version badal diya hai

const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './login.html',
  './age-select.html',
  './index-home.html',
  './manifest.json',
  './welcome_bg.png', 
  './login_bg.png', // Nayi image yahan cache hogi
  './icons/icon-192.png',
  './icons/icon-512.png'
];

// Install Event (Nayi files download karega)
self.addEventListener('install', (event) => {
  self.skipWaiting(); // Force update
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return Promise.all(
        ASSETS_TO_CACHE.map(url => {
          return cache.add(url).catch(err => console.log('Failed to cache:', url, err));
        })
      );
    })
  );
});

// Activate Event (Purana cache delete karega)
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('Deleting old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Event
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // External images (Firebase/Google) ko cache mat karo
  if (url.origin !== self.location.origin) return;

  // Image ke liye Cache-First (Purani image na dikhe, iske liye Network-First use karenge)
  if (request.destination === 'image') {
    event.respondWith(
      fetch(request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200) return networkResponse;
        return caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, networkResponse.clone());
          return networkResponse;
        });
      }).catch(() => {
        // Agar net nahi hai, toh cache se do
        return caches.match(request);
      })
    );
    return;
  }

  // Pages ke liye Network-First
  event.respondWith(
    fetch(request).catch(() => {
      return caches.match(request).then((cached) => {
        if (cached) return cached;
        if (request.mode === 'navigate') return caches.match('./index.html');
      });
    })
  );
});
