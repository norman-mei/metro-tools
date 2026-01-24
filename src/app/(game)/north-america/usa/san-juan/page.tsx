import data from './data/features.json'
import 'mapbox-gl/dist/mapbox-gl.css'
import 'react-circular-progressbar/dist/styles.css'
import { DataFeatureCollection, RoutesFeatureCollection } from '@/lib/types'
import config from './config'
import GamePage from '@/components/GamePage'
import { Provider } from '@/lib/configContext'
import Main from '@/components/Main'
import { Inter } from 'next/font/google'
import routesData from './data/routes.json'

const font = Inter({
  subsets: ['latin'],
  display: 'swap',
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

export default function SanJuanPage() {
  return (
    <Provider value={config}>
      <Main className={`${font.className} min-h-screen`}>
        <GamePage fc={fc} routes={routes} />
      </Main>
    </Provider>
  )
}
