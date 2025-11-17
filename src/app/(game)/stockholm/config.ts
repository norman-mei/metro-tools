import { Metadata } from 'next'
import { MapboxOptions } from 'mapbox-gl'
import { Line } from '@/lib/types'


export const LINES: {
  [name: string]: Line
} = {
  Tunnelbana10: {
    name: 'T10',
    color: '#0066B7',
    backgroundColor: '#00335C',
    textColor: '#FFFFFF',
    order: 0,
  },
  Tunnelbana11: {
    name: 'T11',
    color: '#0066B7',
    backgroundColor: '#00335C',
    textColor: '#FFFFFF',
    order: 1,
  },
  Tunnelbana13: {
    name: 'T13',
    color: '#D90011',
    backgroundColor: '#6D0008',
    textColor: '#FFFFFF',
    order: 2,
  },
  Tunnelbana14: {
    name: 'T14',
    color: '#D90011',
    backgroundColor: '#6D0008',
    textColor: '#FFFFFF',
    order: 3,
  },
  Tunnelbana17: {
    name: 'T17',
    color: '#44A326',
    backgroundColor: '#225213',
    textColor: '#FFFFFF',
    order: 4,
  },
  Tunnelbana18: {
    name: 'T18',
    color: '#44A326',
    backgroundColor: '#225213',
    textColor: '#FFFFFF',
    order: 5,
  },
  Tunnelbana19: {
    name: 'T19',
    color: '#44A326',
    backgroundColor: '#225213',
    textColor: '#FFFFFF',
    order: 6,
  },
}

export const METADATA: Metadata = {
  title: 'Stockholm Metro Memory',
  description: 'Hur bra kan du namnen på Stockholms tunnelbanestationer?',
  openGraph: {
    title: 'Stockholm Metro Memory',
    description: 'Hur bra kan du namnen på Stockholms tunnelbanestationer?',
    type: 'website',
    locale: 'sv_SE',
    url: 'https://metro-memory.com/stockholm',
  },
}

export const MAP_CONFIG: MapboxOptions = {
  container: 'map',
  style: 'mapbox://styles/benjamintd/clq43c36701xd01pj25i277ad',
  bounds: [
    [17.582708, 59.153138],
    [18.571478, 59.46854],
  ],
  maxBounds: [
    [16.582708, 58.153138],
    [19.571478, 60.46854],
  ],
  minZoom: 6,
  fadeDuration: 50,
}


export const CITY_NAME = 'stockholm'

export const LOCALE = 'sv'

const config = {
  LOCALE,
  CITY_NAME,
  MAP_CONFIG,
  METADATA,
  LINES,
}

export default config
