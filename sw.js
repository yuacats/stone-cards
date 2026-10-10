// 更新したら CACHE の番号を上げてください(v1 → v2 …)
const CACHE = "stone-cards-v1";
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./html2canvas.min.js",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/apple-touch-icon.png"
];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  // ページ本体はネット優先(更新を早く反映)、オフラインならキャッシュ
  if (e.request.mode === "navigate") {
    e.respondWith(
      fetch(e.request)
        .then(res => { const copy = res.clone(); caches.open(CACHE).then(c => c.put("./index.html", copy)); return res; })
        .catch(() => caches.match("./index.html"))
    );
    return;
  }
  // それ以外はキャッシュ優先
  e.respondWith(caches.match(e.request).then(hit => hit || fetch(e.request)));
});
