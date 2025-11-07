// sw.js
const PWAServiceWorker = (() => {
  const CACHE_NAME = 'app-cache-v1';

  function onInstall(event) {
    console.log('Service Worker installing.');
    // Uncomment to force immediate activation
    // self.skipWaiting();
  }

  function onActivate(event) {
    console.log('Service Worker activated.');
    event.waitUntil(
      caches.keys().then(keys =>
        Promise.all(
          keys
            .filter(key => key !== CACHE_NAME)
            .map(key => caches.delete(key))
        )
      )
    );
    // Uncomment to claim control immediately after activation
    // event.waitUntil(self.clients.claim());
  }

  async function fetchHandler(event) {
    try {
      return await fetch(event.request);
    } catch {
      return caches.match(event.request);
    }
  }

  return {
    install: onInstall,
    activate: onActivate,
    fetch: fetchHandler
  };
})();

self.addEventListener('install', PWAServiceWorker.install);
self.addEventListener('activate', PWAServiceWorker.activate);
self.addEventListener('fetch', event => {
  event.respondWith(PWAServiceWorker.fetch(event));
});
