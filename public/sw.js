// ─── WealthPath Service Worker ───
const CACHE_NAME = "wealthpath-v1";
const STATIC_CACHE = "wealthpath-static-v1";

// Static assets to pre-cache
const PRECACHE_URLS = [
  "/dashboard",
  "/manifest.json",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
];

// Install: pre-cache shell
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME && key !== STATIC_CACHE)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Fetch: stale-while-revalidate for pages, cache-first for static
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Skip non-GET and API requests
  if (event.request.method !== "GET") return;
  if (url.pathname.startsWith("/api/")) return;

  // Static assets: cache-first
  if (
    url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|woff|woff2|ico)$/) ||
    url.pathname.startsWith("/icons/") ||
    url.pathname.startsWith("/_next/static/")
  ) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached;
        return fetch(event.request).then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(STATIC_CACHE).then((cache) => cache.put(event.request, clone));
          }
          return response;
        });
      })
    );
    return;
  }

  // Pages: stale-while-revalidate
  event.respondWith(
    caches.match(event.request).then((cached) => {
      const fetchPromise = fetch(event.request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => {
          // Offline fallback — return cached dashboard
          if (cached) return cached;
          return caches.match("/dashboard");
        });

      return cached || fetchPromise;
    })
  );
});

// Listen for sync events (queued task completions)
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-tasks") {
    event.waitUntil(syncQueuedTasks());
  }
});

async function syncQueuedTasks() {
  // In production: read from IndexedDB and POST to API
  console.log("[SW] Syncing queued tasks...");
}
