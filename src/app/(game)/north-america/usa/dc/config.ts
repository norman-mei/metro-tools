import { Config, Line, LineGroup } from '@/lib/types'
import { MapboxOptions } from 'mapbox-gl'
import { Metadata } from 'next'


export const LINES: {
  [name: string]: Line
} = {
  WMATAMetroBlue: {
    name: 'Blue',
    color: '#0096D8',
    backgroundColor: '#004B6C',
    textColor: '#000000',
    order: 1000,
  },
  WMATAMetroGreen: {
    name: 'Green',
    color: '#00AE4C',
    backgroundColor: '#005726',
    textColor: '#000000',
    order: 1000,
  },
  WMATAMetroOrange: {
    name: 'Orange',
    color: '#DF8700',
    backgroundColor: '#704300',
    textColor: '#000000',
    order: 1000,
  },
  WMATAMetroRed: {
    name: 'Red',
    color: '#BF1939',
    backgroundColor: '#600C1D',
    textColor: '#000000',
    order: 1000,
  },
  WMATAMetroSilver: {
    name: 'Silver',
    color: '#A2A4A1',
    backgroundColor: '#515350',
    textColor: '#000000',
    order: 1000,
  },
  WMATAMetroYellow: {
    name: 'Yellow',
    color: '#F8D200',
    backgroundColor: '#7C6900',
    textColor: '#000000',
    order: 1000,
  },
  VREManassasLine: {
    name: 'Manassas',
    color: '#3C6FC6',
    backgroundColor: '#1A458B',
    textColor: '#FFFFFF',
    order: 2000,
  },
  VREFredericksburgLine: {
    name: 'Fredericksburg',
    color: '#FF7075',
    backgroundColor: '#EB1B23',
    textColor: '#FFFFFF',
    order: 2001,
  },
  MARCBrunswickLine: {
    name: 'Brunswick',
    color: '#FFBE52',
    backgroundColor: '#FEA92E',
    textColor: '#000000',
    order: 3000,
  },
  MARCCamdenLine: {
    name: 'Camden',
    color: '#FF865F',
    backgroundColor: '#FF5624',
    textColor: '#FFFFFF',
    order: 3001,
  },
  MARCPennLine: {
    name: 'Penn',
    color: '#F05B68',
    backgroundColor: '#DA2A38',
    textColor: '#FFFFFF',
    order: 3002,
  },
  MarylandMetroMetroSubwaylink: {
    name: 'Baltimore Metro SubwayLink',
    color: '#005F80',
    backgroundColor: '#005F80',
    textColor: '#FFFFFF',
    order: 4000,
  },
  MarylandLightRailLightRaillink: {
    name: 'Baltimore Light RailLink',
    color: '#355D82',
    backgroundColor: '#355D82',
    textColor: '#FFFFFF',
    order: 4001,
  },
  MTAPurpleLine: {
    name: 'Purple',
    color: '#9062D4',
    backgroundColor: '#612C95',
    textColor: '#FFFFFF',
    order: 4002,
  },
  MWAAAeroTrain: {
    name: 'AeroTrain (AT)',
    color: '#2C6DBD',
    backgroundColor: '#00468E',
    textColor: '#FFFFFF',
    order: 5000,
  },
}

export const METADATA: Metadata = {
  icons: {
    icon: '/api/city-icon/dc',
    apple: '/api/city-icon/dc',
  },
  title: 'Washington DC Metro Memory Game',
  description: 'How many of the DC metro stations can you name from memory?',
  openGraph: {
    title: 'Washington DC Metro Memory Game',
    description: 'How many of the DC metro stations can you name from memory?',
    type: 'website',
    locale: 'en_US',
    url: 'https://metro-memory.com/north-america/usa/dc',
  },
}

export const MAP_CONFIG: MapboxOptions = {
  container: 'map',
  style: 'mapbox://styles/benjamintd/clo61jvsw003b01pb6rta5qln',
  bounds: [
    [-77.200073, 38.778566],
    [-76.859497, 39.008903],
  ],
  maxBounds: [
    [-79, 37],
    [-74, 41],
  ],
  minZoom: 6,
  fadeDuration: 50,
}


export const CITY_NAME = 'dc'

export const LOCALE = 'en'

export const GAUGE_COLORS = 'inverted'

export const LINE_GROUPS: LineGroup[] = [
  {
    title: 'Washington Metropolitan Area Transit Authority (WMATA)',
    items: [
      {
        type: 'lines',
        lines: [
          'WMATAMetroBlue',
          'WMATAMetroGreen',
          'WMATAMetroOrange',
          'WMATAMetroRed',
          'WMATAMetroSilver',
          'WMATAMetroYellow',
        ],
      },
    ],
  },
  {
    title: 'Metropolitan Washington Airports Authority (MWAA)',
    items: [
      {
        type: 'lines',
        lines: ['MWAAAeroTrain'],
      },
    ],
  },
  {
    title: 'Virginia Railway Express (VRE)',
    items: [
      {
        type: 'lines',
        lines: ['VREManassasLine', 'VREFredericksburgLine'],
      },
    ],
  },
  {
    title: 'Maryland Transit Administration (MTA)',
    items: [
      {
        type: 'lines',
        title: 'Maryland Area Rail Commuter (MARC)',
        lines: ['MARCBrunswickLine', 'MARCCamdenLine', 'MARCPennLine'],
      },
      {
        type: 'lines',
        title: 'Baltimore Metro SubwayLink',
        lines: ['MarylandMetroMetroSubwaylink'],
      },
      {
        type: 'lines',
        title: 'Light Rail',
        lines: ['MarylandLightRailLightRaillink', 'MTAPurpleLine'],
      },
    ],
  },
]

export const MAP_FROM_DATA = true

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
