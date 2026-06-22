const CACHE_NAME = "mo-admin-cache-v1";
const OFFLINE_URL = "/admin/offline";

const ASSETS_TO_CACHE = [
  "/admin/offline",
  "/favicon.ico",
  "/manifest.json",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png"
];

// 1. Install - Cache Shell
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Admin SW: Caching Shell");
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// 2. Activate - Cleanup old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// 3. Fetch - Cache First for assets, Network First for admin routes
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle all requests within the scope (now root)
  if (url.origin !== self.location.origin) return;

  // For navigate requests (pages), try network then fallback to offline
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() => {
        return caches.match(OFFLINE_URL) || caches.match("/");
      })
    );
    return;
  }

  // For other assets, use Cache First strategy
  event.respondWith(
    caches.match(request).then((response) => {
      return response || fetch(request).then((networkResponse) => {
        // Cache successful responses for next time
        if (networkResponse && networkResponse.status === 200) {
          const cacheCopy = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, cacheCopy));
        }
        return networkResponse;
      });
    })
  );
});

// 4. Import Firebase Messaging Logic
// We import the existing firebase worker logic here so both work in one worker
importScripts("/firebase-messaging-sw.js");
