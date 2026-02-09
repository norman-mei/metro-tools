import fs from 'fs'
import path from 'path'
const ROOT = process.cwd()
const REGISTRY_DIR = path.join(ROOT, 'city-registry')

const COUNTRY_LANGUAGE_MAP: Record<string, string[]> = {
  usa: ['en'],
  canada: ['en', 'fr'],
  mexico: ['es'],
  venezuela: ['es'],
  uk: ['en'],
  france: ['fr'],
  germany: ['de'],
  austria: ['de'],
  sweden: ['sv'],
  hungary: ['hu'],
  spain: ['es'],
  turkey: ['tr'],
  china: ['zh'],
  japan: ['ja'],
  'south-korea': ['ko'],
  'north-korea': ['ko'],
  taiwan: ['zh'],
  vietnam: ['vi'],
  thailand: ['th'],
  indonesia: ['id'],
  malaysia: ['ms'],
  singapore: ['en'],
  philippines: ['tl'],
  'new-zealand': ['en'],
  australia: ['en'],
  algeria: ['ar', 'fr'],
}

const DEFAULT_DELTA = 0.5
const LARGE_DELTA = 3

const ensureDir = (dir: string) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
}

const getContinent = (pathName: string) => {
  const segment = pathName.split('/')[0]
  return segment.replace('-', ' ')
}

const getCountry = (pathName: string) => {
  const segments = pathName.split('/').filter(Boolean)
  return segments[1] || null
}

const computeBboxFromGeojson = (geojsonPath: string) => {
  if (!fs.existsSync(geojsonPath)) return null
  const data = JSON.parse(fs.readFileSync(geojsonPath, 'utf8'))
  const coords: [number, number][] = []

  const addCoords = (arr: any[]) => {
    arr.forEach((entry) => {
      if (!Array.isArray(entry)) return
      if (typeof entry[0] === 'number' && typeof entry[1] === 'number') {
        coords.push([entry[0], entry[1]])
      } else {
        addCoords(entry)
      }
    })
  }

  const ingestCollection = (collection: any) => {
    const features = collection?.features || []
    if (!Array.isArray(features)) return
    features.forEach((feature: any) => {
      const geom = feature.geometry
      if (!geom) return
      addCoords(geom.coordinates)
    })
  }

  if (data?.type === 'FeatureCollection') {
    ingestCollection(data)
  } else if (data?.features && data?.routes) {
    ingestCollection(data.features)
    ingestCollection(data.routes)
  } else {
    ingestCollection(data)
  }

  if (!coords.length) return null
  let minLon = Infinity
  let minLat = Infinity
  let maxLon = -Infinity
  let maxLat = -Infinity
  coords.forEach(([lon, lat]) => {
    minLon = Math.min(minLon, lon)
    maxLon = Math.max(maxLon, lon)
    minLat = Math.min(minLat, lat)
    maxLat = Math.max(maxLat, lat)
  })

  return [minLat, minLon, maxLat, maxLon]
}

const isLargeRegion = (slug: string) => {
  return [
    'amtrak',
    'viarail',
    'california-state',
    'florida-state',
    'gba',
    'toronto-waterloo',
  ].includes(slug)
}

const parseExportedObject = (filePath: string, exportName: string) => {
  const source = fs.readFileSync(filePath, 'utf8')
  const match = source.match(
    new RegExp(`${exportName}[^=]*=\\s*({[\\s\\S]*?})\\s*;?`, 'm'),
  )
  if (!match) {
    throw new Error(`Could not parse ${exportName} from ${filePath}`)
  }
  const objectLiteral = match[1]
  return new Function(`return ${objectLiteral}`)() as Record<string, any>
}

const CITY_COORDINATES = parseExportedObject(
  path.join(ROOT, 'src', 'lib', 'cityCoordinates.ts'),
  'CITY_COORDINATES',
)
const CITY_PATH_MAP = parseExportedObject(
  path.join(ROOT, 'src', 'lib', 'cityPathMap.ts'),
  'CITY_PATH_MAP',
)

const buildBbox = (slug: string, cityPath: string) => {
  const publicPath = path.join(ROOT, 'public', 'city-data', `${slug}.json`)
  const dataPath = path.join(ROOT, 'src', 'app', '(game)', cityPath, 'data')
  const featuresPath = path.join(dataPath, 'features.json')
  const routesPath = path.join(dataPath, 'routes.json')

  const bboxFromPublic = computeBboxFromGeojson(publicPath)
  if (bboxFromPublic) return bboxFromPublic

  const bboxFromFeatures = computeBboxFromGeojson(featuresPath)
  const bboxFromRoutes = computeBboxFromGeojson(routesPath)
  if (bboxFromFeatures && bboxFromRoutes) {
    return [
      Math.min(bboxFromFeatures[0], bboxFromRoutes[0]),
      Math.min(bboxFromFeatures[1], bboxFromRoutes[1]),
      Math.max(bboxFromFeatures[2], bboxFromRoutes[2]),
      Math.max(bboxFromFeatures[3], bboxFromRoutes[3]),
    ]
  }
  if (bboxFromFeatures) return bboxFromFeatures
  if (bboxFromRoutes) return bboxFromRoutes

  const center = CITY_COORDINATES[slug]
  if (!center) return null
  const [lon, lat] = center
  const delta = isLargeRegion(slug) ? LARGE_DELTA : DEFAULT_DELTA
  return [lat - delta, lon - delta, lat + delta, lon + delta]
}

const loadLines = (cityPath: string) => {
  const dataPath = path.join(ROOT, 'src', 'app', '(game)', cityPath, 'data')
  const linesPath = path.join(dataPath, 'lines.json')
  if (!fs.existsSync(linesPath)) return []
  const raw = JSON.parse(fs.readFileSync(linesPath, 'utf8'))
  return Object.entries(raw).map(([id, info]: [string, any]) => ({
    id,
    name: info.name || id,
    keywords: [],
    ...(typeof info.order === 'number' ? { order: info.order } : {}),
  }))
}

const main = () => {
  ensureDir(REGISTRY_DIR)

  const overwrite = process.env.METRO_SYNC_OVERWRITE === '1'

  Object.entries(CITY_PATH_MAP).forEach(([slug, cityPath]) => {
    const filePath = path.join(REGISTRY_DIR, `${slug}.json`)
    if (!overwrite && fs.existsSync(filePath)) return

    const continent = getContinent(cityPath)
    const country = getCountry(cityPath)
    const localLanguages = country ? COUNTRY_LANGUAGE_MAP[country] || [] : []
    const bbox = buildBbox(slug, cityPath)

    const lines = loadLines(cityPath)

    const registry = {
      city: slug,
      continent,
      bbox: bbox || [0, 0, 0, 0],
      localLanguages,
      modes: [
        'subway',
        'light_rail',
        'tram',
        'rail',
        'funicular',
        'monorail',
        'cable_car',
        'gondola',
        'chair_lift',
      ],
      lines,
      stationAliases: {},
      stationLocalNames: {},
      manualCoords: {},
    }

    fs.writeFileSync(filePath, JSON.stringify(registry, null, 2))
  })
}

main()
