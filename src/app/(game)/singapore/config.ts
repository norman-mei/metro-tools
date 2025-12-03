import { Metadata } from 'next'
import { MapboxOptions } from 'mapbox-gl'
import { Config, Line } from '@/lib/types'


export const LINES: {
  [name: string]: Line
} = {
  SingaporeMRTCircleLine: {
    name: 'Circle Line',
    color: '#F79F07',
    backgroundColor: '#7C5003',
    textColor: '#FFFFFF',
    order: 0,
  },
  SingaporeMRTDowntownLine: {
    name: 'Downtown Line',
    color: '#03529F',
    backgroundColor: '#012950',
    textColor: '#FFFFFF',
    order: 1,
  },
  SingaporeMRTEastwestLine: {
    name: 'East West Line',
    color: '#009D57',
    backgroundColor: '#004F2C',
    textColor: '#FFFFFF',
    order: 2,
  },
  SingaporeMRTNortheastLine: {
    name: 'North East Line',
    color: '#851197',
    backgroundColor: '#43084C',
    textColor: '#FFFFFF',
    order: 3,
  },
  SingaporeMRTNorthsouthLine: {
    name: 'North South Line',
    color: '#DF2518',
    backgroundColor: '#70130C',
    textColor: '#FFFFFF',
    order: 4,
  },
  CM_SingaporeMRT_tel: {
    name: 'Thomson-East Coast Line',
    color: '#8b572a',
    backgroundColor: '#462C15',
    textColor: '#FFFFFF',
    order: 5,
  },
  // SingaporeLRTBukitPanjangLine: {
  //   name: 'Bukit Panjang Line',
  //   color: '#748477',
  //   backgroundColor: '#3A423C',
  //   textColor: '#FFFFFF',
  //   order: 6,
  // },
  // SingaporeLRTPunggolLineEastLoop: {
  //   name: 'Punggol (East)',
  //   color: '#748477',
  //   backgroundColor: '#3A423C',
  //   textColor: '#FFFFFF',
  //   order: 7,
  // },
  // SingaporeLRTPunggolLineWestLoop: {
  //   name: 'Punggol (West)',
  //   color: '#748477',
  //   backgroundColor: '#3A423C',
  //   textColor: '#FFFFFF',
  //   order: 8,
  // },
  // SingaporeLRTSengkangLineEastLoop: {
  //   name: 'Sengkang (East)',
  //   color: '#748477',
  //   backgroundColor: '#3A423C',
  //   textColor: '#FFFFFF',
  //   order: 9,
  // },
  // SingaporeLRTSengkangLineWestLoop: {
  //   name: 'Sengkang (West)',
  //   color: '#748477',
  //   backgroundColor: '#3A423C',
  //   textColor: '#FFFFFF',
  //   order: 10,
  // },
}

export const METADATA: Metadata = {
  icons: {
    icon: '/api/city-icon/singapore',
    apple: '/api/city-icon/singapore',
  },
  title: 'Singapore Metro Memory Game',
  description:
    'How many of the Singapore MRT/LRT stations can you name from memory?',
  openGraph: {
    title: 'Singapore Metro Memory Game',
    description:
      'How many of the Singapore MRT/LRT stations can you name from memory?',
    type: 'website',
    locale: 'en_GB',
    url: 'https://metro-memory.com/singapore',
  },
}

export const MAP_CONFIG: MapboxOptions = {
  container: 'map',
  style: 'mapbox://styles/benjamintd/clqxldtyh013n01nw6w7ihjll',
  bounds: [
    [103.605, 1.16],
    [104.05, 1.47],
  ],
  maxBounds: [
    [102.605, 0.16],
    [105.05, 2.47],
  ],
  minZoom: 6,
  fadeDuration: 50,
}


export const CITY_NAME = 'singapore'

export const LOCALE = 'en'

const config: Config = {
  LOCALE,
  CITY_NAME,
  MAP_CONFIG,
  METADATA,
  LINES,
}

export default config
