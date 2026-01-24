import PlaceholderPage from '@/app/(game)/_placeholder/PlaceholderPage'
import { buildPlaceholderConfig } from '@/app/(game)/_placeholder/config'

const config = buildPlaceholderConfig({
  citySlug: 'wellington',
  cityPath: 'oceania/new-zealand/wellington',
  cityTitle: 'Wellington',
})

export const metadata = config.METADATA

export default function Page() {
  return <PlaceholderPage config={config} />
}
