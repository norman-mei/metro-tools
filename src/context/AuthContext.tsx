'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useRef,
} from 'react'

import {
  mergeCollapsedSections,
  normalizeUiPreferences,
  type UiPreferences,
} from '@/lib/preferences'
import { useSettings } from '@/context/SettingsContext'

type AuthUser = {
  id: string
  email: string
}

type ProgressSummaries = Record<string, number>

type AuthContextValue = {
  user: AuthUser | null
  loading: boolean
  refresh: () => Promise<void>
  progressSummaries: ProgressSummaries
  updateProgressSummary: (citySlug: string, foundCount: number) => void
  logoutLocally: () => void
  uiPreferences: UiPreferences
  setCollapsedSectionPreference: (
    sectionId: string,
    collapsed: boolean,
  ) => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { settings, setLanguage } = useSettings()
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [progressSummaries, setProgressSummaries] = useState<ProgressSummaries>({})
  const [uiPreferences, setUiPreferences] = useState<UiPreferences>({})
  const languageInitializedRef = useRef(false)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/auth/session', { cache: 'no-store' })
      if (!response.ok) {
        setUser(null)
        setProgressSummaries({})
        setUiPreferences({})
        return
      }
      const data = await response.json()
      setUser(data.user)
      if (Array.isArray(data.progressSummaries)) {
        const summaries: ProgressSummaries = {}
        data.progressSummaries.forEach(
          (entry: { citySlug?: string; foundCount?: number }) => {
            if (entry?.citySlug) {
              summaries[entry.citySlug] = entry.foundCount ?? 0
            }
          },
        )
        setProgressSummaries(summaries)
      } else {
        setProgressSummaries({})
      }
      setUiPreferences(normalizeUiPreferences(data.uiPreferences))
    } catch {
      setUser(null)
      setProgressSummaries({})
      setUiPreferences({})
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const updateProgressSummary = useCallback(
    (citySlug: string, foundCount: number) => {
      setProgressSummaries((prev) => ({
        ...prev,
        [citySlug]: foundCount,
      }))
    },
    [],
  )

  const logoutLocally = useCallback(() => {
    setUser(null)
    setProgressSummaries({})
    setUiPreferences({})
  }, [])

  const setCollapsedSectionPreference = useCallback(
    async (sectionId: string, collapsed: boolean) => {
      if (!user) return

      setUiPreferences((prev) => ({
        ...prev,
        collapsedSections: mergeCollapsedSections(prev.collapsedSections, {
          [sectionId]: collapsed,
        }),
      }))

      try {
        const response = await fetch('/api/user/preferences', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            collapsedSections: { [sectionId]: collapsed },
          }),
        })

        if (!response.ok) {
          if (response.status === 401) {
            setUser(null)
            setProgressSummaries({})
            setUiPreferences({})
          }
          return
        }

        const payload = await response.json().catch(() => ({}))
        setUiPreferences(normalizeUiPreferences(payload.preferences))
      } catch {
        // ignore network errors; local optimistic state already applied
      }
    },
    [user],
  )

  const value = useMemo(
    () => ({
      user,
      loading,
      refresh,
      progressSummaries,
      updateProgressSummary,
      logoutLocally,
      uiPreferences,
      setCollapsedSectionPreference,
    }),
    [
      user,
      loading,
      refresh,
      progressSummaries,
      updateProgressSummary,
      logoutLocally,
      uiPreferences,
      setCollapsedSectionPreference,
    ],
  )

  useEffect(() => {
    if (!user) {
      languageInitializedRef.current = false
      return
    }

    if (
      uiPreferences.language &&
      uiPreferences.language !== settings.language
    ) {
      setLanguage(uiPreferences.language, { silent: true })
      return
    }

    languageInitializedRef.current = true
  }, [setLanguage, settings.language, uiPreferences.language, user])

  useEffect(() => {
    if (!user || !languageInitializedRef.current) {
      return
    }

    if (uiPreferences.language === settings.language) {
      return
    }

    const controller = new AbortController()
    const persistLanguage = async () => {
      try {
        const response = await fetch('/api/user/preferences', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ language: settings.language }),
          signal: controller.signal,
        })

        if (!response.ok) {
          if (response.status === 401) {
            setUser(null)
            setProgressSummaries({})
            setUiPreferences({})
          }
          return
        }

        const payload = await response.json().catch(() => ({}))
        setUiPreferences(normalizeUiPreferences(payload.preferences))
      } catch {
        // ignore network errors; local optimistic state already applied
      }
    }

    void persistLanguage()

    return () => controller.abort()
  }, [setProgressSummaries, setUser, settings.language, uiPreferences.language, user])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return ctx
}
