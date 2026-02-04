import { Metadata } from 'next'
import type { MapboxOptions } from 'mapbox-gl'

import { Config, Line, LineGroup } from '@/lib/types'

import linesData from './data/lines.json'

type PlaceholderConfigOptions = {
  citySlug: string
  cityTitle: string
  cityPath?: string
  description?: string
  locale?: string
  mapBounds?: MapboxOptions['bounds']
  mapMaxBounds?: MapboxOptions['maxBounds']
}

const PLACEHOLDER_LINES = linesData as { [name: string]: Line }

const PLACEHOLDER_LINE_GROUPS: LineGroup[] = [
  {
    title: 'Placeholder network',
    items: [
      {
        type: 'lines',
        lines: Object.keys(PLACEHOLDER_LINES),
      },
    ],
  },
]

const BASE_MAP_CONFIG: MapboxOptions = {
  container: 'map',
  style: 'mapbox://styles/benjamintd/cls31ijdo010o01plcpzag11d',
  bounds: [
    [-0.25, -0.25],
    [0.25, 0.25],
  ],
  maxBounds: [
    [-1.5, -1.5],
    [1.5, 1.5],
  ],
  minZoom: 10,
  fadeDuration: 50,
}

const buildMetadata = ({
  citySlug,
  cityTitle,
  cityPath,
  description = 'Placeholder data while the full network is loading.',
}: PlaceholderConfigOptions): Metadata => ({
  icons: {
    icon: `/api/city-icon/${citySlug}`,
    apple: `/api/city-icon/${citySlug}`,
  },
  title: `${cityTitle} Metro Memory`,
  description,
  openGraph: {
    title: `${cityTitle} Metro Memory`,
    description,
    type: 'website',
    locale: 'en_US',
    url: `https://metro-memory.com/${cityPath ?? citySlug}`,
  },
})

export const buildPlaceholderConfig = (options: PlaceholderConfigOptions): Config => {
  const METADATA = buildMetadata(options)
  const MAP_CONFIG: MapboxOptions = {
    ...BASE_MAP_CONFIG,
    ...(options.mapBounds ? { bounds: options.mapBounds } : {}),
    ...(options.mapMaxBounds ? { maxBounds: options.mapMaxBounds } : {}),
  }

  return {
    MAP_FROM_DATA: true,
    LOCALE: options.locale ?? 'en',
    CITY_NAME: options.citySlug,
    MAP_CONFIG,
    METADATA,
    LINES: PLACEHOLDER_LINES,
    LINE_GROUPS: PLACEHOLDER_LINE_GROUPS,
  }
}

export { PLACEHOLDER_LINES, PLACEHOLDER_LINE_GROUPS }
