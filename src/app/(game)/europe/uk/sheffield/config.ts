import { Metadata } from 'next'
import type { MapboxOptions } from 'mapbox-gl'
import { Config, Line, LineGroup } from '@/lib/types'
import linesData from './data/lines.json'

export const LINES = linesData as { [name: string]: Line }

export const LINE_GROUPS: LineGroup[] = [
  {
    title: 'South Yorkshire Mayoral Combined Authority (SYMCA)',
    items: [
      {
        type: 'lines',
        title: 'South Yorkshire Supertram',
        lines: ['Yellow', 'Blue', 'Purple', 'TramTrain'],
      },
    ],
  },
]

export const METADATA: Metadata = {
  icons: {
    icon: '/api/city-icon/sheffield',
    apple: '/api/city-icon/sheffield',
  },
  title: 'Sheffield Supertram Memory',
  description: 'How many Sheffield Supertram stops can you name from memory?',
  openGraph: {
    title: 'Sheffield Supertram Memory',
    description: 'How many Sheffield Supertram stops can you name from memory?',
    type: 'website',
    locale: 'en_GB',
    url: 'https://metro-memory.com/europe/uk/sheffield',
  },
}

export const MAP_CONFIG: MapboxOptions = {
  container: 'map',
  style: 'mapbox://styles/benjamintd/cls31ijdo010o01plcpzag11d',
  bounds: [
    [-1.55, 53.32],
    [-1.33, 53.45],
  ],
  maxBounds: [
    [-1.6, 53.3],
    [-1.28, 53.48],
  ],
  minZoom: 11,
  fadeDuration: 50,
}

export const CITY_NAME = 'sheffield'

export const LOCALE = 'en'

export const MAP_FROM_DATA = true

const config: Config = {
  MAP_FROM_DATA,
  LOCALE,
  CITY_NAME,
  MAP_CONFIG,
  METADATA,
  LINES,
  LINE_GROUPS,
}

export default config
