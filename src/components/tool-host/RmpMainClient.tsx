'use client'

import dynamic from 'next/dynamic'

const RmpMainApp = dynamic(() => import('../../../tools/rmp-main/src/next/client-app'), {
  ssr: false,
})

export default function RmpMainClient() {
  return <RmpMainApp />
}
