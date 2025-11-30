import data from './data/features.json'
import routesData from './data/routes.json'
import 'mapbox-gl/dist/mapbox-gl.css'
import 'react-circular-progressbar/dist/styles.css'

import GamePage from '@/components/GamePage'
import Main from '@/components/Main'
import { Provider } from '@/lib/configContext'
import { Config, DataFeatureCollection, RoutesFeatureCollection } from '@/lib/types'

const fc = data as DataFeatureCollection
const routes = routesData as RoutesFeatureCollection

export default function PlaceholderPage({ config }: { config: Config }) {
  return (
    <Provider value={config}>
      <Main className="min-h-screen">
        <GamePage fc={fc} routes={routes} />
      </Main>
    </Provider>
  )
}
