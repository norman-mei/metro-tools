import { Metadata } from 'next'
import { MapboxOptions } from 'mapbox-gl'
import { Config, Line, LineGroup } from '@/lib/types'


export const LINES: {
  [name: string]: Line
} = {
  MadridMetroL1: {
    name: '1',
    color: '#3CB4E5',
    backgroundColor: '#004E71',
    textColor: '#FFFFFF',
    order: 1,
  },
  MadridMetroL2: {
    name: '2',
    color: '#E1251B',
    backgroundColor: '#71050B',
    textColor: '#FFFFFF',
    order: 2,
  },
  MadridMetroL3: {
    name: '3',
    color: '#FFCD00',
    backgroundColor: '#805E00',
    textColor: '#FFFFFF',
    order: 3,
  },
  MadridMetroL4: {
    name: '4',
    color: '#A65A2A',
    backgroundColor: '#5F290B',
    textColor: '#FFFFFF',
    order: 4,
  },
  MadridMetroL5: {
    name: '5',
    color: '#80BC00',
    backgroundColor: '#375612',
    textColor: '#FFFFFF',
    order: 5,
  },
  MadridMetroL6: {
    name: '6',
    color: '#7B868C',
    backgroundColor: '#393837',
    textColor: '#FFFFFF',
    order: 6,
  },
  MadridMetroL7: {
    name: '7',
    color: '#FF8300',
    backgroundColor: '#852907',
    textColor: '#FFFFFF',
    order: 7,
  },
  MadridMetroL8: {
    name: '8',
    color: '#EE6FBB',
    backgroundColor: '#911344',
    textColor: '#FFFFFF',
    order: 8,
  },
  MadridMetroL9: {
    name: '9',
    color: '#B11CAB',
    backgroundColor: '#3D0A32',
    textColor: '#FFFFFF',
    order: 9,
  },
  MadridMetroL10: {
    name: '10',
    color: '#003DA6',
    backgroundColor: '#002143',
    textColor: '#FFFFFF',
    order: 10,
  },
  MadridMetroL11: {
    name: '11',
    color: '#00953B',
    backgroundColor: '#00351E',
    textColor: '#FFFFFF',
    order: 11,
  },
  MadridMetroL12: {
    name: '12',
    color: '#A19200',
    backgroundColor: '#554B04',
    textColor: '#FFFFFF',
    order: 12,
  },
  MetroLigeroMl1: {
    name: 'ML1',
    color: '#0C61A0',
    backgroundColor: '#063150',
    textColor: '#FFFFFF',
    order: 13,
  },
  MetroLigeroMl2: {
    name: 'ML2',
    color: '#7A1364',
    backgroundColor: '#3D0A32',
    textColor: '#FFFFFF',
    order: 14,
  },
  MetroLigeroMl3: {
    name: 'ML3',
    color: '#E20A16',
    backgroundColor: '#71050B',
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
        lines: ['MadridMetroL1', 'MadridMetroL2', 'MadridMetroL3', 'MadridMetroL4', 'MadridMetroL5', 'MadridMetroL6', 'MadridMetroL7', 'MadridMetroL8', 'MadridMetroL9', 'MadridMetroL10', 'MadridMetroL11', 'MadridMetroL12', 'MetroLigeroMl1', 'MetroLigeroMl2', 'MetroLigeroMl3'],
      },
    ],
  },
]

export const METADATA: Metadata = {
  icons: {
    icon: '/api/city-icon/madrid',
    apple: '/api/city-icon/madrid',
  },
  title: 'Madrid Metro Memory',
  description:
    '¿Cuántas estaciones del metro de Madrid puedes nombrar de memoria?',
  openGraph: {
    title: 'Madrid Metro Memory',
    description:
      '¿Cuántas estaciones del metro de Madrid puedes nombrar de memoria? Prueba este juego para averiguarlo.',
    type: 'website',
    locale: 'es_ES',
    url: 'https://metro-memory.com/madrid',
  },
}

export const MAP_CONFIG: MapboxOptions = {
  container: 'map',
  style: 'mapbox://styles/benjamintd/clohp062g002b01o4e3lt1exh',
  bounds: [
    [-4.184549, 40.156349],
    [-3.19578, 40.62702],
  ],
  maxBounds: [
    [-5.184549, 39.156349],
    [-2.19578, 41.62702],
  ],
  minZoom: 6,
  fadeDuration: 50,
}


export const CITY_NAME = 'madrid'

export const LOCALE = 'es'

export const MAP_FROM_DATA = true

export const GAUGE_COLORS = 'inverted'

const config: Config = {
  GAUGE_COLORS,
  MAP_FROM_DATA,
  LOCALE,
  CITY_NAME,
  LINE_GROUPS,
  MAP_CONFIG,
  METADATA,
  LINES,
}

export default config
