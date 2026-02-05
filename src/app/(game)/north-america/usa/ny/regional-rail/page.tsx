import GamePage from '@/components/GamePage'
import Main from '@/components/Main'
import { Provider } from '@/lib/configContext'
import { DataFeatureCollection, RoutesFeatureCollection } from '@/lib/types'
import 'mapbox-gl/dist/mapbox-gl.css'
import { Inter } from 'next/font/google'
import Link from 'next/link'
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

export default function NYRegionalRail() {
  return (
    <Provider value={config}>
      <Main className={`${font.className} min-h-screen`}>
        <div className="px-4 pt-4 text-sm text-slate-600">
          Looking for subway and light rail?{' '}
          <Link className="font-semibold text-slate-900 underline" href="/north-america/usa/ny">
            Go to Rapid Transit
          </Link>
        </div>
        <GamePage fc={fc} routes={routes} />
      </Main>
    </Provider>
  )
}
