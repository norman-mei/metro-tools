import { Metadata } from 'next'
import { MapboxOptions } from 'mapbox-gl'
import { Config, Line, LineGroup } from '@/lib/types'
import linesData from './data/lines.json'


export const LINES = linesData as { [name: string]: Line }

export const LINE_GROUPS: LineGroup[] = [
  {
    title: 'Transdev',
    items: [
      {
        type: 'lines',
        title: 'The Hop',
        lines: ['TheHopL', 'TheHopM'],
      },
    ],
  },
]

export const METADATA: Metadata = {
  title: 'Milwaukee Metro Memory',
  description: 'How many of The Hop streetcar stops can you name from memory?',
  openGraph: {
    title: 'Milwaukee Metro Memory',
    description: 'How many of The Hop streetcar stops can you name from memory?',
    type: 'website',
    locale: 'en_US',
    url: 'https://metro-memory.com/milwaukee',
  },
}

export const MAP_CONFIG: MapboxOptions = {
  container: 'map',
  style: 'mapbox://styles/benjamintd/cls31ijdo010o01plcpzag11d',
  bounds: [
    [-87.926, 43.03],
    [-87.895, 43.05],
  ],
  maxBounds: [
    [-87.94, 43.025],
    [-87.88, 43.06],
  ],
  minZoom: 13,
  fadeDuration: 50,
}


export const CITY_NAME = 'milwaukee'

export const LOCALE = 'en'

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
