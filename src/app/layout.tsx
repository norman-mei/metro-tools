import SettingsSaveToast from '@/components/SettingsSaveToast'
import ThemeProviderClient from '@/components/ThemeProviderClient'
import AdRails from '@/components/ads/AdRails'
import ServiceWorkerRegister from '@/components/ServiceWorkerRegister'
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
  manifest: '/manifest.webmanifest',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          id="adsense-script"
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3699451541563331"
          crossOrigin="anonymous"
        />
      </head>
      <body className="bg-zinc-50 text-zinc-900 antialiased dark:bg-black dark:text-zinc-100">
        <ThemeProviderClient>
          <SettingsProvider>
            <AuthProvider>
              <AdRails />
              <ServiceWorkerRegister />
              {children}
            </AuthProvider>
            <SettingsSaveToast />
          </SettingsProvider>
        </ThemeProviderClient>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
