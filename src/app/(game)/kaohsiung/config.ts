import { Metadata } from 'next'
import { MapboxOptions } from 'mapbox-gl'
import { Config, Line, LineGroup } from '@/lib/types'
import linesData from './data/lines.json'


export const LINES = linesData as { [name: string]: Line }

export const LINE_GROUPS: LineGroup[] = [
  {
    title: 'Kaohsiung Mass Rapid Transit System (KRT)',
    items: [
      {
        type: 'lines',
        title: 'Heavy Rail',
        lines: ['KaohsiungRed', 'KaohsiungOrange'],
      },
      {
        type: 'lines',
        title: 'Light Rail',
        lines: ['KaohsiungCircular'],
      },
    ],
  },
]

export const METADATA: Metadata = {
  icons: {
    icon: '/api/city-icon/kaohsiung',
    apple: '/api/city-icon/kaohsiung',
  },
  title: 'Kaohsiung Metro Memory',
  description: 'How many of the Kaohsiung MRT and LRT stations can you name from memory?',
  openGraph: {
    title: 'Kaohsiung Metro Memory',
    description: 'How many of the Kaohsiung MRT and LRT stations can you name from memory?',
    type: 'website',
    locale: 'en_US',
    url: 'https://metro-memory.com/kaohsiung',
  },
}

export const MAP_CONFIG: MapboxOptions = {
  container: 'map',
  style: 'mapbox://styles/benjamintd/cls31ijdo010o01plcpzag11d',
  bounds: [
    [120.27, 22.56],
    [120.39, 22.81],
  ],
  maxBounds: [
    [120.24, 22.53],
    [120.42, 22.84],
  ],
  minZoom: 11.5,
  fadeDuration: 50,
}


export const CITY_NAME = 'kaohsiung'

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
