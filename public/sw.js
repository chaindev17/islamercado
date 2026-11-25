/* IslaMercado — Service Worker ligero
   - Estáticos inmutables (/_next/...): cache-first
   - Navegación: network-first con fallback a /offline
   - Imágenes locales: cache-first
   - Supabase y otros orígenes: nunca se interceptan */
const VERSION = "islamercado-v1";
const PRECACHE = [
  "/",
  "/offline",
  "/manifest.webmanifest",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/hero-malecon.jpg",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(VERSION)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return; // Supabase, etc.

  if (url.pathname.startsWith("/_next/")) {
    event.respondWith(cacheFirst(request));
    return;
  }
  if (request.mode === "navigate") {
    event.respondWith(networkFirstPage(request));
    return;
  }
  if (request.destination === "image") {
    event.respondWith(cacheFirst(request));
    return;
  }
  // Resto (RSC, etc.): red directa
});

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const res = await fetch(request);
    if (res.ok) {
      const cache = await caches.open(VERSION);
      cache.put(request, res.clone());
    }
    return res;
  } catch {
    return new Response("", { status: 504, statusText: "Offline" });
  }
}

async function networkFirstPage(request) {
  try {
    const res = await fetch(request);
    if (res.ok) {
      const cache = await caches.open(VERSION);
      cache.put(request, res.clone());
    }
    return res;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    return caches.match("/offline");
  }
}
