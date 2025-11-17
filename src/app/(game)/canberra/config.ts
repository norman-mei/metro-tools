import { Metadata } from 'next'
import { MapboxOptions } from 'mapbox-gl'
import { Config, Line, LineGroup } from '@/lib/types'
import linesData from './data/lines.json'

export const BEG_THRESHOLD = 0.5

export const LINES = linesData as { [name: string]: Line }

export const LINE_GROUPS: LineGroup[] = [
  {
    title: 'Canberra Metro Operations (CMET)',
    items: [
      {
        type: 'lines',
        title: 'Light Rail',
        lines: ['CanberraR1'],
      },
    ],
  },
]

export const METADATA: Metadata = {
  title: 'Canberra Metro Memory',
  description: 'How many of the Canberra Metro stations can you name from memory?',
  openGraph: {
    title: 'Canberra Metro Memory',
    description: 'How many of the Canberra Metro stations can you name from memory?',
    type: 'website',
    locale: 'en_US',
    url: 'https://metro-memory.com/canberra',
  },
}

export const MAP_CONFIG: MapboxOptions = {
  container: 'map',
  style: 'mapbox://styles/benjamintd/cls31ijdo010o01plcpzag11d',
  bounds: [
    [149.12, -35.30],
    [149.16, -35.18],
  ],
  maxBounds: [
    [149.09, -35.33],
    [149.20, -35.15],
  ],
  minZoom: 12.5,
  fadeDuration: 50,
}

export const STRIPE_LINK = 'https://buy.stripe.com/28o14B9Yic6m73adQT'

export const CITY_NAME = 'canberra'

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
