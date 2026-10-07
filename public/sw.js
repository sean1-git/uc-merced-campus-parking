// Bump this version for asset changes so installed copies replace their cached UI.
const CACHE_NAME = 'campus-parking-v26';
const APP_FILES = [
  '/uc-merced-logo.png',
  '/',
  '/index.html',
  '/styles.css',
  '/app.js',
  '/parking-data.mjs',
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

  // Cache only the UI; cached parking responses could present old counts as fresh.
  if (APP_FILES.includes(url.pathname)) {
    event.respondWith(getAppFile(request));
  }
});
