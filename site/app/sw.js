// Cuilvor service worker: cache the shell, network-first for freshness
const C = 'cuilvor-v5';
self.addEventListener('install', e => { self.skipWaiting();
  e.waitUntil(caches.open(C).then(c => c.addAll(['/app/', '/app/manifest.json']))); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== C).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || !e.request.url.includes('/app')) return;
  e.respondWith(fetch(e.request).then(r => { const cp = r.clone(); caches.open(C).then(c => c.put(e.request, cp)); return r; })
    .catch(() => caches.match(e.request)));
});
