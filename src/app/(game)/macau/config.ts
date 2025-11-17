import { Metadata } from 'next'
import { MapboxOptions } from 'mapbox-gl'
import { Config, Line, LineGroup } from '@/lib/types'
import linesData from './data/lines.json'


export const LINES = linesData as { [name: string]: Line }

export const LINE_GROUPS: LineGroup[] = [
  {
    title: 'Macao Light Rapid Transit (Macao LRT)',
    items: [
      {
        type: 'lines',
        lines: ['TPA', 'HNQ', 'SPV'],
      },
    ],
  },
]

export const METADATA: Metadata = {
  title: 'Macau Metro Memory',
  description:
    'How many of the Macau LRT stations can you name from memory?',
  openGraph: {
    title: 'Macau Metro Memory',
    description:
      'How many of the Macau LRT stations can you name from memory?',
    type: 'website',
    locale: 'en_US',
    url: 'https://metro-memory.com/macau',
  },
}

export const MAP_CONFIG: MapboxOptions = {
  container: 'map',
  style: 'mapbox://styles/benjamintd/cls31ijdo010o01plcpzag11d',
  bounds: [
    [113.515, 22.125],
    [113.585, 22.19],
  ],
  maxBounds: [
    [113.48, 22.08],
    [113.62, 22.23],
  ],
  minZoom: 12,
  fadeDuration: 50,
}


export const CITY_NAME = 'macau'

export const LOCALE = 'en'

export const MAP_FROM_DATA = true

const config: Config = {
  MAP_FROM_DATA,
  LOCALE,
  CITY_NAME,
  MAP_CONFIG,
  METADATA,
  LINES,
  LINE_GROUPS,
}

export default config
