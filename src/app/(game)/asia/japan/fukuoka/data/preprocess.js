const fs = require('fs')
const path = require('path')
const Color = require('color')

const root = __dirname
const geoPath = path.join(root, 'fukuoka.geojson')
const outFeatures = path.join(root, 'features.json')
const outRoutes = path.join(root, 'routes.json')
const outLines = path.join(root, 'lines.json')

const lineSpecs = [
  {
    id: 'Kuko',
    name: '空港線 Kūkō Line',
    color: '#ee5511',
    icon: 'asia/japan/fukuoka/kuko.png',
    order: 0,
    keywords: ['福岡市地下鉄空港線'],
  },
  {
    id: 'Hakozaki',
    name: '箱崎線 Hakozaki Line',
    color: '#0077cc',
    icon: 'asia/japan/fukuoka/hakozaki.png',
    order: 1,
    keywords: ['福岡市地下鉄箱崎線'],
  },
  {
    id: 'Nanakuma',
    name: '七隈線 Nanakuma Line',
    color: '#01936b',
    icon: 'asia/japan/fukuoka/nanakuma.png',
    order: 2,
    keywords: ['福岡市地下鉄七隈線'],
  },
]

const stations = {
  Kuko: [
    { en: 'Meinohama', ja: '姪浜' },
    { en: 'Muromi', ja: '室見' },
    { en: 'Fujisaki', ja: '藤崎' },
    { en: 'Nishijin', ja: '西新' },
    { en: 'Tojinmachi', ja: '唐人町' },
    { en: 'Ohorikoen', ja: '大濠公園' },
    { en: 'Akasaka', ja: '赤坂' },
    { en: 'Tenjin', ja: '天神' },
    { en: 'Nakasu-Kawabata', ja: '中洲川端' },
    { en: 'Gion', ja: '祇園' },
    { en: 'Hakata', ja: '博多' },
    { en: 'Higashi-Hi', ja: '東比恵' },
    { en: 'Fukuoka-kuko', ja: '福岡空港' },
  ],
  Hakozaki: [
    { en: 'Meinohama', ja: '姪浜' },
    { en: 'Muromi', ja: '室見' },
    { en: 'Fujisaki', ja: '藤崎' },
    { en: 'Nishijin', ja: '西新' },
    { en: 'Tojinmachi', ja: '唐人町' },
    { en: 'Ohorikoen', ja: '大濠公園' },
    { en: 'Akasaka', ja: '赤坂' },
    { en: 'Tenjin', ja: '天神' },
    { en: 'Nakasu-Kawabata', ja: '中洲川端' },
    { en: 'Gofukumachi', ja: '呉服町' },
    { en: 'Chiyo-Kenchōguchi', ja: '千代県庁口' },
    { en: 'Maidashi-Kyūdai-byōin-mae', ja: '馬出九大病院前' },
    { en: 'Hakozaki-Miyamae', ja: '箱崎宮前' },
    { en: 'Hakozaki-Kyūdai-mae', ja: '箱崎九大前' },
    { en: 'Kaizuka', ja: '貝塚' },
  ],
  Nanakuma: [
    { en: 'Hashimoto', ja: '橋本' },
    { en: 'Jirōmaru', ja: '次郎丸' },
    { en: 'Kamo', ja: '賀茂' },
    { en: 'Noke', ja: '野芥' },
    { en: 'Umebayashi', ja: '梅林' },
    { en: 'Fukudaimae', ja: '福大前' },
    { en: 'Nanakuma', ja: '七隈' },
    { en: 'Kanayama', ja: '金山' },
    { en: 'Chayama', ja: '茶山' },
    { en: 'Befu', ja: '別府' },
    { en: 'Ropponmatsu', ja: '六本松' },
    { en: 'Sakurazaka', ja: '桜坂' },
    { en: 'Yakuin-ōdōri', ja: '薬院大通' },
    { en: 'Yakuin', ja: '薬院' },
    { en: 'Watanabe-dōri', ja: '渡辺通' },
    { en: 'Tenjin-Minami', ja: '天神南' },
    { en: 'Kushida Shrine', ja: '櫛田神社前' },
    { en: 'Hakata', ja: '博多' },
  ],
}

const fallbackCoordinates = {
  姪浜: { lat: 33.5837095, lng: 130.3251041 },
  次郎丸: { lat: 33.5526, lng: 130.3294 },
  賀茂: { lat: 33.5505, lng: 130.3379 },
  野芥: { lat: 33.5483, lng: 130.3465 },
  梅林: { lat: 33.5459, lng: 130.355 },
  福大前: { lat: 33.5473, lng: 130.3624 },
  七隈: { lat: 33.5533, lng: 130.3617 },
}

const extraAlternateNamesByJa = {
  福岡空港: ['fukuoka airport', 'airport', 'fuk'],
}

const excludedCoordinates = [
  {
    lineId: 'Kuko',
    stationJa: '博多',
    lng: 130.4185,
    lat: 33.5897,
  },
  {
    lineId: 'Kuko',
    stationJa: '博多',
    lng: 130.4185,
    lat: 33.5896,
  },
]

const extraCoordinates = [
  {
    lineId: 'Kuko',
    stationJa: '博多',
    lng: 130.4206,
    lat: 33.5901,
  },
]

const normalizeKey = (value) =>
  String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')

const loadGeojson = () => {
  if (!fs.existsSync(geoPath)) {
    throw new Error(`Missing geojson at ${geoPath}`)
  }
  return JSON.parse(fs.readFileSync(geoPath, 'utf8'))
}

const collectPointMaps = (features) => {
  const pointFeatures = features.filter((f) => f.geometry?.type === 'Point')
  const byJapanese = new Map()
  const byEnglish = new Map()

  pointFeatures.forEach((feature) => {
    const props = feature.properties || {}
    const japanese = props['name:ja'] || props.name
    const englishCandidates = [
      props['name:en'],
      props['name:ja-Latn'],
      props['name:ja_rm'],
    ].filter(Boolean)

    if (japanese) {
      if (!byJapanese.has(japanese)) byJapanese.set(japanese, [])
      byJapanese.get(japanese).push(feature)
    }

    englishCandidates.forEach((candidate) => {
      const key = normalizeKey(candidate)
      if (!key) return
      if (!byEnglish.has(key)) byEnglish.set(key, { japanese, features: [] })
      byEnglish.get(key).features.push(feature)
    })
  })

  return { byJapanese, byEnglish }
}

const buildLines = () => {
  return lineSpecs.reduce((acc, spec) => {
    acc[spec.id] = {
      name: spec.name,
      color: spec.color,
      backgroundColor: Color(spec.color).darken(0.5).hex(),
      textColor: '#FFFFFF',
      progressOutlineColor: spec.color,
      order: spec.order,
      icon: spec.icon,
    }
    return acc
  }, {})
}

const buildRoutes = (features) => {
  const lineFeatures = features.filter((f) => {
    const type = f.geometry?.type
    return type === 'LineString' || type === 'MultiLineString'
  })

  const routes = []

  lineSpecs.forEach((spec) => {
    const matched = lineFeatures.filter((f) => {
      const name = f.properties?.name || f.properties?.['name:ja']
      return spec.keywords.includes(name)
    })

    if (matched.length < 2) {
      throw new Error(
        `Expected multiple line strings for ${spec.id}, found ${matched.length}`,
      )
    }

    matched.forEach((feature) => {
      routes.push({
        type: 'Feature',
        geometry: feature.geometry,
        properties: {
          line: spec.id,
          name: spec.name,
          color: spec.color,
          order: spec.order,
        },
      })
    })
  })

  return {
    type: 'FeatureCollection',
    features: routes,
  }
}

const buildStations = (features) => {
  const { byJapanese, byEnglish } = collectPointMaps(features)
  const output = []
  let id = 0

  const isSubwayStation = (props = {}) =>
    props.station === 'subway' || props.subway === 'yes'

  const isExcludedCoordinate = (lineId, stationJa, geometry) => {
    if (geometry?.type !== 'Point' || !Array.isArray(geometry.coordinates)) {
      return false
    }
    const [lng, lat] = geometry.coordinates
    const roundedLng = Number(lng.toFixed(4))
    const roundedLat = Number(lat.toFixed(4))
    return excludedCoordinates.some((entry) => {
      if (entry.lineId !== lineId || entry.stationJa !== stationJa) {
        return false
      }
      return roundedLng === entry.lng && roundedLat === entry.lat
    })
  }

  Object.entries(stations).forEach(([lineId, stationList]) => {
    stationList.forEach((station, index) => {
      let stationJa = station.ja

      if (!stationJa) {
        const englishKey = normalizeKey(station.en)
        const englishEntry = byEnglish.get(englishKey)
        stationJa = englishEntry?.japanese
      }

      if (!stationJa) {
        throw new Error(`Missing Japanese name for ${station.en}`)
      }

      const matches = (byJapanese.get(stationJa) || [])
        .filter((feature) => {
          const props = feature.properties || {}
          return isSubwayStation(props)
        })
        .filter(
          (feature) => !isExcludedCoordinate(lineId, stationJa, feature.geometry),
        )

      const extras = extraCoordinates.filter(
        (entry) => entry.lineId === lineId && entry.stationJa === stationJa,
      )
      extras.forEach((entry) => {
        const exists = matches.some((feature) => {
          if (feature.geometry?.type !== 'Point') return false
          const [lng, lat] = feature.geometry.coordinates
          return (
            Number(lng.toFixed(4)) === entry.lng &&
            Number(lat.toFixed(4)) === entry.lat
          )
        })
        if (!exists) {
          matches.push({
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [entry.lng, entry.lat],
            },
            properties: {
              name: stationJa,
              'name:ja': stationJa,
              'name:en': station.en,
              station: 'subway',
              subway: 'yes',
            },
          })
        }
      })

      if (!matches.length) {
        const fallback = stationJa ? fallbackCoordinates[stationJa] : null
        if (fallback) {
          matches.push({
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [fallback.lng, fallback.lat],
            },
            properties: {
              name: stationJa,
              'name:ja': stationJa,
              'name:en': station.en,
              station: 'subway',
              subway: 'yes',
            },
          })
        } else {
          throw new Error(
            `No point features found for ${stationJa} (${station.en})`,
          )
        }
      }

      const displayName = `${station.en} (${stationJa})`
      const extraAlternateNames = stationJa
        ? extraAlternateNamesByJa[stationJa] || []
        : []
      const alternateNames = Array.from(
        new Set([stationJa, station.en, ...extraAlternateNames].filter(Boolean)),
      )

      matches.forEach((feature) => {
        output.push({
          type: 'Feature',
          geometry: feature.geometry,
          properties: {
            id,
            name: displayName,
            display_name: displayName,
            line: lineId,
            order: index,
            alternate_names: alternateNames,
          },
          id,
        })
        id += 1
      })
    })
  })

  return {
    type: 'FeatureCollection',
    features: output,
  }
}

const main = () => {
  const geo = loadGeojson()
  const lines = buildLines()
  const routes = buildRoutes(geo.features)
  const stationFeatures = buildStations(geo.features)

  fs.writeFileSync(outLines, JSON.stringify(lines, null, 2))
  fs.writeFileSync(outRoutes, JSON.stringify(routes))
  fs.writeFileSync(outFeatures, JSON.stringify(stationFeatures))

  console.log(`Wrote ${outLines}, ${outRoutes}, ${outFeatures}`)
}

main()
