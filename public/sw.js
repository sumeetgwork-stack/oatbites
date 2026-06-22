// Oatbites PWA Service Worker v2.0
// Handles: Push Notifications, Offline Caching, Background Sync

const CACHE_NAME = 'oatbites-v1';
const STATIC_ASSETS = [
  '/',
  '/logo.png',
  '/manifest.json',
];

// Install: Pre-cache critical assets
self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate: Clean old caches
self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (cacheNames) {
      return Promise.all(
        cacheNames
          .filter(function (name) { return name !== CACHE_NAME; })
          .map(function (name) { return caches.delete(name); })
      );
    }).then(function () {
      return self.clients.claim();
    })
  );
});

// Fetch: Network-first with cache fallback
self.addEventListener('fetch', function (event) {
  // Skip non-GET and API requests
  if (event.request.method !== 'GET') return;
  if (event.request.url.includes('/api/')) return;

  event.respondWith(
    fetch(event.request)
      .then(function (response) {
        // Cache successful responses
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(function (cache) {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(function () {
        // Serve from cache if offline
        return caches.match(event.request).then(function (cachedResponse) {
          if (cachedResponse) return cachedResponse;
          // Fallback to homepage for navigation requests
          if (event.request.mode === 'navigate') {
            return caches.match('/');
          }
        });
      })
  );
});

// Push Notifications
self.addEventListener('push', function (event) {
  const data = event.data ? event.data.json() : {};

  const options = {
    body: data.body || 'You have a new notification from Oatbites!',
    icon: '/logo.png',
    badge: '/logo.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/',
    },
    actions: data.actions || [],
    tag: data.tag || 'oatbites-notification',
    renotify: true,
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'Oatbites by SEJ', options)
  );
});

// Notification Click
self.addEventListener('notificationclick', function (event) {
  event.notification.close();

  const url = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clientList) {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      return clients.openWindow(url);
    })
  );
});
