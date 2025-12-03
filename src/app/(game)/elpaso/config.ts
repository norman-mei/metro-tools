import { Metadata } from 'next'
import { MapboxOptions } from 'mapbox-gl'
import { Config, Line, LineGroup } from '@/lib/types'
import linesData from './data/lines.json'


export const LINES = linesData as { [name: string]: Line }

export const LINE_GROUPS: LineGroup[] = [
  {
    title: 'Sun Metro',
    items: [
      {
        type: 'lines',
        lines: ['Elpasouptownloop', 'Elpasodowntownloop'],
      },
    ],
  },
]

export const METADATA: Metadata = {
  icons: {
    icon: '/api/city-icon/elpaso',
    apple: '/api/city-icon/elpaso',
  },
  title: 'El Paso Metro Memory',
  description: 'How many of the El Paso Streetcar stops can you name from memory?',
  openGraph: {
    title: 'El Paso Metro Memory',
    description: 'How many of the El Paso Streetcar stops can you name from memory?',
    type: 'website',
    locale: 'en_US',
    url: 'https://metro-memory.com/elpaso',
  },
}

export const MAP_CONFIG: MapboxOptions = {
  container: 'map',
  style: 'mapbox://styles/benjamintd/cls31ijdo010o01plcpzag11d',
  bounds: [
    [-106.51, 31.75],
    [-106.48, 31.78],
  ],
  maxBounds: [
    [-106.55, 31.73],
    [-106.45, 31.81],
  ],
  minZoom: 13,
  fadeDuration: 50,
}


export const CITY_NAME = 'elpaso'

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
