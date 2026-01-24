import { Metadata } from 'next'
import { MapboxOptions } from 'mapbox-gl'
import { Config, Line, LineGroup } from '@/lib/types'
import linesData from './data/lines.json'


export const LINES = linesData as { [name: string]: Line }

export const LINE_GROUPS: LineGroup[] = [
  {
    title: 'Honolulu Department of Transportation Services (HDTS)',
    items: [
      {
        type: 'lines',
        lines: ['SKY'],
      },
    ],
  },
]

export const METADATA: Metadata = {
  icons: {
    icon: '/api/city-icon/honolulu',
    apple: '/api/city-icon/honolulu',
  },
  title: 'Honolulu Metro Memory',
  description:
    'How many of the Honolulu Skyline stations can you name from memory?',
  openGraph: {
    title: 'Honolulu Metro Memory',
    description:
      'How many of the Honolulu Skyline stations can you name from memory?',
    type: 'website',
    locale: 'en_US',
    url: 'https://metro-memory.com/north-america/usa/honolulu',
  },
}

export const MAP_CONFIG: MapboxOptions = {
  container: 'map',
  style: 'mapbox://styles/benjamintd/cls31ijdo010o01plcpzag11d',
  bounds: [
    [-158.07, 21.28],
    [-157.83, 21.41],
  ],
  maxBounds: [
    [-158.2, 21.25],
    [-157.7, 21.45],
  ],
  minZoom: 11,
  fadeDuration: 50,
}


export const CITY_NAME = 'honolulu'

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
