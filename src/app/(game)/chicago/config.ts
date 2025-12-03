import { Metadata } from 'next'
import { MapboxOptions } from 'mapbox-gl'
import { Config, Line, LineGroup } from '@/lib/types'
import linesData from './data/lines.json'


export const LINES = linesData as { [name: string]: Line }

export const LINE_GROUPS: LineGroup[] = [
  {
    title: 'Chicago Transit Authority (CTA)',
    items: [
      {
        type: 'lines',
        lines: [
          'CTAMetroBlueLine',
          'CTAMetroBrownLine',
          'CTAMetroGreenLine',
          'CTAMetroOrangeLine',
          'CTAMetroPinkLine',
          'CTAMetroPurpleLine',
          'CTAMetroRedLine',
          'CTAMetroYellowLine',
        ],
      },
    ],
  },
  {
    items: [{ type: 'separator' }],
  },
  {
    title: 'Metra',
    items: [
      {
        type: 'lines',
        lines: [
          'Metra_BNSF',
          'Metra_HC',
          'Metra_ME',
          'Metra_ME_BI',
          'Metra_ME_SC',
          'Metra_MDN',
          'Metra_MDW',
          'Metra_NCS',
          'Metra_RI',
          'Metra_RI_Bev',
          'Metra_SWS',
          'Metra_UPN',
          'Metra_UPNW',
          'Metra_UPW',
        ],
      },
    ],
  },
  {
    items: [{ type: 'separator' }],
  },
  {
    title: 'Northern Indiana Commuter Transportation District (NICTD)',
    items: [
      {
        type: 'lines',
        lines: ['NICTD_SSL', 'NICTD_MCL'],
      },
    ],
  },
  {
    items: [{ type: 'separator' }],
  },
  {
    title: 'Chicago Department of Aviation (CDA)',
    items: [
      {
        type: 'lines',
        lines: ['ChicagoATS'],
      },
    ],
  },
  {
    items: [{ type: 'separator' }],
  },
  {
    title: 'Kenosha Transit',
    items: [
      {
        type: 'lines',
        title: 'Kenosha Streetcar',
        lines: ['kenoshaStreetcar'],
      },
    ],
  },

]


export const METADATA: Metadata = {
  icons: {
    icon: '/api/city-icon/chicago',
    apple: '/api/city-icon/chicago',
  },
  title: 'Chicago Metro Memory',
  description:
    'How many of the Chicago metro stations can you name from memory?',
  openGraph: {
    title: 'Chicago Metro Memory',
    description:
      'How many of the Chicago metro stations can you name from memory?',
    type: 'website',
    locale: 'en_US',
    url: 'https://metro-memory.com/chicago',
  },
}

export const MAP_CONFIG: MapboxOptions = {
  container: 'map',
  style: 'mapbox://styles/benjamintd/cls1x0vfw013e01qy7k1xdbcu',
  bounds: [
    [-88.3, 41.4],
    [-87.3, 42.3],
  ],
  maxBounds: [
    [-89.5, 40.5],
    [-86.5, 43.5],
  ],
  minZoom: 6,
  fadeDuration: 50,
}


export const CITY_NAME = 'chicago'

export const LOCALE = 'en'

const config: Config = {
  LOCALE,
  CITY_NAME,
  MAP_CONFIG,
  METADATA,
  LINES,
  LINE_GROUPS,
}

export default config
