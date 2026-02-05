const fs = require('fs')
const path = require('path')
const Color = require('color')

const root = __dirname
const geoPath = path.join(root, 'okayama.geojson')
const outFeatures = path.join(root, 'features.json')
const outRoutes = path.join(root, 'routes.json')
const outLines = path.join(root, 'lines.json')

const lineSpecs = [
  {
    id: 'Higashiyama',
    name: '東山本線 Higashiyama Line',
    color: '#000aff',
    icon: 'asia/japan/okayama/higashiyama.png',
    order: 0,
    keywords: ['東山本線'],
  },
  {
    id: 'Seikibashi',
    name: '清輝橋線 Seikibashi Line',
    color: '#008001',
    icon: 'asia/japan/okayama/seikibashi.png',
    order: 1,
    keywords: ['清輝橋線'],
  },
]

const stations = {
  Higashiyama: [
    { en: 'Okayama Ekimae', ja: '岡山駅前' },
    { en: 'Nishigawaryokudokouen', ja: '西川緑道公園' },
    { en: 'Yanagawa', ja: '柳川' },
    { en: 'Shiroshita', ja: '城下' },
    { en: 'Kenchoudori', ja: '県庁通り' },
    { en: 'Saidaijicho', ja: '西大寺町' },
    { en: 'Kobashi', ja: '小橋' },
    { en: 'Chunagon', ja: '中納言' },
    { en: 'Kadotayashiki', ja: '門田屋敷' },
    { en: 'Higashiyama', ja: '東山' },
  ],
  Seikibashi: [
    { en: 'Okayama Ekimae', ja: '岡山駅前' },
    { en: 'Nishigawaryokudokouen', ja: '西川緑道公園' },
    { en: 'Yanagawa', ja: '柳川' },
    { en: 'Yubinkyokumae', ja: '郵便局前' },
    { en: 'Tamati', ja: '田町' },
    { en: 'Shinsaidaizichosuzi', ja: '新西大寺町筋' },
    { en: 'Daiunjimae', ja: '大雲寺前' },
    { en: 'Higashichuocho', ja: '東中央町' },
    { en: 'Seikibashi', ja: '清輝橋' },
  ],
}

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

  const isTramStop = (props = {}) =>
    props.railway === 'tram_stop' || props.tram === 'yes'

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

      const matches = (byJapanese.get(stationJa) || []).filter((feature) => {
        const props = feature.properties || {}
        return isTramStop(props)
      })

      if (!matches.length) {
        throw new Error(`No point features found for ${stationJa} (${station.en})`)
      }

      const displayName = `${station.en} (${stationJa})`

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
            alternate_names: [stationJa, station.en],
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
