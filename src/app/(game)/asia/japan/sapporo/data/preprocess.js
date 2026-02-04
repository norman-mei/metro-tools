const fs = require('fs')
const path = require('path')
const Color = require('color')

const root = __dirname
const geoPath = path.join(root, 'sapporo.geojson')
const outFeatures = path.join(root, 'features.json')
const outRoutes = path.join(root, 'routes.json')
const outLines = path.join(root, 'lines.json')

const lineSpecs = [
  {
    id: 'Namboku',
    name: '南北線 Namboku Line',
    color: '#00947f',
    icon: 'asia/japan/sapporo/namboku.png',
    order: 0,
    keywords: ['札幌市営地下鉄南北線'],
    stationType: 'subway',
  },
  {
    id: 'Tozai',
    name: '東西線 Tōzai Line',
    color: '#ff9100',
    icon: 'asia/japan/sapporo/tozai.png',
    order: 1,
    keywords: ['札幌市営地下鉄東西線'],
    stationType: 'subway',
  },
  {
    id: 'Toho',
    name: '東豊線 Tōhō Line',
    color: '#0077dd',
    icon: 'asia/japan/sapporo/toho.png',
    order: 2,
    keywords: ['札幌市営地下鉄東豊線'],
    stationType: 'subway',
  },
  {
    id: 'Streetcar',
    name: '札幌市電 Streetcar',
    color: '#e21813',
    icon: 'asia/japan/sapporo/sapporosc.png',
    order: 3,
    keywords: ['札幌市電'],
    stationType: 'tram',
  },
]

const stations = {
  Namboku: [
    { en: 'Asabu', ja: '麻生' },
    { en: 'Kita-Sanjūyo-Jō', ja: '北34条' },
    { en: 'Kita-Nijūyo-Jō', ja: '北24条' },
    { en: 'Kita-Jūhachi-Jō', ja: '北18条' },
    { en: 'Kita-Jūni-Jō', ja: '北12条' },
    { en: 'Sapporo', ja: 'さっぽろ' },
    { en: 'Ōdōri', ja: '大通' },
    { en: 'Susukino', ja: 'すすきの' },
    { en: 'Nakajima-Kōen', ja: '中島公園' },
    { en: 'Horohira-Bashi', ja: '幌平橋' },
    { en: 'Nakanoshima', ja: '中の島' },
    { en: 'Hiragishi', ja: '平岸' },
    { en: 'Minami-Hiragishi', ja: '南平岸' },
    { en: 'Sumikawa', ja: '澄川' },
    { en: 'Jieitai-Mae', ja: '自衛隊前' },
    { en: 'Makomanai', ja: '真駒内' },
  ],
  Tozai: [
    { en: 'Miyanosawa', ja: '宮の沢' },
    { en: 'Hassamu-Minami', ja: '発寒南' },
    { en: 'Kotoni', ja: '琴似' },
    { en: 'Nijūyon-Ken', ja: '二十四軒' },
    { en: 'Nishi-Nijūhatchōme', ja: '西28丁目' },
    { en: 'Maruyama-Kōen', ja: '円山公園' },
    { en: 'Nishi-Jūhatchōme', ja: '西18丁目' },
    { en: 'Nishi-Jūitchōme', ja: '西11丁目' },
    { en: 'Ōdōri', ja: '大通' },
    { en: 'Bus Center-Mae', ja: 'バスセンター前' },
    { en: 'Kikusui', ja: '菊水' },
    { en: 'Higashi-Sapporo', ja: '東札幌' },
    { en: 'Shiroishi', ja: '白石' },
    { en: 'Nangō-Nana-Chōme', ja: '南郷7丁目' },
    { en: 'Nangō-Jūsan-Chōme', ja: '南郷13丁目' },
    { en: 'Nangō-Jūhatchōme', ja: '南郷18丁目' },
    { en: 'Ōyachi', ja: '大谷地' },
    { en: 'Hibarigaoka', ja: 'ひばりが丘' },
    { en: 'Shin-Sapporo', ja: '新さっぽろ' },
  ],
  Toho: [
    { en: 'Sakaemachi', ja: '栄町' },
    { en: 'Shindō-Higashi', ja: '新道東' },
    { en: 'Motomachi', ja: '元町' },
    { en: 'Kanjō-Dōri-Higashi', ja: '環状通東' },
    { en: 'Higashi-Kuyakusho-Mae', ja: '東区役所前' },
    { en: 'Kita-Jūsan-Jō-Higashi', ja: '北13条東' },
    { en: 'Sapporo', ja: 'さっぽろ' },
    { en: 'Ōdōri', ja: '大通' },
    { en: 'Hōsui-Susukino', ja: '豊水すすきの' },
    { en: 'Gakuen-Mae', ja: '学園前' },
    { en: 'Toyohira-Kōen', ja: '豊平公園' },
    { en: 'Misono', ja: '美園' },
    { en: 'Tsukisamu-Chūō', ja: '月寒中央' },
    { en: 'Fukuzumi', ja: '福住' },
  ],
  Streetcar: [
    { en: 'Nishi-Yon-Chōme', ja: '西4丁目' },
    { en: 'Nishi-Hatchōme', ja: '西8丁目' },
    { en: 'Chūō-Kuyakusho-Mae', ja: '中央区役所前' },
    { en: 'Nishi-Jūgo-Chōme', ja: '西15丁目' },
    { en: 'Nishisen-Roku-Jō', ja: '西線6条' },
    { en: 'Nishisen-Ku-Jō Asahiyama-Kōen-Dōri', ja: '西線9条旭山公園通' },
    { en: 'Nishisen-Jūichi-Jō', ja: '西線11条' },
    { en: 'Nishisen-Jūyo-Jō', ja: '西線14条' },
    { en: 'Nishisen-Jūroku-Jō', ja: '西線16条' },
    { en: 'Ropeway-Iriguchi', ja: 'ロープウェイ入口' },
    { en: 'Densha-Jigyōsho-Mae', ja: '電車事業所前' },
    { en: 'Chūō-Toshokan-Mae', ja: '中央図書館前' },
    { en: 'Ishiyama-Dōri', ja: '石山通' },
    { en: 'Higashi-Tonden-Dōri', ja: '東屯田通' },
    { en: 'Kōnan-Shōgakkō-Mae', ja: '幌南小学校前' },
    { en: 'Yamahana-Jūku-Jō', ja: '山鼻19条' },
    { en: 'Seishūgakuen-Mae', ja: '静修学園前' },
    { en: 'Gyōkei-Dōri', ja: '行啓通' },
    { en: 'Nakajima-Kōen-Dōri', ja: '中島公園通' },
    { en: 'Yamahana-Ku-Jō', ja: '山鼻9条' },
    { en: 'Higashi-Honganji-Mae', ja: '東本願寺前' },
    { en: 'Shiseikan-Shōgakkō-Mae', ja: '資生館小学校前' },
    { en: 'Susukino', ja: 'すすきの' },
    { en: 'Tanuki Kōji', ja: '狸小路' },
  ],
}

const loadGeojson = () => {
  if (!fs.existsSync(geoPath)) {
    throw new Error(`Missing geojson at ${geoPath}`)
  }
  return JSON.parse(fs.readFileSync(geoPath, 'utf8'))
}

const collectNamedPoints = (features) => {
  const pointFeatures = features.filter((f) => f.geometry?.type === 'Point')
  const map = new Map()
  pointFeatures.forEach((feature) => {
    const props = feature.properties || {}
    const names = new Set([props['name:ja'], props.name].filter(Boolean))
    names.forEach((name) => {
      if (!map.has(name)) map.set(name, [])
      map.get(name).push(feature)
    })
  })
  return map
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
  const byName = collectNamedPoints(features)
  const output = []
  let id = 0

  const excludedCoordinates = [
    {
      lineId: 'Streetcar',
      stationJa: '西4丁目',
      lng: 141.3524,
      lat: 43.059,
    },
    {
      lineId: 'Streetcar',
      stationJa: '狸小路',
      lng: 141.3529,
      lat: 43.0573,
    },
    {
      lineId: 'Namboku',
      stationJa: '大通',
      lng: 141.352,
      lat: 43.0602,
    },
    {
      lineId: 'Namboku',
      stationJa: '大通',
      lng: 141.3553,
      lat: 43.0607,
    },
    {
      lineId: 'Namboku',
      stationJa: 'さっぽろ',
      lng: 141.3539,
      lat: 43.0663,
    },
    {
      lineId: 'Toho',
      stationJa: '大通',
      lng: 141.352,
      lat: 43.0602,
    },
  ]

  const isExcludedCoordinate = (lineId, stationJa, geometry) => {
    if (geometry?.type !== 'Point' || !Array.isArray(geometry.coordinates)) {
      return false
    }
    const [lng, lat] = geometry.coordinates
    return excludedCoordinates.some((entry) => {
      if (entry.lineId !== lineId || entry.stationJa !== stationJa) {
        return false
      }
      const roundedLng = Number(lng.toFixed(4))
      const roundedLat = Number(lat.toFixed(4))
      return roundedLng === entry.lng && roundedLat === entry.lat
    })
  }

  const isSubwayStation = (props = {}) =>
    props.station === 'subway' || props.subway === 'yes'
  const isTramStop = (props = {}) =>
    props.tram === 'yes' || props.railway === 'tram_stop'

  const lineSpecById = new Map(lineSpecs.map((spec) => [spec.id, spec]))

  Object.entries(stations).forEach(([lineId, stationList]) => {
    const lineSpec = lineSpecById.get(lineId)
    const stationType = lineSpec?.stationType
    stationList.forEach((station, index) => {
      const matches = (byName.get(station.ja) || [])
        .filter((feature) => {
        const props = feature.properties || {}
        if (stationType === 'tram') {
          return isTramStop(props)
        }
        if (stationType === 'subway') {
          return isSubwayStation(props) && !isTramStop(props)
        }
        return true
        })
        .filter((feature) => !isExcludedCoordinate(lineId, station.ja, feature.geometry))
      if (!matches.length) {
        throw new Error(`No point features found for ${station.ja} (${station.en})`)
      }

      matches.forEach((feature) => {
        const displayName = `${station.en} (${station.ja})`
        output.push({
          type: 'Feature',
          geometry: feature.geometry,
          properties: {
            id,
            name: displayName,
            display_name: displayName,
            line: lineId,
            order: index,
            alternate_names: [station.ja, station.en],
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
