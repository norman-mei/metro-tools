import GamePage from '@/components/GamePage'
import Main from '@/components/Main'
import { Provider } from '@/lib/configContext'
import { DataFeatureCollection, RoutesFeatureCollection } from '@/lib/types'
import 'mapbox-gl/dist/mapbox-gl.css'
import { Inter } from 'next/font/google'
import 'react-circular-progressbar/dist/styles.css'
import config from './config'
import data from './data/features.json'
import routesData from './data/routes.json'

const font = Inter({
  subsets: ['latin'],
  display: 'swap',
})

const fc = {
  ...data,
  features: data.features.filter((feature) => !!config.LINES[feature.properties.line ?? '']),
} as DataFeatureCollection

const routes = routesData as RoutesFeatureCollection

export const metadata = config.METADATA

export default function SeattleTacoma() {
  return (
    <Provider value={config}>
      <Main className={`${font.className} min-h-screen`}>
        <GamePage fc={fc} routes={routes} />
      </Main>
    </Provider>
  )
}
