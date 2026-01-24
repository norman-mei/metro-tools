import { Config, Line } from '@/lib/types'
import { MapboxOptions } from 'mapbox-gl'
import { Metadata } from 'next'


export const LINES: {
  [name: string]: Line
} = {
  U1: {
    name: 'U1',
    color: '#54A931',
    backgroundColor: '#2A5518',
    textColor: '#FFFFFF',
    order: 1,
  },
  U2: {
    name: 'U2',
    color: '#E0491B',
    backgroundColor: '#70240D',
    textColor: '#FFFFFF',
    order: 2,
  },
  U3: {
    name: 'U3',
    color: '#27A291',
    backgroundColor: '#145149',
    textColor: '#FFFFFF',
    order: 3,
  },
  U4: {
    name: 'U4',
    color: '#F5D300',
    backgroundColor: '#7B6A00',
    textColor: '#000000',
    order: 4,
  },
  U5: {
    name: 'U5',
    color: '#83532C',
    backgroundColor: '#412716',
    textColor: '#FFFFFF',
    order: 5,
  },
  U6: {
    name: 'U6',
    color: '#8D72AD',
    backgroundColor: '#46355B',
    textColor: '#FFFFFF',
    order: 6,
  },
  U7: {
    name: 'U7',
    color: '#009AD2',
    backgroundColor: '#004D69',
    textColor: '#FFFFFF',
    order: 7,
  },
  U8: {
    name: 'U8',
    color: '#00599A',
    backgroundColor: '#002C4D',
    textColor: '#FFFFFF',
    order: 8,
  },
  U9: {
    name: 'U9',
    color: '#E88300',
    backgroundColor: '#744100',
    textColor: '#FFFFFF',
    order: 9,
  },
  S1: {
    name: 'S1',
    color: '#DD6BA7',
    backgroundColor: '#851F55',
    textColor: '#FFFFFF',
    order: 11,
  },
  S2: {
    name: 'S2',
    color: '#007D3D',
    backgroundColor: '#003F1E',
    textColor: '#FFFFFF',
    order: 12,
  },
  S25: {
    name: 'S25',
    color: '#007D3D',
    backgroundColor: '#003F1E',
    textColor: '#FFFFFF',
    order: 12.5,
  },
  S26: {
    name: 'S26',
    color: '#007D3D',
    backgroundColor: '#003F1E',
    textColor: '#FFFFFF',
    order: 12.6,
  },
  S3: {
    name: 'S3',
    color: '#0063AC',
    backgroundColor: '#003156',
    textColor: '#FFFFFF',
    order: 13,
  },
  S41: {
    name: 'S41',
    color: '#A0402D',
    backgroundColor: '#502017',
    textColor: '#FFFFFF',
    order: 14.1,
  },
  S42: {
    name: 'S42',
    color: '#BC612B',
    backgroundColor: '#5E3116',
    textColor: '#FFFFFF',
    order: 14.2,
  },
  S45: {
    name: 'S45',
    color: '#C28A3E',
    backgroundColor: '#61451F',
    textColor: '#FFFFFF',
    order: 14.5,
  },
  S46: {
    name: 'S46',
    color: '#C28A3E',
    backgroundColor: '#61451F',
    textColor: '#FFFFFF',
    order: 14.6,
  },
  S47: {
    name: 'S47',
    color: '#C28A3E',
    backgroundColor: '#61451F',
    textColor: '#FFFFFF',
    order: 14.7,
  },
  S5: {
    name: 'S5',
    color: '#E57116',
    backgroundColor: '#72380B',
    textColor: '#FFFFFF',
    order: 15,
  },
  S7: {
    name: 'S7',
    color: '#846AAA',
    backgroundColor: '#413258',
    textColor: '#FFFFFF',
    order: 17,
  },
  S75: {
    name: 'S75',
    color: '#846AAA',
    backgroundColor: '#413258',
    textColor: '#FFFFFF',
    order: 17.5,
  },
  S8: {
    name: 'S8',
    color: '#66AF2F',
    backgroundColor: '#335818',
    textColor: '#FFFFFF',
    order: 18,
  },
  S85: {
    name: 'S85',
    color: '#66AF2F',
    backgroundColor: '#335818',
    textColor: '#FFFFFF',
    order: 18.5,
  },
  S9: {
    name: 'S9',
    color: '#952449',
    backgroundColor: '#4B1224',
    textColor: '#FFFFFF',
    order: 19,
  },
}

export const METADATA: Metadata = {
  icons: {
    icon: '/api/city-icon/berlin',
    apple: '/api/city-icon/berlin',
  },
  title: 'Berlin Bahn Memory',
  description: 'Wie viele S- und U-Bahn Stationen können Sie auswendig nennen?',
  openGraph: {
    title: 'Berlin Bahn Memory',
    description:
      'Wie viele S- und U-Bahn-Stationen können Sie auswendig nennen? Spielen Sie das Berlin Bahn Memory und finden Sie es heraus!',
    type: 'website',
    locale: 'de_DE',
    url: 'https://metro-memory.com/europe/germany/berlin',
  },
}

export const MAP_CONFIG: MapboxOptions = {
  container: 'map',
  style: 'mapbox://styles/benjamintd/clnyoo0bq00at01qq9q2pdepl',
  bounds: [
    [13.088304, 52.341823],
    [13.761117, 52.675454],
  ],
  maxBounds: [
    [12.088304, 51.341823],
    [14.761117, 53.675454],
  ],
  minZoom: 6,
  fadeDuration: 50,
  dragRotate: false,
}


export const CITY_NAME = 'berlin'

export const LOCALE = 'de'

export const MAP_FROM_DATA = true

const config: Config = {
  GAUGE_COLORS: 'inverted',
  MAP_FROM_DATA: true,
  LOCALE,
  CITY_NAME,
  MAP_CONFIG,
  METADATA,
  LINES,
}

export default config
