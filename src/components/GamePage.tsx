'use client'

import AccountDashboard from '@/app/(website)/account/panel'
import AchievementToast from '@/components/AchievementToast'
import CityStatsPanel from '@/components/CityStatsPanel'
import FoundList from '@/components/FoundList'
import FoundSummary from '@/components/FoundSummary'
import Input from '@/components/Input'
import IntroModal from '@/components/IntroModal'
import KoFiWidget from '@/components/KoFiWidget'
import MenuComponent from '@/components/Menu'
import PrivacyPanel from '@/components/PrivacyPanel'
import SettingsPanel from '@/components/SettingsPanel'
import ThemeToggleButton from '@/components/ThemeToggleButton'
import { useAuth } from '@/context/AuthContext'
import { useSettings } from '@/context/SettingsContext'
import useHideLabels from '@/hooks/useHideLabels'
import useNormalizeString from '@/hooks/useNormalizeString'
import useTranslation from '@/hooks/useTranslation'
import { getAchievementForCity } from '@/lib/achievements'
import { useConfig } from '@/lib/configContext'
import {
  clearAutoRevealSuppressionForCity,
  shouldAutoRevealSolutions,
  suppressAutoRevealForCity,
} from '@/lib/solutionsAccess'
import { getStationKey } from '@/lib/stationUtils'
import {
  DataFeature,
  DataFeatureCollection,
  RoutesFeatureCollection,
} from '@/lib/types'
import { useLocalStorageValue } from '@react-hookz/web'
import { coordEach } from '@turf/meta'
import { bbox } from '@turf/turf'
import Fuse from 'fuse.js'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { useTheme } from 'next-themes'
import Link from 'next/link'
import {
  CSSProperties,
  ChangeEvent,
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import 'react-circular-progressbar/dist/styles.css'

const CONNECTOR_CONFIG = [
  { delimiter: ' - ', joiner: ' - ' },
  { delimiter: ' / ', joiner: ' / ' },
  { delimiter: ' & ', joiner: ' & ' },
]

const ACHIEVEMENT_COMPLETION_THRESHOLD = 0.9999

type AchievementToastState = {
  slug: string
  cityName: string
  title: string
  description: string
}

const achievementToastStorageKey = (slug: string) => `achievement-toast-hidden-${slug}`
const kofiWidgetStorageKey = (slug: string) => `kofi-widget-hidden-${slug}`

const deriveCityDisplayName = (title?: string, fallback?: string) => {
  if (!title) {
    return fallback ?? ''
  }
  const stripped = title.replace(/\s*\|\s*.*$/, '').replace(/Metro Memory/gi, '').trim()
  if (stripped.length > 0) {
    return stripped
  }
  return title
}

const extractMetadataTitle = (title: unknown): string | undefined => {
  if (!title) {
    return undefined
  }
  if (typeof title === 'string') {
    return title
  }
  if (typeof title === 'object') {
    const candidate = title as { absolute?: unknown; default?: unknown }
    if (typeof candidate.absolute === 'string') {
      return candidate.absolute
    }
    if (typeof candidate.default === 'string') {
      return candidate.default
    }
  }
  return undefined
}

const EMPTY_TIMESTAMPS: Record<string, string> = {}

const MANUAL_ALTERNATE_NAMES: Record<string, string[]> = {
  '42 St - Port Authority Bus Terminal': [
    'Port Authority Bus Terminal',
    'Port Authority Bus Terminal 42 St',
    '42 St Port Authority Bus Terminal',
    'PABT',
    '42 St PABT',
    'PABT 42 St',
  ],
  'New York Penn Station': [
    'New York Penn',
    'Penn Station',
    'Penn',
    'NYP',
    'NY Penn Station',
    'NY Penn',
  ],
  'Newark Airport': [
    'EWR',
    'Newark Liberty International Airport',
    'Newark Liberty Airport',
    'Newark Liberty Intl Airport',
  ],
  'South Station': ['Boston South Station'],
  'North Station': ['Boston North Station'],
  Airport: [
    'Boston Logan International Airport',
    'Logan Airport',
    'Boston Airport',
  ],
  'Newark Penn Station': ['Newark Penn'],
  'Grand Central - 42 St': ['Grand Central'],
  'Grand Central': ['Grand Central - 42 St'],
  'Bedford Park Blvd - Lehman College': [
    'Bedford Park Blvd',
    'Bedford Pk Blvd',
    'Bedford Pk Blvd - Lehman College',
  ],
  'Bedford Park Blvd': ['Bedford Pk Blvd'],
  'Briarwood': ['Briarwood - Van Wyck Blvd'],
  'Court Sq': [
    'Court Sq-23 St',
    'Court Sq - 23 St',
    'Court Square',
    'Court Square - 23 St',
    'Court Square - 23rd St',
  ],
  'Disneyland Resort (迪士尼)': ['Disneyland', 'Hong Kong Disneyland'],
  'Lexington Av/53 St': [
    'Lex Av/53 St',
    'Lexington Ave/53 St',
    'Lexington Avenue/53rd St',
  ],
  '5 Av/53 St': ['5 Ave/53 St', '5 Av - 53 St', '5 Avenue/53 Street'],
  'Queens Plaza': ['Queens Plz'],
  'Sutphin Blvd': ['Sutphin Boulevard'],
  'Parsons Blvd': ['Parsons Boulevard'],
  'Jamaica - 179 St': ['179 St', '179 Street', 'Jamaica 179 St'],
  'P4': ['P4 Station'],
  "E 143 St - St Mary's St": ["E 143 St - St Marys St"],
  'Jackson Hts - Roosevelt Av': [
    'Jackson Heights - Roosevelt Av',
    'Jackson Heights - Roosevelt Avenue',
  ],
  '74 St - Broadway': ['74 Street - Broadway'],
  '4 Av - 9 St': ['4 Av', '4 Ave', '4 Av 9 St', '4 Ave 9 St', '9 St'],
  'Sutphin Blvd - Archer Av - JFK Airport': ['Jamaica Station'],
  '110 St - Malcolm X Plaza': ['110 St Central Park North'],
  'Terminal A': [
    'EWR Terminal A',
    'Newark Terminal A',
    'Newark Airport Terminal A',
    'Newark Liberty Terminal A',
  ],
  'Terminal B': [
    'EWR Terminal B',
    'Newark Terminal B',
    'Newark Airport Terminal B',
    'Newark Liberty Terminal B',
  ],
  'Terminal C': [
    'EWR Terminal C',
    'Newark Terminal C',
    'Newark Airport Terminal C',
    'Newark Liberty Terminal C',
  ],
  'Terminal 1': ['JFK Terminal 1'],
  'Terminal 4': ['JFK Terminal 4'],
  'Terminal 5': ['JFK Terminal 5'],
  'Terminal 7': ['JFK Terminal 7'],
  'Terminal 8': ['JFK Terminal 8'],
  'Glen Rock-Boro Hall': ['Boro Hall - Glen Rock'],
}

type ManualComplexSelector = {
  name: string
  line?: string
  linePrefix?: string
}

const MANUAL_COMPLEX_GROUPS: ManualComplexSelector[][] = [
  [
    { name: 'Metropolitan Av', line: 'IBX' },
    { name: 'Middle Village - Metropolitan Av', line: 'NewYorkSubwayM' },
  ],
  [
    { name: 'Metropolitan Av', line: 'NewYorkSubwayG' },
    { name: 'Lorimer St', line: 'NewYorkSubwayL' },
  ],
  [
    { name: 'Hunterspoint Av', line: 'LIRRPortJefferson' },
    { name: 'Hunterspoint Av', line: 'LIRROysterBay' },
    { name: 'Hunterspoint Av', line: 'LIRRMontauk' },
    { name: 'Hunters Point Av', line: 'NewYorkSubway7' },
    { name: 'Hunters Point Av', line: 'NewYorkSubway7X' },
  ],
  [
    { name: 'Marble Hill', line: 'MNRRHudson' },
    { name: 'Marble Hill - 225 St', line: 'NewYorkSubway1' },
  ],
  [
    { name: 'Harlem-125 St', line: 'MNRRHarlem' },
    { name: '125 St', line: 'NewYorkSubway4' },
    { name: '125 St', line: 'NewYorkSubway5' },
    { name: '125 St', line: 'NewYorkSubway6' },
    { name: '125 St', line: 'NewYorkSubway6X' },
    { name: '125 St', line: 'NewYorkSubwayQ' },
    { name: '125 St', line: 'NewYorkSubwayT' },
  ],
  [
    { name: 'Times Sq - 42 St' },
    { name: '42 St - Port Authority Bus Terminal' },
    { name: '42 St - Bryant Pk' },
    { name: '5 Av', line: 'NewYorkSubway7' },
    { name: '5 Av', line: 'NewYorkSubway7X' },
  ],
  [
    { name: '34 St - Penn Station' },
    { name: 'New York Penn Station' },
  ],
  [
    { name: 'Sutphin Blvd - Archer Av - JFK Airport' },
    { name: 'Jamaica', linePrefix: 'LIRR' },
    { name: 'Jamaica', linePrefix: 'AirTrainJFK' },
  ],
  [
    { name: 'Franklin Av - Medgar Evers College' },
    { name: 'Botanic Garden', line: 'NewYorkSubwayFS' },
  ],
  [
    { name: 'Court St', line: 'NewYorkSubwayR' },
    { name: 'Borough Hall' },
  ],
  [
    { name: 'Whitehall St' },
    { name: 'South Ferry' },
  ],
  [
    { name: 'Broadway-Lafayette St' },
    { name: 'Bleecker St', line: 'NewYorkSubway6' },
    { name: 'Bleecker St', line: 'NewYorkSubway6X' },
  ],
  [
    { name: 'Lexington Av/53 St' },
    { name: '51 St', line: 'NewYorkSubway6' },
  ],
  [
    { name: '59 St', line: 'NewYorkSubway4' },
    { name: '59 St', line: 'NewYorkSubway5' },
    { name: '59 St', line: 'NewYorkSubway6' },
    { name: 'Lexington Av/59 St' },
  ],
  [
    { name: '33 St', line: 'NewYorkSubway6' },
    { name: '34 St - Herald Sq' },
  ],
  [
    { name: 'Chambers St', line: 'NewYorkSubway1' },
    { name: 'Chambers St', line: 'NewYorkSubway2' },
    { name: 'Chambers St', line: 'NewYorkSubway3' },
    { name: 'Chambers St', line: 'NewYorkSubwayA' },
    { name: 'Chambers St', line: 'NewYorkSubwayC' },
    { name: 'Park Pl', line: 'NewYorkSubway2' },
    { name: 'Park Pl', line: 'NewYorkSubway3' },
    { name: 'World Trade Center', line: 'NewYorkSubwayE' },
    { name: 'World Trade Center', line: 'NewYorkSubwayPATHHobwtc' },
    { name: 'World Trade Center', line: 'NewYorkSubwayPATHNwkwtc' },
    { name: 'Cortlandt St', line: 'NewYorkSubwayN' },
    { name: 'Cortlandt St', line: 'NewYorkSubwayR' },
    { name: 'Cortlandt St', line: 'NewYorkSubwayW' },
    { name: 'WTC Cortlandt', line: 'NewYorkSubway1' },
  ],
  [
    { name: 'Concourse T', line: 'atlantaTPT' },
    { name: 'Airport', line: 'MARTARD' },
  ],
  [
    { name: 'Denver Airport', line: 'Denver_RTD_A' },
    { name: 'Main Terminal', line: 'DenverAGTS' },
  ],
  [
    { name: 'Airport (機場)', line: 'AEL' },
    { name: 'Terminal 2 Interchange (二號客運大樓站)', line: 'HKAPMT1' },
    { name: 'Terminal 2 Interchange (二號客運大樓站)', line: 'HKAPMT2' },
    { name: 'Terminal 2 Interchange (二號客運大樓站)', line: 'HKAPMSKY' },
  ],
  [
    { name: 'Hong Kong West Kowloon (香港西九龍)', line: 'XRL' },
    { name: 'Kowloon (九龍)', line: 'TCL' },
    { name: 'Kowloon (九龍)', line: 'AEL' },
    { name: 'Austin (柯士甸)', line: 'TML' },
  ],
  [
    { name: 'Tsim Sha Tsui (尖沙咀)', line: 'TWL' },
    { name: 'East Tsim Sha Tsui (尖東)', line: 'TML' },
  ],
  [
    { name: 'Tuen Mun South (屯門南)', line: 'TML' },
    { name: 'Tuen Mun Ferry Pier (屯門碼頭)', line: 'MTR507' },
    { name: 'Tuen Mun Ferry Pier (屯門碼頭)', line: 'MTR610' },
    { name: 'Tuen Mun Ferry Pier (屯門碼頭)', line: 'MTR614' },
    { name: 'Tuen Mun Ferry Pier (屯門碼頭)', line: 'MTR614P' },
    { name: 'Tuen Mun Ferry Pier (屯門碼頭)', line: 'MTR615' },
    { name: 'Tuen Mun Ferry Pier (屯門碼頭)', line: 'MTR615P' },
    { name: 'Siu Hei (兆禧)', line: 'MTR507' },
    { name: 'Siu Hei (兆禧)', line: 'MTR614' },
    { name: 'Siu Hei (兆禧)', line: 'MTR614P' },
  ],
  [
    { name: 'Ho Tin (河田)', line: 'MTR507' },
    { name: 'Tuen Mun (屯門)', line: 'TML' },
    { name: 'Tuen Mun (屯門)', line: 'MTR505' },
    { name: 'Tuen Mun (屯門)', line: 'MTR507' },
    { name: 'Tuen Mun (屯門)', line: 'MTR751' },
  ],
  [
    { name: 'Hub Building', line: 'HubTram' },
    { name: 'Terminal 2-Humphrey', line: 'MAXBlue' },
  ],
  [
    { name: 'Terminal 1', line: 'HubTram' },
    { name: 'Terminal 1-Lindbergh', line: 'MAXBlue' },
  ],
]

const DIRECTIONAL_ABBREVIATIONS: Record<string, string> = {
  east: 'E',
  west: 'W',
  north: 'N',
  south: 'S',
}

const CARDINAL_DIRECTIONS = Object.keys(DIRECTIONAL_ABBREVIATIONS)
const CARDINAL_DIRECTIONS_PATTERN = CARDINAL_DIRECTIONS.join('|')
const DIRECTION_SUFFIX_REGEX = new RegExp(
  `^(.*\\S)\\s+(${CARDINAL_DIRECTIONS_PATTERN})$`,
  'i',
)
const DIRECTION_PREFIX_REGEX = new RegExp(
  `^(${CARDINAL_DIRECTIONS_PATTERN})\\s+(.*\\S)$`,
  'i',
)

const STREET_SEGMENT_KEYWORDS = [
  ' st',
  ' street',
  ' av',
  ' ave',
  ' avenue',
  ' blvd',
  ' boulevard',
  ' rd',
  ' road',
  ' dr',
  ' drive',
  ' pkwy',
  ' parkway',
  ' way',
  ' wy',
  ' lane',
  ' ln',
  ' court',
  ' ct',
  ' place',
  ' pl',
  ' plaza',
  ' plz',
  ' terrace',
  ' ter',
  ' circle',
  ' cir',
  ' ferry',
  ' highway',
  ' hwy',
  ' expressway',
  ' expwy',
  ' center',
  ' centre',
  ' ctr',
  ' mall',
  ' bridge',
  ' broadway',
]

const shouldIncludeStandaloneSegment = (value: string) => {
  const normalized = value.trim().toLowerCase()
  if (!normalized) {
    return false
  }
  if (/\d/.test(normalized)) {
    return true
  }
  return STREET_SEGMENT_KEYWORDS.some((keyword) =>
    normalized.includes(keyword),
  )
}

const applyDirectionalAbbreviation = (value?: string) => {
  const input = (value ?? '').trim()
  if (!input || !/\s/.test(input)) {
    return input
  }

  return input.replace(/\b(East|West|North|South)\b/gi, (match) => {
    const key = match.toLowerCase()
    return DIRECTIONAL_ABBREVIATIONS[key] ?? match
  })
}

const generateAlternateNames = (name?: string): string[] => {
  if (!name) return []
  const trimmed = name.trim()
  if (!trimmed) return []

  const directionalName = applyDirectionalAbbreviation(trimmed)
  const canonical = directionalName

  const alternates = new Set<string>()
  const englishPortion = trimmed.replace(/\s*\(.*?\)\s*$/, '').trim()

  const formatDirection = (direction: string) =>
    direction.charAt(0).toUpperCase() + direction.slice(1).toLowerCase()

  if (englishPortion) {
    const suffixMatch = englishPortion.match(DIRECTION_SUFFIX_REGEX)
    if (suffixMatch) {
      const baseSegment = suffixMatch[1]?.replace(/\s+/g, ' ').trim()
      const directionSegment = suffixMatch[2]
      if (baseSegment && directionSegment) {
        alternates.add(`${formatDirection(directionSegment)} ${baseSegment}`)
      }
    }

    const prefixMatch = englishPortion.match(DIRECTION_PREFIX_REGEX)
    if (prefixMatch) {
      const directionSegment = prefixMatch[1]
      const baseSegment = prefixMatch[2]?.replace(/\s+/g, ' ').trim()
      if (baseSegment && directionSegment) {
        alternates.add(`${baseSegment} ${formatDirection(directionSegment)}`)
      }
    }
  }

  if (directionalName !== trimmed) {
    alternates.add(directionalName)
  }

  if (canonical !== trimmed && canonical !== directionalName) {
    alternates.add(canonical)
  }

  for (const { delimiter, joiner } of CONNECTOR_CONFIG) {
    if (canonical.includes(delimiter)) {
      const parts = canonical
        .split(delimiter)
        .map((part) => part.trim())
        .filter(Boolean)

      if (parts.length >= 2) {
        const reversed = [...parts].reverse()

        alternates.add(reversed.join(joiner))
        alternates.add(parts.join(' '))
        alternates.add(reversed.join(' '))

        parts.forEach((part) => {
          if (shouldIncludeStandaloneSegment(part)) {
            alternates.add(part)
          }
        })
      }
    }
  }

  if (/port authority bus terminal/i.test(canonical)) {
    alternates.add(canonical.replace(/port authority bus terminal/gi, 'PABT'))
    alternates.add('PABT')
  }

  const beachMatch = canonical.match(/^Beach\s+(\d+)\s*St\b(.*)$/i)
  if (beachMatch) {
    const suffix = beachMatch[2] ?? ''
    const suffixTrimmed = suffix.trim()
    const number = beachMatch[1]
    alternates.add(`B ${number} St`)
    alternates.add(`B ${number}th St`)
    if (suffixTrimmed) {
      const withDash = suffix.startsWith(' ') ? suffix : ` ${suffix}`
      alternates.add(`B ${number} St${withDash}`)
      alternates.add(`B ${number}th St${withDash}`)
    }
  }

  const replacementPatterns: Array<{ regex: RegExp; replacement: string }> = [
    { regex: /\bPark\b/g, replacement: 'Pk' },
    { regex: /\bPlaza\b/g, replacement: 'Plz' },
    { regex: /\bPoint\b/g, replacement: 'Pt' },
    { regex: /\bRoute\b/g, replacement: 'Rte' },
  ]

  for (const { regex, replacement } of replacementPatterns) {
    const replacedOriginal = trimmed.replace(regex, replacement)
    if (replacedOriginal !== trimmed) {
      alternates.add(replacedOriginal)
    }

    const replacedDirectional = directionalName.replace(regex, replacement)
    if (
      directionalName !== trimmed &&
      replacedDirectional !== directionalName
    ) {
      alternates.add(replacedDirectional)
    }

    const replacedCanonical = canonical.replace(regex, replacement)
    if (replacedCanonical !== canonical) {
      alternates.add(replacedCanonical)
    }
  }

  if (/broadway/i.test(canonical)) {
    const lower = canonical.toLowerCase()
    alternates.add(canonical.replace(/Broadway/gi, 'Bway'))
    alternates.add(canonical.replace(/Broadway/gi, "B'way"))
    alternates.add(lower.replace(/broadway/g, 'bway'))
    alternates.add(lower.replace(/broadway/g, "b'way"))
  }

  MANUAL_ALTERNATE_NAMES[trimmed]?.forEach((alias) => {
    if (alias) {
      alternates.add(alias)
    }
  })

  if (directionalName !== trimmed) {
    MANUAL_ALTERNATE_NAMES[directionalName]?.forEach((alias) => {
      if (alias) {
        alternates.add(alias)
      }
    })
  }

  if (canonical !== trimmed && canonical !== directionalName) {
    MANUAL_ALTERNATE_NAMES[canonical]?.forEach((alias) => {
      if (alias) {
        alternates.add(alias)
      }
    })
  }

  return Array.from(alternates)
}

export default function GamePage({
  fc,
  routes,
}: {
  fc: DataFeatureCollection
  routes?: RoutesFeatureCollection
}) {
  const { CITY_NAME, MAP_CONFIG, LINES, MAP_FROM_DATA, METADATA } = useConfig()
  const { t } = useTranslation()
  const { resolvedTheme } = useTheme()
  const { settings } = useSettings()
  const mapContainerRef = useRef<HTMLDivElement | null>(null)

  const normalizeString = useNormalizeString()
  const { featureCollection, clusterGroups } = useMemo(() => {
    const featuresWithAlternates = fc.features.map((feature) => {
      const originalName =
        typeof feature.properties.name === 'string'
          ? feature.properties.name
          : ''

      const propertiesWithAlternates = feature.properties as typeof feature.properties & {
        alternate_names?: string[]
      }

      const existingAlternates = Array.isArray(
        propertiesWithAlternates.alternate_names,
      )
        ? propertiesWithAlternates.alternate_names.filter(
            (alt): alt is string =>
              typeof alt === 'string' && alt.trim().length > 0,
          )
        : []

      const generatedAlternates = generateAlternateNames(originalName)

      const mergedAlternates = Array.from(
        new Set([
          ...existingAlternates,
          ...generatedAlternates.filter(
            (alt) => typeof alt === 'string' && alt.trim().length > 0,
          ),
        ]),
      )

      const nextProperties: typeof feature.properties & {
        alternate_names?: string[]
      } = {
        ...feature.properties,
      }

      if (mergedAlternates.length > 0) {
        nextProperties.alternate_names = mergedAlternates
      } else if ('alternate_names' in nextProperties) {
        delete nextProperties.alternate_names
      }

      return {
        ...feature,
        properties: nextProperties,
      } as DataFeature
    })

    type PointFeatureEntry = {
      feature: DataFeature
      id: number
      lng: number
      lat: number
      name: string
    }

    const pointFeatures: PointFeatureEntry[] = featuresWithAlternates
      .map((feature) => {
        if (
          feature.geometry?.type !== 'Point' ||
          !Array.isArray(feature.geometry.coordinates) ||
          typeof feature.id !== 'number'
        ) {
          return null
        }

        const [lng, lat] = feature.geometry.coordinates as number[]
        return {
          feature,
          id: feature.id as number,
          lng,
          lat,
          name: (feature.properties.name ?? '').trim(),
        }
      })
      .filter((entry): entry is PointFeatureEntry => entry !== null)

    const parent = new Map<number, number>()

    const find = (id: number): number => {
      const current = parent.get(id)
      if (current === undefined) {
        parent.set(id, id)
        return id
      }
      if (current === id) {
        return id
      }
      const root = find(current)
      parent.set(id, root)
      return root
    }

    const union = (a: number, b: number) => {
      const rootA = find(a)
      const rootB = find(b)
      if (rootA === rootB) {
        return
      }
      if (rootA < rootB) {
        parent.set(rootB, rootA)
      } else {
        parent.set(rootA, rootB)
      }
    }

    const COMPLEX_THRESHOLD = 0.00075

    for (let i = 0; i < pointFeatures.length; i++) {
      const current = pointFeatures[i]
      for (let j = i + 1; j < pointFeatures.length; j++) {
        const other = pointFeatures[j]
        const distance = Math.hypot(current.lng - other.lng, current.lat - other.lat)
        const sameName =
          current.name.length > 0 &&
          other.name.length > 0 &&
          current.name.toLowerCase() === other.name.toLowerCase()

        if (sameName || distance <= COMPLEX_THRESHOLD) {
          union(current.id, other.id)
        }
      }
    }

    const pointFeaturesByName = new Map<string, PointFeatureEntry[]>()
    pointFeatures.forEach((entry) => {
      const key = entry.name.trim().toLowerCase()
      if (!key) {
        return
      }
      if (!pointFeaturesByName.has(key)) {
        pointFeaturesByName.set(key, [])
      }
      pointFeaturesByName.get(key)!.push(entry)
    })

    const collectMatches = (selector: ManualComplexSelector) => {
      const key = selector.name.trim().toLowerCase()
      const candidates = pointFeaturesByName.get(key) ?? []
      return candidates.filter((entry) => {
        const line = entry.feature.properties?.line
        if (selector.line && line !== selector.line) {
          return false
        }
        if (selector.linePrefix && !(line && line.startsWith(selector.linePrefix))) {
          return false
        }
        return true
      })
    }

    MANUAL_COMPLEX_GROUPS.forEach((group) => {
      const memberIds = new Set<number>()
      group.forEach((selector) => {
        collectMatches(selector).forEach((entry) => memberIds.add(entry.id))
      })
      const ids = Array.from(memberIds)
      if (ids.length <= 1) {
        return
      }
      const [first, ...rest] = ids
      rest.forEach((id) => union(first, id))
    })

    const clusters = new Map<number, PointFeatureEntry[]>()
    pointFeatures.forEach((entry) => {
      const root = find(entry.id)
      if (!clusters.has(root)) {
        clusters.set(root, [])
      }
      clusters.get(root)!.push(entry)
    })

    const clusterKeyById = new Map<number, number>()
    const additionalAlternateNames = new Map<number, Set<string>>()
    const clusterGroups = new Map<number, number[]>()

    clusters.forEach((members, root) => {
      if (members.length <= 1) {
        return
      }

      const clusterIds = members
        .map((member) => member.id)
        .filter((id): id is number => typeof id === 'number')
      if (clusterIds.length > 1) {
        clusterGroups.set(root, clusterIds)
      }

      const uniqueNames = Array.from(
        new Set(
          members
            .map((member) => member.name)
            .filter((name): name is string => name.length > 0),
        ),
      )

      const globalAlias =
        uniqueNames.length > 1 ? uniqueNames.join(' - ') : undefined

      members.forEach((member) => {
        const memberId = member.id
        clusterKeyById.set(memberId, root)

        if (uniqueNames.length <= 1) {
          return
        }

        const additionalAlternates =
          additionalAlternateNames.get(memberId) ?? new Set<string>()

        const memberName = member.name
        const sortedOthers = uniqueNames
          .filter((name) => name !== memberName)
          .sort((a, b) => a.localeCompare(b))

        if (globalAlias && globalAlias !== memberName) {
          additionalAlternates.add(globalAlias)
        }

        if (memberName && sortedOthers.length > 0) {
          additionalAlternates.add([memberName, ...sortedOthers].join(' - '))
        }

        additionalAlternateNames.set(memberId, additionalAlternates)
      })
    })

    const finalFeatures = featuresWithAlternates.map((feature) => {
      const id = feature.id
      if (typeof id !== 'number') {
        return feature
      }

      const propertiesWithExtras = feature.properties as typeof feature.properties & {
        alternate_names?: string[]
        cluster_key?: number | string
      }

      const baseAlternates = Array.isArray(propertiesWithExtras.alternate_names)
        ? propertiesWithExtras.alternate_names.filter(
            (alt): alt is string =>
              typeof alt === 'string' && alt.trim().length > 0,
          )
        : []

      const extraAlternates = additionalAlternateNames.get(id)
      const mergedAlternates = Array.from(
        new Set([
          ...baseAlternates,
          ...(extraAlternates ? Array.from(extraAlternates) : []),
        ]),
      )

      const nextProperties: typeof propertiesWithExtras = {
        ...feature.properties,
      }

      if (mergedAlternates.length > 0) {
        nextProperties.alternate_names = mergedAlternates
      } else if ('alternate_names' in nextProperties) {
        delete nextProperties.alternate_names
      }

      const clusterKey = clusterKeyById.get(id)
      if (clusterKey !== undefined && clusterKey !== null) {
        nextProperties.cluster_key = clusterKey
      } else if ('cluster_key' in nextProperties) {
        delete nextProperties.cluster_key
      }

      return {
        ...feature,
        properties: nextProperties,
      } as DataFeature
    })

    return {
      featureCollection: {
        ...fc,
        features: finalFeatures,
      },
      clusterGroups,
    }
  }, [fc])

  const allStationIds = useMemo(() => {
    const ids = featureCollection.features
      .map((feature) => feature.id)
      .filter((id): id is number => typeof id === 'number')
    return Array.from(new Set(ids))
  }, [featureCollection.features])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const total = allStationIds.length
    const storageKey = `${CITY_NAME}-station-total`

    try {
      if (total <= 0) {
        window.localStorage.removeItem(storageKey)
        return
      }

      const stored = Number(window.localStorage.getItem(storageKey))
      if (!Number.isFinite(stored) || stored !== total) {
        window.localStorage.setItem(storageKey, String(total))
      }
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn(`Unable to persist station total for ${CITY_NAME}`, error)
      }
    }
  }, [CITY_NAME, allStationIds])

  const [map, setMap] = useState<mapboxgl.Map | null>(null)
  const [hoveredId, setHoveredId] = useState<number | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const { hideLabels, setHideLabels } = useHideLabels(map)
  const { user, updateProgressSummary } = useAuth()
  const [solutionsPromptOpen, setSolutionsPromptOpen] = useState(false)
  const [solutionsPassword, setSolutionsPassword] = useState('')
  const [solutionsError, setSolutionsError] = useState(false)
  const [solutionsUnlocked, setSolutionsUnlocked] = useState(false)
  const { value: storedSidebarOpen, set: setStoredSidebarOpen } =
    useLocalStorageValue<boolean>(`${CITY_NAME}-sidebar-open`, {
      defaultValue: true,
      initializeWithValue: false,
    })
  const [sidebarOpenState, setSidebarOpenState] = useState(true)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [activeFoundId, setActiveFoundId] = useState<number | null>(null)
  const [achievementToast, setAchievementToast] = useState<AchievementToastState | null>(null)
  const [settingsModalOpen, setSettingsModalOpen] = useState(false)
  const [cityStatsOpen, setCityStatsOpen] = useState(false)
  const [accountModalOpen, setAccountModalOpen] = useState(false)
  const [privacyModalOpen, setPrivacyModalOpen] = useState(false)
  const [kofiOpen, setKofiOpen] = useState(false)
  const [mapError, setMapError] = useState<string | null>(null)
  const completionConfettiStorageKey = useMemo(
    () => `${CITY_NAME}-completion-confetti-shown`,
    [CITY_NAME],
  )
  const [cityCompletionConfettiSeen, setCityCompletionConfettiSeen] = useState(false)
  const [supportModalOpen, setSupportModalOpen] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }
    try {
      setCityCompletionConfettiSeen(
        window.localStorage.getItem(completionConfettiStorageKey) === '1',
      )
    } catch {
      setCityCompletionConfettiSeen(false)
    }
  }, [completionConfettiStorageKey])

  const markCityCompletionConfettiSeen = useCallback(() => {
    setCityCompletionConfettiSeen(true)
    if (typeof window === 'undefined') {
      return
    }
    try {
      window.localStorage.setItem(completionConfettiStorageKey, '1')
    } catch {
      // ignore storage errors
    }
  }, [completionConfettiStorageKey])

  useEffect(() => {
    if (typeof storedSidebarOpen === 'boolean') {
      setSidebarOpenState(storedSidebarOpen)
    }
  }, [storedSidebarOpen])

  const setSidebarOpen = useCallback(
    (next: boolean | ((prev: boolean) => boolean)) => {
      setSidebarOpenState((prev) => {
        const resolved =
          typeof next === 'function' ? (next as (prev: boolean) => boolean)(prev) : next
        setStoredSidebarOpen(resolved)
        return resolved
      })
    },
    [setStoredSidebarOpen],
  )

  const sidebarOpen = sidebarOpenState

  const handleAchievementToastClose = useCallback(() => {
    setAchievementToast(null)
  }, [])

  const handleAchievementToastNever = useCallback((slug: string) => {
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(achievementToastStorageKey(slug), '1')
      } catch {
        // ignore storage errors
      }
    }
    setAchievementToast(null)
  }, [])

  const openSettingsModal = useCallback(() => setSettingsModalOpen(true), [])
  const closeSettingsModal = useCallback(() => setSettingsModalOpen(false), [])
  const openAccountModal = useCallback(() => setAccountModalOpen(true), [])
  const closeAccountModal = useCallback(() => setAccountModalOpen(false), [])
  const openPrivacyModal = useCallback(() => setPrivacyModalOpen(true), [])
  const closePrivacyModal = useCallback(() => setPrivacyModalOpen(false), [])

  const idMap = useMemo(() => {
    const map = new Map<number, DataFeature>()
    featureCollection.features.forEach((feature) => {
      map.set(feature.id! as number, feature)
    })
    return map
  }, [featureCollection.features])

  const stationsPerLine = useMemo(() => {
    const lineMap = new Map<string, Set<string>>()
    for (let feature of featureCollection.features) {
      const line = feature.properties.line
      if (!line) {
        continue
      }
      const key = getStationKey(feature)
      if (!lineMap.has(line)) {
        lineMap.set(line, new Set<string>())
      }
      lineMap.get(line)!.add(key)
    }

    const result: Record<string, number> = {}
    lineMap.forEach((keys, line) => {
      result[line] = keys.size
    })
    return result
  }, [featureCollection.features])

  const { value: localFound, set: setFound } = useLocalStorageValue<
    number[] | null
  >(`${CITY_NAME}-stations`, {
    defaultValue: null,
    initializeWithValue: false,
  })

  const {
    value: storedFoundTimestampsRaw,
    set: setStoredFoundTimestamps,
  } = useLocalStorageValue<Record<string, string> | null>(
    `${CITY_NAME}-stations-found-at`,
    {
      defaultValue: null,
      initializeWithValue: false,
    },
  )

  const storedFoundTimestamps: Record<string, string> | null =
    storedFoundTimestampsRaw ?? null

  const foundTimestamps = storedFoundTimestamps ?? EMPTY_TIMESTAMPS

  const setFoundTimestamps = useCallback(
    (updater: (prev: Record<string, string>) => Record<string, string>) => {
      setStoredFoundTimestamps((prev) => updater(prev ?? {}))
    },
    [setStoredFoundTimestamps],
  )

  const { value: isNewPlayer, set: setIsNewPlayer } =
    useLocalStorageValue<boolean>(`${CITY_NAME}-stations-is-new-player`, {
      defaultValue: true,
      initializeWithValue: false,
    })

  const found: number[] = useMemo(() => {
    return (localFound || []).filter((f) => idMap.has(f))
  }, [localFound, idMap])

  const localFoundRef = useRef<number[] | null>(null)
  const localTimestampsRef = useRef<Record<string, string> | null>(null)

  useEffect(() => {
    localFoundRef.current = Array.isArray(localFound) ? [...localFound] : null
  }, [localFound])

  useEffect(() => {
    localTimestampsRef.current = storedFoundTimestamps
  }, [storedFoundTimestamps])

  useEffect(() => {
    if (!Array.isArray(localFound)) {
      return
    }
    const filtered = localFound.filter((id) => idMap.has(id))
    const unique = Array.from(new Set(filtered))
    if (unique.length !== localFound.length || filtered.length !== localFound.length) {
      setFound(unique)
    }
  }, [localFound, idMap, setFound])

  const syncTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const submitProgress = useCallback(
    async (
      ids: number[],
      timestamps: Record<string, string>,
      immediate = false,
    ) => {
      if (!user) {
        return
      }

      const payload = {
        foundIds: ids,
        foundTimestamps: timestamps,
      }

      const send = async () => {
        try {
          const response = await fetch(`/api/progress/${CITY_NAME}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          })
          if (response.ok) {
            updateProgressSummary(CITY_NAME, ids.length)
          }
        } catch (error) {
          if (process.env.NODE_ENV !== 'production') {
            console.warn('Unable to sync progress', error)
          }
        }
      }

      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current)
        syncTimeoutRef.current = null
      }

      if (immediate) {
        await send()
        return
      }

      syncTimeoutRef.current = setTimeout(() => {
        void send()
      }, 1200)
    },
    [CITY_NAME, updateProgressSummary, user],
  )

  useEffect(() => {
    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (!user) {
      return
    }

    let cancelled = false
    ;(async () => {
      try {
        const response = await fetch(`/api/progress/${CITY_NAME}`, {
          cache: 'no-store',
        })
        if (!response.ok) {
          return
        }
        const data = await response.json()
        if (cancelled) {
          return
        }
        if (data?.progress) {
          const remoteFound = Array.isArray(data.progress.foundIds)
            ? data.progress.foundIds.filter(
                (id: unknown): id is number =>
                  typeof id === 'number' && idMap.has(id),
              )
            : []
          if (remoteFound.length > 0) {
            setFound(remoteFound)
            if (
              data.progress.foundTimestamps &&
              typeof data.progress.foundTimestamps === 'object'
            ) {
              setFoundTimestamps(
                () =>
                  data.progress
                    .foundTimestamps as Record<string, string>,
              )
            }
            updateProgressSummary(CITY_NAME, remoteFound.length)
            return
          }
        }
        const fallbackIds =
          localFoundRef.current?.filter((id) => idMap.has(id)) ?? []
        if (fallbackIds.length > 0) {
          await submitProgress(
            fallbackIds,
            localTimestampsRef.current ?? {},
            true,
          )
        }
      } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
          console.warn('Unable to load synced progress', error)
        }
      }
    })()

    return () => {
      cancelled = true
    }
  }, [
    CITY_NAME,
    idMap,
    setFound,
    setFoundTimestamps,
    submitProgress,
    updateProgressSummary,
    user,
  ])

  useEffect(() => {
    if (!user) {
      return
    }
    void submitProgress(found, foundTimestamps)
  }, [found, foundTimestamps, submitProgress, user])

  useEffect(() => {
    if (found.length === 0) {
      return
    }

    const now = new Date().toISOString()
    setFoundTimestamps((prev) => {
      const next = { ...prev }
      let changed = false

      for (const id of found) {
        const key = String(id)
        if (!next[key]) {
          next[key] = now
          changed = true
        }
      }

      return changed ? next : prev
    })
  }, [found, setFoundTimestamps])

  const clearStoredProgress = useCallback(() => {
    if (typeof window === 'undefined') {
      return
    }
    try {
      window.localStorage.removeItem(`${CITY_NAME}-stations`)
      window.localStorage.removeItem(`${CITY_NAME}-stations-found-at`)
    } catch {
      // ignore storage errors
    }
  }, [CITY_NAME])

  const onReset = useCallback(() => {
    if (confirm(t('restartWarning'))) {
      suppressAutoRevealForCity(CITY_NAME)
      if (map && map.getSource('features')) {
        map.removeFeatureState({ source: 'features' })
      }
      setFound([])
      setIsNewPlayer(true)
      setFoundTimestamps(() => ({}))
      setSolutionsUnlocked(false)
      setSolutionsPromptOpen(false)
      setSolutionsPassword('')
      setSolutionsError(false)
      setMobileSidebarOpen(false)
      setHoveredId(null)
      setActiveFoundId(null)
      clearStoredProgress()
      void submitProgress([], {}, true)
      setTimeout(() => {
        inputRef.current?.focus()
      }, 0)
    }
  }, [
    t,
    map,
    setFound,
    setIsNewPlayer,
    setFoundTimestamps,
    setSolutionsUnlocked,
    setSolutionsPromptOpen,
    setSolutionsPassword,
    setSolutionsError,
    setMobileSidebarOpen,
    setHoveredId,
    setActiveFoundId,
    clearStoredProgress,
    submitProgress,
    inputRef,
    CITY_NAME,
    suppressAutoRevealForCity,
  ])

  const foundStationsPerLine = useMemo(() => {
    const lineMap = new Map<string, Set<string>>()
    for (let id of found || []) {
      const feature = idMap.get(id)
      if (!feature) {
        continue
      }
      const line = feature.properties.line
      if (!line) {
        continue
      }
      const key = getStationKey(feature)
      if (!lineMap.has(line)) {
        lineMap.set(line, new Set<string>())
      }
      lineMap.get(line)!.add(key)
    }

    const result: Record<string, number> = {}
    lineMap.forEach((keys, line) => {
      result[line] = keys.size
    })
    return result
  }, [found, idMap])

  const launchCompletionConfetti = useCallback(() => {
    if (
      !settings.confettiEnabled ||
      (settings.stopConfettiAfterCompletion && cityCompletionConfettiSeen)
    ) {
      return
    }
    const lineColors = Object.values(LINES ?? {})
      .map((line) => line?.color)
      .filter((color): color is string => typeof color === 'string' && color.length > 0)

    const makeConfetti = async () => {
      const confetti = (await import('tsparticles-confetti')).confetti
      confetti({
        spread: 130,
        ticks: 200,
        particleCount: 220,
        origin: { y: 0.2 },
        decay: 0.88,
        gravity: 1.8,
        startVelocity: 55,
        scalar: 1.4,
        shapes: ['circle', 'square'],
        colors: lineColors.length > 0 ? lineColors : undefined,
      })
    }

    void makeConfetti()

    if (!cityCompletionConfettiSeen) {
      markCityCompletionConfettiSeen()
    }
  }, [
    LINES,
    cityCompletionConfettiSeen,
    markCityCompletionConfettiSeen,
    settings.confettiEnabled,
    settings.stopConfettiAfterCompletion,
  ])

  const revealAllStations = useCallback(() => {
    setFound(allStationIds)
    setIsNewPlayer(false)
    setHideLabels(false)
    setFoundTimestamps((prev) => {
      const next = { ...prev }
      const timestamp = new Date().toISOString()
      for (const id of allStationIds) {
        const key = String(id)
        if (!next[key]) {
          next[key] = timestamp
        }
      }
      return next
    })
    launchCompletionConfetti()
  }, [
    allStationIds,
    setFound,
    setIsNewPlayer,
    setHideLabels,
    setFoundTimestamps,
    launchCompletionConfetti,
  ])

  const handleRevealSolutions = useCallback(() => {
    if (solutionsUnlocked) {
      clearAutoRevealSuppressionForCity(CITY_NAME)
      revealAllStations()
      setTimeout(() => {
        inputRef.current?.focus()
      }, 0)
      return
    }

    setSolutionsPassword('')
    setSolutionsError(false)
    setSolutionsPromptOpen(true)
  }, [
    CITY_NAME,
    solutionsUnlocked,
    revealAllStations,
    setSolutionsPassword,
    setSolutionsError,
    setSolutionsPromptOpen,
    clearAutoRevealSuppressionForCity,
  ])

  const handleSolutionsClose = useCallback(() => {
    setSolutionsPromptOpen(false)
    setSolutionsPassword('')
    setSolutionsError(false)
    setTimeout(() => {
      inputRef.current?.focus()
    }, 0)
  }, [setSolutionsPromptOpen, setSolutionsPassword, setSolutionsError])

  const handleSolutionsPasswordChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setSolutionsPassword(event.target.value)
    },
    [setSolutionsPassword],
  )

  const handleSolutionsSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      const password = solutionsPassword.trim()
      if (!password) {
        setSolutionsError(true)
        return
      }
      try {
        const response = await fetch('/api/solutions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password }),
        })
        const json = await response.json().catch(() => ({}))
        if (!response.ok || !json?.success) {
          setSolutionsError(true)
          return
        }
        clearAutoRevealSuppressionForCity(CITY_NAME)
        setSolutionsUnlocked(true)
        revealAllStations()
        setSolutionsPromptOpen(false)
        setSolutionsPassword('')
        setSolutionsError(false)
        setTimeout(() => {
          inputRef.current?.focus()
        }, 0)
      } catch (error) {
        setSolutionsError(true)
        if (process.env.NODE_ENV !== 'production') {
          console.error('Unable to validate solutions password', error)
        }
      }
    },
    [
      CITY_NAME,
      solutionsPassword,
      revealAllStations,
      setSolutionsPromptOpen,
      setSolutionsPassword,
      setSolutionsError,
      clearAutoRevealSuppressionForCity,
    ],
  )

  const autoRevealRef = useRef(false)

  useEffect(() => {
    if (autoRevealRef.current) {
      return
    }
    if (shouldAutoRevealSolutions(CITY_NAME)) {
      autoRevealRef.current = true
      setSolutionsUnlocked(true)
      revealAllStations()
    }
  }, [CITY_NAME, revealAllStations, setSolutionsUnlocked])

  const fuse = useMemo(
    () =>
      new Fuse(featureCollection.features, {
        includeScore: true,
        includeMatches: true,
        keys: [
          'properties.name',
          'properties.long_name',
          'properties.short_name',
          'properties.alternate_names',
        ],
        minMatchCharLength: 2,
        threshold: 0.15,
        distance: 10,
        getFn: (obj, path) => {
          const value = Fuse.config.getFn(obj, path)
          if (value === undefined) {
            return ''
          } else if (Array.isArray(value)) {
            return value.map((el) => normalizeString(el))
          } else if (typeof value === 'string') {
            return normalizeString(value)
          } else {
            return normalizeString(String(value ?? ''))
          }
        },
      }),
    [featureCollection.features, normalizeString],
  )

  const uniqueStationsMap = useMemo(() => {
    const map = new Map<string, DataFeature>()
    for (const feature of featureCollection.features) {
      const key = getStationKey(feature)
      if (!map.has(key)) {
        map.set(key, feature)
      }
    }
    return map
  }, [featureCollection.features])

  const totalUniqueStations = uniqueStationsMap.size

  const metadataTitle = useMemo(
    () => extractMetadataTitle(METADATA?.title),
    [METADATA?.title],
  )

  const cityDisplayName = useMemo(
    () => deriveCityDisplayName(metadataTitle, CITY_NAME),
    [metadataTitle, CITY_NAME],
  )

  const foundStationKeys = useMemo(() => {
    const keys = new Set<string>()
    for (const id of found) {
      const feature = idMap.get(id)
      if (!feature) continue
      keys.add(getStationKey(feature))
    }
    return keys
  }, [found, idMap])

  const foundProportion =
    totalUniqueStations === 0
      ? 0
      : foundStationKeys.size / totalUniqueStations

  const completionProgressRef = useRef(foundProportion)

  useEffect(() => {
    const previous = completionProgressRef.current ?? 0
    const reachedCompletion =
      previous < ACHIEVEMENT_COMPLETION_THRESHOLD &&
      foundProportion >= ACHIEVEMENT_COMPLETION_THRESHOLD

    if (reachedCompletion) {
      const shouldSuppressGlobal = !settings.achievementToastsEnabled
      const shouldSuppressCity =
        typeof window !== 'undefined' &&
        window.localStorage.getItem(achievementToastStorageKey(CITY_NAME)) === '1'
      if (shouldSuppressGlobal || shouldSuppressCity) {
        completionProgressRef.current = foundProportion
        return
      }
      const achievementMeta = getAchievementForCity(CITY_NAME, cityDisplayName)
      setAchievementToast({
        slug: CITY_NAME,
        cityName: cityDisplayName,
        title: achievementMeta.title,
        description: achievementMeta.description,
      })
    }

    completionProgressRef.current = foundProportion
  }, [CITY_NAME, cityDisplayName, foundProportion, settings.achievementToastsEnabled])

  useEffect(() => {
    if (!settings.achievementToastsEnabled) {
      setAchievementToast(null)
    }
  }, [settings.achievementToastsEnabled])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const stored = window.localStorage.getItem(kofiWidgetStorageKey(CITY_NAME))
    setKofiOpen(!stored)
  }, [CITY_NAME])

  const handleKofiDismiss = useCallback(() => {
    setKofiOpen(false)
  }, [])

  const handleKofiNever = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(kofiWidgetStorageKey(CITY_NAME), '1')
    }
    setKofiOpen(false)
  }, [CITY_NAME])

  const mapOptions = useMemo(() => {
    const fallbackLightStyle =
      process.env.NEXT_PUBLIC_MAPBOX_STYLE ??
      'mapbox://styles/mapbox/light-v11'

    let baseStyle: string | undefined
    if (typeof MAP_CONFIG.style === 'string') {
      baseStyle = MAP_CONFIG.style.includes('mapbox://styles/benjamintd/')
        ? fallbackLightStyle
        : MAP_CONFIG.style
    }

    const darkStyle =
      process.env.NEXT_PUBLIC_MAPBOX_STYLE_DARK ??
      'mapbox://styles/mapbox/dark-v11'

    const resolvedStyle =
      resolvedTheme === 'dark'
        ? darkStyle
        : baseStyle ?? fallbackLightStyle

    const { container: _ignored, ...rest } = MAP_CONFIG as typeof MAP_CONFIG & {
      container?: unknown
    }

    return {
      ...rest,
      style: resolvedStyle,
    }
  }, [MAP_CONFIG, resolvedTheme])

  useEffect(() => {
    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!

    if (!mapContainerRef.current) {
      return
    }

    setMapError(null)

    const supported =
      typeof mapboxgl.supported === 'function'
        ? mapboxgl.supported({ failIfMajorPerformanceCaveat: true })
        : true

    if (!supported) {
      setMapError(
        'This browser cannot initialize WebGL, so the map cannot be displayed. Please enable hardware acceleration or try a different browser.',
      )
      return
    }

    let mapboxMap: mapboxgl.Map | null = null

    try {
      mapboxMap = new mapboxgl.Map({
        ...mapOptions,
        container: mapContainerRef.current,
      })
    } catch (error) {
      console.error('Failed to initialize map', error)
      setMapError(
        'Failed to initialize the map in this environment. Please check WebGL support.',
      )
      return
    }

    if (!mapboxMap) {
      return
    }

    let ensureRouteLayers: (() => void) | null = null

    const hideBaseSymbolLayers = () => {
      if (!mapboxMap) return
      const mapStyle = mapboxMap.getStyle()
      if (!mapStyle || !Array.isArray(mapStyle.layers)) {
        return
      }
      for (const layer of mapStyle.layers) {
        if (layer.type === 'symbol' && mapboxMap.getLayer(layer.id)) {
          mapboxMap.setLayoutProperty(layer.id, 'visibility', 'none')
        }
      }
    }

    mapboxMap.on('load', () => {
      mapboxMap.doubleClickZoom.disable()
      const isDarkTheme = resolvedTheme === 'dark'
      const foundTextColor = isDarkTheme
        ? 'rgb(255, 255, 255)'
        : 'rgb(29, 40, 53)'
      const foundHaloColor = isDarkTheme
        ? 'rgba(0, 0, 0, 0.85)'
        : 'rgba(255, 255, 255, 0.8)'
      const hoverTextColor = foundTextColor
      const hoverHaloColor = isDarkTheme
        ? 'rgba(0, 0, 0, 0.85)'
        : 'rgb(255, 255, 255)'

      hideBaseSymbolLayers()
      mapboxMap.on('styledata', hideBaseSymbolLayers)
      mapboxMap.on('style.load', hideBaseSymbolLayers)

      mapboxMap.addSource('features', {
        type: 'geojson',
        data: featureCollection,
      })

      mapboxMap.addSource('hovered', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [],
        },
      })

      const ROUTES_SOURCE_ID = 'game-routes'
      const ROUTES_LAYER_ID = 'game-routes-line'
      const ROUTES_LAYER_CASING_ID = 'game-routes-line-casing'
      const SIR_LOCAL_LAYER_ID = 'sir-local-line'
      const SIR_LOCAL_CASING_LAYER_ID = 'sir-local-line-casing'
      const PASCACK_LAYER_ID = 'pascack-line'
      const PASCACK_CASING_LAYER_ID = 'pascack-line-casing'
      const SIR_LOCAL_FILTER: any = [
        '==',
        ['get', 'line'],
        'NewYorkSubwaySI',
      ]
      const PASCACK_FILTER: any = [
        '==',
        ['get', 'line'],
        'NJTPascackValley',
      ]

      ensureRouteLayers = () => {
        if (!MAP_FROM_DATA || !routes) {
          return
        }

        if (mapboxMap.getLayer(ROUTES_LAYER_ID)) {
          return
        }

        const routeData = JSON.parse(JSON.stringify(routes))
        const lineWidthExpression: any = [
          'interpolate',
          ['linear'],
          ['zoom'],
          9,
          2.5,
          16,
          6,
          22,
          8,
        ]
        const casingLineWidthExpression: any = [
          'interpolate',
          ['linear'],
          ['zoom'],
          9,
          3.2,
          16,
          7,
          22,
          9.5,
        ]
        const lineOffsetExpression: any = ['match', ['get', 'line'], '', 2, 0]
        const lineSortKeyExpression: any = [
          'case',
          ['==', ['get', 'line'], 'NewYorkSubwaySI'],
          1_000,
          ['==', ['get', 'line'], 'NewYorkSubwaySIExpress'],
          999,
          ['==', ['get', 'line'], 'NJTPascackValley'],
          900,
          ['==', ['get', 'line'], 'NJTMeadowlands'],
          899,
          ['-', 100, ['coalesce', ['get', 'order'], 100]],
        ]

        if (!mapboxMap.getSource(ROUTES_SOURCE_ID)) {
          mapboxMap.addSource(ROUTES_SOURCE_ID, {
            type: 'geojson',
            data: routeData,
          })
        }

        try {
          const ensureOverlayPair = (
            lineId: string,
            casingId: string,
            filter: any,
            sortKeyBase: number,
          ) => {
            if (!mapboxMap.getSource(ROUTES_SOURCE_ID)) return

            if (!mapboxMap.getLayer(casingId)) {
              mapboxMap.addLayer({
                id: casingId,
                type: 'line',
                paint: {
                  'line-width': casingLineWidthExpression,
                  'line-color': 'rgba(24,24,27,0.45)',
                  'line-opacity': 0.65,
                  'line-offset': lineOffsetExpression,
                },
                layout: {
                  'line-sort-key': sortKeyBase,
                  'line-cap': 'round',
                  'line-join': 'round',
                },
                filter,
                source: ROUTES_SOURCE_ID,
              })
            }

            if (!mapboxMap.getLayer(lineId)) {
              mapboxMap.addLayer({
                id: lineId,
                type: 'line',
                paint: {
                  'line-width': lineWidthExpression,
                  'line-color': [
                    'case',
                    ['has', 'color'],
                    ['to-color', ['get', 'color']],
                    '#1d2835',
                  ],
                  'line-opacity': 0.95,
                  'line-offset': lineOffsetExpression,
                },
                layout: {
                  'line-sort-key': sortKeyBase + 1,
                  'line-cap': 'round',
                  'line-join': 'round',
                },
                filter,
                source: ROUTES_SOURCE_ID,
              })
            }
          }

          if (!mapboxMap.getLayer(ROUTES_LAYER_CASING_ID)) {
            mapboxMap.addLayer({
              id: ROUTES_LAYER_CASING_ID,
              type: 'line',
              paint: {
                'line-width': casingLineWidthExpression,
                'line-color': 'rgba(24,24,27,0.45)',
                'line-opacity': 0.6,
                'line-offset': lineOffsetExpression,
              },
              layout: {
                'line-sort-key': lineSortKeyExpression,
                'line-cap': 'round',
                'line-join': 'round',
              },
              source: ROUTES_SOURCE_ID,
            })
          }

          if (!mapboxMap.getLayer(ROUTES_LAYER_ID)) {
            mapboxMap.addLayer({
              id: ROUTES_LAYER_ID,
              type: 'line',
              paint: {
                'line-width': lineWidthExpression,
                'line-color': [
                  'case',
                  ['has', 'color'],
                  ['to-color', ['get', 'color']],
                  '#1d2835',
                ],
                'line-opacity': 0.9,
                'line-offset': lineOffsetExpression,
              },
              layout: {
                'line-sort-key': lineSortKeyExpression,
                'line-cap': 'round',
                'line-join': 'round',
              },
              source: ROUTES_SOURCE_ID,
            })
          }

          ensureOverlayPair(
            SIR_LOCAL_LAYER_ID,
            SIR_LOCAL_CASING_LAYER_ID,
            SIR_LOCAL_FILTER,
            10_000,
          )
          ensureOverlayPair(
            PASCACK_LAYER_ID,
            PASCACK_CASING_LAYER_ID,
            PASCACK_FILTER,
            9_100,
          )
        } catch (error) {
          console.error('Failed to add route layer', error)
        }
      }

      ensureRouteLayers()

      if (MAP_FROM_DATA && routes) {
        mapboxMap.addLayer({
          type: 'circle',
          source: 'features',
          id: 'stations',
          paint: {
            'circle-radius': [
              'interpolate',
              ['linear'],
              ['zoom'],
              9,
              1.5,
              16,
              10,
            ],
            'circle-color': '#ffffff',
            'circle-stroke-color': 'rgb(122, 122, 122)',
            'circle-stroke-width': [
              'interpolate',
              ['linear'],
              ['zoom'],
              8,
              0.5,
              22,
              2,
            ],
          },
        })

        const box = bbox(routes)
        const [minLng, minLat, maxLng, maxLat] = box
        const hasValidBox =
          Number.isFinite(minLng) &&
          Number.isFinite(minLat) &&
          Number.isFinite(maxLng) &&
          Number.isFinite(maxLat) &&
          maxLng > minLng &&
          maxLat > minLat &&
          minLat >= -90 &&
          minLat <= 90 &&
          maxLat >= -90 &&
          maxLat <= 90

        if (hasValidBox) {
          mapboxMap.fitBounds(
            [
              [minLng, minLat],
              [maxLng, maxLat],
            ],
            { padding: 100, duration: 0 },
          )

          mapboxMap.setMaxBounds([
            [minLng - 1, minLat - 1],
            [maxLng + 1, maxLat + 1],
          ])
        }
      }

      if (ensureRouteLayers) {
        mapboxMap.on('styledata', ensureRouteLayers)
      }

      mapboxMap.addLayer({
        id: 'stations-hovered',
        type: 'circle',
        paint: {
          'circle-radius': 16,
          'circle-color': '#fde047',
          'circle-blur-transition': {
            duration: 100,
          },
          'circle-blur': 1,
        },
        source: 'hovered',
        filter: ['==', '$type', 'Point'],
      })

      mapboxMap.addLayer({
        type: 'circle',
        source: 'features',
        id: 'stations-circles',
        paint: {
          'circle-radius': [
            'interpolate',
            ['linear'],
            ['zoom'],
            9,
            ['case', ['to-boolean', ['feature-state', 'found']], 2, 1],
            16,
            ['case', ['to-boolean', ['feature-state', 'found']], 6, 4],
          ],
          'circle-color': [
            'case',
            ['to-boolean', ['feature-state', 'found']],
            [
              'match',
              ['get', 'line'],
              ...Object.keys(LINES).flatMap((line) => [
                [line],
                LINES[line].color,
              ]),
              'rgba(255, 255, 255, 0.8)',
            ],
            'rgba(255, 255, 255, 0.8)',
          ],
          'circle-stroke-color': [
            'case',
            ['to-boolean', ['feature-state', 'found']],
            [
              'match',
              ['get', 'line'],
              ...Object.keys(LINES).flatMap((line) => [
                [line],
                LINES[line].backgroundColor,
              ]),
              'rgba(255, 255, 255, 0.8)',
            ],
            'rgba(120, 120, 120, 0.6)',
          ],
          'circle-stroke-width': [
            'case',
            ['to-boolean', ['feature-state', 'found']],
            1,
            0.75,
          ],
        },
        layout: {
          'circle-sort-key': ['-', 100, ['get', 'order']],
        },
      })

      mapboxMap.addLayer({
        minzoom: 11,
        layout: {
          'text-field': [
            'to-string',
            ['coalesce', ['get', 'display_name'], ['get', 'name']],
          ],
          'text-font': ['Cabin Regular', 'Arial Unicode MS Regular'],
          'text-anchor': 'bottom',
          'text-offset': [0, -0.5],
          'text-size': ['interpolate', ['linear'], ['zoom'], 11, 12, 22, 14],
        },
        type: 'symbol',
        source: 'features',
        id: 'stations-labels',
          paint: {
            'text-color': [
              'case',
              ['to-boolean', ['feature-state', 'found']],
              foundTextColor,
              'rgba(0, 0, 0, 0)',
            ],
            'text-halo-color': [
              'case',
              ['to-boolean', ['feature-state', 'found']],
              foundHaloColor,
              'rgba(0, 0, 0, 0)',
            ],
            'text-halo-blur': 1,
            'text-halo-width': 1,
          },
      })

      mapboxMap.addLayer({
        id: 'hover-label-point',
        type: 'symbol',
          paint: {
            'text-halo-color': hoverHaloColor,
            'text-halo-width': 2,
            'text-halo-blur': 1,
            'text-color': hoverTextColor,
          },
          layout: {
            'text-field': [
              'to-string',
              ['coalesce', ['get', 'display_name'], ['get', 'name']],
          ],
          'text-font': ['Cabin Bold', 'Arial Unicode MS Regular'],
          'text-anchor': 'bottom',
          'text-offset': [0, -0.6],
          'text-size': ['interpolate', ['linear'], ['zoom'], 11, 14, 22, 16],
          'symbol-placement': 'point',
        },
        source: 'hovered',
        filter: ['==', '$type', 'Point'],
      })

      mapboxMap.once('data', () => {
        setMap((map) => (map === null ? mapboxMap : map))
      })

      mapboxMap.once('idle', () => {
        setMap((map) => (map === null ? mapboxMap : map))
        mapboxMap.on('mousemove', ['stations-circles'], (e) => {
          if (e.features && e.features.length > 0) {
            const feature = e.features.find(
              (candidate) => typeof candidate.id === 'number',
            )
            if (feature && typeof feature.id === 'number') {
              setHoveredId(feature.id as number)
              return
            }
          }

          setHoveredId(null)
        })

        mapboxMap.on('mouseleave', ['stations-circles'], () => {
          setHoveredId(null)
        })
      })
    })

    return () => {
      if (!mapboxMap) {
        return
      }
      mapboxMap.off('styledata', hideBaseSymbolLayers)
      mapboxMap.off('style.load', hideBaseSymbolLayers)
      if (ensureRouteLayers) {
        mapboxMap.off('styledata', ensureRouteLayers)
      }
      mapboxMap.remove()
      setMap(null)
    }
  }, [setMap, featureCollection, LINES, mapOptions, MAP_FROM_DATA, routes, resolvedTheme])

  useEffect(() => {
    if (!map || !(map as any).style) {
      return
    } else {
      const hoveredSource = map.getSource('hovered') as
        | mapboxgl.GeoJSONSource
        | undefined

      if (!hoveredSource) {
        return
      }

      hoveredSource.setData({
        type: 'FeatureCollection',
        features: hoveredId ? [idMap.get(hoveredId)!] : [],
      })
    }
  }, [map, hoveredId, idMap])

  useEffect(() => {
    if (!map || !(map as any).style || !found) return

    if (!map.getSource('features')) {
      return
    }

    map.removeFeatureState({ source: 'features' })

    for (let id of found) {
      map.setFeatureState({ source: 'features', id }, { found: true })
    }
  }, [found, map])

  useEffect(() => {
    if (!map) {
      return
    }

    const handleDoubleClick = (event: mapboxgl.MapLayerMouseEvent) => {
      if (typeof event.preventDefault === 'function') {
        event.preventDefault()
      }

      const feature = event.features?.find(
        (candidate) => typeof candidate.id === 'number',
      )

      if (!feature || typeof feature.id !== 'number') {
        return
      }

      const featureId = feature.id as number

      if (!found.includes(featureId)) {
        return
      }

      setSidebarOpen(true)

      if (typeof window !== 'undefined' && window.innerWidth < 1024) {
        setMobileSidebarOpen(true)
      }

      setActiveFoundId(featureId)
      setHoveredId(featureId)
    }

    map.on('dblclick', 'stations-circles', handleDoubleClick)

    return () => {
      map.off('dblclick', 'stations-circles', handleDoubleClick)
    }
  }, [map, found, setSidebarOpen, setMobileSidebarOpen, setActiveFoundId, setHoveredId])

  const zoomToFeature = useCallback(
    (id: number) => {
      if (!map) return

      const feature = idMap.get(id)
      if (!feature) return

      if (feature.geometry.type === 'Point') {
        map.flyTo({
          center: feature.geometry.coordinates as [number, number],
          zoom: 14,
        })
      } else {
        const bounds = new mapboxgl.LngLatBounds()
        coordEach(feature, (coord) => {
          bounds.extend(coord as [number, number])
        })
        map.fitBounds(bounds, { padding: 100 })
      }
    },
    [map, idMap],
  )

  useEffect(() => {
    if (!map) {
      return
    }

    map.resize()

    if (typeof window !== 'undefined') {
      const raf = window.requestAnimationFrame(() => {
        map.resize()
      })

      return () => {
        window.cancelAnimationFrame(raf)
      }
    }
  }, [map, sidebarOpen])

  useEffect(() => {
    if (activeFoundId !== null && !found.includes(activeFoundId)) {
      setActiveFoundId(null)
    }
  }, [activeFoundId, found])

  const sidebarStyle = useMemo<CSSProperties | undefined>(() => {
    if (sidebarOpen) {
      return undefined
    }
    return { width: 0, flexBasis: 0 }
  }, [sidebarOpen])

  return (
    <div className="relative flex h-screen flex-row items-start justify-start bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <div className="absolute right-4 top-4 z-[100]">
        <ThemeToggleButton />
      </div>
      <div className="relative flex-1 min-w-0 h-full">
        <div ref={mapContainerRef} className="absolute inset-0 h-full w-full" />
        {mapError ? (
          <div className="absolute inset-0 z-50 flex items-center justify-center px-4">
            <div className="max-w-lg rounded-lg bg-white/95 p-4 text-sm font-semibold text-red-700 shadow-lg dark:bg-zinc-900/95 dark:text-red-200 dark:shadow-black/40">
              {mapError}
            </div>
          </div>
        ) : null}
        <div className="pointer-events-none absolute inset-x-0 top-4 px-3 lg:top-6 lg:px-6">
          <div className="pointer-events-auto mx-auto flex w-full max-w-3xl flex-col gap-3">
            <FoundSummary
              className="rounded-lg bg-white/95 p-4 shadow-md dark:bg-zinc-900/95 dark:text-zinc-100 dark:shadow-black/40 lg:hidden"
              foundProportion={foundProportion}
              foundStationsPerLine={foundStationsPerLine}
              stationsPerLine={stationsPerLine}
              cityCompletionConfettiSeen={cityCompletionConfettiSeen}
              onCityCompletionConfettiSeen={markCityCompletionConfettiSeen}
              minimizable
            />
            <div className="flex items-center gap-2 lg:gap-3">
              <button
                type="button"
                onClick={() => setMobileSidebarOpen((open) => !open)}
                className="inline-flex h-12 items-center gap-2 rounded-full bg-white px-4 text-sm font-semibold text-zinc-700 shadow-lg transition hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-[var(--accent-ring)] dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700 lg:hidden"
                aria-label={`${mobileSidebarOpen ? 'Hide sidebar' : 'Show sidebar'} (${foundStationKeys.size} found)`}
              >
                <span className="flex flex-col items-start leading-none">
                  <span className="text-base font-bold">{foundStationKeys.size}</span>
                  <span className="text-[10px] uppercase tracking-wide text-zinc-500 dark:text-zinc-300">
                    {t('stationsFound')}
                  </span>
                </span>
                <span className="text-base font-semibold">
                  {mobileSidebarOpen ? '<' : '>'}
                </span>
              </button>
              <Input
                fuse={fuse}
                found={found}
                setFound={setFound}
                setFoundTimestamps={setFoundTimestamps}
                setIsNewPlayer={setIsNewPlayer}
                inputRef={inputRef}
                map={map}
                idMap={idMap}
                clusterGroups={clusterGroups}
                autoFocus={!solutionsPromptOpen}
                disabled={solutionsPromptOpen}
              />
              <MenuComponent
                hideLabels={hideLabels}
                setHideLabels={setHideLabels}
                onRevealSolutions={handleRevealSolutions}
                foundProportion={foundProportion}
                onOpenSettings={openSettingsModal}
                onOpenCityStats={() => setCityStatsOpen(true)}
                onOpenAccount={openAccountModal}
                onOpenPrivacy={openPrivacyModal}
                onOpenSupport={() => setSupportModalOpen(true)}
              />
              {found.length > 0 && (
                <button
                  type="button"
                  onClick={onReset}
                  className="hidden rounded-full border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-300 dark:border-red-500/40 dark:text-red-300 dark:hover:bg-red-500/10 lg:inline-flex"
                >
                  Reset progress
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      <div
        className={`relative hidden h-full min-w-0 overflow-visible lg:flex ${
          sidebarOpen ? 'w-96 xl:w-[32rem]' : 'w-0'
        }`}
        style={sidebarStyle}
      >
        <button
          type="button"
          onClick={() => setSidebarOpen((open) => !open)}
          className="absolute left-0 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 -translate-x-[65%] items-center justify-center rounded-full bg-white text-zinc-700 shadow-lg transition hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-[var(--accent-ring)] dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
          aria-label={sidebarOpen ? 'Hide sidebar' : 'Show sidebar'}
        >
          {sidebarOpen ? '<' : '>'}
        </button>
        {sidebarOpen ? (
          <div className="flex h-full w-full flex-col overflow-y-auto bg-white p-6 shadow-lg dark:bg-zinc-900/95 dark:shadow-black/40">
            <FoundSummary
              className="rounded-lg bg-white p-4 shadow-md dark:bg-zinc-900 dark:text-zinc-100 dark:shadow-black/40"
              foundProportion={foundProportion}
              foundStationsPerLine={foundStationsPerLine}
              stationsPerLine={stationsPerLine}
              cityCompletionConfettiSeen={cityCompletionConfettiSeen}
              onCityCompletionConfettiSeen={markCityCompletionConfettiSeen}
              minimizable
              defaultMinimized
            />
            <hr className="my-4 w-full border-b border-zinc-100 dark:border-[#18181b]" />
            <FoundList
              found={found}
              idMap={idMap}
              setHoveredId={setHoveredId}
              hoveredId={hoveredId}
              hideLabels={hideLabels}
              foundTimestamps={foundTimestamps}
              zoomToFeature={zoomToFeature}
              onStationFocus={setActiveFoundId}
              activeStationId={activeFoundId}
              disabled={solutionsPromptOpen}
            />
          </div>
        ) : null}
      </div>
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-30 flex flex-col bg-zinc-900/50 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
          role="presentation"
        >
          <div
            className="mt-auto max-h-[90vh] w-full rounded-t-3xl bg-white p-5 shadow-2xl dark:bg-zinc-900 dark:text-zinc-100"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                {t('stationsFound')}
              </h2>
              <button
                type="button"
                onClick={() => setMobileSidebarOpen(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 text-zinc-700 shadow hover:bg-zinc-200 focus:outline-none focus:ring-2 focus:ring-[var(--accent-ring)] dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
                aria-label="Hide sidebar"
              >
                {'<'}
              </button>
            </div>
            <FoundSummary
              className="rounded-xl border border-zinc-100 bg-white p-4 shadow-sm dark:border-[#18181b] dark:bg-zinc-800/80"
              foundProportion={foundProportion}
              foundStationsPerLine={foundStationsPerLine}
              stationsPerLine={stationsPerLine}
              cityCompletionConfettiSeen={cityCompletionConfettiSeen}
              onCityCompletionConfettiSeen={markCityCompletionConfettiSeen}
            />
            <div className="mt-4 max-h-[60vh] overflow-y-auto pr-1">
              <FoundList
                found={found}
                idMap={idMap}
                setHoveredId={setHoveredId}
                hoveredId={hoveredId}
                hideLabels={hideLabels}
                foundTimestamps={foundTimestamps}
                zoomToFeature={zoomToFeature}
                onStationFocus={setActiveFoundId}
                activeStationId={activeFoundId}
                disabled={solutionsPromptOpen}
              />
            </div>
          </div>
        </div>
      )}
      <IntroModal
        inputRef={inputRef}
        open={isNewPlayer}
        setOpen={setIsNewPlayer}
      >
        {t('introInstruction')} ⏎
      </IntroModal>
      {settingsModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/60 backdrop-blur-sm"
          onClick={closeSettingsModal}
        >
          <div
            className="mx-4 w-full max-w-3xl rounded-3xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-[#18181b] dark:bg-zinc-900"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
                {t('settings')}
              </h2>
              <button
                type="button"
                onClick={closeSettingsModal}
                className="rounded-full border border-zinc-300 px-3 py-1 text-sm font-semibold text-zinc-700 hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-[var(--accent-ring)] dark:border-[#18181b] dark:text-zinc-100 dark:hover:bg-zinc-800"
              >
                Close
              </button>
            </div>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Changes here are synced with the main site settings.
            </p>
            <SettingsPanel className="mt-4" showHeading={false} />
            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <Link
                href="/?tab=settings"
                className="inline-flex items-center justify-center rounded-full border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-[var(--accent-ring)] dark:border-[#18181b] dark:text-zinc-100 dark:hover:bg-zinc-800"
              >
                Open main page settings
              </Link>
              <button
                type="button"
                onClick={closeSettingsModal}
                className="inline-flex items-center justify-center rounded-full bg-[var(--accent-600)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--accent-500)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-ring)] dark:bg-[var(--accent-600)] dark:hover:bg-[var(--accent-500)]"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
      {accountModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/60 backdrop-blur-sm"
          onClick={closeAccountModal}
        >
          <div
            className="mx-4 w-full max-w-3xl rounded-3xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-[#18181b] dark:bg-zinc-900"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
                {t('account')}
              </h2>
              <button
                type="button"
                onClick={closeAccountModal}
                className="rounded-full border border-zinc-300 px-3 py-1 text-sm font-semibold text-zinc-700 hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-[var(--accent-ring)] dark:border-[#18181b] dark:text-zinc-100 dark:hover:bg-zinc-800"
              >
                Close
              </button>
            </div>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Manage your Metro Memory account without leaving the map.
            </p>
            <div className="mt-4 max-h-[70vh] overflow-y-auto">
              <AccountDashboard showHeading={false} />
            </div>
          </div>
        </div>
      )}
      {privacyModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/60 backdrop-blur-sm"
          onClick={closePrivacyModal}
        >
          <div
            className="mx-4 w-full max-w-3xl rounded-3xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-[#18181b] dark:bg-zinc-900"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
                {t('privacy')}
              </h2>
              <button
                type="button"
                onClick={closePrivacyModal}
                className="rounded-full border border-zinc-300 px-3 py-1 text-sm font-semibold text-zinc-700 hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-[var(--accent-ring)] dark:border-[#18181b] dark:text-zinc-100 dark:hover:bg-zinc-800"
              >
                Close
              </button>
            </div>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Review privacy details right from the game.
            </p>
            <div className="mt-4 max-h-[70vh] overflow-y-auto">
              <PrivacyPanel />
            </div>
          </div>
        </div>
      )}
      <CityStatsPanel
        cityDisplayName={cityDisplayName}
        slug={CITY_NAME}
        open={cityStatsOpen}
        onClose={() => setCityStatsOpen(false)}
      />
      {supportModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/60 backdrop-blur-sm"
          onClick={() => setSupportModalOpen(false)}
        >
          <div
            className="relative w-full max-w-md rounded-3xl border border-zinc-200 bg-white shadow-2xl dark:border-[#18181b] dark:bg-zinc-900"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-4 dark:border-[#18181b]">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Support me!</h2>
              <button
                type="button"
                onClick={() => setSupportModalOpen(false)}
                className="rounded-full border border-zinc-300 px-3 py-1 text-sm font-semibold text-zinc-700 hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-[var(--accent-ring)] dark:border-[#18181b] dark:text-zinc-100 dark:hover:bg-zinc-800"
              >
                Close
              </button>
            </div>
            <div className="p-4">
              <KoFiWidget open onClose={() => setSupportModalOpen(false)} onNever={handleKofiNever} />
            </div>
          </div>
        </div>
      )}
      {kofiOpen && (
        <div className="fixed left-4 top-1/2 z-40 w-[320px] max-w-[calc(100%-1.5rem)] -translate-y-1/2">
          <KoFiWidget open onClose={handleKofiDismiss} onNever={handleKofiNever} />
        </div>
      )}
      {achievementToast && (
        <AchievementToast
          open
          slug={achievementToast.slug}
          cityName={achievementToast.cityName}
          title={achievementToast.title}
          description={achievementToast.description}
          onClose={handleAchievementToastClose}
          onDontShowAgain={() => handleAchievementToastNever(achievementToast.slug)}
        />
      )}
      {solutionsPromptOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/60 backdrop-blur-sm">
          <div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl dark:bg-zinc-900 dark:text-zinc-100"
          >
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              {t('showSolutions')}
            </h2>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
              Enter the password to reveal every station.
            </p>
            <form className="mt-4 space-y-4" onSubmit={handleSolutionsSubmit}>
              <input
                type="password"
                autoFocus
                value={solutionsPassword}
                onChange={handleSolutionsPasswordChange}
                className="w-full rounded-lg border border-zinc-300 px-4 py-2 text-base text-zinc-900 focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/20 dark:border-[#18181b] dark:bg-zinc-900 dark:text-zinc-100 dark:focus:border-[var(--accent-400)] dark:focus:ring-[var(--accent-ring)]"
                placeholder="Password"
                autoComplete="off"
              />
              {solutionsError && (
                <p className="text-sm font-medium text-red-600">
                  Incorrect password. Try again.
                </p>
              )}
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={handleSolutionsClose}
                  className="rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500/40 dark:border-[#18181b] dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
                >
                  {t('backToTheGame')}
                </button>
                <button
                  type="submit"
                  className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-500/40 dark:bg-[var(--accent-600)] dark:hover:bg-[var(--accent-500)]"
                >
                  Unlock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
