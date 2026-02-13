import type { Metadata } from 'next'

import AdRecoveryPopup from '@/components/ads/AdRecoveryPopup'

export const metadata: Metadata = {
  title: 'Ad Recovery Popup | Metro Memory',
  robots: {
    index: false,
    follow: false,
  },
}

export default function AdRecoveryPopupPage() {
  return <AdRecoveryPopup />
}
