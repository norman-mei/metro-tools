import Main from '@/components/Main'
import { Provider } from '@/lib/configContext'
import 'mapbox-gl/dist/mapbox-gl.css'
import { Inter } from 'next/font/google'
import Link from 'next/link'
import 'react-circular-progressbar/dist/styles.css'
import config from './config'
import NYGameClient from './NYGameClient'

const font = Inter({
  subsets: ['latin'],
  display: 'swap',
})

export const metadata = config.METADATA

export default function NY() {
  return (
    <Provider value={config}>
      <Main className={`${font.className} min-h-screen`}>
        <NYGameClient />
      </Main>
    </Provider>
  )
}
