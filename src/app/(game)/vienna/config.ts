import { Metadata } from 'next'
import { MapboxOptions } from 'mapbox-gl'
import { Config, Line, LineGroup } from '@/lib/types'


export const LINES: {
  [name: string]: Line
} = {
  ViennaUBahnU1: {
    name: 'U1',
    color: '#E20512',
    backgroundColor: '#710309',
    textColor: '#FFFFFF',
    order: 1000,
  },
  ViennaUBahnU2: {
    name: 'U2',
    color: '#A762A3',
    backgroundColor: '#553053',
    textColor: '#FFFFFF',
    order: 1000,
  },
  ViennaUBahnU3: {
    name: 'U3',
    color: '#EE7D00',
    backgroundColor: '#773E00',
    textColor: '#FFFFFF',
    order: 1000,
  },
  ViennaUBahnU4: {
    name: 'U4',
    color: '#009540',
    backgroundColor: '#004B20',
    textColor: '#FFFFFF',
    order: 1000,
  },
  ViennaUBahnU6: {
    name: 'U6',
    color: '#9D6930',
    backgroundColor: '#4F3418',
    textColor: '#FFFFFF',
    order: 1000,
  },
}

export const LINE_GROUPS: LineGroup[] = [
  {
    title: 'Lines',
    items: [
      {
        type: 'lines',
        lines: ['ViennaUBahnU1', 'ViennaUBahnU2', 'ViennaUBahnU3', 'ViennaUBahnU4', 'ViennaUBahnU6', 'ViennaStrassenbahn38', 'ViennaStrassenbahn44'],
      },
    ],
  },
]

export const METADATA: Metadata = {
  icons: {
    icon: '/api/city-icon/vienna',
    apple: '/api/city-icon/vienna',
  },
  title: 'Wien U-Bahn Memory',
  description: 'Wie viele U-Bahn Stationen können Sie auswendig nennen?',
  openGraph: {
    title: 'Wien U-Bahn Memory',
    description:
      'Wie viele U-Bahn-Stationen können Sie auswendig nennen? Spielen Sie das Wien Bahn Memory und finden Sie es heraus!',
    type: 'website',
    locale: 'de_DE',
    url: 'https://metro-memory.com/vienna',
  },
}

export const MAP_CONFIG: MapboxOptions = {
  container: 'map',
  style: 'mapbox://styles/benjamintd/clo7oftgy00y701pf3zfaf7un',
  bounds: [
    [16.085209, 48.059028],
    [16.632466, 48.379277],
  ],
  maxBounds: [
    [14.9, 46.9],
    [17.8, 49.5],
  ],
  minZoom: 6,
  fadeDuration: 50,
  dragRotate: false,
}


export const CITY_NAME = 'vienna'

export const LOCALE = 'de'

export const MAP_FROM_DATA = true

const config: Config = {
  MAP_FROM_DATA,
  GAUGE_COLORS: 'inverted',
  LOCALE,
  CITY_NAME,
  LINE_GROUPS,
  MAP_CONFIG,
  METADATA,
  LINES,
}

export default config
