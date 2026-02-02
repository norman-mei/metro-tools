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

export type FontSizeId = 'sm' | 'md' | 'lg' | 'xl'
export type FontFamilyId =
  | 'system'
  | 'humanist'
  | 'geometric'
  | 'rounded'
  | 'slab'
  | 'condensed'
  | 'serif'
  | 'mono'

export const FONT_SIZE_OPTIONS: Array<{ id: FontSizeId; label: string; value: string }> = [
  { id: 'sm', label: 'Small', value: '14px' },
  { id: 'md', label: 'Medium', value: '16px' },
  { id: 'lg', label: 'Large', value: '18px' },
  { id: 'xl', label: 'Extra Large', value: '20px' },
]

export const FONT_FAMILY_OPTIONS: Array<{ id: FontFamilyId; label: string; stack: string }> = [
  {
    id: 'system',
    label: 'System',
    stack:
      'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
  },
  {
    id: 'humanist',
    label: 'Humanist',
    stack: '"Trebuchet MS", "Segoe UI", "Helvetica Neue", Arial, sans-serif',
  },
  {
    id: 'geometric',
    label: 'Geometric',
    stack: '"Futura", "Century Gothic", "Avant Garde", "Trebuchet MS", Arial, sans-serif',
  },
  {
    id: 'rounded',
    label: 'Rounded',
    stack: '"Arial Rounded MT Bold", "Trebuchet MS", Arial, sans-serif',
  },
  {
    id: 'slab',
    label: 'Slab',
    stack: '"Rockwell", "Roboto Slab", "Times New Roman", serif',
  },
  {
    id: 'condensed',
    label: 'Condensed',
    stack: '"Arial Narrow", "Helvetica Neue Condensed", "Roboto Condensed", Arial, sans-serif',
  },
  {
    id: 'serif',
    label: 'Serif',
    stack: 'Georgia, "Times New Roman", serif',
  },
  {
    id: 'mono',
    label: 'Monospace',
    stack: '"SFMono-Regular", Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
  },
]

const FONT_SIZE_MAP = FONT_SIZE_OPTIONS.reduce<Record<FontSizeId, string>>((acc, option) => {
  acc[option.id] = option.value
  return acc
}, {} as Record<FontSizeId, string>)

const FONT_FAMILY_MAP = FONT_FAMILY_OPTIONS.reduce<Record<FontFamilyId, string>>((acc, option) => {
  acc[option.id] = option.stack
  return acc
}, {} as Record<FontFamilyId, string>)

type Settings = {
  confettiEnabled: boolean
  achievementToastsEnabled: boolean
  achievementToastDurationSec: number
  stopConfettiAfterCompletion: boolean
  autoSubmitOnMatch: boolean
  accentColor: AccentColorId
  fontSize: FontSizeId
  fontFamily: FontFamilyId
  language: string
  timezone: string
  hourFormat: '12h' | '24h'
  keybindings: Record<KeybindingAction, string>
}

export type KeybindingAction =
  | 'FOCUS_INPUT'
  | 'CLEAR_INPUT'
  | 'TOGGLE_ZEN_MODE'
  | 'TOGGLE_SIDEBAR'
  | 'TOGGLE_SOLUTIONS'
  | 'TOGGLE_SPEEDRUN'
  | 'OPEN_ACHIEVEMENTS'
  | 'OPEN_ACCOUNT'
  | 'OPEN_SETTINGS'
  | 'OPEN_CITY_STATS'
  | 'TOGGLE_LABELS'
  | 'TOGGLE_MAP_NAMES'
  | 'TOGGLE_SATELLITE'

export const DEFAULT_KEYBINDINGS: Record<KeybindingAction, string> = {
  FOCUS_INPUT: '/',
  CLEAR_INPUT: 'Escape',
  TOGGLE_ZEN_MODE: 'Alt+z',
  TOGGLE_SIDEBAR: 'Alt+b',
  TOGGLE_SOLUTIONS: 'Alt+s',
  TOGGLE_SPEEDRUN: 'Alt+r',
  OPEN_ACHIEVEMENTS: 'Alt+a',
  OPEN_ACCOUNT: 'Alt+c',
  OPEN_SETTINGS: 'Alt+,',
  OPEN_CITY_STATS: 'Alt+i',
  TOGGLE_LABELS: 'Alt+l',
  TOGGLE_MAP_NAMES: 'Alt+n',
  TOGGLE_SATELLITE: 'Alt+.',
}

type UpdateSettingsOptions = { silent?: boolean }

const DEFAULT_SETTINGS: Settings = {
  confettiEnabled: true,
  achievementToastsEnabled: true,
  achievementToastDurationSec: 15,
  stopConfettiAfterCompletion: false,
  autoSubmitOnMatch: false,
  accentColor: DEFAULT_ACCENT_COLOR_ID,
  fontSize: 'md',
  fontFamily: 'system',
  language: 'en',
  timezone: 'UTC',
  hourFormat: '24h',
  keybindings: DEFAULT_KEYBINDINGS,
}

const STORAGE_KEY = 'metro-memory-settings'

type SettingsContextValue = {
  settings: Settings
  setConfettiEnabled: (enabled: boolean) => void
  setAchievementToastsEnabled: (enabled: boolean) => void
  setAchievementToastDurationSec: (seconds: number) => void
  setStopConfettiAfterCompletion: (enabled: boolean) => void
  setAutoSubmitOnMatch: (enabled: boolean) => void
  setAccentColor: (accent: AccentColorId) => void
  setFontSize: (size: FontSizeId) => void
  setFontFamily: (family: FontFamilyId) => void
  setLanguage: (language: string, options?: UpdateSettingsOptions) => void
  setTimezone: (timezone: string, options?: UpdateSettingsOptions) => void
  setHourFormat: (format: '12h' | '24h', options?: UpdateSettingsOptions) => void
  setKeybinding: (action: KeybindingAction, key: string) => void
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
            achievementToastDurationSec:
              typeof parsed.achievementToastDurationSec === 'number' &&
              Number.isFinite(parsed.achievementToastDurationSec)
                ? Math.min(Math.max(parsed.achievementToastDurationSec, 3), 120)
                : DEFAULT_SETTINGS.achievementToastDurationSec,
            stopConfettiAfterCompletion:
              typeof parsed.stopConfettiAfterCompletion === 'boolean'
                ? parsed.stopConfettiAfterCompletion
                : DEFAULT_SETTINGS.stopConfettiAfterCompletion,
            autoSubmitOnMatch:
              typeof parsed.autoSubmitOnMatch === 'boolean'
                ? parsed.autoSubmitOnMatch
                : DEFAULT_SETTINGS.autoSubmitOnMatch,
            accentColor:
              typeof parsed.accentColor === 'string' &&
              parsed.accentColor in ACCENT_COLOR_MAP
                ? (parsed.accentColor as AccentColorId)
                : DEFAULT_SETTINGS.accentColor,
            fontSize:
              typeof parsed.fontSize === 'string' &&
              parsed.fontSize in FONT_SIZE_MAP
                ? (parsed.fontSize as FontSizeId)
                : DEFAULT_SETTINGS.fontSize,
            fontFamily:
              typeof parsed.fontFamily === 'string' &&
              parsed.fontFamily in FONT_FAMILY_MAP
                ? (parsed.fontFamily as FontFamilyId)
                : DEFAULT_SETTINGS.fontFamily,
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
            keybindings:
              typeof parsed.keybindings === 'object' && parsed.keybindings !== null
                ? { ...DEFAULT_SETTINGS.keybindings, ...parsed.keybindings }
                : DEFAULT_SETTINGS.keybindings,
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
      root.style.setProperty(`--accent-${stop}-rgb`, hexToRgb(value))
    })
    root.style.setProperty('--accent-ring', accent.ring)
    root.dataset.accent = accent.id
  }, [settings.accentColor])

  useEffect(() => {
    if (typeof document === 'undefined') return
    const root = document.documentElement
    const fontSize = FONT_SIZE_MAP[settings.fontSize] ?? FONT_SIZE_MAP.md
    const fontFamily = FONT_FAMILY_MAP[settings.fontFamily] ?? FONT_FAMILY_MAP.system
    root.style.setProperty('--ui-font-size', fontSize)
    root.style.setProperty('--ui-font', fontFamily)
  }, [settings.fontFamily, settings.fontSize])

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
      setAchievementToastDurationSec: (seconds: number) =>
        updateSettings({
          achievementToastDurationSec: Math.min(Math.max(seconds, 3), 120),
        }),
      setStopConfettiAfterCompletion: (enabled: boolean) =>
        updateSettings({ stopConfettiAfterCompletion: enabled }),
      setAutoSubmitOnMatch: (enabled: boolean) =>
        updateSettings({ autoSubmitOnMatch: enabled }),
      setAccentColor: (accent: AccentColorId) => {
        if (accent in ACCENT_COLOR_MAP) {
          updateSettings({ accentColor: accent })
        }
      },
      setFontSize: (size: FontSizeId) => {
        if (size in FONT_SIZE_MAP) {
          updateSettings({ fontSize: size })
        }
      },
      setFontFamily: (family: FontFamilyId) => {
        if (family in FONT_FAMILY_MAP) {
          updateSettings({ fontFamily: family })
        }
      },
      setLanguage: (language: string, options?: UpdateSettingsOptions) =>
        updateSettings({ language }, options),
      setTimezone: (timezone: string, options?: UpdateSettingsOptions) =>
        updateSettings({ timezone }, options),
      setHourFormat: (format: '12h' | '24h', options?: UpdateSettingsOptions) =>
        updateSettings({ hourFormat: format }, options),
      setKeybinding: (action: KeybindingAction, key: string) =>
        updateSettings({
          keybindings: { ...settings.keybindings, [action]: key },
        }),
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
