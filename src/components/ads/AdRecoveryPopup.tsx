'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react'

type FlowMode = 'subscribe' | 'already-subscriber'

type SubscriberStatusResponse = {
  authenticated: boolean
  adFree: boolean
  email: string | null
}

type LoginFormState = {
  email: string
  password: string
  rememberMe: boolean
}

const DEFAULT_KOFI_URL = 'https://ko-fi.com/normanmei'
const KOFI_SUBSCRIBE_URL = process.env.NEXT_PUBLIC_KOFI_SUBSCRIBE_URL ?? DEFAULT_KOFI_URL

function resolveFlow(value: string | null): FlowMode {
  return value === 'already-subscriber' ? 'already-subscriber' : 'subscribe'
}

export default function AdRecoveryPopup() {
  const searchParams = useSearchParams()
  const flow = useMemo<FlowMode>(() => resolveFlow(searchParams.get('flow')), [searchParams])
  const [loading, setLoading] = useState(true)
  const [loginForm, setLoginForm] = useState<LoginFormState>({
    email: '',
    password: '',
    rememberMe: true,
  })
  const [loginSubmitting, setLoginSubmitting] = useState(false)
  const [loginError, setLoginError] = useState<string | null>(null)
  const [message, setMessage] = useState('Checking your account...')
  const [needsLogin, setNeedsLogin] = useState(false)

  const postToParent = useCallback(
    (status: 'redirecting-to-kofi' | 'verified' | 'not-verified' | 'error', nextMessage?: string) => {
      if (!window.opener || window.opener.closed) return
      window.opener.postMessage(
        {
          source: 'metro-memory-ad-recovery',
          flow,
          status,
          message: nextMessage,
        },
        window.location.origin,
      )
    },
    [flow],
  )

  const fetchSubscriberStatus = useCallback(async (): Promise<SubscriberStatusResponse> => {
    const response = await fetch('/api/ads/subscriber-status', { cache: 'no-store' })
    if (!response.ok) {
      throw new Error('subscriber-status-request-failed')
    }
    return (await response.json()) as SubscriberStatusResponse
  }, [])

  const handleVerified = useCallback(() => {
    setLoading(false)
    setNeedsLogin(false)
    setMessage('Subscription verified. You can close this window.')
    postToParent('verified')
    window.setTimeout(() => {
      window.close()
    }, 800)
  }, [postToParent])

  const continueFlow = useCallback(
    (status: SubscriberStatusResponse) => {
      if (!status.authenticated) {
        setLoading(false)
        setNeedsLogin(true)
        setMessage('Please sign in to continue.')
        return
      }

      if (flow === 'subscribe') {
        setLoading(false)
        setNeedsLogin(false)
        setMessage('Login complete. Redirecting to Ko-fi...')
        postToParent('redirecting-to-kofi')
        window.setTimeout(() => {
          window.location.replace(KOFI_SUBSCRIBE_URL)
        }, 150)
        return
      }

      if (status.adFree) {
        handleVerified()
        return
      }

      setLoading(false)
      setNeedsLogin(false)
      const nextMessage = 'No qualifying donation is currently linked to this account.'
      setMessage(nextMessage)
      postToParent('not-verified', nextMessage)
    },
    [flow, handleVerified, postToParent],
  )

  const refreshAndContinue = useCallback(async () => {
    setLoading(true)
    setLoginError(null)
    try {
      const status = await fetchSubscriberStatus()
      continueFlow(status)
    } catch {
      setLoading(false)
      setNeedsLogin(false)
      const nextMessage = 'Unable to verify account status right now. Please retry.'
      setMessage(nextMessage)
      postToParent('error', nextMessage)
    }
  }, [continueFlow, fetchSubscriberStatus, postToParent])

  const handleLoginSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      setLoginSubmitting(true)
      setLoginError(null)

      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(loginForm),
        })

        const payload = await response.json().catch(() => ({} as { error?: string }))
        if (!response.ok) {
          setLoginSubmitting(false)
          setLoginError(payload?.error ?? 'Unable to sign in.')
          return
        }

        setLoginSubmitting(false)
        await refreshAndContinue()
      } catch {
        setLoginSubmitting(false)
        setLoginError('Unable to sign in right now. Please retry.')
      }
    },
    [loginForm, refreshAndContinue],
  )

  useEffect(() => {
    void refreshAndContinue()
  }, [refreshAndContinue])

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-8 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <div className="mx-auto w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h1 className="text-xl font-semibold">
          {flow === 'subscribe' ? 'Support Metro Memory' : 'Verify support status'}
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">{message}</p>

        {loading && (
          <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">Please wait...</p>
        )}

        {!loading && needsLogin && (
          <form className="mt-5 space-y-3" onSubmit={handleLoginSubmit}>
            <label className="block text-sm font-medium">
              Email
              <input
                type="email"
                required
                autoComplete="email"
                value={loginForm.email}
                onChange={(event) =>
                  setLoginForm((prev) => ({ ...prev, email: event.target.value }))
                }
                className="mt-1 w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              />
            </label>

            <label className="block text-sm font-medium">
              Password
              <input
                type="password"
                required
                autoComplete="current-password"
                value={loginForm.password}
                onChange={(event) =>
                  setLoginForm((prev) => ({ ...prev, password: event.target.value }))
                }
                className="mt-1 w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              />
            </label>

            <label className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-300">
              <input
                type="checkbox"
                checked={loginForm.rememberMe}
                onChange={(event) =>
                  setLoginForm((prev) => ({ ...prev, rememberMe: event.target.checked }))
                }
                className="h-4 w-4 rounded border-zinc-300"
              />
              Keep me signed in
            </label>

            {loginError && (
              <p className="rounded-lg border border-rose-300 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-800 dark:bg-rose-950/50 dark:text-rose-200">
                {loginError}
              </p>
            )}

            <button
              type="submit"
              disabled={loginSubmitting}
              className="w-full rounded-full bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-700 disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              {loginSubmitting ? 'Signing in...' : 'Sign in'}
            </button>

            <p className="text-center text-xs text-zinc-500 dark:text-zinc-400">
              Need an account?{' '}
              <Link href="/account" className="underline">
                Create one
              </Link>
            </p>
          </form>
        )}

        {!loading && !needsLogin && flow === 'already-subscriber' && (
          <div className="mt-5 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                void refreshAndContinue()
              }}
              className="rounded-full border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-100 dark:hover:bg-zinc-800"
            >
              Recheck status
            </button>
            <button
              type="button"
              onClick={() => window.close()}
              className="rounded-full border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-100 dark:hover:bg-zinc-800"
            >
              Close window
            </button>
          </div>
        )}
      </div>
    </main>
  )
}
