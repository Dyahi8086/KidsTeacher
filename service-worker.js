const CACHE_NAME = 'kids-teacher-v3'; // Version change kiya hai (v1 se v3)

self.addEventListener('install', (event) => {
  self.skipWaiting(); // Force update
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache); // Purana cache delete karega
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Network se naya laane ki koshish karega, nahi mila toh cache se dega
  event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
});
