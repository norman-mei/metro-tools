import { Metadata } from 'next'
import { MapboxOptions } from 'mapbox-gl'
import { Config, Line, LineGroup } from '@/lib/types'
import linesData from './data/lines.json'


export const LINES = linesData as { [name: string]: Line }

export const LINE_GROUPS: LineGroup[] = [
  {
    title: 'Edmonton Transit Service (ETS)',
    items: [
      {
        type: 'lines',
        title: 'Edmonton Light Rail Transit',
        lines: ['ETSCapital', 'ETSMetro', 'ETSValley'],
      },
    ],
  },
]

export const METADATA: Metadata = {
  title: 'Edmonton Metro Memory – ETS LRT',
  description: 'How many Edmonton LRT stations can you remember from memory?',
  openGraph: {
    title: 'Edmonton Metro Memory – ETS LRT',
    description: 'How many Edmonton LRT stations can you remember from memory?',
    type: 'website',
    locale: 'en_CA',
    url: 'https://metro-memory.com/edmonton',
  },
}

export const MAP_CONFIG: MapboxOptions = {
  container: 'map',
  style: 'mapbox://styles/mapbox/light-v11',
  bounds: [
    [-113.54854, 53.437766],
    [-113.39186, 53.62173],
  ],
  maxBounds: [
    [-113.77854, 53.207766],
    [-113.16186, 53.85173],
  ],
  minZoom: 9,
  fadeDuration: 50,
}


export const CITY_NAME = 'edmonton'

export const LOCALE = 'en'

export const MAP_FROM_DATA = true

export const GAUGE_COLORS = 'inverted'

const config: Config = {
  MAP_FROM_DATA,
  GAUGE_COLORS,
  LOCALE,
  CITY_NAME,
  MAP_CONFIG,
  METADATA,
  LINES,
  LINE_GROUPS,
}

export default config
