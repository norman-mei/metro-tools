import { Metadata } from 'next'
import { MapboxOptions } from 'mapbox-gl'
import { Line } from '@/lib/types'


export const LINES: {
  [name: string]: Line
} = {
  TokyoMetroM: {
    name: '丸ノ内線 Marunouchi Line',
    color: '#F62E36',
    backgroundColor: '#8C060B',
    textColor: '#FFFFFF',
    order: 0,
  },
  TokyoMetroMb: {
    name: '丸ノ内線支線 Marunouchi Branch Line',
    color: '#F62E36',
    backgroundColor: '#8C060B',
    textColor: '#FFFFFF',
    order: 1,
  },
  TokyoMetroF: {
    name: '副都心線 Fukutoshin Line',
    color: '#9C5E31',
    backgroundColor: '#4E2F18',
    textColor: '#FFFFFF',
    order: 2,
  },
  TokyoMetroC: {
    name: '千代田線 Chiyoda Line',
    color: '#00BB85',
    backgroundColor: '#005E43',
    textColor: '#FFFFFF',
    order: 3,
  },
  TokyoMetroZ: {
    name: '半蔵門線 Hanzomon Line',
    color: '#8F76D6',
    backgroundColor: '#3E2680',
    textColor: '#FFFFFF',
    order: 4,
  },
  TokyoMetroN: {
    name: '南北線 Namboku Line',
    color: '#00AC9B',
    backgroundColor: '#00564E',
    textColor: '#FFFFFF',
    order: 5,
  },
  TokyoMetroH: {
    name: '日比谷線 Hibiya Line',
    color: '#B5B5AC',
    backgroundColor: '#5D5D53',
    textColor: '#FFFFFF',
    order: 6,
  },
  TokyoMetroY: {
    name: '有楽町線 Yurakucho Line',
    color: '#C1A470',
    backgroundColor: '#6A552E',
    textColor: '#FFFFFF',
    order: 7,
  },
  TokyoMetroT: {
    name: '東西線 Tozai Line',
    color: '#009BBF',
    backgroundColor: '#004E60',
    textColor: '#FFFFFF',
    order: 8,
  },
  TokyoMetroG: {
    name: '銀座線 Ginza Line',
    color: '#FF9500',
    backgroundColor: '#804B00',
    textColor: '#FFFFFF',
    order: 9,
  },
  ToeiSubwayI: {
    name: '三田線 Mita Line',
    color: '#006ab8',
    backgroundColor: '#003458',
    textColor: '#FFFFFF',
    order: 10,
  },
  ToeiSubwayE: {
    name: '大江戸線 Oedo Line',
    color: '#ce045b',
    backgroundColor: '#681933',
    textColor: '#FFFFFF',
    order: 11,
  },
  ToeiSubwayS: {
    name: '新宿線 Shinjuku Line',
    color: '#b0bf1e',
    backgroundColor: '#50580E',
    textColor: '#FFFFFF',
    order: 12,
  },
  ToeiSubwayA: {
    name: '浅草線 Asakusa Line',
    color: '#ec6e65',
    backgroundColor: '#A9000C',
    textColor: '#FFFFFF',
    order: 13,
  },
}

export const METADATA: Metadata = {
  icons: {
    icon: '/api/city-icon/tokyo',
    apple: '/api/city-icon/tokyo',
  },
  title: 'Tokyo Metro Memory',
  // in japanese
  description: '東京メトロの駅名を覚えられますか？',
  openGraph: {
    title: 'Tokyo Metro Memory',
    description: '東京メトロの駅名を覚えられますか？',
    type: 'website',
    locale: 'ja_JP',
    url: 'https://metro-memory.com/tokyo',
  },
}

export const MAP_CONFIG: MapboxOptions = {
  container: 'map',
  style: 'mapbox://styles/benjamintd/clqaydk86007a01qr445u7p8i',
  bounds: [
    [138.94, 35.18],
    [140.57, 36.16],
  ],
  maxBounds: [
    [137.94, 34.18],
    [141.57, 37.16],
  ],
  minZoom: 6,
  fadeDuration: 50,
}


export const CITY_NAME = 'tokyo'

export const LOCALE = 'jp'

const config = {
  LOCALE,
  CITY_NAME,
  MAP_CONFIG,
  METADATA,
  LINES,
}

export default config
