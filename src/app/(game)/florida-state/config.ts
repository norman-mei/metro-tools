import { Metadata } from 'next'
import { MapboxOptions } from 'mapbox-gl'
import { Config, Line, LineGroup } from '@/lib/types'
import linesData from './data/lines.json'


export const LINES = linesData as { [name: string]: Line }

export const LINE_GROUPS: LineGroup[] = [
  {
    title: 'Miami-Dade Transit (MDT)',
    items: [
      {
        type: 'lines',
        title: 'Metrorail',
        lines: ['floridaGR', 'floridaOR'],
      },
      {
        type: 'lines',
        title: 'Metromover',
        lines: ['floridaOM', 'floridaBR', 'floridaIN'],
      },
    ],
  },
  {
    items: [{ type: 'separator' }],
  },
  {
    title: 'Miami-Dade Aviation Department (MDAD)',
    items: [
      {
        type: 'lines',
        title: 'Skytrain',
        lines: ['floridaSKYTRAIN'],
      },
      {
        type: 'lines',
        title: 'MIA e Train',
        lines: ['floridaMET'],
      },
      {
        type: 'lines',
        title: 'MIA Mover',
        lines: ['floridaMIA'],
      },
    ],
  },
  {
    items: [{ type: 'separator' }],
  },
  {
    title: 'South Florida Regional Transportation Authority (SFRTA)',
    items: [
      {
        type: 'lines',
        lines: ['Tri-Rail'],
      },
    ],
  },
  {
    items: [{ type: 'separator' }],
  },
  {
    title: 'Brightline',
    items: [
      {
        type: 'lines',
        lines: ['brightline'],
      },
    ],
  },
  {
    items: [{ type: 'separator' }],
  },
  {
    title: 'Central Florida Commuter Rail Commission (CFCRC)',
    items: [
      {
        type: 'lines',
        lines: ['floridaSUN'],
      },
    ],
  },
  {
    items: [{ type: 'separator' }],
  },
  {
    title: 'Disney Transport',
    items: [
      {
        type: 'lines',
        title: 'Disneyland Railroad',
        lines: ['DisneyDRR'],
      },
      {
        type: 'lines',
        title: 'Disneyland Monorail',
        lines: ['DisneyMKR', 'DisneyMKX', 'DisneyEPC'],
      },
      {
        type: 'lines',
        title: 'Disney Skyliner',
        lines: ['DisneySKYEPC', 'DisneySKYHS', 'DisneySKYPOP'],
      },
    ],
  },
  {
    items: [{ type: 'separator' }],
  },
  {
    title: 'Hillsborough Area Regional Transit (HART)',
    items: [
      {
        type: 'lines',
        title: 'TECO Line Streetcar',
        lines: ['floridaTECO'],
      },
    ],
  },
  {
    items: [{ type: 'separator' }],
  },
  {
    title: 'Hillsborough County Aviation Authority (HCAA)',
    items: [
      {
        type: 'lines',
        title: 'Airside Shuttles',
        lines: ['floridaASA', 'floridaASC', 'floridaASE', 'floridaASF'],
      },
      {
        type: 'lines',
        title: 'SkyConnect',
        lines: ['floridaSKYCONNECT'],
      },
    ],
  },
  {
    items: [{ type: 'separator' }],
  },
  {
    title: 'Greater Orlando Aviation Authority (GOAA)',
    items: [
      {
        type: 'lines',
        title: 'Gate Links',
        lines: ['floridaAS1', 'floridaAS2', 'floridaAS3', 'floridaAS4'],
      },
      {
        type: 'lines',
        title: 'Terminal Link',
        lines: ['floridaTL'],
      },
    ],
  },
  {
    items: [{ type: 'separator' }],
  },
  {
    title: 'Jacksonville Transportation Authority (JTA)',
    items: [
      {
        type: 'lines',
        title: 'Skyway',
        lines: ['NB', 'SB'],
      },
    ],
  },
]

export const METADATA: Metadata = {
  icons: {
    icon: '/api/city-icon/florida-state',
    apple: '/api/city-icon/florida-state',
  },
  title: 'Florida State Metro Memory',
  description: 'How many stations across Florida can you name from memory?',
  openGraph: {
    title: 'Florida State Metro Memory',
    description: 'How many stations across Florida can you name from memory?',
    type: 'website',
    locale: 'en_US',
    url: 'https://metro-memory.com/florida-state',
  },
}

export const MAP_CONFIG: MapboxOptions = {
  container: 'map',
  style: 'mapbox://styles/benjamintd/cls31ijdo010o01plcpzag11d',
  bounds: [
    [-89, 23],
    [-77, 33],
  ],
  maxBounds: [
    [-91, 22],
    [-75, 34],
  ],
  minZoom: 3,
  maxZoom: 14,
  fadeDuration: 50,
}


export const CITY_NAME = 'florida-state'

export const LOCALE = 'en'

export const MAP_FROM_DATA = true

export const GAUGE_COLORS = 'default'

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
