import PlaceholderPage from '@/app/(game)/_placeholder/PlaceholderPage'
import { buildPlaceholderConfig } from '@/app/(game)/_placeholder/config'

const config = buildPlaceholderConfig({
  citySlug: 'manila',
  cityPath: 'asia/philippines/manila',
  cityTitle: 'Manila',
})

export const metadata = config.METADATA

export default function Page() {
  return <PlaceholderPage config={config} />
}
