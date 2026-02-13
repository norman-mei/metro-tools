import type { Metadata } from 'next'

import AdRecoveryLauncher from '@/components/ads/AdRecoveryLauncher'

export const metadata: Metadata = {
  title: 'Ad Recovery Subscribe | Metro Memory',
  robots: {
    index: false,
    follow: false,
  },
}

export default function AdRecoverySubscribePage() {
  return <AdRecoveryLauncher flow="subscribe" />
}
