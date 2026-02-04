import { Metadata } from 'next'
import type { MapboxOptions } from 'mapbox-gl'
import { Config, Line, LineGroup } from '@/lib/types'
import linesData from './data/lines.json'


export const LINES = linesData as { [name: string]: Line }

export const LINE_GROUPS: LineGroup[] = [
  {
    title: 'Transport for NSW',
    items: [
      {
        type: 'lines',
        title: 'Newcastle Light Rail',
        lines: ['NewcastleLR'],
      },
    ],
  },
]

export const METADATA: Metadata = {
  icons: {
    icon: '/api/city-icon/newcastle',
    apple: '/api/city-icon/newcastle',
  },
  title: 'Newcastle Metro Memory',
  description: 'How many of the Newcastle Light Rail stops can you name from memory?',
  openGraph: {
    title: 'Newcastle Metro Memory',
    description: 'How many of the Newcastle Light Rail stops can you name from memory?',
    type: 'website',
    locale: 'en_US',
    url: 'https://metro-memory.com/oceania/australia/newcastle',
  },
}

export const MAP_CONFIG: MapboxOptions = {
  container: 'map',
  style: 'mapbox://styles/benjamintd/cls31ijdo010o01plcpzag11d',
  bounds: [
    [151.75, -32.93],
    [151.79, -32.92],
  ],
  maxBounds: [
    [151.73, -32.95],
    [151.81, -32.90],
  ],
  minZoom: 13,
  fadeDuration: 50,
}


export const CITY_NAME = 'newcastle'

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
