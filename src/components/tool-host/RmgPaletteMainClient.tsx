'use client'

import dynamic from 'next/dynamic'

const RmgPaletteMainApp = dynamic(
  () => import('../../../tools/rmg-palette-main/src/next/client-app'),
  {
    ssr: false,
  },
)

export default function RmgPaletteMainClient() {
  return <RmgPaletteMainApp />
}
