import Main from '@/components/Main'
import { Provider } from '@/lib/configContext'
import 'mapbox-gl/dist/mapbox-gl.css'
import { Inter } from 'next/font/google'
import Link from 'next/link'
import 'react-circular-progressbar/dist/styles.css'
import config from './config'
import NYRegionalRailClient from './NYRegionalRailClient'

const font = Inter({
  subsets: ['latin'],
  display: 'swap',
})

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
        <NYRegionalRailClient />
      </Main>
    </Provider>
  )
}
