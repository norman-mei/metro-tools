import { Metadata } from 'next'
import { MapboxOptions } from 'mapbox-gl'
import { Config, Line, LineGroup } from '@/lib/types'
import linesData from './data/lines.json'


export const LINES = linesData as { [name: string]: Line }

export const LINE_GROUPS: LineGroup[] = [
  {
    title: 'Connector',
    items: [
      {
        type: 'lines',
        lines: ['100'],
      },
    ],
  },
  {
    items: [
      {
        type: 'separator',
      },
    ],
  },
  {
    title: 'Kenton County Airport Board (KCAB)',
    items: [
      {
        type: 'lines',
        lines: ['CincinnatiAPM'],
      },
    ],
  },
]

export const METADATA: Metadata = {
  icons: {
    icon: '/api/city-icon/cincinnati',
    apple: '/api/city-icon/cincinnati',
  },
  title: 'Cincinnati Metro Memory',
  description:
    'How many of the Cincinnati Connector streetcar and airport people mover stops can you name from memory?',
  openGraph: {
    title: 'Cincinnati Metro Memory',
    description:
      'How many of the Cincinnati Connector streetcar and airport people mover stops can you name from memory?',
    type: 'website',
    locale: 'en_US',
    url: 'https://metro-memory.com/north-america/usa/cincinnati',
  },
}

export const MAP_CONFIG: MapboxOptions = {
  container: 'map',
  style: 'mapbox://styles/benjamintd/cls31ijdo010o01plcpzag11d',
  bounds: [
    [-84.67, 39.05],
    [-84.49, 39.13],
  ],
  maxBounds: [
    [-84.75, 39.0],
    [-84.45, 39.18],
  ],
  minZoom: 11,
  fadeDuration: 50,
}


export const CITY_NAME = 'cincinnati'

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
