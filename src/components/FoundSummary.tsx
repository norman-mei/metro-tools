'use client'

import { usePrevious } from '@react-hookz/web'
import classNames from 'classnames'
import { useEffect, useState } from 'react'
import ProgressBars from './ProgressBars'
import { MaximizeIcon } from './MaximizeIcon'
import { MinimizeIcon } from './MinimizeIcon'
import useTranslation from '@/hooks/useTranslation'
import { useConfig } from '@/lib/configContext'
import { useSettings } from '@/context/SettingsContext'
import { getCompletionColor } from '@/lib/progressColors'

const FoundSummary = ({
  className,
  foundStationsPerLine,
  stationsPerLine,
  foundProportion,
  cityCompletionConfettiSeen,
  onCityCompletionConfettiSeen,
  minimizable = false,
  defaultMinimized = false,
}: {
  className?: string
  foundStationsPerLine: Record<string, number>
  stationsPerLine: Record<string, number>
  foundProportion: number
  cityCompletionConfettiSeen: boolean
  onCityCompletionConfettiSeen: () => void
  minimizable?: boolean
  defaultMinimized?: boolean
}) => {
  const { t } = useTranslation()
  const { LINES } = useConfig()
  const { settings } = useSettings()
  const previousFound = usePrevious(foundStationsPerLine)
  const [minimized, setMinimized] = useState<boolean>(defaultMinimized)
  const percentColor = getCompletionColor(foundProportion || 0)

  useEffect(() => {
    if (!settings.confettiEnabled) {
      return
    }
    if (settings.stopConfettiAfterCompletion && cityCompletionConfettiSeen) {
      return
    }
    // confetti when new line is 100%
    const newFoundLines = Object.keys(foundStationsPerLine).filter(
      (line) =>
        previousFound &&
        foundStationsPerLine[line] > previousFound[line] &&
        foundStationsPerLine[line] === stationsPerLine[line],
    )

    if (newFoundLines.length > 0) {
      const makeConfetti = async () => {
        const confetti = (await import('tsparticles-confetti')).confetti
        const colors = newFoundLines
          .map((line) => LINES[line]?.color)
          .filter((color): color is string => Boolean(color))
        confetti({
          spread: 120,
          ticks: 200,
          particleCount: 150,
          origin: { y: 0.2 },
          decay: 0.85,
          gravity: 2,
          startVelocity: 50,
          shapes: ['circle'],
          colors: colors.length > 0 ? colors : undefined,
          scalar: 1.8,
        })
      }

      void makeConfetti()

      if (foundProportion >= 1 && !cityCompletionConfettiSeen) {
        onCityCompletionConfettiSeen()
      }
    }
  }, [
    LINES,
    previousFound,
    foundStationsPerLine,
    stationsPerLine,
    settings.confettiEnabled,
    settings.stopConfettiAfterCompletion,
    cityCompletionConfettiSeen,
    foundProportion,
    onCityCompletionConfettiSeen,
  ])

  return (
    <div
      className={classNames(className, '@container', {
        relative: minimizable,
      })}
    >
      <div className="mb-2">
        <p className="mb-2 text-zinc-900 dark:text-zinc-100">
          <span
            className="text-lg font-bold @md:text-2xl"
            style={{ color: percentColor }}
          >
            {((foundProportion || 0) * 100).toFixed(2)}
            <span className="ml-1 text-lg font-semibold @md:text-xl">%</span>
          </span>{' '}
          <span className="text-sm text-zinc-600 dark:text-zinc-200">
            {t('stationsFound')}
          </span>
        </p>
        <ProgressBars
          minimized={minimized}
          foundStationsPerLine={foundStationsPerLine}
          stationsPerLine={stationsPerLine}
        />
      </div>
      {minimizable && (
        <div className="absolute bottom-0 right-0">
          <button
            onClick={() => setMinimized(!minimized)}
            className="pointer-events-auto z-10 mx-2 my-1 flex h-8 w-8 items-center justify-center rounded-full bg-white text-gray-500 shadow dark:bg-zinc-800 dark:text-zinc-100"
          >
            {minimized ? (
              <MaximizeIcon className="h-4 w-4" />
            ) : (
              <MinimizeIcon className="h-4 w-4" />
            )}
          </button>
        </div>
      )}
    </div>
  )
}

export default FoundSummary
