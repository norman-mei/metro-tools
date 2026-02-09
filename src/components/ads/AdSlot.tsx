'use client'

import clsx from 'clsx'
import { CSSProperties, useEffect, useId, useRef } from 'react'

import { useShouldShowAds } from '@/hooks/useShouldShowAds'
import { ADSENSE_CLIENT_ID, ADSENSE_SCRIPT_SRC } from '@/lib/adsense'

const AD_SCRIPT_ID = 'adsense-script'

function ensureScriptLoaded() {
  if (typeof document === 'undefined') return
  if (document.getElementById(AD_SCRIPT_ID)) return

  const script = document.createElement('script')
  script.id = AD_SCRIPT_ID
  script.async = true
  script.src = ADSENSE_SCRIPT_SRC
  script.crossOrigin = 'anonymous'
  document.head.appendChild(script)
}

export type AdSlotProps = {
  slot: string
  className?: string
  style?: CSSProperties
  format?: 'auto' | 'rectangle' | 'horizontal' | 'vertical'
  layoutKey?: string
}

/**
 * Small wrapper around an AdSense slot that respects ad-free users
 * and online-only rendering.
 */
export function AdSlot({
  slot,
  className,
  style,
  format = 'auto',
  layoutKey,
}: AdSlotProps) {
  const { showAds } = useShouldShowAds()
  const insRef = useRef<HTMLDivElement | null>(null)
  const reactKey = useId()

  useEffect(() => {
    if (!showAds) return
    ensureScriptLoaded()

    const el = insRef.current as unknown as HTMLElement | null
    if (!el) return

    try {
      ;(window as any).adsbygoogle = (window as any).adsbygoogle || []
      ;(window as any).adsbygoogle.push({})
    } catch (error) {
      // Silently ignore AdSense errors to avoid breaking the page.
      console.error('AdSense slot error', error)
    }
  }, [showAds, slot, layoutKey])

  if (!showAds) {
    return null
  }

  return (
    <ins
      key={layoutKey ?? reactKey}
      ref={insRef as any}
      className={clsx('adsbygoogle block', className)}
      style={{
        display: 'block',
        minHeight: 120,
        ...style,
      }}
      data-ad-client={ADSENSE_CLIENT_ID}
      data-ad-slot={slot}
      data-ad-format={format}
      data-full-width-responsive="true"
    />
  )
}

export default AdSlot
