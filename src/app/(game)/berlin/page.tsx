import GamePage from '@/components/GamePage'
import Main from '@/components/Main'
import { Provider } from '@/lib/configContext'
import { DataFeatureCollection, RoutesFeatureCollection } from '@/lib/types'
import 'mapbox-gl/dist/mapbox-gl.css'
import localFont from 'next/font/local'
import 'react-circular-progressbar/dist/styles.css'
import config from './config'
import data from './data/features.json'
import routes from './data/routes.json'

const font = localFont({
  src: [
    {
      path: './fonts/sans.ttf',
      weight: '400',
      style: 'normal',
    },
    {
      path: './fonts/sans-bold.ttf',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-sans',
})

const fc = {
  ...data,
  features: data.features.filter((f) => !!config.LINES[f.properties.line]),
} as DataFeatureCollection

export const metadata = config.METADATA

export default function Berlin() {
  return (
    <Provider value={config}>
      <Main className={`${font.className} min-h-screen`}>
        <GamePage fc={fc} routes={routes as RoutesFeatureCollection} />
      </Main>
    </Provider>
  )
}
