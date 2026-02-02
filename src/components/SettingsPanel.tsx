'use client'

import { useAuth } from '@/context/AuthContext'
import {
  FONT_FAMILY_OPTIONS,
  FONT_SIZE_OPTIONS,
  useSettings,
} from '@/context/SettingsContext'
import useTranslation from '@/hooks/useTranslation'
import {
    ACCENT_COLOR_OPTIONS,
    type AccentColorId,
    type AccentColorOption,
} from '@/lib/accentColors'
import { cities } from '@/lib/citiesConfig'
import { GLOBAL_ACHIEVEMENT_SLUGS } from '@/lib/globalAchievements'
import { SUPPORTED_LANGUAGES } from '@/lib/i18n'
import {
    readSolutionsAccess,
    readSolutionsSelection,
    writeSolutionsAccess,
    writeSolutionsSelection,
} from '@/lib/solutionsAccess'
import { STATION_TOTALS } from '@/lib/stationTotals'
import classNames from 'classnames'
import { useTheme } from 'next-themes'
import type { KeyboardEvent } from 'react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import KeybindingRecorder from './KeybindingRecorder'

type SettingsPanelProps = {
  className?: string
  showHeading?: boolean
  onClose?: () => void
  disableScroll?: boolean
}

const THEME_OPTIONS: Array<{ value: string; label: string }> = [
  { value: 'system', label: 'systemDefault' },
  { value: 'light', label: 'light' },
  { value: 'dark', label: 'dark' },
]

const CURATED_TIMEZONES: string[] = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Phoenix',
  'America/Toronto',
  'America/Vancouver',
  'America/Mexico_City',
  'America/Bogota',
  'America/Sao_Paulo',
  'Europe/London',
  'Europe/Dublin',
  'Europe/Lisbon',
  'Europe/Paris',
  'Europe/Berlin',
  'Europe/Madrid',
  'Europe/Rome',
  'Europe/Warsaw',
  'Europe/Athens',
  'Europe/Moscow',
  'Africa/Cairo',
  'Africa/Johannesburg',
  'Asia/Dubai',
  'Asia/Jerusalem',
  'Asia/Kolkata',
  'Asia/Bangkok',
  'Asia/Hong_Kong',
  'Asia/Tokyo',
  'Asia/Seoul',
  'Australia/Sydney',
  'Pacific/Auckland',
]

const LOCAL_PROGRESS_EVENT = 'local-progress-refresh'

const unlockAllAchievements = () => {
  if (typeof window === 'undefined') return
  try {
    const raw = window.localStorage.getItem('mm-achievements-earned')
    const parsed = raw ? JSON.parse(raw) : []
    const entries = Array.isArray(parsed) ? parsed.filter((id) => typeof id === 'string') : []
    const set = new Set(entries)
    GLOBAL_ACHIEVEMENT_SLUGS.forEach((slug) => set.add(slug))
    window.localStorage.setItem('mm-achievements-earned', JSON.stringify(Array.from(set)))
    window.dispatchEvent(new Event('storage'))
  } catch {
    // ignore
  }
}

const SettingsPanel = ({ className, showHeading = true, disableScroll = false }: SettingsPanelProps) => {
  const {
    settings,
    setConfettiEnabled,
    setAchievementToastsEnabled,
    setAchievementToastDurationSec,
    setStopConfettiAfterCompletion,
    setAutoSubmitOnMatch,
    setAccentColor,
    setFontSize,
    setFontFamily,
    setLanguage,
    setTimezone,
    setHourFormat,
    setKeybinding,
    notifySettingsSaved,
  } = useSettings()
  const { t } = useTranslation()
  const { theme, setTheme } = useTheme()
  const auth = useAuth()
  const currentTheme = theme ?? 'system'
  const timezoneOptions = useMemo(() => {
    const supportedValuesOf =
      typeof Intl !== 'undefined' && 'supportedValuesOf' in Intl
        ? (Intl as unknown as { supportedValuesOf?: (key: string) => string[] }).supportedValuesOf
        : undefined
    const supportedTimezones =
      typeof supportedValuesOf === 'function' ? supportedValuesOf('timeZone') ?? [] : []
    const combined = [...CURATED_TIMEZONES, ...supportedTimezones]
    const withCurrent =
      settings.timezone && !combined.includes(settings.timezone)
        ? [settings.timezone, ...combined]
        : combined
    return Array.from(new Set(withCurrent))
  }, [settings.timezone])
  const [isLocating, setIsLocating] = useState(false)
  const [timezoneStatus, setTimezoneStatus] = useState<string | null>(null)
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
  const handleGetTimezone = useCallback(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setTimezoneStatus(t('getTimezoneError'))
      return
    }
    setIsLocating(true)
    setTimezoneStatus(t('getTimezoneRequest'))
    navigator.geolocation.getCurrentPosition(
      () => {
        const resolvedTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone ?? 'UTC'
        setTimezone(resolvedTimezone)
        setTimezoneStatus(t('getTimezoneSuccess', { timezone: resolvedTimezone }))
        setIsLocating(false)
      },
      () => {
        setTimezoneStatus(t('getTimezoneError'))
        setIsLocating(false)
      },
      { timeout: 10000 },
    )
  }, [setTimezone, t])

  return (
    <div
      className={classNames(
        'space-y-6 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-[#18181b] dark:bg-zinc-900',
        !disableScroll && 'max-h-[70vh] overflow-y-auto',
        'w-full',
        className,
      )}
    >
      {showHeading && (
        <h3 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">{t('settings')}</h3>
      )}
      <div className="space-y-4">
        <SettingToggle
          label={t('celebrationConfetti')}
          description={t('celebrationConfettiDesc')}
          checked={settings.confettiEnabled}
          onChange={setConfettiEnabled}
        />
        <SettingToggle
          label={t('hideConfetti')}
          description={t('hideConfettiDesc')}
          checked={settings.stopConfettiAfterCompletion}
          onChange={setStopConfettiAfterCompletion}
        />
        <SettingToggle
          label={t('achievementToasts')}
          description={t('achievementToastsDesc')}
          checked={settings.achievementToastsEnabled}
          onChange={setAchievementToastsEnabled}
        />
        <div className="flex items-center justify-between gap-4 rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-[#18181b] dark:bg-zinc-900/40">
          <div>
            <p className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              Achievement toast duration
            </p>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              How long achievement toasts stay on screen (in seconds).
            </p>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={3}
              max={120}
              step={1}
              value={settings.achievementToastDurationSec}
              onChange={(event) =>
                setAchievementToastDurationSec(Number(event.target.value || 0))
              }
              className="w-20 rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm font-semibold text-zinc-900 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
            />
            <span className="text-sm text-zinc-500 dark:text-zinc-400">sec</span>
          </div>
        </div>
        <SettingToggle
          label="Auto submit on match"
          description="Automatically submit when your input exactly matches a station."
          checked={settings.autoSubmitOnMatch}
          onChange={setAutoSubmitOnMatch}
        />
      </div>
      <div className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          {t('language')}
        </p>
        <div className="grid grid-cols-2 gap-2 justify-items-center sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {SUPPORTED_LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              type="button"
              onClick={() => setLanguage(lang.code)}
              className={classNames(
                'w-full rounded-full px-4 py-2 text-center text-sm font-semibold transition',
                settings.language === lang.code
                  ? 'bg-[var(--accent-600)] text-white dark:bg-[var(--accent-500)]'
                  : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700',
              )}
            >
              {lang.label}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          {t('timezone')}
        </p>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">{t('timezoneDesc')}</p>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
          <div className="relative w-full sm:flex-1">
            <select
              value={settings.timezone}
              onChange={(event) => {
                setTimezone(event.target.value)
                setTimezoneStatus(null)
              }}
              className="w-full appearance-none rounded-xl border border-zinc-200 bg-white px-4 py-3 pr-10 text-left text-sm font-semibold text-zinc-900 shadow-sm transition hover:border-zinc-300 focus:border-[var(--accent-500)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-ring)] dark:border-[#18181b] dark:bg-zinc-900 dark:text-zinc-100 dark:hover:border-zinc-700"
            >
              {timezoneOptions.map((timezone) => (
                <option key={timezone} value={timezone}>
                  {timezone}
                </option>
              ))}
            </select>
            <svg
              aria-hidden="true"
              className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500 dark:text-zinc-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <button
            type="button"
            onClick={handleGetTimezone}
            disabled={isLocating}
            className={classNames(
              'w-full rounded-xl px-4 py-3 text-sm font-semibold transition sm:w-auto',
              isLocating
                ? 'bg-zinc-300 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300'
                : 'bg-[var(--accent-600)] text-white hover:bg-[var(--accent-500)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-ring)] dark:bg-[var(--accent-500)] dark:hover:bg-[var(--accent-400)]',
            )}
          >
            {isLocating ? t('gettingTimezone') : t('getTimezone')}
          </button>
          <button
            type="button"
            onClick={() => {
              const next = settings.hourFormat === '24h' ? '12h' : '24h'
              setHourFormat(next)
              setTimezoneStatus(null)
            }}
            className={classNames(
              'w-full rounded-xl px-4 py-3 text-sm font-semibold transition sm:w-auto',
              'bg-zinc-100 text-zinc-800 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-[var(--accent-ring)]',
            )}
          >
            {settings.hourFormat === '24h' ? t('switchTo12Hour') : t('switchTo24Hour')}
          </button>
        </div>
        {timezoneStatus && (
          <p className="text-sm text-zinc-600 dark:text-zinc-400" aria-live="polite">
            {timezoneStatus}
          </p>
        )}
      </div>
      <div className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          {t('theme')}
        </p>
        <div className="grid grid-cols-2 gap-2 justify-items-center sm:grid-cols-3">
          {THEME_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleThemeChange(option.value)}
              className={classNames(
                'w-full rounded-full px-4 py-2 text-center text-sm font-semibold transition',
                currentTheme === option.value
                  ? 'bg-[var(--accent-600)] text-white dark:bg-[var(--accent-500)]'
                  : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700',
              )}
            >
              {t(option.label)}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          {t('accentColor')}
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {ACCENT_COLOR_OPTIONS.map((option: AccentColorOption) => {
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
                  {t(option.translationKey ?? option.label)}
                </span>
              </button>
            )
          })}
        </div>
      </div>
      <div className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Font size
        </p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {FONT_SIZE_OPTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setFontSize(option.id)}
              className={classNames(
                'w-full rounded-full px-4 py-2 text-center text-sm font-semibold transition',
                settings.fontSize === option.id
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
          Font type
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {FONT_FAMILY_OPTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setFontFamily(option.id)}
              className={classNames(
                'flex items-center gap-3 rounded-2xl border px-3 py-2 text-left transition focus:outline-none focus:ring-2 focus:ring-[var(--accent-ring)]',
                settings.fontFamily === option.id
                  ? 'border-[var(--accent-600)] bg-[color:var(--accent-50)] shadow-inner dark:border-[var(--accent-500)] dark:bg-[rgb(var(--accent-600-rgb)_/_0.25)]'
                  : 'border-zinc-200 bg-white hover:border-zinc-300 dark:border-[#18181b] dark:bg-zinc-900 dark:hover:border-zinc-700',
              )}
            >
              <span
                className="text-sm font-semibold text-zinc-900 dark:text-zinc-100"
                style={{ fontFamily: option.stack }}
              >
                {option.label}
              </span>
            </button>
          ))}
        </div>
      </div>
      <SolutionsAccessPanel onSettingsChange={notifySettingsSaved} />
      <AchievementsUnlockPanel />
      <DataTransferPanel />
      <div className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Keybindings
        </p>
        <div className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-2 dark:border-[#18181b] dark:bg-zinc-900/40">
            <KeybindingRecorder
                label="Focus Search"
                value={settings.keybindings.FOCUS_INPUT}
                onChange={(val) => setKeybinding('FOCUS_INPUT', val)}
            />
            <div className="h-px bg-zinc-200 dark:bg-zinc-800" />
            <KeybindingRecorder
                label="Clear / Close"
                value={settings.keybindings.CLEAR_INPUT}
                onChange={(val) => setKeybinding('CLEAR_INPUT', val)}
            />
            <div className="h-px bg-zinc-200 dark:bg-zinc-800" />
            <KeybindingRecorder
                label="Toggle Zen Mode"
                value={settings.keybindings.TOGGLE_ZEN_MODE}
                onChange={(val) => setKeybinding('TOGGLE_ZEN_MODE', val)}
            />
            <div className="h-px bg-zinc-200 dark:bg-zinc-800" />
            <KeybindingRecorder
                label="Toggle Speedrun"
                value={settings.keybindings.TOGGLE_SPEEDRUN}
                onChange={(val) => setKeybinding('TOGGLE_SPEEDRUN', val)}
            />
             <div className="h-px bg-zinc-200 dark:bg-zinc-800" />
            <KeybindingRecorder
                label="Toggle Sidebar"
                value={settings.keybindings.TOGGLE_SIDEBAR}
                onChange={(val) => setKeybinding('TOGGLE_SIDEBAR', val)}
            />
             <div className="h-px bg-zinc-200 dark:bg-zinc-800" />
            <KeybindingRecorder
                label="Toggle Solutions"
                value={settings.keybindings.TOGGLE_SOLUTIONS}
                onChange={(val) => setKeybinding('TOGGLE_SOLUTIONS', val)}
            />
            <div className="h-px bg-zinc-200 dark:bg-zinc-800" />
            <KeybindingRecorder
                label="Toggle Station Labels"
                value={settings.keybindings.TOGGLE_LABELS}
                onChange={(val) => setKeybinding('TOGGLE_LABELS', val)}
            />
            <div className="h-px bg-zinc-200 dark:bg-zinc-800" />
            <KeybindingRecorder
                label="Toggle Map Names"
                value={settings.keybindings.TOGGLE_MAP_NAMES}
                onChange={(val) => setKeybinding('TOGGLE_MAP_NAMES', val)}
            />
            <div className="h-px bg-zinc-200 dark:bg-zinc-800" />
            <KeybindingRecorder
                label="Toggle Satellite"
                value={settings.keybindings.TOGGLE_SATELLITE}
                onChange={(val) => setKeybinding('TOGGLE_SATELLITE', val)}
            />
            <div className="h-px bg-zinc-200 dark:bg-zinc-800" />
            <KeybindingRecorder
                label="Open City Stats"
                value={settings.keybindings.OPEN_CITY_STATS}
                onChange={(val) => setKeybinding('OPEN_CITY_STATS', val)}
            />
            <div className="h-px bg-zinc-200 dark:bg-zinc-800" />
            <KeybindingRecorder
                label="Open Achievements"
                value={settings.keybindings.OPEN_ACHIEVEMENTS}
                onChange={(val) => setKeybinding('OPEN_ACHIEVEMENTS', val)}
            />
            <div className="h-px bg-zinc-200 dark:bg-zinc-800" />
            <KeybindingRecorder
                label="Open Account"
                value={settings.keybindings.OPEN_ACCOUNT}
                onChange={(val) => setKeybinding('OPEN_ACCOUNT', val)}
            />
            <div className="h-px bg-zinc-200 dark:bg-zinc-800" />
            <KeybindingRecorder
                label="Open Settings"
                value={settings.keybindings.OPEN_SETTINGS}
                onChange={(val) => setKeybinding('OPEN_SETTINGS', val)}
            />
        </div>
      </div>
      <div className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-wide text-red-500 dark:text-red-400">
          {t('dangerZone')}
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
          checked ? 'translate-x-7' : 'translate-x-1',
        )}
      />
      <span className="sr-only">{label}</span>
    </button>
  </label>
)

const SolutionsAccessPanel = ({ onSettingsChange }: { onSettingsChange?: () => void }) => {
  const { t } = useTranslation()
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
    [
      applySolutionsProgress,
      onSettingsChange,
      passwordInput,
      solutionsCities,
      solutionsInitialized,
      solutionsMode,
    ],
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
          {t('solutions')}
        </p>
        <p className="text-sm text-zinc-600 dark:text-zinc-300">
          {t('solutionsDesc')}
        </p>
      </div>
      {!hasAccess ? (
        <form className="space-y-2" onSubmit={handleSolutionsPasswordSubmit}>
          <label className="text-xs font-semibold uppercase text-zinc-500 dark:text-zinc-400">
            {t('enterPassword')}
          </label>
          <div className="flex gap-2">
            <input
              type="password"
              value={passwordInput}
              onChange={(event) => setPasswordInput(event.target.value)}
              className="flex-1 rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
              placeholder={t('password')}
            />
            <button
              type="submit"
              className="rounded-xl bg-[var(--accent-600)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--accent-500)] disabled:opacity-60 dark:bg-[var(--accent-600)] dark:hover:bg-[var(--accent-500)]"
              disabled={!passwordInput.trim()}
            >
              {t('unlock')}
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
              {t('revealEveryCity')}
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
              {t('selectSpecificCities')}
            </button>
          </div>
          {isCustomMode && (
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3 text-xs text-zinc-600 dark:text-zinc-400">
                <span>
                  {t('selectedCount', { count: selectedCount, total: allCityOptions.length })}
                </span>
                <div className="flex gap-3">
                  <button
                    type="button"
                    className="text-[var(--accent-600)] underline-offset-2 hover:underline dark:text-[var(--accent-300)]"
                    onClick={handleSelectAllCities}
                  >
                    {t('selectAll')}
                  </button>
                  <button
                    type="button"
                    className="text-[var(--accent-600)] underline-offset-2 hover:underline dark:text-[var(--accent-300)]"
                    onClick={handleClearAllCities}
                  >
                    {t('clearAll')}
                  </button>
                </div>
              </div>
              <input
                type="text"
                value={cityFilter}
                onChange={(event) => setCityFilter(event.target.value)}
                placeholder={t('searchCities')}
                className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
              />
              <div className="max-h-48 space-y-2 overflow-y-auto rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900">
                {filteredCities.length === 0 && (
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {t('noCitiesMatch')}
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
            {t('solutionsAutoMark')}
          </p>
        </div>
      )}
    </div>
  )
}

const AchievementsUnlockPanel = () => {
  const [passwordInput, setPasswordInput] = useState('')
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const handleUnlockSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      const password = passwordInput.trim()
      if (!password) {
        return
      }
      setPasswordError(null)
      setSuccessMessage(null)
      try {
        const response = await fetch('/api/solutions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password }),
        })
        const payload = await response.json().catch(() => ({}))
        if (!response.ok || !payload?.success) {
          setPasswordError('Incorrect passphrase. Try again.')
          return
        }
        unlockAllAchievements()
        setSuccessMessage('All achievements unlocked.')
        setPasswordInput('')
      } catch (error) {
        setPasswordError('Unable to verify passphrase. Please try again.')
        if (process.env.NODE_ENV !== 'production') {
          console.error(error)
        }
      }
    },
    [passwordInput],
  )

  return (
    <div className="space-y-3 rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-[#18181b] dark:bg-zinc-900/40">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Unlock all achievements
        </p>
        <p className="text-sm text-zinc-600 dark:text-zinc-300">
          Enter the solutions passphrase to unlock every achievement.
        </p>
      </div>
      <form className="space-y-2" onSubmit={handleUnlockSubmit}>
        <label className="text-xs font-semibold uppercase text-zinc-500 dark:text-zinc-400">
          Passphrase
        </label>
        <div className="flex gap-2">
          <input
            type="password"
            value={passwordInput}
            onChange={(event) => setPasswordInput(event.target.value)}
            className="flex-1 rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
            placeholder="Passphrase"
          />
          <button
            type="submit"
            className="rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-400 disabled:opacity-60"
            disabled={!passwordInput.trim()}
          >
            Unlock
          </button>
        </div>
        {passwordError && (
          <p className="text-xs text-red-600 dark:text-red-300">{passwordError}</p>
        )}
        {successMessage && (
          <p className="text-xs text-emerald-600 dark:text-emerald-300">{successMessage}</p>
        )}
      </form>
    </div>
  )
}

const DataTransferPanel = () => {
  const [status, setStatus] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const collectLocalStorage = useCallback(() => {
    const data: Record<string, string> = {}
    if (typeof window === 'undefined') return data
    for (let i = 0; i < window.localStorage.length; i += 1) {
      const key = window.localStorage.key(i)
      if (!key) continue
      const value = window.localStorage.getItem(key)
      if (value !== null) {
        data[key] = value
      }
    }
    return data
  }, [])

  const handleExport = useCallback(() => {
    if (typeof window === 'undefined') return
    setStatus(null)
    setError(null)
    const payload = {
      version: 1,
      exportedAt: new Date().toISOString(),
      data: collectLocalStorage(),
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    const dateStamp = new Date().toISOString().slice(0, 10)
    anchor.href = url
    anchor.download = `metro-memory-export-${dateStamp}.json`
    anchor.click()
    URL.revokeObjectURL(url)
    setStatus('Exported data successfully.')
  }, [collectLocalStorage])

  const handleImportFile = useCallback(async (file: File) => {
    setStatus(null)
    setError(null)
    try {
      const text = await file.text()
      const parsed = JSON.parse(text)
      const rawData =
        parsed && typeof parsed === 'object' && !Array.isArray(parsed) && 'data' in parsed
          ? (parsed as { data?: Record<string, unknown> }).data
          : parsed
      if (!rawData || typeof rawData !== 'object' || Array.isArray(rawData)) {
        setError('Invalid file format.')
        return
      }
      const entries = rawData as Record<string, unknown>
      if (typeof window !== 'undefined') {
        Object.entries(entries).forEach(([key, value]) => {
          if (value === null || value === undefined) {
            window.localStorage.removeItem(key)
            return
          }
          if (typeof value === 'string') {
            window.localStorage.setItem(key, value)
          } else {
            window.localStorage.setItem(key, JSON.stringify(value))
          }
        })
        window.dispatchEvent(new Event('storage'))
        window.dispatchEvent(new Event(LOCAL_PROGRESS_EVENT))
      }
      setStatus('Import complete. Refresh if anything looks stale.')
    } catch (err) {
      setError('Unable to import file.')
    }
  }, [])

  const handleImportClick = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  return (
    <div className="space-y-3 rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-[#18181b] dark:bg-zinc-900/40">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Import & Export
        </p>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Backup or restore settings, progress, achievements, and preferences (localStorage).
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handleExport}
          className="rounded-full bg-[var(--accent-600)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--accent-500)]"
        >
          Export data
        </button>
        <button
          type="button"
          onClick={handleImportClick}
          className="rounded-full border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100 dark:border-[#18181b] dark:text-zinc-100 dark:hover:bg-zinc-800"
        >
          Import data
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0]
            if (file) {
              void handleImportFile(file)
            }
            event.target.value = ''
          }}
        />
      </div>
      {status && <p className="text-xs text-emerald-600 dark:text-emerald-300">{status}</p>}
      {error && <p className="text-xs text-red-600 dark:text-red-300">{error}</p>}
    </div>
  )
}

const CITY_NAME_LOOKUP = new Map<string, string>()
cities.forEach((city) => {
  const full = city.link.replace(/^\//, '')
  CITY_NAME_LOOKUP.set(full, city.name)
  const lastSegment = full.split('/').pop()
  if (lastSegment) {
    // also index by slug (e.g., "lr", "ny") so reset dialogs show full names
    if (!CITY_NAME_LOOKUP.has(lastSegment)) {
      CITY_NAME_LOOKUP.set(lastSegment, city.name)
    }
  }
})

const getCityName = (slug: string) => {
  if (CITY_NAME_LOOKUP.has(slug)) {
    return CITY_NAME_LOOKUP.get(slug)!
  }
  return slug
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

const getSlugFromLink = (link: string) => {
  if (!link.startsWith('/')) {
    return null
  }
  const path = link.replace(/^\//, '').split(/[?#]/)[0]
  const segments = path.split('/').filter(Boolean)
  return segments.length ? segments[segments.length - 1] : null
}

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

const ACHIEVEMENT_STORAGE_KEYS = [
  'mm-achievements-earned',
  'mm-completions',
  'mm-play-days',
  'mm-streak-count',
  'mm-last-play-date',
  'mm-play-months',
  'mm-weekend-streak',
  'mm-weekend-last',
  'mm-line-master-keys',
  'mm-map-names-toggles',
  'mm-global-unique-stations',
  'mm-favorites-completed',
  'mm-stats-opened',
]

const ACHIEVEMENT_STORAGE_PREFIXES = [
  'mm-city-unique-stations-',
  'speedrun-best-',
  'speedrun-start-',
]

const clearAchievementStorage = () => {
  if (typeof window === 'undefined') {
    return 0
  }
  let removed = 0
  ACHIEVEMENT_STORAGE_KEYS.forEach((key) => {
    if (window.localStorage.getItem(key) !== null) {
      window.localStorage.removeItem(key)
      removed += 1
    }
  })
  for (let i = 0; i < window.localStorage.length; i += 1) {
    const key = window.localStorage.key(i)
    if (!key) continue
    if (ACHIEVEMENT_STORAGE_PREFIXES.some((prefix) => key.startsWith(prefix))) {
      window.localStorage.removeItem(key)
      removed += 1
    }
  }
  return removed
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
  const { t } = useTranslation()
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
        if (!slug) {
          return
        }
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
  }, [progressSummaries, localProgressVersion, cities])
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
      clearAchievementStorage()
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
          setStatusMessage(t('signInToClear'))
        } else if (!response.ok) {
          throw new Error('Failed to reset progress')
        } else {
          await onResetComplete?.()
          setStatusVariant('success')
          setStatusMessage(t('resetStatusSuccess'))
        }
      } else {
        setStatusVariant('success')
        setStatusMessage(t('resetStatusLocalSuccess'))
      }
    } catch (error) {
      setStatusVariant('error')
      setStatusMessage(t('resetStatusError'))
      if (process.env.NODE_ENV !== 'production') {
        console.error(error)
      }
    } finally {
      setIsResetting(false)
      setHoldProgress(0)
    }
  }, [isAuthenticated, onLogout, onResetComplete, resetTargets, t])

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
          {t('resetSavedProgressTitle')}
        </p>
        <p className="text-red-700 dark:text-red-300">
          {t('resetSavedProgressDesc')}
        </p>
      </div>
      <div className="space-y-2">
        {cityOptions.length === 0 ? (
          <p className="text-xs text-red-600 dark:text-red-300">
            {t('resetNoProgress')}
          </p>
        ) : (
          <>
            <p className="text-xs font-semibold text-red-700 dark:text-red-200">
              {t('resetChooseCities')}
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
                      {t('resetFoundLabel', { count: city.found })}
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
                {t('selectAll')}
              </button>
              <button
                type="button"
                className="text-red-700 underline-offset-2 hover:underline disabled:opacity-60 dark:text-red-200"
                onClick={clearAllCities}
                disabled={isResetting}
              >
                {t('clearAll')}
              </button>
            </div>
            {isAuthenticated && cityOptions.length > 0 && resetTargets.length === 0 && (
              <p className="text-xs text-red-600 dark:text-red-300">
                {t('resetSelectPrompt')}
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
          {isResetting ? t('resetButtonResetting') : t('resetButtonHold')}
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
