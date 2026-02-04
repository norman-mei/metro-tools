import { Metadata } from 'next'
import type { MapboxOptions } from 'mapbox-gl'
import { Config, Line, LineGroup } from '@/lib/types'
import linesData from './data/lines.json'


export const LINES = linesData as { [name: string]: Line }

export const LINE_GROUPS: LineGroup[] = [
  {
    title: 'Charlotte Area Transit System (CATS)',
    items: [
      {
        type: 'lines',
        lines: ['501', '510'],
      },
    ],
  },
]

export const METADATA: Metadata = {
  icons: {
    icon: '/api/city-icon/charlotte',
    apple: '/api/city-icon/charlotte',
  },
  title: 'Charlotte Metro Memory',
  description:
    'How many of the Charlotte transit stations can you name from memory?',
  openGraph: {
    title: 'Charlotte Metro Memory',
    description:
      'How many of the Charlotte transit stations can you name from memory?',
    type: 'website',
    locale: 'en_US',
    url: 'https://metro-memory.com/north-america/usa/charlotte',
  },
}

export const MAP_CONFIG: MapboxOptions = {
  container: 'map',
  style: 'mapbox://styles/benjamintd/cls31ijdo010o01plcpzag11d',
  bounds: [
    [-80.89, 35.18],
    [-80.68, 35.34],
  ],
  maxBounds: [
    [-81.1, 35.05],
    [-80.5, 35.45],
  ],
  minZoom: 11,
  fadeDuration: 50,
}


export const CITY_NAME = 'charlotte'

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
