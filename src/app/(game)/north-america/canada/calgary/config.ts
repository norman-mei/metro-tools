import { Metadata } from 'next'
import type { MapboxOptions } from 'mapbox-gl'
import { Config, Line, LineGroup } from '@/lib/types'
import linesData from './data/lines.json'


export const LINES = linesData as { [name: string]: Line }

export const LINE_GROUPS: LineGroup[] = [
  {
    title: 'Calgary Transit',
    items: [
      {
        type: 'lines',
        title: 'CTrain',
        lines: ['CalgaryRed', 'CalgaryBlue'],
      },
    ],
  },
]

export const METADATA: Metadata = {
  icons: {
    icon: '/api/city-icon/calgary',
    apple: '/api/city-icon/calgary',
  },
  title: 'Calgary Metro Memory – CTrain',
  description: 'How many Calgary CTrain stations can you remember?',
  openGraph: {
    title: 'Calgary Metro Memory – CTrain',
    description: 'How many Calgary CTrain stations can you remember?',
    type: 'website',
    locale: 'en_CA',
    url: 'https://metro-memory.com/north-america/canada/calgary',
  },
}

export const MAP_CONFIG: MapboxOptions = {
  container: 'map',
  style: 'mapbox://styles/mapbox/light-v11',
  bounds: [
    [-114.255764, 50.879014],
    [-113.928206, 51.154608],
  ],
  maxBounds: [
    [-114.535764, 50.599014],
    [-113.648206, 51.434608],
  ],
  minZoom: 9,
  fadeDuration: 50,
}


export const CITY_NAME = 'calgary'

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
