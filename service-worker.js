const CACHE_NAME = 'kids-teacher-v1';

// Important files jo offline save hongi
const ASSETS_TO_CACHE = [
  '/KidsTeacher/',
  '/KidsTeacher/login.html',
  '/KidsTeacher/index.html',
  '/KidsTeacher/manifest.json',
  '/KidsTeacher/login_bg.png',
  '/KidsTeacher/icons/icon-192.png',
  '/KidsTeacher/icons/icon-512.png'
];

// Install Event
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Safe caching: agar koi ek file miss ho toh error na aaye
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
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Event (Network first, offline hone par cache se dega)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});
