'use client'

import { useEffect } from 'react'

type KoFiWidgetProps = {
  open: boolean
  onClose: () => void
  onNever: () => void
}

const KoFiWidget = ({ open, onClose, onNever }: KoFiWidgetProps) => {
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
        Support the project
      </div>
      <div className="bg-[#f9f9f9] px-1 py-2 dark:bg-zinc-800">
        {open && (
          <iframe
            id="kofiframe"
            src="https://ko-fi.com/normanmei/?hidefeed=true&widget=true&embed=true&preview=true"
            style={{ border: 'none', width: '100%', padding: '4px', background: '#f9f9f9' }}
            height="712"
            title="normanmei"
          />
        )}
      </div>
      <div className="flex gap-2 border-t border-zinc-200 px-4 py-3 dark:border-[#18181b]">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 rounded-full border border-zinc-300 px-3 py-2 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:border-[#2a2a2e] dark:text-zinc-100 dark:hover:bg-zinc-800"
        >
          Dismiss
        </button>
        <button
          type="button"
          onClick={onNever}
          className="flex-1 rounded-full border border-transparent bg-emerald-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-400 dark:bg-emerald-500 dark:hover:bg-emerald-400"
        >
          Do not show again
        </button>
      </div>
    </div>
  )
}

export default KoFiWidget
