import { Metadata } from 'next'
import { MapboxOptions } from 'mapbox-gl'
import { Config, Line, LineGroup } from '@/lib/types'
import linesData from './data/lines.json'


export const LINES = linesData as { [name: string]: Line }

export const LINE_GROUPS: LineGroup[] = [
  {
    title: 'Embark',
    items: [
      {
        type: 'lines',
        lines: ['OKCSDL', 'OKCSBL'],
      },
    ],
  },
]

export const METADATA: Metadata = {
  icons: {
    icon: '/api/city-icon/okc',
    apple: '/api/city-icon/okc',
  },
  title: 'Oklahoma City Metro Memory',
  description: 'How many of the OKC streetcar stops can you remember?',
  openGraph: {
    title: 'Oklahoma City Metro Memory',
    description: 'How many of the OKC streetcar stops can you remember?',
    type: 'website',
    locale: 'en_US',
    url: 'https://metro-memory.com/north-america/usa/okc',
  },
}

export const MAP_CONFIG: MapboxOptions = {
  container: 'map',
  style: 'mapbox://styles/benjamintd/cls31ijdo010o01plcpzag11d',
  bounds: [
    [-97.53, 35.46],
    [-97.50, 35.49],
  ],
  maxBounds: [
    [-97.55, 35.44],
    [-97.48, 35.52],
  ],
  minZoom: 13,
  fadeDuration: 50,
}


export const CITY_NAME = 'okc'

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
