import SettingsSaveToast from '@/components/SettingsSaveToast'
import ThemeProviderClient from '@/components/ThemeProviderClient'
import { AuthProvider } from '@/context/AuthContext'
import { SettingsProvider } from '@/context/SettingsContext'
import '@/styles/tailwind.css'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { Metadata } from 'next'

export const metadata: Metadata = {
  metadataBase: new URL('https://metro-memory.com'),
  icons: {
    icon: '/icon.ico',
    shortcut: '/icon.ico',
    apple: '/icon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-zinc-50 text-zinc-900 antialiased dark:bg-black dark:text-zinc-100">
        <ThemeProviderClient>
          <SettingsProvider>
            <AuthProvider>{children}</AuthProvider>
            <SettingsSaveToast />
          </SettingsProvider>
        </ThemeProviderClient>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
