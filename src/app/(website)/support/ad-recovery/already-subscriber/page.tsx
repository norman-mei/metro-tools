import type { Metadata } from 'next'

import AdRecoveryLauncher from '@/components/ads/AdRecoveryLauncher'

export const metadata: Metadata = {
  title: 'Ad Recovery Verify Subscriber | Metro Memory',
  robots: {
    index: false,
    follow: false,
  },
}

export default function AdRecoveryAlreadySubscriberPage() {
  return <AdRecoveryLauncher flow="already-subscriber" />
}
