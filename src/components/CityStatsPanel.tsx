'use client'

import { useSettings } from '@/context/SettingsContext'
import useTranslation from '@/hooks/useTranslation'
import { ACCENT_COLOR_MAP, DEFAULT_ACCENT_COLOR_ID } from '@/lib/accentColors'
import { isColorLight } from '@/lib/colorUtils'
import { getCompletionColor } from '@/lib/progressColors'
import { STATION_TOTALS } from '@/lib/stationTotals'
import { getStationKey } from '@/lib/stationUtils'
import { Config, DataFeature, DataFeatureCollection, LineGroup } from '@/lib/types'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState, type MouseEvent as ReactMouseEvent } from 'react'
import { createPortal } from 'react-dom'

type CityStatsPanelProps = {
  cityDisplayName: string
  slug: string | null
  open: boolean
  onClose: () => void
  onNavigatePrevious?: () => void
  onNavigateNext?: () => void
}

type StationTimelineEntry = {
  id: number
  name: string
  lineId?: string
  lineName?: string
  lineColor?: string
  timestamp?: string
  deltaMs?: number
}

type LineStat = {
  lineId: string
  name: string
  color?: string
  found: number
  total: number
  percent: number
  durationMs?: number
  firstFoundAt?: string
  lastFoundAt?: string
  icon?: string
}

type GroupStat = {
  title?: string
  items: Array<
    | { type: 'separator' }
    | {
        type: 'lines'
        title: string
        found: number
        total: number
        percent: number
        lineIds: string[]
        accentColor?: string
        lineNames: string[]
      }
  >
}

type CityStatsSnapshot = {
  foundCount: number
  totalStations: number
  percentFound: number
  cumulativeTimeMs: number
  firstFoundAt?: string
  lastFoundAt?: string
  avgTimePerStationMs: number
  uniquePlayDays: number
  lineStats: LineStat[]
  groupStats: GroupStat[]
  timeline: StationTimelineEntry[]
  completedLines: number
  fastestCompletedLine?: LineStat
}

type LocalProgress = {
  foundIds: number[]
  timestamps: Record<string, string>
  totalStations: number
}

const formatDuration = (ms?: number) => {
  if (!ms || ms <= 0) {
    return '—'
  }

  const totalSeconds = Math.max(1, Math.floor(ms / 1000))
  const days = Math.floor(totalSeconds / 86400)
  const hours = Math.floor((totalSeconds % 86400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  const parts: string[] = []
  if (days) parts.push(`${days}d`)
  if (hours) parts.push(`${hours}h`)
  if (minutes) parts.push(`${minutes}m`)
  if (!days && !hours && seconds) parts.push(`${seconds}s`)

  return parts.length > 0 ? parts.slice(0, 3).join(' ') : '0s'
}

const formatDateTime = (timestamp?: string) => {
  if (!timestamp) {
    return '—'
  }
  const date = new Date(timestamp)
  if (Number.isNaN(date.getTime())) {
    return '—'
  }
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

const formatPercent = (value: number) => `${(value * 100).toFixed(2)}%`

const readLocalProgress = (slug: string): LocalProgress => {
  if (typeof window === 'undefined' || !slug) {
    return { foundIds: [], timestamps: {}, totalStations: 0 }
  }

  const parseJson = <T,>(value: string | null, fallback: T): T => {
    if (!value) return fallback
    try {
      const parsed = JSON.parse(value)
      return parsed ?? fallback
    } catch {
      return fallback
    }
  }

  const foundIdsRaw = parseJson<number[] | number>(
    window.localStorage.getItem(`${slug}-stations`),
    [],
  )

  const foundIds: number[] = []
  const seenIds = new Set<number>()
  let numericFound = 0
  if (Array.isArray(foundIdsRaw)) {
    foundIdsRaw.forEach((value) => {
      if (typeof value !== 'number' || !Number.isFinite(value)) {
        return
      }
      const normalized = Math.trunc(value)
      if (!seenIds.has(normalized)) {
        seenIds.add(normalized)
        foundIds.push(normalized)
      }
    })
  } else if (typeof foundIdsRaw === 'number' && Number.isFinite(foundIdsRaw)) {
    numericFound = Math.max(0, Math.trunc(foundIdsRaw))
  }

  const timestamps = parseJson<Record<string, string>>(
    window.localStorage.getItem(`${slug}-stations-found-at`),
    {},
  )

  const totalStationsRaw = window.localStorage.getItem(
    `${slug}-station-total`,
  )
  const parsedTotal = totalStationsRaw ? Number(totalStationsRaw) : Number.NaN
  const totalStations =
    (Number.isFinite(parsedTotal) && parsedTotal > 0 ? parsedTotal : null) ??
    STATION_TOTALS[slug] ??
    Math.max(foundIds.length, numericFound)

  if (numericFound > 0 && foundIds.length === 0) {
    const synthetic = Math.min(numericFound, totalStations || numericFound)
    for (let i = 0; i < synthetic; i += 1) {
      foundIds.push(i)
    }
  }

  return {
    foundIds,
    timestamps:
      typeof timestamps === 'object' && timestamps !== null ? timestamps : {},
    totalStations: Number.isFinite(totalStations) ? totalStations : foundIds.length,
  }
}

const resolveLineGroupStats = (
  lineGroups: LineGroup[] | undefined,
  totals: Map<string, number>,
  foundPerLine: Map<string, number>,
  linesMetadata: Config['LINES'],
): GroupStat[] => {
  if (!lineGroups || lineGroups.length === 0) {
    return []
  }

  return lineGroups.map((group, groupIndex) => ({
    title: group.title,
    items: group.items.map((item, itemIndex) => {
      if (item.type === 'separator') {
        return { type: 'separator' as const }
      }

      const aggregate = item.lines.reduce(
        (acc, lineId) => {
          const total = totals.get(lineId) ?? 0
          const found = foundPerLine.get(lineId) ?? 0
          return {
            total: acc.total + total,
            found: acc.found + Math.min(found, total),
          }
        },
        { total: 0, found: 0 },
      )

      const visibleLines = item.lines.filter((lineId) =>
        totals.has(lineId) || Boolean(linesMetadata[lineId]),
      )

      const derivedTitle =
        item.title ??
        (visibleLines.length === 1
          ? linesMetadata[visibleLines[0]]?.name ?? visibleLines[0]
          : visibleLines.length > 0
            ? visibleLines
                .map((lineId) => linesMetadata[lineId]?.name ?? lineId)
                .join(', ')
            : 'Misc services')
      const lineNames = visibleLines.map(
        (lineId) => linesMetadata[lineId]?.name ?? lineId,
      )

      return {
        type: 'lines' as const,
        title: derivedTitle,
        total: aggregate.total,
        found: aggregate.found,
        percent: aggregate.total > 0 ? aggregate.found / aggregate.total : 0,
        accentColor:
          visibleLines.length === 1
            ? linesMetadata[visibleLines[0]]?.color
            : undefined,
        lineIds: visibleLines,
        lineNames,
      }
    }),
  }))
}

const resolveStationName = (feature?: DataFeature) => {
  if (!feature) {
    return 'Unknown station'
  }
  return (
    feature.properties?.display_name ??
    feature.properties?.long_name ??
    feature.properties?.short_name ??
    feature.properties?.name ??
    `Station ${feature.id ?? ''}`
  )
}

const computeStats = ({
  config,
  featureCollection,
  progress,
}: {
  config: Config
  featureCollection: DataFeatureCollection
  progress: LocalProgress
}): CityStatsSnapshot => {
  const idToFeature = new Map<number, DataFeature>()
  const totalsPerLine = new Map<string, number>()
  const lineStationKeys = new Map<string, Set<string>>()

  featureCollection.features.forEach((feature) => {
    const id =
      typeof feature.id === 'number'
        ? feature.id
        : Number(feature.id ?? Number.NaN)
    if (Number.isFinite(id)) {
      idToFeature.set(id, feature)
    }

    const line = feature.properties.line
    if (!line) return
    if (!lineStationKeys.has(line)) {
      lineStationKeys.set(line, new Set())
    }
    lineStationKeys.get(line)!.add(getStationKey(feature))
  })

  lineStationKeys.forEach((keys, line) => {
    totalsPerLine.set(line, keys.size)
  })

  const normalizedFoundIds = Array.from(
    new Set(progress.foundIds.filter((id) => idToFeature.has(id))),
  )
  const totalStations =
    idToFeature.size > 0
      ? idToFeature.size
      : Math.max(progress.totalStations, normalizedFoundIds.length)
  const normalizedProgress: LocalProgress = {
    ...progress,
    foundIds: normalizedFoundIds,
    totalStations,
  }

  const foundPerLineSet = new Map<string, Set<string>>()
  const timeline: StationTimelineEntry[] = []
  const timestampedEntries: StationTimelineEntry[] = []

  normalizedProgress.foundIds.forEach((id) => {
    const feature = idToFeature.get(id)
    if (!feature) {
      return
    }
    const line = feature.properties.line
    const key = getStationKey(feature)
    if (line) {
      if (!foundPerLineSet.has(line)) {
        foundPerLineSet.set(line, new Set())
      }
      foundPerLineSet.get(line)!.add(key)
    }

    const timestamp = normalizedProgress.timestamps[String(id)]
    const entry: StationTimelineEntry = {
      id,
      name: resolveStationName(feature),
      lineId: line ?? undefined,
      lineName: line ? config.LINES[line]?.name ?? line : undefined,
      lineColor: line ? config.LINES[line]?.color : undefined,
      timestamp: timestamp && !Number.isNaN(Date.parse(timestamp)) ? timestamp : undefined,
    }
    timeline.push(entry)
    if (entry.timestamp) {
      timestampedEntries.push(entry)
    }
  })

  timestampedEntries.sort(
    (a, b) =>
      Date.parse(a.timestamp as string) - Date.parse(b.timestamp as string),
  )

  const firstTimestamp = timestampedEntries[0]?.timestamp
  const lastTimestamp = timestampedEntries[timestampedEntries.length - 1]?.timestamp
  const cumulativeTimeMs =
    firstTimestamp && lastTimestamp
      ? Math.max(
          0,
          Date.parse(lastTimestamp) - Date.parse(firstTimestamp),
        )
      : 0
  const avgTimePerStationMs =
    timestampedEntries.length > 1
      ? cumulativeTimeMs / (timestampedEntries.length - 1)
      : 0

  const uniquePlayDays = new Set(
    timestampedEntries.map((entry) =>
      entry.timestamp ? new Date(entry.timestamp).toISOString().slice(0, 10) : '',
    ),
  )
  uniquePlayDays.delete('')

  const lineStats: LineStat[] = Object.entries(config.LINES).map(
    ([lineId, meta]) => {
      const total = totalsPerLine.get(lineId) ?? 0
      const foundCount = foundPerLineSet.get(lineId)?.size ?? 0

      const timestamps: number[] = timestampedEntries
        .filter((entry) => entry.lineId === lineId && entry.timestamp)
        .map((entry) => Date.parse(entry.timestamp as string))
        .filter((value) => Number.isFinite(value))

      const first = timestamps.length > 0 ? Math.min(...timestamps) : null
      const last = timestamps.length > 0 ? Math.max(...timestamps) : null
      const durationMs =
        first !== null && last !== null && last > first ? last - first : undefined

      const displayColor = meta?.statsColor ?? meta?.color ?? meta?.backgroundColor
      return {
        lineId,
        name: meta?.name ?? lineId,
        color: displayColor,
        found: foundCount,
        total,
        percent: total > 0 ? foundCount / total : 0,
        firstFoundAt: first ? new Date(first).toISOString() : undefined,
        lastFoundAt: last ? new Date(last).toISOString() : undefined,
        durationMs,
        icon: meta?.icon,
      }
    },
  )

  const completedLines = lineStats.filter(
    (line) => line.total > 0 && line.found >= line.total,
  )
  const fastestCompletedLine = [...completedLines]
    .filter((line) => line.durationMs)
    .sort((a, b) => (a.durationMs ?? 0) - (b.durationMs ?? 0))[0]

  const groupStats = resolveLineGroupStats(
    config.LINE_GROUPS,
    totalsPerLine,
    new Map(
      Array.from(foundPerLineSet.entries()).map(([line, keys]) => [
        line,
        keys.size,
      ]),
    ),
    config.LINES,
  )

  const enrichedTimeline = timestampedEntries.map((entry) => ({
    ...entry,
    deltaMs: entry.timestamp
      ? Date.parse(entry.timestamp) -
        (firstTimestamp ? Date.parse(firstTimestamp) : 0)
      : undefined,
  }))

  return {
    foundCount: normalizedProgress.foundIds.length,
    totalStations: normalizedProgress.totalStations,
    percentFound:
      normalizedProgress.totalStations > 0
        ? normalizedProgress.foundIds.length / normalizedProgress.totalStations
        : 0,
    cumulativeTimeMs,
    firstFoundAt: firstTimestamp,
    lastFoundAt: lastTimestamp,
    avgTimePerStationMs,
    uniquePlayDays: uniquePlayDays.size,
    lineStats,
    groupStats,
    timeline: enrichedTimeline.reverse().slice(0, 10),
    completedLines: completedLines.length,
    fastestCompletedLine,
  }
}

const CityStatsPanel = ({
  cityDisplayName,
  slug,
  open,
  onClose,
  onNavigatePrevious,
  onNavigateNext,
}: CityStatsPanelProps) => {
  const { t } = useTranslation()
  const { settings } = useSettings()
  const accentPalette =
    ACCENT_COLOR_MAP[settings.accentColor] ??
    ACCENT_COLOR_MAP[DEFAULT_ACCENT_COLOR_ID]
  const accentFallbackColor = accentPalette?.palette[600] ?? '#0284c7'
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<CityStatsSnapshot | null>(null)

  useEffect(() => {
    if (!open) {
      return
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
        return
      }
      if (event.key === 'ArrowLeft' && onNavigatePrevious) {
        event.preventDefault()
        onNavigatePrevious()
        return
      }
      if (event.key === 'ArrowRight' && onNavigateNext) {
        event.preventDefault()
        onNavigateNext()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = originalOverflow
    }
  }, [open, onClose, onNavigateNext, onNavigatePrevious])

  useEffect(() => {
    if (!open || !slug) {
      return
    }
    let cancelled = false

    const load = async () => {
      setLoading(true)
      setError(null)
      setStats(null)
      try {
        const [configModule, featuresModule] = await Promise.all([
          import(`@/app/(game)/${slug}/config`) as Promise<{ default: Config }>,
          import(
            `@/app/(game)/${slug}/data/features.json`
          ) as Promise<{ default: DataFeatureCollection }>,
        ])

        if (cancelled) {
          return
        }

        const config = configModule.default
        const featureCollection = featuresModule.default
        const progress = readLocalProgress(slug)
        const snapshot = computeStats({
          config,
          featureCollection,
          progress,
        })
        setStats(snapshot)
      } catch (err) {
        console.error(err)
        setError(
          'Unable to load detailed stats. Try opening this city once to generate progress data.',
        )
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [open, slug])

  if (!open || !slug) {
    return null
  }

  if (typeof document === 'undefined') {
      return null
  }

  const cityIconSrc = `/api/city-icon/${encodeURIComponent(slug)}`
  const quickNavLinks = [
    { label: 'Account tab', href: '/?tab=account' },
    { label: 'Privacy tab', href: '/?tab=privacy' },
    { label: 'Cities tab', href: '/?tab=cities' },
    { label: 'Achievements tab', href: '/?tab=achievements' },
    { label: 'Update Log tab', href: '/?tab=updateLog' },
    { label: 'Global Stats tab', href: '/?tab=globalStats' },
    { label: 'Settings tab', href: '/?tab=settings' },
    { label: 'Main page', href: '/' },
  ]

  const handleInnerClick = (event: ReactMouseEvent<HTMLDivElement>) => {
    event.stopPropagation()
  }

  const renderOverview = () => {
    if (!stats) {
      return null
    }

    return (
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-[#18181b] dark:bg-zinc-900/40">
          <p className="text-sm uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            {t('cityStatsStationsProgress')}
          </p>
          <p className="mt-2 text-3xl font-semibold text-zinc-900 dark:text-zinc-50">
            <span className="text-emerald-500">
              {stats.foundCount.toLocaleString()}
            </span>{' '}
            <span className="text-base font-medium text-zinc-500 dark:text-zinc-400">
              / {stats.totalStations.toLocaleString()}
            </span>
          </p>
          <p
            className="mt-1 text-sm font-semibold"
            style={{ color: getCompletionColor(stats.percentFound) }}
          >
            {t('cityStatsPercentFound', { percent: formatPercent(stats.percentFound) })}
          </p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-[#18181b] dark:bg-zinc-900">
          <p className="text-sm uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            {t('cityStatsTimeSpent')}
          </p>
          <p className="mt-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            {formatDuration(stats.cumulativeTimeMs)}
          </p>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
            {t('cityStatsAvgPerStation', {
              duration: formatDuration(stats.avgTimePerStationMs),
            })}{' '}
            · {t('cityStatsPlayDays', { count: stats.uniquePlayDays })}
          </p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-[#18181b] dark:bg-zinc-900">
          <p className="text-sm uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            {t('cityStatsFirstLatest')}
          </p>
          <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-200">
            {t('cityStatsFirst', { value: formatDateTime(stats.firstFoundAt) })}
            <br />
            {t('cityStatsLatest', { value: formatDateTime(stats.lastFoundAt) })}
          </p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-[#18181b] dark:bg-zinc-900/40">
          <p className="text-sm uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            {t('cityStatsCompletedLines')}
          </p>
          {(() => {
            const totalLineCount = stats.lineStats.filter((line) => line.total > 0).length
            const completionRatio =
              totalLineCount > 0 ? stats.completedLines / totalLineCount : 0
            return (
              <p
                className="mt-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-50"
                style={{ color: getCompletionColor(completionRatio) }}
              >
                {stats.completedLines}
              </p>
            )
          })()}
          {stats.fastestCompletedLine && (
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
              {t('cityStatsFastestLine', {
                line: stats.fastestCompletedLine.name,
                duration: stats.fastestCompletedLine.durationMs
                  ? formatDuration(stats.fastestCompletedLine.durationMs)
                  : undefined,
              })}
            </p>
          )}
        </div>
      </div>
    )
  }

  const renderLineStats = () => {
    if (!stats) {
      return null
    }

    const visibleLines = stats.lineStats.filter((line) => line.total > 0)
    if (visibleLines.length === 0) {
      return null
    }

    const orderedLineIds: string[] = []
    stats.groupStats.forEach((group) => {
      group.items.forEach((item) => {
        if (item.type === 'lines') {
          item.lineIds.forEach((lineId) => {
            if (!orderedLineIds.includes(lineId)) {
              orderedLineIds.push(lineId)
            }
          })
        }
      })
    })
    const orderIndex = new Map<string, number>()
    orderedLineIds.forEach((id, idx) => orderIndex.set(id, idx))

    return (
      <div>
        <h4 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          {t('cityStatsLineBreakdown')}
        </h4>
        <div className="mt-3 space-y-3">
          {visibleLines
            .sort((a, b) => {
              const ai = orderIndex.has(a.lineId)
                ? orderIndex.get(a.lineId)!
                : Number.POSITIVE_INFINITY
              const bi = orderIndex.has(b.lineId)
                ? orderIndex.get(b.lineId)!
                : Number.POSITIVE_INFINITY
              if (ai !== bi) return ai - bi
              return a.name.localeCompare(b.name)
            })
            .map((line) => {
              const fillColor = line.color ?? '#4f46e5'
              const needsContrastBorder = isColorLight(fillColor)
              return (
                <div
                  key={line.lineId}
                  className="flex gap-3 rounded-2xl border border-zinc-200 bg-white p-3 dark:border-[#18181b] dark:bg-zinc-900"
                >
                  <div className="flex w-14 flex-shrink-0 items-center justify-center">
                    <Image
                      alt={line.lineId}
                      src={line.icon ? `/images/${line.icon}` : `/images/${line.lineId}.svg`}
                      width={48}
                      height={48}
                      className="h-10 w-10 rounded-full object-contain"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                          {line.name}
                        </p>
                        <p
                          className="text-xs font-semibold"
                          style={{ color: getCompletionColor(line.percent) }}
                        >
                          {line.found}/{line.total} ({formatPercent(line.percent)})
                        </p>
                      </div>
                      <div className="text-right text-xs text-zinc-500 dark:text-zinc-400">
                        {line.durationMs
                          ? `Active for ${formatDuration(line.durationMs)}`
                          : t('cityStatsNoTimeData')}
                      </div>
                    </div>
                    <div className="mt-2 h-2 rounded-full bg-zinc-200 dark:bg-zinc-800">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${Math.min(100, line.percent * 100)}%`,
                          backgroundColor: fillColor,
                          boxShadow: needsContrastBorder
                            ? 'inset 0 0 0 1px rgba(24,24,27,0.18)'
                            : undefined,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              )
            })}
        </div>
      </div>
    )
  }

  const renderGroupStats = () => {
    if (!stats || stats.groupStats.length === 0) {
      return null
    }

    return (
      <div>
        <h4 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          {t('cityStatsHeadersSubheaders')}
        </h4>
        <div className="mt-3 space-y-4">
          {stats.groupStats.map((group, idx) => (
            <div key={`${group.title ?? 'group'}-${idx}`}>
              {group.title && (
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--accent-500)] dark:text-[var(--accent-300)]">
                  {group.title}
                </p>
              )}
              <div className="mt-2 space-y-2">
                {group.items.map((item, itemIdx) =>
                  item.type === 'separator' ? (
                    <hr
                      key={`separator-${idx}-${itemIdx}`}
                      className="border-zinc-200 dark:border-[#18181b]"
                    />
                  ) : (
                    <div
                      key={`${item.title ?? 'lines'}-${idx}-${itemIdx}`}
                      className="rounded-2xl border border-zinc-200 bg-white p-3 dark:border-[#18181b] dark:bg-zinc-900"
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-zinc-800 dark:text-zinc-100">
                          {item.title}
                        </p>
                        <p
                          className="text-sm font-semibold"
                          style={{ color: getCompletionColor(item.percent) }}
                        >
                          {item.found}/{item.total}{' '}
                          <span className="text-xs font-normal">
                            ({formatPercent(item.percent)})
                          </span>
                        </p>
                      </div>
                      {(() => {
                        const fillColor = item.accentColor ?? accentFallbackColor
                        const needsContrastBorder = isColorLight(fillColor)
                        return (
                          <div className="mt-1 h-2 rounded-full bg-zinc-200 dark:bg-zinc-800">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${Math.min(100, item.percent * 100)}%`,
                                backgroundColor: fillColor,
                                boxShadow: needsContrastBorder
                                  ? 'inset 0 0 0 1px rgba(24,24,27,0.18)'
                                  : undefined,
                              }}
                            ></div>
                          </div>
                        )
                      })()}
                    </div>
                  ),
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const renderTimeline = () => {
    if (!stats || stats.timeline.length === 0) {
      return (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          No timestamped stations yet. Play the city to start building your history.
        </p>
      )
    }

    return (
      <ol className="space-y-3">
        {stats.timeline.map((entry, index) => {
          const rankColors = ['#FFD700', '#C0C0C0', '#CD7F32']
          const accentColor = rankColors[index] ?? undefined
          return (
          <li
            key={entry.id}
            className="flex items-center gap-3 rounded-2xl border border-zinc-200 bg-white p-3 dark:border-[#18181b] dark:bg-zinc-900"
          >
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-zinc-300 text-lg font-semibold text-zinc-600 dark:border-[#18181b] dark:text-zinc-200">
              <span
                style={
                  accentColor
                    ? { color: accentColor, fontWeight: 700 }
                    : { fontWeight: 600 }
                }
              >
                {index + 1}
              </span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  {entry.name}
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {entry.lineName ?? '—'}
                </p>
              </div>
              <div className="text-right text-xs text-zinc-500 dark:text-zinc-300">
                {entry.timestamp ? formatDateTime(entry.timestamp) : 'Unknown'}
                <br />
                {entry.deltaMs !== undefined && entry.deltaMs >= 0
                  ? `+${formatDuration(entry.deltaMs)}`
                  : ''}
              </div>
            </div>
          </li>
        )
      })}
      </ol>
    )
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-zinc-900/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      {onNavigatePrevious && (
        <button
          type="button"
          className="absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/90 px-3 py-2 text-base font-semibold text-zinc-800 shadow-lg backdrop-blur focus:outline-none focus:ring-2 focus:ring-[var(--accent-ring)] dark:bg-zinc-900/90 dark:text-zinc-100"
          onClick={(event) => {
            event.stopPropagation()
            onNavigatePrevious()
          }}
          aria-label="View previous city stats"
        >
          &lt;
        </button>
      )}
      {onNavigateNext && (
        <button
          type="button"
          className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/90 px-3 py-2 text-base font-semibold text-zinc-800 shadow-lg backdrop-blur focus:outline-none focus:ring-2 focus:ring-[var(--accent-ring)] dark:bg-zinc-900/90 dark:text-zinc-100"
          onClick={(event) => {
            event.stopPropagation()
            onNavigateNext()
          }}
          aria-label="View next city stats"
        >
          &gt;
        </button>
      )}
      <div
        className="mx-4 max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-3xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-[#18181b] dark:bg-zinc-950"
        onClick={handleInnerClick}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="w-full">
            <p className="text-sm uppercase tracking-wide text-[var(--accent-500)] dark:text-[var(--accent-300)]">
              Progress details
            </p>
            <div className="mt-2 flex items-center gap-3">
              <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-[#18181b] dark:bg-zinc-900 sm:h-14 sm:w-14">
                <Image
                  src={cityIconSrc}
                  alt={`${cityDisplayName} icon`}
                  fill
                  sizes="(max-width: 640px) 48px, 56px"
                  className="object-cover"
                  unoptimized
                  priority
                />
              </div>
              <h3 className="min-w-0 flex-1 text-3xl font-semibold text-zinc-900 dark:text-zinc-50">
                {cityDisplayName}
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center rounded-full border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-[var(--accent-ring)] dark:border-[#18181b] dark:text-zinc-100 dark:hover:bg-zinc-800"
          >
            Close
          </button>
        </div>
        <div className="mb-4 flex flex-wrap justify-center gap-2">
          {quickNavLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={onClose}
              className="inline-flex items-center justify-center rounded-full border border-zinc-300 px-3 py-2 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-[var(--accent-ring)] dark:border-[#18181b] dark:text-zinc-100 dark:hover:bg-zinc-800"
            >
              {link.label}
            </Link>
          ))}
        </div>
        <div className="mt-4 space-y-6">
          {loading && (
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Loading city stats...
            </p>
          )}
          {error && (
            <p className="rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700 dark:border-rose-900/60 dark:bg-rose-900/20 dark:text-rose-200">
              {error}
            </p>
          )}
          {!loading && !error && renderOverview()}
          {!loading && !error && renderLineStats()}
          {!loading && !error && renderGroupStats()}
          {!loading && !error && (
            <div>
              <h4 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                {t('cityStatsTimelineTitle')}
              </h4>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
                {t('cityStatsTimelineSubtitle')}
              </p>
              <div className="mt-3">{renderTimeline()}</div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  )
}

export default CityStatsPanel
