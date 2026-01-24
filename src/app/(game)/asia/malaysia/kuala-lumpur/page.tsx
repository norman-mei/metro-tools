import PlaceholderPage from '@/app/(game)/_placeholder/PlaceholderPage'
import { buildPlaceholderConfig } from '@/app/(game)/_placeholder/config'

const config = buildPlaceholderConfig({
  citySlug: 'kuala-lumpur',
  cityPath: 'asia/malaysia/kuala-lumpur',
  cityTitle: 'Kuala Lumpur (吉隆坡)',
})

export const metadata = config.METADATA

export default function Page() {
  return <PlaceholderPage config={config} />
}
