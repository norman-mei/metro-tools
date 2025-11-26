import fs from 'fs'
import path from 'path'
import GamePage from '@/components/GamePage'
import Main from '@/components/Main'
import { Provider } from '@/lib/configContext'
import { DataFeatureCollection, RoutesFeatureCollection } from '@/lib/types'
import type { Feature, FeatureCollection, Geometry } from 'geojson'
import 'mapbox-gl/dist/mapbox-gl.css'
import { Inter } from 'next/font/google'
import 'react-circular-progressbar/dist/styles.css'
import config from './config'
import data from './data/features.json'
import routesData from './data/routes.json'

const lightRailGeojson = JSON.parse(
  fs.readFileSync(
    path.join(
      process.cwd(),
      'src/app/(game)/ny/data/NJTransit_Light_Rail.geojson',
    ),
    'utf8',
  ),
) as FeatureCollection

const pascackValleyGeojson = JSON.parse(
  fs.readFileSync(
    path.join(process.cwd(), 'src/app/(game)/ny/data/pascackvalley.geojson'),
    'utf8',
  ),
) as FeatureCollection

const LINE_GEOMETRY_OVERRIDES: Record<string, string> = {
  NewYorkSubway7: 'NewYorkSubway7X',
}

const LIGHT_RAIL_LINE_MAP: Record<string, string[]> = {
  HB: [
    'NJTLR8thStHoboken',
    'NJTLRWestSideTonnelle',
    'NJTLRHobokenTonnelle',
    'NJTLRBayonneFlyer',
  ],
  RiverLINE: ['NJTLRRiverLine'],
}

const LIGHT_RAIL_LINES = new Set(
  Object.values(LIGHT_RAIL_LINE_MAP)
    .flatMap((items) => items)
    .concat(['NJTLRNewark', 'NJTLRNewarkBroad']),
)

const SIR_EXPRESS_BASE_MAP: Record<string, string> = {
  NewYorkSubwaySIExpress: 'NewYorkSubwaySI',
}
const PASCACK_LINE = 'NJTPascackValley'
const OVERRIDE_LINES = new Set([
  ...LIGHT_RAIL_LINES,
  ...Object.keys(SIR_EXPRESS_BASE_MAP),
  ...Object.keys(LINE_GEOMETRY_OVERRIDES),
  PASCACK_LINE,
])

const font = Inter({
  subsets: ['latin'],
  display: 'swap',
})

const fc = {
  ...data,
  features: data.features.filter((f) => !!config.LINES[f.properties.line]),
} as DataFeatureCollection

const filteredRoutes = {
  ...routesData,
  features: routesData.features.filter((feature) => {
    const line = feature.properties?.line
    return line ? Boolean(config.LINES[line]) : false
  }),
} as RoutesFeatureCollection

const baseRoutePropsByLine = new Map<
  string,
  (typeof filteredRoutes.features)[number]['properties']
>()
const baseRouteGeometryByLine = new Map<
  string,
  (typeof filteredRoutes.features)[number]['geometry']
>()

const coordCount = (geometry: Geometry) => {
  if (geometry.type === 'LineString') return geometry.coordinates.length
  if (geometry.type === 'MultiLineString')
    return geometry.coordinates.reduce((sum, c) => sum + c.length, 0)
  return 0
}

filteredRoutes.features.forEach((feature) => {
  const line = feature.properties?.line
  if (!line) return

  const existingGeometry = baseRouteGeometryByLine.get(line)
  const existingCount = existingGeometry ? coordCount(existingGeometry) : -1
  const currentCount = coordCount(feature.geometry)

  if (currentCount >= existingCount) {
    baseRoutePropsByLine.set(line, feature.properties)
    baseRouteGeometryByLine.set(line, feature.geometry)
  }
})

const lightRailOverrides: Feature<Geometry, Record<string, unknown>>[] =
  lightRailGeojson.features.flatMap((feature) => {
    const getLatExtents = (geom: Geometry) => {
      const coords =
        geom.type === 'MultiLineString'
          ? geom.coordinates.flat()
          : geom.coordinates
      const lats = coords.map(([, lat]) => lat)
      return {
        minLat: Math.min(...lats),
        maxLat: Math.max(...lats),
      }
    }

    const chooseNewarkLineCodes = () => {
      const { maxLat } = getLatExtents(feature.geometry)
      return maxLat > 40.76 ? ['NJTLRNewark'] : ['NJTLRNewarkBroad']
    }

    const chooseHBLRLineCodes = () => {
      const { minLat } = getLatExtents(feature.geometry)
      if (minLat < 40.7) {
        return ['NJTLR8thStHoboken', 'NJTLRBayonneFlyer']
      }
      if (minLat < 40.73) {
        return ['NJTLRWestSideTonnelle']
      }
      return ['NJTLRHobokenTonnelle']
    }

    const featureLineCode = (feature.properties as { LINE_CODE?: string })?.LINE_CODE
    const lineCodes =
      featureLineCode === 'Newark Light Rail'
        ? chooseNewarkLineCodes()
        : featureLineCode === 'HB'
          ? chooseHBLRLineCodes()
        : LIGHT_RAIL_LINE_MAP[featureLineCode]

    if (!lineCodes?.length) {
      return []
    }

    return lineCodes.map((lineId) => {
      const baseProps = baseRoutePropsByLine.get(lineId) || {}
      const lineMeta = config.LINES[lineId]

      return {
        type: 'Feature',
        geometry: feature.geometry,
        properties: {
          ...baseProps,
          line: lineId,
          color: (baseProps as { color?: string }).color ?? lineMeta?.color ?? '#1d2835',
          name: (baseProps as { name?: string }).name ?? lineMeta?.name ?? lineId,
          order:
            (baseProps as { order?: number }).order ??
            lineMeta?.order ??
            0,
        },
      }
    })
  })

const sirExpressOverrides: Feature<Geometry, Record<string, unknown>>[] =
  Object.entries(SIR_EXPRESS_BASE_MAP).flatMap(([expressLine, baseLine]) => {
    const baseGeometry = baseRouteGeometryByLine.get(baseLine)
    if (!baseGeometry) return []

    const baseProps = baseRoutePropsByLine.get(expressLine) || {}
    const lineMeta = config.LINES[expressLine]
    return [
      {
        type: 'Feature',
        geometry: JSON.parse(JSON.stringify(baseGeometry)),
        properties: {
          ...baseProps,
          line: expressLine,
          color:
            (baseProps as { color?: string }).color ??
            lineMeta?.color ??
            '#1d2835',
          name:
            (baseProps as { name?: string }).name ??
            lineMeta?.name ??
            expressLine,
          order:
            (baseProps as { order?: number }).order ??
            lineMeta?.order ??
            0,
        },
      },
    ]
  })

const geometryOverrides: Feature<Geometry, Record<string, unknown>>[] = Object.entries(
  LINE_GEOMETRY_OVERRIDES,
).flatMap(([targetLine, baseLine]) => {
  const baseGeometry = baseRouteGeometryByLine.get(baseLine)
  if (!baseGeometry) return []

  const baseProps = baseRoutePropsByLine.get(targetLine) || {}
  const lineMeta = config.LINES[targetLine]

  return [
    {
      type: 'Feature',
      geometry: JSON.parse(JSON.stringify(baseGeometry)),
      properties: {
        ...baseProps,
        line: targetLine,
        color:
          (baseProps as { color?: string }).color ?? lineMeta?.color ?? '#1d2835',
        name:
          (baseProps as { name?: string }).name ?? lineMeta?.name ?? targetLine,
        order: 8,
      },
    },
  ]
})

const pascackOverrides: Feature<Geometry, Record<string, unknown>>[] =
  pascackValleyGeojson.features.map((feature) => {
    const baseProps = baseRoutePropsByLine.get(PASCACK_LINE) || {}
    const lineMeta = config.LINES[PASCACK_LINE]

    return {
      type: 'Feature',
      geometry: feature.geometry,
      properties: {
        ...baseProps,
        line: PASCACK_LINE,
        color:
          (baseProps as { color?: string }).color ??
          lineMeta?.color ??
          '#1d2835',
        name:
          (baseProps as { name?: string }).name ??
          lineMeta?.name ??
          PASCACK_LINE,
        order:
          (baseProps as { order?: number }).order ?? lineMeta?.order ?? 0,
      },
    }
  })

const routes = {
  ...filteredRoutes,
  features: filteredRoutes.features
    .filter((feature) => {
      const line = feature.properties?.line
      return line ? !OVERRIDE_LINES.has(line) : true
    })
    .concat(lightRailOverrides)
    .concat(sirExpressOverrides)
    .concat(geometryOverrides)
    .concat(pascackOverrides),
} as RoutesFeatureCollection

export const metadata = config.METADATA

export default function NY() {
  return (
    <Provider value={config}>
      <Main className={`${font.className} min-h-screen`}>
        <GamePage fc={fc} routes={routes} />
      </Main>
    </Provider>
  )
}
