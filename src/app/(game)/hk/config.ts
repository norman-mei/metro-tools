import { Metadata } from 'next'
import { MapboxOptions } from 'mapbox-gl'
import { Config, Line, LineGroup } from '@/lib/types'
import linesData from './data/lines.json'


export const LINES = linesData as { [name: string]: Line }

export const METADATA: Metadata = {
  icons: {
    icon: '/api/city-icon/hk',
    apple: '/api/city-icon/hk',
  },
  title: 'Hong Kong Metro Memory',
  description: '你能記住香港港鐵的所有車站嗎？',
  openGraph: {
    title: 'Hong Kong Metro Memory',
    description: '你能記住香港港鐵的所有車站嗎？',
    type: 'website',
    locale: 'zh_Hant_HK',
    url: 'https://metro-memory.com/hk',
  },
}

export const MAP_CONFIG: MapboxOptions = {
  container: 'map',
  style: 'mapbox://styles/mapbox/light-v11',
  bounds: [
    [113.8, 22.15],
    [114.35, 22.55],
  ],
  maxBounds: [
    [113.5, 21.9],
    [114.6, 22.7],
  ],
  minZoom: 8,
  fadeDuration: 50,
}

export const CITY_NAME = 'hk'

export const LOCALE = 'en'

export const MAP_FROM_DATA = true


export const LINE_GROUPS: LineGroup[] = [
  {
    title: 'Mass Transit Railway (MTR)',
    items: [
      {
        type: 'lines',
        title: 'Heavy Rail',
        lines: ['EAL', 'TML', 'NOL', 'AEL', 'TCL', 'TWL', 'ISL', 'KTL', 'TKL', 'SIL', 'DRL', 'XRL'],
      },
      {
        type: 'lines',
        title: 'Light Rail',
        lines: [
          'MTR505',
          'MTR507',
          'MTR610',
          'MTR614',
          'MTR614P',
          'MTR615',
          'MTR615P',
          'MTR705',
          'MTR706',
          'MTR751',
          'MTR751P',
          'MTR761P',
        ],
      },
      {
        type: 'lines',
        title: 'Ngong Ping 360',
        lines: ['HKNP360'],
      },
      {
        type: 'lines',
        title: 'Hong Kong International Airport Automated People Mover (APM)',
        lines: ['HKAPMT1', 'HKAPMT2', 'HKAPMSKY'],
      },
    ],
  },
  {
    items: [{ type: 'separator' }],
  },
  {
    title: 'RATP Dev Transdev Asia',
    items: [
      {
        type: 'lines',
        lines: ['HKT'],
      },
    ],
  },
  {
    items: [{ type: 'separator' }],
  },
  {
    title: 'Hongkong and Shanghai Hotels (HSH)',
    items: [
      {
        type: 'lines',
        lines: ['HKTPT'],
      },
    ],
  },
  {
    items: [{ type: 'separator' }],
  },
  {
    title: 'Ocean Park Corporation (OPC)',
    items: [
      {
        type: 'lines',
        lines: ['HKOEX', 'HKOCC'],
      },
    ],
  },
]

const config: Config = {
  LOCALE,
  CITY_NAME,
  MAP_CONFIG,
  METADATA,
  LINES,
  MAP_FROM_DATA,
  LINE_GROUPS,
}

export default config
