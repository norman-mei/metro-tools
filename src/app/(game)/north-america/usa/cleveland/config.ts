import { Metadata } from 'next'
import { MapboxOptions } from 'mapbox-gl'
import { Config, Line, LineGroup } from '@/lib/types'
import linesData from './data/lines.json'


export const LINES = linesData as { [name: string]: Line }

export const LINE_GROUPS: LineGroup[] = [
  {
    title: 'RTA Rapid Transit',
    items: [
      {
        type: 'lines',
        lines: ['Red_Line', 'Blue_Line', 'Green_Line', 'Waterfront_Line'],
      },
    ],
  },
]

export const METADATA: Metadata = {
  icons: {
    icon: '/api/city-icon/cleveland',
    apple: '/api/city-icon/cleveland',
  },
  title: 'Cleveland Metro Memory',
  description:
    'How many of the Cleveland RTA Rapid Transit stations can you name from memory?',
  openGraph: {
    title: 'Cleveland Metro Memory',
    description:
      'How many of the Cleveland RTA Rapid Transit stations can you name from memory?',
    type: 'website',
    locale: 'en_US',
    url: 'https://metro-memory.com/north-america/usa/cleveland',
  },
}

export const MAP_CONFIG: MapboxOptions = {
  container: 'map',
  style: 'mapbox://styles/benjamintd/cls31ijdo010o01plcpzag11d',
  bounds: [
    [-81.85, 41.4],
    [-81.5, 41.54],
  ],
  maxBounds: [
    [-82.0, 41.3],
    [-81.3, 41.65],
  ],
  minZoom: 7,
  fadeDuration: 50,
}


export const CITY_NAME = 'cleveland'

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
