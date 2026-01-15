import { Metadata } from 'next'
import { MapboxOptions } from 'mapbox-gl'
import { Config, Line, LineGroup } from '@/lib/types'


export const LINES: {
  [name: string]: Line
} = {
  CM_Istanbulmetro_m1: {
    name: 'M1',
    color: '#EE2229',
    backgroundColor: '#840F0C',
    textColor: '#FFFFFF',
    order: 1,
  },
  CM_Istanbulmetro_m2: {
    name: 'M2',
    color: '#009845',
    backgroundColor: '#234D23',
    textColor: '#FFFFFF',
    order: 2,
  },
  CM_Istanbulmetro_m3: {
    name: 'M3',
    color: '#00a7e1',
    backgroundColor: '#13587E',
    textColor: '#FFFFFF',
    order: 3,
  },
  CM_Istanbulmetro_m4: {
    name: 'M4',
    color: '#e81f76',
    backgroundColor: '#840F36',
    textColor: '#FFFFFF',
    order: 4,
  },
  CM_Istanbulmetro_m5: {
    name: 'M5',
    color: '#673065',
    backgroundColor: '#341832',
    textColor: '#FFFFFF',
    order: 5,
  },
  CM_Istanbulmetro_m6: {
    name: 'M6',
    color: '#c8a977',
    backgroundColor: '#73572D',
    textColor: '#FFFFFF',
    order: 6,
  },
  CM_Istanbulmetro_m7: {
    name: 'M7',
    color: '#f29ebf',
    backgroundColor: '#AF174E',
    textColor: '#FFFFFF',
    order: 7,
  },
  CM_Istanbulmetro_m8: {
    name: 'M8',
    color: '#447abe',
    backgroundColor: '#0E1A40',
    textColor: '#FFFFFF',
    order: 8,
  },
  CM_Istanbulmetro_m9: {
    name: 'M9',
    color: '#ffd300',
    backgroundColor: '#91890C',
    textColor: '#1d1d1b',
    order: 9,
  },
  CM_Istanbulmetro_m10: {
    name: 'M10',
    color: '#4DA93E',
    backgroundColor: '#27561E',
    textColor: '#FFFFFF',
    order: 10,
  },
  CM_Istanbulmetro_m11: {
    name: 'M11',
    color: '#ab548f',
    backgroundColor: '#562948',
    textColor: '#FFFFFF',
    order: 11,
  },
  CM_CagdasTramvay_t1: {
    name: 'T1',
    color: '#004987',
    backgroundColor: '#002040',
    textColor: '#ffffff',
    order: 12,
  },
  CM_NostaljikTramvay_t2: {
    name: 'T2',
    color: '#90aba0',
    backgroundColor: '#415D56',
    textColor: '#FFFFFF',
    order: 13,
  },
  CM_NostaljikTramvay_t3: {
    name: 'T3',
    color: '#9b552b',
    backgroundColor: '#4C351C',
    textColor: '#FFFFFF',
    order: 14,
  },
  CM_CagdasTramvay_t4: {
    name: 'T4',
    color: '#ff7f40',
    backgroundColor: '#804020',
    textColor: '#FFFFFF',
    order: 15,
  },
  CM_CagdasTramvay_t5: {
    name: 'T5',
    color: '#7c72b3',
    backgroundColor: '#3A335F',
    textColor: '#FFFFFF',
    order: 16,
  },
}

export const LINE_GROUPS: LineGroup[] = [
  {
    title: 'Lines',
    items: [
      {
        type: 'lines',
        lines: ['CM_Istanbulmetro_m1', 'CM_Istanbulmetro_m2', 'CM_Istanbulmetro_m3', 'CM_Istanbulmetro_m4', 'CM_Istanbulmetro_m5', 'CM_Istanbulmetro_m6', 'CM_Istanbulmetro_m7', 'CM_Istanbulmetro_m8', 'CM_Istanbulmetro_m9', 'CM_Istanbulmetro_m10', 'CM_Istanbulmetro_m11', 'CM_CagdasTramvay_t1', 'CM_NostaljikTramvay_t2', 'CM_NostaljikTramvay_t3', 'CM_CagdasTramvay_t4', 'CM_CagdasTramvay_t5'],
      },
    ],
  },
]

export const METADATA: Metadata = {
  icons: {
    icon: '/api/city-icon/istanbul',
    apple: '/api/city-icon/istanbul',
  },
  title: 'Istanbul Metro Memory',
  description:
    'İstanbul metrosu hakkında bilgi edinin ve hafızanızı test edin.',
  openGraph: {
    title: 'Istanbul Metro Memory',
    description:
      'İstanbul metrosu hakkında bilgi edinin ve hafızanızı test edin.',
    type: 'website',
    locale: 'tr_TR',
    url: 'https://metro-memory.com/istanbul',
  },
}

export const MAP_CONFIG: MapboxOptions = {
  container: 'map',
  style: 'mapbox://styles/benjamintd/clps41c9x018601o979y3cyxg',
  bounds: [
    [28.543, 40.802],
    [29.4, 41.4],
  ],
  maxBounds: [
    [27.543, 39.802],
    [30.4, 42.4],
  ],
  minZoom: 6,
  fadeDuration: 50,
}


export const CITY_NAME = 'istanbul'

export const LOCALE = 'tr'

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
