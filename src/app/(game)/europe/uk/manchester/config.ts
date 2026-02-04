import { Metadata } from 'next'
import type { MapboxOptions } from 'mapbox-gl'
import { Config, Line, LineGroup } from '@/lib/types'
import linesData from './data/lines.json'

export const LINES = linesData as { [name: string]: Line }

export const LINE_GROUPS: LineGroup[] = [
  {
    title: 'Transport for Greater Manchester',
    items: [
      {
        type: 'lines',
        title: 'Manchester Metrolink',
        lines: ['Green', 'Purple', 'Cyan', 'Orange', 'Blue', 'Pink', 'Grey', 'Red'],
      },
    ],
  },
]

export const METADATA: Metadata = {
  icons: {
    icon: '/api/city-icon/manchester',
    apple: '/api/city-icon/manchester',
  },
  title: 'Manchester Metrolink Memory',
  description: 'How many Manchester Metrolink stops can you name from memory?',
  openGraph: {
    title: 'Manchester Metrolink Memory',
    description: 'How many Manchester Metrolink stops can you name from memory?',
    type: 'website',
    locale: 'en_GB',
    url: 'https://metro-memory.com/europe/uk/manchester',
  },
}

export const MAP_CONFIG: MapboxOptions = {
  container: 'map',
  style: 'mapbox://styles/benjamintd/cls31ijdo010o01plcpzag11d',
  bounds: [
    [-2.4, 53.35],
    [-2.05, 53.62],
  ],
  maxBounds: [
    [-2.55, 53.3],
    [-1.95, 53.68],
  ],
  minZoom: 10.7,
  fadeDuration: 50,
}

export const CITY_NAME = 'manchester'

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
