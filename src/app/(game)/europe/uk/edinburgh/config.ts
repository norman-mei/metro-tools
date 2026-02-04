import { Metadata } from 'next'
import type { MapboxOptions } from 'mapbox-gl'
import { Config, Line, LineGroup } from '@/lib/types'
import linesData from './data/lines.json'


export const LINES = linesData as { [name: string]: Line }

export const LINE_GROUPS: LineGroup[] = [
  {
    title: 'Transport for Edinburgh (TfE)',
    items: [
      {
        type: 'lines',
        title: 'Edinburgh Trams',
        lines: ['EdinburghTram'],
      },
    ],
  },
]

export const METADATA: Metadata = {
  icons: {
    icon: '/api/city-icon/edinburgh',
    apple: '/api/city-icon/edinburgh',
  },
  title: 'Edinburgh Tram Memory Game',
  description: 'How many stops along the Edinburgh Tram can you remember?',
  openGraph: {
    title: 'Edinburgh Tram Memory Game',
    description: 'How many stops along the Edinburgh Tram can you remember?',
    type: 'website',
    locale: 'en_GB',
    url: 'https://metro-memory.com/europe/uk/edinburgh',
  },
}

export const MAP_CONFIG: MapboxOptions = {
  container: 'map',
  style: 'mapbox://styles/benjamintd/cls31ijdo010o01plcpzag11d',
  bounds: [
    [-3.37, 55.92],
    [-3.16, 55.99],
  ],
  maxBounds: [
    [-3.6, 55.85],
    [-2.95, 56.1],
  ],
  minZoom: 11,
  fadeDuration: 50,
}


export const CITY_NAME = 'edinburgh'

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
