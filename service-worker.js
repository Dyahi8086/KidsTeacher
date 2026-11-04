const CACHE_NAME = 'kids-teacher-v7'; // Version badhaya hai taaki naya cache bane

const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './login.html',
  './manifest.json',
  './welcome_bg.png', // Nayi photo cache hogi
  './login_bg.png',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

// Install Event (Pre-cache images)
self.addEventListener('install', (event) => {
  self.skipWaiting();
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

// Activate Event (Purana cache delete)
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Event (Cache-First for images, Network-First for pages)
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // External images (Firebase/Google) ko cache mat karo
  if (url.origin !== self.location.origin) return;

  // Agar image request hai, toh pehle cache se do (Offline support)
  if (request.destination === 'image') {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) return cachedResponse;
        return fetch(request).then((networkResponse) => {
          if (!networkResponse || networkResponse.status !== 200) return networkResponse;
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, networkResponse.clone());
            return networkResponse;
          });
        }).catch(() => {
          // Agar net nahi hai aur image cache me bhi nahi hai, toh kuch mat bhejo (CSS fallback dikhega)
          return new Response('', { status: 404, statusText: 'Image not found' });
        });
      })
    );
    return;
  }

  // Baaki pages ke liye Network-First
  event.respondWith(
    fetch(request).catch(() => {
      return caches.match(request).then((cached) => {
        if (cached) return cached;
        if (request.mode === 'navigate') return caches.match('./index.html');
      });
    })
  );
});
