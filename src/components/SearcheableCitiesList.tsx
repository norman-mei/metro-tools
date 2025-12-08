'use client'

import { Transition } from '@headlessui/react'
import classNames from 'classnames'
import Fuse from 'fuse.js'
import { useTheme } from 'next-themes'
import { useSearchParams } from 'next/navigation'
import {
    Fragment,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
    type ReactNode,
} from 'react'

import AccountDashboard from '@/app/(website)/account/panel'
import AchievementIcon from '@/components/AchievementIcon'
import CityCard from '@/components/CityCard'
import CityStatsPanel from '@/components/CityStatsPanel'
import CollapsibleSection from '@/components/CollapsibleSection'
import CreditsContent from '@/components/CreditsContent'
import KoFiWidget from '@/components/KoFiWidget'
import PrivacyPanel from '@/components/PrivacyPanel'
import SettingsPanel from '@/components/SettingsPanel'
import { useAuth } from '@/context/AuthContext'
import useTranslation from '@/hooks/useTranslation'
import { getAchievementForCity } from '@/lib/achievements'
import { cities, ICity } from '@/lib/citiesConfig'
import { STATION_TOTALS } from '@/lib/stationTotals'

type CitySortOption =
  | 'default'
  | 'name-asc'
  | 'name-desc'
  | 'continent-asc'
  | 'continent-desc'
  | 'progress-not-played'
  | 'progress-played'
type AchievementSortOption =
  | 'default'
  | 'name-asc'
  | 'name-desc'
  | 'continent-asc'
  | 'continent-desc'
  | 'not-achieved-asc'
  | 'not-achieved-desc'
  | 'achieved-asc'
  | 'achieved-desc'

const CITY_SORT_OPTIONS: Array<{ value: CitySortOption; label: string }> = [
  { value: 'default', label: 'sortDefault' },
  { value: 'name-asc', label: 'sortNameAsc' },
  { value: 'name-desc', label: 'sortNameDesc' },
  { value: 'continent-asc', label: 'sortContinentAsc' },
  { value: 'continent-desc', label: 'sortContinentDesc' },
  { value: 'progress-not-played', label: 'sortNotPlayed' },
  { value: 'progress-played', label: 'sortPlayed' },
]

const ACHIEVEMENT_SORT_OPTIONS: Array<{ value: AchievementSortOption; label: string }> = [
  { value: 'default', label: 'sortDefault' },
  { value: 'name-asc', label: 'sortNameAsc' },
  { value: 'name-desc', label: 'sortNameDesc' },
  { value: 'continent-asc', label: 'sortContinentAsc' },
  { value: 'continent-desc', label: 'sortContinentDesc' },
  { value: 'not-achieved-asc', label: 'sortNotAchieved' },
  { value: 'not-achieved-desc', label: 'sortNotAchieved' },
  { value: 'achieved-asc', label: 'sortAchieved' },
  { value: 'achieved-desc', label: 'sortAchieved' },
]

const TAB_OPTIONS: Array<{ id: TabOption; label: string }> = [
  { id: 'cities', label: 'tabCities' },
  { id: 'achievements', label: 'tabAchievements' },
  { id: 'updateLog', label: 'tabUpdateLog' },
  { id: 'account', label: 'tabAccount' },
  { id: 'globalStats', label: 'tabGlobalStats' },
  { id: 'settings', label: 'tabSettings' },
  { id: 'credits', label: 'tabCredits' },
  { id: 'privacy', label: 'tabPrivacy' },
  { id: 'testimonials', label: 'tabTestimonials' },
  { id: 'press', label: 'tabPress' },
  { id: 'support', label: 'tabSupport' },
]
const SECONDARY_TAB_IDS = new Set<TabOption>([
  'credits',
  'privacy',
  'testimonials',
  'press',
  'support',
])
const PRIMARY_TABS = TAB_OPTIONS.filter(({ id }) => !SECONDARY_TAB_IDS.has(id))
const SECONDARY_TABS = TAB_OPTIONS.filter(({ id }) => SECONDARY_TAB_IDS.has(id))
type TabOption =
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

type UpdateLogStatus = 'idle' | 'loading' | 'success' | 'error'

type UpdateLogEntry = {
  sha: string
  message: string
  author: string
  date?: string
  url: string
}

type UpdateLogState = {
  status: UpdateLogStatus
  entries: UpdateLogEntry[]
  errorMessage?: string
  lastUpdated?: string
}

type GithubCommitResponse = {
  sha?: string
  html_url?: string
  commit?: {
    message?: string
    author?: { name?: string; date?: string | null }
    committer?: { date?: string | null }
  }
  author?: { login?: string | null }
}

const UPDATE_LOG_ENDPOINT =
  'https://api.github.com/repos/norman-mei/metro-memory/commits?per_page=20'

const UPDATE_LOG_HEADERS: HeadersInit = {
  Accept: 'application/vnd.github+json',
  'X-GitHub-Api-Version': '2022-11-28',
}

const UPDATE_LOG_LIMIT = 15
const UPDATE_LOG_TIMEOUT_MS = 5_000
const COLLAPSIBLE_CONTINENTS = new Set([
  'North America',
  'Europe',
  'Asia',
  'Oceania',
])

const getContinentSectionId = (continent: string) => {
  const slug = continent
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return slug ? `continent-${slug}` : 'continent-unknown'
}

const formatCommitMessage = (message?: string | null) => {
  if (!message) {
    return 'No commit message'
  }
  const firstLine = message.split('\n')[0]?.trim()
  return firstLine && firstLine.length > 0 ? firstLine : 'No commit message'
}

const REGION_KEYWORDS: Record<string, string[]> = {
  AL: ['Alabama', 'AL'],
  AK: ['Alaska', 'AK'],
  AZ: ['Arizona', 'AZ'],
  AR: ['Arkansas', 'AR'],
  CA: ['California', 'CA'],
  CO: ['Colorado', 'CO'],
  CT: ['Connecticut', 'CT'],
  DE: ['Delaware', 'DE'],
  FL: ['Florida', 'FL'],
  GA: ['Georgia', 'GA'],
  HI: ['Hawaii', 'HI'],
  ID: ['Idaho', 'ID'],
  IL: ['Illinois', 'IL'],
  IN: ['Indiana', 'IN'],
  IA: ['Iowa', 'IA'],
  KS: ['Kansas', 'KS'],
  KY: ['Kentucky', 'KY'],
  LA: ['Louisiana', 'LA'],
  ME: ['Maine', 'ME'],
  MD: ['Maryland', 'MD'],
  MA: ['Massachusetts', 'MA'],
  MI: ['Michigan', 'MI'],
  MN: ['Minnesota', 'MN'],
  MS: ['Mississippi', 'MS'],
  MO: ['Missouri', 'MO'],
  MT: ['Montana', 'MT'],
  NE: ['Nebraska', 'NE'],
  NV: ['Nevada', 'NV'],
  NH: ['New Hampshire', 'NH'],
  NJ: ['New Jersey', 'NJ'],
  NM: ['New Mexico', 'NM'],
  NY: ['New York', 'NY'],
  NC: ['North Carolina', 'NC'],
  ND: ['North Dakota', 'ND'],
  OH: ['Ohio', 'OH'],
  OK: ['Oklahoma', 'OK'],
  OR: ['Oregon', 'OR'],
  PA: ['Pennsylvania', 'PA'],
  RI: ['Rhode Island', 'RI'],
  SC: ['South Carolina', 'SC'],
  SD: ['South Dakota', 'SD'],
  TN: ['Tennessee', 'TN'],
  TX: ['Texas', 'TX'],
  UT: ['Utah', 'UT'],
  VT: ['Vermont', 'VT'],
  VA: ['Virginia', 'VA'],
  WA: ['Washington', 'WA'],
  WV: ['West Virginia', 'WV'],
  WI: ['Wisconsin', 'WI'],
  WY: ['Wyoming', 'WY'],
  DC: ['District of Columbia', 'DC', 'Washington DC'],
  PR: ['Puerto Rico', 'PR'],
  MX: ['Mexico', 'MX'],
  CAN: ['Canada', 'CAN'],
  AB: ['Alberta', 'AB'],
  BC: ['British Columbia', 'BC'],
  MB: ['Manitoba', 'MB'],
  NB: ['New Brunswick', 'NB'],
  NL: ['Newfoundland and Labrador', 'NL'],
  NS: ['Nova Scotia', 'NS'],
  NT: ['Northwest Territories', 'NT'],
  NU: ['Nunavut', 'NU'],
  ON: ['Ontario', 'ON'],
  PE: ['Prince Edward Island', 'PE'],
  QC: ['Quebec', 'QC'],
  SK: ['Saskatchewan', 'SK'],
  YT: ['Yukon', 'YT'],
  USA: ['United States', 'USA', 'US', 'America'],
}

const extractRegionKeywords = (name: string): string[] | undefined => {
  const match = name.match(/,\s*([A-Z]{2,3}(?:\/[A-Z]{2,3})*)/)
  if (!match) return undefined
  const codes = match[1].split('/')
  const keywords = new Set<string>()
  for (const code of codes) {
    const list = REGION_KEYWORDS[code]
    if (list) {
      list.forEach((word) => {
        keywords.add(word)
        keywords.add(word.toLowerCase())
      })
    }
  }
  return keywords.size > 0 ? Array.from(keywords) : undefined
}

const enrichCities = (cityList: ICity[]): ICity[] =>
  cityList.map((city) => {
    if (city.keywords && city.keywords.length > 0) {
      return city
    }
    const keywords = extractRegionKeywords(city.name)
    return keywords ? { ...city, keywords } : city
  })

const getSlugFromLink = (link: string) => {
  if (!link.startsWith('/')) {
    return null
  }
  return link.replace(/^\//, '').split(/[?#]/)[0]
}

interface AchievementMeta {
  slug: string
  cityName: string
  title: string
  description: string
  continent: string
  order: number
  iconSrc?: string
}

type SearcheableCitiesListProps = {
  testimonialsContent?: ReactNode
  pressContent?: ReactNode
}

const clamp01 = (value: number) => Math.max(0, Math.min(1, value))

const mixChannel = (start: number, end: number, t: number) =>
  Math.round(start + (end - start) * clamp01(t))

const getGradientColor = (percent: number) => {
  const t = clamp01(percent)
  const hue = 120 * t // 0 = red, 120 = green
  const saturation = mixChannel(75, 65, t) // slightly dial back saturation toward green
  return `hsl(${hue}deg, ${saturation}%, 50%)`
}

const getBarBackground = (percent: number) => {
  const midColor = getGradientColor(percent)
  return `linear-gradient(90deg, ${midColor} 0%, ${midColor} 100%)`
}

type GlobalStats = {
  totalStationsFound: number
  totalStations: number
  percentFound: number
  cityBreakdown: Array<{
    slug: string
    name: string
    percent: number
    found: number
    total: number
  }>
  completedCities: number
  partialCities: number
  notStartedCities: number
}

const SearcheableCitiesList = ({
  testimonialsContent,
  pressContent,
}: SearcheableCitiesListProps) => {
  const { t } = useTranslation()
  const searchParams = useSearchParams()
  const lastSearchParamStringRef = useRef<string | null>(null)
  const [activeTab, setActiveTab] = useState<TabOption>('cities')
  const [search, setSearch] = useState('')
  const [citySort, setCitySort] = useState<CitySortOption>('default')
  const [globalStatsSearch, setGlobalStatsSearch] = useState('')
  const [globalStatsSort, setGlobalStatsSort] = useState<CitySortOption>('default')
  const [cityViewMode, setCityViewMode] = useState<CityViewMode>('comfortable')
  const [achievementSearch, setAchievementSearch] = useState('')
  const [achievementSort, setAchievementSort] = useState<AchievementSortOption>('default')
  const [unlockedSlugs, setUnlockedSlugs] = useState<string[]>([])
  const [updateLogState, setUpdateLogState] = useState<UpdateLogState>({
    status: 'idle',
    entries: [],
  })
  const { progressSummaries } = useAuth()
  const [cityProgress, setCityProgress] = useState<Record<string, number>>({})
  const [globalStats, setGlobalStats] = useState<GlobalStats>({
    totalStationsFound: 0,
    totalStations: 0,
    percentFound: 0,
    cityBreakdown: [],
    completedCities: 0,
    partialCities: 0,
    notStartedCities: 0,
  })
  const [statsOpen, setStatsOpen] = useState(false)
  const [statsSlug, setStatsSlug] = useState<string | null>(null)

  const enrichedCities = useMemo(() => enrichCities(cities), [])
  const cityAchievementCatalog = useMemo(() => {
    return enrichedCities
      .map((city, index) => {
        const slug = getSlugFromLink(city.link)
        if (!slug) return null
        const baseName = city.name.split(',')[0]
        const meta = getAchievementForCity(slug, baseName)
        return {
          slug,
          cityName: baseName,
          title: meta.title,
          description: meta.description,
          continent: city.continent,
          order: index,
        }
      })
      .filter((entry): entry is AchievementMeta => entry !== null)
  }, [enrichedCities])
  const cityMetaBySlug = useMemo(() => {
    const map = new Map<string, ICity>()
    enrichedCities.forEach((city) => {
      const slug = getSlugFromLink(city.link)
      if (slug) {
        map.set(slug, city)
      }
    })
    return map
  }, [enrichedCities])
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  const masterAchievement = useMemo<AchievementMeta>(() => {
    const totalCities = cityAchievementCatalog.length
    return {
      slug: 'metro-memory-master',
      cityName: 'Metro Memory',
      title: 'Master Completionist',
      description:
        totalCities > 0
          ? `Unlock all ${totalCities} city achievements to earn this final badge.`
          : 'Unlock every city achievement to earn this final badge.',
      continent: 'Global',
      order: Number.MAX_SAFE_INTEGER,
      iconSrc: '/favicon.ico',
    }
  }, [cityAchievementCatalog.length])

  const achievementCatalog = useMemo(
    () => [masterAchievement, ...cityAchievementCatalog],
    [cityAchievementCatalog, masterAchievement],
  )

  const fuse = useMemo(
    () =>
      new Fuse(enrichedCities, {
        keys: ['name', 'keywords'],
        minMatchCharLength: 1,
        threshold: 0.3,
        distance: 100,
        ignoreLocation: true,
      }),
    [enrichedCities],
  )

  const achievementFuse = useMemo(
    () =>
      new Fuse(achievementCatalog, {
        keys: ['cityName', 'title', 'description', 'slug', 'continent'],
        minMatchCharLength: 1,
        threshold: 0.35,
        distance: 100,
        ignoreLocation: true,
      }),
    [achievementCatalog],
  )

  const computeCityProgress = useCallback(() => {
    if (typeof window === 'undefined') {
      return
    }
    const next: Record<string, number> = {}
    const breakdown: GlobalStats['cityBreakdown'] = []
    let totalStations = 0
    let totalFound = 0
    let completedCities = 0
    let partialCities = 0
    let notStartedCities = 0

    enrichedCities.forEach((city) => {
      const slug = getSlugFromLink(city.link)
      if (!slug) {
        return
      }
      const totalRaw = window.localStorage.getItem(`${slug}-station-total`)
      const total = Number(totalRaw)
      const storedStationTotal = Number.isFinite(total) && total > 0 ? total : null
      const fallbackStationTotal = STATION_TOTALS[slug]
      const cityStationTotal =
        storedStationTotal ??
        (typeof fallbackStationTotal === 'number' && fallbackStationTotal > 0
          ? fallbackStationTotal
          : null)
      let foundCount = 0
      const stored = window.localStorage.getItem(`${slug}-stations`)
      if (stored) {
        try {
          const parsed = JSON.parse(stored)
          if (Array.isArray(parsed)) {
            foundCount = new Set(parsed.filter((value) => typeof value === 'number')).size
          } else if (typeof parsed === 'number') {
            foundCount = parsed
          }
        } catch {
          foundCount = 0
        }
      }
      const remoteFound = progressSummaries[slug]
      if (typeof remoteFound === 'number') {
        foundCount = remoteFound
      }
      let ratio = 0
      if (cityStationTotal && cityStationTotal > 0) {
        ratio = Math.max(0, Math.min(1, foundCount / cityStationTotal))
      } else if (foundCount > 0) {
        ratio = 1
      }
      next[slug] = ratio

      const cityTotalStations = cityStationTotal ?? foundCount
      totalStations += cityTotalStations
      totalFound += Math.min(foundCount, cityTotalStations)

      if (ratio >= 1) {
        completedCities += 1
      } else if (ratio > 0) {
        partialCities += 1
      } else {
        notStartedCities += 1
      }

      breakdown.push({
        slug,
        name: city.name,
        percent: ratio,
        found: foundCount,
        total: cityTotalStations,
      })
    })

    setGlobalStats({
      totalStationsFound: totalFound,
      totalStations,
      percentFound: totalStations > 0 ? totalFound / totalStations : 0,
      cityBreakdown: breakdown.sort((a, b) => a.name.localeCompare(b.name)),
      completedCities,
      partialCities,
      notStartedCities,
    })
    setCityProgress(next)
  }, [enrichedCities, progressSummaries])

  useEffect(() => {
    computeCityProgress()
  }, [computeCityProgress])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }
    const handleProgressUpdate = () => {
      computeCityProgress()
    }
    window.addEventListener('storage', handleProgressUpdate)
    window.addEventListener('focus', handleProgressUpdate)
    return () => {
      window.removeEventListener('storage', handleProgressUpdate)
      window.removeEventListener('focus', handleProgressUpdate)
    }
  }, [computeCityProgress])

  const cityMatchesSearch = useCallback(
    (entry: (typeof globalStats)['cityBreakdown'][number]) => {
      const query = globalStatsSearch.trim().toLowerCase()
      if (!query) return true
      const cityMeta = cityMetaBySlug.get(entry.slug)
      const keywords = cityMeta?.keywords?.join(' ') ?? ''
      const haystack = `${entry.name} ${entry.slug} ${cityMeta?.continent ?? ''} ${keywords}`.toLowerCase()
      return haystack.includes(query)
    },
    [cityMetaBySlug, globalStatsSearch],
  )

  const visibleCityBreakdown = useMemo(() => {
    const filtered = globalStats.cityBreakdown.filter(cityMatchesSearch)
    const compareName = (a: GlobalStats['cityBreakdown'][number], b: GlobalStats['cityBreakdown'][number]) =>
      a.name.localeCompare(b.name)
    const continentOf = (entry: GlobalStats['cityBreakdown'][number]) =>
      cityMetaBySlug.get(entry.slug)?.continent ?? ''
    const compareContinent = (
      a: GlobalStats['cityBreakdown'][number],
      b: GlobalStats['cityBreakdown'][number],
    ) => {
      const result = continentOf(a).localeCompare(continentOf(b))
      return result !== 0 ? result : compareName(a, b)
    }
    const getProgress = (entry: GlobalStats['cityBreakdown'][number]) => clamp01(entry.percent)
    const base = [...filtered]
    switch (globalStatsSort) {
      case 'name-asc':
        return base.sort(compareName)
      case 'name-desc':
        return base.sort((a, b) => compareName(b, a))
      case 'continent-asc':
        return base.sort(compareContinent)
      case 'continent-desc':
        return base.sort((a, b) => compareContinent(b, a))
      case 'progress-not-played':
        return base.sort((a, b) => {
          const diff = getProgress(a) - getProgress(b)
          if (Math.abs(diff) > 0.0001) {
            return diff
          }
          return compareName(a, b)
        })
      case 'progress-played':
        return base.sort((a, b) => {
          const diff = getProgress(b) - getProgress(a)
          if (Math.abs(diff) > 0.0001) {
            return diff
          }
          return compareName(a, b)
        })
      case 'default':
      default:
        return base.sort(compareName)
    }
  }, [cityMetaBySlug, globalStats.cityBreakdown, globalStatsSort, cityMatchesSearch])

  const statsNavigation = useMemo(() => {
    if (!visibleCityBreakdown.length) {
      return null
    }
    const slugs = visibleCityBreakdown.map(({ slug }) => slug)
    const slugToName = new Map(visibleCityBreakdown.map(({ slug, name }) => [slug, name]))
    return { slugs, slugToName }
  }, [visibleCityBreakdown])

  const statsCityDisplayName =
    (statsSlug && statsNavigation?.slugToName.get(statsSlug)) ?? statsSlug ?? ''

  const handleNavigateStats = (direction: -1 | 1) => {
    if (!statsNavigation || !statsSlug) {
      return
    }
    const { slugs } = statsNavigation
    if (slugs.length <= 1) {
      return
    }
    const currentIndex = slugs.indexOf(statsSlug)
    if (currentIndex === -1) {
      return
    }
    const nextIndex = (currentIndex + direction + slugs.length) % slugs.length
    setStatsSlug(slugs[nextIndex])
  }

  const handlePrevStats = () => handleNavigateStats(-1)
  const handleNextStats = () => handleNavigateStats(1)

  const sortedCities = useMemo(() => {
    const compareName = (a: ICity, b: ICity) => a.name.localeCompare(b.name)
    const compareContinent = (a: ICity, b: ICity) => {
      const result = a.continent.localeCompare(b.continent)
      return result !== 0 ? result : compareName(a, b)
    }
    const getProgress = (city: ICity) => {
      const slug = getSlugFromLink(city.link)
      if (!slug) {
        return 0
      }
      const value = cityProgress[slug]
      return Number.isFinite(value) ? value : 0
    }
    const baseline = [...enrichedCities]
    switch (citySort) {
      case 'name-asc':
        return baseline.sort(compareName)
      case 'name-desc':
        return baseline.sort((a, b) => compareName(b, a))
      case 'continent-asc':
        return baseline.sort(compareContinent)
      case 'continent-desc':
        return baseline.sort((a, b) => compareContinent(b, a))
      case 'progress-not-played':
        return baseline.sort((a, b) => {
          const diff = getProgress(a) - getProgress(b)
          if (Math.abs(diff) > 0.0001) {
            return diff
          }
          return compareName(a, b)
        })
      case 'progress-played':
        return baseline.sort((a, b) => {
          const diff = getProgress(b) - getProgress(a)
          if (Math.abs(diff) > 0.0001) {
            return diff
          }
          return compareName(a, b)
        })
      case 'default':
      default:
        return baseline.sort(compareName)
    }
  }, [enrichedCities, cityProgress, citySort])

const continentOrder = useMemo(
  () => ['North America', 'South America', 'Europe', 'Asia', 'Australia', 'Africa', 'Oceania', 'Antarctica'],
  [],
)

const CONTINENT_LABEL_KEYS: Record<string, string> = {
  'North America': 'northAmerica',
  'South America': 'southAmerica',
  Europe: 'europe',
  Asia: 'asia',
  Australia: 'australia',
  Africa: 'africa',
  Oceania: 'oceania',
  Antarctica: 'antarctica',
}

  const groupedCities = useMemo(() => {
    const continentMap = new Map<string, ICity[]>()
    sortedCities.forEach((city) => {
      if (!continentMap.has(city.continent)) {
        continentMap.set(city.continent, [])
      }
      continentMap.get(city.continent)!.push(city)
    })
    const entries = Array.from(continentMap.entries())
    const sortEntries = () => {
      if (citySort === 'continent-asc') return entries.sort((a, b) => a[0].localeCompare(b[0]))
      if (citySort === 'continent-desc') return entries.sort((a, b) => b[0].localeCompare(a[0]))
      return entries.sort((a, b) => {
        const aIndex = continentOrder.indexOf(a[0])
        const bIndex = continentOrder.indexOf(b[0])
        if (aIndex === -1 && bIndex === -1) return a[0].localeCompare(b[0])
        if (aIndex === -1) return 1
        if (bIndex === -1) return -1
        return aIndex - bIndex
      })
    }
    return sortEntries().map(([continent, list]) => ({ continent, cities: list }))
  }, [sortedCities, continentOrder, citySort])

  const fullCitiesSet = useMemo(() => new Set(enrichedCities.map((city) => city.link)), [enrichedCities])

  const results = useMemo(() => {
    const normalized = search.trim()
    if (normalized.length === 0) {
      return fullCitiesSet
    }
    const res = fuse.search(normalized)
    return new Set(res.map((result) => result.item.link))
  }, [search, fuse, fullCitiesSet])

  const visibleGroups = useMemo(() => {
    return groupedCities
      .map(({ continent, cities }) => ({
        continent,
        cities: cities.filter((city) => results.has(city.link)),
      }))
      .filter((group) => group.cities.length > 0)
  }, [groupedCities, results])

  const navigationCities = useMemo(
    () => visibleGroups.flatMap((group) => group.cities),
    [visibleGroups],
  )

  const unlockedSet = useMemo(() => new Set(unlockedSlugs), [unlockedSlugs])
  const allAchievementSlugs = useMemo(() => achievementCatalog.map((entry) => entry.slug), [achievementCatalog])

  const achievementSearchSet = useMemo(() => {
    const normalized = achievementSearch.trim()
    if (normalized.length === 0) {
      return new Set(allAchievementSlugs)
    }
    const res = achievementFuse.search(normalized)
    return new Set(res.map((result) => result.item.slug))
  }, [achievementSearch, achievementFuse, allAchievementSlugs])

  const visibleAchievements = useMemo(() => {
    const filtered = achievementCatalog.filter((entry) => achievementSearchSet.has(entry.slug))
    return sortAchievementEntries(filtered, achievementSort, unlockedSet)
  }, [achievementCatalog, achievementSearchSet, achievementSort, unlockedSet])

  const fetchUpdateLog = useCallback(
    async (signal?: AbortSignal) => {
      setUpdateLogState((prev) => ({
        ...prev,
        status: 'loading',
        errorMessage: undefined,
      }))

      try {
        const response = await fetch(UPDATE_LOG_ENDPOINT, {
          headers: UPDATE_LOG_HEADERS,
          signal,
        })

        if (!response.ok) {
          throw new Error(`GitHub responded with status ${response.status}`)
        }

        const payload = (await response.json()) as GithubCommitResponse[]
        if (signal?.aborted) {
          return
        }

        if (!Array.isArray(payload)) {
          throw new Error('Unexpected GitHub response')
        }

        const entries = payload
          .map<UpdateLogEntry | null>((item) => {
            const sha = item.sha ?? ''
            if (!sha) {
              return null
            }
            const message = formatCommitMessage(item.commit?.message)
            const author =
              item.commit?.author?.name ??
              item.author?.login ??
              'Unknown contributor'
            const date =
              item.commit?.author?.date ??
              item.commit?.committer?.date ??
              undefined
            const url =
              item.html_url ??
              `https://github.com/norman-mei/metro-memory/commit/${sha}`

            return {
              sha,
              message,
              author,
              date: typeof date === 'string' ? date : undefined,
              url,
            }
          })
          .filter((entry): entry is UpdateLogEntry => entry !== null)
          .slice(0, UPDATE_LOG_LIMIT)

        setUpdateLogState({
          status: 'success',
          entries,
          lastUpdated: new Date().toISOString(),
        })
      } catch (error) {
        if (signal?.aborted) {
          return
        }

        setUpdateLogState({
          status: 'error',
          entries: [],
          errorMessage:
            error instanceof Error ? error.message : 'Unable to fetch updates',
        })
      }
    },
    [],
  )

  useEffect(() => {
    if (activeTab !== 'updateLog' || updateLogState.status !== 'idle') {
      return
    }

    const controller = new AbortController()
    let timeoutId: ReturnType<typeof setTimeout> | undefined

    const handleTimeout = () => {
      controller.abort()
      setUpdateLogState((prev) => {
        if (prev.status === 'loading' || prev.status === 'idle') {
          return {
            status: 'success',
            entries: [],
            lastUpdated: new Date().toISOString(),
          }
        }
        return prev
      })
    }

    timeoutId = setTimeout(handleTimeout, UPDATE_LOG_TIMEOUT_MS)
    fetchUpdateLog(controller.signal).finally(() => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    })

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
      controller.abort()
    }
  }, [activeTab, fetchUpdateLog, updateLogState.status])

  const handleUpdateLogRetry = useCallback(() => {
    if (updateLogState.status === 'loading') {
      return
    }
    fetchUpdateLog()
  }, [fetchUpdateLog, updateLogState.status])

  useEffect(() => {
    const computeAchievements = () => {
      if (typeof window === 'undefined') return
      const unlocked: string[] = []
      cityAchievementCatalog.forEach((entry) => {
        const { slug } = entry
        const totalRaw = window.localStorage.getItem(`${slug}-station-total`)
        const total = Number(totalRaw)
        if (!Number.isFinite(total) || total <= 0) {
          return
        }
        let foundCount = 0
        const stored = window.localStorage.getItem(`${slug}-stations`)
        if (stored) {
          try {
            const parsed = JSON.parse(stored)
            if (Array.isArray(parsed)) {
              foundCount = new Set(parsed.filter((value) => typeof value === 'number')).size
            } else if (typeof parsed === 'number') {
              foundCount = parsed
            }
          } catch {
            foundCount = 0
          }
        }
        if (foundCount >= total) {
          unlocked.push(slug)
        }
      })
      if (cityAchievementCatalog.length > 0 && unlocked.length === cityAchievementCatalog.length) {
        unlocked.push(masterAchievement.slug)
      }
      setUnlockedSlugs(unlocked)
    }

    computeAchievements()
    window.addEventListener('storage', computeAchievements)
    window.addEventListener('focus', computeAchievements)
    return () => {
      window.removeEventListener('storage', computeAchievements)
      window.removeEventListener('focus', computeAchievements)
    }
  }, [cityAchievementCatalog, masterAchievement.slug])

  useEffect(() => {
    if (!searchParams) return
    const currentQuery = searchParams.toString()
    if (currentQuery === lastSearchParamStringRef.current) {
      return
    }
    lastSearchParamStringRef.current = currentQuery
    const tabParam = searchParams.get('tab')
    if (!tabParam) return
    const normalized = TAB_OPTIONS.find(({ id }) => id === tabParam)?.id
    if (normalized) {
      setActiveTab(normalized as TabOption)
    }
  }, [searchParams])

  const hasResults = visibleGroups.length > 0
  const openStatsPanelForCity = (slug: string) => {
    setStatsSlug(slug)
    setStatsOpen(true)
  }
  const getStatusClass = (percent: number) =>
    percent >= 1
      ? 'text-emerald-600 dark:text-emerald-400'
      : percent > 0
        ? 'text-amber-500'
        : 'text-red-500'

  const renderCityCollection = (cityList: ICity[]) => {
    const variant =
      cityViewMode === 'cover'
        ? 'cover'
        : cityViewMode === 'compact'
          ? 'compact'
          : cityViewMode === 'list'
            ? 'list'
            : 'comfortable'

    if (cityViewMode === 'list') {
      return (
        <div className="space-y-4">
          {cityList.map((city) => (
            <Transition
              key={city.link}
              as="div"
              appear
              enterFrom="opacity-0 translate-y-2"
              enter="transition-all ease-out duration-200"
              leaveFrom="opacity-100 translate-y-0"
              leave="transition-all ease-in duration-200"
              show
            >
              <CityCard
                city={city}
                variant={variant}
                visibleCities={navigationCities.length > 0 ? navigationCities : cityList}
              />
            </Transition>
          ))}
        </div>
      )
    }

    const gridClasses = classNames(
      'mx-auto grid max-w-full grid-cols-1',
      cityViewMode === 'compact' && 'gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5',
      cityViewMode === 'comfortable' && 'gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
      cityViewMode === 'cover' && 'gap-6 md:grid-cols-2 xl:grid-cols-3',
    )

    return (
      <div className={gridClasses}>
        {cityList.map((city) => (
          <Transition
            key={city.link}
            as="div"
            appear
            enterFrom="opacity-0 translate-y-4"
            enter="transition-all ease-out duration-200"
            leaveFrom="opacity-100 translate-y-0"
            leave="transition-all ease-in duration-200"
            show
          >
            <CityCard
              city={city}
              variant={variant}
              visibleCities={navigationCities.length > 0 ? navigationCities : cityList}
            />
          </Transition>
        ))}
      </div>
    )
  }

  const renderGlobalBar = (
    label: string,
    percent: number,
    detail?: string,
    showPointer = false,
  ) => {
    const clamped = clamp01(percent)
    const color = getGradientColor(clamped)
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-[#18181b] dark:bg-zinc-900">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">{label}</div>
          <div className="text-sm font-semibold" style={{ color }}>
            {(clamped * 100).toFixed(2)}%
          </div>
        </div>
        <div className="relative mt-2 h-3 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
          <div
            className="h-full rounded-full transition-[width]"
            style={{
              width: `${(clamped * 100).toFixed(2)}%`,
              background: getBarBackground(clamped),
            }}
          />
          {showPointer && (
            <div
              className="pointer-events-none absolute -bottom-[10px] h-0 w-0"
              style={{
                left: `${(clamped * 100).toFixed(2)}%`,
                transform: 'translateX(-50%)',
                borderLeft: '6px solid transparent',
                borderRight: '6px solid transparent',
                borderTop: `8px solid ${isDark ? '#ffffff' : '#000000'}`,
              }}
            />
          )}
        </div>
        {detail && (
          <p className="mt-2 text-xs font-semibold" style={{ color }}>
            {detail}
          </p>
        )}
      </div>
    )
  }

  return (
    <>
      <div className="my-16 mt-16 sm:mt-20">
        <div className="mb-6 rounded-3xl border border-zinc-200/80 bg-white/70 p-4 shadow-sm backdrop-blur dark:border-zinc-800/80 dark:bg-zinc-900/70">
          <div className="mb-4 flex flex-wrap justify-center gap-3">
            {PRIMARY_TABS.map(({ id, label }) => {
              const labelText = t(label)
              return (
                <button
                  key={id}
                  onClick={() => {
                    setActiveTab(id)
                  }}
                  className={classNames(
                    'rounded-full px-4 py-2 text-sm font-semibold transition',
                    activeTab === id
                      ? 'bg-[var(--accent-600)] text-white dark:bg-[var(--accent-500)]'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700',
                  )}
                >
                  {labelText}
                </button>
              )
            })}
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {SECONDARY_TABS.map(({ id, label }) => {
              const labelText = t(label)
              return (
                <button
                  key={id}
                  onClick={() => {
                    setActiveTab(id)
                  }}
                  className={classNames(
                    'rounded-full px-4 py-2 text-sm font-semibold transition',
                    activeTab === id
                      ? 'bg-[var(--accent-600)] text-white dark:bg-[var(--accent-500)]'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700',
                  )}
                >
                  {labelText}
                </button>
              )
            })}
          </div>
        </div>

      {activeTab === 'cities' ? (
        <>
          <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full">
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="block w-full rounded-full border-0 px-10 py-4 pr-10 text-lg text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[var(--accent-600)] sm:leading-6 dark:bg-zinc-900 dark:text-zinc-100 dark:ring-zinc-700 dark:placeholder:text-zinc-500 dark:focus:ring-[var(--accent-400)]"
                type="text"
                placeholder={t('searchCities')}
              />
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 dark:text-zinc-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5A6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5S14 7.01 14 9.5S11.99 14 9.5 14z"
                  />
                </svg>
              </div>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center lg:w-auto">
              <div className="w-full sm:w-48">
                <label className="sr-only" htmlFor="city-sort">
                  Sort cities
                </label>
                <select
                  id="city-sort"
                  value={citySort}
                  onChange={(event) => setCitySort(event.target.value as CitySortOption)}
                  className="w-full rounded-full border-0 bg-white px-4 py-3 text-sm font-medium text-gray-700 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-[var(--accent-600)] dark:bg-zinc-900 dark:text-zinc-100 dark:ring-zinc-700 dark:focus:ring-[var(--accent-400)]"
                >
                  {CITY_SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {t(option.label)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="w-full sm:w-48">
                <label className="sr-only" htmlFor="city-view">
                  View
                </label>
                <select
                  id="city-view"
                  value={cityViewMode}
                  onChange={(event) => setCityViewMode(event.target.value as CityViewMode)}
                  className="w-full rounded-full border-0 bg-white px-4 py-3 text-sm font-medium text-gray-700 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-[var(--accent-600)] dark:bg-zinc-900 dark:text-zinc-100 dark:ring-zinc-700 dark:focus:ring-[var(--accent-400)]"
                >
                  {CITY_VIEW_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {t(option.label)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          {hasResults ? (
            <div className="space-y-10">
              {visibleGroups.map(({ continent, cities }, index) => {
                const cityCount = cities.length
                const cityGrid = renderCityCollection(cities)
                const translatedContinent =
                  CONTINENT_LABEL_KEYS[continent] !== undefined
                    ? t(CONTINENT_LABEL_KEYS[continent])
                    : continent
                const cityCountLabel = t('cityCount', { count: cityCount })

                const isCollapsible = COLLAPSIBLE_CONTINENTS.has(continent)
                const sectionId = getContinentSectionId(continent)

                const totalProgress = cities.reduce((acc, city) => {
                  const slug = getSlugFromLink(city.link)
                  const progress = slug ? (cityProgress[slug] ?? 0) : 0
                  return acc + progress
                }, 0)
                const averageProgress = cities.length > 0 ? totalProgress / cities.length : 0
                const headerColor = getGradientColor(averageProgress)

                return (
                  <Fragment key={continent}>
                    {isCollapsible ? (
                      <CollapsibleSection
                        sectionId={sectionId}
                        title={
                          <span style={{ color: headerColor }}>
                            {translatedContinent} · {cityCountLabel}
                          </span>
                        }
                        titleAs="h3"
                        className="space-y-6"
                        headingClassName="text-xl font-semibold text-zinc-800 dark:text-zinc-100"
                        contentClassName="mt-4"
                      >
                        {cityGrid}
                      </CollapsibleSection>
                    ) : (
                      <section className="space-y-6">
                        <div>
                          <h3
                            className="mb-4 text-xl font-semibold"
                            style={{ color: headerColor }}
                          >
                            {translatedContinent}{' '}
                            <span className="text-base font-normal" style={{ color: headerColor }}>
                              · {cityCountLabel}
                            </span>
                          </h3>
                          {cityGrid}
                        </div>
                      </section>
                    )}
                    {index < visibleGroups.length - 1 && (
                      <footer>
                        <hr className="border-t border-zinc-200 dark:border-[#18181b]" />
                      </footer>
                    )}
                  </Fragment>
                )
              })}
            </div>
          ) : (
            <EmptyState />
          )}
          {hasResults && <SuggestCity />}
        </>
      ) : activeTab === 'globalStats' ? (
        <div className="space-y-6">
          <div className="space-y-3">
            <h3 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">Global Stats</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Aggregated from your saved progress across every city on this device (plus any
              synced progress, if logged in).
            </p>
          </div>
          {renderGlobalBar(
            t('globalOverallCompletion'),
            globalStats.percentFound,
            t('globalOverallDetail', {
              found: globalStats.totalStationsFound.toLocaleString(),
              total: globalStats.totalStations.toLocaleString(),
            }),
            true,
          )}

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-zinc-200 bg-white p-4 text-sm font-semibold text-zinc-800 shadow-sm dark:border-[#18181b] dark:bg-zinc-900 dark:text-zinc-100">
              <p className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                {t('globalCompletedCities')}
              </p>
              <p className="mt-1 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {globalStats.completedCities}
              </p>
            </div>
            <div className="rounded-2xl border border-zinc-200 bg-white p-4 text-sm font-semibold text-zinc-800 shadow-sm dark:border-[#18181b] dark:bg-zinc-900 dark:text-zinc-100">
              <p className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                {t('globalInProgress')}
              </p>
              <p className="mt-1 text-2xl font-bold text-amber-500">{globalStats.partialCities}</p>
            </div>
            <div className="rounded-2xl border border-zinc-200 bg-white p-4 text-sm font-semibold text-zinc-800 shadow-sm dark:border-[#18181b] dark:bg-zinc-900 dark:text-zinc-100">
              <p className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                {t('globalNotStarted')}
              </p>
              <p className="mt-1 text-2xl font-bold text-red-500">{globalStats.notStartedCities}</p>
            </div>
            <div className="rounded-2xl border border-zinc-200 bg-white p-4 text-sm font-semibold text-zinc-800 shadow-sm dark:border-[#18181b] dark:bg-zinc-900 dark:text-zinc-100">
              <p className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                {t('globalTotalCities')}
              </p>
              <p
                className="mt-1 text-2xl font-bold"
                style={{ color: getGradientColor(globalStats.percentFound) }}
              >
                {globalStats.cityBreakdown.length}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-[#18181b] dark:bg-zinc-900">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-lg font-semibold text-zinc-800 dark:text-zinc-100">By city</p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  {t('globalByCityHint')}
                </p>
              </div>
              <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                {t('cityStatsStationsProgress')}
              </span>
            </div>
            <div className="mb-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="relative w-full md:max-w-sm">
                <input
                  value={globalStatsSearch}
                  onChange={(event) => setGlobalStatsSearch(event.target.value)}
                  className="block w-full rounded-full border-0 px-4 py-3 pr-10 text-sm text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[var(--accent-600)] dark:bg-zinc-900 dark:text-zinc-100 dark:ring-zinc-700 dark:placeholder:text-zinc-500 dark:focus:ring-[var(--accent-400)]"
                  type="text"
                  placeholder={t('globalSearchCities')}
                />
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 dark:text-zinc-400">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5A6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5S14 7.01 14 9.5S11.99 14 9.5 14z"
                    />
                  </svg>
                </div>
              </div>
              <div className="w-full md:w-64">
                <label className="sr-only" htmlFor="global-stats-city-sort">
                  {t('globalSortCities')}
                </label>
                <select
                  id="global-stats-city-sort"
                  value={globalStatsSort}
                  onChange={(event) => setGlobalStatsSort(event.target.value as CitySortOption)}
                  className="w-full rounded-full border-0 bg-white px-4 py-3 text-sm font-medium text-gray-700 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-[var(--accent-600)] dark:bg-zinc-900 dark:text-zinc-100 dark:ring-zinc-700 dark:focus:ring-[var(--accent-400)]"
                >
                  {CITY_SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {t(option.label as any)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="divide-y divide-zinc-200 dark:divide-[#18181b]">
              {visibleCityBreakdown.map((entry) => {
                const percentLabel = `${(clamp01(entry.percent) * 100).toFixed(1)}%`
                const statusClass = getStatusClass(entry.percent)
                const barBg = getBarBackground(entry.percent)
                return (
                  <div key={entry.slug} className="px-1 py-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-start sm:gap-3">
                        <span className="flex items-center gap-3">
                          <AchievementIcon
                            slug={entry.slug}
                            cityName={entry.name}
                            className="h-16 w-16 sm:h-20 sm:w-20"
                            imageClassName="object-contain"
                            sizes="80px"
                          />
                          <span className={classNames('text-base font-semibold', statusClass)}>
                            {entry.name}
                          </span>
                        </span>
                        <span
                          className="text-sm font-semibold"
                          style={{ color: getGradientColor(entry.percent) }}
                        >
                          ({entry.found} / {entry.total} {t('stationsFound')})
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold" style={{ color: getGradientColor(entry.percent) }}>
                          {percentLabel}
                        </span>
                        <div className="h-2 w-32 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                          <div
                            className="h-full rounded-full"
                            style={{ width: percentLabel, background: barBg }}
                          />
                        </div>
                        <button
                          type="button"
                          className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-zinc-300 bg-white text-sm font-semibold text-zinc-700 transition hover:bg-[var(--accent-50)] hover:text-[var(--accent-600)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-ring)] dark:border-[#18181b] dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
                          onClick={(event) => {
                            event.preventDefault()
                            event.stopPropagation()
                            openStatsPanelForCity(entry.slug)
                          }}
                          aria-label={t('openCityStats')}
                        >
                          <span aria-hidden="true">...</span>
                        </button>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center justify-end gap-3 text-sm text-zinc-700 dark:text-zinc-200" />
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      ) : activeTab === 'achievements' ? (
        <Achievements
          items={visibleAchievements}
          unlockedSlugs={unlockedSlugs}
          searchValue={achievementSearch}
          onSearchChange={setAchievementSearch}
          sortOption={achievementSort}
          onSortChange={setAchievementSort}
          totalCount={achievementCatalog.length}
          totalUnlocked={unlockedSlugs.length}
        />
      ) : activeTab === 'updateLog' ? (
        <UpdateLogPanel state={updateLogState} onRetry={handleUpdateLogRetry} />
      ) : activeTab === 'credits' ? (
        <div className="flex justify-center">
          <CreditsContent showBackLink={false} />
        </div>
      ) : activeTab === 'account' ? (
        <div className="mx-auto w-full max-w-3xl">
          <AccountDashboard />
        </div>
      ) : activeTab === 'testimonials' ? (
        <div className="space-y-6">
          <h3 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
            What people say about Metro Memory
          </h3>
          {testimonialsContent ?? (
            <MissingTabContent message="No testimonials available right now." />
          )}
        </div>
      ) : activeTab === 'settings' ? (
        <SettingsPanel />
      ) : activeTab === 'press' ? (
        <div className="space-y-6">
          <h3 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
            They talked about us
          </h3>
          {pressContent ?? (
            <MissingTabContent message="No press mentions available right now." />
          )}
        </div>
      ) : activeTab === 'support' ? (
        <div className="space-y-6">
          <h3 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">{t('tabSupport')}</h3>
          <div className="w-full">
            <KoFiWidget open onClose={() => null} onNever={() => null} height={600} showFooter={false} />
          </div>
        </div>
      ) : activeTab === 'privacy' ? (
        <PrivacyPanel />
  ) : null}
    </div>
    {statsOpen && statsSlug && (
      <CityStatsPanel
        cityDisplayName={statsCityDisplayName || 'City stats'}
        slug={statsSlug}
        open={statsOpen}
        onClose={() => {
          setStatsOpen(false)
          setStatsSlug(null)
        }}
        onNavigatePrevious={
          statsNavigation && statsNavigation.slugs.length > 1 ? handlePrevStats : undefined
        }
        onNavigateNext={
          statsNavigation && statsNavigation.slugs.length > 1 ? handleNextStats : undefined
        }
      />
    )}
    </>
  )
}

const Achievements = ({
  items,
  unlockedSlugs,
  searchValue,
  onSearchChange,
  sortOption,
  onSortChange,
  totalCount,
  totalUnlocked,
}: {
  items: AchievementMeta[]
  unlockedSlugs: string[]
  searchValue: string
  onSearchChange: (value: string) => void
  sortOption: AchievementSortOption
  onSortChange: (value: AchievementSortOption) => void
  totalCount: number
  totalUnlocked: number
}) => {
  const { t } = useTranslation()
  const unlockedSet = useMemo(() => new Set(unlockedSlugs), [unlockedSlugs])
  const hasResults = items.length > 0

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:max-w-sm">
          <input
            value={searchValue}
            onChange={(event) => onSearchChange(event.target.value)}
            type="text"
            placeholder={t('searchAchievements')}
            className="block w-full rounded-full border-0 px-10 py-3 text-base text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[var(--accent-600)] dark:bg-zinc-900 dark:text-zinc-100 dark:ring-zinc-700 dark:placeholder:text-zinc-500 dark:focus:ring-[var(--accent-400)]"
          />
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 dark:text-zinc-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5A6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5S14 7.01 14 9.5S11.99 14 9.5 14z"
              />
            </svg>
          </div>
        </div>
        <div className="w-full md:w-64">
                <label className="sr-only" htmlFor="achievement-sort">
                  {t('sortAchievements')}
                </label>
          <select
            id="achievement-sort"
            value={sortOption}
            onChange={(event) => onSortChange(event.target.value as AchievementSortOption)}
            className="w-full rounded-full border-0 bg-white px-4 py-3 text-sm font-medium text-gray-700 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-[var(--accent-600)] dark:bg-zinc-900 dark:text-zinc-100 dark:ring-zinc-700 dark:focus:ring-[var(--accent-400)]"
          >
            {ACHIEVEMENT_SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {t(option.label)}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex flex-col gap-1 text-sm font-semibold md:flex-row md:items-center md:gap-6">
        <span className="text-emerald-600">
          {t('unlockedAchievements', { unlocked: totalUnlocked, total: totalCount })}
        </span>
        <span className="text-red-500">
          {t('lockedAchievements', { locked: Math.max(totalCount - totalUnlocked, 0) })}
        </span>
      </div>

      {!hasResults ? (
        <div className="rounded-2xl border border-dashed border-zinc-300 p-6 text-center text-sm text-zinc-500 dark:border-[#18181b] dark:text-zinc-400">
          {t('noAchievementsFound')}
        </div>
      ) : (
        items.map((meta) => {
          const isUnlocked = unlockedSet.has(meta.slug)
          return (
            <div
              key={meta.slug}
              className={classNames(
                'flex flex-col gap-4 rounded-2xl border p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between',
                isUnlocked
                  ? 'border-emerald-200 bg-white dark:border-emerald-600/60 dark:bg-zinc-900'
                  : 'border-zinc-200 bg-zinc-50 text-zinc-400 dark:border-[#18181b] dark:bg-zinc-900/40 dark:text-zinc-500',
              )}
            >
              <div className="flex flex-1 items-stretch gap-4">
                <AchievementIcon
                  slug={meta.slug}
                  cityName={meta.cityName}
                  className="h-full min-h-[4.5rem] w-20 p-1"
                  sizes="80px"
                  iconSrc={meta.iconSrc}
                />
                <div>
                  <h4
                    className={classNames(
                      'text-lg font-semibold',
                      isUnlocked ? 'text-zinc-800 dark:text-zinc-100' : '',
                    )}
                  >
                    {meta.title}
                  </h4>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">{meta.description}</p>
                  <p className="mt-1 text-xs uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
                    {meta.cityName} • {meta.continent}
                  </p>
                </div>
              </div>
              <span
                className={classNames(
                  'text-sm font-semibold',
                  isUnlocked ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500',
                )}
              >
                {isUnlocked ? t('achievementUnlocked') : t('achievementLocked')}
              </span>
            </div>
          )
        })
      )}
    </div>
  )
}

const UpdateLogPanel = ({
  state,
  onRetry,
}: {
  state: UpdateLogState
  onRetry: () => void
}) => {
  if (state.status === 'loading' || state.status === 'idle') {
    return (
      <div className="rounded-2xl border border-dashed border-zinc-300 p-6 text-center text-sm text-zinc-500 dark:border-[#18181b] dark:text-zinc-400">
        Fetching the latest updates…
      </div>
    )
  }

  if (state.status === 'error') {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
        <p className="mb-3">
          Unable to load the update log. {state.errorMessage ?? 'Please try again.'}
        </p>
        <button
          type="button"
          onClick={onRetry}
          className="rounded-full bg-red-600 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-red-500 dark:bg-red-500 dark:hover:bg-red-400"
        >
          Retry
        </button>
      </div>
    )
  }

  if (state.status === 'success' && state.entries.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-zinc-300 p-6 text-center text-sm text-zinc-500 dark:border-[#18181b] dark:text-zinc-400">
        No update log(s) found.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {state.lastUpdated && (
        <p className="text-xs uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
          Last refreshed {formatUpdateDate(state.lastUpdated)}
        </p>
      )}
      {state.entries.map((entry) => (
        <article
          key={entry.sha}
          className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-[#18181b] dark:bg-zinc-900"
        >
          <div className="space-y-1">
          <a
            href={entry.url}
            target="_blank"
            rel="noreferrer"
            className="text-base font-semibold text-[var(--accent-600)] underline decoration-[var(--accent-300)] underline-offset-4 transition hover:decoration-[var(--accent-400)] dark:text-[var(--accent-300)] dark:decoration-[var(--accent-400)] dark:hover:decoration-[var(--accent-300)]"
          >
            {entry.message}
          </a>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {entry.author} • {formatUpdateDate(entry.date)}
            </p>
            <p className="text-xs font-mono text-zinc-400 dark:text-zinc-500">{entry.sha.slice(0, 7)}</p>
          </div>
        </article>
      ))}
    </div>
  )
}

const EmptyState = () => (
  <div className="w-full rounded bg-[var(--accent-700)] px-12 py-6 text-white">
    <h3 className="mb-2 text-lg font-medium">No results!</h3>
    <p>
      Want to play in your city? Shoot me a message on 𝕏 <a href="https://x.com/_benjamintd">@_benjamintd</a>
    </p>
  </div>
)

const MissingTabContent = ({ message }: { message: string }) => (
  <div className="rounded-2xl border border-dashed border-zinc-300 p-6 text-center text-sm text-zinc-500 dark:border-[#18181b] dark:text-zinc-400">
    {message}
  </div>
)

const SuggestCity = () => (
  <p className="mt-6">
    Want the game in your city?{' '}
    <a
      className="font-medium text-[var(--accent-600)] underline decoration-[var(--accent-300)] underline-offset-4 transition hover:decoration-[var(--accent-400)] dark:text-[var(--accent-300)] dark:decoration-[var(--accent-400)] dark:hover:decoration-[var(--accent-300)]"
      href="https://github.com/norman-mei/metro-memory/pulls"
      target="_blank"
      rel="noreferrer"
    >
      Create a pull request on GitHub
    </a>
    .
  </p>
)

const sortAchievementEntries = (
  entries: AchievementMeta[],
  sort: AchievementSortOption,
  unlockedSet: Set<string>,
): AchievementMeta[] => {
  const compareName = (a: AchievementMeta, b: AchievementMeta) => a.cityName.localeCompare(b.cityName)
  const compareContinent = (a: AchievementMeta, b: AchievementMeta) => {
    const result = a.continent.localeCompare(b.continent)
    return result !== 0 ? result : compareName(a, b)
  }
  const base = [...entries]
  switch (sort) {
    case 'name-asc':
      return base.sort(compareName)
    case 'name-desc':
      return base.sort((a, b) => compareName(b, a))
    case 'continent-asc':
      return base.sort(compareContinent)
    case 'continent-desc':
      return base.sort((a, b) => compareContinent(b, a))
    case 'not-achieved-asc':
      return base.filter((entry) => !unlockedSet.has(entry.slug)).sort(compareName)
    case 'not-achieved-desc':
      return base.filter((entry) => !unlockedSet.has(entry.slug)).sort((a, b) => compareName(b, a))
    case 'achieved-asc':
      return base.filter((entry) => unlockedSet.has(entry.slug)).sort(compareName)
    case 'achieved-desc':
      return base.filter((entry) => unlockedSet.has(entry.slug)).sort((a, b) => compareName(b, a))
    case 'default':
    default:
      return base.sort((a, b) => a.order - b.order)
  }
}

const formatUpdateDate = (iso?: string) => {
  if (!iso) {
    return 'Unknown date'
  }
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) {
    return 'Unknown date'
  }
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

export default SearcheableCitiesList
type CityViewMode = 'comfortable' | 'compact' | 'cover' | 'list'

const CITY_VIEW_OPTIONS: Array<{ value: CityViewMode; label: string }> = [
  { value: 'comfortable', label: 'cityViewComfortable' },
  { value: 'compact', label: 'cityViewCompact' },
  { value: 'cover', label: 'cityViewCover' },
  { value: 'list', label: 'cityViewList' },
]
