'use client'

import { useMemo } from 'react'

import { useAuth } from '@/context/AuthContext'
import useOnlineStatus from '@/hooks/useOnlineStatus'

export type AdGateReason =
  | 'offline'
  | 'user-ad-free'
  | 'loading-user'
  | 'allowed'

/**
 * Centralizes the business rules for whether ads should render.
 * - Suppresses ads when offline.
 * - Suppresses ads for users marked adFree.
 * - Waits for auth loading to finish to avoid flicker.
 */
export function useShouldShowAds() {
  const { user, loading } = useAuth()
  const online = useOnlineStatus()

  return useMemo(() => {
    if (!online) {
      return { showAds: false, reason: 'offline' as AdGateReason }
    }
    if (loading) {
      return { showAds: false, reason: 'loading-user' as AdGateReason }
    }
    if (user?.adFree) {
      return { showAds: false, reason: 'user-ad-free' as AdGateReason }
    }
    return { showAds: true, reason: 'allowed' as AdGateReason }
  }, [loading, online, user])
}

export default useShouldShowAds
