import { Metadata } from 'next'
import type { MapboxOptions } from 'mapbox-gl'
import { Config, Line, LineGroup } from '@/lib/types'

import linesData from './data/lines.json'

export const LINES = linesData as { [name: string]: Line }

export const LINE_GROUPS: LineGroup[] = [
  {
    title: 'Busan Transportation Corporation',
    items: [
      {
        type: 'lines',
        lines: ['busan1', 'busan2', 'busan3', 'busan4'],
      },
    ],
  },
  {
    title: 'Busan–Gimhae Light Rail Transit Operation Corporation (B&G Metro)',
    items: [
      {
        type: 'lines',
        lines: ['busanlrt'],
      },
    ],
  },
  {
    title: 'Haeundae Blue Line',
    items: [
      {
        type: 'lines',
        lines: ['busansky'],
      },
    ],
  },
  {
    title: 'Songdo Sea Cable Car Company',
    items: [
      {
        type: 'lines',
        lines: ['busancable'],
      },
    ],
  },
]

export const METADATA: Metadata = {
  icons: {
    icon: '/api/city-icon/busan',
    apple: '/api/city-icon/busan',
  },
  title: 'Busan Transportation Memory Game',
  description: 'How many Busan rail, sky capsule, and cable car stations can you name from memory?',
  openGraph: {
    title: 'Busan Transportation Memory Game',
    description: 'How many Busan rail, sky capsule, and cable car stations can you name from memory?',
    type: 'website',
    locale: 'ko_KR',
    url: 'https://metro-memory.com/asia/south-korea/busan',
  },
}

export const MAP_CONFIG: MapboxOptions = {
  container: 'map',
  style: 'mapbox://styles/benjamintd/clox61b80011o01qofw8s8hdv',
  bounds: [
    [128.8339, 35.0175],
    [129.2298, 35.3739],
  ],
  maxBounds: [
    [128.6139, 34.8475],
    [129.4498, 35.5439],
  ],
  minZoom: 9.25,
  fadeDuration: 50,
}

const config: Config = {
  MAP_FROM_DATA: true,
  LOCALE: 'ko',
  CITY_NAME: 'busan',
  MAP_CONFIG,
  METADATA,
  LINES,
  LINE_GROUPS,
}

export default config
