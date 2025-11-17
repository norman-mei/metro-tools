import { Metadata } from 'next'
import { MapboxOptions } from 'mapbox-gl'
import { Config, Line, LineGroup } from '@/lib/types'
import linesData from './data/lines.json'

export const BEG_THRESHOLD = 0.5

export const LINES = linesData as { [name: string]: Line }

export const LINE_GROUPS: LineGroup[] = [
  {
    title: 'Taiwan High Speed Rail Corporation (THSRC)',
    items: [
      {
        type: 'lines',
        title: 'Taiwan High Speed Rail (THSR)',
        lines: ['THSR'],
      },
    ],
  },
]

export const METADATA: Metadata = {
  title: 'Taiwan High Speed Rail Metro Memory',
  description: 'How many Taiwan High Speed Rail stations can you name from memory?',
  openGraph: {
    title: 'Taiwan High Speed Rail Metro Memory',
    description: 'How many Taiwan High Speed Rail stations can you name from memory?',
    type: 'website',
    locale: 'en_US',
    url: 'https://metro-memory.com/thsr',
  },
}

export const MAP_CONFIG: MapboxOptions = {
  container: 'map',
  style: 'mapbox://styles/benjamintd/cls31ijdo010o01plcpzag11d',
  bounds: [
    [120.1, 22.4],
    [121.8, 25.2],
  ],
  maxBounds: [
    [119.5, 21.9],
    [122.4, 25.6],
  ],
  minZoom: 7,
  fadeDuration: 50,
}

export const STRIPE_LINK = 'https://buy.stripe.com/28o14B9Yic6m73adQT'

export const CITY_NAME = 'thsr'

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
