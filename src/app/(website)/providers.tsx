'use client'

import { createContext, useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

import ThemeProviderClient from '@/components/ThemeProviderClient'
import SettingsSaveToast from '@/components/SettingsSaveToast'
import { AuthProvider } from '@/context/AuthContext'
import { SettingsProvider } from '@/context/SettingsContext'

function usePrevious<T>(value: T) {
  const ref = useRef<T>()

  useEffect(() => {
    ref.current = value
  }, [value])

  return ref.current
}

export const AppContext = createContext<{ previousPathname?: string }>({})

export function Providers({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const previousPathname = usePrevious(pathname)

  return (
    <AppContext.Provider value={{ previousPathname }}>
      <ThemeProviderClient>
        <SettingsProvider>
          <AuthProvider>{children}</AuthProvider>
          <SettingsSaveToast />
        </SettingsProvider>
      </ThemeProviderClient>
    </AppContext.Provider>
  )
}
