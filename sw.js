const BUILD_VERSION = "__BUILD_VERSION__";
const SHELL_CACHE = `setline-shell-${BUILD_VERSION}`;
const GIF_CACHE = "setline-gifs-v1";
const SHELL_FILES = [
  "./",
  "./index.html",
  "./catalog.html",
  "./assets/consultation/catalog.json",
  "./assets/consultation/catalog.js",
  "./assets/consultation/IMG_5502.jpeg",
  "./assets/consultation/IMG_5505.jpeg",
  "./assets/consultation/IMG_5508.jpeg",
  "./manifest.webmanifest",
  "./assets/icons/icon.svg",
  "./assets/icons/icon-192.png",
  "./assets/icons/icon-512.png",
  "./assets/icons/icon-maskable-512.png",
  "./assets/icons/apple-touch-icon.png",
  "./assets/shoulder/h-wall.gif",
  "./assets/shoulder/h-wall.jpg",
  "./assets/shoulder/h-band.gif",
  "./assets/shoulder/h-band.jpg",
  "./assets/shoulder/h-angels.gif",
  "./assets/shoulder/h-angels.jpg",
  "./assets/shoulder/h-stick.gif",
  "./assets/shoulder/h-stick.jpg",
  "./assets/shoulder/h-halo.gif",
  "./assets/shoulder/h-halo.jpg"
];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(SHELL_CACHE).then(cache => cache.addAll(SHELL_FILES)));
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys
        .filter(key => key.startsWith("setline-shell-") && key !== SHELL_CACHE)
        .map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("message", event => {
  if (event.data?.type === "SKIP_WAITING") self.skipWaiting();
});

async function networkFirst(request) {
  const cache = await caches.open(SHELL_CACHE);
  // Keep the reference page separate from the training shell in offline storage.
  const page = new URL(request.url).pathname.endsWith("/catalog.html") ? "./catalog.html" : "./index.html";
  try {
    const response = await fetch(request);
    if (response.ok) await cache.put(page, response.clone());
    return response;
  } catch (_) {
    return (await cache.match(request)) || (await cache.match(page)) || Response.error();
  }
}

async function cacheFirstGif(request) {
  const cache = await caches.open(GIF_CACHE);
  const cached = await cache.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok || response.type === "opaque") await cache.put(request, response.clone());
    return response;
  } catch (_) {
    return Response.error();
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(SHELL_CACHE);
  const cached = await cache.match(request);
  const network = fetch(request)
    .then(response => {
      if (response.ok) cache.put(request, response.clone());
      return response;
    })
    .catch(() => null);
  if (cached) return cached;
  return (await network) || Response.error();
}

self.addEventListener("fetch", event => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);

  if (request.mode === "navigate") {
    event.respondWith(networkFirst(request));
    return;
  }

  if (url.hostname === "cdn.jsdelivr.net" && url.pathname.includes("ExerciseGymGifsDB")) {
    event.respondWith(cacheFirstGif(request));
    return;
  }

  if (url.origin === self.location.origin) event.respondWith(staleWhileRevalidate(request));
});
