import { Metadata } from 'next'
import { MapboxOptions } from 'mapbox-gl'
import { Config, Line, LineGroup } from '@/lib/types'

import linesData from './data/lines.json'

export const LINES = linesData as { [name: string]: Line }

export const LINE_GROUPS: LineGroup[] = [
  {
    title: 'Pyongyang Metro',
    items: [
      {
        type: 'lines',
        lines: ['pyongyang-chollima', 'pyongyang-hyoksin'],
      },
    ],
  },
]

export const METADATA: Metadata = {
  icons: {
    icon: '/api/city-icon/pyongyang',
    apple: '/api/city-icon/pyongyang',
  },
  title: 'Pyongyang Metro Memory Game',
  description: 'How many of the Pyongyang Metro stations can you name from memory?',
  openGraph: {
    title: 'Pyongyang Metro Memory Game',
    description: 'How many of the Pyongyang Metro stations can you name from memory?',
    type: 'website',
    locale: 'en_US',
    url: 'https://metro-memory.com/pyongyang',
  },
}

export const MAP_CONFIG: MapboxOptions = {
  container: 'map',
  style: 'mapbox://styles/benjamintd/cls31ijdo010o01plcpzag11d',
  bounds: [
    [125.69, 38.99],
    [125.84, 39.09],
  ],
  maxBounds: [
    [125.6, 38.94],
    [125.93, 39.15],
  ],
  minZoom: 11,
  fadeDuration: 50,
}

const config: Config = {
  MAP_FROM_DATA: true,
  LOCALE: 'en',
  CITY_NAME: 'pyongyang',
  MAP_CONFIG,
  METADATA,
  LINES,
  LINE_GROUPS,
}

export default config
