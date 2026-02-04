import { Metadata } from 'next'
import type { MapboxOptions } from 'mapbox-gl'
import { Config, Line, LineGroup } from '@/lib/types'
import linesData from './data/lines.json'


export const LINES = linesData as { [name: string]: Line }

export const LINE_GROUPS: LineGroup[] = [
  {
    title: 'Blackpool Transport Services Limited',
    items: [
      {
        type: 'lines',
        title: 'Blackpool Tramway',
        lines: ['blackpoolT1', 'blackpoolT2', 'blackpoolT3', 'blackpoolheritage'],
      },
    ],
  },
]

export const METADATA: Metadata = {
  icons: {
    icon: '/api/city-icon/blackpool',
    apple: '/api/city-icon/blackpool',
  },
  title: 'Blackpool Tram Memory Game',
  description: 'How many Blackpool tram stops can you remember?',
  openGraph: {
    title: 'Blackpool Tram Memory Game',
    description: 'How many Blackpool tram stops can you remember?',
    type: 'website',
    locale: 'en_GB',
    url: 'https://metro-memory.com/europe/uk/blackpool',
  },
}

export const MAP_CONFIG: MapboxOptions = {
  container: 'map',
  style: 'mapbox://styles/benjamintd/cls31ijdo010o01plcpzag11d',
  bounds: [
    [-3.11, 53.76],
    [-3.0, 53.95],
  ],
  maxBounds: [
    [-3.2, 53.72],
    [-2.9, 53.99],
  ],
  minZoom: 11,
  fadeDuration: 50,
}


export const CITY_NAME = 'blackpool'

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
