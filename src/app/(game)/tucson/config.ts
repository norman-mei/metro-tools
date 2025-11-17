import { Metadata } from 'next'
import { MapboxOptions } from 'mapbox-gl'
import { Config, Line, LineGroup } from '@/lib/types'
import linesData from './data/lines.json'


export const LINES = linesData as { [name: string]: Line }

export const LINE_GROUPS: LineGroup[] = [
  {
    title: 'RATP Dev',
    items: [
      {
        type: 'lines',
        title: 'Sun Link (Tucson Streetcar)',
        lines: ['tucsonSunLink'],
      },
    ],
  },
]

export const METADATA: Metadata = {
  title: 'Tucson Metro Memory',
  description: 'How many of the Sun Link streetcar stops can you name from memory?',
  openGraph: {
    title: 'Tucson Metro Memory',
    description: 'How many of the Sun Link streetcar stops can you name from memory?',
    type: 'website',
    locale: 'en_US',
    url: 'https://metro-memory.com/tucson',
  },
}

export const MAP_CONFIG: MapboxOptions = {
  container: 'map',
  style: 'mapbox://styles/benjamintd/cls31ijdo010o01plcpzag11d',
  bounds: [
    [-111.0, 32.21],
    [-110.93, 32.26],
  ],
  maxBounds: [
    [-111.1, 32.18],
    [-110.85, 32.32],
  ],
  minZoom: 11,
  fadeDuration: 50,
}


export const CITY_NAME = 'tucson'

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
