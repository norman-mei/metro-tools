'use client'

import { ReactNode, createContext, useContext } from 'react'
import { Config } from './types'

export const ConfigContext = createContext<Config>({
  LOCALE: 'en',
  CITY_NAME: 'default',
  MAP_CONFIG: {
    container: 'map',
    style: 'mapbox://styles/benjamintd/clohp062g002b01o4e3lt1exh',
    bounds: [
      [-4.184549, 40.156349],
      [-3.19578, 40.62702],
    ],
    maxBounds: [
      [-5.184549, 39.156349],
      [-2.19578, 41.62702],
    ],
    minZoom: 6,
    fadeDuration: 50,
  },
  METADATA: {
    title: 'Metro Memory',
    description: 'How many of the Metro stations can you name from memory?',
    openGraph: {
      title: 'Metro Memory',
      description:
        'How many of the metro stations can you name from memory? Try this game to find out.',
      type: 'website',
      locale: 'en',
      url: 'https://metro-memory.com/',
    },
  },
  LINES: {},
  LINE_GROUPS: [],
})

export const useConfig = () => useContext(ConfigContext)
export const Provider = ({
  children,
  value,
}: {
  children: ReactNode
  value: Config
}) => {
  return (
    <ConfigContext.Provider value={value}>{children}</ConfigContext.Provider>
  )
}

export default Provider
