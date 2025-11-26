import { Analytics } from '@vercel/analytics/next'
import { Metadata } from 'next'
import ThemeProviderClient from '@/components/ThemeProviderClient'
import { AuthProvider } from '@/context/AuthContext'
import { SettingsProvider } from '@/context/SettingsContext'
import SettingsSaveToast from '@/components/SettingsSaveToast'
import '@/styles/tailwind.css'

export const metadata: Metadata = {
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
      </body>
    </html>
  )
}
