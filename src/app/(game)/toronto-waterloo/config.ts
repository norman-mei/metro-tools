import { Metadata } from 'next'
import { MapboxOptions } from 'mapbox-gl'
import { Config, Line, LineGroup } from '@/lib/types'
import linesData from './data/lines.json'

export const LINES = linesData as { [name: string]: Line }

export const LINE_GROUPS: LineGroup[] = [
  {
    title: 'Toronto Transit Commission (TTC)',
    items: [
      {
        type: 'lines',
        title: 'Subway',
        lines: ['TTC1', 'TTC2', 'TTC3', 'TTC4'],
      },
      {
        type: 'lines',
        title: 'Light Rail',
        lines: ['TTC5', 'TTC6'],
      },
      {
        type: 'lines',
        title: 'Streetcar',
        lines: ['TTC501', 'TTC503', 'TTC504', 'TTC505', 'TTC506', 'TTC507', 'TTC508', 'TTC509', 'TTC510', 'TTC511', 'TTC512'],
      },
    ],
  },
  {
    items: [{ type: 'separator' }],
  },
  {
    title: 'Metrolinx',
    items: [
      {
        type: 'lines',
        title: 'Union Pearson Express',
        lines: ['UPExpress'],
      },
      {
        type: 'lines',
        title: 'GO Transit',
        lines: ['GOLW', 'GOLE', 'GOMI', 'GOKI', 'GOBR', 'GORH', 'GOST'],
      },
    ],
  },
  {
    items: [{ type: 'separator' }],
  },
  {
    title: 'Hurontario LRT',
    items: [
      {
        type: 'lines',
        title: 'Hazel McCallion Line',
        lines: ['Hazel'],
      },
    ],
  },
  {
    items: [{ type: 'separator' }],
  },
  {
    title: 'Greater Toronto Airports Authority (GTAA)',
    items: [
      {
        type: 'lines',
        title: 'Terminal Link',
        lines: ['TerminalLink'],
      },
    ],
  },
  {
    items: [{ type: 'separator' }],
  },
  {
    title: 'ION',
    items: [
      {
        type: 'lines',
        title: 'Light Rail',
        lines: ['ION'],
      },
    ],
  },
]

export const METADATA: Metadata = {
  icons: {
    icon: '/api/city-icon/toronto-waterloo',
    apple: '/api/city-icon/toronto-waterloo',
  },
  title: 'Toronto–Waterloo Metro Memory',
  description: 'How many of the TTC, GO Transit, UP Express, and ION stops can you name from memory?',
  openGraph: {
    title: 'Toronto–Waterloo Metro Memory',
    description: 'How many of the TTC, GO Transit, UP Express, and ION stops can you name from memory?',
    type: 'website',
    locale: 'en_US',
    url: 'https://metro-memory.com/toronto-waterloo',
  },
}

export const MAP_CONFIG: MapboxOptions = {
  container: 'map',
  style: 'mapbox://styles/benjamintd/cls31ijdo010o01plcpzag11d',
  bounds: [
    [-81.4, 42.9],
    [-78.0, 44.7],
  ],
  maxBounds: [
    [-82, 42.6],
    [-77.6, 45],
  ],
  minZoom: 8,
  fadeDuration: 50,
}

export const CITY_NAME = 'toronto-waterloo'

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
