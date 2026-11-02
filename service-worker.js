// Version change kiya hai taaki force update ho jaye
const CACHE_NAME = 'kids-teacher-v5'; 

// Yeh files cache hongi taaki app fast chale aur offline bhi kaam kare
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './login.html',
  './welcome_bg.png',
  './book_logo.png',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

// 1. Install Event
self.addEventListener('install', (event) => {
  self.skipWaiting(); // Naya service worker turant active ho jaye
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Safe Caching: Agar koi ek image missing bhi ho, toh app crash na ho
      return Promise.all(
        ASSETS_TO_CACHE.map(url => {
          return cache.add(url).catch(err => console.log('Failed to cache:', url, err));
        })
      );
    })
  );
});

// 2. Activate Event (Sabse Important - Purana Cache Delete Karega)
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          // Agar purana cache milta hai, toh usko delete kar do
          if (cache !== CACHE_NAME) {
            console.log('Deleting old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim(); // Turant control le lo
});

// 3. Fetch Event
self.addEventListener('fetch', (event) => {
  event.respondWith(
    // Pehle internet se laane ki koshish karo (Network First)
    fetch(event.request).then((response) => {
      return response;
    }).catch(() => {
      // Agar internet nahi hai, toh cache se do
      return caches.match(event.request);
    })
  );
});
