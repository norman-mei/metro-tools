'use client'

import {
    ACCENT_COLOR_MAP,
    DEFAULT_ACCENT_COLOR_ID,
    type AccentColorId,
} from '@/lib/accentColors'
import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from 'react'

const hexToRgb = (hex: string) => {
  const normalized = hex.replace('#', '')
  if (normalized.length !== 6) {
    return '0, 0, 0'
  }
  const r = parseInt(normalized.slice(0, 2), 16)
  const g = parseInt(normalized.slice(2, 4), 16)
  const b = parseInt(normalized.slice(4, 6), 16)
  return `${r}, ${g}, ${b}`
}

type Settings = {
  confettiEnabled: boolean
  achievementToastsEnabled: boolean
  stopConfettiAfterCompletion: boolean
  accentColor: AccentColorId
  language: string
  timezone: string
  hourFormat: '12h' | '24h'
}

type UpdateSettingsOptions = { silent?: boolean }

const DEFAULT_SETTINGS: Settings = {
  confettiEnabled: true,
  achievementToastsEnabled: true,
  stopConfettiAfterCompletion: false,
  accentColor: DEFAULT_ACCENT_COLOR_ID,
  language: 'en',
  timezone: 'UTC',
  hourFormat: '24h',
}

const STORAGE_KEY = 'metro-memory-settings'

type SettingsContextValue = {
  settings: Settings
  setConfettiEnabled: (enabled: boolean) => void
  setAchievementToastsEnabled: (enabled: boolean) => void
  setStopConfettiAfterCompletion: (enabled: boolean) => void
  setAccentColor: (accent: AccentColorId) => void
  setLanguage: (language: string, options?: UpdateSettingsOptions) => void
  setTimezone: (timezone: string, options?: UpdateSettingsOptions) => void
  setHourFormat: (format: '12h' | '24h', options?: UpdateSettingsOptions) => void
  notifySettingsSaved: () => void
  lastSavedAt: number
}

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined)

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS)
  const [lastSavedAt, setLastSavedAt] = useState(0)

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const parsed = JSON.parse(raw)
      if (typeof parsed === 'object' && parsed !== null) {
        if (
          typeof parsed.confettiEnabled === 'boolean' &&
          typeof parsed.achievementToastsEnabled === 'boolean'
        ) {
          setSettings({
            confettiEnabled: parsed.confettiEnabled,
            achievementToastsEnabled: parsed.achievementToastsEnabled,
            stopConfettiAfterCompletion:
              typeof parsed.stopConfettiAfterCompletion === 'boolean'
                ? parsed.stopConfettiAfterCompletion
                : DEFAULT_SETTINGS.stopConfettiAfterCompletion,
            accentColor:
              typeof parsed.accentColor === 'string' &&
              parsed.accentColor in ACCENT_COLOR_MAP
                ? (parsed.accentColor as AccentColorId)
                : DEFAULT_SETTINGS.accentColor,
            language:
              typeof parsed.language === 'string'
                ? parsed.language
                : DEFAULT_SETTINGS.language,
            timezone:
              typeof parsed.timezone === 'string'
                ? parsed.timezone
                : DEFAULT_SETTINGS.timezone,
            hourFormat:
              parsed.hourFormat === '12h' || parsed.hourFormat === '24h'
                ? parsed.hourFormat
                : DEFAULT_SETTINGS.hourFormat,
          })
        }
      }
    } catch {
      // ignore malformed entries
    }
  }, [])

  useEffect(() => {
    if (typeof document === 'undefined') return
    const accent =
      ACCENT_COLOR_MAP[settings.accentColor] ??
      ACCENT_COLOR_MAP[DEFAULT_ACCENT_COLOR_ID]
    const root = document.documentElement
    Object.entries(accent.palette).forEach(([stop, value]) => {
      root.style.setProperty(`--accent-${stop}`, value)
    })
    root.style.setProperty('--accent-ring', accent.ring)
    root.style.setProperty('--accent-600-rgb', hexToRgb(accent.palette[600]))
    root.dataset.accent = accent.id
  }, [settings.accentColor])

  const persist = useCallback((next: Settings) => {
    if (typeof window === 'undefined') return
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    } catch {
      // ignore storage errors
    }
  }, [])

  const notifySettingsSaved = useCallback(() => {
    setLastSavedAt(Date.now())
  }, [])

  const updateSettings = useCallback(
    (partial: Partial<Settings>, options?: UpdateSettingsOptions) => {
      setSettings((prev) => {
        const entries = Object.entries(partial) as [keyof Settings, Settings[keyof Settings]][]
        const shouldUpdate = entries.some(
          ([key, value]) => value !== undefined && prev[key] !== value,
        )
        if (!shouldUpdate) {
          return prev
        }
        const next = { ...prev, ...partial }
        persist(next)
        if (!options?.silent) {
          notifySettingsSaved()
        }
        return next
      })
    },
    [persist, notifySettingsSaved],
  )

  const value = useMemo(
    () => ({
      settings,
      setConfettiEnabled: (enabled: boolean) => updateSettings({ confettiEnabled: enabled }),
      setAchievementToastsEnabled: (enabled: boolean) =>
        updateSettings({ achievementToastsEnabled: enabled }),
      setStopConfettiAfterCompletion: (enabled: boolean) =>
        updateSettings({ stopConfettiAfterCompletion: enabled }),
      setAccentColor: (accent: AccentColorId) => {
        if (accent in ACCENT_COLOR_MAP) {
          updateSettings({ accentColor: accent })
        }
      },
      setLanguage: (language: string, options?: UpdateSettingsOptions) =>
        updateSettings({ language }, options),
      setTimezone: (timezone: string, options?: UpdateSettingsOptions) =>
        updateSettings({ timezone }, options),
      setHourFormat: (format: '12h' | '24h', options?: UpdateSettingsOptions) =>
        updateSettings({ hourFormat: format }, options),
      notifySettingsSaved,
      lastSavedAt,
    }),
    [settings, updateSettings, notifySettingsSaved, lastSavedAt],
  )

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
}

export const useSettings = () => {
  const ctx = useContext(SettingsContext)
  if (!ctx) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }
  return ctx
}
