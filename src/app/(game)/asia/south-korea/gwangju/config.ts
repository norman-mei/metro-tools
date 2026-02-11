import { Metadata } from 'next'
import type { MapboxOptions } from 'mapbox-gl'
import { Config, Line, LineGroup } from '@/lib/types'
import linesData from './data/lines.json'

export const LINES = linesData as { [name: string]: Line }

export const LINE_GROUPS: LineGroup[] = [
  {
    title: 'Gwangju Metropolitan Rapid Transit Corporation (GMRTC)',
    items: [
      {
        type: 'lines',
        title: 'Gwangju Metro',
        lines: ['Gwangju1', 'Gwangju2'],
      },
    ],
  },
]

export const METADATA: Metadata = {
  icons: {
    icon: '/api/city-icon/gwangju',
    apple: '/api/city-icon/gwangju',
  },
  title: 'Gwangju Metro Memory',
  description: 'How many Gwangju Metro stops can you name from memory?',
  openGraph: {
    title: 'Gwangju Metro Memory',
    description: 'How many Gwangju Metro stops can you name from memory?',
    type: 'website',
    locale: 'en_US',
    url: 'https://metro-memory.com/asia/south-korea/gwangju',
  },
}

export const MAP_CONFIG: MapboxOptions = {
  container: 'map',
  style: 'mapbox://styles/benjamintd/cls31ijdo010o01plcpzag11d',
  bounds: [
    [126.76, 35.1],
    [126.94, 35.22],
  ],
  maxBounds: [
    [126.73, 35.07],
    [126.97, 35.25],
  ],
  minZoom: 11,
  fadeDuration: 50,
}

export const CITY_NAME = 'gwangju'

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
