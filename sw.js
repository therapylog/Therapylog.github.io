/* TherapyLog service worker — offline shell + notification display. */
const CACHE = 'therapylog-v3';
const PRECACHE = [
  '/app.html',
  '/manifest.webmanifest',
  '/vendor/chart.umd.min.js',
  '/icons/icon.svg',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(PRECACHE)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

/* Network-first for same-origin requests so deployed updates always win;
   cached copy is the offline fallback. Cross-origin (fonts, CDN) passes through. */
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== self.location.origin) return;
  event.respondWith(
    fetch(event.request)
      .then((resp) => {
        if (resp && resp.ok) {
          const copy = resp.clone();
          caches.open(CACHE).then((cache) => cache.put(event.request, copy));
        }
        return resp;
      })
      .catch(() =>
        caches.match(event.request).then((hit) => {
          if (hit) return hit;
          /* Offline navigation falls back to the app shell only for app routes.
             Public pages (/tools/..., /markers/..., /about/) are ordinary
             documents; serving them the app shell offline rendered the tracker
             under the wrong URL. Crawlers do not run service workers, so this
             was never an indexing problem — it was a UX one. */
          const isApp = new URL(event.request.url).pathname.startsWith('/app');
          return event.request.mode === 'navigate' && isApp ? caches.match('/app.html') : undefined;
        })
      )
  );
});

/* Pages post {type:'SHOW_NOTIFICATION', title, options} — required on installed PWAs,
   where calling new Notification() from the page throws. */
self.addEventListener('message', (event) => {
  const msg = event.data;
  if (msg && msg.type === 'SHOW_NOTIFICATION') {
    self.registration.showNotification(msg.title, msg.options || {});
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if (client.url.includes('/app.html') && 'focus' in client) return client.focus();
      }
      return self.clients.openWindow('/app.html');
    })
  );
});

/* Ready for server-sent Web Push if a push backend is added later. */
self.addEventListener('push', (event) => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch (e) { data = { body: event.data && event.data.text() }; }
  event.waitUntil(
    self.registration.showNotification(data.title || 'TherapyLog', {
      body: data.body || 'You have a dose reminder.',
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      tag: data.tag || 'therapylog-push'
    })
  );
});
