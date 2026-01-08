import { Metadata } from 'next'
import { MapboxOptions } from 'mapbox-gl'
import { Config, Line, LineGroup } from '@/lib/types'


export const LINES: {
  [name: string]: Line
} = {
  TMBMetroFm: {
    name: 'FM',
    color: '#004C38',
    backgroundColor: '#00261C',
    textColor: '#FFFFFF',
    order: 0,
  },
  TMBMetroL1: {
    name: 'L1',
    color: '#DC2C33',
    backgroundColor: '#711317',
    textColor: '#FFFFFF',
    order: 1,
  },
  TMBMetroL2: {
    name: 'L2',
    color: '#99378D',
    backgroundColor: '#4D1B47',
    textColor: '#FFFFFF',
    order: 2,
  },
  TMBMetroL3: {
    name: 'L3',
    color: '#31AA47',
    backgroundColor: '#185523',
    textColor: '#FFFFFF',
    order: 3,
  },
  TMBMetroL4: {
    name: 'L4',
    color: '#FCBF00',
    backgroundColor: '#7E6000',
    textColor: '#000000',
    order: 4,
  },
  TMBMetroL5: {
    name: 'L5',
    color: '#0175BC',
    backgroundColor: '#003B5E',
    textColor: '#FFFFFF',
    order: 5,
  },
  FGCL6: {
    name: 'L6',
    color: '#7883BE',
    backgroundColor: '#323B69',
    textColor: '#FFFFFF',
    order: 6,
  },
  FGCL7: {
    name: 'L7',
    color: '#B1660E',
    backgroundColor: '#593307',
    textColor: '#FFFFFF',
    order: 7,
  },
  FGCL8: {
    name: 'L8',
    color: '#E376AC',
    backgroundColor: '#8F1D56',
    textColor: '#FFFFFF',
    order: 8,
  },
  TMBMetroL9: {
    name: 'L9S',
    color: '#F18C12',
    backgroundColor: '#7A4607',
    textColor: '#FFFFFF',
    order: 9,
  },
  TMBMetroL10: {
    name: 'L10S',
    color: '#009EE1',
    backgroundColor: '#004F71',
    textColor: '#FFFFFF',
    order: 10,
  },
  TMBMetroL11: {
    name: 'L11',
    color: '#B4D05E',
    backgroundColor: '#617522',
    textColor: '#FFFFFF',
    order: 11,
  },
  FGCL12: {
    name: 'L12',
    color: '#B2AED4',
    backgroundColor: '#49437E',
    textColor: '#FFFFFF',
    order: 12,
  },
  // BarcelonaFunicularFv: {
  //   name: 'FV',
  //   color: '#0A57A3',
  //   backgroundColor: '#052C52',
  //   textColor: '#FFFFFF',
  //   order: 15,
  // },
  // BarcelonaFunicularMm: {
  //   name: 'MM',
  //   color: '#0B610B',
  //   backgroundColor: '#063106',
  //   textColor: '#FFFFFF',
  //   order: 16,
  // },
  // BarcelonaFunicularL1: {
  //   name: 'L1',
  //   color: '#044b84',
  //   backgroundColor: '#022542',
  //   textColor: '#FFFFFF',
  //   order: 17,
  // },
  TramCatT1: {
    name: 'T1',
    color: '#008D78',
    backgroundColor: '#004137',
    textColor: '#FFFFFF',
    order: 18,
  },
  TramCatT2: {
    name: 'T2',
    color: '#008D78',
    backgroundColor: '#004137',
    textColor: '#FFFFFF',
    order: 19,
  },
  TramCatT3: {
    name: 'T3',
    color: '#008D78',
    backgroundColor: '#004137',
    textColor: '#FFFFFF',
    order: 20,
  },
  TramCatT4: {
    name: 'T4',
    color: '#008D78',
    backgroundColor: '#004137',
    textColor: '#FFFFFF',
    order: 21,
  },
  TramCatT5: {
    name: 'T5',
    color: '#008D78',
    backgroundColor: '#004137',
    textColor: '#FFFFFF',
    order: 22,
  },
  TramCatT6: {
    name: 'T6',
    color: '#008D78',
    backgroundColor: '#004137',
    textColor: '#FFFFFF',
    order: 23,
  },
}

export const METADATA: Metadata = {
  icons: {
    icon: '/api/city-icon/barcelona',
    apple: '/api/city-icon/barcelona',
  },
  title: 'Barcelona Metro Memory',
  description:
    'Quantes estacions del metro de Barcelona pots nomenar de memòria? Prova aquest joc per descobrir-ho.',
  openGraph: {
    title: 'Barcelona Metro Memory',
    description:
      'Quantes estacions del metro de Barcelona pots nomenar de memòria? Prova aquest joc per descobrir-ho.',
    type: 'website',
    locale: 'es_ES',
    url: 'https://metro-memory.com/barcelona',
  },
}

export const MAP_CONFIG: MapboxOptions = {
  container: 'map',
  style: 'mapbox://styles/benjamintd/clp12r91101bk01qm5mnnek1f',
  bounds: [
    [1.997, 41.244],
    [2.3577, 41.489],
  ],
  maxBounds: [
    [0.997, 40.244],
    [3.3577, 42.489],
  ],
  minZoom: 6,
  fadeDuration: 50,
}


export const CITY_NAME = 'barcelona'

export const LOCALE = 'ca'

export const MAP_FROM_DATA = true

export const LINE_GROUPS: LineGroup[] = [
  {
    title: 'Transports Metropolitans de Barcelona (TMB) & Ferrocarrils de la Generalitat de Catalunya (FGC)',
    items: [
      {
        type: 'lines',
        lines: [
          'TMBMetroFm',
          'TMBMetroL1',
          'TMBMetroL2',
          'TMBMetroL3',
          'TMBMetroL4',
          'TMBMetroL5',
          'FGCL6',
          'FGCL7',
          'FGCL8',
          'TMBMetroL9',
          'TMBMetroL10',
          'FGCL12',
          'TMBMetroL11',
          'TMBMetroL9n',
          'TMBMetroL10n',
        ],
      },
    ],
  },
  {
    items: [{ type: 'separator' }],
  },
  {
    title: 'Trambaix / Trambesòs',
    items: [
      {
        type: 'lines',
        lines: ['TramCatT1', 'TramCatT2', 'TramCatT3', 'TramCatT4', 'TramCatT5', 'TramCatT6'],
      },
    ],
  },
]

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
