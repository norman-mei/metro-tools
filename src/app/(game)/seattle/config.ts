import { Metadata } from 'next'
import { MapboxOptions } from 'mapbox-gl'
import { Config, Line, LineGroup } from '@/lib/types'
import linesData from './data/lines.json'

export const BEG_THRESHOLD = 0.5

export const LINES = linesData as { [name: string]: Line }

export const LINE_GROUPS: LineGroup[] = [
  {
    title: 'Central Puget Sound Regional Transit Authority (Sound Transit)',
    items: [
      {
        type: 'lines',
        title: 'Link Light Rail',
        lines: ['SoundTransit1', 'SoundTransit2', 'SoundTransitT'],
      },
      {
        type: 'lines',
        title: 'Sounder (N and S Lines)',
        lines: ['SoundTransitN', 'SoundTransitS'],
      },
    ],
  },
  {
    title: 'King County Metro (KCM)',
    items: [
      {
        type: 'lines',
        title: 'Seattle Streetcar',
        lines: ['SeattleStreetcarSLU', 'SeattleStreetcarFirstHill'],
      },
    ],
  },
  {
    title: 'Seattle Monorail Services (SMS)',
    items: [
      {
        type: 'lines',
        title: 'Seattle Center Monorail',
        lines: ['SeattleCenterMonorail'],
      },
    ],
  },
  {
    title: 'Port of Seattle',
    items: [
      {
        type: 'lines',
        title: 'SEA Underground',
        lines: ['MAXGreen', 'MAXBlue', 'MAXYellow'],
      },
    ],
  },
]

export const METADATA: Metadata = {
  title: 'Seattle—Tacoma Metro Memory',
  description: 'Test your knowledge of Puget Sound transit lines from Link to SEA Underground.',
  openGraph: {
    title: 'Seattle—Tacoma Metro Memory',
    description: 'Test your knowledge of Puget Sound transit lines from Link to SEA Underground.',
    type: 'website',
    locale: 'en_US',
    url: 'https://metro-memory.com/seattle',
  },
}

export const MAP_CONFIG: MapboxOptions = {
  container: 'map',
  style: 'mapbox://styles/benjamintd/cls31ijdo010o01plcpzag11d',
  bounds: [
    [-122.6, 47.15],
    [-122.05, 47.9],
  ],
  maxBounds: [
    [-123.2, 46.9],
    [-121.6, 48.1],
  ],
  minZoom: 9,
  fadeDuration: 50,
}

export const STRIPE_LINK = 'https://buy.stripe.com/28o14B9Yic6m73adQT'

export const CITY_NAME = 'seattle'

export const LOCALE = 'en'

export const MAP_FROM_DATA = true

const config: Config = {
  MAP_FROM_DATA,
  LOCALE,
  STRIPE_LINK,
  CITY_NAME,
  MAP_CONFIG,
  METADATA,
  LINES,
  LINE_GROUPS,
  BEG_THRESHOLD,
}

export default config
