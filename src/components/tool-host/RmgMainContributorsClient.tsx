'use client'

import dynamic from 'next/dynamic'

const RmgContributorsApp = dynamic(
  () => import('../../../tools/railmapgen.github.io-main/src/next/contributors-client-app'),
  { ssr: false },
)

export default function RmgMainContributorsClient() {
  return <RmgContributorsApp />
}
