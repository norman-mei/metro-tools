import { Metadata } from 'next'
import { MapboxOptions } from 'mapbox-gl'
import { Config, Line, LineGroup } from '@/lib/types'
import linesData from './data/lines.json'

export const LINES = linesData as { [name: string]: Line }

export const LINE_GROUPS: LineGroup[] = [
  {
    title: 'Nottingham City Council',
    items: [
      {
        type: 'lines',
        title: 'Nottingham Express Transit (NET)',
        lines: ['Line1', 'Line2'],
      },
    ],
  },
]

export const METADATA: Metadata = {
  icons: {
    icon: '/api/city-icon/nottingham',
    apple: '/api/city-icon/nottingham',
  },
  title: 'Nottingham NET Memory',
  description: 'How many Nottingham Express Transit stops can you name?',
  openGraph: {
    title: 'Nottingham NET Memory',
    description: 'How many Nottingham Express Transit stops can you name?',
    type: 'website',
    locale: 'en_GB',
    url: 'https://metro-memory.com/nottingham',
  },
}

export const MAP_CONFIG: MapboxOptions = {
  container: 'map',
  style: 'mapbox://styles/benjamintd/cls31ijdo010o01plcpzag11d',
  bounds: [
    [-1.27, 52.89],
    [-1.13, 53.06],
  ],
  maxBounds: [
    [-1.35, 52.85],
    [-1.05, 53.1],
  ],
  minZoom: 10.5,
  fadeDuration: 50,
}

export const CITY_NAME = 'nottingham'

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
