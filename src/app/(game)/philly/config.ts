import { Metadata } from 'next'
import { MapboxOptions } from 'mapbox-gl'
import { Config, Line, LineGroup } from '@/lib/types'


export const LINES: { [name: string]: Line } = {
  PhillySEPTAL: {
    name: 'Market-Frankford Line (L)',
    color: '#1C9AD6',
    backgroundColor: '#0E5F88',
    textColor: '#FFFFFF',
    order: 100,
  },
  PhillySEPTAB1: {
    name: 'Broad Street Line Local',
    color: '#F26100',
    backgroundColor: '#A54300',
    textColor: '#FFFFFF',
    order: 101,
  },
  PhillySEPTAB2: {
    name: 'Broad Street Line Express',
    color: '#F26100',
    backgroundColor: '#843700',
    textColor: '#FFFFFF',
    order: 102,
  },
  PhillySEPTAB3: {
    name: 'Broad-Ridge Spur',
    color: '#F26100',
    backgroundColor: '#692A00',
    textColor: '#FFFFFF',
    order: 103,
  },
  PhillySEPTAT1: {
    name: 'Lancaster Avenue Line',
    color: '#5A960A',
    backgroundColor: '#3D6907',
    textColor: '#FFFFFF',
    order: 110,
  },
  PhillySEPTAT2: {
    name: 'Baltimore Avenue Line',
    color: '#5A960A',
    backgroundColor: '#3D6907',
    textColor: '#FFFFFF',
    order: 111,
  },
  PhillySEPTAT3: {
    name: 'Chester Avenue Line',
    color: '#5A960A',
    backgroundColor: '#3D6907',
    textColor: '#FFFFFF',
    order: 112,
  },
  PhillySEPTAT4: {
    name: 'Woodland Avenue Line',
    color: '#5A960A',
    backgroundColor: '#3D6907',
    textColor: '#FFFFFF',
    order: 113,
  },
  PhillySEPTAT5: {
    name: 'Elmwood Avenue Line',
    color: '#5A960A',
    backgroundColor: '#3D6907',
    textColor: '#FFFFFF',
    order: 114,
  },
  PhillySEPTAG: {
    name: 'Girard Avenue Line',
    color: '#FCD602',
    backgroundColor: '#B49A00',
    textColor: '#1A1919',
    order: 115,
  },
  PhillySEPTAD1: {
    name: 'Media',
    color: '#E5427B',
    backgroundColor: '#A72D55',
    textColor: '#FFFFFF',
    order: 117,
  },
  PhillySEPTAD2: {
    name: 'Sharon Hill',
    color: '#E5427B',
    backgroundColor: '#A72D55',
    textColor: '#FFFFFF',
    order: 118,
  },
  PhillySEPTAM: {
    name: 'Norristown High Speed Line',
    color: '#613393',
    backgroundColor: '#3F2160',
    textColor: '#FFFFFF',
    order: 119,
  },
  PhillySEPTAAP: {
    name: 'Airport Line',
    color: '#43647C',
    backgroundColor: '#2C4152',
    textColor: '#FFFFFF',
    order: 200,
  },
  PhillySEPTACE: {
    name: 'Chestnut Hill East Line',
    color: '#43647C',
    backgroundColor: '#2C4152',
    textColor: '#FFFFFF',
    order: 201,
  },
  PhillySEPTACW: {
    name: 'Chestnut Hill West Line',
    color: '#43647C',
    backgroundColor: '#2C4152',
    textColor: '#FFFFFF',
    order: 202,
  },
  PhillySEPTACY: {
    name: 'Cynwyd Line',
    color: '#43647C',
    backgroundColor: '#2C4152',
    textColor: '#FFFFFF',
    order: 203,
  },
  PhillySEPTAFC: {
    name: 'Fox Chase Line',
    color: '#43647C',
    backgroundColor: '#2C4152',
    textColor: '#FFFFFF',
    order: 204,
  },
  PhillySEPTALD: {
    name: 'Lansdale/Doylestown Line',
    color: '#43647C',
    backgroundColor: '#2C4152',
    textColor: '#FFFFFF',
    order: 205,
  },
  PhillySEPTAMN: {
    name: 'Manayunk/Norristown Line',
    color: '#43647C',
    backgroundColor: '#2C4152',
    textColor: '#FFFFFF',
    order: 206,
  },
  PhillySEPTAMW: {
    name: 'Media/Wawa Line',
    color: '#43647C',
    backgroundColor: '#2C4152',
    textColor: '#FFFFFF',
    order: 207,
  },
  PhillySEPTAPT: {
    name: 'Paoli/Thorndale Line',
    color: '#43647C',
    backgroundColor: '#2C4152',
    textColor: '#FFFFFF',
    order: 208,
  },
  PhillySEPTATR: {
    name: 'Trenton Line',
    color: '#43647C',
    backgroundColor: '#2C4152',
    textColor: '#FFFFFF',
    order: 209,
  },
  PhillySEPTAWM: {
    name: 'Warminster Line',
    color: '#43647C',
    backgroundColor: '#2C4152',
    textColor: '#FFFFFF',
    order: 210,
  },
  PhillySEPTAWT: {
    name: 'West Trenton Line',
    color: '#43647C',
    backgroundColor: '#2C4152',
    textColor: '#FFFFFF',
    order: 211,
  },
  PhillySEPTAWN: {
    name: 'Wilmington/Newark Line',
    color: '#43647C',
    backgroundColor: '#2C4152',
    textColor: '#FFFFFF',
    order: 212,
  },
  PATCOSpeedline: {
    name: 'PATCO Speedline',
    color: '#C81F3C',
    backgroundColor: '#821326',
    textColor: '#FFFFFF',
    order: 300,
  },
}

export const METADATA: Metadata = {
  title: 'Philadelphia Transit Memory Game',
  description: 'How many of the Philadelphia transit stations can you name from memory?',
  openGraph: {
    title: 'Philadelphia Transit Memory Game',
    description: 'How many of the Philadelphia transit stations can you name from memory?',
    type: 'website',
    locale: 'en_US',
    url: 'https://metro-memory.com/philly',
  },
}

export const MAP_CONFIG: MapboxOptions = {
  container: 'map',
  style: 'mapbox://styles/benjamintd/clo61jvsw003b01pb6rta5qln',
  bounds: [
    [-75.5, 39.7],
    [-74.9, 40.2],
  ],
  maxBounds: [
    [-76.2, 39.2],
    [-74.3, 40.7],
  ],
  minZoom: 8,
  fadeDuration: 50,
}


export const CITY_NAME = 'philly'

export const LOCALE = 'en'

export const GAUGE_COLORS = 'inverted'

export const LINE_GROUPS: LineGroup[] = [
  {
    title: 'Southeastern Pennsylvania Transportation Authority (SEPTA)',
    items: [
      {
        type: 'lines',
        title: 'SEPTA Metro',
        lines: [
          'PhillySEPTAL',
          'PhillySEPTAB1',
          'PhillySEPTAB2',
          'PhillySEPTAB3',
          'PhillySEPTAT1',
          'PhillySEPTAT2',
          'PhillySEPTAT3',
          'PhillySEPTAT4',
          'PhillySEPTAT5',
          'PhillySEPTAG',
          'PhillySEPTAD1',
          'PhillySEPTAD2',
          'PhillySEPTAM',
        ],
      },
      {
        type: 'lines',
        title: 'SEPTA Regional Rail',
        lines: [
          'PhillySEPTAAP',
          'PhillySEPTACE',
          'PhillySEPTACW',
          'PhillySEPTACY',
          'PhillySEPTAFC',
          'PhillySEPTALD',
          'PhillySEPTAMN',
          'PhillySEPTAMW',
          'PhillySEPTAPT',
          'PhillySEPTATR',
          'PhillySEPTAWM',
          'PhillySEPTAWT',
          'PhillySEPTAWN',
        ],
      },
    ],
  },
  {
    items: [{ type: 'separator' }],
  },
  {
    title: 'Delaware River Port Authority',
    items: [
      {
        type: 'lines',
        lines: ['PATCOSpeedline'],
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
