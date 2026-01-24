import PlaceholderPage from '@/app/(game)/_placeholder/PlaceholderPage'
import { buildPlaceholderConfig } from '@/app/(game)/_placeholder/config'

const config = buildPlaceholderConfig({
  citySlug: 'taipei',
  cityPath: 'asia/taiwan/taipei',
  cityTitle: 'Taipei',
})

export const metadata = config.METADATA

export default function Page() {
  return <PlaceholderPage config={config} />
}
