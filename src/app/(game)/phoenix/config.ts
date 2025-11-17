import { Metadata } from 'next'
import { MapboxOptions } from 'mapbox-gl'
import { Config, Line, LineGroup } from '@/lib/types'
import linesData from './data/lines.json'

export const BEG_THRESHOLD = 0.5

export const LINES = linesData as { [name: string]: Line }

export const LINE_GROUPS: LineGroup[] = [
  {
    title: 'Valley Metro Regional Public Transportation Authority (Valley Metro)',
    items: [
      {
        type: 'lines',
        title: 'Light Rail',
        lines: ['ValleyMetroA', 'ValleyMetroB'],
      },
      {
        type: 'lines',
        title: 'Streetcar',
        lines: ['ValleyMetroS'],
      },
    ],
  },
  {
    items: [{ type: 'separator' }],
  },
  {
    title: 'City of Phoenix Aviation Department',
    items: [
      {
        type: 'lines',
        title: 'PHX SkyTrain',
        lines: ['PHXSKY'],
      },
    ],
  },
]

export const METADATA: Metadata = {
  title: 'Phoenix-Tempe Metro Memory',
  description:
    'How many of the Phoenix-Tempe Valley Metro and PHX SkyTrain stops can you name from memory?',
  openGraph: {
    title: 'Phoenix-Tempe Metro Memory',
    description:
      'How many of the Phoenix-Tempe Valley Metro and PHX SkyTrain stops can you name from memory?',
    type: 'website',
    locale: 'en_US',
    url: 'https://metro-memory.com/phoenix',
  },
}

export const MAP_CONFIG: MapboxOptions = {
  container: 'map',
  style: 'mapbox://styles/benjamintd/cls31ijdo010o01plcpzag11d',
  bounds: [
    [-112.1383, 33.3583],
    [-111.7703, 33.5951],
  ],
  maxBounds: [
    [-112.1683, 33.3283],
    [-111.7403, 33.6251],
  ],
  minZoom: 10,
  fadeDuration: 50,
}

export const STRIPE_LINK = 'https://buy.stripe.com/28o14B9Yic6m73adQT'

export const CITY_NAME = 'phoenix'

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
