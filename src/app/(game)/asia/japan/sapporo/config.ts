import { Metadata } from 'next'
import type { MapboxOptions } from 'mapbox-gl'

import { Config, Line, LineGroup } from '@/lib/types'

import linesData from './data/lines.json'

export const LINES = linesData as { [name: string]: Line }

export const LINE_GROUPS: LineGroup[] = [
  {
    title: 'Sapporo City Transportation Bureau',
    items: [
      {
        type: 'lines',
        title: 'Sapporo Municipal Subway',
        lines: ['Namboku', 'Tozai', 'Toho'],
      },
      {
        type: 'lines',
        title: 'Sapporo Streetcar',
        lines: ['Streetcar'],
      },
    ],
  },
]

export const METADATA: Metadata = {
  icons: {
    icon: '/api/city-icon/sapporo',
    apple: '/api/city-icon/sapporo',
  },
  title: 'Sapporo (札幌) Metro Memory',
  description: 'How many Sapporo City Transportation Bureau stations can you name from memory?',
  openGraph: {
    title: 'Sapporo (札幌) Metro Memory',
    description: 'How many Sapporo City Transportation Bureau stations can you name from memory?',
    type: 'website',
    locale: 'ja_JP',
    url: 'https://metro-memory.com/asia/japan/sapporo',
  },
}

export const MAP_CONFIG: MapboxOptions = {
  container: 'map',
  style: 'mapbox://styles/benjamintd/clqaydk86007a01qr445u7p8i',
  bounds: [
    [141.2768834, 42.9871845],
    [141.4742812, 43.1136584],
  ],
  maxBounds: [
    [140.9768834, 42.6871845],
    [141.7742812, 43.4136584],
  ],
  minZoom: 9,
  fadeDuration: 50,
}

export const CITY_NAME = 'sapporo'

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
