'use client'

import { Fragment, useEffect, useState } from 'react'
import { Transition } from '@headlessui/react'
import { useSettings } from '@/context/SettingsContext'

const AUTO_DISMISS_MS = 5_000

const SettingsSaveToast = () => {
  const { lastSavedAt } = useSettings()
  const [open, setOpen] = useState(false)
  const [visibleAt, setVisibleAt] = useState<number | null>(null)

  useEffect(() => {
    if (!lastSavedAt) return
    setVisibleAt(lastSavedAt)
    setOpen(true)
  }, [lastSavedAt])

  useEffect(() => {
    if (!open || !visibleAt) return
    const timeout = window.setTimeout(() => setOpen(false), AUTO_DISMISS_MS)
    return () => window.clearTimeout(timeout)
  }, [open, visibleAt])

  if (!visibleAt) {
    return null
  }

  return (
    <Transition
      show={open}
      as={Fragment}
      enter="transform transition ease-out duration-200"
      enterFrom="translate-y-4 opacity-0 scale-95"
      enterTo="translate-y-0 opacity-100 scale-100"
      leave="transform transition ease-in duration-150"
      leaveFrom="translate-y-0 opacity-100 scale-100"
      leaveTo="translate-y-4 opacity-0 scale-95"
    >
      <div className="pointer-events-auto fixed bottom-6 right-6 z-[60] w-full max-w-xs sm:max-w-sm">
        <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-white/95 p-4 text-left shadow-2xl backdrop-blur dark:border-emerald-600/60 dark:bg-zinc-900/95">
          <div className="flex-1">
            <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
              Settings saved
            </p>
          </div>
          <button
            type="button"
            aria-label="Dismiss settings saved notification"
            onClick={() => setOpen(false)}
            className="ml-2 inline-flex items-center justify-center rounded-full border border-transparent p-1 text-sm font-semibold text-zinc-500 transition hover:text-zinc-800 focus:outline-none focus:ring-2 focus:ring-emerald-400 dark:text-zinc-300 dark:hover:text-white"
          >
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
      </div>
    </Transition>
  )
}

export default SettingsSaveToast
