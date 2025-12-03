'use client'

import { useSettings } from '@/context/SettingsContext'
import useTranslation from '@/hooks/useTranslation'
import { useEffect } from 'react'

type KoFiWidgetProps = {
  open: boolean
  onClose: () => void
  onNever: () => void
  height?: number
  showFooter?: boolean
}

const KoFiWidget = ({ open, onClose, onNever, height = 480, showFooter = true }: KoFiWidgetProps) => {
  const { t } = useTranslation()
  const { settings } = useSettings()

  if (!open) {
    return null
  }

  useEffect(() => {
    const iframe = document.getElementById('kofiframe') as HTMLIFrameElement | null
    if (iframe) {
      iframe.setAttribute('aria-live', 'polite')
    }
  }, [open])

  return (
    <div className="w-full overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-2xl ring-1 ring-black/5 dark:border-[#18181b] dark:bg-zinc-900 dark:text-zinc-100">
      <div className="border-b border-zinc-200 px-4 py-3 text-sm font-semibold text-zinc-800 dark:border-[#18181b] dark:text-zinc-50">
        {t('kofiTitle')}
      </div>
      <div className="bg-[#f9f9f9] px-1 py-2 dark:bg-zinc-800">
        {open && (
          <iframe
            id="kofiframe"
            src="https://ko-fi.com/normanmei/?hidefeed=true&widget=true&embed=true&preview=true"
            style={{ border: 'none', width: '100%', padding: '4px', background: '#f9f9f9', overflow: 'hidden' }}
            height={height}
            title="normanmei"
            scrolling="no"
          />
        )}
      </div>
      {showFooter && (
        <div className="flex gap-2 border-t border-zinc-200 px-4 py-3 dark:border-[#18181b]">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-full border border-zinc-300 px-3 py-2 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:border-[#2a2a2e] dark:text-zinc-100 dark:hover:bg-zinc-800"
          >
            {t('kofiDismiss')}
          </button>
          <button
            type="button"
            onClick={onNever}
            className="flex-1 rounded-full border border-transparent bg-[var(--accent-600)] px-3 py-2 text-sm font-semibold text-white transition hover:bg-[var(--accent-500)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-ring)] dark:bg-[var(--accent-500)] dark:hover:bg-[var(--accent-400)]"
          >
            {t('kofiNever')}
          </button>
        </div>
      )}
    </div>
  )
}

export default KoFiWidget
