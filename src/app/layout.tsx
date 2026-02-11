import AdRails from '@/components/ads/AdRails'
import ServiceWorkerRegister from '@/components/ServiceWorkerRegister'
import SettingsSaveToast from '@/components/SettingsSaveToast'
import ThemeProviderClient from '@/components/ThemeProviderClient'
import { AuthProvider } from '@/context/AuthContext'
import { SettingsProvider } from '@/context/SettingsContext'
import { ADSENSE_SCRIPT_SRC } from '@/lib/adsense'
import '@/styles/tailwind.css'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { Metadata, Viewport } from 'next'

export const metadata: Metadata = {
  metadataBase: new URL('https://metro-memory.com'),
  icons: {
    icon: '/icon.ico',
    shortcut: '/icon.ico',
    apple: '/icon.ico',
  },
  manifest: '/manifest.webmanifest',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
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
          src={ADSENSE_SCRIPT_SRC}
          crossOrigin="anonymous"
        />
      </head>
      <body className="bg-zinc-50 text-zinc-900 antialiased dark:bg-black dark:text-zinc-100">
        <div className="fixed top-0 left-0 right-0 z-50 h-[env(safe-area-inset-top)] bg-black" />
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
