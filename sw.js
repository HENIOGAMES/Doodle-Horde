// network first, and always ask the server for the newest copy (skips the browser's own short-term cache),
// so a fresh upload shows up the next time the game is opened; falls back to the last copy when offline
const CACHE = 'doodle-horde-v3';
self.addEventListener('install', e => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const same = new URL(e.request.url).origin === location.origin;
  e.respondWith(fetch(same ? new Request(e.request, {cache: 'no-cache'}) : e.request).then(r => {
    if (r.ok && same){ const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); }
    return r;
  }).catch(() => caches.match(e.request).then(r => r || caches.match('./index.html'))));
});
// tapping a join alert brings the game back to the front (or opens it)
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(self.clients.matchAll({type: 'window', includeUncontrolled: true}).then(list => {
    for (const c of list) if ('focus' in c) return c.focus();
    return self.clients.openWindow ? self.clients.openWindow('./') : null;
  }));
});
