import { Metadata } from 'next'
import type { MapboxOptions } from 'mapbox-gl'
import { Config, Line, LineGroup } from '@/lib/types'
import linesData from './data/lines.json'

export const LINES = linesData as { [name: string]: Line }

export const LINE_GROUPS: LineGroup[] = [
  {
    title: 'Dallas Area Rapid Transit (DART)',
    items: [
      {
        type: 'lines',
        title: 'Light Rail',
        lines: ['DARTRed', 'DARTBlue', 'DARTGreen', 'DARTOrange'],
      },
      {
        type: 'lines',
        title: 'Streetcars',
        lines: ['DallasStreetcar', 'MLineTrolley'],
      },
      {
        type: 'lines',
        title: 'Commuter Rail',
        lines: ['DARTSilver', 'TRE'],
      },
    ],
  },
  {
    items: [{ type: 'separator' }],
  },
  {
    title: 'Trinity Metro',
    items: [
      {
        type: 'lines',
        title: 'Commuter Rail',
        lines: ['TEXRail', 'TRE'],
      },
    ],
  },
  {
    items: [{ type: 'separator' }],
  },
  {
    title: 'Denton County Transportation Authority (DCTA)',
    items: [
      {
        type: 'lines',
        title: 'Commuter Rail',
        lines: ['ATrain'],
      },
    ],
  },
  {
    items: [{ type: 'separator' }],
  },
  {
    title: 'DFW Airport Board',
    items: [
      {
        type: 'lines',
        title: 'Skylink',
        lines: ['Skylink'],
      },
    ],
  },
]

export const METADATA: Metadata = {
  icons: {
    icon: '/api/city-icon/dallas',
    apple: '/api/city-icon/dallas',
  },
  title: 'Dallas–Fort Worth Metro Memory',
  description:
    'How many of the Dallas–Fort Worth DART, Trinity Metro, DCTA and Skylink stops can you name from memory?',
  openGraph: {
    title: 'Dallas–Fort Worth Metro Memory',
    description:
      'How many of the Dallas–Fort Worth DART, Trinity Metro, DCTA and Skylink stops can you name from memory?',
    type: 'website',
    locale: 'en_US',
    url: 'https://metro-memory.com/north-america/usa/dallas',
  },
}

export const MAP_CONFIG: MapboxOptions = {
  container: 'map',
  style: 'mapbox://styles/benjamintd/cls31ijdo010o01plcpzag11d',
  bounds: [
    [-97.5, 32.55],
    [-96.55, 33.23],
  ],
  maxBounds: [
    [-97.8, 32.35],
    [-96.3, 33.45],
  ],
  minZoom: 9,
  fadeDuration: 50,
}

export const CITY_NAME = 'dallas'

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
