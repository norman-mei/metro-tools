import { Metadata } from 'next'
import { MapboxOptions } from 'mapbox-gl'
import { Config, Line, LineGroup } from '@/lib/types'
import linesData from './data/lines.json'


export const LINES = linesData as { [name: string]: Line }

export const LINE_GROUPS: LineGroup[] = [
  {
    title: 'Hampton Roads Transit (HRT)',
    items: [
      {
        type: 'lines',
        lines: ['TT'],
      },
    ],
  },
]

export const METADATA: Metadata = {
  title: 'Norfolk Metro Memory',
  description:
    'How many of the Norfolk Tide light rail stations can you name from memory?',
  openGraph: {
    title: 'Norfolk Metro Memory',
    description:
      'How many of the Norfolk Tide light rail stations can you name from memory?',
    type: 'website',
    locale: 'en_US',
    url: 'https://metro-memory.com/norfolk',
  },
}

export const MAP_CONFIG: MapboxOptions = {
  container: 'map',
  style: 'mapbox://styles/benjamintd/cls31ijdo010o01plcpzag11d',
  bounds: [
    [-76.32, 36.83],
    [-76.18, 36.87],
  ],
  maxBounds: [
    [-76.35, 36.82],
    [-76.15, 36.89],
  ],
  minZoom: 12,
  fadeDuration: 50,
}


export const CITY_NAME = 'norfolk'

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
