import { Metadata } from 'next'
import { MapboxOptions } from 'mapbox-gl'
import { Config, Line, LineGroup } from '@/lib/types'


export const LINES: {
  [name: string]: Line
} = {
  VancouverSkytrainCanadaLine: {
    name: 'Canada Line',
    color: '#009BC8',
    backgroundColor: '#004E64',
    textColor: '#ffffff',
    order: 0,
  },
  VancouverSkytrainExpoLine: {
    name: 'Expo Line',
    color: '#015DAB',
    backgroundColor: '#002E55',
    textColor: '#ffffff',
    order: 1,
  },
  VancouverSkytrainMillenniumLine: {
    name: 'Millennium Line',
    color: '#FED105',
    backgroundColor: '#816A01',
    textColor: '#000000',
    order: 2,
  },
  VancouverWestCoastExpressWce: {
    name: 'West Coast Express',
    color: '#77278D',
    backgroundColor: '#3B1447',
    textColor: '#ffffff',
    order: 3,
  },
}

export const LINE_GROUPS: LineGroup[] = [
  {
    title: 'South Coast British Columbia Transportation Authority (TransLink)',
    items: [
      {
        type: 'lines',
        title: 'SkyTrain',
        lines: [
          'VancouverSkytrainCanadaLine',
          'VancouverSkytrainExpoLine',
          'VancouverSkytrainMillenniumLine',
        ],
      },
      {
        type: 'lines',
        title: 'West Coast Express (WCE)',
        lines: ['VancouverWestCoastExpressWce'],
      },
    ],
  },
]

export const METADATA: Metadata = {
  icons: {
    icon: '/api/city-icon/vancouver',
    apple: '/api/city-icon/vancouver',
  },
  title: 'Vancouver Metro Memory',
  description:
    'How many of the Vancouver transit stations can you name from memory?',
  openGraph: {
    title: 'Vancouver Metro Memory',
    description:
      'How many of the Vancouver transit stations can you name from memory?',
    type: 'website',
    locale: 'en_US',
    url: 'https://metro-memory.com/vancouver',
  },
}

export const MAP_CONFIG: MapboxOptions = {
  container: 'map',
  style: 'mapbox://styles/benjamintd/cls1uo75n012501r41183e47e',
  bounds: [
    [-123.453143, 49.009389],
    [-122.464374, 49.413096],
  ],
  maxBounds: [
    [-124.5, 48],
    [-121.5, 50.4],
  ],
  minZoom: 6,
  fadeDuration: 50,
}


export const CITY_NAME = 'vancouver'

export const LOCALE = 'en'

export const GAUGE_COLORS = 'inverted'

const config: Config = {
  GAUGE_COLORS,
  LOCALE,
  CITY_NAME,
  MAP_CONFIG,
  METADATA,
  LINES,
  LINE_GROUPS,
}

export default config
