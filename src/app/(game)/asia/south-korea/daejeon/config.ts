import { Metadata } from 'next'
import type { MapboxOptions } from 'mapbox-gl'
import { Config, Line, LineGroup } from '@/lib/types'

import linesData from './data/lines.json'

export const LINES = linesData as { [name: string]: Line }

export const LINE_GROUPS: LineGroup[] = [
  {
    title: 'Daejeon Metropolitan Express Transit Corporation',
    items: [
      {
        type: 'lines',
        title: 'Daejeon Metro',
        lines: ['daejeon1', 'daejeon2'],
      },
    ],
  },
]

export const METADATA: Metadata = {
  icons: {
    icon: '/api/city-icon/daejeon',
    apple: '/api/city-icon/daejeon',
  },
  title: 'Daejeon Metro Memory Game',
  description: 'How many Daejeon Metro stations can you name from memory?',
  openGraph: {
    title: 'Daejeon Metro Memory Game',
    description: 'How many Daejeon Metro stations can you name from memory?',
    type: 'website',
    locale: 'ko_KR',
    url: 'https://metro-memory.com/asia/south-korea/daejeon',
  },
}

export const MAP_CONFIG: MapboxOptions = {
  container: 'map',
  style: 'mapbox://styles/benjamintd/clox61b80011o01qofw8s8hdv',
  bounds: [
    [127.3, 36.29],
    [127.47, 36.4],
  ],
  maxBounds: [
    [127.25, 36.24],
    [127.52, 36.45],
  ],
  minZoom: 10.5,
  fadeDuration: 50,
}

const config: Config = {
  MAP_FROM_DATA: true,
  LOCALE: 'ko',
  CITY_NAME: 'daejeon',
  MAP_CONFIG,
  METADATA,
  LINES,
  LINE_GROUPS,
}

export default config
