import { Metadata } from 'next'
import { MapboxOptions } from 'mapbox-gl'

import { Config, Line, LineGroup } from '@/lib/types'

import linesData from './data/lines.json'

export const LINES = linesData as { [name: string]: Line }

export const LINE_GROUPS: LineGroup[] = [
  {
    title: 'Metro del Sol Amado',
    items: [
      {
        type: 'lines',
        lines: ['Line1'],
      },
    ],
  },
]

export const METADATA: Metadata = {
  icons: {
    icon: '/api/city-icon/maracaibo',
    apple: '/api/city-icon/maracaibo',
  },
  title: 'Maracaibo Metro Memory',
  description: 'How many of the Maracaibo Line 1 stations can you name from memory?',
  openGraph: {
    title: 'Maracaibo Metro Memory',
    description: 'How many of the Maracaibo Line 1 stations can you name from memory?',
    type: 'website',
    locale: 'en_US',
    url: 'https://metro-memory.com/maracaibo',
  },
}

export const MAP_CONFIG: MapboxOptions = {
  container: 'map',
  style: 'mapbox://styles/benjamintd/cls31ijdo010o01plcpzag11d',
  bounds: [
    [-71.68, 10.61],
    [-71.61, 10.65],
  ],
  maxBounds: [
    [-71.75, 10.58],
    [-71.55, 10.68],
  ],
  minZoom: 12.5,
  fadeDuration: 50,
}

export const CITY_NAME = 'maracaibo'

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
