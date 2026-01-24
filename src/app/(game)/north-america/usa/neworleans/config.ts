import { Metadata } from 'next'
import { MapboxOptions } from 'mapbox-gl'
import { Config, Line, LineGroup } from '@/lib/types'
import linesData from './data/lines.json'


export const LINES = linesData as { [name: string]: Line }

export const LINE_GROUPS: LineGroup[] = [
  {
    title: 'New Orleans Regional Transit Authority (RTA)',
    items: [
      {
        type: 'lines',
        title: 'New Orleans Streetcars',
        lines: ['RTA12', 'RTA46', 'RTA47', 'RTA48', 'RTA49'],
      },
    ],
  },
]

export const METADATA: Metadata = {
  icons: {
    icon: '/api/city-icon/neworleans',
    apple: '/api/city-icon/neworleans',
  },
  title: 'New Orleans Metro Memory',
  description:
    'How many of the New Orleans streetcar stops can you name from memory?',
  openGraph: {
    title: 'New Orleans Metro Memory',
    description:
      'How many of the New Orleans streetcar stops can you name from memory?',
    type: 'website',
    locale: 'en_US',
    url: 'https://metro-memory.com/north-america/usa/neworleans',
  },
}

export const MAP_CONFIG: MapboxOptions = {
  container: 'map',
  style: 'mapbox://styles/benjamintd/cls31ijdo010o01plcpzag11d',
  bounds: [
    [-90.14, 29.92],
    [-90.05, 29.99],
  ],
  maxBounds: [
    [-90.22, 29.88],
    [-89.98, 30.05],
  ],
  minZoom: 12,
  fadeDuration: 50,
}


export const CITY_NAME = 'neworleans'

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
