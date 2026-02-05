import { Metadata } from 'next'
import type { MapboxOptions } from 'mapbox-gl'

import { Config, Line, LineGroup } from '@/lib/types'

import linesData from './data/lines.json'

export const LINES = linesData as { [name: string]: Line }

export const LINE_GROUPS: LineGroup[] = [
  {
    title: 'Fukuoka City Transportation Bureau',
    items: [
      {
        type: 'lines',
        title: 'Fukuoka City Subway',
        lines: ['Kuko', 'Hakozaki', 'Nanakuma'],
      },
    ],
  },
]

export const METADATA: Metadata = {
  icons: {
    icon: '/api/city-icon/fukuoka',
    apple: '/api/city-icon/fukuoka',
  },
  title: 'Fukuoka (福岡) Metro Memory',
  description: 'How many Fukuoka City Transportation Bureau stations can you name from memory?',
  openGraph: {
    title: 'Fukuoka (福岡) Metro Memory',
    description: 'How many Fukuoka City Transportation Bureau stations can you name from memory?',
    type: 'website',
    locale: 'ja_JP',
    url: 'https://metro-memory.com/asia/japan/fukuoka',
  },
}

export const MAP_CONFIG: MapboxOptions = {
  container: 'map',
  style: 'mapbox://styles/benjamintd/clqaydk86007a01qr445u7p8i',
  bounds: [
    [130.3205201, 33.5451199],
    [130.4485621, 33.6327319],
  ],
  maxBounds: [
    [130.0205201, 33.2451199],
    [130.7485621, 33.9327319],
  ],
  minZoom: 10,
  fadeDuration: 50,
}

export const CITY_NAME = 'fukuoka'

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
