import { Metadata } from 'next'
import { MapboxOptions } from 'mapbox-gl'
import { Config, Line, LineGroup } from '@/lib/types'
import linesData from './data/lines.json'


export const LINES = linesData as { [name: string]: Line }

export const LINE_GROUPS: LineGroup[] = [
  {
    title: 'Pittsburgh Regional Transit (PRT)',
    items: [
      {
        type: 'lines',
        lines: ['RD', 'SV', 'BL'],
      },
    ],
  },
  {
    title: 'Allegheny County Airport Authority (ACAA)',
    items: [
      {
        type: 'lines',
        title: 'Pittsburgh International Airport People Mover System',
        lines: ['pittsburghAPM'],
      },
    ],
  },
]

export const METADATA: Metadata = {
  title: 'Pittsburgh Metro Memory',
  description:
    'How many of the Pittsburgh “T” light-rail stations can you name from memory?',
  openGraph: {
    title: 'Pittsburgh Metro Memory',
    description:
      'How many of the Pittsburgh “T” light-rail stations can you name from memory?',
    type: 'website',
    locale: 'en_US',
    url: 'https://metro-memory.com/pittsburgh',
  },
}

export const MAP_CONFIG: MapboxOptions = {
  container: 'map',
  style: 'mapbox://styles/benjamintd/cls31ijdo010o01plcpzag11d',
  bounds: [
    [-80.08, 40.33],
    [-79.83, 40.48],
  ],
  maxBounds: [
    [-80.25, 40.2],
    [-79.6, 40.6],
  ],
  minZoom: 11,
  fadeDuration: 50,
}


export const CITY_NAME = 'pittsburgh'

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
