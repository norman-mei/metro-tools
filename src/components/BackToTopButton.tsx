'use client'

import clsx from 'clsx'
import { useEffect, useState } from 'react'

function ArrowUpIcon(props: React.ComponentPropsWithoutRef<'svg'>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path
        d="M12 19.5v-15m0 0l-6.75 6.75M12 4.5l6.75 6.75"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function BackToTopButton() {
  let [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    function onScroll() {
      setIsVisible(window.scrollY > 400)
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <button
      type="button"
      aria-label="Back to top"
      className={clsx(
        'fixed right-8 top-1/2 z-50 -translate-y-1/2 rounded-full bg-white/90 p-3 text-zinc-500 shadow-lg shadow-zinc-800/5 ring-1 ring-zinc-900/5 backdrop-blur transition hover:text-zinc-700 dark:bg-zinc-800/90 dark:text-zinc-400 dark:ring-white/10 dark:hover:text-zinc-200',
        isVisible
          ? 'translate-x-0 opacity-100'
          : 'translate-x-12 opacity-0 pointer-events-none',
      )}
      onClick={scrollToTop}
    >
      <ArrowUpIcon className="h-6 w-6" />
    </button>
  )
}
