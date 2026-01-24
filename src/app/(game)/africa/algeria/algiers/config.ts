import { Metadata } from 'next'
import { MapboxOptions } from 'mapbox-gl'

import { Config, Line, LineGroup } from '@/lib/types'

import linesData from './data/lines.json'

export const LINES = linesData as { [name: string]: Line }

export const LINE_GROUPS: LineGroup[] = [
  {
    title: 'Métro d\'Alger',
    items: [
      {
        type: 'lines',
        lines: Object.keys(LINES),
      },
    ],
  },
]

export const METADATA: Metadata = {
  icons: {
    icon: '/api/city-icon/algiers',
    apple: '/api/city-icon/algiers',
  },
  title: 'Algiers Metro Memory',
  description: 'How many of the Algiers metro stations can you name from memory?',
  openGraph: {
    title: 'Algiers Metro Memory',
    description: 'How many of the Algiers metro stations can you name from memory?',
    type: 'website',
    locale: 'en_US',
    url: 'https://metro-memory.com/africa/algeria/algiers',
  },
}

export const MAP_CONFIG: MapboxOptions = {
  container: 'map',
  style: 'mapbox://styles/benjamintd/cls31ijdo010o01plcpzag11d',
  bounds: [
    [2.95, 36.68],
    [3.15, 36.82],
  ],
  maxBounds: [
    [2.8, 36.6],
    [3.3, 36.9],
  ],
  minZoom: 11.5,
  fadeDuration: 50,
}

export const CITY_NAME = 'algiers'

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
