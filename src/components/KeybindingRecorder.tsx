'use client'

import classNames from 'classnames'
import { useEffect, useRef, useState } from 'react'

import { getKeystrokeFromEvent } from '@/lib/keyboardUtils'

type KeybindingRecorderProps = {
  label: string
  value: string
  onChange: (newValue: string) => void
  disabled?: boolean
}

export default function KeybindingRecorder({
  label,
  value,
  onChange,
  disabled,
}: KeybindingRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!isRecording) return


// ...

    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault()
      e.stopPropagation()

      const combo = getKeystrokeFromEvent(e)
      if (combo) {
        onChange(combo)
        setIsRecording(false)
      }
    }

    // Capture on window to ensure we get it even if focus is slightly weird,
    // but usually focused button is enough.
    // Let's stick to window for "Recording Mode".
    window.addEventListener('keydown', handleKeyDown, { capture: true })

    const handleMouseDown = (e: MouseEvent) => {
        // Click outside to cancel
        if (buttonRef.current && !buttonRef.current.contains(e.target as Node)) {
            setIsRecording(false)
        }
    }
    window.addEventListener('mousedown', handleMouseDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown, { capture: true })
      window.removeEventListener('mousedown', handleMouseDown)
    }
  }, [isRecording, onChange])

  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
        {label}
      </span>
      <button
        ref={buttonRef}
        type="button"
        disabled={disabled}
        onClick={() => setIsRecording(true)}
        className={classNames(
          'min-w-[80px] rounded-md px-3 py-1.5 text-sm font-semibold transition-colors',
          isRecording
            ? 'bg-rose-500 text-white ring-2 ring-rose-500 ring-offset-2 dark:ring-offset-slate-900'
            : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        {isRecording ? 'Press key...' : value || 'None'}
      </button>
    </div>
  )
}
