'use client'

import OverflowMarquee from '@/components/OverflowMarquee'
import { isColorLight } from '@/lib/colorUtils'
import { useConfig } from '@/lib/configContext'
import { getCompletionColor } from '@/lib/progressColors'
import clsx from 'clsx'
import { useTheme } from 'next-themes'
import Image from 'next/image'
import { useEffect, useMemo, useRef } from 'react'
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar'

const cleanupLineName = (name?: string) => {
  if (!name) return ''

  let result = name
  const replacements: Array<[RegExp, string]> = [
    [/^AirTrain JFK\s*[–-]\s*/i, ''],
    [/^AirTrain\s+/i, ''],
    [/^MNRR\s+/i, ''],
    [/^LIRR\s+/i, ''],
    [/^CTrail\s+/i, ''],
    [/^NJT\s+Light\s+Rail\s+/i, ''],
    [/^NJT\s+HBLR\s+/i, ''],
    [/^NJT\s+/i, ''],
  ]

  for (const [pattern, replacement] of replacements) {
    result = result.replace(pattern, replacement)
  }

  return result.replace(/^[–-]\s*/, '').replace(/\s{2,}/g, ' ').trim()
}

const ProgressBars = ({
  foundStationsPerLine,
  stationsPerLine,
  minimized = false,
  highlightedLineId,
}: {
  foundStationsPerLine: Record<string, number>
  stationsPerLine: Record<string, number>
  minimized?: boolean
  highlightedLineId?: string | null
}) => {
  const { LINES, GAUGE_COLORS, LINE_GROUPS } = useConfig()
  const gaugeMode = GAUGE_COLORS ?? 'inverted'
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  
  const lineRefs = useRef<Record<string, HTMLDivElement | null>>({})

  useEffect(() => {
     if (highlightedLineId && lineRefs.current[highlightedLineId]) {
         lineRefs.current[highlightedLineId]?.scrollIntoView({
             behavior: 'smooth',
             block: 'center'
         })
     }
  }, [highlightedLineId])

  const orderedLines = useMemo(
    () =>
      Object.entries(LINES)
        .sort(([, a], [, b]) => (a?.order ?? 0) - (b?.order ?? 0))
        .map(([key]) => key),
    [LINES],
  )

  const groupedLineOrder = useMemo(() => {
    if (!LINE_GROUPS || LINE_GROUPS.length === 0) {
      return orderedLines
    }

    const keys: string[] = []
    for (const group of LINE_GROUPS) {
      for (const item of group.items) {
        if (item.type === 'lines') {
          for (const line of item.lines) {
            if (LINES[line] && !keys.includes(line)) {
              keys.push(line)
            }
          }
        }
      }
    }

    // ensure any lines not explicitly listed are still shown
    for (const line of orderedLines) {
      if (!keys.includes(line)) {
        keys.push(line)
      }
    }

    return keys
  }, [LINE_GROUPS, LINES, orderedLines])

  const renderLine = (line: string, compact: boolean) => {
    const meta = LINES[line]
    if (!meta) {
      return null
    }

    const total = stationsPerLine[line]
    if (!total) {
      return null
    }

    const found = foundStationsPerLine[line] || 0
    const displayName = cleanupLineName(meta.name) || meta.name
    const title = `${displayName} - ${found}/${total}`
    const customProgressColor = meta.progressOutlineColor
    const progressColor = customProgressColor ?? meta.color ?? '#000000'
    const needsContrastBoost =
      gaugeMode === 'inverted' && !isDark && isColorLight(progressColor)
    const gaugeBackground =
      gaugeMode === 'inverted' ? (isDark ? '#27272a' : '#ffffff') : meta.color
    const percentComplete = total > 0 ? found / total : 0
    const completionColor = getCompletionColor(percentComplete)

    const isHighlighted = highlightedLineId === line

    return (
      <div 
        key={line} 
        className={clsx(
            "flex items-center gap-2 transition-colors duration-300",
            compact ? "rounded-full" : "rounded-lg",
            isHighlighted && [
                "bg-yellow-200 dark:bg-yellow-500/40",
                "ring-4 ring-yellow-200 dark:ring-yellow-500 z-10"
            ]
        )}
        ref={(el) => {
            if (el) lineRefs.current[line] = el
        }}
      >
        <div
          title={title}
          className="relative flex h-8 w-8 shrink-0 items-center justify-center"
        >
          <div
            className={clsx(
              'absolute h-full w-full rounded-full shadow dark:shadow-black/40',
              needsContrastBoost && 'ring-1 ring-white',
            )}
          >
            <CircularProgressbar
              background
              backgroundPadding={2}
              styles={buildStyles({
                backgroundColor: gaugeBackground,
                pathColor:
                  gaugeMode === 'inverted'
                    ? progressColor
                    : customProgressColor ?? meta.textColor,
                textColor: isDark ? '#e4e4e7' : '#27272a',
                trailColor: 'transparent',
              })}
              value={(100 * found) / total}
            />
          </div>
          <Image
            alt={line}
            src={meta.icon ? `/images/${meta.icon}` : `/images/${line}.svg`}
            width={64}
            height={64}
            className="z-20 h-6 w-6 flex-shrink-0 rounded-full object-cover"
          />
        </div>
        {!compact && (
          <OverflowMarquee className="min-w-0 text-sm text-zinc-700 dark:text-zinc-200">
            <span>
              {displayName} -{' '}
              <span style={{ color: completionColor, fontWeight: 600 }}>
                {found}/{total}
              </span>
            </span>
          </OverflowMarquee>
        )}
      </div>
    )
  }

  if (minimized) {
    return (
      <div className="grid grid-cols-[repeat(8,min-content)] gap-2">
        {groupedLineOrder.map((line) => renderLine(line, true))}
      </div>
    )
  }

  if (!LINE_GROUPS || LINE_GROUPS.length === 0) {
    return (
      <div className="grid grid-cols-2 gap-2 @container">
        {orderedLines.map((line) => renderLine(line, false))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {LINE_GROUPS.map((group, groupIndex) => {
        return (
          <div key={`${group.title ?? 'group'}-${groupIndex}`} className="space-y-3">
            {group.title && (
              <OverflowMarquee
                className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400"
                speed={25}
                minDuration={8}
                gap={24}
                aria-label={group.title}
              >
                {group.title}
              </OverflowMarquee>
            )}
            {group.items.map((item, itemIndex) => {
              if (item.type === 'separator') {
                return (
                  <hr
                    key={`separator-${groupIndex}-${itemIndex}`}
                    className="border-zinc-200 dark:border-[#18181b]"
                  />
                )
              }

              const visibleLines = item.lines.filter((line) => !!LINES[line])
              if (item.lines.length === 0) {
                return (
                  <OverflowMarquee
                    key={`${item.title ?? 'heading'}-${groupIndex}-${itemIndex}`}
                    className="pt-1 text-sm font-semibold text-zinc-700 dark:text-zinc-200"
                    speed={30}
                    minDuration={8}
                    gap={24}
                    aria-label={item.title}
                  >
                    {item.title}
                  </OverflowMarquee>
                )
              }
              if (visibleLines.length === 0) {
                return null
              }

              return (
                <div
                  key={`${item.title ?? 'lines'}-${groupIndex}-${itemIndex}`}
                  className="space-y-2"
                >
                  {item.title && (
                    <OverflowMarquee
                      className="text-sm font-semibold text-zinc-700 dark:text-zinc-200"
                      speed={30}
                      minDuration={8}
                      gap={24}
                      aria-label={item.title}
                    >
                      {item.title}
                    </OverflowMarquee>
                  )}
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {visibleLines.map((line) => renderLine(line, false))}
                  </div>
                </div>
              )
            })}
          </div>
        )
      })}
    </div>
  )
}

export default ProgressBars
