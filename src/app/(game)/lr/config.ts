import { Metadata } from 'next'
import { MapboxOptions } from 'mapbox-gl'
import { Config, Line, LineGroup } from '@/lib/types'
import linesData from './data/lines.json'


export const LINES = linesData as { [name: string]: Line }

export const LINE_GROUPS: LineGroup[] = [
  {
    title: 'Rock Region Metro',
    items: [
      {
        type: 'lines',
        title: 'Metro Streetcar',
        lines: ['littlerockblue', 'littlerockgreen'],
      },
    ],
  },
]

export const METADATA: Metadata = {
  title: 'Little Rock Metro Memory',
  description: 'How many Little Rock Metro Streetcar stops can you name from memory?',
  openGraph: {
    title: 'Little Rock Metro Memory',
    description: 'How many Little Rock Metro Streetcar stops can you name from memory?',
    type: 'website',
    locale: 'en_US',
    url: 'https://metro-memory.com/lr',
  },
}

export const MAP_CONFIG: MapboxOptions = {
  container: 'map',
  style: 'mapbox://styles/benjamintd/cls31ijdo010o01plcpzag11d',
  bounds: [
    [-92.28, 34.742],
    [-92.25, 34.763],
  ],
  maxBounds: [
    [-92.35, 34.7],
    [-92.18, 34.82],
  ],
  minZoom: 13,
  fadeDuration: 50,
}


export const CITY_NAME = 'lr'

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
