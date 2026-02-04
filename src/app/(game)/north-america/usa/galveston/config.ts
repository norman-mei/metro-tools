import { Metadata } from 'next'
import type { MapboxOptions } from 'mapbox-gl'
import { Config, Line, LineGroup } from '@/lib/types'
import linesData from './data/lines.json'


export const LINES = linesData as { [name: string]: Line }

export const LINE_GROUPS: LineGroup[] = [
  {
    title: 'Island Transit',
    items: [
      {
        type: 'lines',
        title: 'Galveston Island Trolley',
        lines: ['MAXRed'],
      },
    ],
  },
]

export const METADATA: Metadata = {
  icons: {
    icon: '/api/city-icon/galveston',
    apple: '/api/city-icon/galveston',
  },
  title: 'Galveston Metro Memory',
  description: 'How many of the Galveston Island Trolley stops can you name from memory?',
  openGraph: {
    title: 'Galveston Metro Memory',
    description: 'How many of the Galveston Island Trolley stops can you name from memory?',
    type: 'website',
    locale: 'en_US',
    url: 'https://metro-memory.com/north-america/usa/galveston',
  },
}

export const MAP_CONFIG: MapboxOptions = {
  container: 'map',
  style: 'mapbox://styles/benjamintd/cls31ijdo010o01plcpzag11d',
  bounds: [
    [-94.8007, 29.286],
    [-94.7828, 29.314],
  ],
  maxBounds: [
    [-94.8057, 29.282],
    [-94.7788, 29.318],
  ],
  minZoom: 12.5,
  fadeDuration: 50,
}


export const CITY_NAME = 'galveston'

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
