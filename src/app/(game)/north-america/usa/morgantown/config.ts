import { Metadata } from 'next'
import { MapboxOptions } from 'mapbox-gl'
import { Config, Line, LineGroup } from '@/lib/types'
import linesData from './data/lines.json'


export const LINES = linesData as { [name: string]: Line }

export const LINE_GROUPS: LineGroup[] = [
  {
    title: 'West Virginia University (WVU)',
    items: [
      {
        type: 'lines',
        lines: ['PRT'],
      },
    ],
  },
]

export const METADATA: Metadata = {
  icons: {
    icon: '/api/city-icon/morgantown',
    apple: '/api/city-icon/morgantown',
  },
  title: 'Morgantown Metro Memory',
  description:
    'How many of the Morgantown Personal Rapid Transit stations can you name from memory?',
  openGraph: {
    title: 'Morgantown Metro Memory',
    description:
      'How many of the Morgantown Personal Rapid Transit stations can you name from memory?',
    type: 'website',
    locale: 'en_US',
    url: 'https://metro-memory.com/north-america/usa/morgantown',
  },
}

export const MAP_CONFIG: MapboxOptions = {
  container: 'map',
  style: 'mapbox://styles/benjamintd/cls31ijdo010o01plcpzag11d',
  bounds: [
    [-79.98, 39.62],
    [-79.94, 39.67],
  ],
  maxBounds: [
    [-80.1, 39.58],
    [-79.85, 39.72],
  ],
  minZoom: 12,
  fadeDuration: 50,
}


export const CITY_NAME = 'morgantown'

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
