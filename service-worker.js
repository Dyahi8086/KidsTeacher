const CACHE_NAME = 'kids-teacher-v15'; // Version badal diya hai taaki purana cache clear ho jaye

const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './login.html',
  './manifest.json',
  './welcome_bg.png', 
  './login_frame.png', // Naya naam yahan bhi daal diya hai
  './icons/icon-192.png',
  './icons/icon-512.png'
];

// Install Event: Nayi files download karega
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

// Activate Event: Purana cache delete karega (Sabse Important)
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

  // External URLs ko ignore karega
  if (url.origin !== self.location.origin) return;

  // Images ke liye: Pehle Cache check karega, phir Network
  if (request.destination === 'image') {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(request).then((networkResponse) => {
          if (!networkResponse || networkResponse.status !== 200) {
             return networkResponse;
          }
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, networkResponse.clone());
            return networkResponse;
          });
        }).catch(() => {
          // Agar net nahi hai aur image cache me bhi nahi hai
          return new Response('', { status: 404, statusText: 'Image not found' });
        });
      })
    );
    return;
  }

  // Pages ke liye: Pehle Network check karega, phir Cache
  event.respondWith(
    fetch(request).catch(() => {
      return caches.match(request).then((cached) => {
        if (cached) return cached;
        if (request.mode === 'navigate') return caches.match('./index.html');
      });
    })
  );
});
