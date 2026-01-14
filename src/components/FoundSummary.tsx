'use client'

import { useSettings } from '@/context/SettingsContext'
import useTranslation from '@/hooks/useTranslation'
import { useConfig } from '@/lib/configContext'
import { getCompletionColor } from '@/lib/progressColors'
import { usePrevious } from '@react-hookz/web'
import classNames from 'classnames'
import { useEffect, useState } from 'react'
import { MaximizeIcon } from './MaximizeIcon'
import { MinimizeIcon } from './MinimizeIcon'
import ProgressBars from './ProgressBars'

const buildLineImageConfetti = (
  lines: Record<string, { icon?: string } | undefined>,
) => {
  const images: { src: string; width: number; height: number }[] = []
  const seen = new Set<string>()

  Object.values(lines || {}).forEach((line) => {
    const icon = line?.icon
    if (!icon || typeof icon !== 'string') return
    const src = `/images/${icon}`
    if (seen.has(src)) return
    seen.add(src)
    images.push({ src, width: 64, height: 64 })
  })

  return images.length > 0 ? images : null
}

const FoundSummary = ({
  className,
  foundStationsPerLine,
  stationsPerLine,
  foundProportion,
  cityCompletionConfettiSeen,
  onCityCompletionConfettiSeen,
  minimizable = false,
  defaultMinimized = false,
  highlightedLineId,
}: {
  className?: string
  foundStationsPerLine: Record<string, number>
  stationsPerLine: Record<string, number>
  foundProportion: number
  cityCompletionConfettiSeen: boolean
  onCityCompletionConfettiSeen: () => void
  minimizable?: boolean
  defaultMinimized?: boolean
  highlightedLineId?: string | null
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
        const images = buildLineImageConfetti(LINES)
        confetti({
          spread: 120,
          ticks: 200,
          particleCount: 150,
          origin: { y: 0.2 },
          decay: 0.85,
          gravity: 2,
          startVelocity: 50,
          shapes: images ? ['image'] : ['circle'],
          shapeOptions: images ? { image: images } : undefined,
          colors: images ? undefined : colors.length > 0 ? colors : undefined,
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
            <span className="ml-1 text-base font-semibold @md:text-xl">%</span>
          </span>{' '}
          <span className="text-xs text-zinc-600 dark:text-zinc-400 @md:text-sm">
            {t('stationsFound')}
          </span>
        </p>
        <ProgressBars
          minimized={minimized}
          foundStationsPerLine={foundStationsPerLine}
          stationsPerLine={stationsPerLine}
          highlightedLineId={highlightedLineId}
        />
      </div>
      {minimizable && (
        <div className="sticky bottom-2 z-10 mt-2 flex justify-end pointer-events-none">
          <button
            onClick={() => setMinimized(!minimized)}
            className="pointer-events-auto flex h-7 w-7 items-center justify-center rounded-full bg-white text-zinc-400 shadow-sm ring-1 ring-zinc-200 hover:bg-zinc-50 hover:text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 dark:ring-zinc-700 dark:hover:bg-zinc-700 dark:hover:text-zinc-200"
            aria-label={minimized ? 'Expand summary' : 'Minimize summary'}
          >
            {minimized ? (
              <MaximizeIcon className="h-3.5 w-3.5" />
            ) : (
              <MinimizeIcon className="h-3.5 w-3.5" />
            )}
          </button>
        </div>
      )}
    </div>
  )
}

export default FoundSummary
