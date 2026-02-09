'use client'

import { useEffect } from 'react'

const SW_PATH = '/sw.js'

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!('serviceWorker' in navigator)) return

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
