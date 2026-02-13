'use client'

import dynamic from 'next/dynamic'

const RmgRuntimeDemoApp = dynamic(
  () => import('../../../tools/railmapgen.github.io-main/src/next/runtime-demo-client-app'),
  { ssr: false },
)

export default function RmgMainRuntimeDemoClient() {
  return <RmgRuntimeDemoApp />
}
