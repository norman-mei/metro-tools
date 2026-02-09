import fs from 'fs'
import path from 'path'
import axios from 'axios'
import osmtogeojson from 'osmtogeojson'
import * as turf from '@turf/turf'
import sharp from 'sharp'
import nodemailer from 'nodemailer'

type LineSpec = {
  id: string
  name: string
  keywords: string[]
  color?: string
  icon?: string
  order?: number
}

type Registry = {
  city: string
  continent?: string
  bbox: [number, number, number, number]
  localLanguages?: string[]
  modes?: string[]
  lines: LineSpec[]
  stationAliases?: Record<string, string>
  stationLocalNames?: Record<string, string[]>
  manualCoords?: Record<string, [number, number][]> // key: LineId|StationName
  autoConfig?: boolean
}

type ReportCity = {
  city: string
  linesProcessed: number
  lineErrors: string[]
  newStations: string[]
  removedStations: string[]
  updatedStations: string[]
  newLines: string[]
  operatorSuggestion?: { value: string; verified: boolean; source: string }
  headerSuggestion?: {
    header: string
    subheader?: string
    verified: boolean
    source: string
  }
  colorWarnings: string[]
  verificationNotes: string[]
}

type Report = {
  startedAt: string
  finishedAt?: string
  cities: ReportCity[]
  errors: string[]
}

const ROOT = process.cwd()
const REGISTRY_DIR = path.join(ROOT, 'city-registry')
const REPORTS_DIR = path.join(ROOT, 'reports')
const CACHE_DIR = path.join(ROOT, 'tmp', 'metro-sync')

const DEFAULT_MODES = [
  'subway',
  'light_rail',
  'tram',
  'rail',
  'funicular',
  'monorail',
  'cable_car',
  'gondola',
  'chair_lift',
]

const DIST_THRESHOLD_METERS = 150

const ensureDir = (dir: string) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
}

const normalize = (value: string | undefined | null) =>
  String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, '')

const loadRegistries = (): Registry[] => {
  if (!fs.existsSync(REGISTRY_DIR)) return []
  const entries = fs
    .readdirSync(REGISTRY_DIR)
    .filter((file) => file.endsWith('.json'))
  return entries.map((file) => {
    const raw = fs.readFileSync(path.join(REGISTRY_DIR, file), 'utf8')
    return JSON.parse(raw) as Registry
  })
}

const filterRegistriesByScope = (registries: Registry[], scope: string | undefined) => {
  if (!scope || scope === 'all') return registries
  const normalized = scope.toLowerCase()
  const asiaEurope = new Set(['asia', 'europe'])
  const americasOceania = new Set([
    'north america',
    'south america',
    'oceania',
    'north_america',
    'south_america',
  ])

  return registries.filter((registry) => {
    const continent = registry.continent?.toLowerCase()
    if (!continent) return false
    if (normalized === 'asia-europe') return asiaEurope.has(continent)
    if (normalized === 'americas-oceania') return americasOceania.has(continent)
    return true
  })
}

const buildOverpassQuery = (registry: Registry) => {
  const [minLat, minLon, maxLat, maxLon] = registry.bbox
  const bbox = `${minLat},${minLon},${maxLat},${maxLon}`
  const modes = registry.modes?.length ? registry.modes : DEFAULT_MODES
  const railwayModes = modes.filter((m) => !['cable_car', 'gondola', 'chair_lift'].includes(m))
  const aerialModes = modes.filter((m) => ['cable_car', 'gondola', 'chair_lift'].includes(m))

  const railwayRegex = railwayModes.length
    ? railwayModes.map((m) => m.replace(/[^a-z_]/g, '')).join('|')
    : ''
  const routeRegex = railwayRegex
  const aerialRegex = aerialModes.length
    ? aerialModes.map((m) => m.replace(/[^a-z_]/g, '')).join('|')
    : ''

  const parts = [] as string[]
  if (railwayRegex) {
    parts.push(`way["railway"~"^(${railwayRegex})$"](${bbox});`)
    parts.push(`relation["route"~"^(${routeRegex})$"](${bbox});`)
  }
  if (aerialRegex) {
    parts.push(`way["aerialway"~"^(${aerialRegex})$"](${bbox});`)
    parts.push(`relation["route"~"^(${aerialRegex})$"](${bbox});`)
  }
  parts.push(`node["public_transport"="station"](${bbox});`)
  parts.push(`node["railway"="station"](${bbox});`)
  parts.push(`node["public_transport"="stop_position"](${bbox});`)
  parts.push(`node["aerialway"="station"](${bbox});`)
  parts.push(`relation["public_transport"="stop_area"](${bbox});`)

  return `[
    out:json
  ][timeout:120];
  (
    ${parts.join('\n    ')}
  );
  out body;
  >;
  out skel qt;`
}

const fetchOverpass = async (registry: Registry) => {
  ensureDir(CACHE_DIR)
  const cachePath = path.join(CACHE_DIR, `${registry.city}-overpass.json`)
  if (process.env.METRO_SYNC_USE_CACHE === '1' && fs.existsSync(cachePath)) {
    return JSON.parse(fs.readFileSync(cachePath, 'utf8'))
  }
  const query = buildOverpassQuery(registry)
  const url = 'https://overpass-api.de/api/interpreter'
  const res = await axios.post(url, query, {
    headers: { 'Content-Type': 'text/plain' },
    maxBodyLength: Infinity,
  })
  fs.writeFileSync(cachePath, JSON.stringify(res.data))
  return res.data
}

const isOpenFeature = (props: Record<string, any>) => {
  if (!props) return true
  const railway = props.railway
  if (railway === 'construction') return false
  if (props['construction:railway']) return false
  if (props['proposed:railway']) return false
  if (props['opening_date']) {
    const date = new Date(props['opening_date'])
    if (!isNaN(date.getTime())) {
      if (date.getTime() > Date.now()) return false
    }
  }
  return true
}

const collectNameCandidates = (props: Record<string, any>, localLanguages: string[]) => {
  const values = new Set<string>()
  const add = (val?: string) => {
    if (val && val.trim()) values.add(val.trim())
  }
  add(props.name)
  add(props['name:en'])
  if (props.ref) add(props.ref)

  Object.keys(props).forEach((key) => {
    if (key.startsWith('name:')) add(props[key])
  })

  localLanguages.forEach((lang) => {
    add(props[`name:${lang}`])
    add(props[`name:${lang}-Latn`])
    add(props[`name:${lang}-Hani`])
  })

  return Array.from(values)
}

const matchesKeywords = (props: Record<string, any>, keywords: string[], localLanguages: string[]) => {
  const candidates = collectNameCandidates(props, localLanguages).map(normalize)
  const keywordNorm = keywords.map(normalize)
  return candidates.some((c) => keywordNorm.includes(c))
}

const selectMostCommon = (values: string[]) => {
  const counts = new Map<string, number>()
  values.forEach((v) => counts.set(v, (counts.get(v) || 0) + 1))
  let best = ''
  let bestCount = 0
  counts.forEach((count, value) => {
    if (count > bestCount) {
      best = value
      bestCount = count
    }
  })
  return best || null
}

const inferTextColor = (hex: string) => {
  const color = hex.replace('#', '')
  if (color.length !== 6) return '#000000'
  const r = parseInt(color.slice(0, 2), 16)
  const g = parseInt(color.slice(2, 4), 16)
  const b = parseInt(color.slice(4, 6), 16)
  const brightness = r * 0.299 + g * 0.587 + b * 0.114
  return brightness >= 150 ? '#000000' : '#FFFFFF'
}

const sampleIconColor = async (iconPath: string) => {
  const full = path.join(ROOT, 'public', 'images', iconPath)
  if (!fs.existsSync(full)) return null
  const img = sharp(full)
  const stats = await img.stats()
  const { r, g, b } = stats.dominant
  const hex = `#${[r, g, b]
    .map((v) => Math.round(v).toString(16).padStart(2, '0'))
    .join('')}`
  return hex.toUpperCase()
}

const buildLinesJson = async (
  registry: Registry,
  lineFeatures: any[],
  existingLines: Record<string, any>,
  reportCity: ReportCity,
) => {
  const localLanguages = registry.localLanguages || []
  const output: Record<string, any> = {}

  for (const line of registry.lines) {
    if (!line.keywords || line.keywords.length === 0) {
      reportCity.lineErrors.push(`Line ${line.id} has no keywords; skipping`)
      continue
    }
    const matching = lineFeatures.filter((f) => {
      const props = f.properties || {}
      return matchesKeywords(props, line.keywords, localLanguages)
    })

    if (matching.length < 2) {
      reportCity.lineErrors.push(
        `Line ${line.id} expected multiple line strings; found ${matching.length}`,
      )
      continue
    }

    const colorCandidates: string[] = []
    matching.forEach((f) => {
      const props = f.properties || {}
      ;['colour', 'color', 'line_colour'].forEach((key) => {
        const val = props[key]
        if (val && /^#?[0-9a-fA-F]{6}$/.test(val)) {
          colorCandidates.push(val.startsWith('#') ? val : `#${val}`)
        }
      })
    })

    let color = selectMostCommon(colorCandidates)

    if (!color && existingLines?.[line.id]?.color) {
      color = existingLines[line.id].color
    }

    if (!color && existingLines?.[line.id]?.icon) {
      color = await sampleIconColor(existingLines[line.id].icon)
    }

    if (!color) {
      reportCity.colorWarnings.push(
        `Missing color for ${line.id}; needs manual update`,
      )
      color = '#888888'
    }

    const icon = existingLines?.[line.id]?.icon || line.icon || undefined
    const order =
      typeof line.order === 'number'
        ? line.order
        : registry.lines.findIndex((item) => item.id === line.id)

    output[line.id] = {
      name: line.name,
      color,
      backgroundColor: color,
      textColor: inferTextColor(color),
      order: order >= 0 ? order : 0,
      ...(icon ? { icon } : {}),
    }
  }

  return output
}

const buildLineGeometries = (lineFeatures: any[], registry: Registry) => {
  const localLanguages = registry.localLanguages || []
  const geometries: Record<string, any[]> = {}

  for (const line of registry.lines) {
    if (!line.keywords || line.keywords.length === 0) {
      geometries[line.id] = []
      continue
    }
    const matched = lineFeatures.filter((f) => {
      const props = f.properties || {}
      return matchesKeywords(props, line.keywords, localLanguages)
    })

    geometries[line.id] = matched
  }
  return geometries
}

const buildRoutesJson = (lineGeoms: Record<string, any[]>, linesJson: Record<string, any>) => {
  const features: any[] = []
  Object.entries(lineGeoms).forEach(([lineId, geoms]) => {
    geoms.forEach((f) => {
      features.push({
        type: 'Feature',
        geometry: f.geometry,
        properties: {
          line: lineId,
          color: linesJson[lineId]?.color,
          order: linesJson[lineId]?.order ?? 0,
        },
      })
    })
  })
  return { type: 'FeatureCollection', features }
}

const extractStations = (
  registry: Registry,
  lineGeoms: Record<string, any[]>,
  stationFeatures: any[],
  existingFeatures: any[],
  reportCity: ReportCity,
) => {
  const localLanguages = registry.localLanguages || []
  const aliases = registry.stationAliases || {}
  const stationLocalNames = registry.stationLocalNames || {}
  const manualCoords = registry.manualCoords || {}

  const existingByLineName = new Map<string, any>()
  const existingIds = new Map<string, number>()
  let maxId = -1
  existingFeatures.forEach((feature) => {
    const props = feature.properties || {}
    const key = `${props.line}|${props.name}`
    existingByLineName.set(key, feature)
    if (typeof props.id === 'number') maxId = Math.max(maxId, props.id)
  })

  const output: any[] = []

  const stationCandidates = stationFeatures.filter((f) => {
    const props = f.properties || {}
    if (!isOpenFeature(props)) return false
    return f.geometry?.type === 'Point'
  })

  Object.entries(lineGeoms).forEach(([lineId, geoms]) => {
    if (!geoms || geoms.length === 0) return

    const multiLine = {
      type: 'MultiLineString',
      coordinates: geoms
        .map((g) => {
          if (g.geometry?.type === 'LineString') return [g.geometry.coordinates]
          if (g.geometry?.type === 'MultiLineString') return g.geometry.coordinates
          return []
        })
        .flat(),
    }

    const lineStations: any[] = []

    stationCandidates.forEach((station) => {
      const props = station.properties || {}
      const name = props['name:en'] || props.name
      if (!name) return

      const point = turf.point(station.geometry.coordinates)
      const distance = turf.pointToLineDistance(point, multiLine as any, {
        units: 'meters',
      })

      if (distance <= DIST_THRESHOLD_METERS) {
        lineStations.push({ station, distance })
      }
    })

    const byName = new Map<string, any[]>()
    lineStations.forEach(({ station }) => {
      const props = station.properties || {}
      const rawName = props['name:en'] || props.name
      if (!rawName) return
      const canonical = aliases[rawName] || rawName
      const key = normalize(canonical)
      if (!byName.has(key)) byName.set(key, [])
      byName.get(key)!.push(station)
    })

    const collapsed: any[] = []
    byName.forEach((stations, key) => {
      // prefer station node if available
      const preferred = stations.find((s) => {
        const props = s.properties || {}
        return props.public_transport === 'station' || props.railway === 'station'
      })
      collapsed.push(preferred || stations[0])
    })

    // order by distance along line
    const ordered = collapsed
      .map((station) => {
        const point = turf.point(station.geometry.coordinates)
        const snap = turf.nearestPointOnLine(multiLine as any, point, {
          units: 'meters',
        })
        return { station, location: snap.properties?.location ?? 0 }
      })
      .sort((a, b) => a.location - b.location)

    ordered.forEach((entry, index) => {
      const station = entry.station
      const props = station.properties || {}
      const rawName = props['name:en'] || props.name
      if (!rawName) return
      const canonical = aliases[rawName] || rawName
      const canonicalKey = `${lineId}|${canonical}`

      const manualKey = `${lineId}|${canonical}`
      const manualOverride = manualCoords[manualKey]

      const baseFeature = {
        type: 'Feature',
        geometry: manualOverride
          ? { type: 'Point', coordinates: manualOverride[0] }
          : station.geometry,
        properties: {
          name: canonical,
          line: lineId,
          order: index,
        },
      }

      const alternates = new Set<string>()
      alternates.add(canonical)
      if (props.name) alternates.add(props.name)
      if (props['name:en']) alternates.add(props['name:en'])
      const localOverrides = stationLocalNames[canonical]
      if (localOverrides && localOverrides.length) {
        localOverrides.forEach((name) => alternates.add(name))
      }
      localLanguages.forEach((lang) => {
        if (props[`name:${lang}`]) alternates.add(props[`name:${lang}`])
        if (props[`name:${lang}-Latn`]) alternates.add(props[`name:${lang}-Latn`])
      })

      const altNames = Array.from(alternates).filter(Boolean)

      const existing = existingByLineName.get(canonicalKey)
      if (existing) {
        baseFeature.properties.id = existing.properties?.id
        baseFeature.id = existing.properties?.id
        baseFeature.geometry = manualOverride
          ? { type: 'Point', coordinates: manualOverride[0] }
          : station.geometry

        const oldCoords = JSON.stringify(existing.geometry?.coordinates)
        const newCoords = JSON.stringify(baseFeature.geometry?.coordinates)
        if (oldCoords !== newCoords) {
          reportCity.updatedStations.push(canonicalKey)
        }
      } else {
        maxId += 1
        baseFeature.properties.id = maxId
        baseFeature.id = maxId
        reportCity.newStations.push(canonicalKey)
      }

      baseFeature.properties.alternate_names = altNames

      output.push(baseFeature)
    })

    // ensure manual coordinates are included even if station missing from OSM
    Object.keys(manualCoords)
      .filter((key) => key.startsWith(`${lineId}|`))
      .forEach((key) => {
        const stationName = key.split('|')[1]
        const already = output.some((f) => {
          const p = f.properties || {}
          return p.line === lineId && p.name === stationName
        })
        if (already) return
        const coords = manualCoords[key]?.[0]
        if (!coords) return
        maxId += 1
        output.push({
          type: 'Feature',
          geometry: { type: 'Point', coordinates: coords },
          properties: {
            id: maxId,
            name: stationName,
            line: lineId,
            order: output.length,
            alternate_names: [
              stationName,
              ...(stationLocalNames[stationName] || []),
            ],
          },
          id: maxId,
        })
        reportCity.newStations.push(`${lineId}|${stationName}`)
      })
  })

  // keep removed stations for review
  existingFeatures.forEach((feature) => {
    const props = feature.properties || {}
    const key = `${props.line}|${props.name}`
    const stillExists = output.some((f) => {
      const p = f.properties || {}
      return `${p.line}|${p.name}` === key
    })
    if (!stillExists) {
      reportCity.removedStations.push(key)
      output.push(feature)
    }
  })

  return { type: 'FeatureCollection', features: output }
}

const suggestOperator = async (city: string, lineFeatures: any[]) => {
  const candidates: string[] = []
  lineFeatures.forEach((f) => {
    const props = f.properties || {}
    if (props.operator) candidates.push(props.operator)
    if (props.network) candidates.push(props.network)
  })
  const candidate = selectMostCommon(candidates)
  if (!candidate) return null

  const apiKey = process.env.SERPAPI_API_KEY
  if (!apiKey) {
    return { value: candidate, verified: false, source: 'osm' }
  }

  try {
    const res = await axios.get('https://serpapi.com/search.json', {
      params: {
        engine: 'google',
        q: `${candidate} ${city} metro operator`,
        api_key: apiKey,
      },
    })
    const results = res.data?.organic_results || []
    const verified = results.some((r: any) => {
      const text = `${r.title || ''} ${r.snippet || ''}`.toLowerCase()
      return text.includes(candidate.toLowerCase())
    })

    return { value: candidate, verified, source: 'osm+serpapi' }
  } catch {
    return { value: candidate, verified: false, source: 'osm' }
  }
}

const suggestHeaderSubheader = async (city: string, lineFeatures: any[]) => {
  const operators: string[] = []
  const networks: string[] = []
  lineFeatures.forEach((f) => {
    const props = f.properties || {}
    if (props.operator) operators.push(props.operator)
    if (props.network) networks.push(props.network)
  })

  const operator = selectMostCommon(operators)
  const network = selectMostCommon(networks)

  if (!operator && !network) return null

  let verified = false
  let source = 'osm'

  if (operator && process.env.SERPAPI_API_KEY) {
    try {
      const data = await searchSerpApi(`${operator} ${city} metro operator`)
      const results = data?.organic_results || []
      verified = results.some((r: any) => {
        const text = `${r.title || ''} ${r.snippet || ''}`.toLowerCase()
        return text.includes(operator.toLowerCase())
      })
      source = 'osm+serpapi'
    } catch {
      source = 'osm'
    }
  }

  return {
    header: operator || network || 'Unknown Operator',
    subheader: operator && network ? network : undefined,
    verified,
    source,
  }
}

const writeCityData = (
  city: string,
  linesJson: any,
  featuresJson: any,
  routesJson: any,
) => {
  if (process.env.METRO_SYNC_DRY_RUN === '1') return
  const cityPath = path.join(ROOT, 'src', 'app', '(game)')
  const cityDir = findCityDir(cityPath, city)
  if (!cityDir) return

  const dataDir = path.join(cityDir, 'data')
  ensureDir(dataDir)

  fs.writeFileSync(path.join(dataDir, 'lines.json'), JSON.stringify(linesJson, null, 2))
  fs.writeFileSync(
    path.join(dataDir, 'features.json'),
    JSON.stringify(featuresJson, null, 2),
  )
  fs.writeFileSync(
    path.join(dataDir, 'routes.json'),
    JSON.stringify(routesJson, null, 2),
  )

  const publicDataPath = path.join(ROOT, 'public', 'city-data', `${city}.json`)
  ensureDir(path.dirname(publicDataPath))
  const publicJson = {
    features: featuresJson,
    routes: routesJson,
  }
  fs.writeFileSync(publicDataPath, JSON.stringify(publicJson, null, 0))
}

const findCityDir = (rootDir: string, city: string) => {
  const segments = fs.readdirSync(rootDir)
  for (const segment of segments) {
    const base = path.join(rootDir, segment)
    if (!fs.statSync(base).isDirectory()) continue
    const nested = findCityDir(base, city)
    if (nested) return nested
  }
  const name = path.basename(rootDir)
  if (name === city) return rootDir
  return null
}

const loadExisting = (city: string) => {
  const cityDir = findCityDir(path.join(ROOT, 'src', 'app', '(game)'), city)
  if (!cityDir) return { lines: {}, features: [] as any[] }
  const dataDir = path.join(cityDir, 'data')
  const linesPath = path.join(dataDir, 'lines.json')
  const featuresPath = path.join(dataDir, 'features.json')

  const lines = fs.existsSync(linesPath)
    ? JSON.parse(fs.readFileSync(linesPath, 'utf8'))
    : {}
  const features = fs.existsSync(featuresPath)
    ? JSON.parse(fs.readFileSync(featuresPath, 'utf8')).features || []
    : []

  return { lines, features }
}

const buildReportMarkdown = (report: Report) => {
  const lines = [] as string[]
  lines.push(`# Metro Sync Report`)
  lines.push(`Started: ${report.startedAt}`)
  if (report.finishedAt) lines.push(`Finished: ${report.finishedAt}`)
  lines.push('')

  report.cities.forEach((city) => {
    lines.push(`## ${city.city}`)
    lines.push(`- Lines processed: ${city.linesProcessed}`)
    if (city.newLines.length) lines.push(`- New line candidates: ${city.newLines.join(', ')}`)
    if (city.newStations.length)
      lines.push(`- New stations: ${city.newStations.join(', ')}`)
    if (city.updatedStations.length)
      lines.push(`- Updated stations: ${city.updatedStations.join(', ')}`)
    if (city.removedStations.length)
      lines.push(`- Removed stations (review only): ${city.removedStations.join(', ')}`)
    if (city.lineErrors.length)
      lines.push(`- Line errors: ${city.lineErrors.join(' | ')}`)
    if (city.colorWarnings.length)
      lines.push(`- Color warnings: ${city.colorWarnings.join(' | ')}`)
    if (city.operatorSuggestion) {
      lines.push(
        `- Operator suggestion: ${city.operatorSuggestion.value} (verified: ${city.operatorSuggestion.verified})`,
      )
    }
    if (city.headerSuggestion) {
      const sub = city.headerSuggestion.subheader
        ? ` / ${city.headerSuggestion.subheader}`
        : ''
      lines.push(
        `- Header suggestion: ${city.headerSuggestion.header}${sub} (verified: ${city.headerSuggestion.verified})`,
      )
    }
    if (city.verificationNotes.length) {
      lines.push(`- Verification: ${city.verificationNotes.join(' | ')}`)
    }
    lines.push('')
  })

  if (report.errors.length) {
    lines.push('## Errors')
    report.errors.forEach((err) => lines.push(`- ${err}`))
  }

  return lines.join('\n')
}

const sendEmail = async (subject: string, body: string) => {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com'
  const port = Number(process.env.SMTP_PORT || 587)
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS
  const to = process.env.SMTP_TO
  const from = process.env.SMTP_FROM || user

  if (!user || !pass || !to) return

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  })

  await transporter.sendMail({ from, to, subject, text: body })
}

const searchSerpApi = async (query: string) => {
  const apiKey = process.env.SERPAPI_API_KEY
  if (!apiKey) return null
  const res = await axios.get('https://serpapi.com/search.json', {
    params: {
      engine: 'google',
      q: query,
      api_key: apiKey,
    },
  })
  return res.data
}

const main = async () => {
  ensureDir(REPORTS_DIR)
  const startedAt = new Date().toISOString()
  const report: Report = { startedAt, cities: [], errors: [] }

  const registries = filterRegistriesByScope(
    loadRegistries(),
    process.env.METRO_SYNC_SCOPE,
  )
  for (const registry of registries) {
    const reportCity: ReportCity = {
      city: registry.city,
      linesProcessed: 0,
      lineErrors: [],
      newStations: [],
      removedStations: [],
      updatedStations: [],
      newLines: [],
      colorWarnings: [],
      verificationNotes: [],
    }

    try {
      const activeLines = registry.lines.filter(
        (line) => line.keywords && line.keywords.length > 0,
      )
      if (activeLines.length === 0) {
        reportCity.lineErrors.push('No line keywords configured; skipping city')
        report.cities.push(reportCity)
        continue
      }

      const overpassData = await fetchOverpass(registry)
      const geojson = osmtogeojson(overpassData)

      const lineFeatures = (geojson.features || []).filter((f: any) => {
        if (f.geometry?.type !== 'LineString' && f.geometry?.type !== 'MultiLineString') {
          return false
        }
        return isOpenFeature(f.properties || {})
      })

      const stationFeatures = (geojson.features || []).filter((f: any) => {
        return f.geometry?.type === 'Point'
      })

      // Detect new line candidates not in registry
      const keywordNorms = registry.lines.flatMap((l) => l.keywords.map(normalize))
      const newLineCandidates = new Set<string>()
      lineFeatures.forEach((f: any) => {
        const props = f.properties || {}
        const candidates = collectNameCandidates(props, registry.localLanguages || [])
        const candidateNorms = candidates.map(normalize)
        const matchesKnown = candidateNorms.some((c) => keywordNorms.includes(c))
        if (!matchesKnown) {
          const name = props['name:en'] || props.name
          if (name) newLineCandidates.add(name)
        }
      })
      reportCity.newLines.push(...Array.from(newLineCandidates))

      const existing = loadExisting(registry.city)

      const linesJson = await buildLinesJson(
        registry,
        lineFeatures,
        existing.lines,
        reportCity,
      )

      const lineGeoms = buildLineGeometries(lineFeatures, registry)

      reportCity.linesProcessed = Object.keys(lineGeoms).length

      const routesJson = buildRoutesJson(lineGeoms, linesJson)

      const featuresJson = extractStations(
        registry,
        lineGeoms,
        stationFeatures,
        existing.features,
        reportCity,
      )

      writeCityData(registry.city, linesJson, featuresJson, routesJson)

      const operatorSuggestion = await suggestOperator(registry.city, lineFeatures)
      if (operatorSuggestion) reportCity.operatorSuggestion = operatorSuggestion

      const headerSuggestion = await suggestHeaderSubheader(
        registry.city,
        lineFeatures,
      )
      if (headerSuggestion) reportCity.headerSuggestion = headerSuggestion

      // Basic verification for new items (limited to 5 checks)
      if (process.env.SERPAPI_API_KEY) {
        const candidates = [
          ...reportCity.newLines.map((l) => ({ type: 'line', label: l })),
          ...reportCity.newStations.map((s) => ({ type: 'station', label: s })),
        ].slice(0, 5)

        for (const candidate of candidates) {
          const label =
            candidate.type === 'station'
              ? candidate.label.split('|')[1] || candidate.label
              : candidate.label
          const query = `${label} ${registry.city} metro`
          try {
            const data = await searchSerpApi(query)
            const results = data?.organic_results || []
            if (!results.length) {
              reportCity.verificationNotes.push(
                `No search results for ${candidate.type} ${label}`,
              )
            } else {
              reportCity.verificationNotes.push(
                `Verified ${candidate.type} ${label} via search (${results.length} results)`,
              )
            }
          } catch (err: any) {
            reportCity.verificationNotes.push(
              `Search failed for ${candidate.type} ${label}: ${err?.message || err}`,
            )
          }
        }
      }

      report.cities.push(reportCity)
    } catch (err: any) {
      report.errors.push(`${registry.city}: ${err?.message || err}`)
      report.cities.push(reportCity)
    }
  }

  report.finishedAt = new Date().toISOString()

  const reportMd = buildReportMarkdown(report)
  const reportPath = path.join(
    REPORTS_DIR,
    `metro-sync-${new Date().toISOString().slice(0, 10)}.md`,
  )
  fs.writeFileSync(reportPath, reportMd)

  await sendEmail('Metro Sync Report', reportMd)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
