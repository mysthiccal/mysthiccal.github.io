/* Service worker de Coreano conversacional.
   - La caché lleva la versión de la app: al publicar una versión nueva se crea otra caché y la anterior se borra al activarla.
   - La versión nueva NO se activa sola: espera a que la persona pulse «Actualizar» en la app (así nunca se corta una lección).
   - El progreso no vive aquí (vive en IndexedDB/localStorage), por eso actualizar la app no lo toca. */
const VER = '2026.09.19-2335', CACHE = 'kr-' + VER;
const FILES = ["./", "index.html", "manifest.webmanifest", "icons/icon-192.png", "icons/icon-512.png", "icons/maskable-512.png", "icons/apple-touch-icon.png", "icons/favicon-32.png"];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => Promise.all(FILES.map(u =>
    fetch(new Request(u, { cache: 'reload' })).then(r => { if (!r.ok) throw new Error('No se pudo descargar ' + u); return c.put(u, r); })))));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.indexOf('kr-') === 0 && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('message', e => { if (e.data && e.data.type === 'SKIP_WAITING') self.skipWaiting(); });
self.addEventListener('fetch', e => {
  const req = e.request; if (req.method !== 'GET') return;
  const url = new URL(req.url); if (url.origin !== location.origin) return;
  e.respondWith(caches.open(CACHE).then(c => c.match(req, { ignoreSearch: true })).then(hit => {
    if (hit) return hit;
    if (req.mode === 'navigate') return caches.open(CACHE).then(c => c.match('index.html'));
    return fetch(req);
  }));
});
