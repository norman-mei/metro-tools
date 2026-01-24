import { Metadata } from 'next'
import { MapboxOptions } from 'mapbox-gl'
import { Config, Line, LineGroup } from '@/lib/types'
import linesData from './data/lines.json'


export const LINES = linesData as { [name: string]: Line }

export const LINE_GROUPS: LineGroup[] = [
  {
    title: 'OC Transpo',
    items: [
      {
        type: 'lines',
        title: 'O-Train',
        lines: ['OTrainLine1', 'OTrainLine2', 'OTrainLine3', 'OTrainLine4'],
      },
    ],
  },
]

export const METADATA: Metadata = {
  icons: {
    icon: '/api/city-icon/ottawa',
    apple: '/api/city-icon/ottawa',
  },
  title: 'Ottawa Metro Memory – OC Transpo',
  description: 'How many of the OC Transpo O-Train stations can you remember?',
  openGraph: {
    title: 'Ottawa Metro Memory – OC Transpo',
    description: 'How many of the OC Transpo O-Train stations can you remember?',
    type: 'website',
    locale: 'en_US',
    url: 'https://metro-memory.com/north-america/canada/ottawa',
  },
}

export const MAP_CONFIG: MapboxOptions = {
  container: 'map',
  style: 'mapbox://styles/mapbox/light-v11',
  bounds: [
    [-75.857388, 45.257673],
    [-75.461882, 45.515377],
  ],
  maxBounds: [
    [-76.087388, 45.027673],
    [-75.231882, 45.745377],
  ],
  minZoom: 9,
  fadeDuration: 50,
}


export const CITY_NAME = 'ottawa'

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
