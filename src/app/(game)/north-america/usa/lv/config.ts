import { Metadata } from 'next'
import type { MapboxOptions } from 'mapbox-gl'
import { Config, Line, LineGroup } from '@/lib/types'
import linesData from './data/lines.json'


export const LINES = linesData as { [name: string]: Line }

export const LINE_GROUPS: LineGroup[] = [
  {
    title: 'Las Vegas Convention and Visitors Authority (LVCVA)',
    items: [
      {
        type: 'lines',
        lines: ['LVM'],
      },
    ],
  },
  {
    items: [{ type: 'separator' }],
  },
  {
    title: 'Clark County Department of Aviation (CCDA)',
    items: [
      {
        type: 'lines',
        title: 'Harry Reid International Airport People Movers',
        lines: ['LVGreen', 'LVBlue', 'LVRed'],
      },
    ],
  },
]

export const METADATA: Metadata = {
  icons: {
    icon: '/api/city-icon/lv',
    apple: '/api/city-icon/lv',
  },
  title: 'Las Vegas Metro Memory',
  description:
    'How many of the Las Vegas Monorail stations can you name from memory?',
  openGraph: {
    title: 'Las Vegas Metro Memory',
    description:
      'How many of the Las Vegas Monorail stations can you name from memory?',
    type: 'website',
    locale: 'en_US',
    url: 'https://metro-memory.com/north-america/usa/lv',
  },
}

export const MAP_CONFIG: MapboxOptions = {
  container: 'map',
  style: 'mapbox://styles/benjamintd/cls31ijdo010o01plcpzag11d',
  bounds: [
    [-115.175, 36.095],
    [-115.145, 36.15],
  ],
  maxBounds: [
    [-115.22, 36.07],
    [-115.12, 36.18],
  ],
  minZoom: 12,
  fadeDuration: 50,
}


export const CITY_NAME = 'lv'

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
