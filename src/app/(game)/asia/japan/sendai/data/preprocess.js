const fs = require('fs')
const path = require('path')
const Color = require('color')

const root = __dirname
const geoPath = path.join(root, 'sendai.geojson')
const outFeatures = path.join(root, 'features.json')
const outRoutes = path.join(root, 'routes.json')
const outLines = path.join(root, 'lines.json')

const lineSpecs = [
  {
    id: 'Namboku',
    name: '南北線 Namboku Line',
    color: '#2e8b57',
    icon: 'asia/japan/sendai/namboku.png',
    order: 0,
    keywords: ['仙台市地下鉄南北線'],
  },
  {
    id: 'Tozai',
    name: '東西線 Tōzai Line',
    color: '#00bfff',
    icon: 'asia/japan/sendai/tozai.png',
    order: 1,
    keywords: ['仙台市地下鉄東西線'],
  },
]

const stations = {
  Namboku: [
    { en: 'Izumi-Chūō', ja: '泉中央' },
    { en: 'Yaotome', ja: '八乙女' },
    { en: 'Kuromatsu', ja: '黒松' },
    { en: 'Asahigaoka', ja: '旭ヶ丘' },
    { en: 'Dainohara', ja: '台原' },
    { en: 'Kita-Sendai', ja: '北仙台' },
    { en: 'Kita-Yobanchō', ja: '北四番丁' },
    { en: 'Kōtōdai-Kōen', ja: '勾当台公園' },
    { en: 'Hirose-dōri', ja: '広瀬通' },
    { en: 'Sendai', ja: '仙台' },
    { en: 'Itsutsubashi' },
    { en: 'Atagobashi', ja: '愛宕橋' },
    { en: 'Kawaramachi', ja: '河原町' },
    { en: 'Nagamachi-Itchōme', ja: '長町一丁目' },
    { en: 'Nagamachi', ja: '長町' },
    { en: 'Nagamachi-Minami', ja: '長町南' },
    { en: 'Tomizawa', ja: '富沢' },
  ],
  Tozai: [
    { en: 'Yagiyama Zoological Park', ja: '八木山動物公園' },
    { en: 'Aobayama', ja: '青葉山' },
    { en: 'Kawauchi', ja: '川内' },
    { en: 'International Center', ja: '国際センター' },
    { en: 'Omachi Nishi-koen', ja: '大町西公園' },
    { en: 'Aoba-dori Ichibancho', ja: '青葉通一番町' },
    { en: 'Sendai', ja: '仙台' },
    { en: 'Miyagino-dori', ja: '宮城野通' },
    { en: 'Rembo', ja: '連坊' },
    { en: 'Yakushido', ja: '薬師堂' },
    { en: 'Oroshimachi', ja: '卸町' },
    { en: 'Rokuchonome', ja: '六丁の目' },
    { en: 'Arai', ja: '荒井' },
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

  const isSubwayStation = (props = {}) =>
    props.station === 'subway' || props.subway === 'yes'

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
        return isSubwayStation(props)
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
