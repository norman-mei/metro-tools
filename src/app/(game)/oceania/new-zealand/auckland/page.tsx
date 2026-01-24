import PlaceholderPage from '@/app/(game)/_placeholder/PlaceholderPage'
import { buildPlaceholderConfig } from '@/app/(game)/_placeholder/config'

const config = buildPlaceholderConfig({
  citySlug: 'auckland',
  cityPath: 'oceania/new-zealand/auckland',
  cityTitle: 'Auckland',
})

export const metadata = config.METADATA

export default function Page() {
  return <PlaceholderPage config={config} />
}
