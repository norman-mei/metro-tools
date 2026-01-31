import { SUPPORTED_LANGUAGES } from '@/lib/i18n'

type JsonRecord = Record<string, unknown>

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export type CollapsedSections = Record<string, boolean>

export type CityViewMode =
  | 'globe'
  | 'map'
  | 'comfortable'
  | 'compact'
  | 'cover'
  | 'list'

export type HomeActiveTab =
  | 'cities'
  | 'achievements'
  | 'updateLog'
  | 'credits'
  | 'testimonials'
  | 'press'
  | 'settings'
  | 'account'
  | 'globalStats'
  | 'privacy'
  | 'support'

export type HomeScrollPositions = Partial<Record<HomeActiveTab, number>>

export type MapView = {
  zoom: number
  center: [number, number]
}

export type MapViewByCity = Record<string, MapView>

export type UiPreferences = {
  collapsedSections?: CollapsedSections
  language?: string
  timezone?: string
  hourFormat?: '12h' | '24h'
  cityViewMode?: CityViewMode
  cityViewSatellite?: boolean
  continentNavOpen?: boolean
  homeActiveTab?: HomeActiveTab
  homeScrollPositions?: HomeScrollPositions
  mapViewByCity?: MapViewByCity
  speedrunByCity?: Record<string, boolean>
}

export function normalizeCollapsedSections(
  value: unknown,
): CollapsedSections | undefined {
  if (!isRecord(value)) {
    return undefined
  }
  const entries = Object.entries(value).reduce<CollapsedSections>(
    (acc, [sectionId, raw]) => {
      if (typeof raw === 'boolean') {
        acc[sectionId] = raw
      }
      return acc
    },
    {},
  )
  return Object.keys(entries).length > 0 ? entries : undefined
}

export function normalizeLanguage(value: unknown): string | undefined {
  if (typeof value !== 'string') {
    return undefined
  }

  return SUPPORTED_LANGUAGES.some((lang) => lang.code === value)
    ? value
    : undefined
}

export function normalizeTimezone(value: unknown): string | undefined {
  if (typeof value !== 'string') {
    return undefined
  }
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : undefined
}

export function normalizeHourFormat(value: unknown): '12h' | '24h' | undefined {
  return value === '12h' || value === '24h' ? value : undefined
}

export function normalizeCityViewMode(value: unknown): CityViewMode | undefined {
  if (typeof value !== 'string') return undefined
  const allowed: CityViewMode[] = [
    'globe',
    'map',
    'comfortable',
    'compact',
    'cover',
    'list',
  ]
  return allowed.includes(value as CityViewMode) ? (value as CityViewMode) : undefined
}

export function normalizeCityViewSatellite(value: unknown): boolean | undefined {
  return typeof value === 'boolean' ? value : undefined
}

export function normalizeContinentNavOpen(value: unknown): boolean | undefined {
  return typeof value === 'boolean' ? value : undefined
}

export function normalizeHomeActiveTab(value: unknown): HomeActiveTab | undefined {
  const allowed: HomeActiveTab[] = [
    'cities',
    'achievements',
    'updateLog',
    'credits',
    'testimonials',
    'press',
    'settings',
    'account',
    'globalStats',
    'privacy',
    'support',
  ]
  return allowed.includes(value as HomeActiveTab) ? (value as HomeActiveTab) : undefined
}

export function normalizeHomeScrollPositions(
  value: unknown,
): HomeScrollPositions | undefined {
  if (!isRecord(value)) return undefined
  const entries = Object.entries(value).reduce<HomeScrollPositions>((acc, [key, raw]) => {
    const tab = normalizeHomeActiveTab(key)
    if (!tab) return acc
    const num = typeof raw === 'number' && Number.isFinite(raw) ? raw : undefined
    if (typeof num === 'number') {
      acc[tab] = num
    }
    return acc
  }, {})
  return Object.keys(entries).length > 0 ? entries : undefined
}

export function normalizeMapView(value: unknown): MapView | undefined {
  if (!isRecord(value)) return undefined
  const zoom =
    typeof value.zoom === 'number' && Number.isFinite(value.zoom) ? value.zoom : undefined
  const centerVal = value.center
  if (
    Array.isArray(centerVal) &&
    centerVal.length === 2 &&
    centerVal.every((n) => typeof n === 'number' && Number.isFinite(n))
  ) {
    const center: [number, number] = [centerVal[0] as number, centerVal[1] as number]
    if (zoom !== undefined) {
      return { zoom, center }
    }
  }
  return undefined
}

export function normalizeMapViewByCity(value: unknown): MapViewByCity | undefined {
  if (!isRecord(value)) return undefined
  const entries = Object.entries(value).reduce<MapViewByCity>((acc, [key, raw]) => {
    const mv = normalizeMapView(raw)
    if (mv) {
      acc[key] = mv
    }
    return acc
  }, {})
  return Object.keys(entries).length > 0 ? entries : undefined
}

export function normalizeUiPreferences(value: unknown): UiPreferences {
  if (!isRecord(value)) {
    return {}
  }

  const collapsedSections = normalizeCollapsedSections(
    value.collapsedSections,
  )
  const language = normalizeLanguage(value.language)
  const timezone = normalizeTimezone(value.timezone)
  const hourFormat = normalizeHourFormat(value.hourFormat)
  const cityViewMode = normalizeCityViewMode(value.cityViewMode)
  const cityViewSatellite = normalizeCityViewSatellite(value.cityViewSatellite)
  const continentNavOpen = normalizeContinentNavOpen(value.continentNavOpen)
  const homeActiveTab = normalizeHomeActiveTab(value.homeActiveTab)
  const homeScrollPositions = normalizeHomeScrollPositions(value.homeScrollPositions)
  const mapViewByCity = normalizeMapViewByCity(value.mapViewByCity)
  const speedrunByCity = isRecord(value.speedrunByCity)
    ? Object.entries(value.speedrunByCity).reduce<Record<string, boolean>>((acc, [k, v]) => {
        if (typeof v === 'boolean') acc[k] = v
        return acc
      }, {})
    : undefined

  return {
    ...(collapsedSections ? { collapsedSections } : {}),
    ...(language ? { language } : {}),
    ...(timezone ? { timezone } : {}),
    ...(hourFormat ? { hourFormat } : {}),
    ...(cityViewMode ? { cityViewMode } : {}),
    ...(cityViewSatellite !== undefined ? { cityViewSatellite } : {}),
    ...(continentNavOpen !== undefined ? { continentNavOpen } : {}),
    ...(homeActiveTab ? { homeActiveTab } : {}),
    ...(homeScrollPositions ? { homeScrollPositions } : {}),
    ...(mapViewByCity ? { mapViewByCity } : {}),
    ...(speedrunByCity ? { speedrunByCity } : {}),
  }
}

export function mergeHomeScrollPositions(
  current: HomeScrollPositions | undefined,
  updates: HomeScrollPositions | undefined,
): HomeScrollPositions | undefined {
  if (!updates) return current
  return {
    ...(current ?? {}),
    ...updates,
  }
}

export function mergeMapViewByCity(
  current: MapViewByCity | undefined,
  updates: MapViewByCity | undefined,
): MapViewByCity | undefined {
  if (!updates) return current
  return {
    ...(current ?? {}),
    ...updates,
  }
}

export function mergeCollapsedSections(
  current: CollapsedSections | undefined,
  updates: Record<string, boolean>,
): CollapsedSections {
  return {
    ...(current ?? {}),
    ...updates,
  }
}
