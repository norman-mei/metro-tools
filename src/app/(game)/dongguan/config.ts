import { Metadata } from 'next'
import { MapboxOptions } from 'mapbox-gl'
import { Config, Line, LineGroup } from '@/lib/types'
import linesData from './data/lines.json'

export const LINES = linesData as { [name: string]: Line }

export const LINE_GROUPS: LineGroup[] = [
  {
    title: 'Dongguan Rail Transit',
    items: [
      {
        type: 'lines',
        title: 'Line 2',
        lines: ['dongguanline2'],
      },
    ],
  },
]

export const METADATA: Metadata = {
  icons: {
    icon: '/api/city-icon/dongguan',
    apple: '/api/city-icon/dongguan',
  },
  title: 'Dongguan Metro Memory',
  description: 'How many Dongguan Rail Transit Line 2 stations can you name from memory?',
  openGraph: {
    title: 'Dongguan Metro Memory',
    description: 'How many Dongguan Rail Transit Line 2 stations can you name from memory?',
    type: 'website',
    locale: 'en_US',
    url: 'https://metro-memory.com/dongguan',
  },
}

export const MAP_CONFIG: MapboxOptions = {
  container: 'map',
  style: 'mapbox://styles/benjamintd/cls31ijdo010o01plcpzag11d',
  bounds: [
    [113.63, 22.84],
    [113.88, 23.11],
  ],
  maxBounds: [
    [113.55, 22.75],
    [113.95, 23.2],
  ],
  minZoom: 10,
  fadeDuration: 50,
}

export const CITY_NAME = 'dongguan'

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
