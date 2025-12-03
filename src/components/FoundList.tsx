'use client'

import SortMenu from '@/components/SortMenu'
import useTranslation from '@/hooks/useTranslation'
import { useConfig } from '@/lib/configContext'
import { DataFeature, SortOption, SortOptionType } from '@/lib/types'
import { Transition } from '@headlessui/react'
import classNames from 'classnames'
import { sortBy } from 'lodash'
import { useTheme } from 'next-themes'
import Image from 'next/image'
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { DateAddedIcon } from './DateAddedIcon'
import { useSettings } from '@/context/SettingsContext'

const getStationKey = (feature: DataFeature) => {
  const nameCandidates: unknown[] = [
    feature.properties?.name,
    feature.properties?.long_name,
    feature.properties?.display_name,
    feature.properties?.short_name,
  ]

  for (const candidate of nameCandidates) {
    if (typeof candidate === 'string') {
      const normalized = candidate.trim().toLowerCase()
      if (normalized.length > 0) {
        return `name:${normalized}`
      }
    }
  }

  if (
    feature.geometry?.type === 'Point' &&
    Array.isArray(feature.geometry.coordinates)
  ) {
    const [lng, lat] = feature.geometry.coordinates as number[]
    const formattedLng =
      typeof lng === 'number' ? lng.toFixed(6) : String(lng)
    const formattedLat =
      typeof lat === 'number' ? lat.toFixed(6) : String(lat)
    return `point:${formattedLng}|${formattedLat}`
  }

  const idCandidate =
    feature.id ??
    (typeof feature.properties?.id === 'number' ||
    typeof feature.properties?.id === 'string'
      ? feature.properties?.id
      : undefined)

  if (idCandidate !== undefined && idCandidate !== null) {
    return `id:${String(idCandidate)}`
  }

  return `feature:${JSON.stringify(feature.geometry ?? {})}`
}

const getDisplayName = (feature: DataFeature) => {
  if (!feature || !feature.properties) {
    return '—'
  }

  const { display_name, short_name, long_name, name, id: propertyId } =
    feature.properties as typeof feature.properties & {
      display_name?: unknown
      short_name?: unknown
      long_name?: unknown
      id?: unknown
    }

  const candidates = [
    name,
    long_name,
    display_name,
    short_name,
    propertyId,
    feature.id,
  ]

  for (const candidate of candidates) {
    if (typeof candidate === 'string' || typeof candidate === 'number') {
      const value = String(candidate).trim()
      if (value.length > 0) {
        return value
      }
    }
  }

  return '—'
}

const getFeatureNumericId = (feature: DataFeature) => {
  if (typeof feature.id === 'number') {
    return feature.id
  }

  const propertyId = feature.properties?.id
  if (typeof propertyId === 'number') {
    return propertyId
  }

  return null
}
const FoundList = ({
  found,
  idMap,
  setHoveredId,
  hoveredId,
  hideLabels,
  zoomToFeature,
  foundTimestamps,
  onStationFocus,
  activeStationId,
  disabled = false,
}: {
  found: number[]
  idMap: Map<number, DataFeature>
  setHoveredId: (id: number | null) => void
  hoveredId: number | null
  hideLabels?: boolean
  zoomToFeature: (id: number) => void
  foundTimestamps: Record<string, string>
  onStationFocus?: (id: number) => void
  activeStationId: number | null
  disabled?: boolean
}) => {
  const { LINES } = useConfig()
  const { t } = useTranslation()
  const { settings } = useSettings()

  const sortOptions: SortOption[] = useMemo(
    () => [
      {
        name: t('sort.dateAdded'),
        id: 'order',
        shortName: <DateAddedIcon className="h-4 w-4" />,
      },
      { name: t('sort.nameAsc'), id: 'name', shortName: 'A-Z' },
      { name: t('sort.nameDesc'), id: 'name-desc', shortName: 'Z-A' },
      { name: t('sort.line'), id: 'line', shortName: 'Line' },
    ],
    [t],
  )

  const [sort, setSort] = useState<SortOptionType>('order')
  const [filter, setFilter] = useState<string>('')

  const sorted = useMemo(() => {
    const ids = [...found]

    switch (sort) {
      case 'order':
        return ids.sort((a, b) => {
          const aKey = String(a)
          const bKey = String(b)
          const aTime = Date.parse(foundTimestamps[aKey] ?? '')
          const bTime = Date.parse(foundTimestamps[bKey] ?? '')
          const aValid = Number.isFinite(aTime)
          const bValid = Number.isFinite(bTime)

          if (aValid && bValid) {
            if (bTime === aTime) {
              return 0
            }
            return bTime - aTime
          }

          if (bValid) return 1
          if (aValid) return -1
          return found.indexOf(a) - found.indexOf(b)
        })

      case 'name':
        return sortBy(ids, (id) => {
          const feature = idMap.get(id)
          return feature?.properties.name?.toLowerCase() ?? ''
        })

      case 'name-desc':
        return sortBy(ids, (id) => {
          const feature = idMap.get(id)
          return feature?.properties.name?.toLowerCase() ?? ''
        }).reverse()

      case 'line':
        return sortBy(
          ids,
          (id) => {
            const feature = idMap.get(id)
            if (!feature) return Number.MAX_SAFE_INTEGER
            const line = feature.properties.line
            if (!line) return Number.MAX_SAFE_INTEGER
            return LINES[line]?.order ?? Number.MAX_SAFE_INTEGER
          },
          (id) => {
            const feature = idMap.get(id)
            if (!feature) return Number.MAX_SAFE_INTEGER
            if (feature.geometry.type === 'Point') {
              return (
                100 * feature.geometry.coordinates[0] +
                feature.geometry.coordinates[1]
              )
            }
            return feature.properties.name
          },
        )

      default:
        return ids
    }
  }, [found, sort, idMap, LINES, foundTimestamps])

  const normalizedFilter = filter.trim().toLowerCase()

  const filtered = useMemo(() => {
    if (!normalizedFilter) {
      return sorted
    }

    return sorted.filter((id) => {
      const feature = idMap.get(id)
      if (!feature) return false

      const name = feature.properties.name?.toLowerCase() ?? ''
      if (name.includes(normalizedFilter)) {
        return true
      }

      const alternates = (
        feature.properties as typeof feature.properties & {
          alternate_names?: string[]
        }
      ).alternate_names
      if (Array.isArray(alternates)) {
        return alternates.some((alias) =>
          alias.toLowerCase().includes(normalizedFilter),
        )
      }

      return false
    })
  }, [sorted, normalizedFilter, idMap])

  const grouped = useMemo(() => {
    const groups = new Map<string, DataFeature[]>()
    const order: string[] = []

    for (let id of filtered) {
      const feature = idMap.get(id)
      if (!feature) continue

      const key = getStationKey(feature)
      if (!groups.has(key)) {
        groups.set(key, [])
        order.push(key)
      }
      groups.get(key)!.push(feature)
    }

    return order
      .map((key) => groups.get(key))
      .filter((group): group is DataFeature[] => Array.isArray(group))
  }, [filtered, idMap])

  const timestampFormatter = useMemo(
    () =>
      (() => {
        const baseOptions: Intl.DateTimeFormatOptions = {
          month: '2-digit',
          day: '2-digit',
          year: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
          timeZoneName: 'short',
        }
        try {
          return new Intl.DateTimeFormat('en-US', {
            ...baseOptions,
            timeZone: settings.timezone || 'UTC',
            hour12: settings.hourFormat === '12h',
          })
        } catch {
          return new Intl.DateTimeFormat('en-US', {
            ...baseOptions,
            timeZone: 'UTC',
            hour12: settings.hourFormat === '12h',
          })
        }
      })(),
    [settings.timezone, settings.hourFormat],
  )

  const formatTimestamp = useCallback(
    (iso?: string) => {
      if (!iso) {
        return '—'
      }

      const date = new Date(iso)
      if (Number.isNaN(date.getTime())) {
        return '—'
      }

      const formatted = timestampFormatter
        .format(date)
        .replace(',', '')
        .replace(/\s+/g, ' ')
        .trim()

      return formatted
    },
    [timestampFormatter],
  )

  const groupedWithTimestamp = useMemo(() => {
    return grouped.map((features) => {
      const candidateIds = features
        .map((feature) => {
          const propertyId = feature.properties.id
          if (propertyId !== undefined && propertyId !== null) {
            return String(propertyId)
          }
          const featureId = feature.id
          if (featureId !== undefined && featureId !== null) {
            return String(featureId)
          }
          return null
        })
        .filter((id): id is string => Boolean(id))

      let timestamp: string | undefined

      for (const key of candidateIds) {
        const iso = foundTimestamps[key]
        const formatted = formatTimestamp(iso)
        if (iso && formatted !== '—') {
          timestamp = formatted
          break
        }
      }

      if (!timestamp) {
        timestamp = formatTimestamp(undefined)
      }

      return {
        features,
        timestamp,
      }
    })
  }, [grouped, foundTimestamps, formatTimestamp])

  const hasResults = groupedWithTimestamp.length > 0
  const trimmedFilter = filter.trim()

  return (
    <div>
      <div className="mb-4 space-y-3">
        {grouped.length > 0 && (
          <div className="flex items-center justify-between">
            <p className="text-sm uppercase text-zinc-900 dark:text-zinc-100">
              {t('stations', { count: grouped.length })}
            </p>

            <SortMenu
              sortOptions={sortOptions}
              sort={sort}
              setSort={setSort}
              disabled={disabled}
            />
          </div>
        )}

        <div>
          <label className="sr-only" htmlFor="found-stations-search">
            {t('searchFoundStations')}
          </label>
          <input
            id="found-stations-search"
            type="search"
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            disabled={disabled}
            className="w-full rounded-full border border-zinc-200 px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none transition focus:border-zinc-400 focus:ring-2 focus:ring-zinc-300 disabled:cursor-not-allowed disabled:bg-zinc-100 disabled:text-zinc-400 dark:border-[#18181b] dark:bg-zinc-900/60 dark:text-zinc-100 dark:focus:border-zinc-500 dark:focus:ring-zinc-600 dark:disabled:bg-zinc-800 dark:disabled:text-zinc-500"
            placeholder={t('searchFoundStations')}
          />
        </div>
      </div>
      <ol className={classNames({ 'blur-md transition-all': hideLabels })}>
        {hasResults ? (
          groupedWithTimestamp.map(({ features, timestamp }) => (
            <GroupedLine
              key={getStationKey(features[0])}
              features={features}
              zoomToFeature={zoomToFeature}
              setHoveredId={setHoveredId}
              hoveredId={hoveredId}
              timestamp={timestamp}
              onStationFocus={onStationFocus}
              activeStationId={activeStationId}
              disabled={disabled}
            />
          ))
        ) : (
          <li className="rounded border border-dashed border-zinc-300 px-4 py-3 text-sm text-zinc-600 dark:border-[#18181b] dark:text-zinc-300">
            {t('noStationsFound', {
              query: normalizedFilter ? trimmedFilter : undefined,
            })}
          </li>
        )}
      </ol>
    </div>
  )
}

const GroupedLine = memo(
  ({
    features,
    zoomToFeature,
    setHoveredId,
    hoveredId,
    timestamp,
    onStationFocus,
    activeStationId,
    disabled,
  }: {
    features: DataFeature[]
    zoomToFeature: (id: number) => void
    setHoveredId: (id: number | null) => void
    hoveredId: number | null
    timestamp: string
    onStationFocus?: (id: number) => void
    activeStationId: number | null
    disabled?: boolean
  }) => {
    const { LINES, CITY_NAME } = useConfig()
    const { resolvedTheme } = useTheme()
    const isDark = resolvedTheme === 'dark'
    const buttonRef = useRef<HTMLButtonElement | null>(null)

    const featureIds = useMemo(() => {
      return features
        .map((feature) => getFeatureNumericId(feature))
        .filter((id): id is number => typeof id === 'number')
    }, [features])

    const primaryId = featureIds[0] ?? null

    const lineIds = useMemo(() => {
      const ids = new Set<string>()

      for (const feature of features) {
        const rawLine = (
          feature?.properties as { line?: string | string[] | null } | undefined
        )?.line

        if (typeof rawLine === 'string') {
          const trimmed = rawLine.trim()
          if (trimmed) {
            ids.add(trimmed)
          }
        } else if (Array.isArray(rawLine)) {
          for (const maybeLine of rawLine) {
            if (typeof maybeLine === 'string') {
              const trimmed = maybeLine.trim()
              if (trimmed) {
                ids.add(trimmed)
              }
            }
          }
        }
      }

      return Array.from(ids).sort((a, b) => {
        const aOrder = LINES[a]?.order ?? Number.MAX_SAFE_INTEGER
        const bOrder = LINES[b]?.order ?? Number.MAX_SAFE_INTEGER
        if (aOrder !== bOrder) {
          return aOrder - bOrder
        }
        return a.localeCompare(b)
      })
    }, [features, LINES])

    const isHovered = hoveredId !== null && featureIds.includes(hoveredId)
    const isActive =
      activeStationId !== null && featureIds.includes(activeStationId)
    const displayName = getDisplayName(features[0])

    useEffect(() => {
      if (isActive && buttonRef.current) {
        buttonRef.current.scrollIntoView({ block: 'center', behavior: 'smooth' })
      }
    }, [isActive])

    return (
      <Transition
        appear
        as="li"
        key={getStationKey(features[0])}
        show
        enter="transition duration-200 ease-out"
        enterFrom="opacity-0 -translate-y-1"
        enterTo="opacity-100 translate-y-0"
        leave="transition duration-150 ease-in"
        leaveFrom="opacity-100 translate-y-0"
        leaveTo="opacity-0 -translate-y-1"
      >
        <button
          ref={buttonRef}
          type="button"
          onClick={() => {
            if (typeof primaryId !== 'number') return
            zoomToFeature(primaryId)
            onStationFocus?.(primaryId)
          }}
          onMouseOver={() => setHoveredId(primaryId ?? null)}
          onMouseOut={() => setHoveredId(null)}
          disabled={disabled}
          className={classNames(
            'flex w-full items-start gap-3 rounded border border-zinc-200 bg-white px-3 py-2 text-sm transition-colors dark:border-[#18181b] dark:bg-zinc-900 dark:text-zinc-100',
            {
              'bg-yellow-200 shadow-sm dark:bg-amber-300/40': isHovered,
              'ring-2 ring-[var(--accent-ring)] shadow-lg dark:ring-[var(--accent-ring)]': isActive,
              'cursor-not-allowed opacity-60': disabled,
            },
          )}
          aria-pressed={isActive}
        >
          <div className="flex min-w-0 flex-1 flex-col items-start gap-1 text-left">
            <div
              className={classNames(
                'flex flex-wrap items-center',
                CITY_NAME === 'ny' ? 'gap-0' : 'gap-1',
              )}
            >
              {lineIds.map((lineId) => {
                const icon = LINES[lineId]?.icon
                const iconSrc = icon ? `/images/${icon}` : `/images/${lineId}.svg`
                return (
                  <Image
                    key={lineId}
                    alt={lineId}
                    src={iconSrc}
                    width={64}
                    height={64}
                    className="h-6 w-6 flex-shrink-0 rounded-full object-cover"
                  />
                )
              })}
            </div>
            <span
              className={classNames(
                'min-w-0 text-sm font-medium leading-tight transition-colors',
                isDark && isHovered
                  ? 'text-white'
                  : 'text-zinc-900 dark:text-zinc-100',
              )}
            >
              {displayName}
            </span>
          </div>
          <div className="ml-auto flex items-baseline gap-2">
            <span className="whitespace-nowrap text-xs text-gray-400 dark:text-gray-300">
              {timestamp}
            </span>
          </div>
        </button>
      </Transition>
    )
  },
)
GroupedLine.displayName = 'GroupedLine'

export default FoundList
