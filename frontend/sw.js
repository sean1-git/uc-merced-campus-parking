// Retire the old worker so returning visitors stop seeing cached installation UI.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    for (const name of names) {
      if (name.startsWith('campus-parking-')) await caches.delete(name);
    }
    await self.registration.unregister();
    const pages = await self.clients.matchAll({type: 'window'});
    for (const page of pages) await page.navigate(page.url);
  })());
});
