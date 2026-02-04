import { Metadata } from 'next'
import type { MapboxOptions } from 'mapbox-gl'
import { Config, Line, LineGroup } from '@/lib/types'
import linesData from './data/lines.json'


export const LINES = linesData as { [name: string]: Line }

export const LINE_GROUPS: LineGroup[] = [
  {
    title: 'Metropolitan Council',
    items: [
      {
        type: 'lines',
        title: 'METRO',
        lines: ['MAXBlue', 'MAXGreen'],
      },
    ],
  },
  {
    items: [{ type: 'separator' }],
  },
  {
    title: 'Metropolitan Airports Commission',
    items: [
      {
        type: 'lines',
        title: 'Minneapolis–St. Paul Airport Trams',
        lines: ['HubTram', 'ConcourseCMover'],
      },
    ],
  },
]

export const METADATA: Metadata = {
  icons: {
    icon: '/api/city-icon/twincities',
    apple: '/api/city-icon/twincities',
  },
  title: 'Minneapolis-St. Paul Metro Memory',
  description:
    'How many of the Minneapolis-St. Paul METRO & airport tram stations can you name from memory?',
  openGraph: {
    title: 'Minneapolis-St. Paul Metro Memory',
    description:
      'How many of the Minneapolis-St. Paul METRO & airport tram stations can you name from memory?',
    type: 'website',
    locale: 'en_US',
    url: 'https://metro-memory.com/north-america/usa/twincities',
  },
}

export const MAP_CONFIG: MapboxOptions = {
  container: 'map',
  style: 'mapbox://styles/benjamintd/cls31ijdo010o01plcpzag11d',
  bounds: [
    [-93.5, 44.84],
    [-93.05, 45.03],
  ],
  maxBounds: [
    [-93.7, 44.75],
    [-92.9, 45.15],
  ],
  minZoom: 9.5,
  fadeDuration: 50,
}


export const CITY_NAME = 'twincities'

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
