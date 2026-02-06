import { Metadata } from 'next'
import type { MapboxOptions } from 'mapbox-gl'
import { Config, Line, LineGroup } from '@/lib/types'
import linesData from './data/lines.json'

export const LINES = linesData as { [name: string]: Line }

export const LINE_GROUPS: LineGroup[] = [
  {
    title: 'HCM Urban Railways (HURC)',
    items: [
      {
        type: 'lines',
        title: 'Ho Chi Minh City Metro (HCMC Metro)',
        lines: ['HCMC1'],
      },
    ],
  },
]

export const METADATA: Metadata = {
  icons: {
    icon: '/api/city-icon/hochiminhcity',
    apple: '/api/city-icon/hochiminhcity',
  },
  title: 'Ho Chi Minh City Metro Memory',
  description: 'How many Ho Chi Minh City Metro stops can you name from memory?',
  openGraph: {
    title: 'Ho Chi Minh City Metro Memory',
    description: 'How many Ho Chi Minh City Metro stops can you name from memory?',
    type: 'website',
    locale: 'en_US',
    url: 'https://metro-memory.com/asia/vietnam/hochiminhcity',
  },
}

export const MAP_CONFIG: MapboxOptions = {
  container: 'map',
  style: 'mapbox://styles/benjamintd/cls31ijdo010o01plcpzag11d',
  bounds: [
    [106.61, 10.75],
    [106.84, 10.96],
  ],
  maxBounds: [
    [106.58, 10.72],
    [106.87, 10.99],
  ],
  minZoom: 11,
  fadeDuration: 50,
}

export const CITY_NAME = 'hochiminhcity'

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
