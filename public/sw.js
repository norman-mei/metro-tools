const CACHE_NAME = 'metro-memory-v2'
const OFFLINE_MANIFEST_URL = '/offline-manifest.json'
const CORE_ASSETS = [
  '/',
  '/manifest.webmanifest',
  '/icon-192.png',
  '/icon-512.png',
  OFFLINE_MANIFEST_URL,
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME)
      await cache.addAll(CORE_ASSETS)

      try {
        const res = await fetch(OFFLINE_MANIFEST_URL, { cache: 'no-store' })
        if (res.ok) {
          const manifest = await res.json()
          const assets = Array.isArray(manifest?.assets)
            ? manifest.assets
            : Array.isArray(manifest)
              ? manifest
              : []
          if (assets.length > 0) {
            await cache.addAll(assets)
          }
        }
      } catch (error) {
        console.warn('SW: skipping offline manifest', error)
      }

      await self.skipWaiting()
    })(),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys()
      await Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key)),
      )
      await self.clients.claim()
    })(),
  )
})

async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME)
  const match = await cache.match(request)
  if (match) return match

  const response = await fetch(request)
  cache.put(request, response.clone())
  return response
}

async function networkFirst(request) {
  const cache = await caches.open(CACHE_NAME)
  try {
    const response = await fetch(request)
    cache.put(request, response.clone())
    return response
  } catch (error) {
    const match = await cache.match(request)
    if (match) return match
    throw error
  }
}

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return

  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return

  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(cacheFirst(request))
    return
  }

  if (
    url.pathname.startsWith('/city-data') ||
    url.pathname.startsWith('/city-icons') ||
    url.pathname.startsWith('/images')
  ) {
    event.respondWith(cacheFirst(request))
    return
  }

  if (request.mode === 'navigate' || url.pathname === '/') {
    event.respondWith(
      networkFirst(request).catch(async () => {
        const cache = await caches.open(CACHE_NAME)
        const fallback = await cache.match('/')
        return fallback || Response.error()
      }),
    )
    return
  }
})
