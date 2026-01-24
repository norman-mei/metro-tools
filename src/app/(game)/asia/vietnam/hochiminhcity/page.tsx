import PlaceholderPage from '@/app/(game)/_placeholder/PlaceholderPage'
import { buildPlaceholderConfig } from '@/app/(game)/_placeholder/config'

const config = buildPlaceholderConfig({
  citySlug: 'hochiminhcity',
  cityPath: 'asia/vietnam/hochiminhcity',
  cityTitle: 'Ho Chi Minh City',
})

export const metadata = config.METADATA

export default function Page() {
  return <PlaceholderPage config={config} />
}
