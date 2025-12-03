import { Metadata } from 'next'
import { MapboxOptions } from 'mapbox-gl'
import { Config, Line } from '@/lib/types'


// Note: below LINES data is just a copy of generated data/lines.json
export const LINES: {
  [name: string]: Line
} = {
  PotsdamTram91: {
    name: '91',
    color: '#ff2e17',
    backgroundColor: '#8B0E00',
    textColor: '#FFFFFF',
    order: 1,
  },
  PotsdamTram92: {
    name: '92',
    color: '#024890',
    backgroundColor: '#012448',
    textColor: '#FFFFFF',
    order: 2,
  },
  PotsdamTram93: {
    name: '93',
    color: '#ff7322',
    backgroundColor: '#913500',
    textColor: '#FFFFFF',
    order: 3,
  },
  PotsdamTram94: {
    name: '94',
    color: '#89969e',
    backgroundColor: '#434B51',
    textColor: '#FFFFFF',
    order: 4,
  },
  PotsdamTram96: {
    name: '96',
    color: '#00b098',
    backgroundColor: '#00584C',
    textColor: '#FFFFFF',
    order: 5,
  },
  PotsdamTram98: {
    name: '98',
    color: '#009edd',
    backgroundColor: '#004F6F',
    textColor: '#FFFFFF',
    order: 6,
  },
  PotsdamTram99: {
    name: '99',
    color: '#5fbf49',
    backgroundColor: '#2E6222',
    textColor: '#FFFFFF',
    order: 7,
  },
}

export const METADATA: Metadata = {
  icons: {
    icon: '/api/city-icon/potsdam',
    apple: '/api/city-icon/potsdam',
  },
  title: 'Potsdam Tram Memory',
  description: 'Wie viele Tram-Stationen können Sie auswendig nennen?',
  openGraph: {
    title: 'Potsdam Tram Memory',
    description:
      'Wie viele Tram-Stationen können Sie auswendig nennen? Spielen Sie das Potsdam Tram Memory und finden Sie es heraus!',
    type: 'website',
    locale: 'de_DE',
    url: 'https://metro-memory.com/potsdam',
  },
}

export const MAP_CONFIG: MapboxOptions = {
  container: 'map',
  style: 'mapbox://styles/benjamintd/cls4h02hy019201qygvumc0nb', // generic
  minZoom: 6,
  fadeDuration: 50,
  dragRotate: false,
}


export const CITY_NAME = 'potsdam'

export const LOCALE = 'de'

export const MAP_FROM_DATA = true

const config: Config = {
  GAUGE_COLORS: 'inverted',
  MAP_FROM_DATA,
  LOCALE,
  CITY_NAME,
  MAP_CONFIG,
  METADATA,
  LINES,
}

export default config
