// Dental Scan Viewer: offline support. Everything the app needs is on this site, so nothing outside is required.
// The app page is fetched fresh when online (so updates arrive at once) and served from the cache when offline;
// libraries and icons are served from the cache first.
const VERSION='dsv-2026-10-15b';
const SHELL=['./','./index.html','./manifest.webmanifest','./icons/icon-192.png','./icons/icon-512.png','./icons/apple-touch-icon.png',
  './lib/three.min.js','./lib/OrbitControls.js','./lib/STLLoader.js','./lib/PLYLoader.js','./lib/OBJLoader.js','./lib/BufferGeometryUtils.js'];
self.addEventListener('install',e=>{
  e.waitUntil(caches.open(VERSION).then(c=>Promise.all(SHELL.map(u=>c.add(u).catch(()=>{})))).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==VERSION).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',e=>{
  const req=e.request; if(req.method!=='GET') return;
  const url=new URL(req.url); if(url.origin!==location.origin) return;
  if(req.mode==='navigate'||/\/(index\.html)?$/.test(url.pathname)){
    e.respondWith(fetch(req).then(r=>{ if(r.ok){ const copy=r.clone(); caches.open(VERSION).then(c=>c.put('./index.html',copy)); } return r; })
      .catch(()=>caches.match('./index.html')));
    return;
  }
  e.respondWith(caches.match(req).then(hit=>hit||fetch(req).then(r=>{ if(r.ok){ const copy=r.clone(); caches.open(VERSION).then(c=>c.put(req,copy)); } return r; })));
});
