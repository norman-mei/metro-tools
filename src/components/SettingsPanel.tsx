'use client'

import classNames from 'classnames'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import { useTheme } from 'next-themes'
import { useSettings } from '@/context/SettingsContext'
import { useAuth } from '@/context/AuthContext'
import useTranslation from '@/hooks/useTranslation'
import { cities } from '@/lib/citiesConfig'
import {
  readSolutionsAccess,
  writeSolutionsAccess,
  readSolutionsSelection,
  writeSolutionsSelection,
} from '@/lib/solutionsAccess'
import { ACCENT_COLOR_OPTIONS, type AccentColorId } from '@/lib/accentColors'
import { STATION_TOTALS } from '@/lib/stationTotals'

type SettingsPanelProps = {
  className?: string
  showHeading?: boolean
  onClose?: () => void
}

const THEME_OPTIONS: Array<{ value: string; label: string }> = [
  { value: 'system', label: 'System default' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
]

const LOCAL_PROGRESS_EVENT = 'local-progress-refresh'

const SettingsPanel = ({ className, showHeading = true }: SettingsPanelProps) => {
  const {
    settings,
    setConfettiEnabled,
    setAchievementToastsEnabled,
    setStopConfettiAfterCompletion,
    setAccentColor,
    notifySettingsSaved,
  } = useSettings()
  const { t } = useTranslation()
  const { theme, setTheme } = useTheme()
  const auth = useAuth()
  const currentTheme = theme ?? 'system'
  const handleThemeChange = useCallback(
    (nextTheme: string) => {
      if (nextTheme === currentTheme) {
        return
      }
      setTheme(nextTheme)
      notifySettingsSaved()
    },
    [currentTheme, notifySettingsSaved, setTheme],
  )

  return (
    <div
      className={classNames(
        'space-y-6 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-[#18181b] dark:bg-zinc-900',
        'max-h-[70vh] overflow-y-auto',
        'w-full',
        className,
      )}
    >
      {showHeading && (
        <h3 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">{t('settings')}</h3>
      )}
      <div className="space-y-4">
        <SettingToggle
          label="Celebration confetti"
          description="Show confetti when you reach milestones or hit the confetti button."
          checked={settings.confettiEnabled}
          onChange={setConfettiEnabled}
        />
        <SettingToggle
          label="Hide confetti after finishing a city"
          description="Skip future confetti for cities where you've already reached 100%."
          checked={settings.stopConfettiAfterCompletion}
          onChange={setStopConfettiAfterCompletion}
        />
        <SettingToggle
          label="Achievement toasts"
          description="Display toast notifications when you complete a city."
          checked={settings.achievementToastsEnabled}
          onChange={setAchievementToastsEnabled}
        />
      </div>
      <div className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Theme
        </p>
        <div className="flex flex-wrap gap-2">
          {THEME_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleThemeChange(option.value)}
              className={classNames(
                'rounded-full px-4 py-2 text-sm font-semibold transition',
                currentTheme === option.value
                  ? 'bg-[var(--accent-600)] text-white dark:bg-[var(--accent-500)]'
                  : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700',
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Accent color
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {ACCENT_COLOR_OPTIONS.map((option) => {
            const selected = settings.accentColor === option.id
            return (
              <button
                key={option.id}
                type="button"
                className={classNames(
                  'flex items-center gap-3 rounded-2xl border px-3 py-2 text-left transition focus:outline-none focus:ring-2 focus:ring-[var(--accent-ring)]',
                  selected
                    ? 'border-[var(--accent-600)] bg-[color:var(--accent-50)] shadow-inner dark:border-[var(--accent-500)] dark:bg-[rgb(var(--accent-600-rgb)_/_0.25)]'
                    : 'border-zinc-200 bg-white hover:border-zinc-300 dark:border-[#18181b] dark:bg-zinc-900 dark:hover:border-zinc-700',
                )}
                aria-pressed={selected}
                onClick={() => setAccentColor(option.id as AccentColorId)}
              >
                <span
                  className="h-8 w-8 rounded-full border border-white/50 shadow-sm"
                  style={{ backgroundColor: option.palette[600] }}
                  aria-hidden="true"
                />
                <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  {option.label}
                </span>
              </button>
            )
          })}
        </div>
      </div>
      <SolutionsAccessPanel onSettingsChange={notifySettingsSaved} />
      <div className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-wide text-red-500 dark:text-red-400">
          Danger Zone
        </p>
        <ResetProgressButton
          disabled={auth.loading}
          onResetComplete={auth.refresh}
          onLogout={auth.logoutLocally}
          isAuthenticated={!!auth.user}
          progressSummaries={auth.progressSummaries}
        />
      </div>
    </div>
  )
}

const SettingToggle = ({
  label,
  description,
  checked,
  onChange,
}: {
  label: string
  description: string
  checked: boolean
  onChange: (next: boolean) => void
}) => (
  <label className="flex items-center justify-between gap-4 rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-[#18181b] dark:bg-zinc-900/40">
    <div>
      <p className="text-base font-semibold text-zinc-900 dark:text-zinc-100">{label}</p>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">{description}</p>
    </div>
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={classNames(
        'relative inline-flex h-8 w-14 items-center rounded-full transition',
        checked
          ? 'bg-[var(--accent-500)] dark:bg-[var(--accent-400)]'
          : 'bg-zinc-300 dark:bg-zinc-700',
      )}
    >
      <span
        className={classNames(
          'inline-block h-6 w-6 transform rounded-full bg-white transition',
          checked ? 'translate-x-6' : 'translate-x-1',
        )}
      />
      <span className="sr-only">{label}</span>
    </button>
  </label>
)

const SolutionsAccessPanel = ({ onSettingsChange }: { onSettingsChange?: () => void }) => {
  const [hasAccess, setHasAccess] = useState(false)
  const [passwordInput, setPasswordInput] = useState('')
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [solutionsMode, setSolutionsMode] = useState<'all' | 'custom'>('custom')
  const [solutionsCities, setSolutionsCities] = useState<string[]>([])
  const [solutionsInitialized, setSolutionsInitialized] = useState(false)
  const [cityFilter, setCityFilter] = useState('')
  const selectionHydratedRef = useRef(false)
  const allCityOptions = useMemo(
    () =>
      cities
        .map((city) => ({
          slug: city.link.replace(/^\//, ''),
          name: city.name,
        }))
        .sort((a, b) => a.name.localeCompare(b.name)),
    [],
  )

  const applySolutionsProgress = useCallback(
    (mode?: 'all' | 'custom', customCities?: string[]) => {
      if (!hasAccess || typeof window === 'undefined') return
      const effectiveMode = mode ?? solutionsMode
      const targetSlugs =
        effectiveMode === 'all'
          ? allCityOptions.map((city) => city.slug)
          : customCities ?? solutionsCities
      targetSlugs.forEach((slug) => {
        const total = STATION_TOTALS[slug]
        if (!total || total <= 0) return
        try {
          window.localStorage.setItem(`${slug}-station-total`, String(total))
          window.localStorage.setItem(`${slug}-stations`, JSON.stringify(total))
          window.localStorage.setItem(`${slug}-stations-found-at`, '{}')
        } catch (error) {
          if (process.env.NODE_ENV !== 'production') {
            console.warn(`Unable to persist solutions progress for ${slug}`, error)
          }
        }
      })
      window.dispatchEvent(new Event(LOCAL_PROGRESS_EVENT))
    },
    [allCityOptions, hasAccess, solutionsCities, solutionsMode],
  )

  useEffect(() => {
    if (typeof window === 'undefined') return
    const access = readSolutionsAccess()
    setHasAccess(access)
    const selection = readSolutionsSelection()
    const validCities = selection.cities.filter((slug) =>
      allCityOptions.some((city) => city.slug === slug),
    )
    setSolutionsMode(selection.mode)
    setSolutionsCities(validCities)
    setSolutionsInitialized(true)
  }, [allCityOptions])

  useEffect(() => {
    if (!solutionsInitialized || !hasAccess) return
    writeSolutionsSelection({
      mode: solutionsMode,
      cities: solutionsMode === 'custom' ? solutionsCities : [],
    })
    if (selectionHydratedRef.current) {
      onSettingsChange?.()
      applySolutionsProgress()
    } else {
      selectionHydratedRef.current = true
    }
  }, [
    applySolutionsProgress,
    hasAccess,
    onSettingsChange,
    solutionsCities,
    solutionsInitialized,
    solutionsMode,
  ])

  useEffect(() => {
    if (!hasAccess) {
      selectionHydratedRef.current = false
    }
  }, [hasAccess])

  const filteredCities = useMemo(() => {
    const normalizedFilter = cityFilter.trim().toLowerCase()
    if (!normalizedFilter) {
      return allCityOptions
    }
    return allCityOptions.filter((city) =>
      city.name.toLowerCase().includes(normalizedFilter),
    )
  }, [allCityOptions, cityFilter])

  const toggleSolutionsCity = useCallback((slug: string) => {
    setSolutionsCities((prev) => {
      if (prev.includes(slug)) {
        return prev.filter((entry) => entry !== slug)
      }
      return [...prev, slug]
    })
  }, [])

  const handleSolutionsPasswordSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      const password = passwordInput.trim()
      if (!password) {
        return
      }
      setPasswordError(null)
      try {
        const response = await fetch('/api/solutions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password }),
        })
        const payload = await response.json().catch(() => ({}))
        if (!response.ok || !payload?.success) {
          setPasswordError('Incorrect password. Try again.')
          return
        }
        setHasAccess(true)
        writeSolutionsAccess(true)
        setPasswordInput('')
        setPasswordError(null)
        if (!solutionsInitialized) {
          setSolutionsInitialized(true)
        }
        onSettingsChange?.()
        applySolutionsProgress(solutionsMode, solutionsCities)
      } catch (error) {
        setPasswordError('Unable to verify password. Please try again.')
        if (process.env.NODE_ENV !== 'production') {
          console.error(error)
        }
      }
    },
    [applySolutionsProgress, onSettingsChange, passwordInput, solutionsCities, solutionsInitialized, solutionsMode],
  )

  const handleModeChange = useCallback((mode: 'all' | 'custom') => {
    setSolutionsMode(mode)
  }, [])

  const handleSelectAllCities = useCallback(() => {
    setSolutionsCities(allCityOptions.map((city) => city.slug))
  }, [allCityOptions])

  const handleClearAllCities = useCallback(() => {
    setSolutionsCities([])
  }, [])

  const isCustomMode = solutionsMode === 'custom'
  const selectedCount = solutionsCities.length

  return (
    <div className="space-y-3 rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-[#18181b] dark:bg-zinc-900/40">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Solutions
        </p>
        <p className="text-sm text-zinc-600 dark:text-zinc-300">
          Automatically reveal every station in the cities you choose after entering
          the passphrase.
        </p>
      </div>
      {!hasAccess ? (
        <form className="space-y-2" onSubmit={handleSolutionsPasswordSubmit}>
          <label className="text-xs font-semibold uppercase text-zinc-500 dark:text-zinc-400">
            Enter password
          </label>
          <div className="flex gap-2">
            <input
              type="password"
              value={passwordInput}
              onChange={(event) => setPasswordInput(event.target.value)}
              className="flex-1 rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
              placeholder="Password"
            />
            <button
              type="submit"
              className="rounded-xl bg-[var(--accent-600)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--accent-500)] disabled:opacity-60 dark:bg-[var(--accent-600)] dark:hover:bg-[var(--accent-500)]"
              disabled={!passwordInput.trim()}
            >
              Unlock
            </button>
          </div>
          {passwordError && (
            <p className="text-xs text-red-600 dark:text-red-300">{passwordError}</p>
          )}
        </form>
      ) : (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => handleModeChange('all')}
              className={classNames(
                'rounded-full px-4 py-2 text-sm font-semibold transition',
                solutionsMode === 'all'
                  ? 'bg-[var(--accent-600)] text-white dark:bg-[var(--accent-500)]'
                  : 'bg-zinc-200 text-zinc-700 hover:bg-zinc-300 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700',
              )}
            >
              Reveal every city
            </button>
            <button
              type="button"
              onClick={() => handleModeChange('custom')}
              className={classNames(
                'rounded-full px-4 py-2 text-sm font-semibold transition',
                solutionsMode === 'custom'
                  ? 'bg-[var(--accent-600)] text-white dark:bg-[var(--accent-500)]'
                  : 'bg-zinc-200 text-zinc-700 hover:bg-zinc-300 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700',
              )}
            >
              Select specific cities
            </button>
          </div>
          {isCustomMode && (
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3 text-xs text-zinc-600 dark:text-zinc-400">
                <span>
                  Selected {selectedCount} / {allCityOptions.length}
                </span>
                <div className="flex gap-3">
                  <button
                    type="button"
                    className="text-[var(--accent-600)] underline-offset-2 hover:underline dark:text-[var(--accent-300)]"
                    onClick={handleSelectAllCities}
                  >
                    Select all
                  </button>
                  <button
                    type="button"
                    className="text-[var(--accent-600)] underline-offset-2 hover:underline dark:text-[var(--accent-300)]"
                    onClick={handleClearAllCities}
                  >
                    Clear all
                  </button>
                </div>
              </div>
              <input
                type="text"
                value={cityFilter}
                onChange={(event) => setCityFilter(event.target.value)}
                placeholder="Search cities"
                className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
              />
              <div className="max-h-48 space-y-2 overflow-y-auto rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900">
                {filteredCities.length === 0 && (
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    No cities match your search.
                  </p>
                )}
                {filteredCities.map((city) => {
                  const checked = solutionsCities.includes(city.slug)
                  return (
                    <label
                      key={city.slug}
                      className="flex items-center gap-2 rounded-lg px-2 py-1 text-sm text-zinc-800 dark:text-zinc-100"
                    >
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-zinc-300 text-[var(--accent-600)] focus:ring-[var(--accent-ring)] dark:border-zinc-700 dark:bg-zinc-900"
                        checked={checked}
                        onChange={() => toggleSolutionsCity(city.slug)}
                      />
                      <span>{city.name}</span>
                    </label>
                  )
                })}
              </div>
            </div>
          )}
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            The next time you open a city selected above, all stations will be marked
            as found automatically.
          </p>
        </div>
      )}
    </div>
  )
}

const CITY_NAME_LOOKUP = new Map(
  cities.map((city) => [city.link.replace(/^\//, ''), city.name]),
)

const getCityName = (slug: string) => {
  if (CITY_NAME_LOOKUP.has(slug)) {
    return CITY_NAME_LOOKUP.get(slug)!
  }
  return slug
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

const getSlugFromLink = (link: string) => link.replace(/^\//, '').split(/[?#]/)[0]

const readLocalFoundCount = (slug: string) => {
  if (typeof window === 'undefined') {
    return 0
  }
  try {
    const stored = window.localStorage.getItem(`${slug}-stations`)
    if (!stored) return 0
    const parsed = JSON.parse(stored)
    if (Array.isArray(parsed)) {
      return new Set(parsed.filter((value) => typeof value === 'number')).size
    }
    if (typeof parsed === 'number' && Number.isFinite(parsed)) {
      return parsed
    }
  } catch {
    return 0
  }
  return 0
}

const LOCAL_PROGRESS_SUFFIXES = [
  '-stations',
  '-stations-found-at',
  '-stations-is-new-player',
  '-sidebar-open',
]

const LONG_PRESS_DURATION_MS = 5_000

const clearLocalProgressStorage = (slugs?: string[]) => {
  if (typeof window === 'undefined') {
    return 0
  }
  const slugFilter = slugs && slugs.length > 0 ? new Set(slugs) : null
  const keysToRemove: string[] = []
  for (let i = 0; i < window.localStorage.length; i += 1) {
    const key = window.localStorage.key(i)
    if (!key) continue
    const suffix = LOCAL_PROGRESS_SUFFIXES.find((candidate) => key.endsWith(candidate))
    if (!suffix) {
      continue
    }
    const slug = key.slice(0, -suffix.length)
    if (slugFilter && !slugFilter.has(slug)) {
      continue
    }
    keysToRemove.push(key)
  }
  keysToRemove.forEach((key) => window.localStorage.removeItem(key))
  return keysToRemove.length
}

const ResetProgressButton = ({
  disabled,
  onResetComplete,
  onLogout,
  isAuthenticated,
  progressSummaries,
}: {
  disabled?: boolean
  onResetComplete?: () => Promise<void>
  onLogout?: () => void
  isAuthenticated: boolean
  progressSummaries: Record<string, number>
}) => {
  const [holdProgress, setHoldProgress] = useState(0)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [isResetting, setIsResetting] = useState(false)
  const [statusVariant, setStatusVariant] = useState<'idle' | 'success' | 'error'>(
    'idle',
  )
  const [localProgressVersion, setLocalProgressVersion] = useState(0)
  const cityOptions = useMemo(() => {
    const entries = new Map<string, { slug: string; name: string; found: number }>()

    Object.entries(progressSummaries ?? {}).forEach(([slug, found]) => {
      if ((found ?? 0) > 0) {
        entries.set(slug, { slug, name: getCityName(slug), found })
      }
    })

    if (typeof window !== 'undefined') {
      cities.forEach((city) => {
        const slug = getSlugFromLink(city.link)
        const found = readLocalFoundCount(slug)
        if (found > 0) {
          const existing = entries.get(slug)
          entries.set(slug, {
            slug,
            name: getCityName(slug),
            found: existing ? Math.max(existing.found, found) : found,
          })
        }
      })
    }

    return Array.from(entries.values()).sort((a, b) => a.name.localeCompare(b.name))
  }, [progressSummaries, localProgressVersion])
  const [selectedCities, setSelectedCities] = useState<string[]>([])
  const [citySelectionInitialized, setCitySelectionInitialized] = useState(false)

  useEffect(() => {
    if (!citySelectionInitialized) {
      if (cityOptions.length > 0) {
        setSelectedCities(cityOptions.map((city) => city.slug))
        setCitySelectionInitialized(true)
      }
      return
    }
    setSelectedCities((prev) => {
      const available = new Set(cityOptions.map((city) => city.slug))
      const filtered = prev.filter((slug) => available.has(slug))
      return filtered.length === prev.length ? prev : filtered
    })
  }, [cityOptions, citySelectionInitialized])

  const toggleCity = useCallback((slug: string) => {
    setSelectedCities((prev) => {
      if (prev.includes(slug)) {
        return prev.filter((item) => item !== slug)
      }
      return [...prev, slug]
    })
  }, [])

  const selectAllCities = useCallback(() => {
    setSelectedCities(cityOptions.map((city) => city.slug))
  }, [cityOptions])

  const clearAllCities = useCallback(() => {
    setSelectedCities([])
  }, [])

  const resetTargets = useMemo(() => {
    if (selectedCities.length > 0) {
      return selectedCities
    }
    if (cityOptions.length > 0) {
      return cityOptions.map((city) => city.slug)
    }
    return []
  }, [cityOptions, selectedCities])

  const holdStartRef = useRef<number | null>(null)
  const holdTimeoutRef = useRef<number | null>(null)
  const holdRafRef = useRef<number | null>(null)

  const clearHoldTracking = useCallback(() => {
    if (holdTimeoutRef.current) {
      window.clearTimeout(holdTimeoutRef.current)
      holdTimeoutRef.current = null
    }
    if (holdRafRef.current) {
      window.cancelAnimationFrame(holdRafRef.current)
      holdRafRef.current = null
    }
    holdStartRef.current = null
  }, [])

  useEffect(
    () => () => {
      clearHoldTracking()
    },
    [clearHoldTracking],
  )

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }
    const handleProgressChange = () => {
      setLocalProgressVersion((prev) => prev + 1)
    }
    window.addEventListener('storage', handleProgressChange)
    window.addEventListener('focus', handleProgressChange)
    window.addEventListener(LOCAL_PROGRESS_EVENT, handleProgressChange as EventListener)
    return () => {
      window.removeEventListener('storage', handleProgressChange)
      window.removeEventListener('focus', handleProgressChange)
      window.removeEventListener(LOCAL_PROGRESS_EVENT, handleProgressChange as EventListener)
    }
  }, [])

  const runReset = useCallback(async () => {
    setIsResetting(true)
    setStatusVariant('idle')
    setStatusMessage(null)
    try {
      const targets = resetTargets
      const clearedKeys = clearLocalProgressStorage(
        targets.length > 0 ? targets : undefined,
      )
      if (isAuthenticated) {
        const response = await fetch('/api/progress/reset', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body:
            targets.length > 0
              ? JSON.stringify({ citySlugs: targets })
              : JSON.stringify({}),
        })
        if (response.status === 401) {
          onLogout?.()
          setStatusVariant('error')
          setStatusMessage('Sign in again to clear synced progress.')
        } else if (!response.ok) {
          throw new Error('Failed to reset progress')
        } else {
          await onResetComplete?.()
          setStatusVariant('success')
          setStatusMessage(
            `Progress reset for ${
              targets.length > 0 ? `${targets.length} city${targets.length === 1 ? '' : 'ies'}` : 'all cities'
            }${clearedKeys > 0 ? ` (${clearedKeys} local caches removed)` : ''}.`,
          )
        }
      } else {
        setStatusVariant('success')
        setStatusMessage(
          clearedKeys > 0
            ? `Local progress cleared for ${clearedKeys} saved city caches.`
            : 'Local progress reset.',
        )
      }
    } catch (error) {
      setStatusVariant('error')
      setStatusMessage('Unable to reset progress. Please try again.')
      if (process.env.NODE_ENV !== 'production') {
        console.error(error)
      }
    } finally {
      setIsResetting(false)
      setHoldProgress(0)
    }
  }, [isAuthenticated, onLogout, onResetComplete, resetTargets])

  const completeHold = useCallback(() => {
    clearHoldTracking()
    setHoldProgress(1)
    void runReset()
  }, [clearHoldTracking, runReset])

  const startHold = useCallback(() => {
    if (
      disabled ||
      isResetting ||
      holdTimeoutRef.current !== null ||
      (isAuthenticated && cityOptions.length > 0 && resetTargets.length === 0)
    ) {
      return
    }
    setStatusMessage(null)
    setStatusVariant('idle')
    holdStartRef.current = performance.now()
    holdTimeoutRef.current = window.setTimeout(completeHold, LONG_PRESS_DURATION_MS)

    const tick = () => {
      if (holdStartRef.current === null) {
        return
      }
      const elapsed = performance.now() - holdStartRef.current
      setHoldProgress(Math.min(elapsed / LONG_PRESS_DURATION_MS, 1))
      if (elapsed < LONG_PRESS_DURATION_MS && holdTimeoutRef.current !== null) {
        holdRafRef.current = window.requestAnimationFrame(tick)
      }
    }
    holdRafRef.current = window.requestAnimationFrame(tick)
  }, [
    completeHold,
    disabled,
    isAuthenticated,
    isResetting,
    cityOptions.length,
    resetTargets.length,
  ])

  const cancelHold = useCallback(() => {
    clearHoldTracking()
    setHoldProgress(0)
  }, [clearHoldTracking])

  const handlePointerDown = useCallback(() => {
    startHold()
  }, [startHold])

  const handlePointerUp = useCallback(() => {
    cancelHold()
  }, [cancelHold])

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLButtonElement>) => {
      if (event.code === 'Space' || event.code === 'Enter') {
        event.preventDefault()
        startHold()
      }
    },
    [startHold],
  )

  const handleKeyUp = useCallback(
    (event: KeyboardEvent<HTMLButtonElement>) => {
      if (event.code === 'Space' || event.code === 'Enter') {
        event.preventDefault()
        cancelHold()
      }
    },
    [cancelHold],
  )

  return (
    <div className="space-y-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm dark:border-red-900/60 dark:bg-red-950/40">
      <div>
        <p className="text-base font-semibold text-red-900 dark:text-red-200">
          Reset saved progress
        </p>
        <p className="text-red-700 dark:text-red-300">
          Hold the button for 5 seconds to erase the selected cities. Only cities
          where you&apos;ve found at least one station appear below. This action cannot be
          undone.
        </p>
      </div>
      <div className="space-y-2">
        {cityOptions.length === 0 ? (
          <p className="text-xs text-red-600 dark:text-red-300">
            You haven&apos;t recorded any progress yet.
          </p>
        ) : (
          <>
            <p className="text-xs font-semibold text-red-700 dark:text-red-200">
              Choose cities to reset:
            </p>
            <div className="space-y-2">
              {cityOptions.map((city) => {
                const checked = selectedCities.includes(city.slug)
                return (
                  <label
                    key={city.slug}
                    className="flex items-center justify-between rounded-xl border border-red-200 bg-white/80 px-3 py-2 text-sm text-red-900 dark:border-red-900/60 dark:bg-red-900/20 dark:text-red-100"
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-red-300 text-red-600 focus:ring-red-500 dark:border-red-700 dark:bg-red-900"
                        checked={checked}
                        onChange={() => toggleCity(city.slug)}
                        disabled={isResetting}
                      />
                      <span>{city.name}</span>
                    </div>
                    <span className="text-xs text-red-600 dark:text-red-300">
                      {city.found} found
                    </span>
                  </label>
                )
              })}
            </div>
            <div className="flex gap-3 text-xs">
              <button
                type="button"
                className="text-red-700 underline-offset-2 hover:underline disabled:opacity-60 dark:text-red-200"
                onClick={selectAllCities}
                disabled={isResetting}
              >
                Select all
              </button>
              <button
                type="button"
                className="text-red-700 underline-offset-2 hover:underline disabled:opacity-60 dark:text-red-200"
                onClick={clearAllCities}
                disabled={isResetting}
              >
                Clear all
              </button>
            </div>
            {isAuthenticated && cityOptions.length > 0 && resetTargets.length === 0 && (
              <p className="text-xs text-red-600 dark:text-red-300">
                Select at least one city to enable the reset button.
              </p>
            )}
          </>
        )}
      </div>
      <div>
        <button
          type="button"
          className={classNames(
            'relative w-full rounded-full border px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 dark:focus:ring-offset-zinc-900',
            'border-red-500 bg-red-600 text-white dark:border-red-400 dark:bg-red-500',
          )}
          disabled={
            disabled ||
            isResetting ||
            (isAuthenticated && cityOptions.length > 0 && resetTargets.length === 0)
          }
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onKeyDown={handleKeyDown}
          onKeyUp={handleKeyUp}
        >
          {isResetting ? 'Resetting…' : 'Hold to reset selected cities'}
        </button>
        <div className="mt-2 h-1 w-full rounded-full bg-red-200 dark:bg-red-900/40">
          <div
            className="h-full rounded-full bg-red-600 transition-[width] dark:bg-red-400"
            style={{ width: `${Math.min(holdProgress, 1) * 100}%` }}
          />
        </div>
      </div>
      {statusMessage && (
        <p
          className={classNames(
            'text-xs',
            statusVariant === 'success'
              ? 'text-emerald-700 dark:text-emerald-400'
              : statusVariant === 'error'
                ? 'text-red-700 dark:text-red-300'
                : 'text-zinc-700 dark:text-zinc-300',
          )}
          aria-live="polite"
        >
          {statusMessage}
        </p>
      )}
    </div>
  )
}

export default SettingsPanel
