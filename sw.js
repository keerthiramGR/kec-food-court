// KEC Food Court Service Worker for Mobile PWA
const CACHE_NAME = 'kec-foodcourt-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './css/main.css',
  './css/splash.css',
  './css/portals.css',
  './js/app.js',
  './js/auth.js',
  './js/state.js',
  './js/data.js',
  './js/student.js',
  './js/owner.js',
  './js/admin.js',
  './js/bill.js',
  './js/countdown.js',
  './js/payment.js',
  './js/scanner.js',
  './js/splash.js',
  './js/html5-qrcode.min.js',
  './js/qrcode.bundle.js',
  './assets/logo.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE).catch(() => {});
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  // Ignore API requests so they can hit the live server / Supabase
  if (event.request.url.includes('/api/')) return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Fetch in background to revalidate cache
        fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, networkResponse));
          }
        }).catch(() => {});
        return cachedResponse;
      }
      return fetch(event.request).catch(() => caches.match('./index.html'));
    })
  );
});
