import { Metadata } from 'next'
import { MapboxOptions } from 'mapbox-gl'
import { Config, Line, LineGroup } from '@/lib/types'
import linesData from './data/lines.json'


export const LINES = linesData as { [name: string]: Line }

export const LINE_GROUPS: LineGroup[] = [
  {
    title: 'Bay Area Rapid Transit (BART)',
    items: [
      {
        type: 'lines',
        lines: ['BARTYellow', 'BARTOrange', 'BARTBlue', 'BARTGreen', 'BARTRed', 'BARTOAC'],
      },
    ],
  },
  {
    items: [{ type: 'separator' }],
  },
  {
    title: 'Peninsula Corridor Joint Powers Board',
    items: [
      {
        type: 'lines',
        lines: ['CaltrainLocal', 'CaltrainLimited', 'CaltrainExpress', 'CaltrainSouth'],
      },
    ],
  },
  {
    items: [{ type: 'separator' }],
  },
  {
    title: 'Sonoma–Marin Area Rail Transit District',
    items: [
      {
        type: 'lines',
        lines: ['SMART'],
      },
    ],
  },
  {
    items: [{ type: 'separator' }],
  },
  {
    title: 'San Joaquin Regional Rail Commission',
    items: [
      {
        type: 'lines',
        lines: ['ACE'],
      },
    ],
  },
  {
    items: [{ type: 'separator' }],
  },
  {
    title: 'San Francisco Municipal Railway (Muni)',
    items: [
      {
        type: 'lines',
        title: 'MUNI Metro',
        lines: ['MuniJ', 'MuniK', 'MuniL', 'MuniM', 'MuniN', 'MuniT', 'MuniS'],
      },
      {
        type: 'lines',
        title: 'Historic Streetcar',
        lines: ['MuniE', 'MuniF'],
      },
      {
        type: 'lines',
        title: 'Cable Car',
        lines: ['MuniC', 'MuniPH', 'MuniPM'],
      },
    ],
  },
  {
    items: [{ type: 'separator' }],
  },
  {
    title: 'Santa Clara Valley Transportation Authority (VTA)',
    items: [
      {
        type: 'lines',
        lines: ['VTABlue', 'VTAGreen', 'VTAOrange'],
      },
    ],
  },
  {
    items: [{ type: 'separator' }],
  },
  {
    title: 'Sacramento Regional Transit (SacRT)',
    items: [
      {
        type: 'lines',
        lines: ['SacRTGold', 'SacRTBlue', 'SacRTGreen'],
      },
    ],
  },
]

export const METADATA: Metadata = {
  icons: {
    icon: '/api/city-icon/bayarea',
    apple: '/api/city-icon/bayarea',
  },
  title: 'Bay Area & Sacramento Metro Memory',
  description:
    'How many of the BART, Caltrain, SMART, ACE, Muni, VTA, and SacRT stations can you name from memory?',
  openGraph: {
    title: 'Bay Area & Sacramento Metro Memory',
    description:
      'How many of the BART, Caltrain, SMART, ACE, Muni, VTA, and SacRT stations can you name from memory?',
    type: 'website',
    locale: 'en_US',
    url: 'https://metro-memory.com/bayarea',
  },
}

export const MAP_CONFIG: MapboxOptions = {
  container: 'map',
  style: 'mapbox://styles/benjamintd/cls31ijdo010o01plcpzag11d',
  bounds: [
    [-122.6, 37.2],
    [-121.1, 38.7],
  ],
  maxBounds: [
    [-123.1, 36.9],
    [-120.7, 38.95],
  ],
  minZoom: 8.5,
  fadeDuration: 50,
}


export const CITY_NAME = 'bayarea'

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
