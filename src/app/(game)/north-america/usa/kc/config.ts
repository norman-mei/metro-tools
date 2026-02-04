import { Metadata } from 'next'
import type { MapboxOptions } from 'mapbox-gl'
import { Config, Line, LineGroup } from '@/lib/types'
import linesData from './data/lines.json'


export const LINES = linesData as { [name: string]: Line }

export const LINE_GROUPS: LineGroup[] = [
  {
    title: 'KC Streetcar',
    items: [
      {
        type: 'lines',
        lines: ['KCStreetcar'],
      },
    ],
  },
]

export const METADATA: Metadata = {
  icons: {
    icon: '/api/city-icon/kc',
    apple: '/api/city-icon/kc',
  },
  title: 'Kansas City Metro Memory',
  description:
    'How many of the Kansas City Streetcar stations can you name from memory?',
  openGraph: {
    title: 'Kansas City Metro Memory',
    description:
      'How many of the Kansas City Streetcar stations can you name from memory?',
    type: 'website',
    locale: 'en_US',
    url: 'https://metro-memory.com/north-america/usa/kc',
  },
}

export const MAP_CONFIG: MapboxOptions = {
  container: 'map',
  style: 'mapbox://styles/benjamintd/cls31ijdo010o01plcpzag11d',
  bounds: [
    [-94.595, 39.024],
    [-94.565, 39.127],
  ],
  maxBounds: [
    [-94.65, 38.99],
    [-94.54, 39.16],
  ],
  minZoom: 11,
  fadeDuration: 50,
}


export const CITY_NAME = 'kc'

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
