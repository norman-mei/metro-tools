import { Metadata } from 'next'
import { MapboxOptions } from 'mapbox-gl'
import { Config, Line, LineGroup } from '@/lib/types'
import linesData from './data/lines.json'


export const LINES = linesData as { [name: string]: Line }

export const LINE_GROUPS: LineGroup[] = [
  {
    title: 'Metropolitan Transit Authority of Harris County (METRO)',
    items: [
      {
        type: 'lines',
        title: 'METRORail',
        lines: [
          'Houston_METRORail_Red_Line_icon',
          'Houston_METRORail_Green_Line_icon',
          'Houston_METRORail_Purple_Line_icon',
        ],
      },
    ],
  },
  {
    items: [{ type: 'separator' }],
  },
  {
    title: 'Houston Airport System (HAS)',
    items: [
      {
        type: 'lines',
        title: 'George Bush Intercontinental Airport APMs',
        lines: ['houstonSUB', 'houstonSKY'],
      },
    ],
  },
]

export const METADATA: Metadata = {
  icons: {
    icon: '/api/city-icon/houston',
    apple: '/api/city-icon/houston',
  },
  title: 'Houston Metro Memory',
  description:
    'How many of the Houston METRORail and HAS airport train stations can you name from memory?',
  openGraph: {
    title: 'Houston Metro Memory',
    description:
      'How many of the Houston METRORail and HAS airport train stations can you name from memory?',
    type: 'website',
    locale: 'en_US',
    url: 'https://metro-memory.com/north-america/usa/houston',
  },
}

export const MAP_CONFIG: MapboxOptions = {
  container: 'map',
  style: 'mapbox://styles/benjamintd/cls31ijdo010o01plcpzag11d',
  bounds: [
    [-95.42, 29.65],
    [-95.28, 30.05],
  ],
  maxBounds: [
    [-95.7, 29.55],
    [-95.0, 30.15],
  ],
  minZoom: 11,
  fadeDuration: 50,
}


export const CITY_NAME = 'houston'

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
