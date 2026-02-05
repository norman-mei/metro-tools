const fs = require('fs')
const path = require('path')
const { pinyin } = require('pinyin-pro')
const OpenCC = require('opencc-js')

const converter = OpenCC.Converter({ from: 'cn', to: 't' })

const root = __dirname
const geoPath = path.join(root, 'fuzhou.geojson')
const binhaiGeoPath = path.join(root, 'binhai.geojson')
const outFeatures = path.join(root, 'features.json')
const outRoutes = path.join(root, 'routes.json')
const outLines = path.join(root, 'lines.json')

const lineSpecs = [
  {
    id: 'fuzhou1',
    name: 'Line 1',
    color: '#BB1E10',
    icon: 'fuzhou1.png',
    order: 1,
    keywords: ['地铁1号线'],
  },
  {
    id: 'fuzhou2',
    name: 'Line 2',
    color: '#325928',
    icon: 'fuzhou2.png',
    order: 2,
    keywords: ['地铁2号线'],
  },
  {
    id: 'fuzhou4',
    name: 'Line 4',
    color: '#FF7F41',
    icon: 'fuzhou4.png',
    order: 4,
    keywords: ['地铁4号线'],
  },
  {
    id: 'fuzhou5',
    name: 'Line 5',
    color: '#893B67',
    icon: 'fuzhou5.png',
    order: 5,
    keywords: ['地铁5号线'],
  },
  {
    id: 'fuzhou6',
    name: 'Line 6',
    color: '#005EB8',
    icon: 'fuzhou6.png',
    order: 6,
    keywords: ['地铁6号线'],
  },
  {
    id: 'fuzhouf1',
    name: 'Binhai Express',
    color: '#00ADBB',
    icon: 'fuzhouf1.png',
    order: 7,
    keywords: ['F1线', '滨海快线'],
    routeSource: 'binhai',
  },
  {
    id: 'gushan',
    name: 'Gushan Tourist Cableway',
    color: '#008080',
    icon: 'gushan.png',
    order: 301,
    keywords: ['Gushan Tourist Cableway'],
    allowSingleRoute: true,
  },
]

const stations = {
  fuzhou1: [
    { en: 'Xiangfeng', zh: '象峰' },
    { en: 'Xiushan', zh: '秀山' },
    { en: 'Luohanshan', zh: '罗汉山' },
    { en: 'Fuzhou Railway Station', zh: '福州火车站' },
    { en: 'Doumen', zh: '斗门' },
    { en: 'Shudou', zh: '树兜' },
    { en: 'Pingshan', zh: '屏山' },
    { en: 'Dongjiekou', zh: '东街口' },
    { en: 'Nanmendou', zh: '南门兜' },
    { en: 'Chating', zh: '茶亭' },
    { en: 'Dadao', zh: '达道' },
    { en: 'Shangteng', zh: '上藤' },
    { en: 'Sanchajie', zh: '三叉街' },
    { en: 'Baihuting', zh: '白湖亭' },
    { en: 'Huluzhen', zh: '葫芦阵' },
    { en: 'Huangshan', zh: '黄山' },
    { en: 'Paixia', zh: '排下' },
    { en: 'Chengmen', zh: '城门' },
    { en: 'Sanjiaocheng', zh: '三角埕' },
    { en: 'Lulei', zh: '胪雷' },
    { en: 'Fuzhou South Railway Station', zh: '福州火车南站' },
    { en: 'Anping', zh: '安平' },
    { en: 'Liangcuo', zh: '梁厝' },
    { en: 'Xiayang', zh: '下洋' },
    { en: 'Sanjiangkou', zh: '三江口' },
  ],
  fuzhou2: [
    { en: 'Suyang', zh: '苏洋' },
    { en: 'Shadi', zh: '沙堤' },
    { en: 'Shangjie', zh: '上街' },
    { en: 'Jinyu', zh: '金屿' },
    { en: 'Fuzhou University', zh: '福州大学' },
    {
      en: 'Dongyu / Fujian Normal University',
      zh: '董屿·福建师大',
      aliases: ['Dongyu', 'Fujian Normal University'],
    },
    { en: 'Houting', zh: '厚庭' },
    { en: 'Juyuanzhou', zh: '桔园洲' },
    { en: 'Hongwan', zh: '洪湾' },
    { en: 'Jinshan', zh: '金山' },
    { en: 'Jinxiang', zh: '金祥' },
    { en: 'Xiangban', zh: '祥坂' },
    { en: 'Ninghua', zh: '宁化' },
    { en: 'Xiyang', zh: '西洋' },
    { en: 'Nanmendou', zh: '南门兜' },
    {
      en: 'Shuibu',
      zh: '水部',
      clusterKey: 'fuzhou-shuibu-mindu-complex',
    },
    { en: 'Ziyang', zh: '紫阳' },
    { en: 'Wuliting', zh: '五里亭' },
    { en: 'Qianyu', zh: '前屿' },
    { en: 'Shangyang', zh: '上洋', coords: [119.3592, 26.0688] },
    {
      en: 'Gushan',
      zh: '鼓山',
      coords: [119.3701, 26.0562],
      clusterKey: 'fuzhou-gushan-complex',
    },
    { en: 'Yangli', zh: '洋里', coords: [119.3674, 26.0476] },
  ],
  fuzhou4: [
    { en: 'Banzhou', zh: '半洲' },
    { en: 'Jianxin', zh: '建新' },
    { en: 'Hongtang', zh: '洪塘' },
    { en: 'Jinniushan', zh: '金牛山' },
    { en: 'Fenghuangchi', zh: '凤凰池' },
    { en: 'Luzhuang', zh: '陆庄' },
    { en: 'Ximen', zh: '西门' },
    { en: 'Dongjiekou', zh: '东街口' },
    { en: 'Provincial Hospital', zh: '省立医院' },
    { en: 'Dongmen', zh: '东门' },
    { en: 'Sanjiaochi', zh: '三角池' },
    { en: 'Zhuyu', zh: '竹屿' },
    { en: 'Hengyu', zh: '横屿' },
    { en: 'Houyu', zh: '后屿' },
    { en: 'Qianyu', zh: '前屿' },
    { en: 'Guangminggang', zh: '光明港' },
    { en: 'Aofengzhou', zh: '鳌峰洲' },
    { en: 'Huahai Park', zh: '花海公园' },
    { en: 'Exhibition Center', zh: '会展中心' },
    { en: 'Linpu', zh: '林浦' },
    { en: 'Chengmen', zh: '城门' },
    { en: 'Luozhou Hot Spring', zh: '螺洲温泉' },
    { en: 'Difengjiang', zh: '帝封江', coords: [119.3309, 25.9904] },
  ],
  fuzhou5: [
    { en: 'Jingxi Houyu', zh: '荆溪厚屿' },
    { en: 'Agriculture and Forestry University', zh: '农林大学' },
    { en: 'Hongtang', zh: '洪塘' },
    { en: 'Zhenban', zh: '阵坂' },
    { en: 'Marong', zh: '马榕' },
    { en: 'Jinshan', zh: '金山' },
    { en: 'Fenggangli', zh: '凤冈里' },
    { en: 'Pushang Dadao', zh: '浦上大道' },
    { en: 'Xiajing', zh: '霞镜' },
    { en: 'Dongling', zh: '东岭' },
    { en: 'Taiyu', zh: '台屿' },
    { en: 'Panyu', zh: '盘屿' },
    { en: 'Wushan', zh: '吴山' },
    { en: 'Gaishan Zhulan', zh: '盖山竹榄' },
    { en: 'Yixu', zh: '义序' },
    { en: 'Difengjiang', zh: '帝封江', coords: [119.3309, 25.9904] },
    { en: 'Ancient Luozhou Town', zh: '螺洲古镇' },
    { en: 'Qianjin', zh: '前锦' },
    { en: 'Longjiang', zh: '龙江' },
    { en: 'Fuzhou South Railway Station', zh: '福州火车南站' },
  ],
  fuzhou6: [
    { en: 'Pandun', zh: '潘墩' },
    { en: 'Linpu', zh: '林浦' },
    { en: 'Zhanglan', zh: '樟岚' },
    { en: 'Liangcuo', zh: '梁厝' },
    { en: 'Xiayang', zh: '下洋' },
    { en: 'Yingqian', zh: '营前' },
    { en: 'Hangcheng', zh: '航城' },
    { en: 'Zhenghe', zh: '郑和' },
    { en: 'Shiyang', zh: '十洋' },
    { en: 'Wuhang', zh: '吴航' },
    { en: 'Heshang', zh: '鹤上' },
    { en: 'Shajing', zh: '沙京' },
    { en: 'Xiawu', zh: '下吴' },
    { en: 'Wanshou', zh: '万寿' },
    { en: 'Lianhua', zh: '莲花', coords: [119.5659365, 25.9227958] },
    { en: 'Hujing', zh: '壶井' },
    {
      en: 'Wansha / Fuzhou No.3 High School Binhai Campus',
      zh: '万沙·滨海三中',
      aliases: ['Wansha', 'Fuzhou No.3 High School Binhai Campus'],
    },
    { en: 'Binhai CBD', zh: '滨海中央商务区' },
    { en: 'Shawei', zh: '沙尾' },
    { en: 'Jinbin Road', zh: '金滨路' },
    { en: 'Shibakongzha', zh: '十八孔闸' },
  ],
  fuzhouf1: [
    { en: 'Fuzhou Railway Station', zh: '福州火车站' },
    { en: 'Dongmen', zh: '东门' },
    {
      en: 'Mindu',
      zh: '闽都',
      clusterKey: 'fuzhou-shuibu-mindu-complex',
    },
    { en: 'Nangongyuan', zh: '南公园' },
    { en: 'Sanchajie', zh: '三叉街' },
    { en: 'Difengjiang', zh: '帝封江', coords: [119.3309, 25.9904] },
    { en: 'Xiangqian', zh: '祥谦' },
    { en: 'Shouzhan', zh: '首占' },
    { en: 'Dashuju', zh: '大数据' },
    { en: 'Binhai CBD', zh: '滨海中央商务区' },
    { en: 'Gaishan', zh: '盖山', coords: [119.3242, 26.012] },
    {
      en: 'Airport',
      zh: '机场',
      aliases: ['Fuzhou Changle International Airport', 'FOC'],
    },
    { en: 'Lianhuashan', zh: '莲花山', coords: [119.5525, 25.9174] },
    { en: 'Binhaixi', zh: '滨海西', coords: [119.5648, 25.9107] },
    { en: 'Wenling', zh: '文岭' },
  ],
  gushan: [
    { en: 'Xiayuan', zh: '下院', clusterKey: 'fuzhou-gushan-complex' },
    { en: 'Eighteen Scenic Spots', zh: '十八景' },
  ],
}

const coordKey = (coords, precision = 6) =>
  coords.map((n) => Number(n).toFixed(precision)).join(',')

const excludedCoords = {
  fuzhou1: {
    'Fuzhou South Railway Station': new Set([
      coordKey([119.3857, 25.9887], 4),
    ]),
  },
  fuzhou4: {
    Hongtang: new Set([coordKey([119.2453, 26.0766], 4)]),
  },
  fuzhou5: {
    Hongtang: new Set([coordKey([119.2453, 26.0766], 4)]),
    'Fuzhou South Railway Station': new Set([
      coordKey([119.3857, 25.9887], 4),
    ]),
  },
  fuzhouf1: {
    Sanchajie: new Set([coordKey([119.3206, 26.0391], 4)]),
    Dongmen: new Set([coordKey([119.3093, 26.0905], 4)]),
    'Fuzhou Railway Station': new Set([coordKey([119.3134, 26.1159], 4)]),
  },
}

const normalize = (value) =>
  String(value)
    .toLowerCase()
    .replace(/[\s·•・/()（）,，;:'"“”‘’]/g, '')

const flattenPairs = (coords, pairs = []) => {
  if (
    Array.isArray(coords) &&
    coords.length === 2 &&
    typeof coords[0] === 'number' &&
    typeof coords[1] === 'number'
  ) {
    pairs.push(coords)
    return pairs
  }
  if (Array.isArray(coords)) {
    coords.forEach((c) => flattenPairs(c, pairs))
  }
  return pairs
}

const getCentroid = (coords) => {
  const pairs = flattenPairs(coords)
  const [sumLon, sumLat] = pairs.reduce(
    (acc, [lon, lat]) => [acc[0] + lon, acc[1] + lat],
    [0, 0],
  )
  return [sumLon / pairs.length, sumLat / pairs.length]
}

const getNames = (properties = {}) => {
  const raw = []
  ;[
    'name',
    'name:en',
    'name:zh',
    'name:zh-hans',
    'name:zh-cn',
    'name:zh-hant',
    'name:zh-hk',
    'name:zh-tw',
  ].forEach((k) => {
    const val = properties[k]
    if (val) raw.push(String(val))
  })
  if (properties.name) {
    String(properties.name)
      .split(/[\\/()（）,，;·•\s]+/)
      .forEach((part) => {
        const trimmed = part.trim()
        if (trimmed) raw.push(trimmed)
      })
  }
  return Array.from(new Set(raw))
}

const buildAlternateNames = (spec) => {
  const alts = new Set()
  if (spec.en) alts.add(spec.en)
  if (spec.zh) alts.add(spec.zh)
  if (spec.zh) alts.add(converter(spec.zh))
  if (spec.zh) alts.add(pinyin(spec.zh, { toneType: 'mark' }))
  if (spec.aliases) spec.aliases.forEach((a) => alts.add(a))
  return Array.from(alts).filter(Boolean)
}

const buildCandidates = (spec) => {
  const candidates = new Set()
  if (spec.en) {
    candidates.add(spec.en)
    if (spec.en.includes('/')) {
      spec.en
        .split('/')
        .map((part) => part.trim())
        .filter(Boolean)
        .forEach((part) => candidates.add(part))
    }
  }
  if (spec.zh) {
    candidates.add(spec.zh)
    if (spec.zh.includes('·')) {
      spec.zh
        .split('·')
        .map((part) => part.trim())
        .filter(Boolean)
        .forEach((part) => candidates.add(part))
    }
  }
  if (spec.aliases) {
    spec.aliases.forEach((alias) => candidates.add(alias))
  }
  return Array.from(candidates).filter(Boolean)
}

const main = () => {
  const geo = JSON.parse(fs.readFileSync(geoPath, 'utf8'))
  const binhaiGeo = JSON.parse(fs.readFileSync(binhaiGeoPath, 'utf8'))
  const routeSources = { fuzhou: geo, binhai: binhaiGeo }

  const allFeatures = [...geo.features, ...binhaiGeo.features]
  const pointFeatures = allFeatures.filter((f) => f.geometry?.type === 'Point')
  const polygonFeatures = allFeatures.filter(
    (f) => f.geometry?.type === 'Polygon',
  )

  const indexed = [...pointFeatures, ...polygonFeatures].map((f) => ({
    feature: f,
    names: getNames(f.properties).map((n) => normalize(n)),
  }))

  const findMatches = (candidates) => {
    const normalizedCandidates = candidates.map((c) => normalize(c))
    return indexed.filter((entry) =>
      entry.names.some(
        (name) =>
          normalizedCandidates.includes(name) ||
          normalizedCandidates.some((cand) => name.includes(cand)),
      ),
    )
  }

  const featuresOut = []
  let idCounter = 0
  const missingStations = []

  Object.entries(stations).forEach(([lineId, stops]) => {
    stops.forEach((stop, order) => {
      if (Array.isArray(stop.coords) && stop.coords.length === 2) {
        featuresOut.push({
          type: 'Feature',
          geometry: { type: 'Point', coordinates: stop.coords },
          properties: {
            id: idCounter,
            name: stop.en,
            display_name: stop.zh ? `${stop.en} (${stop.zh})` : stop.en,
            line: lineId,
            alternate_names: buildAlternateNames(stop),
            order,
            ...(stop.clusterKey ? { cluster_key: stop.clusterKey } : {}),
          },
          id: idCounter,
        })
        idCounter += 1
        return
      }

      const candidates = buildCandidates(stop)
      const matches = findMatches(candidates)
      if (matches.length === 0) {
        missingStations.push({ line: lineId, station: stop })
        return
      }

      const seenCoords = new Set()
      let addedCount = 0
      matches.forEach((match) => {
        if (addedCount >= 2) return
        const geom = match.feature.geometry
        const coords =
          geom.type === 'Point' ? geom.coordinates : getCentroid(geom.coordinates)

        const key = coordKey(coords)
        const excludeKey = coordKey(coords, 4)
        const excludedForLine = excludedCoords[lineId]?.[stop.en]
        if (excludedForLine && excludedForLine.has(excludeKey)) return
        if (seenCoords.has(key)) return
        seenCoords.add(key)

        featuresOut.push({
          type: 'Feature',
          geometry: { type: 'Point', coordinates: coords },
          properties: {
            id: idCounter,
            name: stop.en,
            display_name: stop.zh ? `${stop.en} (${stop.zh})` : stop.en,
            line: lineId,
            alternate_names: buildAlternateNames(stop),
            order,
            ...(stop.clusterKey ? { cluster_key: stop.clusterKey } : {}),
          },
          id: idCounter,
        })
        idCounter += 1
        addedCount += 1
      })
    })
  })

  if (missingStations.length) {
    console.warn('Missing station matches:', JSON.stringify(missingStations, null, 2))
  }

  const routeFeatures = []
  const missingRoutes = []
  const singleRouteLines = []

  lineSpecs.forEach((line) => {
    const coords = []
    const routeGeo = routeSources[line.routeSource ?? 'fuzhou'] ?? geo
    routeGeo.features
      .filter(
        (f) =>
          f.geometry?.type === 'LineString' || f.geometry?.type === 'MultiLineString',
      )
      .forEach((f) => {
        const name = String(f.properties?.name ?? '').toLowerCase()
        const matched = line.keywords.some((kw) =>
          name.includes(String(kw).toLowerCase()),
        )
        if (matched) {
          if (f.geometry.type === 'LineString') coords.push(f.geometry.coordinates)
          else coords.push(...f.geometry.coordinates)
        }
      })

    if (coords.length === 0) {
      missingRoutes.push(line.id)
      return
    }

    if (!line.allowSingleRoute && coords.length === 1) {
      singleRouteLines.push(line.id)
    }

    routeFeatures.push({
      type: 'Feature',
      geometry: { type: 'MultiLineString', coordinates: coords },
      properties: { line: line.id, name: line.name, color: line.color, order: line.order },
    })
  })

  if (missingRoutes.length) {
    console.warn('Missing routes for:', missingRoutes)
  }

  if (singleRouteLines.length) {
    throw new Error(
      `Expected multiple line strings but only found one for: ${singleRouteLines.join(', ')}`,
    )
  }

  const linesOut = lineSpecs.reduce((acc, line) => {
    acc[line.id] = {
      name: line.name,
      color: line.color,
      backgroundColor: line.color,
      textColor: '#ffffff',
      icon: line.icon,
      order: line.order,
    }
    return acc
  }, {})

  fs.writeFileSync(
    outFeatures,
    JSON.stringify({ type: 'FeatureCollection', features: featuresOut }, null, 2),
  )
  fs.writeFileSync(
    outRoutes,
    JSON.stringify({ type: 'FeatureCollection', features: routeFeatures }, null, 2),
  )
  fs.writeFileSync(outLines, JSON.stringify(linesOut, null, 2))
}

main()
