import { Metadata } from 'next'
import { MapboxOptions } from 'mapbox-gl'
import { Config, Line, LineGroup } from '@/lib/types'


export const LINES: {
  [name: string]: Line
} = {
  MunichUBahn_UbahnU1: {
    name: 'U1',
    color: '#52822f',
    backgroundColor: '#294118',
    textColor: '#FFFFFF',
    order: 0,
  },
  MunichUBahn_UbahnU2: {
    name: 'U2',
    color: '#c20831',
    backgroundColor: '#610418',
    textColor: '#FFFFFF',
    order: 1,
  },
  MunichUBahn_UbahnU3: {
    name: 'U3',
    color: '#ed6725',
    backgroundColor: '#7F310A',
    textColor: '#FFFFFF',
    order: 2,
  },
  MunichUBahn_UbahnU4: {
    name: 'U4',
    color: '#03a984',
    backgroundColor: '#015442',
    textColor: '#FFFFFF',
    order: 3,
  },
  MunichUBahn_UbahnU5: {
    name: 'U5',
    color: '#bc7a02',
    backgroundColor: '#5E3D01',
    textColor: '#FFFFFF',
    order: 4,
  },
  MunichUBahn_UbahnU6: {
    name: 'U6',
    color: '#0165ad',
    backgroundColor: '#003357',
    textColor: '#FFFFFF',
    order: 5,
  },
  MunichUBahn_UbahnU7: {
    name: 'U7',
    color: '#8a4530',
    backgroundColor: '#452318',
    textColor: '#FFFFFF',
    order: 6,
  },
  MunichUBahn_UbahnU8: {
    name: 'U8',
    color: '#d7372b',
    backgroundColor: '#6D1B14',
    textColor: '#FFFFFF',
    order: 7,
  },
  MunichSBahn_DbRegioAgBayernS1: {
    name: 'S1',
    color: '#6EBEE7',
    backgroundColor: '#186992',
    textColor: '#FFFFFF',
    order: 8,
  },
  MunichSBahn_DbRegioAgBayernS2: {
    name: 'S2',
    color: '#81BE4F',
    backgroundColor: '#406224',
    textColor: '#FFFFFF',
    order: 9,
  },
  MunichSBahn_DbRegioAgBayernS20: {
    name: 'S20',
    color: '#D35A71',
    backgroundColor: '#772030',
    textColor: '#FFFFFF',
    order: 10,
  },
  MunichSBahn_DbRegioAgBayernS3: {
    name: 'S3',
    color: '#6A157A',
    backgroundColor: '#350B3D',
    textColor: '#FFFFFF',
    order: 11,
  },
  MunichSBahn_DbRegioAgBayernS4: {
    name: 'S4',
    color: '#CD2229',
    backgroundColor: '#661114',
    textColor: '#FFFFFF',
    order: 12,
  },
  MunichSBahn_DbRegioAgBayernS6: {
    name: 'S6',
    color: '#4D8955',
    backgroundColor: '#26452B',
    textColor: '#FFFFFF',
    order: 13,
  },
  MunichSBahn_DbRegioAgBayernS7: {
    name: 'S7',
    color: '#823B36',
    backgroundColor: '#411E1B',
    textColor: '#FFFFFF',
    order: 14,
  },
  MunichSBahn_DbRegioAgBayernS8: {
    name: 'S8',
    color: '#201C1C',
    backgroundColor: '#100E0E',
    textColor: '#FFFFFF',
    order: 15,
  },
}

export const LINE_GROUPS: LineGroup[] = [
  {
    title: 'Lines',
    items: [
      {
        type: 'lines',
        lines: ['MunichUBahn_UbahnU1', 'MunichUBahn_UbahnU2', 'MunichUBahn_UbahnU3', 'MunichUBahn_UbahnU4', 'MunichUBahn_UbahnU5', 'MunichUBahn_UbahnU6', 'MunichUBahn_UbahnU7', 'MunichUBahn_UbahnU8', 'MunichSBahn_DbRegioAgBayernS1', 'MunichSBahn_DbRegioAgBayernS2', 'MunichSBahn_DbRegioAgBayernS20', 'MunichSBahn_DbRegioAgBayernS3', 'MunichSBahn_DbRegioAgBayernS4', 'MunichSBahn_DbRegioAgBayernS6', 'MunichSBahn_DbRegioAgBayernS7', 'MunichSBahn_DbRegioAgBayernS8', 'AugsburgTram_Strassenbahn1', 'AugsburgTram_Strassenbahn2', 'AugsburgTram_Strassenbahn3', 'AugsburgTram_Strassenbahn4', 'AugsburgTram_Strassenbahn6', 'AugsburgTram_Strassenbahn8'],
      },
    ],
  },
]

export const METADATA: Metadata = {
  icons: {
    icon: '/api/city-icon/munich',
    apple: '/api/city-icon/munich',
  },
  title: 'München Bahn Memory',
  description: 'Wie viele S- und U-Bahn Stationen können Sie auswendig nennen?',
  openGraph: {
    title: 'München Bahn Memory',
    description:
      'Wie viele S- und U-Bahn-Stationen können Sie auswendig nennen? Spielen Sie das München Bahn Memory und finden Sie es heraus!',
    type: 'website',
    locale: 'de_DE',
    url: 'https://metro-memory.com/europe/germany/munich',
  },
}

export const MAP_CONFIG: MapboxOptions = {
  container: 'map',
  style: 'mapbox://styles/benjamintd/cls4h02hy019201qygvumc0nb', // generic
  minZoom: 6,
  fadeDuration: 50,
  dragRotate: false,
}


export const CITY_NAME = 'munich'

export const LOCALE = 'de'

export const MAP_FROM_DATA = true

const config: Config = {
  GAUGE_COLORS: 'inverted',
  MAP_FROM_DATA,
  LOCALE,
  CITY_NAME,
  LINE_GROUPS,
  MAP_CONFIG,
  METADATA,
  LINES,
}

export default config
