'use client'

import dynamic from 'next/dynamic'

const RmgMainApp = dynamic(
  () => import('../../../tools/railmapgen.github.io-main/src/next/main-client-app'),
  { ssr: false },
)

export default function RmgMainClient() {
  return <RmgMainApp />
}
