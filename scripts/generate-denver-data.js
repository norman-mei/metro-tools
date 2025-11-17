const fs = require('fs')
const path = require('path')
const Color = require('color')

const rootDir = path.resolve(__dirname, '..')
const sourcePath = path.join(
  rootDir,
  'src/app/(game)/denver/LightrailStations.geojson',
)
const outputDir = path.join(rootDir, 'src/app/(game)/denver/data')

const raw = JSON.parse(fs.readFileSync(sourcePath, 'utf8'))

const rawLookup = new Map()
for (const feature of raw.features) {
  rawLookup.set(feature.properties.NAME.trim(), {
    coordinates: feature.geometry.coordinates,
  })
}

const stationConfig = {
  'Union Station': {
    sourceNames: ['Union Station Transit Center'],
    alternateNames: [
      'Union Station Transit Center',
      'Denver Union Station',
      'Union',
    ],
  },
  '38th & Blake': {
    sourceNames: ['38th / Blake Station'],
  },
  '40th & Colorado': {
    sourceNames: ['40th / Colorado Station'],
  },
  'Central Park': {
    sourceNames: ['Central Park Station'],
  },
  Peoria: {
    sourceNames: ['Peoria Station'],
    alternateNames: ['Peoria Station'],
  },
  '40th Ave & Airport Blvd - Gateway Park': {
    sourceNames: ['40th / Airport - Gateway Park Station'],
    alternateNames: ['40th Ave & Airport Blvd–Gateway Park'],
  },
  '61st & Peña': {
    sourceNames: ['61st / Pena Station'],
    alternateNames: ['61st & Pena', '61st & Pena Station'],
  },
  'Denver Airport': {
    sourceNames: ['Denver Airport Station'],
    alternateNames: [
      'Denver International Airport',
      'Denver Airport Station',
      'Denver Airport',
      'DEN',
      'DIA',
      'Airport',
    ],
    clusterKey: 'denver-airport-complex',
  },
  '41st & Fox': {
    sourceNames: ['41st / Fox Station'],
  },
  'Pecos Junction': {
    sourceNames: ['Pecos Junction Station'],
  },
  Westminster: {
    sourceNames: ['Westminster Station'],
  },
  'Clear Creek / Federal': {
    sourceNames: ['Clear Creek / Federal Station'],
  },
  '60th & Sheridan - Arvada Gold Strike': {
    sourceNames: ['60th/Sheridan-Arvada Gold Strike Station'],
    alternateNames: ['60th & Sheridan–Arvada Gold Strike'],
  },
  'Olde Town Arvada': {
    sourceNames: ['Olde Town Arvada Station'],
  },
  'Arvada Ridge': {
    sourceNames: ['Arvada Ridge Station'],
  },
  'Wheat Ridge - Ward': {
    sourceNames: ['Wheat Ridge / Ward Road Station'],
    alternateNames: ['Wheat Ridge–Ward'],
  },
  'Ball Arena - Elitch Gardens': {
    sourceNames: ['Ball Arena / Elitch Gardens Station'],
    alternateNames: ['Ball Arena–Elitch Gardens'],
  },
  'Empower Field at Mile High': {
    sourceNames: ['Empower Field at Mile High'],
  },
  'Auraria West': {
    sourceNames: ['Auraria West Campus Station'],
  },
  '20th & Welton': {
    sourceNames: ['20th St / Welton Station'],
  },
  '25th & Welton': {
    sourceNames: ['25th St / Welton Station'],
  },
  '27th & Welton': {
    sourceNames: ['27th St / Welton Station'],
  },
  '30th & Downing': {
    sourceNames: ['30th / Downing Station'],
  },
  'Decatur - Federal': {
    sourceNames: ['Decatur-Federal Station'],
    alternateNames: ['Decatur–Federal'],
  },
  Knox: {
    sourceNames: ['Knox Station'],
  },
  Perry: {
    sourceNames: ['Perry Station'],
  },
  Sheridan: {
    sourceNames: ['Sheridan Station'],
  },
  Lamar: {
    sourceNames: ['Lamar Station'],
  },
  'Lakewood - Wadsworth': {
    sourceNames: ['Lakewood-Wadsworth Station'],
    alternateNames: ['Lakewood–Wadsworth'],
  },
  Garrison: {
    sourceNames: ['Garrison Station'],
  },
  Oak: {
    sourceNames: ['Oak Station'],
  },
  'Federal Center': {
    sourceNames: ['Federal Center Station'],
  },
  'Red Rocks College': {
    sourceNames: ['Red Rocks College Station'],
  },
  'Jefferson County Government Center - Golden': {
    sourceNames: ['Jefferson CO Government-Golden Station'],
    alternateNames: ['Jefferson County Government Center–Golden'],
  },
  'Colfax at Auraria': {
    sourceNames: ['Colfax at Auraria Station'],
  },
  'Theatre District - Convention Center': {
    sourceNames: ['Theatre District / Convention Center'],
    alternateNames: ['Theatre District–Convention Center'],
  },
  '16th & California / 16th & Stout': {
    sourceNames: [
      '16th Street / California Station',
      '16th Street / Stout Station',
    ],
    alternateNames: ['16th & California', '16th & Stout'],
  },
  '18th & California / 18th & Stout': {
    sourceNames: [
      '18th St / California Station',
      '18th St / Stout Station',
    ],
    alternateNames: ['18th & California', '18th & Stout'],
  },
  '10th & Osage': {
    sourceNames: ['10th / Osage Station'],
  },
  Alameda: {
    sourceNames: ['Alameda Station'],
  },
  'I-25 & Broadway': {
    sourceNames: ['I-25 / Broadway Station'],
  },
  Evans: {
    sourceNames: ['Evans Station'],
  },
  Englewood: {
    sourceNames: ['Englewood Station'],
  },
  'Oxford - City of Sheridan': {
    sourceNames: ['Oxford-City of Sheridan Station'],
    alternateNames: ['Oxford–City of Sheridan'],
  },
  'Littleton - Downtown': {
    sourceNames: ['Littleton / Downtown Station'],
    alternateNames: ['Littleton–Downtown'],
  },
  'Littleton - Mineral': {
    sourceNames: ['Littleton / Mineral Station'],
    alternateNames: ['Littleton–Mineral'],
  },
  'Louisiana - Pearl': {
    sourceNames: ['Louisiana / Pearl Station'],
    alternateNames: ['Louisiana–Pearl'],
  },
  'University of Denver': {
    sourceNames: ['University of Denver Station'],
  },
  Colorado: {
    sourceNames: ['Colorado Station'],
  },
  Yale: {
    sourceNames: ['Yale Station'],
  },
  Southmoor: {
    sourceNames: ['Southmoor Station'],
  },
  Belleview: {
    sourceNames: ['Belleview Station'],
  },
  Orchard: {
    sourceNames: ['Orchard Station'],
  },
  'Arapahoe at Village Center': {
    sourceNames: ['Arapahoe at Village Center Station'],
  },
  'Dry Creek': {
    sourceNames: ['Dry Creek Station'],
  },
  'County Line': {
    sourceNames: ['County Line Station'],
  },
  Lincoln: {
    sourceNames: ['Lincoln Station'],
  },
  'Sky Ridge': {
    sourceNames: ['Sky Ridge Station'],
  },
  'Lone Tree City Center': {
    sourceNames: ['Lone Tree City Center Station'],
  },
  'RidgeGate Parkway': {
    sourceNames: ['RidgeGate Parkway Station'],
  },
  'Main Terminal': {
    coordinates: [-104.67380301516943, 39.8504203071417],
    alternateNames: ['Jeppesen Terminal'],
    clusterKey: 'denver-airport-complex',
  },
  'A Gates': {
    coordinates: [-104.67380822527777, 39.85386118924015],
  },
  'B Gates': {
    coordinates: [-104.67374927259763, 39.859259435063215],
  },
  'C Gates': {
    coordinates: [-104.67369296359355, 39.863135025873724],
  },
  Dayton: {
    sourceNames: ['Dayton Station'],
  },
  'Nine Mile': {
    sourceNames: ['Nine Mile Station'],
  },
  Iliff: {
    sourceNames: ['Iliff Station'],
  },
  Florida: {
    sourceNames: ['Florida Station'],
  },
  Fitzsimons: {
    sourceNames: ['Fitzsimons Station'],
  },
  Colfax: {
    sourceNames: ['Colfax Station'],
  },
  '13th Avenue': {
    sourceNames: ['13th Avenue Station'],
  },
  '2nd Avenue & Abilene': {
    sourceNames: ['2nd Ave / Abilene Station'],
  },
  'Aurora Metro Center': {
    sourceNames: ['Aurora Metro Center Station'],
  },
  '48th & Brighton / National Western Center': {
    sourceNames: ["48th Ave/Brighton Blvd@Nat'l Western Ctr"],
  },
  'Commerce City / 72nd': {
    sourceNames: ['Commerce City / 72nd Ave'],
  },
  'Original Thornton / 88th': {
    sourceNames: ['Original Thornton / 88th Ave'],
  },
  'Thornton Crossroads / 104th': {
    sourceNames: ['Thornton Crossroads / 104th Ave'],
  },
  'Northglenn / 112th': {
    sourceNames: ['Northglenn / 112th Ave'],
  },
  'Eastlake / 124th': {
    sourceNames: ['Eastlake / 124th Ave'],
  },
}

const getCoordinateForStation = (configEntry, stationName) => {
  if (Array.isArray(configEntry.coordinates)) {
    if (configEntry.coordinates.length !== 2) {
      throw new Error(`Invalid manual coordinates for ${stationName}`)
    }
    return [...configEntry.coordinates]
  }
  const names = configEntry.sourceNames || []
  const coordinates = names.map((name) => {
    const entry = rawLookup.get(name)
    if (!entry) {
      throw new Error(`Missing source station: ${name}`)
    }
    return entry.coordinates
  })
  if (coordinates.length === 0) {
    throw new Error('No coordinates provided')
  }
  if (coordinates.length === 1) {
    return coordinates[0]
  }
  const avgLon =
    coordinates.reduce((sum, coord) => sum + coord[0], 0) /
    coordinates.length
  const avgLat =
    coordinates.reduce((sum, coord) => sum + coord[1], 0) /
    coordinates.length
  return [avgLon, avgLat]
}

const lineDefinitions = [
  {
    id: 'Denver_RTD_A',
    name: 'A Line',
    icon: 'Denver_RTD_A',
    stations: [
      'Union Station',
      '38th & Blake',
      '40th & Colorado',
      'Central Park',
      'Peoria',
      '40th Ave & Airport Blvd - Gateway Park',
      '61st & Peña',
      'Denver Airport',
    ],
  },
  {
    id: 'Denver_RTD_B',
    name: 'B Line',
    icon: 'Denver_RTD_B',
    stations: ['Union Station', '41st & Fox', 'Pecos Junction', 'Westminster'],
  },
  {
    id: 'Denver_RTD_G',
    name: 'G Line',
    icon: 'Denver_RTD_G',
    stations: [
      'Union Station',
      '41st & Fox',
      'Pecos Junction',
      'Clear Creek / Federal',
      '60th & Sheridan - Arvada Gold Strike',
      'Olde Town Arvada',
      'Arvada Ridge',
      'Wheat Ridge - Ward',
    ],
  },
  {
    id: 'Denver_RTD_N',
    name: 'N Line',
    icon: 'Denver_RTD_N',
    stations: [
      'Union Station',
      '48th & Brighton / National Western Center',
      'Commerce City / 72nd',
      'Original Thornton / 88th',
      'Thornton Crossroads / 104th',
      'Northglenn / 112th',
      'Eastlake / 124th',
    ],
  },
  {
    id: 'Denver_RTD_D',
    name: 'D Line',
    icon: 'Denver_RTD_D',
    stations: [
      '18th & California / 18th & Stout',
      '16th & California / 16th & Stout',
      'Theatre District - Convention Center',
      'Colfax at Auraria',
      '10th & Osage',
      'Alameda',
      'I-25 & Broadway',
      'Evans',
      'Englewood',
      'Oxford - City of Sheridan',
      'Littleton - Downtown',
      'Littleton - Mineral',
    ],
  },
  {
    id: 'Denver_RTD_E',
    name: 'E Line',
    icon: 'Denver_RTD_E',
    stations: [
      'Union Station',
      'Ball Arena - Elitch Gardens',
      'Empower Field at Mile High',
      'Auraria West',
      '10th & Osage',
      'Alameda',
      'I-25 & Broadway',
      'Louisiana - Pearl',
      'University of Denver',
      'Colorado',
      'Yale',
      'Southmoor',
      'Belleview',
      'Orchard',
      'Arapahoe at Village Center',
      'Dry Creek',
      'County Line',
      'Lincoln',
      'Sky Ridge',
      'Lone Tree City Center',
      'RidgeGate Parkway',
    ],
  },
  {
    id: 'Denver_RTD_H',
    name: 'H Line',
    icon: 'Denver_RTD_H',
    stations: [
      '18th & California / 18th & Stout',
      '16th & California / 16th & Stout',
      'Theatre District - Convention Center',
      'Colfax at Auraria',
      '10th & Osage',
      'Alameda',
      'I-25 & Broadway',
      'Louisiana - Pearl',
      'University of Denver',
      'Colorado',
      'Yale',
      'Southmoor',
      'Dayton',
      'Nine Mile',
      'Iliff',
      'Florida',
    ],
  },
  {
    id: 'Denver_RTD_L',
    name: 'L Line',
    icon: 'Denver_RTD_L',
    stations: [
      '16th & California / 16th & Stout',
      '18th & California / 18th & Stout',
      '20th & Welton',
      '25th & Welton',
      '27th & Welton',
      '30th & Downing',
    ],
  },
  {
    id: 'Denver_RTD_R',
    name: 'R Line',
    icon: 'Denver_RTD_R',
    stations: [
      'Peoria',
      'Fitzsimons',
      'Colfax',
      '13th Avenue',
      '2nd Avenue & Abilene',
      'Aurora Metro Center',
      'Florida',
      'Iliff',
      'Nine Mile',
      'Dayton',
      'Belleview',
      'Orchard',
      'Arapahoe at Village Center',
      'Dry Creek',
      'County Line',
      'Lincoln',
    ],
  },
  {
    id: 'Denver_RTD_W',
    name: 'W Line',
    icon: 'Denver_RTD_W',
    stations: [
      'Union Station',
      'Ball Arena - Elitch Gardens',
      'Empower Field at Mile High',
      'Auraria West',
      'Decatur - Federal',
      'Knox',
      'Perry',
      'Sheridan',
      'Lamar',
      'Lakewood - Wadsworth',
      'Garrison',
      'Oak',
      'Federal Center',
      'Red Rocks College',
      'Jefferson County Government Center - Golden',
    ],
  },
  {
    id: 'DenverAGTS',
    name: 'Denver International Airport AGTS',
    icon: 'DenverAGTS',
    color: '#005DA8',
    stations: ['Main Terminal', 'A Gates', 'B Gates', 'C Gates'],
  },
]

const ensureStationConfig = (stationName) => {
  const configEntry = stationConfig[stationName]
  if (!configEntry) {
    throw new Error(`Missing station config for ${stationName}`)
  }
  return configEntry
}

const generateLineColor = (icon, overrideColor) => {
  const svgPath = path.join(rootDir, 'public/images', `${icon}.svg`)
  let baseColor
  if (overrideColor) {
    baseColor = Color(overrideColor)
  } else {
    const svgContents = fs.readFileSync(svgPath, 'utf8')
    const match = svgContents.match(/fill:rgb\((\d+),(\d+),(\d+)\)/)
    if (!match) {
      throw new Error(`No fill color found for ${icon}`)
    }
    const [, r, g, b] = match
    baseColor = Color.rgb(Number(r), Number(g), Number(b))
  }
  const backgroundColor = baseColor.darken(0.5).hex()
  const progressOutlineColor = baseColor.lighten(0.2).hex()
  const textColor = baseColor.isLight() ? '#111827' : '#FFFFFF'
  return {
    color: baseColor.hex(),
    backgroundColor,
    progressOutlineColor,
    textColor,
  }
}

let stationId = 0
const featureCollection = {
  type: 'FeatureCollection',
  features: [],
}

const routesCollection = {
  type: 'FeatureCollection',
  features: [],
}

const lines = {}

lineDefinitions.forEach((line, index) => {
  const { color, backgroundColor, progressOutlineColor, textColor } =
    generateLineColor(line.icon, line.color)
  lines[line.id] = {
    name: line.name,
    color,
    backgroundColor,
    progressOutlineColor,
    textColor,
    order: index,
  }

  const routeCoordinates = []
  line.stations.forEach((stationName, stationIndex) => {
    const configEntry = ensureStationConfig(stationName)
    const coordinates = getCoordinateForStation(configEntry, stationName)
    routeCoordinates.push(coordinates)

    const stationFeatureId = ++stationId

    const feature = {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates,
      },
      properties: {
        id: stationFeatureId,
        name: stationName,
        line: line.id,
        order: stationIndex,
      },
      id: stationFeatureId,
    }

    const alternates = new Set(configEntry.alternateNames ?? [])
    for (const sourceName of configEntry.sourceNames ?? []) {
      const trimmedSource = sourceName?.trim()
      if (trimmedSource && trimmedSource !== stationName) {
        alternates.add(trimmedSource)
      }
    }
    if (alternates.size > 0) {
      feature.properties.alternate_names = Array.from(alternates)
    }

    if (configEntry.clusterKey !== undefined) {
      feature.properties.cluster_key = configEntry.clusterKey
    }

    featureCollection.features.push(feature)
  })

  routesCollection.features.push({
    type: 'Feature',
    geometry: {
      type: 'LineString',
      coordinates: routeCoordinates,
    },
    properties: {
      line: line.id,
      name: line.name,
      color,
      order: index,
    },
  })
})

fs.mkdirSync(outputDir, { recursive: true })
fs.writeFileSync(
  path.join(outputDir, 'features.json'),
  JSON.stringify(featureCollection, null, 2),
)
fs.writeFileSync(
  path.join(outputDir, 'routes.json'),
  JSON.stringify(routesCollection, null, 2),
)
fs.writeFileSync(
  path.join(outputDir, 'lines.json'),
  JSON.stringify(lines, null, 2),
)
