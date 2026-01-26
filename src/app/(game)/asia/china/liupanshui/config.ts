import { Metadata } from 'next'
import { MapboxOptions } from 'mapbox-gl'
import { Config, Line, LineGroup } from '@/lib/types'

import linesData from './data/lines.json'

export const LINES = linesData as { [name: string]: Line }

export const LINE_GROUPS: LineGroup[] = [
  {
    title: 'Liupanshui Tourism Monorail',
    items: [
      {
        type: 'lines',
        lines: ['liupanshui-monorail'],
      },
    ],
  },
]

export const METADATA: Metadata = {
  icons: {
    icon: '/api/city-icon/liupanshui',
    apple: '/api/city-icon/liupanshui',
  },
  title: 'Liupanshui Tourism Monorail Memory Game',
  description: 'How many Liupanshui Tourism Monorail stations can you name from memory?',
  openGraph: {
    title: 'Liupanshui Tourism Monorail Memory Game',
    description: 'How many Liupanshui Tourism Monorail stations can you name from memory?',
    type: 'website',
    locale: 'en_US',
    url: 'https://metro-memory.com/asia/china/liupanshui',
  },
}

export const MAP_CONFIG: MapboxOptions = {
  container: 'map',
  style: 'mapbox://styles/benjamintd/cls31ijdo010o01plcpzag11d',
  bounds: [
    [104.77, 26.443],
    [104.82, 26.47],
  ],
  maxBounds: [
    [104.74, 26.42],
    [104.85, 26.49],
  ],
  minZoom: 12.5,
  fadeDuration: 50,
}

const config: Config = {
  MAP_FROM_DATA: true,
  LOCALE: 'en',
  CITY_NAME: 'liupanshui',
  MAP_CONFIG,
  METADATA,
  LINES,
  LINE_GROUPS,
}

export default config
