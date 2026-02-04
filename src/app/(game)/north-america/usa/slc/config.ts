import { Metadata } from 'next'
import type { MapboxOptions } from 'mapbox-gl'
import { Config, Line, LineGroup } from '@/lib/types'
import linesData from './data/lines.json'


export const LINES = linesData as { [name: string]: Line }

export const LINE_GROUPS: LineGroup[] = [
  {
    title: 'Utah Transit Authority',
    items: [
      {
        type: 'lines',
        title: 'Transit Express (TRAX)',
        lines: ['UTARed', 'UTAGreen', 'UTABlue'],
      },
      {
        type: 'lines',
        title: 'S Line',
        lines: ['UTASLine'],
      },
      {
        type: 'lines',
        title: 'FrontRunner',
        lines: ['UTAFR'],
      },
    ],
  },
]

export const METADATA: Metadata = {
  icons: {
    icon: '/api/city-icon/slc',
    apple: '/api/city-icon/slc',
  },
  title: 'Salt Lake City Metro Memory',
  description: 'How many of Salt Lake City\'s rail stops can you name from memory?',
  openGraph: {
    title: 'Salt Lake City Metro Memory',
    description: 'How many of Salt Lake City\'s rail stops can you name from memory?',
    type: 'website',
    locale: 'en_US',
    url: 'https://metro-memory.com/north-america/usa/slc',
  },
}

export const MAP_CONFIG: MapboxOptions = {
  container: 'map',
  style: 'mapbox://styles/benjamintd/cls31ijdo010o01plcpzag11d',
  bounds: [
    [-112.1, 40.2],
    [-111.4, 41.3],
  ],
  maxBounds: [
    [-112.4, 40.0],
    [-111.2, 41.5],
  ],
  minZoom: 9,
  fadeDuration: 50,
}


export const CITY_NAME = 'slc'

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
