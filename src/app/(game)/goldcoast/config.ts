import { Metadata } from 'next'
import { MapboxOptions } from 'mapbox-gl'
import { Config, Line, LineGroup } from '@/lib/types'
import linesData from './data/lines.json'

export const LINES = linesData as { [name: string]: Line }

export const LINE_GROUPS: LineGroup[] = [
  {
    title: 'Translink',
    items: [
      {
        type: 'lines',
        title: 'G:link',
        lines: ['Glink'],
      },
    ],
  },
]

export const METADATA: Metadata = {
  icons: {
    icon: '/api/city-icon/goldcoast',
    apple: '/api/city-icon/goldcoast',
  },
  title: 'Gold Coast G:link Memory',
  description: 'How many Gold Coast G:link stops can you name from memory?',
  openGraph: {
    title: 'Gold Coast G:link Memory',
    description: 'How many Gold Coast G:link stops can you name from memory?',
    type: 'website',
    locale: 'en_AU',
    url: 'https://metro-memory.com/goldcoast',
  },
}

export const MAP_CONFIG: MapboxOptions = {
  container: 'map',
  style: 'mapbox://styles/benjamintd/cls31ijdo010o01plcpzag11d',
  bounds: [
    [153.32, -28.1],
    [153.47, -27.9],
  ],
  maxBounds: [
    [153.25, -28.15],
    [153.52, -27.85],
  ],
  minZoom: 11,
  fadeDuration: 50,
}

export const CITY_NAME = 'goldcoast'

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
