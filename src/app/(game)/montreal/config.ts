import { Metadata } from 'next'
import { MapboxOptions } from 'mapbox-gl'
import { Config, Line, LineGroup } from '@/lib/types'


export const LINES: {
  [name: string]: Line
} = {
  STMMetroVerte: {
    name: 'Green',
    color: '#008E4F',
    backgroundColor: '#004727',
    textColor: '#FFFFFF',
    order: 0,
  },
  STMMetroOrange: {
    name: 'Orange',
    color: '#EF8122',
    backgroundColor: '#7F4009',
    textColor: '#FFFFFF',
    order: 1,
  },
  STMMetroJaune: {
    name: 'Yellow',
    color: '#FCD100',
    backgroundColor: '#7E6900',
    textColor: '#FFFFFF',
    order: 2,
  },
  STMMetroBleue: {
    name: 'Blue',
    color: '#0083C9',
    backgroundColor: '#004265',
    textColor: '#FFFFFF',
    order: 3,
  },
  AMTRailExo1: {
    name: 'Vaudreuil–Hudson',
    color: '#F16179',
    backgroundColor: '#9B0E25',
    textColor: '#FFFFFF',
    order: 4,
  },
  AMTRailExo2: {
    name: 'Saint-Jérôme',
    color: '#A2D586',
    backgroundColor: '#4B812D',
    textColor: '#FFFFFF',
    order: 5,
  },
  AMTRailExo3: {
    name: 'Mont-Saint-Hilaire',
    color: '#999AC6',
    backgroundColor: '#3F4071',
    textColor: '#FFFFFF',
    order: 6,
  },
  AMTRailExo4: {
    name: 'Candiac',
    color: '#5AB6B2',
    backgroundColor: '#2A5E5C',
    textColor: '#FFFFFF',
    order: 7,
  },
  AMTRailExo5: {
    name: 'Mascouche',
    color: '#CA5898',
    backgroundColor: '#6E234D',
    textColor: '#FFFFFF',
    order: 8,
  },
  MontrealREM: {
    name: 'REM',
    color: '#80C23B',
    backgroundColor: '#3A7A24',
    textColor: '#FFFFFF',
    order: 9,
  },
}

export const METADATA: Metadata = {
  title: 'Montreal Metro Memory Game',
  description: 'How many of the Montreal metro stations can you name from memory?',
  openGraph: {
    title: 'Montreal Metro Memory Game',
    description:
      'How many of the Montreal metro stations can you name from memory?',
    type: 'website',
    locale: 'en_CA',
    url: 'https://metro-memory.com/montreal',
  },
}

export const MAP_CONFIG: MapboxOptions = {
  container: 'map',
  style: 'mapbox://styles/benjamintd/cls1svcle010201peaxut9ezg',
  bounds: [
    [-74.5, 45.3],
    [-73.3, 45.8],
  ],
  maxBounds: [
    [-75.5, 44.5],
    [-72.3, 46.8],
  ],
  minZoom: 6,
  fadeDuration: 50,
}


export const CITY_NAME = 'montreal'

export const LOCALE = 'en'

export const GAUGE_COLORS = 'inverted'

export const LINE_GROUPS: LineGroup[] = [
  {
    title: 'Montréal Metro',
    items: [
      {
        type: 'lines',
        lines: ['STMMetroVerte', 'STMMetroOrange', 'STMMetroJaune', 'STMMetroBleue'],
      },
    ],
  },
  {
    title: 'Exo Commuter Rail',
    items: [
      {
        type: 'lines',
        lines: ['AMTRailExo1', 'AMTRailExo2', 'AMTRailExo3', 'AMTRailExo4', 'AMTRailExo5'],
      },
    ],
  },
  {
    title: 'Réseau express métropolitain (REM)',
    items: [
      {
        type: 'lines',
        lines: ['MontrealREM'],
      },
    ],
  },
]

const config: Config = {
  GAUGE_COLORS,
  LOCALE,
  CITY_NAME,
  MAP_CONFIG,
  METADATA,
  LINES,
  LINE_GROUPS,
}

export default config
