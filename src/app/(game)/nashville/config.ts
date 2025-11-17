import { Metadata } from 'next'
import { MapboxOptions } from 'mapbox-gl'
import { Config, Line, LineGroup } from '@/lib/types'
import linesData from './data/lines.json'


export const LINES = linesData as { [name: string]: Line }

export const LINE_GROUPS: LineGroup[] = [
  {
    title: 'Tennessee Department of Transportation (TDOT)',
    items: [
      {
        type: 'lines',
        lines: ['WGS'],
      },
    ],
  },
]

export const METADATA: Metadata = {
  title: 'Nashville Metro Memory',
  description:
    'How many of the Nashville WeGo Star stations can you name from memory?',
  openGraph: {
    title: 'Nashville Metro Memory',
    description:
      'How many of the Nashville WeGo Star stations can you name from memory?',
    type: 'website',
    locale: 'en_US',
    url: 'https://metro-memory.com/nashville',
  },
}

export const MAP_CONFIG: MapboxOptions = {
  container: 'map',
  style: 'mapbox://styles/benjamintd/cls31ijdo010o01plcpzag11d',
  bounds: [
    [-86.9, 36.05],
    [-86.2, 36.28],
  ],
  maxBounds: [
    [-87.1, 35.9],
    [-86.0, 36.4],
  ],
  minZoom: 10,
  fadeDuration: 50,
}


export const CITY_NAME = 'nashville'

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
