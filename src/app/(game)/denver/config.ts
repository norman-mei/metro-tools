import { Metadata } from 'next'
import { MapboxOptions } from 'mapbox-gl'
import { Config, Line, LineGroup } from '@/lib/types'
import linesData from './data/lines.json'

export const BEG_THRESHOLD = 0.5

export const LINES = linesData as { [name: string]: Line }

export const LINE_GROUPS: LineGroup[] = [
  {
    title: 'Regional Transportation District (RTD)',
    items: [
      {
        type: 'lines',
        title: 'Commuter Rail',
        lines: ['Denver_RTD_A', 'Denver_RTD_B', 'Denver_RTD_G', 'Denver_RTD_N'],
      },
      {
        type: 'lines',
        title: 'Light Rail',
        lines: [
          'Denver_RTD_D',
          'Denver_RTD_E',
          'Denver_RTD_H',
          'Denver_RTD_L',
          'Denver_RTD_R',
          'Denver_RTD_W',
        ],
      },
    ],
  },
  {
    items: [{ type: 'separator' }],
  },
  {
    title: 'City & County of Denver Department of Aviation',
    items: [
      {
        type: 'lines',
        title: 'Denver International Airport Automated Guideway Transit System (AGTS)',
        lines: ['DenverAGTS'],
      },
    ],
  },
]

export const METADATA: Metadata = {
  title: 'Denver Metro Memory',
  description: 'How many of the RTD stations can you name from memory?',
  openGraph: {
    title: 'Denver Metro Memory',
    description: 'How many of the RTD stations can you name from memory?',
    type: 'website',
    locale: 'en_US',
    url: 'https://metro-memory.com/denver',
  },
}

export const MAP_CONFIG: MapboxOptions = {
  container: 'map',
  style: 'mapbox://styles/benjamintd/cls31ijdo010o01plcpzag11d',
  bounds: [
    [-105.2, 39.52],
    [-104.65, 39.92],
  ],
  maxBounds: [
    [-105.5, 39.35],
    [-104.4, 40.1],
  ],
  minZoom: 9,
  fadeDuration: 50,
}

export const STRIPE_LINK = 'https://buy.stripe.com/28o14B9Yic6m73adQT'

export const CITY_NAME = 'denver'

export const LOCALE = 'en'

export const MAP_FROM_DATA = true

export const GAUGE_COLORS = 'inverted'

const config: Config = {
  MAP_FROM_DATA,
  GAUGE_COLORS,
  LOCALE,
  STRIPE_LINK,
  CITY_NAME,
  MAP_CONFIG,
  METADATA,
  LINES,
  LINE_GROUPS,
  BEG_THRESHOLD,
}

export default config
