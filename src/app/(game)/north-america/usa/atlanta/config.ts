import { Metadata } from 'next'
import { MapboxOptions } from 'mapbox-gl'
import { Config, Line, LineGroup } from '@/lib/types'
import linesData from './data/lines.json'


export const LINES = linesData as { [name: string]: Line }

export const LINE_GROUPS: LineGroup[] = [
  {
    title: 'Metropolitan Atlanta Rapid Transit Authority (MARTA)',
    items: [
      {
        type: 'lines',
        lines: ['MARTARD', 'MARTABL', 'MARTAGD', 'MARTAGR', 'MARTASC'],
      },
    ],
  },
  {
    items: [{ type: 'separator' }],
  },
  {
    title: 'Atlanta Department of Aviation (ADA)',
    items: [
      {
        type: 'lines',
        title: 'The Plane Train',
        lines: ['atlantaTPT'],
      },
      {
        type: 'lines',
        title: 'ATL SkyTrain',
        lines: ['atlantaSKY'],
      },
    ],
  },
]

export const METADATA: Metadata = {
  icons: {
    icon: '/api/city-icon/atlanta',
    apple: '/api/city-icon/atlanta',
  },
  title: 'Atlanta Metro Memory',
  description: 'How many of the MARTA stations can you name from memory?',
  openGraph: {
    title: 'Atlanta Metro Memory',
    description: 'How many of the MARTA stations can you name from memory?',
    type: 'website',
    locale: 'en_US',
    url: 'https://metro-memory.com/north-america/usa/atlanta',
  },
}

export const MAP_CONFIG: MapboxOptions = {
  container: 'map',
  style: 'mapbox://styles/benjamintd/cls31ijdo010o01plcpzag11d',
  bounds: [
    [-84.57, 33.6],
    [-84.15, 33.95],
  ],
  maxBounds: [
    [-84.8, 33.45],
    [-83.9, 34.15],
  ],
  minZoom: 9,
  fadeDuration: 50,
}


export const CITY_NAME = 'atlanta'

export const LOCALE = 'en'

export const MAP_FROM_DATA = true

export const GAUGE_COLORS = 'inverted'

const config: Config = {
  MAP_FROM_DATA,
  GAUGE_COLORS,
  LOCALE,
  CITY_NAME,
  MAP_CONFIG,
  METADATA,
  LINES,
  LINE_GROUPS,
}

export default config
