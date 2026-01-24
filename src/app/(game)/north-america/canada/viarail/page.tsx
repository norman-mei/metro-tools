import PlaceholderPage from '@/app/(game)/_placeholder/PlaceholderPage'
import { buildPlaceholderConfig } from '@/app/(game)/_placeholder/config'

const config = buildPlaceholderConfig({
  citySlug: 'viarail',
  cityPath: 'north-america/canada/viarail',
  cityTitle: 'VIA Rail',
})

export const metadata = config.METADATA

export default function Page() {
  return <PlaceholderPage config={config} />
}
