// Change the version when updating any file in APP_FILES.
const CACHE_NAME = 'campus-parking-v5';
const APP_FILES = [
  '/',
  '/index.html',
  '/styles.css',
  '/app.js',
  '/pwa.js',
  '/manifest.webmanifest',
  '/icon-32.png',
  '/icon-192.png',
  '/icon-512.png',
];

async function saveAppFiles() {
  const cache = await caches.open(CACHE_NAME);
  await cache.addAll(APP_FILES);
  await self.skipWaiting();
}

async function removeOldCaches() {
  const cacheNames = await caches.keys();
  for (const name of cacheNames) {
    if (name.startsWith('campus-parking-') && name !== CACHE_NAME) {
      await caches.delete(name);
    }
  }
  await self.clients.claim();
}

async function getParkingCounts(request) {
  const cache = await caches.open(CACHE_NAME);

  // Try the server first. Use the saved response if it cannot be reached.
  try {
    const response = await fetch(request, {signal: AbortSignal.timeout(3500)});
    if (!response.ok) throw new Error('Parking counts unavailable');
    await cache.put('/api/lots', response.clone());
    return response;
  } catch {
    const savedResponse = await cache.match('/api/lots');
    if (!savedResponse) {
      return new Response(JSON.stringify({error: 'No saved counts'}), {
        status: 503,
        headers: {'Content-Type': 'application/json'},
      });
    }

    // Tell the dashboard these counts came from storage, not the server.
    const headers = new Headers(savedResponse.headers);
    headers.set('X-Parking-Offline', '1');
    return new Response(await savedResponse.arrayBuffer(), {headers});
  }
}

async function getAppFile(request) {
  const cache = await caches.open(CACHE_NAME);
  const path = new URL(request.url).pathname;
  const savedFile = await cache.match(path);
  return savedFile || fetch(request);
}

self.addEventListener('install', (event) => {
  event.waitUntil(saveAppFiles());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(removeOldCaches());
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;

  if (url.pathname === '/api/lots') {
    event.respondWith(getParkingCounts(request));
  } else if (APP_FILES.includes(url.pathname)) {
    event.respondWith(getAppFile(request));
  }
});

