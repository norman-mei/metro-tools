import PlaceholderPage from '@/app/(game)/_placeholder/PlaceholderPage'
import { buildPlaceholderConfig } from '@/app/(game)/_placeholder/config'

const config = buildPlaceholderConfig({
  citySlug: 'perth',
  cityPath: 'oceania/australia/perth',
  cityTitle: 'Perth',
})

export const metadata = config.METADATA

export default function Page() {
  return <PlaceholderPage config={config} />
}
