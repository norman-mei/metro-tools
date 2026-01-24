import PlaceholderPage from '@/app/(game)/_placeholder/PlaceholderPage'
import { buildPlaceholderConfig } from '@/app/(game)/_placeholder/config'

const config = buildPlaceholderConfig({
  citySlug: 'toronto',
  cityPath: 'north-america/canada/toronto',
  cityTitle: 'Toronto',
})

export const metadata = config.METADATA

export default function Page() {
  return <PlaceholderPage config={config} />
}
