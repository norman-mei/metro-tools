import { Metadata } from 'next'
import { MapboxOptions } from 'mapbox-gl'
import { Config, Line, LineGroup } from '@/lib/types'


// Note: below LINES data is just a copy of generated data/lines.json
export const LINES: {
  [name: string]: Line
} = {
  "DresdenTram1": {
    "name": "1",
    "color": "#E4002C",
    "backgroundColor": "#720016",
    "textColor": "#FFFFFF",
    "order": 1
  },
  "DresdenTram10": {
    "name": "10",
    "color": "#F9B000",
    "backgroundColor": "#7D5800",
    "textColor": "#FFFFFF",
    "order": 9
  },
  "DresdenTram11": {
    "name": "11",
    "color": "#C2DDAF",
    "backgroundColor": "#5C8B3B",
    "textColor": "#FFFFFF",
    "order": 10
  },
  "DresdenTram12": {
    "name": "12",
    "color": "#006B42",
    "backgroundColor": "#003621",
    "textColor": "#FFFFFF",
    "order": 11
  },
  "DresdenTram13": {
    "name": "13",
    "color": "#FDC300",
    "backgroundColor": "#7F6200",
    "textColor": "#FFFFFF",
    "order": 12
  },
  "DresdenTram2": {
    "name": "2",
    "color": "#EB5B2D",
    "backgroundColor": "#80280C",
    "textColor": "#FFFFFF",
    "order": 2
  },
  "DresdenTram3": {
    "name": "3",
    "color": "#E5005A",
    "backgroundColor": "#73002D",
    "textColor": "#FFFFFF",
    "order": 3
  },
  "DresdenTram4": {
    "name": "4",
    "color": "#C9061A",
    "backgroundColor": "#65030D",
    "textColor": "#FFFFFF",
    "order": 4
  },
  "DresdenTram6": {
    "name": "6",
    "color": "#FFDD00",
    "backgroundColor": "#806E00",
    "textColor": "#FFFFFF",
    "order": 5
  },
  "DresdenTram7": {
    "name": "7",
    "color": "#9E0234",
    "backgroundColor": "#4F011A",
    "textColor": "#FFFFFF",
    "order": 6
  },
  "DresdenTram8": {
    "name": "8",
    "color": "#229133",
    "backgroundColor": "#114919",
    "textColor": "#FFFFFF",
    "order": 7
  },
  "DresdenTram9": {
    "name": "9",
    "color": "#93C355",
    "backgroundColor": "#4A6725",
    "textColor": "#FFFFFF",
    "order": 8
  },
}

export const LINE_GROUPS: LineGroup[] = [
  {
    title: 'Lines',
    items: [
      {
        type: 'lines',
        lines: ['DresdenTram1', 'DresdenTram10', 'DresdenTram11', 'DresdenTram12', 'DresdenTram13', 'DresdenTram2', 'DresdenTram3', 'DresdenTram4', 'DresdenTram6', 'DresdenTram7', 'DresdenTram8', 'DresdenTram9'],
      },
    ],
  },
]

export const METADATA: Metadata = {
  icons: {
    icon: '/api/city-icon/dresden',
    apple: '/api/city-icon/dresden',
  },
  title: 'Dresden Tram Memory',
  description: 'Wie viele Tram-Stationen können Sie auswendig nennen?',
  openGraph: {
    title: 'Dresden Tram Memory',
    description:
      'Wie viele Tram-Stationen können Sie auswendig nennen? Spielen Sie das Dresden Tram Memory und finden Sie es heraus!',
    type: 'website',
    locale: 'de_DE',
    url: 'https://metro-memory.com/Dresden',
  },
}

export const MAP_CONFIG: MapboxOptions = {
  container: 'map',
  style: 'mapbox://styles/benjamintd/cls4h02hy019201qygvumc0nb', // generic
  minZoom: 6,
  fadeDuration: 50,
  dragRotate: false,
}


export const CITY_NAME = 'dresden'

export const LOCALE = 'de'

export const MAP_FROM_DATA = true

const config: Config = {
  GAUGE_COLORS: 'inverted',
  MAP_FROM_DATA,
  LOCALE,
  CITY_NAME,
  LINE_GROUPS,
  MAP_CONFIG,
  METADATA,
  LINES,
}

export default config
