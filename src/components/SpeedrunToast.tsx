'use client'

import { Transition } from '@headlessui/react'
import { Fragment, useEffect, useRef, useState } from 'react'

type SpeedrunToastProps = {
  speedrunMode: boolean
}

const DISMISS_MS = 2000

export default function SpeedrunToast({ speedrunMode }: SpeedrunToastProps) {
  const [show, setShow] = useState(false)
  const previous = useRef(speedrunMode)

  useEffect(() => {
    if (previous.current === speedrunMode) return
    setShow(true)
    const timer = setTimeout(() => setShow(false), DISMISS_MS)
    previous.current = speedrunMode
    return () => clearTimeout(timer)
  }, [speedrunMode])

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
      <div className="pointer-events-none fixed bottom-20 left-1/2 z-[100] -translate-x-1/2">
        <div className="rounded-full bg-amber-500/95 px-6 py-2 text-sm font-semibold text-white shadow-xl backdrop-blur dark:bg-amber-300/95 dark:text-zinc-900">
          {speedrunMode ? 'Speedrun Mode On' : 'Speedrun Mode Off'}
        </div>
      </div>
    </Transition>
  )
}
