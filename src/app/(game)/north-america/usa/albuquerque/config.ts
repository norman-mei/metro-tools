import { Metadata } from 'next'
import type { MapboxOptions } from 'mapbox-gl'
import { Config, Line, LineGroup } from '@/lib/types'
import linesData from './data/lines.json'


export const LINES = linesData as { [name: string]: Line }

export const LINE_GROUPS: LineGroup[] = [
  {
    title: 'New Mexico Department of Transportation (NMDOT)',
    items: [
      {
        type: 'lines',
        lines: ['RRX'],
      },
    ],
  },
]

export const METADATA: Metadata = {
  icons: {
    icon: '/api/city-icon/albuquerque',
    apple: '/api/city-icon/albuquerque',
  },
  title: 'Albuquerque Metro Memory',
  description:
    'How many of the New Mexico Rail Runner Express stations can you name from memory?',
  openGraph: {
    title: 'Albuquerque Metro Memory',
    description:
      'How many of the New Mexico Rail Runner Express stations can you name from memory?',
    type: 'website',
    locale: 'en_US',
    url: 'https://metro-memory.com/north-america/usa/albuquerque',
  },
}

export const MAP_CONFIG: MapboxOptions = {
  container: 'map',
  style: 'mapbox://styles/benjamintd/cls31ijdo010o01plcpzag11d',
  bounds: [
    [-106.9, 34.55],
    [-105.9, 35.75],
  ],
  maxBounds: [
    [-107.2, 34.35],
    [-105.6, 36.0],
  ],
  minZoom: 8,
  fadeDuration: 50,
}


export const CITY_NAME = 'albuquerque'

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
