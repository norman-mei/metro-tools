import { Metadata } from 'next'
import { MapboxOptions } from 'mapbox-gl'
import { Config, Line, LineGroup } from '@/lib/types'
import linesData from './data/lines.json'


export const LINES = linesData as { [name: string]: Line }

export const LINE_GROUPS: LineGroup[] = [
  {
    title: 'Metro Transit',
    items: [
      {
        type: 'lines',
        title: 'MetroLink',
        lines: ['Red_Line_(BART)', 'Blue_Line_(BART)'],
      },
      {
        type: 'lines',
        title: 'Loop Trolley',
        lines: ['LoopTrolley'],
      },
    ],
  },
]

export const METADATA: Metadata = {
  icons: {
    icon: '/api/city-icon/stl',
    apple: '/api/city-icon/stl',
  },
  title: 'St. Louis Metro Memory',
  description: 'How many of the St. Louis MetroLink stations can you name from memory?',
  openGraph: {
    title: 'St. Louis Metro Memory',
    description: 'How many of the St. Louis MetroLink stations can you name from memory?',
    type: 'website',
    locale: 'en_US',
    url: 'https://metro-memory.com/north-america/usa/stl',
  },
}

export const MAP_CONFIG: MapboxOptions = {
  container: 'map',
  style: 'mapbox://styles/benjamintd/cls31ijdo010o01plcpzag11d',
  bounds: [
    [-90.45, 38.5],
    [-89.75, 38.82],
  ],
  maxBounds: [
    [-90.8, 38.3],
    [-89.5, 39.0],
  ],
  minZoom: 10,
  fadeDuration: 50,
}


export const CITY_NAME = 'stl'

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
