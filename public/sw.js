// VyaparGlass Service Worker (PWA Offline Shell Engine)
// IMPORTANT: Sensitive business data, PINs, customer records, and invoices are stored
// exclusively in IndexedDB (Dexie) and are NEVER stored in this service worker cache.

const CACHE_NAME = 'vyaparglass-shell-v1';

// Core Application Shell URLs required to bootstrap offline
const PRECACHE_ASSETS = [
  '/',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/maskable-icon-512.png',
  '/icons/icon.svg',
];

// Install Event: Pre-cache app shell assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => {
        // Activate worker immediately
        return self.skipWaiting();
      })
      .catch((err) => {
        console.warn('[SW] Pre-caching encountered an issue:', err);
      })
  );
});

// Activate Event: Clean up old stale caches and claim clients
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((name) => {
            if (name !== CACHE_NAME) {
              console.log('[SW] Purging old cache version:', name);
              return caches.delete(name);
            }
          })
        );
      })
      .then(() => {
        return self.clients.claim();
      })
  );
});

// Fetch Event: Safe caching strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 1. Never intercept or cache non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // 2. Never cache API routes or dynamic server calls
  if (url.pathname.startsWith('/api/')) {
    return;
  }

  // 3. Navigation Requests (Page Visits): Network-First with Cache Fallback
  // Ensures user gets latest build when online, but can boot from cached shell when offline
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, clone);
            });
          }
          return networkResponse;
        })
        .catch(async () => {
          // If offline, retrieve cached app shell from '/'
          const cachedResponse = await caches.match(request);
          if (cachedResponse) {
            return cachedResponse;
          }
          const shellFallback = await caches.match('/');
          if (shellFallback) {
            return shellFallback;
          }
          return new Response('VyaparGlass is offline. Please launch the app once while connected.', {
            status: 503,
            headers: { 'Content-Type': 'text/plain' },
          });
        })
    );
    return;
  }

  // 4. Static Assets (_next/static, icons, fonts): Cache-First with Network Revalidation
  if (
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.startsWith('/icons/') ||
    url.pathname === '/manifest.json'
  ) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          // Fetch update in background (Stale-While-Revalidate)
          fetch(request)
            .then((networkResponse) => {
              if (networkResponse && networkResponse.status === 200) {
                caches.open(CACHE_NAME).then((cache) => {
                  cache.put(request, networkResponse);
                });
              }
            })
            .catch(() => {});
          return cachedResponse;
        }

        return fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, clone);
            });
          }
          return networkResponse;
        });
      })
    );
    return;
  }

  // 5. Default Fallback
  event.respondWith(
    caches.match(request).then((cached) => cached || fetch(request))
  );
});

// Message Event: Allow client to trigger SKIP_WAITING when an update is available
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
