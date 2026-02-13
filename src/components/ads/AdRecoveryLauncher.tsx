'use client'

import Link from 'next/link'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

type FlowMode = 'subscribe' | 'already-subscriber'

type LaunchState = 'checking' | 'ready' | 'waiting' | 'verified' | 'not-verified' | 'error'

type SubscriberStatusResponse = {
  authenticated: boolean
  adFree: boolean
  email: string | null
}

type PopupMessagePayload = {
  source: 'metro-memory-ad-recovery'
  flow: FlowMode
  status: 'redirecting-to-kofi' | 'verified' | 'not-verified' | 'error'
  message?: string
}

const POPUP_NAME = 'metro-memory-ad-recovery-popup'
const POPUP_FEATURES = 'popup=yes,width=520,height=760,resizable=yes,scrollbars=yes'
const POLL_INTERVAL_MS = 4_000
const POLL_TIMEOUT_MS = 10 * 60 * 1000

const FLOW_COPY: Record<FlowMode, { title: string; description: string }> = {
  subscribe: {
    title: 'Complete subscription in a new window',
    description:
      'Sign in first, then finish your Ko-fi payment in the pop-up. Ads hide automatically once your payment is confirmed.',
  },
  'already-subscriber': {
    title: 'Verify existing subscription in a new window',
    description:
      'Sign in first, then we will check if your account already has ad-free access.',
  },
}

function isPopupMessagePayload(data: unknown): data is PopupMessagePayload {
  if (!data || typeof data !== 'object') return false
  const payload = data as Partial<PopupMessagePayload>
  return (
    payload.source === 'metro-memory-ad-recovery' &&
    (payload.flow === 'subscribe' || payload.flow === 'already-subscriber') &&
    (payload.status === 'redirecting-to-kofi' ||
      payload.status === 'verified' ||
      payload.status === 'not-verified' ||
      payload.status === 'error')
  )
}

export default function AdRecoveryLauncher({ flow }: { flow: FlowMode }) {
  const [state, setState] = useState<LaunchState>('checking')
  const [statusMessage, setStatusMessage] = useState('Checking your account status...')
  const [popupBlocked, setPopupBlocked] = useState(false)
  const popupRef = useRef<Window | null>(null)
  const pollIntervalRef = useRef<number | null>(null)
  const pollStartedAtRef = useRef<number | null>(null)
  const { title, description } = useMemo(() => FLOW_COPY[flow], [flow])

  const stopPolling = useCallback(() => {
    if (pollIntervalRef.current !== null) {
      window.clearInterval(pollIntervalRef.current)
      pollIntervalRef.current = null
    }
    pollStartedAtRef.current = null
  }, [])

  const markVerified = useCallback(() => {
    stopPolling()
    setState('verified')
    setStatusMessage('Subscription detected. Ads are now hidden for this account.')
    if (popupRef.current && !popupRef.current.closed) {
      popupRef.current.close()
    }
    popupRef.current = null
  }, [stopPolling])

  const fetchSubscriberStatus = useCallback(async (): Promise<SubscriberStatusResponse> => {
    const response = await fetch('/api/ads/subscriber-status', { cache: 'no-store' })
    if (!response.ok) {
      throw new Error('subscriber-status-request-failed')
    }
    return (await response.json()) as SubscriberStatusResponse
  }, [])

  const pollSubscriberStatus = useCallback(async () => {
    try {
      const status = await fetchSubscriberStatus()
      if (status.adFree) {
        markVerified()
        return
      }

      if (
        pollStartedAtRef.current !== null &&
        Date.now() - pollStartedAtRef.current >= POLL_TIMEOUT_MS
      ) {
        stopPolling()
        setState('not-verified')
        setStatusMessage(
          'No payment has been confirmed yet. If you just paid, wait a minute and then retry.',
        )
      }
    } catch {
      stopPolling()
      setState('error')
      setStatusMessage('Unable to verify subscription status right now. Please retry.')
    }
  }, [fetchSubscriberStatus, markVerified, stopPolling])

  const startPolling = useCallback(() => {
    stopPolling()
    pollStartedAtRef.current = Date.now()
    void pollSubscriberStatus()
    pollIntervalRef.current = window.setInterval(() => {
      void pollSubscriberStatus()
    }, POLL_INTERVAL_MS)
  }, [pollSubscriberStatus, stopPolling])

  const openPopup = useCallback(() => {
    const popup = window.open(
      `/support/ad-recovery/popup?flow=${encodeURIComponent(flow)}`,
      POPUP_NAME,
      POPUP_FEATURES,
    )

    if (!popup) {
      setPopupBlocked(true)
      setState('ready')
      setStatusMessage('Popup blocked. Use the button below to open the sign-in window.')
      return
    }

    popupRef.current = popup
    popup.focus()
    setPopupBlocked(false)
    setState('waiting')
    setStatusMessage(
      flow === 'subscribe'
        ? 'Finish login and payment in the pop-up window.'
        : 'Finish login in the pop-up window so we can verify your access.',
    )

    if (flow === 'subscribe') {
      startPolling()
    }
  }, [flow, startPolling])

  useEffect(() => {
    function handleMessage(event: MessageEvent<unknown>) {
      if (event.origin !== window.location.origin) return
      if (!isPopupMessagePayload(event.data)) return
      if (event.data.flow !== flow) return

      if (event.data.status === 'redirecting-to-kofi') {
        setState('waiting')
        setStatusMessage('Login complete. Finish your Ko-fi payment in the pop-up window.')
        if (flow === 'subscribe') {
          startPolling()
        }
        return
      }

      if (event.data.status === 'verified') {
        markVerified()
        return
      }

      if (event.data.status === 'not-verified') {
        if (flow === 'already-subscriber') {
          stopPolling()
        }
        setState('not-verified')
        setStatusMessage(
          'No qualifying donation was found on this account. Use the subscribe option if needed.',
        )
        return
      }

      setState('error')
      setStatusMessage(event.data.message ?? 'Something went wrong in the pop-up flow.')
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [flow, markVerified, startPolling, stopPolling])

  useEffect(() => {
    let active = true

    const initialize = async () => {
      try {
        const status = await fetchSubscriberStatus()
        if (!active) return

        if (status.adFree) {
          markVerified()
          return
        }

        setState('ready')
        setStatusMessage(
          flow === 'subscribe'
            ? 'Open a new window to sign in, then complete Ko-fi checkout.'
            : 'Open a new window to sign in and verify your existing support status.',
        )

        openPopup()
      } catch {
        if (!active) return
        setState('error')
        setStatusMessage('Unable to initialize subscription recovery right now.')
      }
    }

    void initialize()

    return () => {
      active = false
      stopPolling()
    }
  }, [fetchSubscriberStatus, flow, markVerified, openPopup, stopPolling])

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-12 sm:px-6">
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">{title}</h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">{description}</p>

        <div className="mt-6 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800/60 dark:text-zinc-200">
          {statusMessage}
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          {(state === 'ready' || popupBlocked || state === 'not-verified' || state === 'error') && (
            <button
              type="button"
              onClick={openPopup}
              className="rounded-full bg-zinc-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              Open login window
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              void pollSubscriberStatus()
            }}
            className="rounded-full border border-zinc-300 px-5 py-2 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            Recheck status
          </button>

          {state === 'verified' && (
            <Link
              href="/metro-memory"
              className="rounded-full border border-emerald-300 bg-emerald-50 px-5 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100 dark:border-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200 dark:hover:bg-emerald-900/50"
            >
              Return to Metro Memory
            </Link>
          )}
        </div>

        <p className="mt-6 text-xs text-zinc-500 dark:text-zinc-400">
          Keep this tab open while you complete the pop-up flow so we can detect updates automatically.
        </p>
      </div>
    </div>
  )
}
