import { Metadata } from 'next'
import type { MapboxOptions } from 'mapbox-gl'
import { Config, Line, LineGroup } from '@/lib/types'
import linesData from './data/lines.json'

export const LINES = linesData as { [name: string]: Line }

export const LINE_GROUPS: LineGroup[] = [
  {
    title: "Hanoi People's Committee",
    items: [
      {
        type: 'lines',
        title: 'Hanoi Metro',
        lines: ['Hanoi2A', 'Hanoi3'],
      },
    ],
  },
]

export const METADATA: Metadata = {
  icons: {
    icon: '/api/city-icon/hanoi',
    apple: '/api/city-icon/hanoi',
  },
  title: 'Hanoi Metro Memory',
  description: 'How many Hanoi Metro stops can you name from memory?',
  openGraph: {
    title: 'Hanoi Metro Memory',
    description: 'How many Hanoi Metro stops can you name from memory?',
    type: 'website',
    locale: 'en_US',
    url: 'https://metro-memory.com/asia/vietnam/hanoi',
  },
}

export const MAP_CONFIG: MapboxOptions = {
  container: 'map',
  style: 'mapbox://styles/benjamintd/cls31ijdo010o01plcpzag11d',
  bounds: [
    [105.73, 20.95],
    [105.91, 21.08],
  ],
  maxBounds: [
    [105.7, 20.92],
    [105.94, 21.1],
  ],
  minZoom: 11,
  fadeDuration: 50,
}

export const CITY_NAME = 'hanoi'

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
