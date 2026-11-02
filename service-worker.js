const CACHE_NAME = 'kids-teacher-v1';
const ASSETS_TO_CACHE = [
  '/KidsTeacher/',
  '/KidsTeacher/index.html',
  '/KidsTeacher/login.html',
  '/KidsTeacher/manifest.json',
  '/KidsTeacher/welcome_bg.png',
  '/KidsTeacher/book_logo.png',
  '/KidsTeacher/icons/icon-192x192.png',
  '/KidsTeacher/icons/icon-512x512.png',
  '/KidsTeacher/icons/icon-maskable-512x512.png'
];

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

self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});
