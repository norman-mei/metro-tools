import { Metadata } from 'next'
import { MapboxOptions } from 'mapbox-gl'
import { Config, Line, LineGroup } from '@/lib/types'
import linesData from './data/lines.json'


export const LINES = linesData as { [name: string]: Line }

export const LINE_GROUPS: LineGroup[] = [
  {
    title: 'LA Metro (Los Angeles County Metropolitan Transportation Authority)',
    items: [
      {
        type: 'lines',
        lines: ['LACMTA_A', 'LACMTA_B', 'LACMTA_C', 'LACMTA_D', 'LACMTA_E', 'LACMTA_K'],
      },
    ],
  },
  {
    items: [{ type: 'separator' }],
  },
  {
    title: 'Orange County Transportation Authority (OCTA)',
    items: [
      {
        type: 'lines',
        lines: ['OCStreetcar'],
      },
    ],
  },
  {
    items: [{ type: 'separator' }],
  },
  {
    title: 'Los Angeles World Airports (LAWA)',
    items: [
      {
        type: 'lines',
        lines: ['LAXAPM'],
      },
    ],
  },
  {
    items: [{ type: 'separator' }],
  },
  {
    title: 'Metrolink',
    items: [
      {
        type: 'lines',
        lines: [
          'MetrolinkAV',
          'MetrolinkVC',
          'MetrolinkSB',
          'MetrolinkRIV',
          'MetrolinkOC',
          'Metrolink91PV',
          'MetrolinkIEOC',
          'Arrow',
        ],
      },
    ],
  },
]

export const METADATA: Metadata = {
  icons: {
    icon: '/api/city-icon/la',
    apple: '/api/city-icon/la',
  },
  title: 'Los Angeles Metro Memory',
  description: 'How many of the LA Metro Rail, OC Streetcar, and Metrolink stations can you name from memory?',
  openGraph: {
    title: 'Los Angeles Metro Memory',
    description: 'How many of the LA Metro Rail, OC Streetcar, and Metrolink stations can you name from memory?',
    type: 'website',
    locale: 'en_US',
    url: 'https://metro-memory.com/la',
  },
}

export const MAP_CONFIG: MapboxOptions = {
  container: 'map',
  style: 'mapbox://styles/benjamintd/cls31ijdo010o01plcpzag11d',
  bounds: [
    [-119.2, 33.1],
    [-116.9, 34.9],
  ],
  maxBounds: [
    [-119.6, 32.8],
    [-116.5, 35.15],
  ],
  minZoom: 8.5,
  fadeDuration: 50,
}


export const CITY_NAME = 'la'

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
