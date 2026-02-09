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
import Script from 'next/script'
import { ADSENSE_SCRIPT_SRC } from '@/lib/adsense'

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
        <Script
          id="adsense-script"
          async
          src={ADSENSE_SCRIPT_SRC}
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </body>
    </html>
  )
}
