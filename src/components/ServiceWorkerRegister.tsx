'use client'

import { useEffect } from 'react'

const SW_PATH = '/sw.js'

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!('serviceWorker' in navigator)) return

    if (process.env.NODE_ENV !== 'production') {
      // Prevent stale cached bundles from masking local city/config updates in dev.
      const cleanup = async () => {
        const regs = await navigator.serviceWorker.getRegistrations()
        await Promise.all(regs.map((reg) => reg.unregister()))
        if ('caches' in window) {
          const keys = await caches.keys()
          await Promise.all(
            keys
              .filter((key) => key.startsWith('metro-memory-'))
              .map((key) => caches.delete(key)),
          )
        }
      }
      cleanup().catch((error) => {
        console.error('Service worker cleanup failed', error)
      })
      return
    }

    const register = async () => {
      try {
        await navigator.serviceWorker.register(SW_PATH, { scope: '/' })
      } catch (error) {
        console.error('Service worker registration failed', error)
      }
    }

    register()
  }, [])

  return null
}
