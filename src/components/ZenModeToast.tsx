'use client'

import { Transition } from '@headlessui/react'
import { Fragment, useEffect, useRef, useState } from 'react'

type ZenModeToastProps = {
  zenMode: boolean
  toggleKey?: string
}

const DISMISS_MS = 2000

export default function ZenModeToast({ zenMode, toggleKey }: ZenModeToastProps) {
  const [show, setShow] = useState(false)
  const previousZenMode = useRef(zenMode)

  useEffect(() => {
    if (previousZenMode.current === zenMode) {
      return
    }

    setShow(true)
    const timer = setTimeout(() => setShow(false), DISMISS_MS)
    previousZenMode.current = zenMode
    return () => clearTimeout(timer)
  }, [zenMode])

  return (
    <Transition
      show={show}
      as={Fragment}
      enter="transform transition ease-out duration-300"
      enterFrom="translate-y-8 opacity-0 scale-95"
      enterTo="translate-y-0 opacity-100 scale-100"
      leave="transform transition ease-in duration-200"
      leaveFrom="translate-y-0 opacity-100 scale-100"
      leaveTo="translate-y-8 opacity-0 scale-95"
    >
      <div className="pointer-events-none fixed bottom-10 left-1/2 z-[100] -translate-x-1/2">
        <div className="rounded-full bg-zinc-900/90 px-6 py-2 text-sm font-semibold text-white shadow-xl backdrop-blur dark:bg-zinc-100/90 dark:text-zinc-900">
          {zenMode
            ? `Zen Mode On${toggleKey ? ` — press ${toggleKey} to turn off` : ''}`
            : `Zen Mode Off${toggleKey ? ` — press ${toggleKey} to turn on` : ''}`}
        </div>
      </div>
    </Transition>
  )
}
