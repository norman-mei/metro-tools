import PlaceholderPage from '@/app/(game)/_placeholder/PlaceholderPage'
import { buildPlaceholderConfig } from '@/app/(game)/_placeholder/config'

const config = buildPlaceholderConfig({
  citySlug: 'jakarta',
  cityPath: 'asia/indonesia/jakarta',
  cityTitle: 'Jakarta',
})

export const metadata = config.METADATA

export default function Page() {
  return <PlaceholderPage config={config} />
}
