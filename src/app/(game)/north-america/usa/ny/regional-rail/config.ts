import { Config, Line, LineGroup } from '@/lib/types'
import type { MapboxOptions } from 'mapbox-gl'
import { Metadata } from 'next'
import linesData from './data/lines.json'

export const LINES = linesData as { [name: string]: Line }

export const METADATA: Metadata = {
  icons: {
    icon: '/api/city-icon/ny',
    apple: '/api/city-icon/ny',
  },
  title: 'New York Regional Rail Memory',
  description: 'How many NY regional rail stations can you name from memory?',
  openGraph: {
    title: 'New York Regional Rail Memory',
    description: 'How many NY regional rail stations can you name from memory?',
    type: 'website',
    locale: 'en_US',
    url: 'https://metro-memory.com/north-america/usa/ny/regional-rail',
  },
}

export const MAP_CONFIG: MapboxOptions = {
  container: 'map',
  style: 'mapbox://styles/mapbox/light-v11',
  bounds: [
    [-75.2, 39.3],
    [-71.9, 41.9],
  ],
  maxBounds: [
    [-77, 38.5],
    [-70.5, 43.5],
  ],
  minZoom: 5,
  fadeDuration: 50,
}

export const CITY_NAME = 'regional-rail'

export const LOCALE = 'en'

export const GAUGE_COLORS = 'inverted'

export const MAP_FROM_DATA = true

export const LINE_GROUPS: LineGroup[] = [
  {
    title: 'Long Island Rail Road (LIRR)',
    items: [
      {
        type: 'lines',
        title: 'Electric',
        lines: [
          'LIRRBabylon',
          'LIRRBelmont',
          'LIRRAtlantic',
          'LIRRFarRockaway',
          'LIRRHempstead',
          'LIRRLongBeach',
          'LIRRPortWashington',
          'LIRRRonkonkoma',
          'LIRRWestHempstead',
        ],
      },
      {
        type: 'lines',
        title: 'Diesel',
        lines: [
          'LIRRGreenport',
          'LIRRMontauk',
          'LIRROysterBay',
          'LIRRPortJefferson',
        ],
      },
    ],
  },
  {
    items: [{ type: 'separator' }],
  },
  {
    title: 'Metro-North Railroad (MNR)',
    items: [
      {
        type: 'lines',
        title: 'East of Hudson – Hudson & Harlem',
        lines: ['MNRRHudson', 'MNRRHarlem'],
      },
      {
        type: 'lines',
        title: 'East of Hudson – New Haven',
        lines: [
          'MNRRNewHaven',
          'MNRRNewCanaan',
          'MNRRDanbury',
          'MNRRWaterbury',
        ],
      },
    ],
  },
  {
    items: [{ type: 'separator' }],
  },
  {
    title: 'New Jersey Transit Rail (NJTR)',
    items: [
      {
        type: 'lines',
        title: 'Newark Division',
        lines: [
          'NJTNorthEastCorridor',
          'NJTPrinceton',
          'NJTNorthJerseyCoast',
          'NJTRaritanValley',
          'NJTAtlanticCity',
        ],
      },
      {
        type: 'lines',
        title: 'Hoboken Division',
        lines: [
          'NJTMainLine',
          'NJTBergenCounty',
          'NJTPascackValley',
          'NJTPortJervis',
          'NJTMeadowlands',
          'NJTMontclairBoonton',
          'NJTMorrisEssex',
          'NJTGladstone',
          'NJTLackawannaCutOff',
        ],
      },
    ],
  },
  {
    items: [{ type: 'separator' }],
  },
  {
    title: 'CTrail',
    items: [
      {
        type: 'lines',
        lines: ['CTRailShoreLineEast', 'CTRailHartfordLine'],
      },
    ],
  },
]

const config: Config = {
  GAUGE_COLORS,
  LOCALE,
  CITY_NAME,
  MAP_CONFIG,
  METADATA,
  LINES,
  LINE_GROUPS,
  MAP_FROM_DATA,
}

export default config
