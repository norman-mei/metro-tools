'use client'

import dynamic from 'next/dynamic'

const RsgMainApp = dynamic(() => import('../../../tools/rsg-main/src/next/client-app'), {
  ssr: false,
})

export default function RsgMainClient() {
  return <RsgMainApp />
}
