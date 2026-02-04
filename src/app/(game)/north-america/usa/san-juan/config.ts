import { Metadata } from 'next'
import type { MapboxOptions } from 'mapbox-gl'
import { Config, Line, LineGroup } from '@/lib/types'
import linesData from './data/lines.json'


export const LINES = linesData as { [name: string]: Line }

export const LINE_GROUPS: LineGroup[] = [
  {
    title: 'Departamento de Transportación y Obras Públicas (DTOP)',
    items: [
      {
        type: 'lines',
        title: 'Tren Urbano',
        lines: ['TU'],
      },
    ],
  },
]

export const METADATA: Metadata = {
  icons: {
    icon: '/api/city-icon/san-juan',
    apple: '/api/city-icon/san-juan',
  },
  title: 'San Juan Metro Memory',
  description: 'How many Tren Urbano stations in San Juan can you name from memory?',
  openGraph: {
    title: 'San Juan Metro Memory',
    description: 'How many Tren Urbano stations in San Juan can you name from memory?',
    type: 'website',
    locale: 'en_US',
    url: 'https://metro-memory.com/north-america/usa/san-juan',
  },
}

export const MAP_CONFIG: MapboxOptions = {
  container: 'map',
  style: 'mapbox://styles/benjamintd/cls31ijdo010o01plcpzag11d',
  bounds: [
    [-66.2, 18.35],
    [-66.0, 18.47],
  ],
  maxBounds: [
    [-66.3, 18.3],
    [-65.9, 18.55],
  ],
  minZoom: 11,
  fadeDuration: 50,
}


export const CITY_NAME = 'san-juan'

export const LOCALE = 'en'

export const MAP_FROM_DATA = true

export const GAUGE_COLORS = 'inverted'

const config: Config = {
  MAP_FROM_DATA,
  GAUGE_COLORS,
  LOCALE,
  CITY_NAME,
  MAP_CONFIG,
  METADATA,
  LINES,
  LINE_GROUPS,
}

export default config
