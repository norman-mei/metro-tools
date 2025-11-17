import { Metadata } from 'next'
import { MapboxOptions } from 'mapbox-gl'
import { Config, Line, LineGroup } from '@/lib/types'
import linesData from './data/lines.json'

export const BEG_THRESHOLD = 0.4

export const LINES = linesData as { [name: string]: Line }

export const LINE_GROUPS: LineGroup[] = [
  {
    title: 'San Diego Metropolitan Transit System (MTS)',
    items: [
      {
        type: 'lines',
        title: 'San Diego Trolley',
        lines: ['MTSBlue', 'MTSOrange', 'MTSGreen', 'MTSSilver', 'MTSSpecialEvents', 'MTSCopper'],
      },
    ],
  },
  {
    items: [{ type: 'separator' }],
  },
  {
    title: 'North County Transit – San Diego Railroad (NCTD)',
    items: [
      {
        type: 'lines',
        title: 'Commuter Rail',
        lines: ['COASTER'],
      },
      {
        type: 'lines',
        title: 'Light Rail',
        lines: ['SPRINTER'],
      },
    ],
  },
]

export const METADATA: Metadata = {
  title: 'San Diego-Oceanside Metro Memory',
  description:
    'How many of the San Diego Trolley, COASTER, and SPRINTER stops can you name from memory?',
  openGraph: {
    title: 'San Diego-Oceanside Metro Memory',
    description:
      'How many of the San Diego Trolley, COASTER, and SPRINTER stops can you name from memory?',
    type: 'website',
    locale: 'en_US',
    url: 'https://metro-memory.com/sd',
  },
}

export const MAP_CONFIG: MapboxOptions = {
  container: 'map',
  style: 'mapbox://styles/benjamintd/cls31ijdo010o01plcpzag11d',
  bounds: [
    [-117.6, 32.45],
    [-116.8, 33.3],
  ],
  maxBounds: [
    [-117.8, 32.25],
    [-116.5, 33.5],
  ],
  minZoom: 9,
  fadeDuration: 50,
}

export const STRIPE_LINK = 'https://buy.stripe.com/28o14B9Yic6m73adQT'

export const CITY_NAME = 'sd'

export const LOCALE = 'en'

export const MAP_FROM_DATA = true

const config: Config = {
  MAP_FROM_DATA,
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
