import { Metadata } from 'next'
import type { MapboxOptions } from 'mapbox-gl'
import { Config, Line, LineGroup } from '@/lib/types'
import linesData from './data/lines.json'

export const LINES = linesData as { [name: string]: Line }

export const LINE_GROUPS: LineGroup[] = [
  {
    title: 'Tyne and Wear Passenger Transport Executive (Nexus)',
    items: [
      {
        type: 'lines',
        title: 'Tyne and Wear Metro',
        lines: ['Green', 'Orange'],
      },
    ],
  },
]

export const METADATA: Metadata = {
  icons: {
    icon: '/api/city-icon/taw',
    apple: '/api/city-icon/taw',
  },
  title: 'Tyne and Wear Metro Memory',
  description: 'How many Tyne and Wear Metro stops can you name from memory?',
  openGraph: {
    title: 'Tyne and Wear Metro Memory',
    description: 'How many Tyne and Wear Metro stops can you name from memory?',
    type: 'website',
    locale: 'en_GB',
    url: 'https://metro-memory.com/europe/uk/taw',
  },
}

export const MAP_CONFIG: MapboxOptions = {
  container: 'map',
  style: 'mapbox://styles/benjamintd/cls31ijdo010o01plcpzag11d',
  bounds: [
    [-1.8, 54.85],
    [-1.3, 55.1],
  ],
  maxBounds: [
    [-1.9, 54.8],
    [-1.2, 55.2],
  ],
  minZoom: 10.8,
  fadeDuration: 50,
}

export const CITY_NAME = 'taw'

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
