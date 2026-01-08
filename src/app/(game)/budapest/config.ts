import { Config, Line, LineGroup } from '@/lib/types'
import { MapboxOptions } from 'mapbox-gl'
import { Metadata } from 'next'


export const LINES: {
  [name: string]: Line
} = {
  "BudapestMetro1": {
    "name": "M1",
    "color": "#feda04",
    "backgroundColor": "#806E01",
    "textColor": "#FFFFFF",
    "order": 0
  },
  "BudapestMetro2": {
    "name": "M2",
    "color": "#ca161c",
    "backgroundColor": "#650B0E",
    "textColor": "#FFFFFF",
    "order": 1
  },
  "BudapestMetro3": {
    "name": "M3",
    "color": "#025694",
    "backgroundColor": "#012B4A",
    "textColor": "#FFFFFF",
    "order": 2
  },
  "BudapestMetro4": {
    "name": "M4",
    "color": "#44aa44",
    "backgroundColor": "#225522",
    "textColor": "#FFFFFF",
    "order": 3
  },
  "BudapestHEV5": {
    "name": "H5",
    "color": "#8A226C",
    "backgroundColor": "#451136",
    "textColor": "#FFFFFF",
    "order": 4
  },
  "BudapestHEV6": {
    "name": "H6",
    "color": "#815319",
    "backgroundColor": "#41290C",
    "textColor": "#FFFFFF",
    "order": 5
  },
  "BudapestHEV7": {
    "name": "H7",
    "color": "#F29315",
    "backgroundColor": "#7D4A07",
    "textColor": "#FFFFFF",
    "order": 6
  },
  "BudapestHEV8": {
    "name": "H8",
    "color": "#EC766F",
    "backgroundColor": "#991C14",
    "textColor": "#FFFFFF",
    "order": 7
  },
  "BudapestHEV9": {
    "name": "H9",
    "color": "#EC766F",
    "backgroundColor": "#991C14",
    "textColor": "#FFFFFF",
    "order": 8
  }
}

export const LINE_GROUPS: LineGroup[] = [
  {
    title: 'Lines',
    items: [
      {
        type: 'lines',
        lines: ['BudapestMetro1', 'BudapestMetro2', 'BudapestMetro3', 'BudapestMetro4', 'BudapestHEV5', 'BudapestHEV6', 'BudapestHEV7', 'BudapestHEV8', 'BudapestHEV9'],
      },
    ],
  },
]

export const METADATA: Metadata = {
  icons: {
    icon: '/api/city-icon/budapest',
    apple: '/api/city-icon/budapest',
  },
  title: 'Budapest Metro Memory',
  description: 'Hány metróállomást tudsz emlékezetből megnevezni?',
  openGraph: {
    title: 'Budapest Metro Memory',
    description:
      'Hány metróállomást tudsz emlékezetből megnevezni? Játszd a Budapest Metro Memory-t és tudd meg!',
    type: 'website',
    locale: 'hu_HU',
    url: 'https://metro-memory.com/budapest',
  },
}

export const MAP_CONFIG: MapboxOptions = {
  container: 'map',
  style: 'mapbox://styles/benjamintd/cls4h02hy019201qygvumc0nb', // generic
  minZoom: 6,
  fadeDuration: 50,
  dragRotate: false,
}


export const CITY_NAME = 'budapest'

export const LOCALE = 'hu'

export const MAP_FROM_DATA = true

const config: Config = {
  GAUGE_COLORS: 'inverted',
  MAP_FROM_DATA,
  LOCALE,
  CITY_NAME,
  MAP_FROM_DATA,
  LINE_GROUPS,
  MAP_CONFIG,
  METADATA,
  LINES,
}

export default config
