import { Metadata } from 'next'
import type { MapboxOptions } from 'mapbox-gl'

import { Config, Line, LineGroup } from '@/lib/types'

import linesData from './data/lines.json'

export const LINES = linesData as { [name: string]: Line }

export const LINE_GROUPS: LineGroup[] = [
  {
    title: 'Kyoto Municipal Transportation Bureau',
    items: [
      {
        type: 'lines',
        title: 'Kyoto Municipal Subway',
        lines: ['Karasuma', 'Tozai'],
      },
    ],
  },
  {
    title: 'Keifuku Electric Railroad Co., Ltd',
    items: [
      {
        type: 'lines',
        title: 'Randen',
        lines: ['Arashiyama', 'Kitano'],
      },
      {
        type: 'lines',
        title: 'Eizan',
        lines: ['Eizan Cable', 'Eizan Ropeway'],
      },
    ],
  },
  {
    title: 'Hieizan Railway Co.,Ltd',
    items: [
      {
        type: 'lines',
        lines: ['Hieizan Railway'],
      },
    ],
  },
]

export const METADATA: Metadata = {
  icons: {
    icon: '/api/city-icon/kyoto',
    apple: '/api/city-icon/kyoto',
  },
  title: 'Kyoto (京都) Metro Memory',
  description:
    'How many Kyoto Municipal Transportation Bureau, Keifuku Electric Railroad Co., Ltd, and Hieizan Railway stations can you name from memory?',
  openGraph: {
    title: 'Kyoto (京都) Metro Memory',
    description:
      'How many Kyoto Municipal Transportation Bureau, Keifuku Electric Railroad Co., Ltd, and Hieizan Railway stations can you name from memory?',
    type: 'website',
    locale: 'ja_JP',
    url: 'https://metro-memory.com/asia/japan/kyoto',
  },
}

export const MAP_CONFIG: MapboxOptions = {
  container: 'map',
  style: 'mapbox://styles/benjamintd/clqaydk86007a01qr445u7p8i',
  bounds: [
    [135.6778322, 34.9329593],
    [135.8638291, 35.0696375],
  ],
  maxBounds: [
    [135.3778322, 34.6329593],
    [136.1638291, 35.3696375],
  ],
  minZoom: 10,
  fadeDuration: 50,
}

export const CITY_NAME = 'kyoto'

export const LOCALE = 'jp'

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
