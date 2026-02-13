import { Metadata } from 'next'
import type { MapboxOptions } from 'mapbox-gl'
import { Config, Line, LineGroup } from '@/lib/types'

import linesData from './data/lines.json'

export const LINES = linesData as { [name: string]: Line }

export const LINE_GROUPS: LineGroup[] = [
  {
    title: 'Daegu Transportation Corporation',
    items: [
      {
        type: 'lines',
        title: 'Daegu Metro',
        lines: ['daegu1', 'daegu2', 'daegu3'],
      },
    ],
  },
]

export const METADATA: Metadata = {
  icons: {
    icon: '/api/city-icon/daegu',
    apple: '/api/city-icon/daegu',
  },
  title: 'Daegu Metro Memory Game',
  description: 'How many Daegu Metro stations can you name from memory?',
  openGraph: {
    title: 'Daegu Metro Memory Game',
    description: 'How many Daegu Metro stations can you name from memory?',
    type: 'website',
    locale: 'ko_KR',
    url: 'https://metro-memory.com/asia/south-korea/daegu',
  },
}

export const MAP_CONFIG: MapboxOptions = {
  container: 'map',
  style: 'mapbox://styles/benjamintd/clox61b80011o01qofw8s8hdv',
  bounds: [
    [128.43, 35.79],
    [128.77, 35.97],
  ],
  maxBounds: [
    [128.33, 35.69],
    [128.87, 36.07],
  ],
  minZoom: 9.25,
  fadeDuration: 50,
}

const config: Config = {
  MAP_FROM_DATA: true,
  LOCALE: 'ko',
  CITY_NAME: 'daegu',
  MAP_CONFIG,
  METADATA,
  LINES,
  LINE_GROUPS,
}

export default config
