import PlaceholderPage from '@/app/(game)/_placeholder/PlaceholderPage'
import { buildPlaceholderConfig } from '@/app/(game)/_placeholder/config'

const config = buildPlaceholderConfig({
  citySlug: 'guiyang',
  cityPath: 'asia/china/guiyang',
  cityTitle: 'Guiyang (贵阳)',
})

export const metadata = config.METADATA

export default function Page() {
  return <PlaceholderPage config={config} />
}
