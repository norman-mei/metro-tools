import data from './data/features.json'
import 'mapbox-gl/dist/mapbox-gl.css'
import 'react-circular-progressbar/dist/styles.css'
import { DataFeatureCollection } from '@/lib/types'
import config from './config'
import GamePage from '@/components/GamePage'
import { Provider } from '@/lib/configContext'
import Main from '@/components/Main'
import { Inter } from 'next/font/google'

const font = Inter({
  subsets: ['latin'],
  display: 'swap',
})

const fc = {
  ...data,
  features: data.features.filter((feature) => !!config.LINES[feature.properties.line ?? '']),
} as DataFeatureCollection

export const metadata = config.METADATA

export default function SeattleTacoma() {
  return (
    <Provider value={config}>
      <Main className={`${font.className} min-h-screen`}>
        <GamePage fc={fc} />
      </Main>
    </Provider>
  )
}
