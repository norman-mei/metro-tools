import { Metadata } from 'next'
import { MapboxOptions } from 'mapbox-gl'
import { Config, Line, LineGroup } from '@/lib/types'
import linesData from './data/lines.json'


export const LINES = linesData as { [name: string]: Line }

export const LINE_GROUPS: LineGroup[] = [
  {
    title: 'Memphis Area Transit Authority (MATA)',
    items: [
      {
        type: 'lines',
        title: 'MATA Trolley',
        lines: ['MAXRed', 'MAXGreen', 'MAXYellow'],
      },
    ],
  },
]

export const METADATA: Metadata = {
  icons: {
    icon: '/api/city-icon/memphis',
    apple: '/api/city-icon/memphis',
  },
  title: 'Memphis Metro Memory',
  description:
    'How many of the Memphis MATA Trolley stops can you name from memory?',
  openGraph: {
    title: 'Memphis Metro Memory',
    description:
      'How many of the Memphis MATA Trolley stops can you name from memory?',
    type: 'website',
    locale: 'en_US',
    url: 'https://metro-memory.com/memphis',
  },
}

export const MAP_CONFIG: MapboxOptions = {
  container: 'map',
  style: 'mapbox://styles/benjamintd/cls31ijdo010o01plcpzag11d',
  bounds: [
    [-90.0708, 35.122],
    [-90.0075, 35.1652],
  ],
  maxBounds: [
    [-90.0808, 35.112],
    [-89.9975, 35.1752],
  ],
  minZoom: 12,
  fadeDuration: 50,
}


export const CITY_NAME = 'memphis'

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
