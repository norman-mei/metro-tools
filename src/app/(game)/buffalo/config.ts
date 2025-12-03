import { Metadata } from 'next'
import { MapboxOptions } from 'mapbox-gl'
import { Config, Line, LineGroup } from '@/lib/types'
import linesData from './data/lines.json'

export const GAUGE_COLORS = 'inverted'

export const LINES = linesData as { [name: string]: Line }

export const LINE_GROUPS: LineGroup[] = [
  {
    title: 'Niagara Frontier Transportation Authority (NFTA)',
    items: [
      {
        type: 'lines',
        lines: ['MR'],
      },
    ],
  },
]

export const METADATA: Metadata = {
  icons: {
    icon: '/api/city-icon/buffalo',
    apple: '/api/city-icon/buffalo',
  },
  title: 'Buffalo Metro Memory',
  description:
    'How many of the Buffalo Metro Rail stations can you name from memory?',
  openGraph: {
    title: 'Buffalo Metro Memory',
    description:
      'How many of the Buffalo Metro Rail stations can you name from memory?',
    type: 'website',
    locale: 'en_US',
    url: 'https://metro-memory.com/buffalo',
  },
}

export const MAP_CONFIG: MapboxOptions = {
  container: 'map',
  style: 'mapbox://styles/benjamintd/cls31ijdo010o01plcpzag11d',
  bounds: [
    [-78.99, 42.82],
    [-78.7, 43.08],
  ],
  maxBounds: [
    [-79.2, 42.6],
    [-78.5, 43.3],
  ],
  minZoom: 9,
  fadeDuration: 50,
}


export const CITY_NAME = 'buffalo'

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
  GAUGE_COLORS,
}

export default config
