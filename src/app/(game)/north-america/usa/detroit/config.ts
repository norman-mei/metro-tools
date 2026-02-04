import { Metadata } from 'next'
import type { MapboxOptions } from 'mapbox-gl'
import { Config, Line, LineGroup } from '@/lib/types'
import linesData from './data/lines.json'


export const LINES = linesData as { [name: string]: Line }

export const LINE_GROUPS: LineGroup[] = [
  {
    title: 'Regional Transit Authority of Southeast Michigan (RTA)',
    items: [
      {
        type: 'lines',
        lines: ['QL'],
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
    title: 'Detroit Transportation Corporation (DTC)',
    items: [
      {
        type: 'lines',
        lines: ['DPM'],
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
    title: 'Wayne County Airport Authority (WCAA)',
    items: [
      {
        type: 'lines',
        lines: ['EXT'],
      },
    ],
  },
]

export const METADATA: Metadata = {
  icons: {
    icon: '/api/city-icon/detroit',
    apple: '/api/city-icon/detroit',
  },
  title: 'Detroit Metro Memory',
  description:
    'How many of the Detroit QLine, People Mover, and ExpressTram stations can you name from memory?',
  openGraph: {
    title: 'Detroit Metro Memory',
    description:
      'How many of the Detroit QLine, People Mover, and ExpressTram stations can you name from memory?',
    type: 'website',
    locale: 'en_US',
    url: 'https://metro-memory.com/north-america/usa/detroit',
  },
}

export const MAP_CONFIG: MapboxOptions = {
  container: 'map',
  style: 'mapbox://styles/benjamintd/cls31ijdo010o01plcpzag11d',
  bounds: [
    [-83.4, 42.2],
    [-82.95, 42.39],
  ],
  maxBounds: [
    [-83.5, 42.15],
    [-82.8, 42.5],
  ],
  minZoom: 10,
  fadeDuration: 50,
}


export const CITY_NAME = 'detroit'

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
