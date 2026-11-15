/* Happy Ducklings Board: offline cache.
   After the first visit the board keeps working if the classroom Wi-Fi drops.
   Bump CACHE when you publish new files so the TV picks them up. */
var CACHE = "hda-board-v2";
var CORE = ["./", "index.html", "manifest.webmanifest", "assets/sfx.js",
  "assets/fonts/fredoka-500.woff2", "assets/fonts/fredoka-600.woff2", "assets/fonts/fredoka-700.woff2",
  "assets/fonts/nunito-800.woff2", "assets/fonts/nunito-900.woff2"];

self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(CORE); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (ks) {
    return Promise.all(ks.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

/* Audio players ask for byte ranges; answer them from the cached file. */
function ranged(req, res) {
  var h = req.headers.get("range"); if (!h || !res || res.status !== 200) return res;
  return res.arrayBuffer().then(function (buf) {
    var m = /bytes=(\d*)-(\d*)/.exec(h) || [], size = buf.byteLength;
    var start = m[1] ? +m[1] : 0, end = m[2] ? Math.min(+m[2], size - 1) : size - 1;
    if (!m[1] && m[2]) { start = Math.max(0, size - +m[2]); end = size - 1; }
    if (start >= size) return new Response(null, { status: 416, headers: { "Content-Range": "bytes */" + size } });
    return new Response(buf.slice(start, end + 1), { status: 206, statusText: "Partial Content", headers: {
      "Content-Type": res.headers.get("Content-Type") || "application/octet-stream",
      "Content-Range": "bytes " + start + "-" + end + "/" + size, "Content-Length": String(end - start + 1), "Accept-Ranges": "bytes" } });
  });
}
self.addEventListener("fetch", function (e) {
  var req = e.request, url = new URL(req.url);
  if (req.method !== "GET" || url.origin !== location.origin) return;
  var key = new Request(url.href);                       // cache whole files, without the Range header
  e.respondWith(caches.open(CACHE).then(function (c) {
    return c.match(key, { ignoreSearch: true }).then(function (hit) {
      var net = fetch(key).then(function (res) { if (res && res.status === 200) c.put(key, res.clone()); return res; });
      if (hit) { net.catch(function () {}); return ranged(req, hit); }   // serve cached, refresh in the background
      if (req.headers.get("range")) { net.catch(function () {}); return fetch(req); }   // first play: stream now, cache meanwhile
      return net.then(function (res) { return res.clone(); });
    });
  }));
});
