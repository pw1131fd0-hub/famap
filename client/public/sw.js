// FamMap Service Worker - Offline Maps Support
const TILE_CACHE = 'famap-tiles-v1';
const API_CACHE = 'famap-api-v1';
const MAX_TILE_ENTRIES = 500;
const TILE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

// OSM tile URL pattern
const TILE_URL_PATTERN = /tile\.openstreetmap\.org/;
const API_URL_PATTERN = /\/api\//;

self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      // Clean up old caches
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(name => name !== TILE_CACHE && name !== API_CACHE)
            .map(name => caches.delete(name))
        );
      }),
    ])
  );
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Handle map tile requests (CacheFirst strategy)
  if (TILE_URL_PATTERN.test(url.hostname)) {
    event.respondWith(handleTileRequest(event.request));
    return;
  }

  // Handle API requests (NetworkFirst strategy)
  if (API_URL_PATTERN.test(url.pathname)) {
    event.respondWith(handleApiRequest(event.request));
    return;
  }
});

async function handleTileRequest(request) {
  const cache = await caches.open(TILE_CACHE);
  const cachedResponse = await cache.match(request);

  if (cachedResponse) {
    // Check if tile is still fresh
    const dateHeader = cachedResponse.headers.get('sw-cached-at');
    if (dateHeader) {
      const cachedAt = parseInt(dateHeader, 10);
      if (Date.now() - cachedAt < TILE_MAX_AGE_MS) {
        return cachedResponse;
      }
    } else {
      return cachedResponse;
    }
  }

  try {
    const networkResponse = await fetch(request.clone());
    if (networkResponse.ok) {
      // Add timestamp header to track freshness
      const headers = new Headers(networkResponse.headers);
      headers.set('sw-cached-at', Date.now().toString());
      const responseToCache = new Response(await networkResponse.clone().blob(), {
        status: networkResponse.status,
        statusText: networkResponse.statusText,
        headers,
      });
      await pruneCache(cache, MAX_TILE_ENTRIES);
      await cache.put(request, responseToCache);
    }
    return networkResponse;
  } catch (error) {
    // Offline: return cached tile even if stale
    if (cachedResponse) return cachedResponse;
    return new Response('', { status: 503, statusText: 'Offline' });
  }
}

async function handleApiRequest(request) {
  // Only cache GET requests
  if (request.method !== 'GET') {
    return fetch(request);
  }

  try {
    const networkResponse = await fetch(request.clone());
    if (networkResponse.ok) {
      const cache = await caches.open(API_CACHE);
      await cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    // Offline: return cached API response
    const cache = await caches.open(API_CACHE);
    const cachedResponse = await cache.match(request);
    if (cachedResponse) return cachedResponse;
    return new Response(JSON.stringify({ error: 'Offline', message: 'No cached data available' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

async function pruneCache(cache, maxEntries) {
  const keys = await cache.keys();
  if (keys.length >= maxEntries) {
    // Delete oldest 10% of entries
    const toDelete = keys.slice(0, Math.ceil(maxEntries * 0.1));
    await Promise.all(toDelete.map(key => cache.delete(key)));
  }
}
