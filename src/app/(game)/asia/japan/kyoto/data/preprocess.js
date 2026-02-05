const fs = require('fs')
const path = require('path')
const Color = require('color')

const root = __dirname
const geoPath = path.join(root, 'kyoto.geojson')
const outFeatures = path.join(root, 'features.json')
const outRoutes = path.join(root, 'routes.json')
const outLines = path.join(root, 'lines.json')

const lineSpecs = [
  {
    id: 'Karasuma',
    name: '烏丸線 Karasuma Line',
    color: '#38b371',
    icon: 'asia/japan/kyoto/karasuma.png',
    order: 0,
    keywords: ['烏丸線'],
  },
  {
    id: 'Tozai',
    name: '東西線 Tōzai Line',
    color: '#ff4200',
    icon: 'asia/japan/kyoto/tozai.png',
    order: 1,
    keywords: ['東西線'],
  },
  {
    id: 'Arashiyama',
    name: '嵐山本線 Arashiyama Line',
    color: '#a23534',
    icon: 'asia/japan/kyoto/arashiyama.png',
    order: 2,
    keywords: ['京福電気鉄道嵐山本線'],
  },
  {
    id: 'Kitano',
    name: '北野線 Kitano Line',
    color: '#436783',
    icon: 'asia/japan/kyoto/kitano.png',
    order: 3,
    keywords: ['京福電気鉄道北野線'],
  },
  {
    id: 'Eizan Cable',
    name: '鋼索線 Eizan Cable',
    color: '#008080',
    icon: 'asia/japan/kyoto/cable.png',
    order: 4,
    keywords: ['京福電気鉄道鋼索線'],
  },
  {
    id: 'Eizan Ropeway',
    name: 'Eizan Ropeway',
    color: '#CD3ACE',
    icon: 'asia/japan/kyoto/ropeway.png',
    order: 5,
    keywords: ['Eizan Ropeway'],
    minSegments: 1,
  },
  {
    id: 'Hieizan Railway',
    name: '比叡山鉄道 Hieizan Railway',
    color: '#550000',
    icon: 'asia/japan/kyoto/hieizan.png',
    order: 6,
    keywords: ['比叡山鉄道'],
  },
]

const stations = {
  Karasuma: [
    { en: 'Kokusaikaikan', ja: '国際会館' },
    { en: 'Matsugasaki', ja: '松ヶ崎' },
    { en: 'Kitayama', ja: '北山' },
    { en: 'Kitaōji', ja: '北大路' },
    { en: 'Kuramaguchi', ja: '鞍馬口' },
    { en: 'Imadegawa', ja: '今出川' },
    { en: 'Marutamachi', ja: '丸太町' },
    { en: 'Karasuma Oike', ja: '烏丸御池' },
    { en: 'Shijō', ja: '四条' },
    { en: 'Gojō', ja: '五条' },
    { en: 'Kyoto', ja: '京都' },
    { en: 'Kujō', ja: '九条' },
    { en: 'Jūjō', ja: '十条' },
    { en: 'Kuinabashi', ja: 'くいな橋' },
    { en: 'Takeda', ja: '竹田' },
  ],
  Tozai: [
    { en: 'Rokujizō', ja: '六地蔵' },
    { en: 'Ishida', ja: '石田' },
    { en: 'Daigo', ja: '醍醐' },
    { en: 'Ono', ja: '小野' },
    { en: 'Nagitsuji', ja: '椥辻' },
    { en: 'Higashino', ja: '東野' },
    { en: 'Yamashina', ja: '山科' },
    { en: 'Misasagi', ja: '御陵' },
    { en: 'Keage', ja: '蹴上' },
    { en: 'Higashiyama', ja: '東山' },
    { en: 'Sanjo Keihan', ja: '三条京阪' },
    { en: 'Kyoto Shiyakusho-mae (Kawaramachi Oike)', ja: '京都市役所前' },
    { en: 'Karasuma Oike', ja: '烏丸御池' },
    { en: 'Nijojo-mae', ja: '二条城前' },
    { en: 'Nijo', ja: '二条' },
    { en: 'Nishioji Oike', ja: '西大路御池' },
    { en: 'Uzumasa Tenjingawa', ja: '太秦天神川' },
  ],
  Arashiyama: [
    { en: 'Shijō-Ōmiya', ja: '四条大宮' },
    { en: 'Sai', ja: '西院' },
    { en: 'Nishiōji-Sanjō', ja: '西大路三条' },
    { en: 'Yamanouchi', ja: '山ノ内' },
    { en: 'Randen-Tenjingawa', ja: '嵐電天神川' },
    { en: 'Kaikonoyashiro', ja: '蚕ノ社' },
    { en: 'Uzumasa-Kōryūji', ja: '太秦広隆寺' },
    { en: 'Katabiranotsuji', ja: '帷子ノ辻' },
    { en: 'Arisugawa', ja: '有栖川' },
    { en: 'Kurumazaki-Jinja', ja: '車折神社' },
    { en: 'Rokuōin', ja: '鹿王院' },
    { en: 'Randen-Saga', ja: '嵐電嵯峨' },
    { en: 'Arashiyama', ja: '嵐山' },
  ],
  Kitano: [
    { en: 'Kitano-Hakubaichō', ja: '北野白梅町' },
    {
      en: 'Tōjiin Ritsumeikan University',
      ja: '等持院・立命館大学衣笠キャンパス前',
    },
    { en: 'Ryōanji', ja: '龍安寺' },
    { en: 'Myōshinji', ja: '妙心寺' },
    { en: 'Omuro-Ninnaji', ja: '御室仁和寺' },
    { en: 'Utano', ja: '宇多野' },
    { en: 'Narutaki', ja: '鳴滝' },
    { en: 'Tokiwa', ja: '常盤' },
    { en: 'Satsueisho-mae', ja: '撮影所前' },
    { en: 'Katabiranotsuji', ja: '帷子ノ辻' },
  ],
  'Eizan Cable': [
    { en: 'Cable Yase', ja: 'ケーブル八瀬' },
    { en: 'Cable Car Hiei', ja: 'ケーブル比叡' },
  ],
  'Eizan Ropeway': [
    { en: 'Rope Hiei', ja: 'ロープ比叡' },
    { en: 'Hieisancho', ja: '比叡山頂' },
  ],
  'Hieizan Railway': [
    { en: 'Cable Enryakuji', ja: 'ケーブル延暦寺' },
    { en: 'Motateyama', ja: 'もたて山' },
    { en: 'Horaioka', ja: 'ほうらい丘' },
    { en: 'Cable Sakamoto', ja: 'ケーブル坂本' },
  ],
}

const fallbackCoordinates = {
  ロープ比叡: { lat: 35.0648, lng: 135.8225 },
  比叡山頂: { lat: 35.0645, lng: 135.8278 },
  もたて山: { lat: 35.0671, lng: 135.8458 },
}

const extraAlternateNamesByJa = {
  京都市役所前: ['河原町御池', 'Kawaramachi Oike'],
}

const clusterKeyByLineStation = {
  Tozai: {
    太秦天神川: 'tenjingawa_complex',
  },
  Arashiyama: {
    嵐電天神川: 'tenjingawa_complex',
  },
  'Eizan Cable': {
    ケーブル比叡: 'hiei_complex',
  },
  'Eizan Ropeway': {
    ロープ比叡: 'hiei_complex',
  },
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
      return spec.keywords.some((keyword) => name?.includes(keyword))
    })

    const minSegments = spec.minSegments ?? 2
    if (matched.length < minSegments) {
      throw new Error(
        `Expected at least ${minSegments} line strings for ${spec.id}, found ${matched.length}`,
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

  const isTramStop = (props = {}) => {
    if (props.tram === 'yes' || props.station === 'light_rail' || props.light_rail === 'yes') {
      return true
    }
    if (props.railway === 'station') {
      const operator = props.operator || props['operator:en'] || ''
      const network = props.network || ''
      return operator.includes('京福電気鉄道') || network.includes('京福電気鉄道')
    }
    return false
  }

  const isRailStation = (props = {}) =>
    props.railway === 'station' || props.public_transport === 'station'

  const isStationForLine = (lineId, props = {}) => {
    if (lineId === 'Karasuma' || lineId === 'Tozai') {
      return isSubwayStation(props)
    }
    if (lineId === 'Arashiyama' || lineId === 'Kitano') {
      return isTramStop(props)
    }
    return isRailStation(props)
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

      const matches = (byJapanese.get(stationJa) || []).filter((feature) => {
        const props = feature.properties || {}
        return isStationForLine(lineId, props)
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
              public_transport: 'station',
              railway: 'station',
            },
          })
        } else {
          throw new Error(`No point features found for ${stationJa} (${station.en})`)
        }
      }

      const displayName = `${station.en} (${stationJa})`
      const extraAlternateNames = stationJa
        ? extraAlternateNamesByJa[stationJa] || []
        : []
      const alternateNames = Array.from(
        new Set([stationJa, station.en, ...extraAlternateNames].filter(Boolean)),
      )

      const clusterKey =
        clusterKeyByLineStation[lineId] &&
        clusterKeyByLineStation[lineId][stationJa]

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
            ...(clusterKey ? { cluster_key: clusterKey } : {}),
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
