'use client'

import { useSearchParams } from 'next/navigation'
import {
  type ChangeEvent,
  type FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'
import Image from 'next/image'

import { useAuth } from '@/context/AuthContext'
import { cities } from '@/lib/citiesConfig'
import { useLocalStorageValue } from '@react-hookz/web'
import { STATION_TOTALS } from '@/lib/stationTotals'

type SignupFormState = {
  email: string
  confirmEmail: string
  password: string
  confirmPassword: string
}

type SignupFormErrors = Partial<Record<keyof SignupFormState, string>>

type LoginFormState = {
  email: string
  password: string
  rememberMe: boolean
}

const citySlugMap = new Map(
  cities
    .map((city) => {
      if (!city.link.startsWith('/')) return null
      const slug = city.link.replace(/^\//, '').split(/[?#]/)[0]
      return [slug, city.name] as const
    })
    .filter((entry): entry is [string, string] => Boolean(entry)),
)

const initialSignup: SignupFormState = {
  email: '',
  confirmEmail: '',
  password: '',
  confirmPassword: '',
}

const initialLogin: LoginFormState = {
  email: '',
  password: '',
  rememberMe: false,
}

export default function AccountDashboard({ showHeading = true }: { showHeading?: boolean }) {
  const searchParams = useSearchParams()
  const verifiedState = searchParams.get('verified')

  const { user, loading, refresh, progressSummaries, logoutLocally } = useAuth()
  const [signupForm, setSignupForm] = useState<SignupFormState>(initialSignup)
  const [signupErrors, setSignupErrors] = useState<SignupFormErrors>({})
  const [signupStatus, setSignupStatus] = useState<'idle' | 'submitting' | 'success'>('idle')
  const [signupApiError, setSignupApiError] = useState<string | null>(null)
  const [resendStatus, setResendStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [resendMessage, setResendMessage] = useState<string | null>(null)
  const [showSignupPassword, setShowSignupPassword] = useState(false)
  const [showSignupConfirmPassword, setShowSignupConfirmPassword] = useState(false)
  const [loginForm, setLoginForm] = useState<LoginFormState>(initialLogin)
  const [loginStatus, setLoginStatus] = useState<'idle' | 'submitting' | 'success'>('idle')
  const [loginError, setLoginError] = useState<string | null>(null)
  const [showLoginPassword, setShowLoginPassword] = useState(false)
  const [emailForm, setEmailForm] = useState<{ newEmail: string; currentPassword: string }>({
    newEmail: '',
    currentPassword: '',
  })
  const [emailStatus, setEmailStatus] = useState<'idle' | 'submitting' | 'success'>('idle')
  const [emailMessage, setEmailMessage] = useState<string | null>(null)
  const [emailError, setEmailError] = useState<string | null>(null)
  const [passwordForm, setPasswordForm] = useState<{
    currentPassword: string
    newPassword: string
    confirmPassword: string
  }>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [passwordStatus, setPasswordStatus] = useState<'idle' | 'submitting' | 'success'>('idle')
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const {
    value: syncedOpenStored = false,
    set: setSyncedOpenStored,
  } = useLocalStorageValue<boolean>('mm-synced-cities-open', {
    defaultValue: false,
    initializeWithValue: false,
  })
  const [syncedOpen, setSyncedOpen] = useState<boolean>(syncedOpenStored)
  const [syncedSearch, setSyncedSearch] = useState('')
  const [syncedSort, setSyncedSort] = useState<'name-asc' | 'name-desc' | 'progress-desc' | 'progress-asc'>('name-asc')

  useEffect(() => {
    setSyncedOpen(syncedOpenStored)
  }, [syncedOpenStored])

  useEffect(() => {
    if (verifiedState === 'success') {
      setSignupStatus('success')
      setResendStatus('idle')
      setResendMessage('Email verified! You can now sign in.')
    } else if (verifiedState === 'error') {
      setResendMessage('The verification link is invalid or expired. Request a new one below.')
      setResendStatus('error')
    }
  }, [verifiedState])

  const passwordChecklist = useMemo(
    () => [
      { label: '8 or more characters', met: signupForm.password.length >= 8 },
      { label: 'At least one uppercase letter', met: /[A-Z]/.test(signupForm.password) },
      { label: 'At least one lowercase letter', met: /[a-z]/.test(signupForm.password) },
      { label: 'At least one special character', met: /[^A-Za-z0-9]/.test(signupForm.password) },
    ],
    [signupForm.password],
  )

  const handleSignupChange =
    (field: keyof SignupFormState) => (event: ChangeEvent<HTMLInputElement>) => {
      setSignupForm((prev) => ({ ...prev, [field]: event.target.value }))
      setSignupErrors((prev) => ({ ...prev, [field]: undefined }))
      setSignupApiError(null)
    }

  const handleLoginChange =
    (field: keyof LoginFormState) => (event: ChangeEvent<HTMLInputElement>) => {
      setLoginForm((prev) => ({
        ...prev,
        [field]: field === 'rememberMe' ? event.target.checked : event.target.value,
      }))
      setLoginError(null)
    }

  const validateSignup = (): SignupFormErrors => {
    const errors: SignupFormErrors = {}

    if (!signupForm.email) {
      errors.email = 'Email is required.'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signupForm.email)) {
      errors.email = 'Enter a valid email address.'
    }

    if (signupForm.confirmEmail !== signupForm.email) {
      errors.confirmEmail = 'Email addresses do not match.'
    }

    if (
      signupForm.password.length < 8 ||
      !/[A-Z]/.test(signupForm.password) ||
      !/[a-z]/.test(signupForm.password) ||
      !/[^A-Za-z0-9]/.test(signupForm.password)
    ) {
      errors.password = 'Password must meet all requirements.'
    }

    if (signupForm.confirmPassword !== signupForm.password) {
      errors.confirmPassword = 'Passwords do not match.'
    }

    return errors
  }

  const handleRegister = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSignupStatus('submitting')
    setSignupApiError(null)
    const validationErrors = validateSignup()

    if (Object.keys(validationErrors).length > 0) {
      setSignupErrors(validationErrors)
      setSignupStatus('idle')
      return
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: signupForm.email,
          password: signupForm.password,
          confirmPassword: signupForm.confirmPassword,
        }),
      })

      const payload = await response.json().catch(() => ({}))

      if (!response.ok) {
        setSignupApiError(payload?.error ?? 'Unable to create account. Please try again.')
        setSignupStatus('idle')
        return
      }

      setSignupStatus('success')
      setResendStatus('idle')
      setResendMessage(null)
    } catch (error) {
      console.error(error)
      setSignupApiError('Network error. Please try again.')
      setSignupStatus('idle')
    }
  }

  const handleResendVerification = async () => {
    if (!signupForm.email.trim()) {
      setResendStatus('error')
      setResendMessage('Enter your email above so we know where to send the link.')
      return
    }

    setResendStatus('sending')
    setResendMessage(null)

    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: signupForm.email }),
      })

      const payload = await response.json().catch(() => ({}))

      if (!response.ok) {
        setResendStatus('error')
        setResendMessage(
          payload?.error ?? 'Unable to resend the email right now. Please try again.',
        )
        return
      }

      setResendStatus('sent')
      setResendMessage(
        payload?.message ??
          'If that account exists, a new verification email is on its way.',
      )
    } catch (error) {
      console.error(error)
      setResendStatus('error')
      setResendMessage('Network error. Please try again.')
    }
  }

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoginStatus('submitting')
    setLoginError(null)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm),
      })

      const payload = await response.json().catch(() => ({}))

      if (!response.ok) {
        setLoginError(payload?.error ?? 'Unable to log in. Check your credentials.')
        setLoginStatus('idle')
        return
      }

      setLoginStatus('success')
      setLoginForm(initialLogin)
      await refresh()
    } catch (error) {
      console.error(error)
      setLoginError('Network error. Please try again.')
      setLoginStatus('idle')
    }
  }

  const handleLogout = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    logoutLocally()
    await refresh()
  }, [logoutLocally, refresh])

  const handleEmailFieldChange =
    (field: keyof typeof emailForm) => (event: ChangeEvent<HTMLInputElement>) => {
      setEmailForm((prev) => ({ ...prev, [field]: event.target.value }))
      setEmailError(null)
      setEmailMessage(null)
    }

  const handlePasswordFieldChange =
    (field: keyof typeof passwordForm) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      setPasswordForm((prev) => ({ ...prev, [field]: event.target.value }))
      setPasswordError(null)
      setPasswordMessage(null)
    }

  const handleChangeEmail = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setEmailStatus('submitting')
    setEmailError(null)
    setEmailMessage(null)

    try {
      const response = await fetch('/api/auth/change-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emailForm),
      })

      const payload = await response.json().catch(() => ({}))

      if (!response.ok) {
        if (response.status === 401) {
          await refresh()
        }
        setEmailStatus('idle')
        setEmailError(payload?.error ?? 'Unable to update email.')
        return
      }

      setEmailStatus('success')
      setEmailMessage(
        payload?.message ?? 'Email updated. Check your inbox to verify the new address.',
      )
      setEmailForm({ newEmail: '', currentPassword: '' })
      await refresh()
    } catch (error) {
      console.error(error)
      setEmailStatus('idle')
      setEmailError('Network error. Please try again.')
    }
  }

  const handleChangePassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setPasswordStatus('submitting')
    setPasswordError(null)
    setPasswordMessage(null)

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordStatus('idle')
      setPasswordError('Passwords do not match.')
      return
    }

    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(passwordForm),
      })

      const payload = await response.json().catch(() => ({}))

      if (!response.ok) {
        if (response.status === 401) {
          await refresh()
        }
        setPasswordStatus('idle')
        setPasswordError(payload?.error ?? 'Unable to update password.')
        return
      }

      setPasswordStatus('success')
      setPasswordMessage(payload?.message ?? 'Password updated successfully.')
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (error) {
      console.error(error)
      setPasswordStatus('idle')
      setPasswordError('Network error. Please try again.')
    }
  }

  const progressEntries = useMemo(() => {
    return Object.entries(progressSummaries)
      .map(([slug, count]) => {
        const iconSrc = `/api/city-icon/${slug}`
        const total = STATION_TOTALS[slug] ?? 0
        const percent = total > 0 ? Math.max(0, Math.min(1, count / total)) : 0
        return {
          slug,
          count,
          total,
          percent,
          label: citySlugMap.get(slug) ?? slug,
          iconSrc,
        }
      })
  }, [progressSummaries])

  const filteredProgress = useMemo(() => {
    const normalized = syncedSearch.trim().toLowerCase()
    const base = normalized.length
      ? progressEntries.filter((entry) => entry.label.toLowerCase().includes(normalized))
      : progressEntries
    const sorted = [...base]
    switch (syncedSort) {
      case 'name-desc':
        sorted.sort((a, b) => b.label.localeCompare(a.label))
        break
      case 'progress-desc':
        sorted.sort((a, b) => b.percent - a.percent || a.label.localeCompare(b.label))
        break
      case 'progress-asc':
        sorted.sort((a, b) => a.percent - b.percent || a.label.localeCompare(b.label))
        break
      case 'name-asc':
      default:
        sorted.sort((a, b) => a.label.localeCompare(b.label))
        break
    }
    return sorted
  }, [progressEntries, syncedSearch, syncedSort])

  return (
    <div className="space-y-6">
      {showHeading && (
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">Account</h1>
          {!user && (
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Create an account to sync your Metro Memory progress and achievements securely across
              devices.
            </p>
          )}
        </div>
      )}

      {verifiedState === 'success' && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 dark:border-emerald-500/80 dark:bg-emerald-500/10 dark:text-emerald-100">
          Email verified! You can now log in and start syncing your progress.
        </div>
      )}

      {verifiedState === 'error' && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 dark:border-rose-500/80 dark:bg-rose-500/10 dark:text-rose-100">
          The verification link is invalid or expired. Request a new link below.
        </div>
      )}

      {user ? (
        <section className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
              Logged in as {user.email}
            </h2>
            <button
              onClick={handleLogout}
              className="inline-flex items-center justify-center rounded-full bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-[var(--accent-ring)] dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              Log out
            </button>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/40">
            <button
              type="button"
              onClick={() => {
                setSyncedOpen((prev) => {
                  const next = !prev
                  setSyncedOpenStored(next)
                  return next
                })
              }}
              className="flex w-full items-center justify-between gap-3 text-left"
              aria-expanded={syncedOpen}
            >
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-600 dark:text-zinc-400">
                  Synced cities
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-500">
                  {progressEntries.length}{' '}
                  {progressEntries.length === 1 ? 'city synced' : 'cities synced'}
                </p>
              </div>
              <span
                className={`text-lg font-semibold transition-transform ${
                  syncedOpen ? 'rotate-180' : ''
                }`}
                aria-hidden="true"
              >
                ⌄
              </span>
            </button>
            {syncedOpen && (
              filteredProgress.length > 0 ? (
                <>
                  <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <input
                      type="text"
                      value={syncedSearch}
                      onChange={(event) => setSyncedSearch(event.target.value)}
                      placeholder="Search synced cities…"
                      className="w-full rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm text-zinc-800 placeholder:text-zinc-400 focus:border-[var(--accent-500)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-500)]/30 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500"
                    />
                    <select
                      value={syncedSort}
                      onChange={(event) =>
                        setSyncedSort(event.target.value as typeof syncedSort)
                      }
                      className="w-full rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm text-zinc-800 focus:border-[var(--accent-500)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-500)]/30 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 sm:w-auto"
                    >
                      <option value="name-asc">Name (A-Z)</option>
                      <option value="name-desc">Name (Z-A)</option>
                      <option value="progress-desc">Progress (high to low)</option>
                      <option value="progress-asc">Progress (low to high)</option>
                    </select>
                  </div>
                  <ul className="mt-3 space-y-2 text-sm text-zinc-700 dark:text-zinc-200">
                    {filteredProgress.map((entry) => (
                      <li
                        key={entry.slug}
                        className="flex items-center justify-between rounded-lg bg-white px-3 py-2 shadow-sm dark:bg-zinc-800/80"
                      >
                        <span className="flex items-center gap-2">
                        <Image
                          src={entry.iconSrc}
                          alt=""
                          width={16}
                          height={16}
                          className="rounded"
                        />
                        {entry.label}
                      </span>
                      <span className="flex items-center gap-2 font-semibold">
                        <span
                          className="inline-flex h-2 w-16 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700"
                          aria-hidden="true"
                        >
                          <span
                            className="h-full transition-[width] rounded-full"
                            style={{
                              width: `${Math.min(100, Math.max(0, entry.percent * 100))}%`,
                              background: `linear-gradient(90deg, #ef4444 0%, #22c55e 100%)`,
                            }}
                          />
                        </span>
                        <span style={{ color: `hsl(${entry.percent * 120}, 70%, 45%)` }}>
                          {entry.count} station{entry.count === 1 ? '' : 's'}
                        </span>
                      </span>
                    </li>
                    ))}
                  </ul>
                </>
              ) : (
                <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
                  No synced cities yet. Play a city to start saving your progress.
                </p>
              )
            )}
          </div>
          <div className="my-2 h-px w-full bg-zinc-200 dark:bg-zinc-800" />
          <div className="grid gap-6 lg:grid-cols-[1fr_auto_1fr] lg:items-start">
            <form className="space-y-4" onSubmit={handleChangeEmail}>
              <div className="space-y-1">
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                  Change email
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Update your sign-in address. We&apos;ll send a new verification email.
                </p>
              </div>
              <FormField
                id="new-email"
                label="New email"
                type="email"
                value={emailForm.newEmail}
                onChange={handleEmailFieldChange('newEmail')}
                error={emailError ?? undefined}
                autoComplete="email"
                required
                inputClassName="h-12"
              />
              <FormField
                id="current-password-for-email"
                label="Current password"
                type="password"
                value={emailForm.currentPassword}
                onChange={handleEmailFieldChange('currentPassword')}
                autoComplete="current-password"
                required
                inputClassName="h-12"
              />
              {emailMessage && (
                <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                  {emailMessage}
                </p>
              )}
              {emailError && (
                <p className="text-sm font-semibold text-rose-600 dark:text-rose-400">
                  {emailError}
                </p>
              )}
              <button
                type="submit"
                disabled={emailStatus === 'submitting'}
                className="inline-flex items-center justify-center rounded-full bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-[var(--accent-ring)] disabled:cursor-not-allowed disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                {emailStatus === 'submitting' ? 'Updating…' : 'Update email'}
              </button>
            </form>
            <div className="hidden h-full w-px self-stretch bg-zinc-200 dark:bg-zinc-800 lg:block" />
            <form className="space-y-4" onSubmit={handleChangePassword}>
              <div className="space-y-1">
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                  Change password
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Choose a new password for your account.
                </p>
              </div>
              <FormField
                id="current-password"
                label="Current password"
                type="password"
                value={passwordForm.currentPassword}
                onChange={handlePasswordFieldChange('currentPassword')}
                autoComplete="current-password"
                required
                inputClassName="h-12"
              />
              <FormField
                id="new-password"
                label="New password"
                type="password"
                value={passwordForm.newPassword}
                onChange={handlePasswordFieldChange('newPassword')}
                autoComplete="new-password"
                required
              />
              <FormField
                id="confirm-new-password"
                label="Confirm new password"
                type="password"
                value={passwordForm.confirmPassword}
                onChange={handlePasswordFieldChange('confirmPassword')}
                autoComplete="new-password"
                required
              />
              {passwordMessage && (
                <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                  {passwordMessage}
                </p>
              )}
              {passwordError && (
                <p className="text-sm font-semibold text-rose-600 dark:text-rose-400">
                  {passwordError}
                </p>
              )}
              <button
                type="submit"
                disabled={passwordStatus === 'submitting'}
                className="inline-flex items-center justify-center rounded-full bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-[var(--accent-ring)] disabled:cursor-not-allowed disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                {passwordStatus === 'submitting' ? 'Updating…' : 'Update password'}
              </button>
            </form>
          </div>
        </section>
      ) : (
        <div className="grid gap-8 lg:grid-cols-[1.35fr,1fr]">
          <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="space-y-2">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Create account</h2>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Passwords are hashed server-side. We&apos;ll email you a verification link to finish setting
                things up.
              </p>
            </div>
            <form className="mt-4 space-y-4" onSubmit={handleRegister}>
              <FormField
                id="email"
                label="Email address"
                type="email"
                value={signupForm.email}
                onChange={handleSignupChange('email')}
                error={signupErrors.email}
                autoComplete="email"
                required
              />
              <FormField
                id="confirm-email"
                label="Confirm email address"
                type="email"
                value={signupForm.confirmEmail}
                onChange={handleSignupChange('confirmEmail')}
                error={signupErrors.confirmEmail}
                autoComplete="email"
                required
              />
              <div className="grid gap-4 md:grid-cols-2">
                <PasswordField
                  id="password"
                  label="Password"
                  value={signupForm.password}
                  onChange={handleSignupChange('password')}
                  error={signupErrors.password}
                  show={showSignupPassword}
                  onToggle={() => setShowSignupPassword((prev) => !prev)}
                  autoComplete="new-password"
                />
                <PasswordField
                  id="confirm-password"
                  label="Confirm password"
                  value={signupForm.confirmPassword}
                  onChange={handleSignupChange('confirmPassword')}
                  error={signupErrors.confirmPassword}
                  show={showSignupConfirmPassword}
                  onToggle={() => setShowSignupConfirmPassword((prev) => !prev)}
                  autoComplete="new-password"
                />
              </div>

              <div className="rounded-2xl border border-zinc-200 p-4 text-sm text-zinc-600 dark:border-zinc-800 dark:text-zinc-300">
                <p className="font-semibold text-zinc-900 dark:text-white">Password requirements</p>
                <ul className="mt-3 space-y-2">
                  {passwordChecklist.map((rule) => (
                    <li key={rule.label} className="flex items-center gap-2">
                      <span
                        className={`inline-flex h-2.5 w-2.5 rounded-full ${
                          rule.met ? 'bg-[var(--accent-500)]' : 'bg-zinc-300 dark:bg-zinc-600'
                        }`}
                      />
                      {rule.label}
                    </li>
                  ))}
                </ul>
              </div>

              {signupApiError && (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800 dark:border-rose-500 dark:bg-rose-500/10 dark:text-rose-200">
                  {signupApiError}
                </div>
              )}

              <button
                type="submit"
                disabled={signupStatus === 'submitting'}
                className="inline-flex w-full items-center justify-center rounded-full bg-[var(--accent-600)] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[var(--accent-600)]/30 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-[var(--accent-500)] dark:shadow-[var(--accent-500)]/30"
              >
                {signupStatus === 'success' ? 'Verification sent' : 'Create account'}
              </button>
            </form>

            {signupStatus === 'success' && (
              <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 dark:border-emerald-500 dark:bg-emerald-500/10 dark:text-emerald-100">
                <p>
                  Check your inbox for a verification email. Click the link inside to finish activating your
                  Metro Memory account.
                </p>
                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <button
                    type="button"
                    onClick={handleResendVerification}
                    disabled={resendStatus === 'sending'}
                    className="inline-flex w-full items-center justify-center rounded-full border border-emerald-600 px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:-translate-y-0.5 hover:border-emerald-500 hover:text-emerald-600 dark:text-emerald-200 sm:w-auto"
                  >
                    {resendStatus === 'sending' ? 'Sending…' : 'Resend verification email'}
                  </button>
                  {resendMessage && (
                    <p
                      className={`text-sm ${
                        resendStatus === 'error'
                          ? 'text-rose-600 dark:text-rose-300'
                          : 'text-emerald-700 dark:text-emerald-200'
                      }`}
                    >
                      {resendMessage}
                    </p>
                  )}
                </div>
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Sign in</h2>
            <form className="mt-4 space-y-3" onSubmit={handleLogin}>
              <FormField
                id="login-email"
                label="Email"
                type="email"
                value={loginForm.email}
                onChange={handleLoginChange('email')}
                autoComplete="email"
                required
              />
              <PasswordField
                id="login-password"
                label="Password"
                value={loginForm.password}
                onChange={handleLoginChange('password')}
                show={showLoginPassword}
                onToggle={() => setShowLoginPassword((prev) => !prev)}
                autoComplete="current-password"
              />
              <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-200">
                <input
                  type="checkbox"
                  checked={loginForm.rememberMe}
                  onChange={handleLoginChange('rememberMe')}
                  className="rounded border-zinc-300 text-[var(--accent-600)] focus:ring-[var(--accent-500)] dark:border-zinc-700"
                />
                Remember me on this device
              </label>

              {loginError && (
                <p className="text-sm text-rose-600 dark:text-rose-300">{loginError}</p>
              )}
              {loginStatus === 'success' && (
                <p className="text-sm text-emerald-600 dark:text-emerald-300">
                  Welcome back! Redirecting your data…
                </p>
              )}

              <button
                type="submit"
                disabled={loginStatus === 'submitting'}
                className="w-full rounded-full bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                {loginStatus === 'submitting' ? 'Signing in…' : 'Log in'}
              </button>
            </form>
          </section>
        </div>
      )}

      {loading && (
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Checking your account status…
        </p>
      )}
    </div>
  )
}

function FormField({
  id,
  label,
  type,
  value,
  onChange,
  error,
  autoComplete,
  required,
  inputClassName,
}: {
  id: string
  label: string
  type: string
  value: string
  onChange: (event: ChangeEvent<HTMLInputElement>) => void
  error?: string
  autoComplete?: string
  required?: boolean
  inputClassName?: string
}) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={id}
        className="text-sm font-semibold text-zinc-900 dark:text-zinc-100"
      >
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        required={required}
        className={`w-full rounded-2xl border px-4 py-3 text-base transition ${inputClassName ?? ''} ${
          error
            ? 'border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/40'
            : 'border-zinc-200 focus:border-[var(--accent-500)] focus:ring-2 focus:ring-[var(--accent-500)]/30 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white'
        }`}
      />
      {error && <p className="text-sm text-rose-500">{error}</p>}
    </div>
  )
}

function PasswordField({
  id,
  label,
  value,
  onChange,
  error,
  show,
  onToggle,
  autoComplete,
}: {
  id: string
  label: string
  value: string
  onChange: (event: ChangeEvent<HTMLInputElement>) => void
  error?: string
  show: boolean
  onToggle: () => void
  autoComplete?: string
}) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={id}
        className="text-sm font-semibold text-zinc-900 dark:text-zinc-100"
      >
        {label}
      </label>
      <div
        className={`rounded-2xl border ${
          error
            ? 'border-rose-400 focus-within:border-rose-500 focus-within:ring-2 focus-within:ring-rose-500/40'
            : 'border-zinc-200 focus-within:border-[var(--accent-500)] focus-within:ring-2 focus-within:ring-[var(--accent-500)]/30 dark:border-zinc-800'
        }`}
      >
        <input
          id={id}
          type={show ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          className="w-full rounded-2xl bg-transparent px-4 py-3 text-base text-zinc-900 outline-none dark:text-white"
        />
      </div>
      <button
        type="button"
        onClick={onToggle}
        className="text-sm font-semibold text-[var(--accent-600)] transition hover:text-[var(--accent-500)] dark:text-[var(--accent-400)] dark:hover:text-[var(--accent-300)]"
      >
        {show ? 'Hide' : 'Show'} {label.toLowerCase()}
      </button>
      {error && <p className="text-sm text-rose-500">{error}</p>}
    </div>
  )
}
