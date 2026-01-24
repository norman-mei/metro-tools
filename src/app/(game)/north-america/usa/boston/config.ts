import { Config, Line, LineGroup } from '@/lib/types'
import { MapboxOptions } from 'mapbox-gl'
import { Metadata } from 'next'
import linesData from './data/lines.json'


export const LINES = linesData as { [name: string]: Line }

export const LINE_GROUPS: LineGroup[] = [
  {
    title: 'Subway',
    items: [
      {
        type: 'lines',
        lines: [
          'MBTATMetroRedLine',
          'MBTATMetroBlueLine',
          'MBTATMetroOrangeLine',
        ],
      },
    ],
  },
  {
    items: [{ type: 'separator' }],
  },
  {
    title: 'Light Rail',
    items: [
      {
        type: 'lines',
        lines: [
          'MBTATMetroGreenBLine',
          'MBTATGreenCLine',
          'MBTATGreenDLine',
          'MBTATGreenELine',
          'MBTATMetroRedMLine',
        ],
      },
    ],
  },
  {
    items: [{ type: 'separator' }],
  },
  {
    title: 'Commuter Rail',
    items: [
      {
        type: 'lines',
        lines: [
          'Fa',
          'Fb',
          'Fr',
          'H',
          'L',
          'Ne',
          'Nr',
          'GB',
          'KT',
          'FB',
          'P',
          'W',
        ],
      },
    ],
  },
  {
    items: [{ type: 'separator' }],
  },
  {
    title: 'CapeFLYER',
    items: [
      {
        type: 'lines',
        lines: ['CapeFlyer'],
      },
    ],
  },
]

export const METADATA: Metadata = {
  icons: {
    icon: '/api/city-icon/boston',
    apple: '/api/city-icon/boston',
  },
  title: 'Boston Metro Memory',
  description:
    'How many of the Boston metro stations can you name from memory?',
  openGraph: {
    title: 'Boston Metro Memory',
    description:
      'How many of the Boston metro stations can you name from memory?',
    type: 'website',
    locale: 'en_US',
    url: 'https://metro-memory.com/north-america/usa/boston',
  },
}

export const MAP_CONFIG: MapboxOptions = {
  container: 'map',
  style: 'mapbox://styles/benjamintd/cls31ijdo010o01plcpzag11d',
  bounds: [
    [-71.547818, 42.13603],
    [-70.572781, 42.569886],
  ],
  maxBounds: [
    [-72.547818, 41.13603],
    [-69.572781, 43.569886],
  ],
  minZoom: 6,
  fadeDuration: 50,
}


export const CITY_NAME = 'boston'

export const LOCALE = 'en'

export const GAUGE_COLORS = 'inverted'

export const MAP_FROM_DATA = true

const config: Config = {
  GAUGE_COLORS,
  LOCALE,
  CITY_NAME,
  MAP_CONFIG,
  METADATA,
  LINES,
  LINE_GROUPS,
  MAP_FROM_DATA,
}

export default config
