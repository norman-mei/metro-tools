import { Metadata } from 'next'
import type { MapboxOptions } from 'mapbox-gl'

import { Config, Line, LineGroup } from '@/lib/types'

import linesData from './data/lines.json'

export const LINES = linesData as { [name: string]: Line }

export const LINE_GROUPS: LineGroup[] = [
  {
    title: 'Okayama Electric Tramway Co., Ltd.',
    items: [
      {
        type: 'lines',
        lines: ['Higashiyama', 'Seikibashi'],
      },
    ],
  },
]

export const METADATA: Metadata = {
  icons: {
    icon: '/api/city-icon/okayama',
    apple: '/api/city-icon/okayama',
  },
  title: 'Okayama (岡山) Metro Memory',
  description:
    'How many Okayama Electric Tramway Co., Ltd. stations can you name from memory?',
  openGraph: {
    title: 'Okayama (岡山) Metro Memory',
    description:
      'How many Okayama Electric Tramway Co., Ltd. stations can you name from memory?',
    type: 'website',
    locale: 'ja_JP',
    url: 'https://metro-memory.com/asia/japan/okayama',
  },
}

export const MAP_CONFIG: MapboxOptions = {
  container: 'map',
  style: 'mapbox://styles/benjamintd/clqaydk86007a01qr445u7p8i',
  bounds: [
    [133.9196063, 34.6517066],
    [133.9426758, 34.665664],
  ],
  maxBounds: [
    [133.6196063, 34.3517066],
    [134.2426758, 34.965664],
  ],
  minZoom: 11,
  fadeDuration: 50,
}

export const CITY_NAME = 'okayama'

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
