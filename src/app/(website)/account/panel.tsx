'use client'

import { useSearchParams } from 'next/navigation'
import {
  type ChangeEvent,
  type FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import Image from 'next/image'

import { useAuth } from '@/context/AuthContext'
import { cities } from '@/lib/citiesConfig'
import { useLocalStorageValue } from '@react-hookz/web'
import { STATION_TOTALS } from '@/lib/stationTotals'
import useTranslation from '@/hooks/useTranslation'

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

const DELETE_HOLD_DURATION_MS = 10_000

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
  const { t } = useTranslation()
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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteStep, setDeleteStep] = useState<0 | 1>(0)
  const [deleteStatus, setDeleteStatus] = useState<'idle' | 'deleting' | 'success' | 'error'>('idle')
  const [deleteMessage, setDeleteMessage] = useState<string | null>(null)
  const [deleteHoldProgress, setDeleteHoldProgress] = useState(0)
  const deleteHoldStartRef = useRef<number | null>(null)
  const deleteHoldTimeoutRef = useRef<number | null>(null)
  const deleteHoldRafRef = useRef<number | null>(null)

  useEffect(() => {
    setSyncedOpen(syncedOpenStored)
  }, [syncedOpenStored])

  useEffect(() => {
    if (verifiedState === 'success') {
      setSignupStatus('success')
      setResendStatus('idle')
      setResendMessage(t('accountVerifiedSuccess'))
    } else if (verifiedState === 'error') {
      setResendMessage(t('accountVerifiedError'))
      setResendStatus('error')
    }
  }, [t, verifiedState])

  const passwordChecklist = useMemo(
    () => [
      { label: t('accountPasswordRuleLength'), met: signupForm.password.length >= 8 },
      { label: t('accountPasswordRuleUpper'), met: /[A-Z]/.test(signupForm.password) },
      { label: t('accountPasswordRuleLower'), met: /[a-z]/.test(signupForm.password) },
      { label: t('accountPasswordRuleSpecial'), met: /[^A-Za-z0-9]/.test(signupForm.password) },
    ],
    [signupForm.password, t],
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
      errors.email = t('accountEmailRequired')
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signupForm.email)) {
      errors.email = t('accountEmailInvalid')
    }

    if (signupForm.confirmEmail !== signupForm.email) {
      errors.confirmEmail = t('accountEmailMismatch')
    }

    if (
      signupForm.password.length < 8 ||
      !/[A-Z]/.test(signupForm.password) ||
      !/[a-z]/.test(signupForm.password) ||
      !/[^A-Za-z0-9]/.test(signupForm.password)
    ) {
      errors.password = t('accountPasswordRequirementError')
    }

    if (signupForm.confirmPassword !== signupForm.password) {
      errors.confirmPassword = t('accountPasswordMismatch')
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
        setSignupApiError(payload?.error ?? t('accountSignupError'))
        setSignupStatus('idle')
        return
      }

      setSignupStatus('success')
      setResendStatus('idle')
      setResendMessage(null)
    } catch (error) {
      console.error(error)
      setSignupApiError(t('accountNetworkError'))
      setSignupStatus('idle')
    }
  }

  const handleResendVerification = async () => {
    if (!signupForm.email.trim()) {
      setResendStatus('error')
      setResendMessage(t('accountResendNeedEmail'))
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
        setResendMessage(payload?.error ?? t('accountResendError'))
        return
      }

      setResendStatus('sent')
      setResendMessage(payload?.message ?? t('accountResendSuccess'))
    } catch (error) {
      console.error(error)
      setResendStatus('error')
      setResendMessage(t('accountNetworkError'))
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
        setLoginError(payload?.error ?? t('accountLoginError'))
        setLoginStatus('idle')
        return
      }

      setLoginStatus('success')
      setLoginForm(initialLogin)
      await refresh()
    } catch (error) {
      console.error(error)
      setLoginError(t('accountNetworkError'))
      setLoginStatus('idle')
    }
  }

  const handleLogout = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    logoutLocally()
    await refresh()
  }, [logoutLocally, refresh])

  const clearDeleteHoldTracking = useCallback(() => {
    if (deleteHoldTimeoutRef.current) {
      window.clearTimeout(deleteHoldTimeoutRef.current)
      deleteHoldTimeoutRef.current = null
    }
    if (deleteHoldRafRef.current) {
      window.cancelAnimationFrame(deleteHoldRafRef.current)
      deleteHoldRafRef.current = null
    }
    deleteHoldStartRef.current = null
  }, [])

  useEffect(
    () => () => {
      clearDeleteHoldTracking()
    },
    [clearDeleteHoldTracking],
  )

  const openDeleteDialog = useCallback(() => {
    setDeleteDialogOpen(true)
    setDeleteStep(0)
    setDeleteStatus('idle')
    setDeleteMessage(null)
    setDeleteHoldProgress(0)
    clearDeleteHoldTracking()
  }, [clearDeleteHoldTracking])

  const closeDeleteDialog = useCallback(() => {
    if (deleteStatus === 'deleting') return
    setDeleteDialogOpen(false)
    setDeleteStep(0)
    setDeleteStatus('idle')
    setDeleteMessage(null)
    setDeleteHoldProgress(0)
    clearDeleteHoldTracking()
  }, [clearDeleteHoldTracking, deleteStatus])

  const runDeleteAccount = useCallback(async () => {
    setDeleteStatus('deleting')
    setDeleteMessage(null)
    try {
      const response = await fetch('/api/auth/delete', { method: 'POST' })
      if (response.status === 401) {
        setDeleteStatus('error')
        setDeleteMessage('Please sign in again to delete your account.')
        logoutLocally()
        return
      }
      if (!response.ok) {
        throw new Error('Failed to delete account')
      }
      setDeleteStatus('success')
      setDeleteMessage('Account deleted.')
      logoutLocally()
      setTimeout(() => {
        setDeleteDialogOpen(false)
      }, 1200)
    } catch (error) {
      setDeleteStatus('error')
      setDeleteMessage('Unable to delete account. Try again.')
      if (process.env.NODE_ENV !== 'production') {
        console.error(error)
      }
    } finally {
      setDeleteHoldProgress(0)
      clearDeleteHoldTracking()
    }
  }, [clearDeleteHoldTracking, logoutLocally])

  const completeDeleteHold = useCallback(() => {
    clearDeleteHoldTracking()
    setDeleteHoldProgress(1)
    void runDeleteAccount()
  }, [clearDeleteHoldTracking, runDeleteAccount])

  const startDeleteHold = useCallback(() => {
    if (deleteStatus === 'deleting') return
    setDeleteMessage(null)
    deleteHoldStartRef.current = performance.now()
    deleteHoldTimeoutRef.current = window.setTimeout(
      completeDeleteHold,
      DELETE_HOLD_DURATION_MS,
    )
    const tick = () => {
      if (deleteHoldStartRef.current === null) return
      const elapsed = performance.now() - deleteHoldStartRef.current
      setDeleteHoldProgress(Math.min(elapsed / DELETE_HOLD_DURATION_MS, 1))
      if (elapsed < DELETE_HOLD_DURATION_MS && deleteHoldTimeoutRef.current !== null) {
        deleteHoldRafRef.current = window.requestAnimationFrame(tick)
      }
    }
    deleteHoldRafRef.current = window.requestAnimationFrame(tick)
  }, [completeDeleteHold, deleteStatus])

  const cancelDeleteHold = useCallback(() => {
    clearDeleteHoldTracking()
    setDeleteHoldProgress(0)
  }, [clearDeleteHoldTracking])

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
        setEmailError(payload?.error ?? t('accountEmailUpdateError'))
        return
      }

      setEmailStatus('success')
      setEmailMessage(payload?.message ?? t('accountEmailUpdateSuccess'))
      setEmailForm({ newEmail: '', currentPassword: '' })
      await refresh()
    } catch (error) {
      console.error(error)
      setEmailStatus('idle')
      setEmailError(t('accountNetworkError'))
    }
  }

  const handleChangePassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setPasswordStatus('submitting')
    setPasswordError(null)
    setPasswordMessage(null)

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordStatus('idle')
      setPasswordError(t('accountPasswordMismatch'))
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
        setPasswordError(payload?.error ?? t('accountPasswordUpdateError'))
        return
      }

      setPasswordStatus('success')
      setPasswordMessage(payload?.message ?? t('accountPasswordUpdateSuccess'))
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (error) {
      console.error(error)
      setPasswordStatus('idle')
      setPasswordError(t('accountNetworkError'))
    }
  }

  const progressEntries = useMemo(() => {
    return Object.entries(progressSummaries)
      .map(([slug, count]) => {
        const iconSrc = `/api/city-icon/${slug}`
        const total = STATION_TOTALS[slug] ?? 0
        const percent = total > 0 ? Math.max(0, Math.min(1, count / total)) : 0
        const progressPercent = Math.min(100, Math.max(0, percent * 100))
        const barColor = `hsl(${percent * 120}, 70%, 45%)`
        return {
          slug,
          count,
          total,
          percent,
          progressPercent,
          barColor,
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
              {t('accountIntro')}
            </p>
          )}
        </div>
      )}

      {verifiedState === 'success' && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 dark:border-emerald-500/80 dark:bg-emerald-500/10 dark:text-emerald-100">
          {t('accountVerifiedSuccess')}
        </div>
      )}

      {verifiedState === 'error' && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 dark:border-rose-500/80 dark:bg-rose-500/10 dark:text-rose-100">
          {t('accountVerifiedError')}
        </div>
      )}

      {user ? (
        <section className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
              {t('accountLoggedInAs', { email: user.email })}
            </h2>
            <button
              onClick={handleLogout}
              className="inline-flex items-center justify-center rounded-full bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-[var(--accent-ring)] dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              {t('accountLogout')}
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
                  {t('accountSyncedCities')}
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-500">
                  {t('accountSyncedCitiesCount', { count: progressEntries.length })}
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
                      placeholder={t('accountSearchSynced')}
                      className="w-full rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm text-zinc-800 placeholder:text-zinc-400 focus:border-[var(--accent-500)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-500)]/30 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500"
                    />
                    <select
                      value={syncedSort}
                      onChange={(event) =>
                        setSyncedSort(event.target.value as typeof syncedSort)
                      }
                      className="w-full rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm text-zinc-800 focus:border-[var(--accent-500)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-500)]/30 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 sm:w-auto"
                    >
                      <option value="name-asc">{t('accountSortNameAsc')}</option>
                      <option value="name-desc">{t('accountSortNameDesc')}</option>
                      <option value="progress-desc">{t('accountSortProgressDesc')}</option>
                      <option value="progress-asc">{t('accountSortProgressAsc')}</option>
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
                              width: `${entry.progressPercent}%`,
                              background: entry.barColor,
                            }}
                          />
                        </span>
                        <span style={{ color: entry.barColor }}>
                          {t('accountStationsFound', { count: entry.count })}
                        </span>
                      </span>
                    </li>
                    ))}
                  </ul>
                </>
              ) : (
                <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
                  {t('accountNoSyncedCities')}
                </p>
              )
            )}
          </div>
          <div className="my-2 h-px w-full bg-zinc-200 dark:bg-zinc-800" />
          <div className="grid gap-6 lg:grid-cols-[1fr_auto_1fr] lg:items-start">
            <form className="space-y-4" onSubmit={handleChangeEmail}>
              <div className="space-y-1">
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                  {t('accountChangeEmail')}
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  {t('accountChangeEmailDesc')}
                </p>
              </div>
              <FormField
                id="new-email"
                label={t('accountNewEmail')}
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
                label={t('accountCurrentPassword')}
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
                {emailStatus === 'submitting' ? t('accountUpdating') : t('accountUpdateEmail')}
              </button>
            </form>
            <div className="hidden h-full w-px self-stretch bg-zinc-200 dark:bg-zinc-800 lg:block" />
            <form className="space-y-4" onSubmit={handleChangePassword}>
              <div className="space-y-1">
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                  {t('accountChangePassword')}
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  {t('accountChangePasswordDesc')}
                </p>
              </div>
              <FormField
                id="current-password"
                label={t('accountCurrentPassword')}
                type="password"
                value={passwordForm.currentPassword}
                onChange={handlePasswordFieldChange('currentPassword')}
                autoComplete="current-password"
                required
                inputClassName="h-12"
              />
              <FormField
                id="new-password"
                label={t('accountNewPassword')}
                type="password"
                value={passwordForm.newPassword}
                onChange={handlePasswordFieldChange('newPassword')}
                autoComplete="new-password"
                required
              />
              <FormField
                id="confirm-new-password"
                label={t('accountConfirmPassword')}
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
                {passwordStatus === 'submitting'
                  ? t('accountUpdating')
                  : t('accountUpdatePassword')}
              </button>
            </form>
          </div>
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm dark:border-red-900/60 dark:bg-red-950/40">
            <div>
              <p className="text-base font-semibold text-red-900 dark:text-red-200">
                Delete account
              </p>
              <p className="text-red-700 dark:text-red-300">
                Delete your account and synced progress permanently.
              </p>
            </div>
            <button
              type="button"
              onClick={openDeleteDialog}
              className="mt-3 inline-flex items-center justify-center rounded-full border border-red-500 bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/40"
            >
              Delete account
            </button>
          </div>
        </section>
      ) : (
        <div className="grid gap-8 lg:grid-cols-[1.35fr,1fr]">
          <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="space-y-2">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                {t('accountCreateTitle')}
              </h2>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                {t('accountCreateDesc')}
              </p>
            </div>
            <form className="mt-4 space-y-4" onSubmit={handleRegister}>
              <FormField
                id="email"
                label={t('accountEmail')}
                type="email"
                value={signupForm.email}
                onChange={handleSignupChange('email')}
                error={signupErrors.email}
                autoComplete="email"
                required
              />
              <FormField
                id="confirm-email"
                label={t('accountConfirmEmail')}
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
                  label={t('accountPassword')}
                  value={signupForm.password}
                  onChange={handleSignupChange('password')}
                  error={signupErrors.password}
                  show={showSignupPassword}
                  onToggle={() => setShowSignupPassword((prev) => !prev)}
                  autoComplete="new-password"
                />
                <PasswordField
                  id="confirm-password"
                  label={t('accountConfirmPassword')}
                  value={signupForm.confirmPassword}
                  onChange={handleSignupChange('confirmPassword')}
                  error={signupErrors.confirmPassword}
                  show={showSignupConfirmPassword}
                  onToggle={() => setShowSignupConfirmPassword((prev) => !prev)}
                  autoComplete="new-password"
                />
              </div>

              <div className="rounded-2xl border border-zinc-200 p-4 text-sm text-zinc-600 dark:border-zinc-800 dark:text-zinc-300">
                <p className="font-semibold text-zinc-900 dark:text-white">
                  {t('accountPasswordRequirements')}
                </p>
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
                {signupStatus === 'success' ? t('accountVerificationSent') : t('accountCreateButton')}
              </button>
            </form>

            {signupStatus === 'success' && (
              <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 dark:border-emerald-500 dark:bg-emerald-500/10 dark:text-emerald-100">
                <p>
                  {t('accountVerificationInstructions')}
                </p>
                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <button
                    type="button"
                    onClick={handleResendVerification}
                    disabled={resendStatus === 'sending'}
                    className="inline-flex w-full items-center justify-center rounded-full border border-emerald-600 px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:-translate-y-0.5 hover:border-emerald-500 hover:text-emerald-600 dark:text-emerald-200 sm:w-auto"
                  >
                    {resendStatus === 'sending' ? t('accountResendSending') : t('accountResendButton')}
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
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              {t('accountSignInTitle')}
            </h2>
            <form className="mt-4 space-y-3" onSubmit={handleLogin}>
              <FormField
                id="login-email"
                label={t('accountEmail')}
                type="email"
                value={loginForm.email}
                onChange={handleLoginChange('email')}
                autoComplete="email"
                required
              />
              <PasswordField
                id="login-password"
                label={t('accountPassword')}
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
                {t('accountRememberMe')}
              </label>

              {loginError && (
                <p className="text-sm text-rose-600 dark:text-rose-300">{loginError}</p>
              )}
              {loginStatus === 'success' && (
                <p className="text-sm text-emerald-600 dark:text-emerald-300">
                  {t('accountLoginSuccess')}
                </p>
              )}

              <button
                type="submit"
                disabled={loginStatus === 'submitting'}
                className="w-full rounded-full bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                {loginStatus === 'submitting' ? t('accountSigningIn') : t('accountLoginButton')}
              </button>
            </form>
          </section>
        </div>
      )}

      {loading && (
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          {t('accountCheckingStatus')}
        </p>
      )}
      {deleteDialogOpen && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl dark:bg-zinc-900">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-300">
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 9v4" />
                  <path d="M12 17h.01" />
                  <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                  Delete account
                </h3>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                  This permanently deletes your account and all synced progress. This cannot be undone.
                </p>
              </div>
            </div>
            {deleteStep === 0 ? (
              <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeDeleteDialog}
                  className="rounded-full border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteStep(1)}
                  className="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-500"
                >
                  I understand
                </button>
              </div>
            ) : (
              <div className="mt-6 space-y-3">
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Hold the button for 10 seconds to confirm deletion.
                </p>
                <button
                  type="button"
                  className="relative w-full rounded-full border border-red-500 bg-red-600 px-4 py-2 text-sm font-semibold text-white transition focus:outline-none focus:ring-2 focus:ring-red-500/40 disabled:cursor-not-allowed disabled:opacity-70"
                  onPointerDown={startDeleteHold}
                  onPointerUp={cancelDeleteHold}
                  onPointerLeave={cancelDeleteHold}
                  onPointerCancel={cancelDeleteHold}
                  onKeyDown={(event) => {
                    if (event.code === 'Space' || event.code === 'Enter') {
                      event.preventDefault()
                      startDeleteHold()
                    }
                  }}
                  onKeyUp={(event) => {
                    if (event.code === 'Space' || event.code === 'Enter') {
                      event.preventDefault()
                      cancelDeleteHold()
                    }
                  }}
                  disabled={deleteStatus === 'deleting'}
                >
                  {deleteStatus === 'deleting'
                    ? 'Deleting...'
                    : 'Hold to delete account'}
                </button>
                <div className="h-1 w-full rounded-full bg-red-200 dark:bg-red-900/40">
                  <div
                    className="h-full rounded-full bg-red-600 transition-[width] dark:bg-red-400"
                    style={{ width: `${Math.min(deleteHoldProgress, 1) * 100}%` }}
                  />
                </div>
                <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={closeDeleteDialog}
                    className="rounded-full border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
            {deleteMessage && (
              <p
                className={`mt-4 text-sm font-semibold ${
                  deleteStatus === 'success'
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-red-600 dark:text-red-300'
                }`}
              >
                {deleteMessage}
              </p>
            )}
          </div>
        </div>
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
