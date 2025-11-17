import { Metadata } from 'next'
import { MapboxOptions } from 'mapbox-gl'
import { Config, Line, LineGroup } from '@/lib/types'
import linesData from './data/lines.json'

export const BEG_THRESHOLD = 0.5

export const LINES = linesData as { [name: string]: Line }

export const LINE_GROUPS: LineGroup[] = [
  {
    title: 'Taichung Mass Rapid Transit (TMRT)',
    items: [
      {
        type: 'lines',
        title: 'Green',
        lines: ['TaichungGreen'],
      },
    ],
  },
]

export const METADATA: Metadata = {
  title: 'Taichung Metro Memory',
  description: 'How many of the Taichung MRT stations can you name from memory?',
  openGraph: {
    title: 'Taichung Metro Memory',
    description: 'How many of the Taichung MRT stations can you name from memory?',
    type: 'website',
    locale: 'en_US',
    url: 'https://metro-memory.com/taichung',
  },
}

export const MAP_CONFIG: MapboxOptions = {
  container: 'map',
  style: 'mapbox://styles/benjamintd/cls31ijdo010o01plcpzag11d',
  bounds: [
    [120.60, 24.09],
    [120.74, 24.20],
  ],
  maxBounds: [
    [120.58, 24.07],
    [120.76, 24.22],
  ],
  minZoom: 11.5,
  fadeDuration: 50,
}

export const STRIPE_LINK = 'https://buy.stripe.com/28o14B9Yic6m73adQT'

export const CITY_NAME = 'taichung'

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
