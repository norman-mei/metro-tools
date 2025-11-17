import { Metadata } from 'next'
import { MapboxOptions } from 'mapbox-gl'
import { Config, Line, LineGroup } from '@/lib/types'
import linesData from './data/lines.json'


export const LINES = linesData as { [name: string]: Line }

export const LINE_GROUPS: LineGroup[] = [
  {
    title: 'Tri-County Metropolitan Transportation District of Oregon (TriMet)',
    items: [
      {
        type: 'lines',
        title: 'MAX Light Rail',
        lines: ['MAXBlue', 'MAXRed', 'MAXYellow', 'MAXGreen', 'MAXOrange'],
      },
      {
        type: 'lines',
        title: 'Portland Streetcar',
        lines: ['PortlandA', 'PortlandB', 'PortlandNS'],
      },
      {
        type: 'lines',
        title: 'WES Commuter Rail',
        lines: ['PortlandWES'],
      },
    ],
  },
]

export const METADATA: Metadata = {
  title: 'Portland Metro Memory',
  description: 'How many TriMet stations in the Portland region can you name from memory?',
  openGraph: {
    title: 'Portland Metro Memory',
    description: 'How many TriMet stations in the Portland region can you name from memory?',
    type: 'website',
    locale: 'en_US',
    url: 'https://metro-memory.com/portland',
  },
}

export const MAP_CONFIG: MapboxOptions = {
  container: 'map',
  style: 'mapbox://styles/benjamintd/cls31ijdo010o01plcpzag11d',
  bounds: [
    [-123.1, 45.2],
    [-122.4, 45.65],
  ],
  maxBounds: [
    [-123.4, 45.0],
    [-122.1, 45.8],
  ],
  minZoom: 10,
  fadeDuration: 50,
}


export const CITY_NAME = 'portland'

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
