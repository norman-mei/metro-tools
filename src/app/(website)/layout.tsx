import { type Metadata } from 'next'

import { Providers } from '@/app/(website)/providers'
import { Layout } from '@/components/Layout'

export const metadata: Metadata = {
  title: {
    template: '%s',
    default: 'Metro Tools',
  },
  description: 'Metro Tools landing page and metro project workspace.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Providers>
      <div className="flex h-full w-full antialiased">
        <Layout>{children}</Layout>
      </div>
    </Providers>
  )
}
