
/* ==========================================
   KIDS TEACHER PWA SERVICE WORKER
   Optimized installation and caching
========================================== */

const CACHE_NAME = "kids-teacher-v33";

const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];

/* ==========================================
   INSTALL
   Cache only essential app files
========================================== */

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);

      // Cache essential files individually.
      // Missing files will not block the entire installation.
      await Promise.all(
        APP_SHELL.map(async (url) => {
          try {
            const response = await fetch(url);

            if (response.ok && response.type !== "opaque") {
              await cache.put(url, response);
            }
          } catch (error) {
            console.warn("Cache skipped:", url);
          }
        })
      );

      // Activate the new worker without waiting for old pages.
      await self.skipWaiting();
    })()
  );
});

/* ==========================================
   ACTIVATE
   Remove old Kids Teacher caches
========================================== */

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const cacheNames = await caches.keys();

      await Promise.all(
        cacheNames.map(async (name) => {
          if (
            name.startsWith("kids-teacher-") &&
            name !== CACHE_NAME
          ) {
            await caches.delete(name);
          }
        })
      );

      await self.clients.claim();
    })()
  );
});

/* ==========================================
   FETCH
========================================== */

self.addEventListener("fetch", (event) => {
  const request = event.request;

  // Only handle GET requests.
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Ignore external requests.
  if (url.origin !== self.location.origin) return;

  // Ignore Firebase authentication and API requests.
  if (
    url.pathname.includes("/__/auth/") ||
    url.pathname.includes("/api/")
  ) {
    return;
  }

  /* ========================================
     HTML NAVIGATION
     Network first, cached fallback
  ======================================== */

  if (request.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          const response = await fetch(request);

          if (response.ok) {
            const cache = await caches.open(CACHE_NAME);

            // Store a copy of the successful page.
            await cache.put(request, response.clone());

            return response;
          }

          throw new Error("Network response failed");

        } catch (error) {
          const cached = await caches.match(request);

          if (cached) return cached;

          // Offline fallback to cached homepage.
          const home = await caches.match("./index.html");

          if (home) return home;

          return new Response(
            "Kids Teacher is offline. Please connect to the internet.",
            {
              status: 503,
              headers: {
                "Content-Type": "text/plain; charset=utf-8"
              }
            }
          );
        }
      })()
    );

    return;
  }

  /* ========================================
     IMAGES, CSS, JS AND OTHER STATIC FILES
     Cache first, network fallback
  ======================================== */

  event.respondWith(
    (async () => {
      const cached = await caches.match(request);

      if (cached) {
        return cached;
      }

      try {
        const response = await fetch(request);

        if (response.ok && response.type !== "opaque") {
          const cache = await caches.open(CACHE_NAME);

          // Cache only same-origin static assets.
          await cache.put(request, response.clone());
        }

        return response;

      } catch (error) {
        return new Response(
          "This resource is unavailable offline.",
          {
            status: 503,
            headers: {
              "Content-Type": "text/plain; charset=utf-8"
            }
          }
        );
      }
    })()
  );
});
