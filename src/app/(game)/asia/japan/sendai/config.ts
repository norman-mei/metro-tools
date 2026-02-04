import { Metadata } from 'next'
import type { MapboxOptions } from 'mapbox-gl'

import { Config, Line, LineGroup } from '@/lib/types'

import linesData from './data/lines.json'

export const LINES = linesData as { [name: string]: Line }

export const LINE_GROUPS: LineGroup[] = [
  {
    title: 'sendai City Transportation Bureau',
    items: [
      {
        type: 'lines',
        title: 'Sendai Subway',
        lines: ['Namboku', 'Tozai'],
      },
    ],
  },
]

export const METADATA: Metadata = {
  icons: {
    icon: '/api/city-icon/sendai',
    apple: '/api/city-icon/sendai',
  },
  title: 'Sendai (仙台) Metro Memory',
  description: 'How many Sendai City Transportation Bureau stations can you name from memory?',
  openGraph: {
    title: 'Sendai (仙台) Metro Memory',
    description: 'How many Sendai City Transportation Bureau stations can you name from memory?',
    type: 'website',
    locale: 'ja_JP',
    url: 'https://metro-memory.com/asia/japan/sendai',
  },
}

export const MAP_CONFIG: MapboxOptions = {
  container: 'map',
  style: 'mapbox://styles/benjamintd/clqaydk86007a01qr445u7p8i',
  bounds: [
    [140.834721, 38.2085488],
    [140.9489993, 38.3238718],
  ],
  maxBounds: [
    [140.534721, 37.9085488],
    [141.2489993, 38.6238718],
  ],
  minZoom: 10,
  fadeDuration: 50,
}

export const CITY_NAME = 'sendai'

export const LOCALE = 'jp'

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
