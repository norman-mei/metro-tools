import { Metadata } from 'next'
import { MapboxOptions } from 'mapbox-gl'
import { Config, Line, LineGroup } from '@/lib/types'
import linesData from './data/lines.json'


export const LINES = linesData as { [name: string]: Line }

export const LINE_GROUPS: LineGroup[] = [
  {
    title: 'Glasgow Subway',
    items: [
      {
        type: 'lines',
        title: 'Inner Circle',
        lines: ['glasgowIC'],
      },
      {
        type: 'lines',
        title: 'Outer Circle',
        lines: ['glasgowOC'],
      },
    ],
  },
]

export const METADATA: Metadata = {
  icons: {
    icon: '/api/city-icon/glasgow',
    apple: '/api/city-icon/glasgow',
  },
  title: 'Glasgow Subway Memory Game',
  description: 'How many Glasgow Subway stations can you name from memory?'
,
  openGraph: {
    title: 'Glasgow Subway Memory Game',
    description: 'How many Glasgow Subway stations can you name from memory?',
    type: 'website',
    locale: 'en_GB',
    url: 'https://metro-memory.com/glasgow',
  },
}

export const MAP_CONFIG: MapboxOptions = {
  container: 'map',
  style: 'mapbox://styles/benjamintd/cls31ijdo010o01plcpzag11d',
  bounds: [
    [-4.33, 55.84],
    [-4.23, 55.89],
  ],
  maxBounds: [
    [-4.4, 55.82],
    [-4.15, 55.92],
  ],
  minZoom: 11,
  fadeDuration: 50,
}


export const CITY_NAME = 'glasgow'

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
