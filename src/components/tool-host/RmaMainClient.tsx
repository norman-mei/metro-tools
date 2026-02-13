'use client'

import dynamic from 'next/dynamic'

const RmaMainApp = dynamic(() => import('../../../tools/rma-main/src/components/app-bootstrap'), {
  ssr: false,
})

export default function RmaMainClient() {
  return <RmaMainApp />
}
