import GamePage from '@/components/GamePage'
import Main from '@/components/Main'
import { Provider } from '@/lib/configContext'
import { DataFeatureCollection, RoutesFeatureCollection } from '@/lib/types'
import 'mapbox-gl/dist/mapbox-gl.css'
import { Noto_Sans_JP } from 'next/font/google'
import 'react-circular-progressbar/dist/styles.css'
import config from './config'
import data from './data/features.json'
import routesData from './data/routes.json'

const font = Noto_Sans_JP({
  weight: ['400', '700'],
  style: ['normal'],
  display: 'swap',
  subsets: ['latin'],
})

const fc = {
  ...data,
  features: data.features.filter((feature) =>
    feature?.properties?.line ? Boolean(config.LINES[feature.properties.line]) : false,
  ),
} as DataFeatureCollection

const routes = {
  ...routesData,
  features: routesData.features.filter((feature) => {
    const line = feature.properties?.line
    return line ? Boolean(config.LINES[line]) : false
  }),
} as RoutesFeatureCollection

export const metadata = config.METADATA

export default function Fukuoka() {
  return (
    <Provider value={config}>
      <Main className={`${font.className} min-h-screen`}>
        <GamePage fc={fc} routes={routes} />
      </Main>
    </Provider>
  )
}
