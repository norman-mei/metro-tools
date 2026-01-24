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
    title: 'San Francisco Airports Commission',
    items: [
      {
        type: 'lines',
        lines: ['SFOBlue', 'SFORed'],
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
        lines: ['MuniJ', 'MuniK', 'MuniL', 'MuniM', 'MuniN', 'MuniS', 'MuniT'],
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
  {
    items: [{ type: 'separator' }],
  },
  {
    title: 'California High-Speed Rail Authority',
    items: [
      {
        type: 'lines',
        lines: ['CAHSR'],
      },
    ],
  },
  {
    items: [{ type: 'separator' }],
  },
  {
    title: 'Los Angeles County Metropolitan Transportation Authority (LA Metro)',
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
  {
    items: [{ type: 'separator' }],
  },
  {
    title: 'San Diego Metropolitan Transit System (MTS)',
    items: [
      {
        type: 'lines',
        title: 'San Diego Trolley',
        lines: ['MTSBlue', 'MTSOrange', 'MTSGreen', 'MTSSilver', 'MTSSpecialEvents', 'MTSCopper'],
      },
    ],
  },
  {
    items: [{ type: 'separator' }],
  },
  {
    title: 'North County Transit – San Diego Railroad (NCTD)',
    items: [
      {
        type: 'lines',
        title: 'Commuter Rail',
        lines: ['COASTER'],
      },
      {
        type: 'lines',
        title: 'Light Rail',
        lines: ['SPRINTER'],
      },
    ],
  },
]

export const METADATA: Metadata = {
  icons: {
    icon: '/api/city-icon/california-state',
    apple: '/api/city-icon/california-state',
  },
  title: 'California State Metro Memory',
  description:
    'How many of the Bay Area, Los Angeles, and San Diego rail stations can you name from memory?',
  openGraph: {
    title: 'California State Metro Memory',
    description:
      'How many of the Bay Area, Los Angeles, and San Diego rail stations can you name from memory?',
    type: 'website',
    locale: 'en_US',
    url: 'https://metro-memory.com/north-america/usa/california-state',
  },
}

export const MAP_CONFIG: MapboxOptions = {
  container: 'map',
  style: 'mapbox://styles/benjamintd/cls31ijdo010o01plcpzag11d',
  bounds: [
    [-125, 32],
    [-113.5, 42.5],
  ],
  maxBounds: [
    [-130, 31],
    [-110, 44],
  ],
  minZoom: 5.5,
  fadeDuration: 50,
}

export const CITY_NAME = 'california-state'

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
