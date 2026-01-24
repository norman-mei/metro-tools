import { Metadata } from 'next'
import { MapboxOptions } from 'mapbox-gl'
import { Config, Line, LineGroup } from '@/lib/types'
import linesData from './data/lines.json'


export const LINES = linesData as { [name: string]: Line }

export const LINE_GROUPS: LineGroup[] = [
  {
    title: 'Capital Metropolitan Transportation Authority (CMTA)',
    items: [
      {
        type: 'lines',
        lines: ['RD'],
      },
    ],
  },
]

export const METADATA: Metadata = {
  icons: {
    icon: '/api/city-icon/austin',
    apple: '/api/city-icon/austin',
  },
  title: 'Austin Metro Memory',
  description:
    'How many of the Austin MetroRail stations can you name from memory?',
  openGraph: {
    title: 'Austin Metro Memory',
    description:
      'How many of the Austin MetroRail stations can you name from memory?',
    type: 'website',
    locale: 'en_US',
    url: 'https://metro-memory.com/north-america/usa/austin',
  },
}

export const MAP_CONFIG: MapboxOptions = {
  container: 'map',
  style: 'mapbox://styles/benjamintd/cls31ijdo010o01plcpzag11d',
  bounds: [
    [-97.9, 30.17],
    [-97.65, 30.62],
  ],
  maxBounds: [
    [-98.1, 30.0],
    [-97.4, 30.8],
  ],
  minZoom: 10,
  fadeDuration: 50,
}


export const CITY_NAME = 'austin'

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
