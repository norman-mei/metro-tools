import * as path from 'path'
import { groupBy, mapValues, sortBy, uniqBy } from 'lodash'
import { promises as fs } from 'fs'
import Color from 'color'

const Bun = {
  file(path: string) {
    return {
      async json() {
        return JSON.parse(await fs.readFile(path, 'utf8'))
      },
    }
  },

  async write(path: string, content: string) {
    await fs.writeFile(path, content, 'utf8')
  },
}

const sanitize = (name: string) => {
  // remove parenthesis and anything in between
  return name.replace(/\ \([^)]*\)/g, '').replace('-Blue', '')
}

const stripMetraName = (name: string) =>
  name.replace('METRA Rail: ', '').trim()

type Coordinate = [number, number]

const pointToSegmentDistance = (
  point: Coordinate,
  start: Coordinate,
  end: Coordinate,
) => {
  const [px, py] = point
  const [sx, sy] = start
  const [ex, ey] = end

  const dx = ex - sx
  const dy = ey - sy

  if (dx === 0 && dy === 0) {
    return Math.hypot(px - sx, py - sy)
  }

  const t = Math.max(
    0,
    Math.min(1, ((px - sx) * dx + (py - sy) * dy) / (dx * dx + dy * dy)),
  )

  const cx = sx + t * dx
  const cy = sy + t * dy

  return Math.hypot(px - cx, py - cy)
}

const distanceToPolyline = (point: Coordinate, polyline: Coordinate[]) => {
  if (polyline.length < 2) {
    return Infinity
  }

  let best = Infinity
  for (let i = 0; i < polyline.length - 1; i++) {
    const dist = pointToSegmentDistance(point, polyline[i], polyline[i + 1])
    if (dist < best) {
      best = dist
    }
  }

  return best
}

const METRA_LINE_CONTROL_POINTS: Record<string, string[]> = {
  Metra_BNSF: [
    'Union Station',
    'Halsted Street',
    'Western Avenue (18th)',
    'Cicero',
    'LaVergne',
    'Berwyn',
    'Riverside',
    'LaGrange Road',
    'Western Springs',
    'Hinsdale',
    'Clarendon Hills',
    'Westmont',
    'Fairview Avenue (Downers Grove)',
    'Main Street (Downers Grove)',
    'Lisle',
    'Naperville',
    'Route 59',
    'Aurora',
  ],
  Metra_HC: [
    'Union Station',
    'Summit',
    'Willow Springs',
    'Lemont',
    'Lockport',
    'Romeoville',
    'Joliet',
  ],
  Metra_ME: [
    'Millennium Station',
    'Van Buren Street',
    'Museum Campus / 11th St.',
    'McCormick Place',
    '27th Street',
    '18th Street',
    '47th Street (Kenwood)',
    '53rd Street (Hyde Park)',
    '55th-56th-57th Street',
    '59th Street (University of Chicago)',
    '63rd Street',
    '75th Street (Grand Crossing)',
    '79th Street (Chatham)',
    '83rd Street (Avalon Park)',
    '87th Street (Woodruff)',
    '91st Street (Chesterfield)',
    '95th Street (Chicago State University)',
    '103rd Street (Rosemoor)',
    '107th Street',
    '111th Street',
    'Kensington (115th Street)',
    '147th Street (Sibley Boulevard)',
    'Harvey',
    'Calumet',
    'Hazel Crest',
    'Homewood',
    'Flossmoor',
    'Olympia Fields',
    'Matteson',
    'Richton Park',
    '211th Street (Lincoln Highway)',
    'University Park',
  ],
  Metra_ME_BI: [
    'Kensington (115th Street)',
    'West Pullman',
    'Stewart Ridge',
    'State Street',
    'Ashland Avenue',
    'Ivanhoe',
    'Riverdale',
    'Burr Oak',
    'Blue Island',
    'Racine Avenue',
  ],
  Metra_ME_SC: [
    '63rd Street',
    'Stony Island',
    'Bryn Mawr',
    'South Shore',
    'Windsor Park',
    'Cheltenham (79th Street)',
    '83rd Street',
    '87th Street',
    '93rd Street (South Chicago)',
  ],
  Metra_MDW: [
    'Union Station',
    'Western Avenue (Grand)',
    'Grand / Cicero',
    'Galewood',
    'Mont Clare',
    'Elmwood Park',
    'River Grove',
    'Franklin Park',
    'Bensenville',
    'Wood Dale',
    'Itasca',
    'Medinah',
    'Roselle',
    'Schaumburg',
    'Hanover Park',
    'Bartlett',
    'National Street',
    'Elgin',
    'Big Timber Road',
  ],
  Metra_MDN: [
    'Union Station',
    'Western Avenue (Grand)',
    'Healy',
    'Grayland',
    'Forest Glen',
    'Edgebrook',
    'Morton Grove',
    'Golf',
    'Glenview',
    'North Glenview',
    'Deerfield',
    'Lake Forest (West)',
    'Prairie Crossing (Libertyville)',
    'Libertyville',
    'Grayslake',
    'Round Lake',
    'Long Lake',
    'Ingleside',
    'Fox Lake',
  ],
  Metra_NCS: [
    'Union Station',
    'Western Avenue (Grand)',
    'River Grove',
    'Schiller Park',
    'Rosemont',
    "O'Hare Transfer",
    'Prospect Heights',
    'Wheeling',
    'Buffalo Grove',
    'Prairie View',
    'Vernon Hills',
    'Mundelein',
    'Prairie Crossing',
    'Washington St. (Grayslake)',
    'Round Lake Beach',
    'Lake Villa',
    'Antioch',
  ],
  Metra_RI: [
    'LaSalle Street',
    "35th Street / 'Lou' Jones / Bronzevil*",
    'Gresham',
    'Auburn Park',
    'Oak Forest',
    'Midlothian',
    'Tinley Park',
    'Mokena',
    'Hickory Creek',
    'Laraway Rd',
    'New Lenox',
    'Joliet',
  ],
  Metra_RI_Bev: [
    'LaSalle Street',
    "35th Street / 'Lou' Jones / Bronzevil*",
    'Gresham',
    'Brainerd',
    '95th Street (Beverly Hills)',
    '99th Street (Beverly Hills)',
    '103rd Street (Beverly Hills)',
    '107th Street (Beverly Hills)',
    '111th Street (Morgan Park)',
    '115th Street (Morgan Park)',
    '119th Street',
    '123rd Street',
    'Blue Island (Vermont Street)',
  ],
  Metra_SWS: [
    'Union Station',
    'Wrightwood',
    'Ashburn',
    'Oak Lawn',
    'Chicago Ridge',
    'Worth',
    'Palos Heights',
    'Palos Park',
    '143rd Street (Orland Park)',
    '153rd Street (Orland Park)',
    '179th Street (Orland Park)',
    'Laraway Rd',
    'Manhattan',
  ],
  Metra_UPN: [
    'Ogilvie Transportation Center',
    'Clybourn',
    'Ravenswood',
    'Peterson/Ridge',
    'Rogers Park',
    'Central Street (Evanston)',
    'Wilmette',
    'Kenilworth',
    'Indian Hill',
    'Winnetka',
    'Hubbard Woods',
    'Glencoe',
    'Braeside',
    'Highland Park',
    'Highwood',
    'Fort Sheridan',
    'Lake Forest',
    'Lake Bluff',
    'North Chicago',
    'Waukegan',
    'Winthrop Harbor',
  ],
  Metra_UPNW: [
    'Ogilvie Transportation Center',
    'Clybourn',
    'Irving Park',
    'Jefferson Park',
    'Gladstone Park',
    'Norwood Park',
    'Edison Park',
    'Park Ridge',
    'Dee Road',
    'Des Plaines',
    'Cumberland',
    'Mount Prospect',
    'Arlington Heights',
    'Palatine',
    'Barrington',
    'Fox River Grove',
    'Cary',
    'Crystal Lake',
    'Pingree Road',
    'Woodstock',
    'Harvard',
  ],
  Metra_UPW: [
    'Ogilvie Transportation Center',
    'Kedzie',
    'Oak Park (Marion Street)',
    'River Forest',
    'Maywood',
    'Melrose Park',
    'Bellwood',
    'Berkeley',
    'Elmhurst',
    'Villa Park',
    'Lombard',
    'Glen Ellyn',
    'College Avenue',
    'Wheaton',
    'Winfield',
    'West Chicago',
    'Geneva',
    'La Fox',
    'Elburn',
  ],
}

const METRA_STATION_OVERRIDES: Record<string, string[]> = {
  'Union Station': [
    'Metra_BNSF',
    'Metra_HC',
    'Metra_MDW',
    'Metra_MDN',
    'Metra_NCS',
    'Metra_SWS',
  ],
  'Ogilvie Transportation Center': [
    'Metra_UPN',
    'Metra_UPNW',
    'Metra_UPW',
  ],
  'LaSalle Street': ['Metra_RI', 'Metra_RI_Bev'],
  'Kensington (115th Street)': ['Metra_ME', 'Metra_ME_BI'],
  Hegewisch: ['Metra_ME_SC'],
}

const MANUAL_METRA_STATIONS: Record<string, Coordinate> = {
  'Peterson/Ridge': [-87.6750137146173, 41.99111045534389],
  'Auburn Park': [-87.63963126229456, 41.7500388247871],
}

const CTA_MANUAL_STATIONS: Array<{
  name: string
  line: string
  coordinates: Coordinate
  order?: number
}> = [
  {
    name: 'Damen',
    line: 'CTAMetroGreenLine',
    coordinates: [-87.67689402343791, 41.884996093594495],
  },
  {
    name: '103rd',
    line: 'CTAMetroRedLine',
    coordinates: [-87.63314308448497, 41.70706284087208],
  },
  {
    name: '111th',
    line: 'CTAMetroRedLine',
    coordinates: [-87.63273137479318, 41.69251245039428],
  },
  {
    name: 'Michigan',
    line: 'CTAMetroRedLine',
    coordinates: [-87.62067069868462, 41.68302711259891],
  },
  {
    name: '130th',
    line: 'CTAMetroRedLine',
    coordinates: [-87.59424997715394, 41.66000990188678],
  },
]

const NICTD_LINE_SEQUENCES: Record<string, string[]> = {
  NICTD_SSL: [
    'Millennium Station',
    'Van Buren Street',
    'Museum Campus / 11th St.',
    'McCormick Place',
    '18th Street',
    '55th-56th-57th Street',
    '63rd Street',
    'Hegewisch',
    'Hammond Gateway',
    'East Chicago',
    'Gary/Chicago Airport - Clark Road',
    'Gary Metro Center',
    'Miller',
    'Portage/Ogden Dunes',
    'Dune Park',
    'Beverly Shores',
    'Michigan City - 11th Street',
    'Carroll Avenue',
    'Hudson Lake',
    'South Bend International Airport',
  ],
  NICTD_MCL: [
    'Hammond Gateway',
    'South Hammond',
    'Munster Ridge Road',
    'Munster/Dyer Main Street',
  ],
}

const NICTD_STATION_COORDINATES: Record<string, Coordinate> = {
  'Hammond Gateway': [-87.51655196823756, 41.63106074045832],
  'East Chicago': [-87.47897551435258, 41.611616963425874],
  'Gary/Chicago Airport - Clark Road': [-87.3945133353459, 41.605535339826105],
  'Gary Metro Center': [-87.33717615116895, 41.60466560292818],
  Miller: [-87.26839847971016, 41.59791534669417],
  'Portage/Ogden Dunes': [-87.18671433308832, 41.61744123760935],
  'Dune Park': [-87.06091190482577, 41.64494116551673],
  'Beverly Shores': [-86.98546877588838, 41.673158181949624],
  'Michigan City - 11th Street': [-86.89747808169903, 41.711849655595536],
  'Carroll Avenue': [-86.86776118563161, 41.71331204245998],
  'Hudson Lake': [-86.53766799634032, 41.7094797647858],
  'South Bend International Airport': [-86.310981093857, 41.70075016104912],
  'South Hammond': [-87.51851223519256, 41.58130747967339],
  'Munster Ridge Road': [-87.51853689447364, 41.56280395100034],
  'Munster/Dyer Main Street': [-87.51805783712922, 41.52405243314766],
}

const METRA_LINE_NAMES: Record<string, string> = {
  Metra_BNSF: 'BNSF',
  Metra_HC: 'Heritage Corridor',
  Metra_ME: 'Metra Electric (University Park)',
  Metra_ME_BI: 'Metra Electric (Blue Island Branch)',
  Metra_ME_SC: 'Metra Electric (South Chicago Branch)',
  Metra_MDW: 'Milwaukee District West',
  Metra_MDN: 'Milwaukee District North',
  Metra_NCS: 'North Central Service',
  Metra_RI: 'Rock Island District',
  Metra_RI_Bev: 'Rock Island (Beverly Branch)',
  Metra_SWS: 'SouthWest Service',
  Metra_UPN: 'Union Pacific North',
  Metra_UPNW: 'Union Pacific Northwest',
  Metra_UPW: 'Union Pacific West',
  NICTD_SSL: 'South Shore Line (SSL)',
  NICTD_MCL: 'Monon Corridor Line (MCL)',
}

const METRA_LINE_COLORS: Record<string, string> = {
  Metra_BNSF: '#43b02a',
  Metra_HC: '#862041',
  Metra_ME: '#fe5000',
  Metra_ME_BI: '#c5e9ea',
  Metra_ME_SC: '#dfdcd4',
  Metra_MDW: '#f1be48',
  Metra_MDN: '#e57200',
  Metra_NCS: '#9063cd',
  Metra_RI: '#da291c',
  Metra_RI_Bev: '#717c7d',
  Metra_SWS: '#005eb8',
  Metra_UPN: '#00843d',
  Metra_UPNW: '#fedd00',
  Metra_UPW: '#ffb1bb',
  NICTD_SSL: '#6A1311',
  NICTD_MCL: '#DC1A21',
}

const main = async () => {
  // --- STATIONS ---
  const data = Bun.file(path.join(__dirname, './source.json'))

  const { routes, stops } = (await data.json()) as any

  const additionalLineKeys = [
    ...Object.keys(METRA_LINE_CONTROL_POINTS),
    ...Object.keys(NICTD_LINE_SEQUENCES),
  ]

  const availableLines = new Set([
    ...routes.map((route: any) => route.live_line_code),
    ...additionalLineKeys,
  ])

  const featuresRoutes = routes
    .flatMap((route: any, i: number) => {
      return route.patterns.map((pattern: any) => {
        return {
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: pattern.path.map((coord: any) => [coord[1], coord[0]]),
          },
          properties: {
            line: route.live_line_code,
            name: route.name,
            color: route.color,
            order: i,
          },
        }
      })
    })
    .filter((feature: any) => availableLines.has(feature.properties.line))

  let index = 0

  let featuresStations = uniqBy(
    routes.flatMap((route: any) => {
      return route.patterns
        .flatMap((pattern: any) => {
          return pattern.stop_points.map(
            ({ id: code, path_index }: { id: string; path_index: number }) => {
              const id = ++index
              return {
                type: 'Feature',
                geometry: {
                  type: 'Point',
                  coordinates: [
                    pattern.path[path_index][1],
                    pattern.path[path_index][0],
                  ],
                },
                properties: {
                  id,
                  name: sanitize(stops[code].name),
                  line: route.live_line_code,
                  order: path_index,
                },
                id,
              }
            },
          )
        })
        .filter((feature: any) => availableLines.has(feature.properties.line))
    }),
    (f: any) => f.properties.line + f.properties.name,
  )

  const featureKey = (line: string, name: string) => `${line}::${name}`

  const existingFeatureKeys = new Set(
    featuresStations.map((feature: any) =>
      featureKey(feature.properties.line, feature.properties.name),
    ),
  )

  const lineMaxOrder = new Map<string, number>()
  featuresStations.forEach((feature: any) => {
    const line = feature.properties.line
    const order = feature.properties.order
    if (typeof order === 'number') {
      const current = lineMaxOrder.get(line)
      lineMaxOrder.set(
        line,
        current !== undefined ? Math.max(current, order) : order,
      )
    }
  })

  const pushFeature = (
    line: string,
    name: string,
    coordinates: Coordinate,
    order?: number,
  ) => {
    const key = featureKey(line, name)
    if (existingFeatureKeys.has(key)) {
      return
    }

    availableLines.add(line)

    const id = ++index
    const properties: any = {
      id,
      name,
      line,
    }

    if (typeof order === 'number') {
      properties.order = order
    }

    featuresStations.push({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates,
      },
      properties,
      id,
    })

    existingFeatureKeys.add(key)
  }

  const metraRaw = JSON.parse(
    await fs.readFile(
      path.join(__dirname, './metra stations.geojson'),
      'utf8',
    ),
  ) as any

  const metraStations: {
    name: string
    coordinates: Coordinate
    feature: any
  }[] = (metraRaw.features || []).map((feature: any) => {
    const name = stripMetraName(feature.properties?.Station_name ?? '')
    return {
      name,
      coordinates: [feature.geometry.coordinates[0], feature.geometry.coordinates[1]] as Coordinate,
      feature,
    }
  })

  const metraStationMap = new Map<string, { coordinates: Coordinate; feature: any }>()
  for (const station of metraStations) {
    if (!station.name) {
      continue
    }
    metraStationMap.set(station.name, {
      coordinates: station.coordinates,
      feature: station.feature,
    })
  }

  const ensureMetraStation = (name: string, coordinates: Coordinate) => {
    if (metraStationMap.has(name)) {
      return
    }

    const feature = {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [coordinates[0], coordinates[1]],
      },
      properties: {
        Station_name: `METRA Rail: ${name}`,
      },
    }

    metraStationMap.set(name, {
      coordinates,
      feature,
    })
  }

  Object.entries(MANUAL_METRA_STATIONS).forEach(([name, coords]) =>
    ensureMetraStation(name, coords),
  )

  const metraLinePolylines: Record<string, Coordinate[]> = mapValues(
    METRA_LINE_CONTROL_POINTS,
    (controlPoints) =>
      controlPoints
        .map((name) => {
          const station = metraStationMap.get(name)
          if (!station) {
            console.warn(`Missing control station for ${name}`)
            return null
          }
          return station.coordinates
        })
        .filter((coord): coord is Coordinate => Array.isArray(coord)),
  )

  const baseAssignments = new Map<string, string>()

  for (const [name, { coordinates }] of metraStationMap.entries()) {
    let bestLine: string | null = null
    let bestDistance = Infinity

    for (const [line, polyline] of Object.entries(metraLinePolylines)) {
      if (polyline.length < 2) {
        continue
      }

      const distance = distanceToPolyline(coordinates, polyline)
      if (distance < bestDistance) {
        bestDistance = distance
        bestLine = line
      }
    }

    if (bestLine) {
      baseAssignments.set(name, bestLine)
    } else {
      console.warn(`Unable to assign Metra station to line: ${name}`)
    }
  }

  for (const [name, station] of metraStationMap.entries()) {
    const overrides = METRA_STATION_OVERRIDES[name]
    const lines = overrides ?? (baseAssignments.get(name) ? [baseAssignments.get(name)!] : [])

    if (!lines || lines.length === 0) {
      continue
    }

    for (const line of lines) {
      pushFeature(line, name, station.coordinates)
    }
  }

  CTA_MANUAL_STATIONS.forEach((station) => {
    const currentMax = lineMaxOrder.get(station.line) ?? -1
    const order =
      typeof station.order === 'number'
        ? station.order
        : currentMax + 1
    lineMaxOrder.set(station.line, Math.max(currentMax, order))
    pushFeature(station.line, station.name, station.coordinates, order)
  })

  const getStationCoordinates = (name: string): Coordinate => {
    if (NICTD_STATION_COORDINATES[name]) {
      return NICTD_STATION_COORDINATES[name]
    }

    const metraStation = metraStationMap.get(name)
    if (metraStation) {
      return metraStation.coordinates
    }

    const existing = featuresStations.find(
      (feature) => feature.properties.name === name,
    )
    if (existing && Array.isArray(existing.geometry.coordinates)) {
      return existing.geometry.coordinates as Coordinate
    }

    throw new Error(`Missing coordinates for station ${name}`)
  }

  Object.entries(NICTD_LINE_SEQUENCES).forEach(([line, stationNames]) => {
    let currentOrder = lineMaxOrder.get(line) ?? -1

    stationNames.forEach((stationName) => {
      currentOrder += 1
      lineMaxOrder.set(line, currentOrder)

      const coords = getStationCoordinates(stationName)
      pushFeature(line, stationName, coords, currentOrder)
    })
  })

  Bun.write(
    path.join(__dirname, './features.json'),
    JSON.stringify(
      {
        type: 'FeatureCollection',
        features: sortBy(
          featuresStations,
          (f) => -(f.properties.order || Infinity),
        ),
        properties: {
          totalStations: featuresStations.length,
          stationsPerLine: mapValues(
            groupBy(featuresStations, (feature) => feature.properties!.line),
            (stations) => stations.length,
          ),
        },
      },
      null,
      2,
    ),
  )

  Bun.write(
    path.join(__dirname, './routes.json'),
    JSON.stringify(
      {
        type: 'FeatureCollection',
        features: sortBy(featuresRoutes, (f) => -f.properties.order),
      },
      null,
      2,
    ),
  )

  const lineMetadata = routes.reduce((acc: any, route: any, i: number) => {
    acc[route.live_line_code] = {
      name: route.name,
      color: route.color,
      backgroundColor: Color(route.color).darken(0.5).hex(),
      textColor: route.text_color || '#FFFFFF',
      order: i,
    }
    return acc
  }, {})

  let orderOffset = Object.keys(lineMetadata).length

  Object.entries(METRA_LINE_COLORS).forEach(([line, color], idx) => {
    const name = METRA_LINE_NAMES[line] ?? line
    const colorObj = Color(color)
    let backgroundColor = colorObj.darken(0.5).hex()
    const textColor = colorObj.isLight() ? '#111827' : '#FFFFFF'

    if (line === 'Metra_BNSF' || line === 'Metra_MDN') {
      backgroundColor = '#FFFFFF'
    }

    lineMetadata[line] = {
      name,
      color,
      backgroundColor,
      textColor,
      order: orderOffset + idx,
    }
  })

  Bun.write(
    path.join(__dirname, './lines.json'),
    JSON.stringify(lineMetadata, null, 2),
  )
}

main()
