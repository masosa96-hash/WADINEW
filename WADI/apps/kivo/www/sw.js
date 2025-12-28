const CACHE_NAME = "kivo-v9";
const urlsToCache = [
  "./",
  "./index.html",
  "./style.css",
  "./script.js",
  "./firebase-config.js",
  "./manifest.json",
  "./favicon.ico",
  "./assets/icon-192.png",
  "./assets/icon-512.png",
  "./assets/kivo-icon.png",
  "./assets/pop.mp3",
];

self.addEventListener("install", (event) => {
  self.skipWaiting(); // Force waiting service worker to become active
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

self.addEventListener("activate", (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      ).then(() => self.clients.claim()); // Take control of all clients immediately
    })
  );
});
