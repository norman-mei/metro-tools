import data from './data/features.json'
import 'mapbox-gl/dist/mapbox-gl.css'
import 'react-circular-progressbar/dist/styles.css'
import { DataFeatureCollection, RoutesFeatureCollection } from '@/lib/types'
import config from './config'
import GamePage from '@/components/GamePage'
import { Provider } from '@/lib/configContext'
import Main from '@/components/Main'
import routesData from './data/routes.json'

const fc = data as DataFeatureCollection
const routes = routesData as RoutesFeatureCollection

export const metadata = config.METADATA

export default function Algiers() {
  return (
    <Provider value={config}>
      <Main className="min-h-screen">
        <GamePage fc={fc} routes={routes} />
      </Main>
    </Provider>
  )
}
