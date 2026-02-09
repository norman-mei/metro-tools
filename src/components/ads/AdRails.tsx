'use client'

import AdSlot from '@/components/ads/AdSlot'
import { useShouldShowAds } from '@/hooks/useShouldShowAds'

const sidebarSlot = process.env.NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR

export function AdRails() {
  const { showAds } = useShouldShowAds()

  if (!showAds || !sidebarSlot) return null

  return (
    <>
      <div className="pointer-events-none fixed inset-y-0 left-0 z-20 hidden xl:flex w-52 justify-end px-2">
        <div className="pointer-events-auto h-full w-44">
          <AdSlot
            slot={sidebarSlot}
            format="vertical"
            style={{ height: '100%', minHeight: 600 }}
            className="h-full w-full"
            layoutKey="left-rail"
          />
        </div>
      </div>
      <div className="pointer-events-none fixed inset-y-0 right-0 z-20 hidden xl:flex w-52 justify-start px-2">
        <div className="pointer-events-auto h-full w-44">
          <AdSlot
            slot={sidebarSlot}
            format="vertical"
            style={{ height: '100%', minHeight: 600 }}
            className="h-full w-full"
            layoutKey="right-rail"
          />
        </div>
      </div>
    </>
  )
}

export default AdRails
