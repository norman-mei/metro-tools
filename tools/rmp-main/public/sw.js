// Cleanup worker for stale localhost service worker registrations.
// This prevents legacy cached dev clients from interfering with Next Turbopack HMR.
self.addEventListener('install', () => {
    self.skipWaiting();
});

self.addEventListener('activate', event => {
    event.waitUntil(
        (async () => {
            try {
                const keys = await caches.keys();
                await Promise.all(keys.map(key => caches.delete(key)));
            } catch {
                // Ignore cache API failures.
            }

            await self.registration.unregister();

            const clients = await self.clients.matchAll({
                type: 'window',
                includeUncontrolled: true,
            });
            for (const client of clients) {
                // Force a reload so pages detach from any stale worker state.
                client.navigate(client.url);
            }
        })()
    );
});

self.addEventListener('fetch', () => {
    // Intentionally empty.
});
