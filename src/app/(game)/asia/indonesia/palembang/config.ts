import { Metadata } from 'next'
import type { MapboxOptions } from 'mapbox-gl'
import { Config, Line, LineGroup } from '@/lib/types'

import linesData from './data/lines.json'

export const LINES = linesData as { [name: string]: Line }

export const LINE_GROUPS: LineGroup[] = [
  {
    title: 'Kereta Api Indonesia',
    items: [
      {
        type: 'lines',
        lines: ['palembanglrt'],
      },
    ],
  },
]

export const METADATA: Metadata = {
  icons: {
    icon: '/api/city-icon/palembang',
    apple: '/api/city-icon/palembang',
  },
  title: 'Palembang LRT Memory Game',
  description: 'How many Palembang LRT stations can you name from memory?',
  openGraph: {
    title: 'Palembang LRT Memory Game',
    description: 'How many Palembang LRT stations can you name from memory?',
    type: 'website',
    locale: 'en_US',
    url: 'https://metro-memory.com/asia/indonesia/palembang',
  },
}

export const MAP_CONFIG: MapboxOptions = {
  container: 'map',
  style: 'mapbox://styles/benjamintd/clox61b80011o01qofw8s8hdv',
  bounds: [
    [104.69, -3.05],
    [104.81, -2.88],
  ],
  maxBounds: [
    [104.63, -3.12],
    [104.88, -2.81],
  ],
  minZoom: 10.75,
  fadeDuration: 50,
}

const config: Config = {
  MAP_FROM_DATA: true,
  LOCALE: 'en',
  CITY_NAME: 'palembang',
  MAP_CONFIG,
  METADATA,
  LINES,
  LINE_GROUPS,
}

export default config
