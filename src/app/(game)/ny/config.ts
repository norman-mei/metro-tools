import { Metadata } from 'next'
import { MapboxOptions } from 'mapbox-gl'
import { Config, Line, LineGroup } from '@/lib/types'
import linesData from './data/lines.json'


export const LINES = linesData as { [name: string]: Line }

export const METADATA: Metadata = {
  title: 'New York City Subway Memory Game',
  description: 'How many of the NY subway stations can you name from memory?',
  openGraph: {
    title: 'New York City Subway Memory Game',
    description: 'How many of the NY subway stations can you name from memory?',
    type: 'website',
    locale: 'en_US',
    url: 'https://metro-memory.com/ny',
  },
}

export const MAP_CONFIG: MapboxOptions = {
  container: 'map',
  style: 'mapbox://styles/mapbox/light-v11',
  bounds: [
    [-75.2, 39.3],
    [-71.9, 41.9],
  ],
  maxBounds: [
    [-77, 38.5],
    [-70.5, 43.5],
  ],
  minZoom: 5,
  fadeDuration: 50,
}

export const CITY_NAME = 'ny'

export const LOCALE = 'en'

export const GAUGE_COLORS = 'inverted'

export const MAP_FROM_DATA = true


export const LINE_GROUPS: LineGroup[] = [
  {
    title: 'New York City Transit Authority (NYCTA)',
    items: [
      {
        type: 'lines',
        title: 'Subway - A Division',
        lines: [
          'NewYorkSubway1',
          'NewYorkSubway2',
          'NewYorkSubway3',
          'NewYorkSubway4',
          'NewYorkSubway5',
          'NewYorkSubway6',
          'NewYorkSubway6X',
          'NewYorkSubway7',
          'NewYorkSubway7X',
          'NewYorkSubwayGS',
        ],
      },
      {
        type: 'lines',
        title: 'Subway - B Division',
        lines: [
          'NewYorkSubwayA',
          'NewYorkSubwayB',
          'NewYorkSubwayC',
          'NewYorkSubwayD',
          'NewYorkSubwayE',
          'NewYorkSubwayF',
          'NewYorkSubwayFX',
          'NewYorkSubwayG',
          'NewYorkSubwayJ',
          'NewYorkSubwayL',
          'NewYorkSubwayM',
          'NewYorkSubwayN',
          'NewYorkSubwayQ',
          'NewYorkSubwayR',
          'NewYorkSubwayW',
          'NewYorkSubwayFS',
          'NewYorkSubwayT',
          'NewYorkSubwayZ',
        ],
      },
      {
        type: 'lines',
        title: 'Interborough Express',
        lines: ['IBX'],
      },
      {
        type: 'lines',
        title: 'Staten Island Railroad',
        lines: ['NewYorkSubwaySI', 'NewYorkSubwaySIExpress'],
      },
    ],
  },
  {
    items: [{ type: 'separator' }],
  },
  {
    title: 'Long Island Rail Road (LIRR)',
    items: [
      {
        type: 'lines',
        title: 'Electric',
        lines: [
          'LIRRBabylon',
          'LIRRBelmont',
          'LIRRAtlantic',
          'LIRRFarRockaway',
          'LIRRHempstead',
          'LIRRLongBeach',
          'LIRRPortWashington',
          'LIRRRonkonkoma',
          'LIRRWestHempstead',
        ],
      },
      {
        type: 'lines',
        title: 'Diesel',
        lines: [
          'LIRRGreenport',
          'LIRRMontauk',
          'LIRROysterBay',
          'LIRRPortJefferson',
        ],
      },
    ],
  },
  {
    items: [{ type: 'separator' }],
  },
  {
    title: 'Metro-North Railroad (MNR)',
    items: [
      {
        type: 'lines',
        title: 'East of Hudson – Hudson & Harlem',
        lines: ['MNRRHudson', 'MNRRHarlem'],
      },
      {
        type: 'lines',
        title: 'East of Hudson – New Haven',
        lines: [
          'MNRRNewHaven',
          'MNRRNewCanaan',
          'MNRRDanbury',
          'MNRRWaterbury',
        ],
      },
      {
        type: 'lines',
        title: 'West of Hudson',
        lines: ['NJTPascackValley', 'NJTPortJervis'],
      },
    ],
  },
  {
    items: [{ type: 'separator' }],
  },
  {
    title: 'Roosevelt Island Operating Corporation (RIOC)',
    items: [
      {
        type: 'lines',
        lines: ['RIOCRooseveltIslandTram'],
      },
    ],
  },
  {
    items: [{ type: 'separator' }],
  },
  {
    title: 'Port Authority of New York and New Jersey (PANYNJ)',
    items: [
      {
        type: 'lines',
        title: 'Port Authority Trans-Hudson (PATH)',
        lines: [
          'NewYorkSubwayPATHHob33',
          'NewYorkSubwayPATHHobwtc',
          'NewYorkSubwayPATHJsq33',
          'NewYorkSubwayPATHNwkwtc',
        ],
      },
      {
        type: 'lines',
        title: 'EWR Airtrain',
        lines: ['AirTrainEWR'],
      },
      {
        type: 'lines',
        title: 'JFK AirTrain',
        lines: [
          'AirTrainJFKHowardBeach',
          'AirTrainJFKJamaica',
          'AirTrainJFKAllTerminals',
        ],
      },
    ],
  },
  {
    items: [{ type: 'separator' }],
  },
  {
    title: 'New Jersey Transit Rail (NJTR)',
    items: [
      {
        type: 'lines',
        title: 'Newark Division',
        lines: [
          'NJTNorthEastCorridor',
          'NJTPrinceton',
          'NJTNorthJerseyCoast',
          'NJTRaritanValley',
          'NJTAtlanticCity',
        ],
      },
      {
        type: 'lines',
        title: 'Hoboken Division',
        lines: [
          'NJTMainLine',
          'NJTBergenCounty',
          'NJTPascackValley',
          'NJTPortJervis',
          'NJTMeadowlands',
          'NJTMontclairBoonton',
          'NJTMorrisEssex',
          'NJTGladstone',
          'NJTLackawannaCutOff',
        ],
      },
    ],
  },
  {
    items: [{ type: 'separator' }],
  },
  {
    title: 'New Jersey Transit Light Rail (NJTLR)',
    items: [
      {
        type: 'lines',
        title: 'Hudson Bergen Light Rail (HBLR)',
        lines: [
          'NJTLR8thStHoboken',
          'NJTLRBayonneFlyer',
          'NJTLRWestSideTonnelle',
          'NJTLRHobokenTonnelle',
        ],
      },
      {
        type: 'lines',
        title: 'Newark Light Rail (NLR)',
        lines: ['NJTLRNewark', 'NJTLRNewarkBroad'],
      },
      {
        type: 'lines',
        title: 'River Line',
        lines: ['NJTLRRiverLine'],
      },
      {
        type: 'lines',
        title: 'Glassboro Camden Line',
        lines: ['NJTLRGlassboroCamden'],
      },
    ],
  },
  {
    items: [{ type: 'separator' }],
  },
  {
    title: 'CTrail',
    items: [
      {
        type: 'lines',
        lines: ['CTRailShoreLineEast', 'CTRailHartfordLine'],
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
