'use client'

import AchievementIcon from '@/components/AchievementIcon'
import { Transition } from '@headlessui/react'
import Link from 'next/link'
import { Fragment, useEffect } from 'react'

type AchievementToastProps = {
  open: boolean
  slug: string
  cityName: string
  title: string
  description: string
  durationMs?: number
  onClose: () => void
  onDontShowAgain: () => void
}

const AchievementToast = ({
  open,
  slug,
  cityName,
  title,
  description,
  durationMs = 15000,
  onClose,
  onDontShowAgain,
}: AchievementToastProps) => {
  const achievementsHref = `/metro-memory?tab=achievements&city=${encodeURIComponent(slug)}`

  useEffect(() => {
    if (!open) return
    const timeout = window.setTimeout(onClose, durationMs)
    return () => window.clearTimeout(timeout)
  }, [open, onClose, durationMs])

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
      <div className="fixed inset-x-4 bottom-6 z-50 flex justify-center sm:inset-x-auto sm:right-6 sm:left-auto">
        <div className="flex w-full max-w-xl items-start gap-4 rounded-3xl border border-[var(--accent-200)] bg-white/95 p-4 text-left shadow-2xl backdrop-blur dark:border-[rgba(var(--accent-600-rgb),0.6)] dark:bg-zinc-900/95">
          <AchievementIcon
            slug={slug}
            cityName={cityName}
            className="h-16 w-16 p-1"
            sizes="128px"
          />
          <div className="flex-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--accent-600)] dark:text-[var(--accent-400)]">
              Achievement unlocked
            </p>
            <h4 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">{title}</h4>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{description}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link
                href={achievementsHref}
                className="inline-flex flex-1 items-center justify-center rounded-full bg-[var(--accent-600)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--accent-500)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-400)] dark:bg-[var(--accent-500)] dark:hover:bg-[var(--accent-400)]"
              >
                View achievements
              </Link>
              <button
                type="button"
                onClick={onDontShowAgain}
                className="inline-flex items-center justify-center rounded-full border border-transparent bg-[var(--accent-100)] px-4 py-2 text-sm font-semibold text-[var(--accent-700)] transition hover:bg-[var(--accent-200)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-400)] dark:bg-[rgba(var(--accent-500-rgb),0.2)] dark:text-[var(--accent-200)] dark:hover:bg-[rgba(var(--accent-500-rgb),0.3)]"
              >
                Do not show me again
              </button>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center justify-center rounded-full border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:border-[#18181b] dark:text-zinc-100 dark:hover:bg-zinc-800"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  )
}

export default AchievementToast
