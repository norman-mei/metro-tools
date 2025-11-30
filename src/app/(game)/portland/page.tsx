import GamePage from '@/components/GamePage'
import Main from '@/components/Main'
import { Provider } from '@/lib/configContext'
import { DataFeatureCollection, RoutesFeatureCollection } from '@/lib/types'
import type { LineString, MultiLineString } from 'geojson'
import 'mapbox-gl/dist/mapbox-gl.css'
import { Inter } from 'next/font/google'
import 'react-circular-progressbar/dist/styles.css'
import config from './config'
import data from './data/features.json'
import routesData from './data/routes.json'

const font = Inter({
  subsets: ['latin'],
  display: 'swap',
})

const fc = {
  ...data,
  features: data.features.filter((feature) =>
    feature?.properties?.line ? Boolean(config.LINES[feature.properties.line]) : false,
  ),
} as DataFeatureCollection

type RawRouteFeature = {
  type: string
  geometry: LineString | MultiLineString
  properties?: {
    line?: string | null
    color?: string | null
    [key: string]: unknown
  }
}

const rawRouteFeatures = routesData.features as RawRouteFeature[]

const routeFeatures = rawRouteFeatures
  .map((feature): RoutesFeatureCollection['features'][number] | null => {
    const line = feature.properties?.line
    if (!line || !config.LINES[line]) {
      return null
    }

    const defaultColor = config.LINES[line]?.color ?? '#1d2835'
    const rawColor = feature.properties?.color
    const color =
      typeof rawColor === 'string' && rawColor.length > 0 ? rawColor : defaultColor

    return {
      type: 'Feature' as const,
      geometry: feature.geometry,
      properties: {
        ...feature.properties,
        line: line as string,
        color,
      },
    }
  })
  .filter((feature): feature is RoutesFeatureCollection['features'][number] => feature !== null)

const routes: RoutesFeatureCollection = {
  type: 'FeatureCollection',
  features: routeFeatures,
}

export const metadata = config.METADATA

export default function PortlandPage() {
  return (
    <Provider value={config}>
      <Main className={`${font.className} min-h-screen`}>
        <GamePage fc={fc} routes={routes} />
      </Main>
    </Provider>
  )
}
