import AdRails from '@/components/ads/AdRails'
import ServiceWorkerRegister from '@/components/ServiceWorkerRegister'
import SettingsSaveToast from '@/components/SettingsSaveToast'
import ThemeProviderClient from '@/components/ThemeProviderClient'
import { AuthProvider } from '@/context/AuthContext'
import { SettingsProvider } from '@/context/SettingsContext'
import { ADSENSE_CLIENT_ID, ADSENSE_SCRIPT_SRC } from '@/lib/adsense'
import '@/styles/tailwind.css'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { Metadata, Viewport } from 'next'

const FUNDING_CHOICES_PUBLISHER_ID = ADSENSE_CLIENT_ID.replace(/^ca-/, '')
const FUNDING_CHOICES_RECOVERY_SCRIPT_SRC = `https://fundingchoicesmessages.google.com/i/${FUNDING_CHOICES_PUBLISHER_ID}?ers=1`

const FUNDING_CHOICES_CONTROL_SCRIPT = `
window.googlefc = window.googlefc || {};
googlefc.controlledMessagingFunction = function (message) {
  if (!message || typeof message.proceed !== 'function') {
    return;
  }

  var completed = false;
  function proceed(showMessage) {
    if (completed) return;
    completed = true;
    message.proceed(showMessage);
  }

  var timeoutId = window.setTimeout(function () {
    proceed(true);
  }, 1200);

  fetch('/api/ads/subscriber-status', {
    credentials: 'include',
    cache: 'no-store'
  })
    .then(function (response) {
      if (!response.ok) {
        throw new Error('subscriber-status-request-failed');
      }
      return response.json();
    })
    .then(function (payload) {
      window.clearTimeout(timeoutId);
      proceed(!(payload && payload.adFree));
    })
    .catch(function () {
      window.clearTimeout(timeoutId);
      proceed(true);
    });
};
`

const FUNDING_CHOICES_PRESENT_SIGNAL_SCRIPT = `
(function() {
  function signalGooglefcPresent() {
    if (!window.frames['googlefcPresent']) {
      if (document.body) {
        const iframe = document.createElement('iframe');
        iframe.style = 'width: 0; height: 0; border: none; z-index: -1000; left: -1000px; top: -1000px;';
        iframe.style.display = 'none';
        iframe.name = 'googlefcPresent';
        document.body.appendChild(iframe);
      } else {
        setTimeout(signalGooglefcPresent, 0);
      }
    }
  }
  signalGooglefcPresent();
})();
`

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
          id="funding-choices-controlled-messaging"
          dangerouslySetInnerHTML={{ __html: FUNDING_CHOICES_CONTROL_SCRIPT }}
        />
        <script
          id="funding-choices-recovery"
          async
          src={FUNDING_CHOICES_RECOVERY_SCRIPT_SRC}
        />
        <script
          id="funding-choices-present-signal"
          dangerouslySetInnerHTML={{ __html: FUNDING_CHOICES_PRESENT_SIGNAL_SCRIPT }}
        />
        <script
          id="funding-choices-error-protection"
          async
          src="/funding-choices-error-protection.js"
        />
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
